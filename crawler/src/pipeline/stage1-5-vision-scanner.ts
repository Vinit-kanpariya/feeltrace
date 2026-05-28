// Stage 1.5: Vision scanner — feeds page screenshot to Groq's multimodal model,
// returns visual UX issues as ScoredIssue[]. Non-blocking: returns [] on any error.
// Source: .planning/phases/07-ai-pipeline-depth/07-RESEARCH.md Pattern 1
import Groq from 'groq-sdk'
import { z } from 'zod/v4'
import type { ScoredIssue } from './types'

// ---------------------------------------------------------------------------
// Module-level static constants — no runtime interpolation
// ---------------------------------------------------------------------------

const VISION_SYSTEM_PROMPT = `You are a visual UX analyst. You receive a full-page screenshot of a website and identify visual, layout, and contrast issues that are NOT detectable through DOM analysis.

Focus ONLY on issues visible in the screenshot:
- Color contrast failures (text on background that looks hard to read)
- Crowded or cluttered layout sections
- Inconsistent visual hierarchy (headings/subheadings not clearly differentiated by size/weight)
- Above-the-fold content failures (key CTA or value proposition not immediately visible)
- Broken or misaligned layout sections
- Missing visual breathing room (padding/spacing problems)

Do NOT repeat issues already detectable via DOM/ARIA (e.g. missing alt attributes, missing form labels).
Do NOT invent issues — only report what is visually apparent in the screenshot.
Cap output at 5 issues maximum.`

// ---------------------------------------------------------------------------
// Groq tool definition — OpenAI-compatible function calling format
// ---------------------------------------------------------------------------

const EMIT_VISUAL_ISSUES_TOOL: Groq.Chat.Completions.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'emit_visual_issues',
    description: 'Emit a list of visual UX issues found in the screenshot.',
    parameters: {
      type: 'object',
      properties: {
        visual_issues: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                description: 'What the visual problem is (1-2 sentences)',
              },
              location: {
                type: 'string',
                description: 'Where on the page (e.g. "top navigation", "hero section", "form area")',
              },
              severity: {
                type: 'number',
                description: '1=Low, 2=Medium, 3=High, 4=Critical',
              },
              visual_category: {
                type: 'string',
                enum: ['contrast', 'layout', 'hierarchy', 'cta-visibility', 'spacing', 'other'],
              },
            },
            required: ['description', 'location', 'severity', 'visual_category'],
          },
        },
      },
      required: ['visual_issues'],
    },
  },
}

// ---------------------------------------------------------------------------
// Zod validation schema — exported for direct unit testing without API calls
// ---------------------------------------------------------------------------

export const VisualIssuesSchema = z.object({
  visual_issues: z.array(z.object({
    description: z.string().min(1).max(300),
    location: z.string().min(1).max(100),
    severity: z.number().int().min(1).max(4),
    visual_category: z.enum(['contrast', 'layout', 'hierarchy', 'cta-visibility', 'spacing', 'other']),
  })).max(5),
})

// ---------------------------------------------------------------------------
// Parse function — exported for direct unit testing
// ---------------------------------------------------------------------------

export function parseVisualIssues(raw: Record<string, unknown>): ScoredIssue[] {
  const parsed = VisualIssuesSchema.parse(raw)
  return parsed.visual_issues.map((issue) => ({
    category: 'perceived-perf' as const,
    signal_source: `visual.${issue.visual_category}`,
    severity: issue.severity as 1 | 2 | 3 | 4,
    raw_evidence: `${issue.description} (location: ${issue.location})`,
    viewport: 'desktop' as const,
  }))
}

// ---------------------------------------------------------------------------
// Stage 1.5 LLM call — Groq vision model with forced function calling
// ---------------------------------------------------------------------------

export async function runVisualScanner(
  client: Groq,
  screenshotBuffer: Buffer,
): Promise<ScoredIssue[]> {
  // PRE-ENCODE SIZE GUARD: 2.5MB pre-encode → ~3.3MB after base64 (+33% overhead)
  // Groq vision API limit is 4MB; 2.5MB check provides a safe margin (T-7-02)
  if (screenshotBuffer.length > 2_500_000) {
    console.warn('[pipeline] Stage 1.5: screenshot buffer exceeds 2.5MB pre-encode limit — skipping vision scan')
    return []
  }

  const base64Image = screenshotBuffer.toString('base64')

  try {
    const response = await client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        { role: 'system', content: VISION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this screenshot for visual UX issues.' },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
      tools: [EMIT_VISUAL_ISSUES_TOOL],
      tool_choice: { type: 'function', function: { name: 'emit_visual_issues' } },
      max_tokens: 1024,
    })

    const toolCall = response.choices[0]?.message?.tool_calls?.[0]
    if (!toolCall || toolCall.type !== 'function') {
      console.warn('[pipeline] Stage 1.5: no tool call returned — treating as 0 visual issues')
      return []
    }

    const raw = JSON.parse(toolCall.function.arguments) as Record<string, unknown>
    return parseVisualIssues(raw)
  } catch (err) {
    console.warn('[pipeline] Stage 1.5 vision scan failed:', err instanceof Error ? err.message : err)
    return [] // non-blocking — job continues without visual issues (T-7-03)
  }
}
