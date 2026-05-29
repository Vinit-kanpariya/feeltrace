---
phase: 08-multi-page-crawl
plan: "05"
subsystem: crawler
tags: [processor, multi-page, orchestration, atomic-write, phase8]
dependency_graph:
  requires:
    - phase: 08-01
      provides: CrawledPage, CrawledPageIssue, CrawledPageEdge Prisma models; PageAnalysisResult, SiteWideNarrative types
    - phase: 08-03
      provides: extractInternalLinks in browser.ts; desktop.internalLinks populated on CrawlPass
    - phase: 08-04
      provides: runAIPipeline mode='multi' return path; runSiteWideAnalysis in site-wide-merger.ts
  provides:
    - processJob multi-page loop orchestration
    - withTimeout helper (per-page 90s timeout)
    - crawlAndAnalyzePage helper calling runAIPipeline mode='multi'
    - writeCrawlResults with prisma.$transaction (Result + N CrawledPage + N CrawledPageEdge)
  affects:
    - crawler/src/processor.ts (fully rewritten)
tech_stack:
  added: []
  patterns:
    - withTimeout: Promise.race with setTimeout reject — per-page 90s budget
    - crawlAndAnalyzePage: Promise.all for crawl+PSI, then runAIPipeline mode='multi'
    - Per-page isolation: try/catch around each additionalUrl crawl; page failure is non-blocking
    - writeCrawlResults: prisma.$transaction with nested CrawledPage.create including issues; separate CrawledPageEdge.createMany per page
    - issueIdByPosition Map: same pattern as CausalEdge in run-pipeline.ts; bounds-checked edge index lookup
    - normalizedRoot filter: url.split('#')[0].replace(/\/$/, '') before additionalUrls.filter()
key_files:
  created: []
  modified:
    - crawler/src/processor.ts
decisions:
  - "runSiteWideAnalysis called without Groq client arg — actual signature is runSiteWideAnalysis(pageResults) (client created internally via getGroqClient()); plan interface comment was illustrative, not authoritative"
  - "getGroqClient import removed — runSiteWideAnalysis manages its own Groq singleton; no direct client instantiation needed in processor.ts"
  - "TOTAL_CRAWL_TIMEOUT_MS constant declared but not used as outer race — per-page timeouts (90s x MAX_PAGES=5 = 450s max) provide effective budget as documented in plan note"
  - "processor.ts no longer has 'extracting' status transition — multi-page loop goes crawling -> (loop) -> analyzing -> complete; extracting was single-page pipeline step, not applicable here"
metrics:
  duration: "~10 minutes"
  completed: "2026-05-29"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 8 Plan 05: processor.ts Multi-Page Loop and Atomic DB Write Summary

Multi-page crawl orchestration implemented in processor.ts: withTimeout helper, crawlAndAnalyzePage per-page helper calling runAIPipeline with mode='multi', per-page error isolation loop, runSiteWideAnalysis Stage 4 call, and writeCrawlResults with a single atomic prisma.$transaction writing one Result and N CrawledPage records with nested CrawledPageIssue and CrawledPageEdge models.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Rewrite processor.ts with multi-page loop and atomic DB write | f0d04c4 | crawler/src/processor.ts |

## What Was Built

**processor.ts (fully rewritten):**

- `MAX_PAGES = Math.min(parseInt(process.env.MAX_CRAWL_PAGES ?? '5', 10), 10)` — hard cap at 10 regardless of env value (T-08-12 mitigation)
- `PER_PAGE_TIMEOUT_MS = 90_000` — 90 seconds per page
- `TOTAL_CRAWL_TIMEOUT_MS = 480_000` — declared for documentation; per-page timeouts provide the effective budget
- `withTimeout<T>(promise, ms, message)` — module-level non-exported helper; races promise against a setTimeout reject
- `crawlAndAnalyzePage(jobId, pageUrl, pageIndex)` — non-exported async helper; runs `Promise.all([runDualViewportCrawl, fetchPSISignals])`, then calls `runAIPipeline(..., 'multi')`, returns `PageAnalysisResult` with `discoveredLinks: desktop.internalLinks ?? []`
- `writeCrawlResults(jobId, allPageResults, siteWide)` — non-exported async function; single `prisma.$transaction` that:
  1. Creates the `Result` record with site-wide narrative and `cross_page_patterns`
  2. For each `PageAnalysisResult`: creates `CrawledPage` with nested `issues` create, includes `issues` ordered by id asc to get deterministic IDs
  3. For each page's edges: creates `CrawledPageEdge` records via `issueIdByPosition` Map with bounds-checking (throws on out-of-bounds index, rolls back transaction)
- `processJob(jobId, url)` rewrite:
  - Idempotency check preserved verbatim (lines 10-18 pattern)
  - Crawls root URL with `withTimeout(crawlAndAnalyzePage(jobId, url, 0), PER_PAGE_TIMEOUT_MS, ...)`
  - Filters discovered links: `normalizedRoot = url.split('#')[0].replace(/\/$/, '')`, then `filter(u => u !== normalizedRoot).slice(0, MAX_PAGES - 1)`
  - Loops over `additionalUrls` with per-page try/catch — failed pages are logged and skipped
  - Guards `allPageResults.length === 0` — throws "All pages failed" if no pages produced results
  - Calls `runSiteWideAnalysis(allPageResults)` for Stage 4 site-wide narrative
  - Calls `writeCrawlResults(jobId, allPageResults, siteWide)` for atomic DB write
  - Error handler preserved verbatim: `message.slice(0, 500)`, `status: 'failed'`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] runSiteWideAnalysis called without Groq client argument**
- **Found during:** Task 1 (reading site-wide-merger.ts actual signature before writing)
- **Issue:** The plan interface comment stated `runSiteWideAnalysis(client: Groq, pageResults: PageAnalysisResult[])` but the actual implemented signature in 08-04 is `runSiteWideAnalysis(pageResults: PageAnalysisResult[])` — the function creates its own Groq client via `getGroqClient()` internally
- **Fix:** Called `runSiteWideAnalysis(allPageResults)` with single argument; removed `getGroqClient` import from processor.ts (not needed)
- **Files modified:** crawler/src/processor.ts
- **Commit:** f0d04c4

**2. [Rule 1 - Info] Removed 'extracting' status transition from processJob**
- **Found during:** Task 1 (comparing old processor.ts pattern to new multi-page design)
- **Issue:** The old single-page processJob had a `status: 'extracting'` update between crawl and analyze phases. The plan's new flow is crawling -> analyzing -> complete; 'extracting' was a single-page pipeline intermediate state that no longer maps to the multi-page loop structure
- **Fix:** Multi-page loop updates status to 'crawling' (loop), then 'analyzing' (after loop + Stage 4), then 'complete' — consistent with plan spec
- **Files modified:** crawler/src/processor.ts
- **Commit:** f0d04c4

## Verification Results

1. `npx tsc --noEmit` in crawler/ exits 0 — PASS
2. `npm test` — 208/208 tests pass; 1 pre-existing failure in `page.test.tsx` (missing PageAccordionSection from 08-02 RED stubs, unrelated to this plan) — PASS (no regression)
3. `grep -n "MAX_PAGES"` — line 9: `const MAX_PAGES = Math.min(parseInt(process.env.MAX_CRAWL_PAGES ?? '5', 10), 10)` — PASS
4. `grep -n "withTimeout\|crawlAndAnalyzePage\|writeCrawlResults\|runSiteWideAnalysis"` — all present — PASS
5. `processJob` calls `crawlAndAnalyzePage` for root URL, filters discovered links excluding rootUrl, loops over additional URLs with per-page try/catch — PASS
6. `processJob` calls `runSiteWideAnalysis(allPageResults)` after the loop — PASS (line 204)
7. `prisma.$transaction` in `writeCrawlResults` creates `Result` + `CrawledPage[]` + `CrawledPageEdge[]` — PASS

## Threat Model Compliance

| Threat | Mitigation Applied |
|--------|-------------------|
| T-08-11: SSRF via additionalUrls | Existing `isPrivateHost` check in `context.route()` in browser.ts blocks RFC-1918 URLs at network level for every runDualViewportCrawl call — applies automatically to all discovered URLs |
| T-08-12: DoS via MAX_CRAWL_PAGES env | `Math.min(parseInt(...), 10)` — absolute maximum is 10 pages regardless of env value |
| T-08-13: DoS via single slow page | `withTimeout(90s)` per page — timed-out page caught, logged, skipped; remaining pages continue |
| T-08-14: Partial write via $transaction | `prisma.$transaction` is atomic — if any create fails (including edge out-of-bounds), entire write rolls back; job remains in 'analyzing' and outer catch marks it 'failed' |
| T-08-15: Duplicate root URL in additionalUrls | `normalizedRoot` filter applied before slice: `filter(u => u !== normalizedRoot)` |

## Known Stubs

None — processor.ts implements full orchestration logic with real DB writes. No hardcoded empty values, placeholder text, or disconnected data flows.

## Threat Flags

None — no new network endpoints, auth paths, or schema changes. processor.ts orchestrates existing components (browser.ts, run-pipeline.ts, site-wide-merger.ts, prisma) that each have their own threat mitigations.

## Self-Check: PASSED

- crawler/src/processor.ts: FOUND — withTimeout at line 14, crawlAndAnalyzePage at line 24, writeCrawlResults at line 68, processJob at line 140
- Commit f0d04c4: FOUND in git log
- npx tsc --noEmit exits 0: VERIFIED
- 208 tests passing, no regressions: VERIFIED
