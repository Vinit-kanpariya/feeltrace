// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { detectCrossPagePatterns, runSiteWideAnalysis } from './site-wide-merger'
import type { PageAnalysisResult } from './types'

// ---------------------------------------------------------------------------
// Groq mock — mirrors the vi.mock pattern from stage1-5-vision-scanner.test.ts.
// Intercepts groq-sdk so runSiteWideAnalysis does not attempt a real network call.
// The mock returns a minimal narrative string that parseNarrativeOutput can parse.
// ---------------------------------------------------------------------------
const MOCK_NARRATIVE_CONTENT = `
[SUMMARY]
The site has performance issues affecting multiple pages.

[PERCEIVED PERFORMANCE]
Users experience slow load times across pages.

[TECHNICAL PERFORMANCE]
Render-blocking scripts detected on multiple pages.

[RECOMMENDATIONS]
- Defer non-critical JavaScript
- Enable CDN caching
`

vi.mock('groq-sdk', () => {
  const mockCreate = vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: MOCK_NARRATIVE_CONTENT,
        },
      },
    ],
  })
  const MockGroq = vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }))
  return { default: MockGroq }
})

// ---------------------------------------------------------------------------
// Fixture builder — minimal PageAnalysisResult with optional enrichedIssues override.
// ---------------------------------------------------------------------------
function makePageResult(
  url: string,
  pageIndex: number,
  overrides?: { enrichedIssues?: PageAnalysisResult['enrichedIssues'] }
): PageAnalysisResult {
  return {
    url,
    pageIndex,
    enrichedIssues: overrides?.enrichedIssues ?? [],
    edges: [],
    narrative: {
      summary: `Summary for ${url}`,
      perceivedPerformance: '',
      technicalPerformance: '',
      recommendations: [],
    },
    screenshotUrl: null,
    techProfile: {} as any,
    pageType: 'unknown' as any,
    discoveredLinks: [],
  }
}

// ---------------------------------------------------------------------------
// detectCrossPagePatterns tests (CRAWL-02)
// ---------------------------------------------------------------------------
describe('detectCrossPagePatterns', () => {
  it('CRAWL-02: returns patterns for signal_sources on >= minPages pages', () => {
    const sharedIssue = {
      category: 'technical-perf' as const,
      signal_source: 'networkSignals.renderBlockingCount',
      severity: 3 as const,
      raw_evidence: 'Blocking scripts found',
      viewport: 'both' as const,
      technical_description: 'Render-blocking JS',
      fix_suggestion: 'Defer scripts',
      severity_justification: 'High impact',
    }
    const pages = [
      makePageResult('https://example.com/', 0, { enrichedIssues: [sharedIssue] }),
      makePageResult('https://example.com/about', 1, { enrichedIssues: [sharedIssue] }),
      makePageResult('https://example.com/contact', 2, { enrichedIssues: [sharedIssue] }),
    ]
    const result = detectCrossPagePatterns(pages, 3)
    expect(result).toHaveLength(1)
    expect(result[0].signal_source).toBe('networkSignals.renderBlockingCount')
  })

  it('CRAWL-02: returns empty array when threshold not met', () => {
    const sharedIssue = {
      category: 'technical-perf' as const,
      signal_source: 'networkSignals.renderBlockingCount',
      severity: 3 as const,
      raw_evidence: 'Blocking scripts found',
      viewport: 'both' as const,
      technical_description: 'Render-blocking JS',
      fix_suggestion: 'Defer scripts',
      severity_justification: 'High impact',
    }
    const pages = [
      makePageResult('https://example.com/', 0, { enrichedIssues: [sharedIssue] }),
      makePageResult('https://example.com/about', 1, { enrichedIssues: [sharedIssue] }),
    ]
    const result = detectCrossPagePatterns(pages, 3)
    expect(result).toEqual([])
  })

  it('CRAWL-02: sorts by worst_severity descending', () => {
    const issueA = {
      category: 'technical-perf' as const,
      signal_source: 'signalA',
      severity: 3 as const,
      raw_evidence: 'Evidence A',
      viewport: 'both' as const,
      technical_description: 'Description A',
      fix_suggestion: 'Fix A',
      severity_justification: 'Justification A',
    }
    const issueB = {
      category: 'technical-perf' as const,
      signal_source: 'signalB',
      severity: 4 as const,
      raw_evidence: 'Evidence B',
      viewport: 'both' as const,
      technical_description: 'Description B',
      fix_suggestion: 'Fix B',
      severity_justification: 'Justification B',
    }
    const pages = [
      makePageResult('https://example.com/p1', 0, { enrichedIssues: [issueA, issueB] }),
      makePageResult('https://example.com/p2', 1, { enrichedIssues: [issueA, issueB] }),
      makePageResult('https://example.com/p3', 2, { enrichedIssues: [issueA, issueB] }),
    ]
    const result = detectCrossPagePatterns(pages, 3)
    // signalB has worst_severity 4; signalA has worst_severity 3 → B should come first
    expect(result[0].signal_source).toBe('signalB')
  })

  it('CRAWL-02: includes affected_urls in result', () => {
    const sharedIssue = {
      category: 'technical-perf' as const,
      signal_source: 'networkSignals.renderBlockingCount',
      severity: 3 as const,
      raw_evidence: 'Blocking scripts found',
      viewport: 'both' as const,
      technical_description: 'Render-blocking JS',
      fix_suggestion: 'Defer scripts',
      severity_justification: 'High impact',
    }
    const pages = [
      makePageResult('https://example.com/', 0, { enrichedIssues: [sharedIssue] }),
      makePageResult('https://example.com/about', 1, { enrichedIssues: [sharedIssue] }),
      makePageResult('https://example.com/contact', 2, { enrichedIssues: [sharedIssue] }),
    ]
    const result = detectCrossPagePatterns(pages, 3)
    expect(result[0].affected_urls).toHaveLength(3)
  })
})

// ---------------------------------------------------------------------------
// runSiteWideAnalysis tests (CRAWL-02)
// ---------------------------------------------------------------------------
describe('runSiteWideAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns per-page narrative directly when pageResults.length === 1', async () => {
    const singlePage = makePageResult('https://example.com/', 0)
    const result = await runSiteWideAnalysis([singlePage])
    expect(result.narrative).toBe(singlePage.narrative)
    expect(result.crossPagePatterns).toEqual([])
  })

  it('returns SiteWideNarrative with crossPagePatterns array', async () => {
    const page1 = makePageResult('https://example.com/', 0)
    const page2 = makePageResult('https://example.com/about', 1)
    const result = await runSiteWideAnalysis([page1, page2])
    expect(result).toHaveProperty('narrative')
    expect(result).toHaveProperty('crossPagePatterns')
    expect(Array.isArray(result.crossPagePatterns)).toBe(true)
  })
})
