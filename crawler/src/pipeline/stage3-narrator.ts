// Stage 3: LLM narration — takes enriched issues and causal edges, calls Gemini for a
// plain-English narrative with distinct perceived vs technical performance sections (AI-03, AI-04).
// Source: .planning/phases/03-ai-pipeline/03-RESEARCH.md Pattern 3
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { EnrichedIssue, CausalEdgeCandidate, NarrativeResult } from './types'

// ---------------------------------------------------------------------------
// Module-level static prompt — 100% static, no runtime interpolation
// ---------------------------------------------------------------------------

const NARRATOR_SYSTEM_PROMPT = `You are a UX experience narrator. You receive a list of enriched UX issues and causal chains identified on a web page, and your job is to write a clear, human-centered narrative for a mixed audience of product managers, UX designers, and developers.

Your output MUST follow this exact structure with these exact section markers on their own lines:

[SUMMARY]
Write 1-2 sentences summarising the overall UX health of the page. Use plain, non-technical language that a product manager can act on.

[PERCEIVED PERFORMANCE]
Write 1-2 paragraphs describing how slow, unresponsive, or frustrating the page FEELS to a user. Focus on the user experience: what do they see, when, how long do they wait, what impression does it create? Do NOT use metric values or technical jargon in this section. Use words like "feels", "appears", "users notice", "the page seems to".

[TECHNICAL PERFORMANCE]
Write 1-2 paragraphs describing the measurable technical root causes. This section is for developers. Include specific metric values (e.g. "TTFB is 2400ms") and technical terms (e.g. "render-blocking scripts", "FOIT", "TTI"). Connect each technical metric to its concrete effect.

[RECOMMENDATIONS]
List 2-4 concrete, actionable recommendations. Each recommendation must be on its own line and start with "- ". Order by impact (highest impact first). Be specific — reference the actual issues found.

Rules:
- The [PERCEIVED PERFORMANCE] and [TECHNICAL PERFORMANCE] sections MUST be distinct. Do not repeat the same content in both.
- Maximum 4 paragraphs total across [SUMMARY], [PERCEIVED PERFORMANCE], and [TECHNICAL PERFORMANCE].
- Write for a non-engineer audience in [SUMMARY] and [PERCEIVED PERFORMANCE].
- Write for a developer audience in [TECHNICAL PERFORMANCE].
- Do not invent issues not present in the input list.`

// ---------------------------------------------------------------------------
// Pure parser function — exported for unit testing without API calls
// ---------------------------------------------------------------------------

/**
 * Splits a structured LLM narrative response on section markers and returns a NarrativeResult.
 * Missing sections return empty string (summary, perceivedPerformance, technicalPerformance)
 * or empty array (recommendations) — never throws.
 */
export function parseNarrativeOutput(text: string): NarrativeResult {
  const MARKERS = [
    '[SUMMARY]',
    '[PERCEIVED PERFORMANCE]',
    '[TECHNICAL PERFORMANCE]',
    '[RECOMMENDATIONS]',
  ] as const

  // Extract text between consecutive markers (or from a marker to end of string)
  function extractSection(marker: string): string {
    const markerIdx = text.indexOf(marker)
    if (markerIdx === -1) return ''

    const contentStart = markerIdx + marker.length

    // Find the next marker that appears after this one
    let nextMarkerIdx = text.length
    for (const m of MARKERS) {
      if (m === marker) continue
      const idx = text.indexOf(m, contentStart)
      if (idx !== -1 && idx < nextMarkerIdx) {
        nextMarkerIdx = idx
      }
    }

    return text.slice(contentStart, nextMarkerIdx).trim()
  }

  // Parse recommendations: split on newlines, keep lines starting with "- " or "* ", strip prefix
  function parseRecommendations(section: string): string[] {
    if (!section) return []
    return section
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('- ') || line.startsWith('* '))
      .map((line) => line.slice(2).trim())
      .filter((line) => line.length > 0)
  }

  const summaryText = extractSection('[SUMMARY]')
  const perceivedText = extractSection('[PERCEIVED PERFORMANCE]')
  const technicalText = extractSection('[TECHNICAL PERFORMANCE]')
  const recommendationsText = extractSection('[RECOMMENDATIONS]')

  return {
    summary: summaryText,
    perceivedPerformance: perceivedText,
    technicalPerformance: technicalText,
    recommendations: parseRecommendations(recommendationsText),
  }
}

// ---------------------------------------------------------------------------
// Stage 3 LLM call — plain text output, no function calling
// ---------------------------------------------------------------------------

/**
 * Calls Gemini to generate a structured plain-English narrative from enriched issues and edges.
 * Returns a NarrativeResult with distinct perceived vs technical performance sections (AI-04).
 */
export async function runStage3Narration(
  client: GoogleGenerativeAI,
  enrichedIssues: EnrichedIssue[],
  edges: CausalEdgeCandidate[],
): Promise<NarrativeResult> {
  console.log(`[pipeline] Stage 3: generating narrative for ${enrichedIssues.length} issues`)

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const userPrompt = `Generate UX narrative:\n\nIssues:\n${JSON.stringify(enrichedIssues, null, 2)}\n\nCausal chains:\n${JSON.stringify(edges, null, 2)}`

  const result = await model.generateContent({
    systemInstruction: NARRATOR_SYSTEM_PROMPT,
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
  })

  const text = result.response.text()
  console.log(`[pipeline] Stage 3: narrative generated (${text.length} chars)`)
  return parseNarrativeOutput(text)
}
