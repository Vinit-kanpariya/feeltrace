// @vitest-environment node
import { describe, it, expect } from 'vitest'
import type { CrawlPass } from '../lib/types'
import { scoreSignals } from './stage1-scorer'

// ---------------------------------------------------------------------------
// Fixture builder — returns a safe CrawlPass with all signals below thresholds.
// Pass overrides to set specific signal values for each test case.
// ---------------------------------------------------------------------------
function makeCrawlPass(
  viewport: 'mobile' | 'desktop',
  overrides: {
    networkSignals?: Partial<CrawlPass['networkSignals']>
    jsSignals?: Partial<CrawlPass['jsSignals']>
    cssSignals?: Partial<CrawlPass['cssSignals']>
    domSignals?: Partial<CrawlPass['domSignals']>
  } = {}
): CrawlPass {
  return {
    viewport,
    domSignals: {
      maxDOMDepth: 5,
      totalElementCount: 100,
      interactiveElementCount: 10,
      ariaLabelledCount: 5,
      ariaRoleCount: 5,
      ariaLandmarkCount: 5,
      missingAltCount: 0,
      semanticScore: {
        h1Count: 1,
        h2Count: 2,
        h3Count: 3,
        navCount: 1,
        mainCount: 1,
        footerCount: 1,
        articleCount: 0,
        hasSkipLink: true,
      },
      formCount: 0,
      formFieldCount: 0,
      formWithoutLabelCount: 0,
      ctaVisibility: {
        buttonCount: 2,
        visibleButtonCount: 2,
        primaryCtaText: 'Submit',
      },
      ...overrides.domSignals,
    },
    cssSignals: {
      totalCSSBytes: 10000,
      unusedCSSBytes: 500,
      unusedCSSPercent: 5,
      animationCount: 0,
      transitionCount: 0,
      willChangeCount: 0,
      paintTriggerPropertyCount: 0,
      fontDisplayStrategies: {
        block: 0,
        swap: 1,
        fallback: 0,
        optional: 0,
        auto: 0,
      },
      ...overrides.cssSignals,
    },
    jsSignals: {
      totalJSBytes: 50000,
      scriptCount: 2,
      renderBlockingCount: 0,
      asyncScriptCount: 2,
      deferredScriptCount: 0,
      moduleScriptCount: 0,
      thirdPartyScriptCount: 0,
      frameworkFingerprint: [],
      unusedJSBytes: 5000,
      unusedJSPercent: 10,
      ...overrides.jsSignals,
    },
    networkSignals: {
      totalRequests: 20,
      totalTransferSize: 200000,
      renderBlockingCount: 0,
      renderBlockingAssets: [],
      cdnCount: 2,
      firstRequestTTFB: 100,
      maxTTFB: 150,
      imageCount: 5,
      oversizedImageCount: 0,
      totalImageBytes: 50000,
      entries: [],
      ...overrides.networkSignals,
    },
  }
}

// ---------------------------------------------------------------------------
// Network signal thresholds (AI-01)
// ---------------------------------------------------------------------------
describe('network signal thresholds', () => {
  it('TTFB = 2400ms (above 2000ms) produces one issue with severity 4', () => {
    const mobile = makeCrawlPass('mobile', { networkSignals: { firstRequestTTFB: 2400 } })
    const desktop = makeCrawlPass('desktop')
    const issues = scoreSignals(mobile, desktop)
    const ttfbIssue = issues.find((i) => i.signal_source.includes('firstRequestTTFB') && i.severity === 4)
    expect(ttfbIssue).toBeDefined()
    expect(ttfbIssue!.severity).toBe(4)
  })

  it('TTFB = 900ms (above 800ms, below 2000ms) produces one issue with severity 3', () => {
    const mobile = makeCrawlPass('mobile', { networkSignals: { firstRequestTTFB: 900 } })
    const desktop = makeCrawlPass('desktop')
    const issues = scoreSignals(mobile, desktop)
    const ttfbIssue = issues.find((i) => i.signal_source.includes('firstRequestTTFB') && i.severity === 3)
    expect(ttfbIssue).toBeDefined()
    expect(ttfbIssue!.severity).toBe(3)
  })

  it('TTFB = 200ms (below all thresholds) produces no TTFB issue', () => {
    const mobile = makeCrawlPass('mobile', { networkSignals: { firstRequestTTFB: 200 } })
    const desktop = makeCrawlPass('desktop', { networkSignals: { firstRequestTTFB: 200 } })
    const issues = scoreSignals(mobile, desktop)
    const ttfbIssue = issues.find((i) => i.signal_source.includes('firstRequestTTFB'))
    expect(ttfbIssue).toBeUndefined()
  })

  it('renderBlockingCount = 6 (above 5) produces one issue with severity 4', () => {
    const mobile = makeCrawlPass('mobile', { networkSignals: { renderBlockingCount: 6 } })
    const desktop = makeCrawlPass('desktop')
    const issues = scoreSignals(mobile, desktop)
    const issue = issues.find(
      (i) => i.signal_source.includes('networkSignals.renderBlockingCount') && i.severity === 4
    )
    expect(issue).toBeDefined()
    expect(issue!.severity).toBe(4)
  })

  it('cdnCount === 0 produces one issue with severity 2', () => {
    const mobile = makeCrawlPass('mobile', { networkSignals: { cdnCount: 0 } })
    const desktop = makeCrawlPass('desktop', { networkSignals: { cdnCount: 0 } })
    const issues = scoreSignals(mobile, desktop)
    const issue = issues.find((i) => i.signal_source.includes('cdnCount'))
    expect(issue).toBeDefined()
    expect(issue!.severity).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// JS signal thresholds (AI-01)
// ---------------------------------------------------------------------------
describe('JS signal thresholds', () => {
  it('totalJSBytes = 600000 on mobile produces one issue with severity 4', () => {
    const mobile = makeCrawlPass('mobile', { jsSignals: { totalJSBytes: 600000 } })
    const desktop = makeCrawlPass('desktop')
    const issues = scoreSignals(mobile, desktop)
    const issue = issues.find(
      (i) => i.signal_source.includes('totalJSBytes') && i.severity === 4
    )
    expect(issue).toBeDefined()
    expect(issue!.severity).toBe(4)
  })

  it('totalJSBytes = 400000 on mobile (above 300000, below 500000) produces severity 3', () => {
    const mobile = makeCrawlPass('mobile', { jsSignals: { totalJSBytes: 400000 } })
    const desktop = makeCrawlPass('desktop')
    const issues = scoreSignals(mobile, desktop)
    const issue = issues.find(
      (i) => i.signal_source.includes('totalJSBytes') && i.severity === 3
    )
    expect(issue).toBeDefined()
  })

  it('totalJSBytes = 100000 on mobile (below all thresholds) produces no totalJSBytes issue', () => {
    const mobile = makeCrawlPass('mobile', { jsSignals: { totalJSBytes: 100000 } })
    const desktop = makeCrawlPass('desktop')
    const issues = scoreSignals(mobile, desktop)
    const issue = issues.find((i) => i.signal_source.includes('totalJSBytes'))
    expect(issue).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// CSS signal thresholds (AI-01)
// ---------------------------------------------------------------------------
describe('CSS signal thresholds', () => {
  it('fontDisplayStrategies.block = 1 produces one issue with severity 3', () => {
    const mobile = makeCrawlPass('mobile', {
      cssSignals: { fontDisplayStrategies: { block: 1, swap: 0, fallback: 0, optional: 0, auto: 0 } },
    })
    const desktop = makeCrawlPass('desktop')
    const issues = scoreSignals(mobile, desktop)
    const issue = issues.find((i) => i.signal_source.includes('fontDisplayStrategies.block'))
    expect(issue).toBeDefined()
    expect(issue!.severity).toBe(3)
  })

  it('paintTriggerPropertyCount = 25 (above 20) produces one issue with severity 3', () => {
    const mobile = makeCrawlPass('mobile', { cssSignals: { paintTriggerPropertyCount: 25 } })
    const desktop = makeCrawlPass('desktop')
    const issues = scoreSignals(mobile, desktop)
    const issue = issues.find((i) => i.signal_source.includes('paintTriggerPropertyCount'))
    expect(issue).toBeDefined()
    expect(issue!.severity).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// DOM signal thresholds (AI-01)
// ---------------------------------------------------------------------------
describe('DOM signal thresholds', () => {
  it('missingAltCount = 15 (above 10) produces one issue with severity 3', () => {
    const mobile = makeCrawlPass('mobile', { domSignals: { missingAltCount: 15 } })
    const desktop = makeCrawlPass('desktop')
    const issues = scoreSignals(mobile, desktop)
    const issue = issues.find((i) => i.signal_source.includes('missingAltCount') && i.severity === 3)
    expect(issue).toBeDefined()
  })

  it('formWithoutLabelCount = 1 (above 0) produces one issue with severity 3', () => {
    const mobile = makeCrawlPass('mobile', { domSignals: { formWithoutLabelCount: 1 } })
    const desktop = makeCrawlPass('desktop')
    const issues = scoreSignals(mobile, desktop)
    const issue = issues.find((i) => i.signal_source.includes('formWithoutLabelCount'))
    expect(issue).toBeDefined()
    expect(issue!.severity).toBe(3)
  })

  it('maxDOMDepth = 40 (above 32) produces one issue with severity 3', () => {
    const mobile = makeCrawlPass('mobile', { domSignals: { maxDOMDepth: 40 } })
    const desktop = makeCrawlPass('desktop')
    const issues = scoreSignals(mobile, desktop)
    const issue = issues.find((i) => i.signal_source.includes('maxDOMDepth') && i.severity === 3)
    expect(issue).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// Deduplication (AI-01)
// ---------------------------------------------------------------------------
describe('deduplication', () => {
  it('mobile TTFB = 2400ms AND desktop TTFB = 2400ms: exactly ONE issue emitted, viewport is "both"', () => {
    const mobile = makeCrawlPass('mobile', { networkSignals: { firstRequestTTFB: 2400 } })
    const desktop = makeCrawlPass('desktop', { networkSignals: { firstRequestTTFB: 2400 } })
    const issues = scoreSignals(mobile, desktop)
    const ttfbCritical = issues.filter(
      (i) => i.signal_source.includes('firstRequestTTFB') && i.severity === 4
    )
    expect(ttfbCritical).toHaveLength(1)
    expect(ttfbCritical[0].viewport).toBe('both')
  })

  it('mobile TTFB = 2400ms (Critical) AND desktop TTFB = 900ms (High): TWO issues emitted', () => {
    const mobile = makeCrawlPass('mobile', { networkSignals: { firstRequestTTFB: 2400 } })
    const desktop = makeCrawlPass('desktop', { networkSignals: { firstRequestTTFB: 900 } })
    const issues = scoreSignals(mobile, desktop)
    const ttfbIssues = issues.filter((i) => i.signal_source.includes('firstRequestTTFB'))
    // Should have a Critical (4) and a High (3) — two different severity levels
    const critical = ttfbIssues.find((i) => i.severity === 4)
    const high = ttfbIssues.find((i) => i.severity === 3)
    expect(critical).toBeDefined()
    expect(high).toBeDefined()
  })

  it('clean pass (all signals below threshold) returns empty array', () => {
    const mobile = makeCrawlPass('mobile')
    const desktop = makeCrawlPass('desktop')
    const issues = scoreSignals(mobile, desktop)
    expect(issues).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Category assignment (AI-04)
// ---------------------------------------------------------------------------
describe('category assignment (AI-04)', () => {
  it('TTFB issue has category "perceived-perf"', () => {
    const mobile = makeCrawlPass('mobile', { networkSignals: { firstRequestTTFB: 2400 } })
    const desktop = makeCrawlPass('desktop')
    const issues = scoreSignals(mobile, desktop)
    const issue = issues.find((i) => i.signal_source.includes('firstRequestTTFB'))
    expect(issue).toBeDefined()
    expect(issue!.category).toBe('perceived-perf')
  })

  it('totalJSBytes issue has category "technical-perf"', () => {
    const mobile = makeCrawlPass('mobile', { jsSignals: { totalJSBytes: 600000 } })
    const desktop = makeCrawlPass('desktop')
    const issues = scoreSignals(mobile, desktop)
    const issue = issues.find((i) => i.signal_source.includes('totalJSBytes'))
    expect(issue).toBeDefined()
    expect(issue!.category).toBe('technical-perf')
  })

  it('missingAltCount issue has category "accessibility"', () => {
    const mobile = makeCrawlPass('mobile', { domSignals: { missingAltCount: 15 } })
    const desktop = makeCrawlPass('desktop')
    const issues = scoreSignals(mobile, desktop)
    const issue = issues.find((i) => i.signal_source.includes('missingAltCount'))
    expect(issue).toBeDefined()
    expect(issue!.category).toBe('accessibility')
  })

  it('fontDisplayStrategies.block issue has category "perceived-perf"', () => {
    const mobile = makeCrawlPass('mobile', {
      cssSignals: { fontDisplayStrategies: { block: 1, swap: 0, fallback: 0, optional: 0, auto: 0 } },
    })
    const desktop = makeCrawlPass('desktop')
    const issues = scoreSignals(mobile, desktop)
    const issue = issues.find((i) => i.signal_source.includes('fontDisplayStrategies.block'))
    expect(issue).toBeDefined()
    expect(issue!.category).toBe('perceived-perf')
  })
})
