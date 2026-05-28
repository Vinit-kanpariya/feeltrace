// Stage 3: LLM narration — calls Groq for a plain-English narrative (AI-03, AI-04).
import Groq from 'groq-sdk'
import type { EnrichedIssue, CausalEdgeCandidate, NarrativeResult } from './types'
import type { PageType } from './page-type-detector'

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

export function parseNarrativeOutput(text: string): NarrativeResult {
  const MARKERS = [
    '[SUMMARY]',
    '[PERCEIVED PERFORMANCE]',
    '[TECHNICAL PERFORMANCE]',
    '[RECOMMENDATIONS]',
  ] as const

  function extractSection(marker: string): string {
    const markerIdx = text.indexOf(marker)
    if (markerIdx === -1) return ''
    const contentStart = markerIdx + marker.length
    let nextMarkerIdx = text.length
    for (const m of MARKERS) {
      if (m === marker) continue
      const idx = text.indexOf(m, contentStart)
      if (idx !== -1 && idx < nextMarkerIdx) nextMarkerIdx = idx
    }
    return text.slice(contentStart, nextMarkerIdx).trim()
  }

  function parseRecommendations(section: string): string[] {
    if (!section) return []
    return section
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('- ') || line.startsWith('* '))
      .map((line) => line.slice(2).trim())
      .filter((line) => line.length > 0)
  }

  return {
    summary: extractSection('[SUMMARY]'),
    perceivedPerformance: extractSection('[PERCEIVED PERFORMANCE]'),
    technicalPerformance: extractSection('[TECHNICAL PERFORMANCE]'),
    recommendations: parseRecommendations(extractSection('[RECOMMENDATIONS]')),
  }
}

export async function runStage3Narration(
  client: Groq,
  enrichedIssues: EnrichedIssue[],
  edges: CausalEdgeCandidate[],
  pageType: PageType,        // AI-03 — detected page type for narrative framing
  benchmarkContext: string,  // AI-04 — CWV benchmark paragraph ('' when no CWV data)
): Promise<NarrativeResult> {
  console.log(`[pipeline] Stage 3: generating narrative for ${enrichedIssues.length} issues`)

  const systemPrompt = NARRATOR_SYSTEM_PROMPT + '\n\n' +
    '[PAGE TYPE AND CONTEXT]\n' +
    (pageType !== 'unknown'
      ? `This is a ${pageType}. Tailor your narrative framing, examples, and recommendations to this specific page type.`
      : '') +
    '\n\n[BENCHMARK COMPARISONS]\n' +
    (benchmarkContext || '(No real-user CWV field data available for this URL — do not include benchmark comparisons.)') +
    '\n\nWhen CWV benchmark context is provided:\n' +
    '- Open the [TECHNICAL PERFORMANCE] section with the benchmark comparison (e.g. "Real user data shows LCP of 3.8s — 1.5× the 2.5s good threshold")\n' +
    '- Connect metric values to business impact relevant to the page type'

  const userPrompt = `Generate UX narrative:\n\nIssues:\n${JSON.stringify(enrichedIssues, null, 2)}\n\nCausal chains:\n${JSON.stringify(edges, null, 2)}`

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 1024,
  })

  const text = response.choices[0]?.message?.content ?? ''
  console.log(`[pipeline] Stage 3: narrative generated (${text.length} chars)`)
  return parseNarrativeOutput(text)
}
