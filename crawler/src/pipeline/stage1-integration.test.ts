/**
 * crawler/src/pipeline/stage1-integration.test.ts
 * Integration test — exercises all three Stage 1 signal scorers together.
 * No network calls, no Prisma, no LLM — pure in-memory.
 *
 * Stage 2 audit note: stage2-reasoner.ts does NOT hard-code any signal_source
 * prefix allowlist. The system prompt uses free-text LLM instructions and the
 * zod Stage2OutputSchema only validates the `mechanism` field (against
 * PERMITTED_MECHANISMS). The `signal_source` field flows through as an
 * arbitrary string — no allowlist blocks cwv.*, lighthouse.*, or axe.* prefixes.
 * No change to stage2-reasoner.ts is needed.
 *
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest'
import { scoreSignals } from './stage1-scorer'
import { scoreExternalSignals, scoreAxeViolations } from './stage1-external-scorer'
import type { CrawlPass, ExternalSignals, AxeViolation } from '../lib/types'

// ---------------------------------------------------------------------------
// Minimal CrawlPass stub — every required field present, all zeroed/empty.
// Using zero values intentionally so scoreSignals emits no threshold issues,
// keeping the integration test focused on external + axe signals.
// ---------------------------------------------------------------------------

function makeMinimalCrawlPass(viewport: 'mobile' | 'desktop'): CrawlPass {
  return {
    viewport,
    domSignals: {
      maxDOMDepth: 0,
      totalElementCount: 0,
      interactiveElementCount: 0,
      ariaLabelledCount: 0,
      ariaRoleCount: 0,
      ariaLandmarkCount: 0,
      missingAltCount: 0,
      semanticScore: {
        h1Count: 0,
        h2Count: 0,
        h3Count: 0,
        navCount: 0,
        mainCount: 0,
        footerCount: 0,
        articleCount: 0,
        hasSkipLink: false,
      },
      formCount: 0,
      formFieldCount: 0,
      formWithoutLabelCount: 0,
      ctaVisibility: {
        buttonCount: 0,
        visibleButtonCount: 0,
        primaryCtaText: null,
      },
    },
    cssSignals: {
      totalCSSBytes: 0,
      unusedCSSBytes: 0,
      unusedCSSPercent: 0,
      animationCount: 0,
      transitionCount: 0,
      willChangeCount: 0,
      paintTriggerPropertyCount: 0,
      fontDisplayStrategies: {
        block: 0,
        swap: 0,
        fallback: 0,
        optional: 0,
        auto: 0,
      },
    },
    jsSignals: {
      totalJSBytes: 0,
      scriptCount: 0,
      renderBlockingCount: 0,
      asyncScriptCount: 0,
      deferredScriptCount: 0,
      moduleScriptCount: 0,
      thirdPartyScriptCount: 0,
      frameworkFingerprint: [],
      unusedJSBytes: 0,
      unusedJSPercent: 0,
    },
    networkSignals: {
      totalRequests: 0,
      totalTransferSize: 0,
      renderBlockingCount: 0,
      renderBlockingAssets: [],
      cdnCount: 1, // non-zero so cdnCount===0 rule does NOT trigger
      firstRequestTTFB: 0,
      maxTTFB: 0,
      imageCount: 0,
      oversizedImageCount: 0,
      totalImageBytes: 0,
      entries: [],
    },
  }
}

// ---------------------------------------------------------------------------
// Mock ExternalSignals — all three CWV metrics above Critical thresholds.
// lcp_ms=5000 (>4000 Critical), cls_raw=30 (>25 Critical), inp_ms=600 (>500 Critical)
// lighthouse: performance=0.4 (Critical <0.5), accessibility=0.75 (High <0.8), seo=0.6 (Medium <0.7)
// ---------------------------------------------------------------------------

const externalSignals: ExternalSignals = {
  cwv: {
    lcp_ms: 5000,
    cls_raw: 30,
    inp_ms: 600,
    origin_fallback: false,
  },
  lighthouse: {
    performance: 0.4,
    accessibility: 0.75,
    seo: 0.6,
    bestPractices: 0.9,
  },
}

// ---------------------------------------------------------------------------
// Mock AxeViolations — one critical, one serious, one moderate
// ---------------------------------------------------------------------------

const axeViolations: AxeViolation[] = [
  {
    id: 'color-contrast',
    impact: 'critical',
    description: 'Elements must have sufficient color contrast',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.9/color-contrast',
    nodes: [{ target: 'button.submit', failureSummary: 'Fix any of the following: contrast ratio 2.1:1, expected 4.5:1' }],
  },
  {
    id: 'aria-required-attr',
    impact: 'serious',
    description: 'Required ARIA attributes must be provided',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.9/aria-required-attr',
    nodes: [{ target: '[role="slider"]', failureSummary: 'Fix any of the following: aria-valuenow attribute does not exist' }],
  },
  {
    id: 'image-alt',
    impact: 'moderate',
    description: 'Images must have alternate text',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.9/image-alt',
    nodes: [{ target: 'img.hero', failureSummary: 'Fix any of the following: Element does not have an alt attribute' }],
  },
]

// ---------------------------------------------------------------------------
// Combined issue array — all three scorers
// ---------------------------------------------------------------------------

const mobile = makeMinimalCrawlPass('mobile')
const desktop = makeMinimalCrawlPass('desktop')

const allIssues = [
  ...scoreSignals(mobile, desktop),
  ...scoreExternalSignals(externalSignals),
  ...scoreAxeViolations(axeViolations),
]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Stage 1 integration — combined scorer', () => {
  it('combined scorer emits cwv signal_source issues from ExternalSignals', () => {
    const cwvIssues = allIssues.filter((i) => i.signal_source.startsWith('cwv.'))
    expect(cwvIssues.length).toBeGreaterThanOrEqual(1)
  })

  it('combined scorer emits lighthouse signal_source issues from ExternalSignals', () => {
    const lighthouseIssues = allIssues.filter((i) => i.signal_source.startsWith('lighthouse.'))
    expect(lighthouseIssues.length).toBeGreaterThanOrEqual(1)
  })

  it('combined scorer emits axe signal_source issues from AxeViolation[]', () => {
    const axeIssues = allIssues.filter((i) => i.signal_source.startsWith('axe.'))
    expect(axeIssues.length).toBeGreaterThanOrEqual(1)
  })

  it('CWV LCP Critical issue has severity 4', () => {
    // lcp_ms=5000 exceeds both the 4000ms Critical threshold and the 2500ms High threshold;
    // highest-severity-wins dedup keeps only severity 4.
    const lcpIssue = allIssues.find((i) => i.signal_source === 'cwv.lcp_ms')
    expect(lcpIssue).toBeDefined()
    expect(lcpIssue!.severity).toBe(4)
  })

  it('axe critical violation maps to severity 4', () => {
    // color-contrast has impact 'critical' → severity 4
    const axeCritical = allIssues.find((i) => i.signal_source === 'axe.color-contrast')
    expect(axeCritical).toBeDefined()
    expect(axeCritical!.severity).toBe(4)
  })

  it('_signals payload is JSON-serialisable', () => {
    // Confirms ExternalSignals is a plain object — no Buffer, no circular refs
    expect(() =>
      JSON.stringify({ cwv: externalSignals.cwv, lighthouse: externalSignals.lighthouse })
    ).not.toThrow()
  })
})
