---
phase: 08-multi-page-crawl
plan: "03"
subsystem: crawler
tags: [playwright, browser, link-discovery, crawl, phase8, tdd-green]
dependency_graph:
  requires:
    - phase: 08-01
      provides: CrawlPass.internalLinks?: string[] field in crawler/src/lib/types.ts
    - phase: 08-02
      provides: crawler/src/browser.test.ts with 6 RED tests for extractInternalLinks
  provides:
    - extractInternalLinks exported function in crawler/src/browser.ts
    - crawlWithViewport desktop pass populates CrawlPass.internalLinks
    - crawlWithViewport mobile pass returns internalLinks as []
    - browser.test.ts GREEN (6/6 tests passing)
  affects:
    - crawler/src/processor.ts (Plan 08-05 reads desktop.internalLinks ?? [] to seed multi-page loop)
tech-stack:
  added: []
  patterns:
    - extractInternalLinks: page.evaluate() + Set dedup + origin filtering + try/catch for malformed URLs
    - desktop-only feature pattern: declare var at crawlWithViewport top (= []), assign inside if (viewport === 'desktop') block, return unconditionally
    - link extraction placement: after browserFingerprint capture, before context.close()

key-files:
  created: []
  modified:
    - crawler/src/browser.ts
    - crawler/src/browser.test.ts

key-decisions:
  - "extractInternalLinks placed before crawlWithViewport in file — module-level export accessible without hoisting"
  - "internalLinks declared as [] at top of crawlWithViewport — mobile pass returns [] without any desktop block changes"
  - "extractInternalLinks called after browserFingerprint capture, inside desktop-only if block, BEFORE context.close() — critical ordering: context must be open for page.evaluate() to run"
  - "browser.test.ts mock cast changed from 'as Parameters<typeof extractInternalLinks>[0]' to 'as unknown as Parameters<typeof extractInternalLinks>[0]' — TypeScript 5 is stricter about structural overlap on complex interfaces like playwright Page; double-cast via unknown is the standard pattern"

patterns-established:
  - "Desktop-only crawl data pattern: declare at function top, assign in desktop block, always include in return — ensures mobile callers get typed empty value without conditional handling"
  - "extractInternalLinks origin guard: use new URL(baseUrl).origin then startsWith(origin) — covers both http and https, handles subdomain differences"

requirements-completed: [CRAWL-01]

duration: ~8min
completed: 2026-05-29
---

# Phase 8 Plan 03: extractInternalLinks Implementation Summary

**extractInternalLinks exported from browser.ts with same-origin filter, dedup, fragment/mailto/tel exclusion; crawlWithViewport desktop pass populates CrawlPass.internalLinks; browser.test.ts GREEN (6/6)**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-29T12:08:00Z
- **Completed:** 2026-05-29T12:11:30Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Implemented `extractInternalLinks(page, baseUrl)` exported function with full filtering: same-origin only, fragment exclusion (`#...`), mailto/tel exclusion, relative path resolution via `new URL(href, baseUrl)`, fragment stripping, trailing slash normalization, Set-based deduplication, try/catch for malformed hrefs
- Extended `crawlWithViewport` to declare `internalLinks: string[] = []` at function top, call `extractInternalLinks` inside the desktop-only block (after `browserFingerprint`, before `context.close()`), and include `internalLinks` in the return statement — mobile pass returns `[]`
- All 6 `browser.test.ts` tests GREEN: same-origin filter, fragment exclusion, mailto/tel exclusion, deduplication, relative normalization, malformed href safety

## Task Commits

1. **Task 1: Implement extractInternalLinks and extend crawlWithViewport desktop pass** - `f2d3fba` (feat)

## Files Created/Modified

- `crawler/src/browser.ts` - Added `extractInternalLinks` function (lines 25-50); extended `crawlWithViewport` with `internalLinks` variable + desktop block call + return field
- `crawler/src/browser.test.ts` - Fixed mock cast from direct structural cast to `as unknown as` double-cast (TypeScript 5 compatibility)

## Decisions Made

- Placed `extractInternalLinks` as a module-level export between `isPrivateHost` and `waitForSpaHydration` — function is defined before `crawlWithViewport` which calls it (no hoisting required, satisfies plan requirement "defined BEFORE crawlWithViewport")
- `internalLinks` declared at the top of `crawlWithViewport` (not inside the desktop block) so that the return statement always returns a typed `string[]` regardless of viewport — callers get consistent types without optional chaining
- Used `normalized = absolute.split('#')[0].replace(/\/$/, '') || absolute` for trailing slash normalization — the `|| absolute` fallback handles the edge case where stripping both fragment and trailing slash produces an empty string (e.g., input `'/'` on a root URL)
- Changed test mock cast to `as unknown as Parameters<typeof extractInternalLinks>[0]` — TypeScript 5 requires the double-cast pattern when converting to complex interface types like `Page` that have many members (TS2352: insufficient overlap)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed browser.test.ts mock cast for TypeScript 5 compatibility**
- **Found during:** Task 1 (post-implementation tsc --noEmit check)
- **Issue:** `{ evaluate: vi.fn().mockResolvedValue(hrefs) } as Parameters<typeof extractInternalLinks>[0]` failed with TS2352 ("Conversion of type may be a mistake because neither type sufficiently overlaps with the other. Type is missing 109 more properties from Page.") — TypeScript 5 requires the double-cast pattern for large interface types
- **Fix:** Changed cast to `as unknown as Parameters<typeof extractInternalLinks>[0]` in `browser.test.ts`
- **Files modified:** `crawler/src/browser.test.ts` (line 13)
- **Verification:** `npx tsc --noEmit` in crawler/ no longer reports TS2352 for browser.test.ts; all 6 tests still GREEN
- **Committed in:** `f2d3fba` (Task 1 commit, same commit)

---

**Total deviations:** 1 auto-fixed (1 Rule 1 bug fix)
**Impact on plan:** Fix required for `tsc --noEmit` to pass on browser.test.ts. Tests continue to pass identically. No scope creep.

## Issues Encountered

None — implementation matched plan exactly. The only issue was the test mock cast compatibility (fixed as deviation above).

## Verification Results

1. `npm test -- crawler/src/browser.test.ts` exits 0 with 6/6 tests PASSED — PASS
2. `grep -n "export.*extractInternalLinks" crawler/src/browser.ts` returns line 25 — PASS
3. `crawlWithViewport` return statement includes `internalLinks` field (line 230) — PASS
4. `extractInternalLinks` call (line 213) appears before `context.close()` (line 217) — PASS
5. `extractInternalLinks` function (line 25) is defined before `crawlWithViewport` function (line 92) — PASS
6. `npx tsc --noEmit` in crawler/ has only the expected RED-state error (`site-wide-merger.ts` not yet created — Plan 08-04 will resolve); zero errors introduced by this plan — PASS

## Threat Model Compliance

| Threat | Mitigation Applied |
|--------|-------------------|
| T-08-05: SSRF via discovered URLs | extractInternalLinks returns URLs; existing `isPrivateHost` check in `context.route()` handler automatically applies to all pages crawled via `runDualViewportCrawl` — RFC-1918 URLs blocked at browser network level |
| T-08-06: DoS via 10,000 a[href] tags | extractInternalLinks returns full list; caller in processor.ts (Plan 08-05) slices to MAX_PAGES - 1 |
| T-08-07: Duplicate root URL in links | processor.ts (Plan 08-05) will filter rootUrl from additionalUrls before looping; noted as expected caller responsibility |

## Known Stubs

None — this plan delivers implementation (not UI/data-display code). `CrawlPass.internalLinks` is populated on desktop pass and will be consumed by Plan 08-05 (processor.ts multi-page loop).

## Threat Flags

None — no new network endpoints, auth paths, or schema changes. The `extractInternalLinks` function reads from `page.evaluate()` (browser-controlled DOM) and applies origin-filtering before returning; downstream SSRF risk is mitigated by existing browser-level guards (T-08-05).

## Self-Check: PASSED

- `crawler/src/browser.ts`: FOUND — `extractInternalLinks` at line 25, `internalLinks` in return at line 230
- `crawler/src/browser.test.ts`: FOUND — mock cast fixed at line 13
- Commit `f2d3fba`: FOUND in git log

## Next Phase Readiness

- `extractInternalLinks` exported and ready for Plan 08-05 (processor.ts) to call via `desktop.internalLinks ?? []`
- `CrawlPass.internalLinks` typed as `string[]` in return (non-optional in runtime value, optional in interface — type-safe for downstream consumers)
- Wave 2 blocker resolved: Plans 08-03 and 08-04 complete; Plan 08-05 can proceed in Wave 3

---
*Phase: 08-multi-page-crawl*
*Completed: 2026-05-29*
