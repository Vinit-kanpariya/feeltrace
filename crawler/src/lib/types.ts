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
  // Only populated on desktop pass
  screenshot?: Buffer
  browserFingerprint?: BrowserFingerprint
  // Populated by Plan 06-02 (axe accessibility scanner)
  axeViolations?: AxeViolation[]
}

// Raw browser-context evaluation result — captured before page closes
export interface BrowserFingerprint {
  hasNextData: boolean
  hasVue: boolean
  hasNuxt: boolean
  hasGatsby: boolean
  hasAngular: boolean
  hasReactRoot: boolean
  hasStripe: boolean
  hasFirebase: boolean
  hasSupabase: boolean
  hasClerk: boolean
  hasAuth0: boolean
  hasPaddle: boolean
}

// SIG-05: Axe accessibility violation node (Plan 06-02 fills in scanner; types defined here)
export interface AxeViolationNode {
  target: string
  failureSummary: string
}

// SIG-05: A single axe-core accessibility violation
export interface AxeViolation {
  id: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  description: string
  helpUrl: string
  nodes: AxeViolationNode[]
}

// SIG-06: Core Web Vitals from CrUX field data (PSI API)
export interface CWVMetrics {
  lcp_ms: number | null
  cls_raw: number | null
  inp_ms: number | null
  origin_fallback: boolean
}

// SIG-07: Lighthouse category scores (PSI API)
export interface LighthouseScores {
  performance: number
  accessibility: number
  seo: number
  bestPractices: number
}

// Aggregated external signals fetched from PageSpeed Insights API
export interface ExternalSignals {
  cwv: CWVMetrics | null
  lighthouse: LighthouseScores | null
}

// Resolved tech + architecture profile derived from crawl signals
export interface TechProfile {
  // Frontend stack
  framework: string | null       // "Next.js", "React", "Vue", "WordPress", etc.
  rendering: string              // "SSR" | "SSG" | "SPA" | "MPA" | "unknown"
  cdn: string | null             // "Cloudflare", "Vercel Edge", "Fastly", etc.
  hosting: string | null         // "Vercel", "Netlify", "Cloudflare Pages", etc.
  buildTool: string | null       // "Next.js (Webpack)", "Vite", "Parcel", etc.
  cssFramework: string | null    // "Tailwind CSS", "Bootstrap", "Material UI", etc.
  analytics: string[]            // ["Google Analytics", "Hotjar", ...]
  // Backend + data layer
  database?: string | null       // "Supabase", "Firebase Firestore", "PlanetScale", etc.
  auth?: string | null           // "Auth0", "Clerk", "Firebase Auth", etc.
  payments?: string | null       // "Stripe", "PayPal", "Braintree", etc.
  services?: string[]            // email, maps, search, realtime, media, monitoring, etc.
  // Architecture metrics
  totalJsBundleKb: number        // sum of all JS transfer bytes
  totalPageWeightKb: number      // total transfer size across all requests
  totalRequests: number          // total HTTP request count
  renderBlockingCount: number    // render-blocking scripts/stylesheets count
  thirdPartyScriptCount: number  // scripts loaded from third-party origins
  unusedJsPercent: number        // % of JS bytes unused (V8 coverage)
}
