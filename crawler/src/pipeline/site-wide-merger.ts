// Stage 4: site-wide merger — cross-page pattern detection (deterministic) + site-wide LLM narrative.
// Source: .planning/phases/08-multi-page-crawl/08-PATTERNS.md
import { getGroqClient } from '../lib/groq-client'
import type { PageAnalysisResult, SiteWideNarrative, CrossPagePattern } from './types'
import { parseNarrativeOutput } from './stage3-narrator'

/**
 * Detects cross-page patterns: signal_sources that appear on >= minPages pages.
 * Pure synchronous function — no LLM, no async.
 *
 * @param pageResults - Array of per-page analysis results
 * @param minPages - Minimum number of pages a signal_source must appear on to be a pattern (default: 3)
 * @returns CrossPagePattern[] sorted by worst_severity descending
 */
export function detectCrossPagePatterns(
  pageResults: PageAnalysisResult[],
  minPages: number = 3,
): CrossPagePattern[] {
  // Build a Map keyed by signal_source tracking urls, maxSeverity, and representative evidence
  const patternMap = new Map<string, { urls: string[]; maxSeverity: number; evidence: string }>()

  for (const page of pageResults) {
    for (const issue of page.enrichedIssues) {
      const key = issue.signal_source
      const existing = patternMap.get(key)
      if (existing) {
        existing.urls.push(page.url)
        if (issue.severity > existing.maxSeverity) {
          existing.maxSeverity = issue.severity
          existing.evidence = issue.raw_evidence
        }
      } else {
        patternMap.set(key, {
          urls: [page.url],
          maxSeverity: issue.severity,
          evidence: issue.raw_evidence,
        })
      }
    }
  }

  // Filter to entries that appear on >= minPages pages, map to CrossPagePattern
  const patterns: CrossPagePattern[] = []
  for (const [signal_source, entry] of patternMap.entries()) {
    if (entry.urls.length >= minPages) {
      patterns.push({
        signal_source,
        page_count: entry.urls.length,
        worst_severity: entry.maxSeverity,
        affected_urls: entry.urls,
        representative_evidence: entry.evidence,
      })
    }
  }

  // Sort by worst_severity descending, then by page_count descending
  patterns.sort((a, b) => {
    if (b.worst_severity !== a.worst_severity) return b.worst_severity - a.worst_severity
    return b.page_count - a.page_count
  })

  return patterns
}

/**
 * Runs Stage 4 site-wide analysis: calls Groq with per-page summaries (top 5 issues only)
 * to stay within 12,000 TPM. Returns per-page narrative directly when pageResults.length === 1.
 *
 * @param pageResults - Array of per-page analysis results
 * @returns SiteWideNarrative with aggregated narrative and cross-page patterns
 */
export async function runSiteWideAnalysis(pageResults: PageAnalysisResult[]): Promise<SiteWideNarrative> {
  // Deterministic cross-page pattern detection (synchronous, no LLM)
  const crossPagePatterns = detectCrossPagePatterns(pageResults)

  // Single-page shortcut: return per-page narrative directly without calling Groq
  if (pageResults.length === 1) {
    return { narrative: pageResults[0].narrative, crossPagePatterns: [] }
  }

  // Build compact per-page summaries (top 5 issues by severity to stay under TPM limit)
  const pageSummaries = pageResults.map((page) => {
    const topIssues = [...page.enrichedIssues]
      .sort((a, b) => b.severity - a.severity)
      .slice(0, 5)
      .map((issue) => `[sev ${issue.severity}] ${issue.signal_source}: ${issue.raw_evidence}`)

    return {
      url: page.url,
      pageType: page.pageType,
      summary: page.narrative.summary,
      topIssues,
    }
  })

  // Build system prompt with cross-page pattern context
  let crossPatternLines = ''
  if (crossPagePatterns.length > 0) {
    crossPatternLines = '\n\nCross-page patterns detected:\n' +
      crossPagePatterns
        .map(p => `- ${p.signal_source} (${p.page_count} pages, max severity ${p.worst_severity}): ${p.representative_evidence}`)
        .join('\n')
  }

  const systemPrompt = `You analyzed ${pageResults.length} pages from the same website.${crossPatternLines}

Produce a site-wide narrative in the following exact format with these exact section markers on their own lines:

[SUMMARY]
Write 1-2 sentences summarising the overall UX health of the site. Open by addressing the most impactful cross-site pattern if any.

[PERCEIVED PERFORMANCE]
Write 1-2 paragraphs describing how the site feels to a user across all analyzed pages. Focus on perceived experience.

[TECHNICAL PERFORMANCE]
Write 1-2 paragraphs describing the measurable technical root causes across pages.

[RECOMMENDATIONS]
List 3-5 prioritized, concrete recommendations. Each on its own line starting with "- ". Order by impact (highest first).`

  const userPrompt = `Analyze ${pageResults.length} pages from the same website:\n${JSON.stringify(pageSummaries, null, 2)}`

  const client = getGroqClient()

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const text = response.choices[0]?.message?.content ?? ''
    const narrative = parseNarrativeOutput(text)
    console.log('[pipeline] Stage 4: site-wide analysis for ' + pageResults.length + ' pages complete')
    return { narrative, crossPagePatterns }
  } catch (err) {
    console.warn('[pipeline] Stage 4: Groq call failed — falling back to root page narrative:', err instanceof Error ? err.message : err)
    return { narrative: pageResults[0].narrative, crossPagePatterns }
  }
}
