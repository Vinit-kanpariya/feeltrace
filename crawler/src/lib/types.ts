// crawler/src/lib/types.ts
// Canonical signal type contracts for all four extractors and the Phase 3 AI pipeline.
// Source: .planning/phases/02-crawler-service/02-CONTEXT.md "Signal Type Contracts"
// All interfaces must be imported from this file — do not redeclare in extractor files.

// SIG-01: DOM signal extractor output
export interface DOMSignals {
  maxDOMDepth: number
  totalElementCount: number
  interactiveElementCount: number
  ariaLabelledCount: number
  ariaRoleCount: number
  ariaLandmarkCount: number
  missingAltCount: number
  semanticScore: {
    h1Count: number
    h2Count: number
    h3Count: number
    navCount: number
    mainCount: number
    footerCount: number
    articleCount: number
    hasSkipLink: boolean
  }
  formCount: number
  formFieldCount: number
  formWithoutLabelCount: number
  ctaVisibility: {
    buttonCount: number
    visibleButtonCount: number
    primaryCtaText: string | null
  }
}

// SIG-02: CSS signal extractor output
export interface CSSSignals {
  totalCSSBytes: number
  unusedCSSBytes: number
  unusedCSSPercent: number
  animationCount: number
  transitionCount: number
  willChangeCount: number
  paintTriggerPropertyCount: number
  fontDisplayStrategies: {
    block: number
    swap: number
    fallback: number
    optional: number
    auto: number
  }
}

// SIG-03: JavaScript signal extractor output
export interface JSSignals {
  totalJSBytes: number
  scriptCount: number
  renderBlockingCount: number
  asyncScriptCount: number
  deferredScriptCount: number
  moduleScriptCount: number
  thirdPartyScriptCount: number
  frameworkFingerprint: string[]
  unusedJSBytes: number
  unusedJSPercent: number
}

// SIG-04: Network/HAR signal extractor output — individual entry shape
export interface HAREntry {
  url: string
  method: string
  status: number
  mimeType: string
  transferSize: number
  timings: {
    dns: number
    connect: number
    ssl: number
    wait: number
    receive: number
    total: number
  }
  isRenderBlocking: boolean
  cdnProvider: string | null
}

// SIG-04: Network/HAR signal extractor aggregate output
export interface NetworkSignals {
  totalRequests: number
  totalTransferSize: number
  renderBlockingCount: number
  renderBlockingAssets: string[]
  cdnCount: number
  firstRequestTTFB: number
  maxTTFB: number
  imageCount: number
  oversizedImageCount: number
  totalImageBytes: number
  entries: HAREntry[]
}

// Aggregate result of a single viewport crawl pass (mobile or desktop)
export interface CrawlPass {
  viewport: 'mobile' | 'desktop'
  domSignals: DOMSignals
  cssSignals: CSSSignals
  jsSignals: JSSignals
  networkSignals: NetworkSignals
}
