---
phase: 08-multi-page-crawl
plan: "02"
subsystem: test-contracts
tags: [vitest, tdd, red-state, crawl, phase8]
dependency_graph:
  requires: [08-01]
  provides:
    - crawler/src/browser.test.ts (6 RED tests for extractInternalLinks)
    - crawler/src/pipeline/site-wide-merger.test.ts (6 RED tests for detectCrossPagePatterns + runSiteWideAnalysis)
    - src/app/results/[jobId]/page.test.tsx (2 RED tests for PageAccordionSection accordion rendering)
  affects:
    - crawler/src/browser.ts (must implement extractInternalLinks to make browser.test.ts GREEN)
    - crawler/src/pipeline/site-wide-merger.ts (must implement detectCrossPagePatterns + runSiteWideAnalysis)
    - src/components/PageAccordionSection.tsx (must be created to make page.test.tsx GREEN)
tech_stack:
  added: []
  patterns:
    - makeMockPage fixture pattern (vi.fn().mockResolvedValue) — matches stage1-scorer.test.ts convention
    - makePageResult fixture builder typed against PageAnalysisResult interface
    - vi.mock('groq-sdk') pattern copied from stage1-5-vision-scanner.test.ts
    - React Testing Library render + screen pattern for jsdom tests (matches NarrativeSection.test.tsx)
key_files:
  created:
    - crawler/src/browser.test.ts
    - crawler/src/pipeline/site-wide-merger.test.ts
    - src/app/results/[jobId]/page.test.tsx
  modified: []
decisions:
  - "All three test files written in RED state — imports from modules not yet created; this is the intended Nyquist Rule compliance pattern (verify blocks in Plans 08-03, 08-04, 08-06 point to these files)"
  - "page.test.tsx does not use @vitest-environment node directive — jsdom environment is set in root vitest.config.mts for src/ tests, consistent with NarrativeSection.test.tsx"
  - "browser.test.ts uses minimal structural type cast (as Parameters<typeof extractInternalLinks>[0]) to avoid importing playwright-core types before the module exists"
metrics:
  duration: "~5 minutes"
  completed: "2026-05-29"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 3
---

# Phase 8 Plan 02: TDD RED State Test Stubs Summary

Three test files written in RED state defining behavioral contracts for extractInternalLinks (CRAWL-01), detectCrossPagePatterns + runSiteWideAnalysis (CRAWL-02), and the PageAccordionSection accordion renderer (CRAWL-03) — zero implementation files modified.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create crawler/src/browser.test.ts with extractInternalLinks unit tests | 9691e61 | crawler/src/browser.test.ts |
| 2 | Create crawler/src/pipeline/site-wide-merger.test.ts with pattern detection and LLM merge tests | 4c24354 | crawler/src/pipeline/site-wide-merger.test.ts |
| 3 | Create src/app/results/[jobId]/page.test.tsx with accordion rendering stubs | 8c57cb7 | src/app/results/[jobId]/page.test.tsx |

## What Was Built

**browser.test.ts (Task 1):**
- `// @vitest-environment node` header; imports `extractInternalLinks` from `./browser` (RED — function not yet created)
- `makeMockPage(hrefs)` helper: returns `{ evaluate: vi.fn().mockResolvedValue(hrefs) }` cast as `Parameters<typeof extractInternalLinks>[0]`
- 6 test cases in `describe('extractInternalLinks')`:
  - Same-origin filter: `/about`, `https://other.com/page`, `https://example.com/contact` → only same-origin retained
  - Fragment exclusion: `#section`, `#top` → empty array
  - mailto/tel exclusion: `mailto:hi@example.com`, `tel:+1234567890` → empty array
  - Deduplication: `/about`, `/about`, `/about/` → length 1 (trailing slash normalization)
  - Relative path normalization: `./pricing`, `../blog` → resolved using `new URL(href, base).href`
  - Malformed href safety: `'not a url at all'`, `'://bad'`, `null` → no throw, returns array

**site-wide-merger.test.ts (Task 2):**
- `// @vitest-environment node` header; imports `detectCrossPagePatterns` and `runSiteWideAnalysis` from `./site-wide-merger` (RED)
- `makePageResult(url, pageIndex, overrides?)` fixture builder typed against `PageAnalysisResult`
- `vi.mock('groq-sdk')` using `MockGroq` constructor pattern from stage1-5-vision-scanner.test.ts; mock returns minimal `[SUMMARY]/[PERCEIVED PERFORMANCE]/[TECHNICAL PERFORMANCE]/[RECOMMENDATIONS]` formatted string parseable by `parseNarrativeOutput`
- 4 tests in `describe('detectCrossPagePatterns')`:
  - Returns pattern when signal_source appears on >= minPages pages
  - Returns empty array when threshold not met (2 pages, minPages=3)
  - Sorts by worst_severity descending (signalB severity 4 before signalA severity 3)
  - affected_urls has length equal to page count
- 2 tests in `describe('runSiteWideAnalysis')`:
  - Single page shortcut: returns per-page narrative directly, crossPagePatterns is empty array
  - Multi-page: result has `narrative` and `crossPagePatterns` fields

**page.test.tsx (Task 3):**
- Comment block header (no `@vitest-environment node` — jsdom is set at root vitest config for src/)
- Imports `PageAccordionSection` from `@/components/PageAccordionSection` (RED — component not yet created until Plan 08-06)
- `fixturePage` fixture with all expected PageAccordionSectionProps fields: id, url, page_index, narrative, screenshot_url, issues[], edges[]
- 2 tests in `describe('PageAccordionSection')`:
  - `crawledPages.length > 0`: renders accordion with page URL visible (`screen.getByText('https://example.com/about')`)
  - `crawledPages.length === 0`: wrapper with empty array renders no `[data-testid="accordion"]` element (backward compat guard)

## Deviations from Plan

None — plan executed exactly as written. All three test files created in RED state with correct failure modes (import errors, not parse errors).

## Verification Results

1. `crawler/src/browser.test.ts` exists with 6 `it()` blocks in `describe('extractInternalLinks')` — PASS
2. `crawler/src/pipeline/site-wide-merger.test.ts` exists with `describe('detectCrossPagePatterns')` (4 tests) and `describe('runSiteWideAnalysis')` (2 tests) — PASS
3. `src/app/results/[jobId]/page.test.tsx` exists with `describe('PageAccordionSection')` containing 2 test cases — PASS
4. All test files syntactically valid TypeScript — PASS (failures are import errors only)
5. All three in RED state:
   - browser.test.ts: `6 failed` — `Cannot find module './browser'` export for extractInternalLinks — PASS (RED)
   - site-wide-merger.test.ts: `1 failed (no tests)` — `Cannot find module './site-wide-merger'` — PASS (RED)
   - page.test.tsx: `1 failed (no tests)` — `Failed to resolve import "@/components/PageAccordionSection"` — PASS (RED)

## Known Stubs

None — this plan delivers test contract files only; no implementation or data-wiring.

## Threat Flags

None — test files only; no network endpoints, auth paths, file access patterns, or schema changes introduced.

## Self-Check: PASSED

- crawler/src/browser.test.ts: FOUND
- crawler/src/pipeline/site-wide-merger.test.ts: FOUND
- src/app/results/[jobId]/page.test.tsx: FOUND
- Commits 9691e61, 4c24354, 8c57cb7: confirmed in git log
