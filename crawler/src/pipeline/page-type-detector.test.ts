// @vitest-environment node
// crawler/src/pipeline/page-type-detector.test.ts
import { describe, it, expect } from 'vitest'
import { detectPageType } from './page-type-detector'
import type { PageType } from './page-type-detector'
import type { TechProfile, DOMSignals } from '../lib/types'

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

function makeTechProfile(overrides: Partial<TechProfile> = {}): TechProfile {
  return {
    framework: null,
    rendering: 'unknown',
    cdn: null,
    hosting: null,
    buildTool: null,
    cssFramework: null,
    analytics: [],
    database: null,
    auth: null,
    payments: null,
    services: [],
    totalJsBundleKb: 0,
    totalPageWeightKb: 0,
    totalRequests: 0,
    renderBlockingCount: 0,
    thirdPartyScriptCount: 0,
    unusedJsPercent: 0,
    ...overrides,
  }
}

function makeDOMSignals(overrides: {
  interactiveElementCount?: number
  articleCount?: number
  h2Count?: number
  formCount?: number
  buttonCount?: number
} = {}): DOMSignals {
  return {
    maxDOMDepth: 0,
    totalElementCount: 0,
    interactiveElementCount: overrides.interactiveElementCount ?? 0,
    ariaLabelledCount: 0,
    ariaRoleCount: 0,
    ariaLandmarkCount: 0,
    missingAltCount: 0,
    semanticScore: {
      h1Count: 0,
      h2Count: overrides.h2Count ?? 0,
      h3Count: 0,
      navCount: 0,
      mainCount: 0,
      footerCount: 0,
      articleCount: overrides.articleCount ?? 0,
      hasSkipLink: false,
    },
    formCount: overrides.formCount ?? 0,
    formFieldCount: 0,
    formWithoutLabelCount: 0,
    ctaVisibility: {
      buttonCount: overrides.buttonCount ?? 0,
      visibleButtonCount: 0,
      primaryCtaText: null,
    },
  }
}

// ---------------------------------------------------------------------------
// detectPageType tests
// ---------------------------------------------------------------------------

describe('detectPageType', () => {
  it("returns 'e-commerce' when techProfile.payments is 'Stripe'", () => {
    const tech = makeTechProfile({ payments: 'Stripe' })
    const dom = makeDOMSignals()
    const result: PageType = detectPageType(tech, dom)
    expect(result).toBe('e-commerce')
  })

  it("returns 'saas-dashboard' when interactiveElementCount > 20, analytics is [], framework is 'Next.js'", () => {
    const tech = makeTechProfile({ framework: 'Next.js', analytics: [] })
    const dom = makeDOMSignals({ interactiveElementCount: 25 })
    expect(detectPageType(tech, dom)).toBe('saas-dashboard')
  })

  it("returns 'saas-dashboard' even when analytics tools are present (e.g. Mixpanel + Next.js)", () => {
    const tech = makeTechProfile({ framework: 'Next.js', analytics: ['Mixpanel', 'Segment'] })
    const dom = makeDOMSignals({ interactiveElementCount: 30 })
    expect(detectPageType(tech, dom)).toBe('saas-dashboard')
  })

  it("returns 'blog' when semanticScore.articleCount is 3 (>2)", () => {
    const tech = makeTechProfile()
    const dom = makeDOMSignals({ articleCount: 3 })
    expect(detectPageType(tech, dom)).toBe('blog')
  })

  it("returns 'blog' when semanticScore.h2Count is 6 (>5) and interactiveElementCount is 3 (<5)", () => {
    const tech = makeTechProfile()
    const dom = makeDOMSignals({ h2Count: 6, interactiveElementCount: 3 })
    expect(detectPageType(tech, dom)).toBe('blog')
  })

  it("returns 'landing-page' when analytics has 1 item, ctaVisibility.buttonCount > 0, formCount < 2", () => {
    const tech = makeTechProfile({ analytics: ['Google Analytics'] })
    const dom = makeDOMSignals({ buttonCount: 2, formCount: 1 })
    expect(detectPageType(tech, dom)).toBe('landing-page')
  })

  it("returns 'unknown' when no rule matches (payments null, analytics [], interactiveElementCount 5, articleCount 0, h2Count 2, buttonCount 0)", () => {
    const tech = makeTechProfile({ payments: null, analytics: [] })
    const dom = makeDOMSignals({
      interactiveElementCount: 5,
      articleCount: 0,
      h2Count: 2,
      buttonCount: 0,
    })
    expect(detectPageType(tech, dom)).toBe('unknown')
  })
})
