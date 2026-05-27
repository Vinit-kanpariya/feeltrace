---
phase: "06"
plan: "01"
subsystem: "crawler"
tags: [psi, cwv, lighthouse, external-signals, stage1-scorer]
dependency_graph:
  requires: []
  provides: [ExternalSignals, fetchPSISignals, scoreExternalSignals, scoreAxeViolations-stub]
  affects: [crawler/src/lib/types.ts, crawler/src/processor.ts, crawler/src/pipeline/run-pipeline.ts]
tech_stack:
  added: [vitest (crawler devDep), AbortController timeout pattern]
  patterns: [highest-severity-wins dedup, two-step Promise.race destructuring, soft-required env var]
key_files:
  created:
    - crawler/src/lib/psi.ts
    - crawler/src/pipeline/stage1-external-scorer.ts
    - crawler/src/lib/psi.test.ts
    - crawler/src/pipeline/stage1-external-scorer.test.ts
    - crawler/vitest.config.ts
  modified:
    - crawler/src/lib/types.ts
    - crawler/src/processor.ts
    - crawler/src/pipeline/run-pipeline.ts
    - crawler/src/index.ts
    - crawler/package.json
decisions:
  - "fetchPSISignals uses AbortController + real setTimeout (not fake timers) — timeout test uses abort-signal listener pattern to avoid 5s test hang"
  - "vitest.config.ts added to crawler/ to override root vitest.config.mts which references missing test-setup.ts"
  - "scoreAxeViolations exported as stub (returns []) — Plan 06-02 fills in body without changing import path"
  - "Two-step Promise.race destructuring — TypeScript cannot infer nested tuple type through race overload in one step"
metrics:
  duration: "~25 minutes"
  completed: "2026-05-27"
  tasks: 8
  files: 10
---

# Phase 06 Plan 01: PSI Integration (CWV + Lighthouse) Summary

PSI/CWV/Lighthouse signals fetched in parallel with Playwright crawl via PageSpeed Insights API, scored through new stage1-external-scorer.ts, and stored in Result.tech_stack._signals JSON column.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Extend types.ts — 5 new interfaces + CrawlPass.axeViolations | ebb0df9 | crawler/src/lib/types.ts |
| 2 | PSI client, startup warning, external scorer | 94ac9e5 | psi.ts, index.ts, stage1-external-scorer.ts |
| 3 | Processor + pipeline wiring (parallel fetch, 5th param) | 9bea1bc | processor.ts, run-pipeline.ts |
| 4 | Unit tests + vitest setup | 709f30e | psi.test.ts, stage1-external-scorer.test.ts, vitest.config.ts, package.json |

## Test Results

- **97 tests pass** (9 test files total — includes pre-existing tests)
- **6 psi.test.ts tests** — null on missing key, AbortSignal timeout, CWV parse, origin fallback, best-practices bracket notation, empty metrics
- **14 stage1-external-scorer.test.ts tests** — all CWV/Lighthouse threshold rules, highest-severity-wins dedup, null skipping
- **typecheck: clean** (tsc --noEmit exits 0)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing vitest configuration in crawler directory**
- **Found during:** Wave 3 (unit tests)
- **Issue:** crawler/ had no vitest config, so `npm test` picked up the root `vitest.config.mts` which requires a non-existent `src/test-setup.ts` — all 9 test files failed with `ERR_MODULE_NOT_FOUND`
- **Fix:** Created `crawler/vitest.config.ts` with `environment: 'node'`, no setupFiles, include pattern `src/**/*.test.ts`
- **Files modified:** `crawler/vitest.config.ts` (new)
- **Commit:** 709f30e

**2. [Rule 1 - Bug] Timeout test hung past 5s vitest default timeout**
- **Found during:** Wave 3 (psi.test.ts timeout test)
- **Issue:** Using `vi.useFakeTimers()` + `advanceTimersByTimeAsync` did not cause the `AbortController` to fire — the test hung for the full timeout duration
- **Fix:** Changed test to use a `fetch` mock that listens for the `signal.abort` event and rejects with `AbortError` — simulates real abort behaviour without fake timers
- **Files modified:** `crawler/src/lib/psi.test.ts`
- **Commit:** 709f30e

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| `scoreAxeViolations` returns `[]` | crawler/src/pipeline/stage1-external-scorer.ts | Plan 06-02 replaces the body; export contract established here |

## Threat Flags

None — `fetchPSISignals` calls an external read-only Google API with the API key in a query parameter (same pattern as other third-party analytics). No new inbound endpoints, no auth paths, no file access.

## Self-Check: PASSED

- [x] crawler/src/lib/psi.ts exists
- [x] crawler/src/pipeline/stage1-external-scorer.ts exists
- [x] crawler/src/lib/psi.test.ts exists
- [x] crawler/src/pipeline/stage1-external-scorer.test.ts exists
- [x] crawler/vitest.config.ts exists
- [x] Commits ebb0df9, 94ac9e5, 9bea1bc, 709f30e exist in git log
- [x] 97 tests pass, 0 failures
- [x] typecheck passes
