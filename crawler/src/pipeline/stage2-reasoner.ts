// Stage 2: LLM reasoning — takes scored issues, calls Groq with forced function calling,
// returns per-issue technical descriptions and causality edge candidates.
import Groq from 'groq-sdk'
import { z } from 'zod/v4'
import type { ScoredIssue, EnrichedIssue, CausalEdgeCandidate } from './types'
import { PERMITTED_MECHANISMS } from './types'

// ---------------------------------------------------------------------------
// Module-level static constants — no runtime interpolation
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

RULES FOR fix_suggestion:
- Write a specific, imperative action: "Add loading=lazy to all <img> elements below the fold"
- NOT advisory: never write "Consider...", "You might want to...", "You could...", "Try to...", "It is recommended..."
- Reference the specific DOM element, CSS property, or metric involved
- If the fix is a code change, name the specific attribute, property, or technique

RULES FOR severity_justification:
- Estimate concrete user impact: bounce rate, task completion, conversion
- Use evidence-based framing: "Pages with LCP > 4s see 24% higher bounce rate (Google CrUX research)"
- Connect the metric to a user action: "Users waiting 3+ seconds before seeing content are 3x more likely to abandon"
- Do not just restate the threshold — explain the felt consequence

${CAUSALITY_MECHANISM_RULES}`

// ---------------------------------------------------------------------------
// Groq tool definition — OpenAI-compatible function calling format
// ---------------------------------------------------------------------------

const EMIT_ANALYSIS_TOOL: Groq.Chat.Completions.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'emit_analysis',
    description: 'Emit structured analysis: per-issue explanations and causality edges.',
    parameters: {
      type: 'object',
      properties: {
        enriched_issues: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              index: { type: 'number', description: 'Zero-based index into the input scored_issues array' },
              technical_description: { type: 'string', description: 'Plain-English explanation (1-3 sentences)' },
              fix_suggestion: { type: 'string', description: 'Specific implementation action to fix this issue (e.g. "Add loading=lazy to all below-fold <img> elements", NOT "Consider optimizing images")' },
              severity_justification: { type: 'string', description: 'Estimated user impact in business terms (e.g. "Users on mobile connections will see a blank screen for 3+ seconds during LCP, increasing bounce rate by an estimated 20-30%")' },
            },
            required: ['index', 'technical_description', 'fix_suggestion', 'severity_justification'],
          },
        },
        causal_edges: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              from_index: { type: 'number' },
              to_index: { type: 'number' },
              mechanism: { type: 'string', description: 'Must be one of the 13 permitted mechanism strings' },
              relationship: { type: 'string' },
              confidence: { type: 'string', description: 'high | medium | low' },
              explanation: { type: 'string', description: 'One sentence explaining why this edge exists' },
            },
            required: ['from_index', 'to_index', 'mechanism', 'relationship', 'confidence', 'explanation'],
          },
        },
      },
      required: ['enriched_issues', 'causal_edges'],
    },
  },
}

// ---------------------------------------------------------------------------
// Zod validation schema — exported for direct unit testing without API calls
// ---------------------------------------------------------------------------

export const Stage2OutputSchema = z.object({
  enriched_issues: z.array(z.object({
    index: z.number().int().min(0),
    technical_description: z.string().min(1).max(500),
    fix_suggestion: z.string().min(1).max(300).refine(
      (v) => !['Consider ', 'You might', 'You could', 'Try to', 'It is recommended'].some((p) => v.startsWith(p)),
      { message: 'fix_suggestion must use imperative framing, not advisory language' },
    ),
    severity_justification: z.string().min(1).max(300),
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

  // Build reverse map: scoredIssue index → position in enrichedIssues / result.issues
  // This is required because causal edge indices reference scoredIssues positions,
  // but result.issues is ordered by enrichedIssues (a filtered subset).
  const scoredToEnrichedPos = new Map<number, number>()
  validEnriched.forEach((item, pos) => scoredToEnrichedPos.set(item.index, pos))

  // Merge ScoredIssue fields into EnrichedIssue using index lookup
  const enrichedIssues: EnrichedIssue[] = validEnriched.map((item) => ({
    ...scoredIssues[item.index],
    technical_description: item.technical_description,
    fix_suggestion: item.fix_suggestion,
    severity_justification: item.severity_justification,
  }))

  // Filter: discard self-edges AND edges referencing scored issues that were not enriched
  const validEdges = parsed.causal_edges.filter(
    (edge) =>
      edge.from_index !== edge.to_index &&
      scoredToEnrichedPos.has(edge.from_index) &&
      scoredToEnrichedPos.has(edge.to_index),
  )

  // Remap from_index/to_index from scoredIssue space → enrichedIssue/result.issues position
  const edges: CausalEdgeCandidate[] = validEdges.map((edge) => ({
    fromIndex: scoredToEnrichedPos.get(edge.from_index)!,
    toIndex: scoredToEnrichedPos.get(edge.to_index)!,
    mechanism: edge.mechanism,
    relationship: edge.relationship,
    confidence: edge.confidence,
    explanation: edge.explanation,
  }))

  return { enrichedIssues, edges }
}

// ---------------------------------------------------------------------------
// Stage 2 LLM call — Groq forced function calling
// ---------------------------------------------------------------------------

export async function runStage2Reasoning(
  client: Groq,
  scoredIssues: ScoredIssue[],
): Promise<{ enrichedIssues: EnrichedIssue[]; edges: CausalEdgeCandidate[] }> {
  console.log(`[pipeline] Stage 2: analyzing ${scoredIssues.length} scored issues`)

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Analyze these scored UX issues:\n\n${JSON.stringify(scoredIssues, null, 2)}` },
    ],
    tools: [EMIT_ANALYSIS_TOOL],
    tool_choice: { type: 'function', function: { name: 'emit_analysis' } },
    max_tokens: 4096,
  })

  const toolCall = response.choices[0]?.message?.tool_calls?.[0]
  if (!toolCall || toolCall.type !== 'function') {
    throw new Error('Stage 2: expected tool call not returned by model')
  }

  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(toolCall.function.arguments) as Record<string, unknown>
  } catch (err) {
    throw new Error(`Stage 2: failed to parse tool call arguments — ${err instanceof Error ? err.message : err}`)
  }
  console.log(`[pipeline] Stage 2: received function call, parsing output`)
  return parseStage2Output(raw, scoredIssues)
}
