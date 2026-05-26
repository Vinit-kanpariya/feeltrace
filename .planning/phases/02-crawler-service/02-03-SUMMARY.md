---
phase: "02-crawler-service"
plan: "03"
subsystem: "crawler"
tags: ["playwright", "browser-lifecycle", "dual-viewport", "spa-hydration", "ssrf", "dom-extractor", "css-extractor", "tdd"]
dependency_graph:
  requires:
    - phase: "02-01"
      provides: "crawler/ scaffold, types.ts (DOMSignals, CSSSignals, CrawlPass interfaces)"
  provides:
    - "crawler/src/browser.ts — Playwright browser lifecycle, dual viewport crawl, SPA hydration detection, SSRF Layer 2"
    - "crawler/src/extractors/dom.ts — SIG-01 DOM signal extractor (extractDOMSignals, getMaxDepth, computeSemanticScore)"
    - "crawler/src/extractors/css.ts — SIG-02 CSS signal extractor (extractCSSSignals with stopCSSCoverage)"
    - "crawler/src/extractors/dom.test.ts — 11 unit tests for DOM extractor logic (100% pass)"
  affects:
    - "02-04 (browser.ts uses JS/network extractor stubs pending 02-04 implementation)"
    - "02-05 (browser.ts wired to call all four extractors in correct order)"
    - "vitest.config.mts (updated to include crawler/src/**/*.test.ts glob)"
    - "crawler/tsconfig.json (updated to include DOM lib for page.evaluate() type checking)"
tech_stack:
  added: []
  patterns:
    - "SPA hydration: domcontentloaded + waitForFunction checking __NEXT_DATA__, __reactFiber*, __vue_app__, __nuxt — NOT networkidle (D-25)"
    - "SSRF Layer 2: context.route('**', ...) calls isPrivateHost() to block RFC-1918/loopback at browser request level (D-13)"
    - "CDPSession slow-3G throttle: Network.emulateNetworkConditions with { downloadThroughput: 40*1024, uploadThroughput: 20*1024, latency: 400 } (D-27)"
    - "HAR recording: recordHar: { content: 'omit', mode: 'full' } per D-26"
    - "Coverage ordering: CSS/JS coverage starts before goto, stops inside extractors before context.close() (Pitfall 4)"
    - "DOM extractor: pure helpers (getMaxDepth, computeSemanticScore) exported for unit testing"
key_files:
  created:
    - "crawler/src/browser.ts"
    - "crawler/src/extractors/dom.ts"
    - "crawler/src/extractors/css.ts"
    - "crawler/src/extractors/dom.test.ts"
  modified:
    - "vitest.config.mts — added crawler/src/**/*.test.ts glob"
    - "crawler/tsconfig.json — added DOM to lib array"
key_decisions:
  - "isPrivateHost() exported for unit testing — checks 10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x, localhost, ::1"
  - "DOM extractor exports getMaxDepth and computeSemanticScore as named exports for testability (page.evaluate cannot close over external imports)"
  - "JS/network extractors returned as typed stubs ({} as JSSignals, { entries: [] } as NetworkSignals) in 02-03 to allow independent TypeScript verification before 02-04 files exist"
  - "Vitest environment: jsdom for DOM/CSS tests (DOM API required); node for network tests (fs/promises)"
patterns-established:
  - "Dual viewport pattern: mobile (375×812, isMobile:true, slow-3G) then desktop (1440×900, isMobile:false, no throttle)"
  - "crawlWithViewport execution order: startCoverage → goto → hydration → extractDOM → extractCSS → extractJS → context.close() → extractNetwork"
requirements-completed:
  - "CRAWL-02 (SPA hydration via framework marker detection)"
  - "CRAWL-03 (dual viewport crawl returns mobile + desktop CrawlPass)"
  - "SIG-01 (DOM signal extractor)"
  - "SIG-02 (CSS signal extractor)"

duration: "~90min (implemented directly in main conversation after subagent permissions issue)"
completed: "2026-05-22"
---

# Phase 2 Plan 03: Playwright Browser Lifecycle + DOM + CSS Extractors

**Playwright dual viewport crawl with SPA hydration detection, SSRF Layer 2 route interception, slow-3G mobile throttle, and two signal extractors (SIG-01 DOM, SIG-02 CSS) with unit tests**

## Performance

- **Duration:** ~90 min (implemented in main conversation; subagent permissions blocked parallel execution)
- **Completed:** 2026-05-22
- **Tasks:** 3 (browser.ts, dom.ts + tests, css.ts)
- **Files created:** 4
- **Files modified:** 2 (vitest.config.mts, crawler/tsconfig.json)

## Accomplishments

- `browser.ts` exports `runDualViewportCrawl`, `waitForSpaHydration`, `isPrivateHost`
- SPA hydration detection uses `waitForFunction` checking `__NEXT_DATA__`, React fiber keys, `__vue_app__`, `__nuxt`, `document.readyState` — never `networkidle` (D-25)
- SSRF Layer 2: `context.route('**', ...)` calls `isPrivateHost()` on every request hostname; `route.abort('blockedbyclient')` for RFC-1918 / loopback (D-13)
- Mobile pass applies CDPSession slow-3G throttle (D-27 values)
- HAR recorded with `content: 'omit'` (no response bodies stored in HAR file, D-26)
- `extractDOMSignals(page)` returns all DOMSignals fields via `page.evaluate()`
- `extractCSSSignals(page)` calls `stopCSSCoverage()` internally (before context.close — Pitfall 4)
- 11 unit tests passing for DOM extractor logic (getMaxDepth, semanticScore, missingAlt, ariaLabel, formLabel, ctaVisibility)

## Task Commits

| # | Commit | Type | Description |
|---|--------|------|-------------|
| 1 | 8027db2 | feat | browser lifecycle, dual viewport crawl, and all four signal extractors (02-03/02-04 wave) |

## Files Created/Modified

- `crawler/src/browser.ts` — Playwright browser lifecycle: isPrivateHost, waitForSpaHydration, crawlWithViewport, runDualViewportCrawl
- `crawler/src/extractors/dom.ts` — extractDOMSignals, getMaxDepth, computeSemanticScore (all exported)
- `crawler/src/extractors/css.ts` — extractCSSSignals with stopCSSCoverage, computed style analysis, fontDisplay detection
- `crawler/src/extractors/dom.test.ts` — 11 tests: @vitest-environment jsdom
- `vitest.config.mts` — added `'crawler/src/**/*.test.ts'` to include array
- `crawler/tsconfig.json` — added `"DOM"` to lib array (required for page.evaluate() type checking)

## Decisions Made

- **TypeScript DOM lib in crawler tsconfig**: Playwright `page.evaluate()` callbacks need DOM types for TypeScript; adding `"DOM"` to lib is the standard Playwright approach even though the crawler runs in Node.js
- **Stub approach for JS/network in 02-03**: `{} as JSSignals` and `{ entries: [] } as NetworkSignals` stubs allow 02-03 TypeScript to compile independently without 02-04 files existing (parallel wave pattern)
- **Route handler type annotation**: `(route: import('playwright-core').Route) =>` needed to avoid implicit any TypeScript error

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] crawler/node_modules missing**
- **Found during:** TypeScript compilation
- **Issue:** `playwright-core`, `p-queue` not found — node_modules not installed in crawler/
- **Fix:** Ran `sfw npm install` in crawler/ directory
- **Verification:** TypeScript compilation passes

**2. [Rule 1 - Bug] DOM lib missing from tsconfig**
- **Found during:** TypeScript compilation of extractors
- **Issue:** `Cannot find name 'document'`, `window`, `Element`, `CSSFontFaceRule`
- **Fix:** Added `"DOM"` to `"lib"` array in crawler/tsconfig.json

**3. [Rule 1 - Bug] Implicit any on route parameter**
- **Found during:** TypeScript compilation of browser.ts
- **Issue:** `Parameter 'route' implicitly has an 'any' type` in context.route callback
- **Fix:** `(route: import('playwright-core').Route) =>`

## Threat Mitigations Applied

| Threat ID | Status | Mitigation |
|-----------|--------|-----------|
| T-02-08 | Applied | context.route() + isPrivateHost() blocks RFC-1918/loopback at browser request level |
| T-02-09 | Applied | DOM signals are typed numbers/counts; primaryCtaText truncated to 100 chars |
| T-02-10 | Applied | 10-second timeout on waitForFunction; fallback logs and proceeds |
| T-02-11 | Applied | --disable-dev-shm-usage in chromium.launch args |
| T-02-SC | Applied | No new npm installs in this plan |

## Self-Check: PASSED

- [x] `crawler/src/browser.ts` — exports runDualViewportCrawl, waitForSpaHydration, isPrivateHost
- [x] No `networkidle` in browser.ts
- [x] No `--no-sandbox` in browser.ts launch args
- [x] `crawler/src/extractors/dom.ts` — exports extractDOMSignals, getMaxDepth, computeSemanticScore
- [x] `crawler/src/extractors/css.ts` — exports extractCSSSignals, calls stopCSSCoverage()
- [x] `crawler/src/extractors/dom.test.ts` — 11 tests, all PASS
- [x] TypeScript: PASS (0 errors in crawler/src excluding generated/prisma)

## Next Phase Readiness

- 02-04 can implement JS and network extractors independently (same wave)
- 02-05 will wire all four extractors into crawlWithViewport and implement processJob

---
*Phase: 02-crawler-service*
*Completed: 2026-05-22*
