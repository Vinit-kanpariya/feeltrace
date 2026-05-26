// Stage 2: LLM reasoning — takes scored issues, calls Gemini with forced function calling,
// returns per-issue technical descriptions and causality edge candidates.
// Source: .planning/phases/03-ai-pipeline/03-RESEARCH.md Pattern 2 + Pattern 4
import { GoogleGenerativeAI, SchemaType, FunctionCallingMode, type Tool } from '@google/generative-ai'
import { z } from 'zod/v4'
import type { ScoredIssue, EnrichedIssue, CausalEdgeCandidate } from './types'
import { PERMITTED_MECHANISMS } from './types'

// ---------------------------------------------------------------------------
// Module-level static constants — no runtime interpolation (prompt cache safety)
// ---------------------------------------------------------------------------

const CAUSALITY_MECHANISM_RULES = `
PERMITTED CAUSALITY MECHANISMS (use exactly these strings — no others allowed):
- render-blocking-delays-fcp: A render-blocking CSS or script resource directly delays First Contentful Paint by blocking the browser render pipeline.
- ttfb-delays-fcp: A high Time To First Byte delays when the browser can begin parsing and rendering HTML, pushing out FCP.
- large-js-bundle-delays-tti: A large JavaScript bundle requires significant parse/compile time, delaying Time To Interactive.
- render-blocking-js-delays-tti: Synchronous JavaScript in the document head blocks HTML parsing, delaying TTI.
- unused-js-inflates-bundle: Unused JavaScript increases bundle download and parse time without delivering user value.
- font-block-causes-foit: CSS font-display:block causes Flash Of Invisible Text (FOIT) — text is invisible until the font loads.
- missing-cdn-increases-ttfb: Serving assets from origin without a CDN increases latency for geographically distributed users.
- oversized-images-increase-lcp: Images larger than their display size waste bandwidth and delay Largest Contentful Paint.
- deep-dom-increases-layout-cost: A deeply nested DOM tree increases layout recalculation time and memory usage.
- paint-trigger-properties-cause-jank: CSS properties that trigger paint or composite layers (e.g. box-shadow, filter) increase frame render time.
- unlabelled-forms-block-conversion: Form fields without accessible labels reduce form completion rates and fail accessibility standards.
- excessive-css-inflates-render-blocking: Large CSS files that are render-blocking delay FCP and contain significant unused rules.
- third-party-scripts-contend-bandwidth: Third-party scripts compete for bandwidth with first-party resources and may block the main thread.
`.trim()

const SYSTEM_PROMPT = `You are a UX performance analysis engine. You receive a list of scored UX issues detected on a web page and your job is to:

1. For each issue, provide a technical_description: a 1-3 sentence plain-English explanation of WHY the issue matters, distinguishing perceived performance (what the user feels) from technical performance (what the metrics say).

2. Identify causal relationships between issues — where one issue directly causes or amplifies another. Only emit causal edges that are grounded in the scored issue list. DO NOT invent issues that are not in the input list.

3. Use ONLY the permitted mechanism strings listed below. Any edge you emit must reference one of these exact strings.

4. Assign confidence levels: "high" for well-established causal chains, "medium" for likely but less certain relationships, "low" for speculative connections.

5. Cap causal edges at 5 total. Prefer high-confidence edges.

${CAUSALITY_MECHANISM_RULES}`

// ---------------------------------------------------------------------------
// Gemini function tool definition
// ---------------------------------------------------------------------------

const EMIT_ANALYSIS_TOOL: Tool = {
  functionDeclarations: [{
    name: 'emit_analysis',
    description: 'Emit structured analysis: per-issue explanations and causality edges.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        enriched_issues: {
          type: SchemaType.ARRAY as SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              index: { type: SchemaType.NUMBER, description: 'Zero-based index into the input scored_issues array' },
              technical_description: { type: SchemaType.STRING, description: 'Plain-English explanation (1-3 sentences)' },
            },
            required: ['index', 'technical_description'],
          },
        },
        causal_edges: {
          type: SchemaType.ARRAY as SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              from_index: { type: SchemaType.NUMBER },
              to_index: { type: SchemaType.NUMBER },
              mechanism: { type: SchemaType.STRING, description: 'Must be one of the 13 permitted mechanism strings' },
              relationship: { type: SchemaType.STRING },
              confidence: { type: SchemaType.STRING, description: 'high | medium | low' },
              explanation: { type: SchemaType.STRING, description: 'One sentence explaining why this edge exists' },
            },
            required: ['from_index', 'to_index', 'mechanism', 'relationship', 'confidence', 'explanation'],
          },
        },
      },
      required: ['enriched_issues', 'causal_edges'],
    },
  }],
}

// ---------------------------------------------------------------------------
// Zod validation schema — exported for direct unit testing without API calls
// ---------------------------------------------------------------------------

export const Stage2OutputSchema = z.object({
  enriched_issues: z.array(z.object({
    index: z.number().int().min(0),
    technical_description: z.string().min(1).max(500),
  })),
  causal_edges: z.array(z.object({
    from_index: z.number().int().min(0),
    to_index: z.number().int().min(0),
    mechanism: z.string().refine(
      (v) => (PERMITTED_MECHANISMS as readonly string[]).includes(v),
      { message: `mechanism must be one of the ${PERMITTED_MECHANISMS.length} permitted strings` },
    ),
    relationship: z.string().min(1).max(50),
    confidence: z.enum(['high', 'medium', 'low']),
    explanation: z.string().max(200).default(''),
  })).max(5),
})

// ---------------------------------------------------------------------------
// Parse and filter function — exported for direct unit testing
// ---------------------------------------------------------------------------

export function parseStage2Output(
  raw: Record<string, unknown>,
  scoredIssues: ScoredIssue[],
): { enrichedIssues: EnrichedIssue[]; edges: CausalEdgeCandidate[] } {
  const parsed = Stage2OutputSchema.parse(raw)

  // Filter: discard enriched_issues with index out of bounds [0, scoredIssues.length)
  const validEnriched = parsed.enriched_issues.filter(
    (item) => item.index >= 0 && item.index < scoredIssues.length,
  )

  // Merge ScoredIssue fields into EnrichedIssue using index lookup
  const enrichedIssues: EnrichedIssue[] = validEnriched.map((item) => ({
    ...scoredIssues[item.index],
    technical_description: item.technical_description,
  }))

  // Filter: discard causal edges where from_index === to_index (self-edges)
  const validEdges = parsed.causal_edges.filter(
    (edge) => edge.from_index !== edge.to_index,
  )

  const edges: CausalEdgeCandidate[] = validEdges.map((edge) => ({
    fromIndex: edge.from_index,
    toIndex: edge.to_index,
    mechanism: edge.mechanism,
    relationship: edge.relationship,
    confidence: edge.confidence,
    explanation: edge.explanation,
  }))

  return { enrichedIssues, edges }
}

// ---------------------------------------------------------------------------
// Stage 2 LLM call — uses Gemini forced function calling
// ---------------------------------------------------------------------------

export async function runStage2Reasoning(
  client: GoogleGenerativeAI,
  scoredIssues: ScoredIssue[],
): Promise<{ enrichedIssues: EnrichedIssue[]; edges: CausalEdgeCandidate[] }> {
  console.log(`[pipeline] Stage 2: analyzing ${scoredIssues.length} scored issues`)

  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    tools: [EMIT_ANALYSIS_TOOL],
    toolConfig: {
      functionCallingConfig: {
        mode: FunctionCallingMode.ANY,
        allowedFunctionNames: ['emit_analysis'],
      },
    },
  })

  const result = await model.generateContent({
    systemInstruction: SYSTEM_PROMPT,
    contents: [{
      role: 'user',
      parts: [{ text: `Analyze these scored UX issues:\n\n${JSON.stringify(scoredIssues, null, 2)}` }],
    }],
  })

  const functionCall = result.response.functionCalls()?.[0]
  if (!functionCall) {
    throw new Error('Stage 2: expected function call not returned by model')
  }

  const raw = functionCall.args as Record<string, unknown>
  console.log(`[pipeline] Stage 2: received function call, parsing output`)
  return parseStage2Output(raw, scoredIssues)
}
