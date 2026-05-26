---
phase: 04-results-dashboard
plan: 01
subsystem: testing
tags: [vitest, testing-library, tdd, red-phase, wave-0]

# Dependency graph
requires:
  - phase: 03-ai-pipeline
    provides: NarrativeResult shape, SEVERITY_LABELS, CausalEdge structure established in crawler pipeline
provides:
  - vitest.config.mts updated to include .test.tsx files
  - 5 RED test stubs covering all Phase 4 behavioral contracts (Nyquist baseline)
  - DASH-01 contract: SEVERITY_LABELS and CATEGORY_LABELS tests
  - DASH-02 contract: NarrativeSection 4-sub-section rendering tests
  - DASH-03 contract: meetsCredibilityThreshold and buildGraphData tests
  - DASH-04 contract: ShareButton clipboard copy and 2s revert tests
  - D-03 contract: JobStatusBadge router.push on complete, no <pre> element tests
affects: [04-02-PLAN, 04-03-PLAN, 04-04-PLAN, 04-05-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Wave 0 RED stubs: test files import from not-yet-existing source modules to enforce test-first discipline"
    - "JobStatusBadge test: mocks next/navigation useRouter with vi.fn() push to verify D-03 navigation behavior"
    - "Component tests: vi.useFakeTimers() + vi.advanceTimersByTime() for time-dependent behavior"

key-files:
  created:
    - src/types/narrative.test.ts
    - src/lib/graph-utils.test.ts
    - src/components/ShareButton.test.tsx
    - src/components/JobStatusBadge.test.tsx
    - src/components/NarrativeSection.test.tsx
  modified:
    - vitest.config.mts

key-decisions:
  - "vitest include pattern broadened from src/**/*.test.ts to src/**/*.test.{ts,tsx} — required for React component test files (.tsx)"
  - "JobStatusBadge tests written against D-03 expected behavior (post-rewrite) — they fail against the pre-rewrite current implementation, which is correct RED behavior"
  - "graph-utils tests use inline TestEdge/TestIssue interfaces to avoid Prisma DB dependency in unit tests"
  - "ShareButton tests use vi.useFakeTimers + vi.advanceTimersByTime(2000) to test the 2s revert without real delays"

patterns-established:
  - "Pattern: Wave 0 RED stubs import from non-existent modules — failing at import stage is valid test failure"
  - "Pattern: Component tests mock next/navigation with vi.mock before any import to ensure hoisting"
  - "Pattern: navigator.clipboard mocked via Object.assign(navigator, { clipboard: { writeText: vi.fn() } })"

requirements-completed: [DASH-01, DASH-02, DASH-03, DASH-04]

# Metrics
duration: 3min
completed: 2026-05-26
---

# Phase 4 Plan 01: Vitest Config Fix + 5 RED Test Stubs Summary

**Vitest .tsx include pattern fixed and 5 RED test stubs established as the Nyquist verification baseline for all Phase 4 behavioral contracts**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-05-26T14:19:48Z
- **Completed:** 2026-05-26T14:22:48Z
- **Tasks:** 2
- **Files modified:** 6 (1 config update, 5 test files created)

## Accomplishments

- Updated `vitest.config.mts` include pattern to `src/**/*.test.{ts,tsx}` so React component test files are discovered
- Created 5 RED test stub files covering all 4 Phase 4 requirements (DASH-01 through DASH-04) and decision D-03
- Tests are discovered by Vitest and fail at import-not-found stage — correct Wave 0 RED behavior
- JobStatusBadge tests document D-03 expected behavior (router.push, no `<pre>`) and fail against current pre-rewrite code

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix vitest.config.mts include pattern for .tsx test files** - `7b70dd5` (chore)
2. **Task 2: Write RED test stubs for all Phase 4 behavioral contracts** - `b4da6e8` (test)

## Files Created/Modified

- `vitest.config.mts` - Changed include pattern from `src/**/*.test.ts` to `src/**/*.test.{ts,tsx}`
- `src/types/narrative.test.ts` - Contract tests for SEVERITY_LABELS[1–4] and CATEGORY_LABELS[3 keys] (DASH-01)
- `src/lib/graph-utils.test.ts` - Contract tests for meetsCredibilityThreshold (4 cases) and buildGraphData node/edge layout (DASH-03)
- `src/components/ShareButton.test.tsx` - Contract tests for clipboard writeText call, "Link copied" state, 2s revert (DASH-04)
- `src/components/JobStatusBadge.test.tsx` - Contract tests for router.push on complete, error display on failed, no `<pre>` element (D-03)
- `src/components/NarrativeSection.test.tsx` - Contract tests for all 4 sub-sections and sub-labels rendering (DASH-02)

## Decisions Made

- **vitest .tsx pattern**: Broadened from `.test.ts` to `.test.{ts,tsx}` — required for React component test files to be discovered. Crawler entry stays `.test.ts` only (no React component tests there).
- **JobStatusBadge RED strategy**: Tests are written against the D-03 expected behavior (post-rewrite). They fail against the current implementation, which has `result` state, `/api/results/` fetch, and `<pre>` dump. This is the correct RED state — the rewrite in Plan 04-03 will turn them GREEN.
- **No Prisma imports in tests**: graph-utils tests use inline `TestEdge`/`TestIssue` interfaces to avoid DB dependencies at test time.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Wave 0 Nyquist baseline established — all 5 test contracts are RED and discoverable
- Plan 04-02 (Wave 1): Create `src/types/narrative.ts` → turns `narrative.test.ts` GREEN
- Plan 04-03 (Wave 1): Create `src/lib/graph-utils.ts` + rewrite `JobStatusBadge.tsx` → turns `graph-utils.test.ts` and `JobStatusBadge.test.tsx` GREEN
- Plan 04-04 (Wave 2): Create `NarrativeSection.tsx` → turns `NarrativeSection.test.tsx` GREEN
- Plan 04-05 (Wave 3): Create `ShareButton.tsx` → turns `ShareButton.test.tsx` GREEN

## Self-Check

- [x] vitest.config.mts contains `src/**/*.test.{ts,tsx}` — FOUND
- [x] src/types/narrative.test.ts exists — FOUND
- [x] src/lib/graph-utils.test.ts exists — FOUND
- [x] src/components/ShareButton.test.tsx exists — FOUND
- [x] src/components/JobStatusBadge.test.tsx exists — FOUND
- [x] src/components/NarrativeSection.test.tsx exists — FOUND
- [x] npm run test:run discovers all 5 files and fails — VERIFIED (5 failed suites, all with import-not-found or assertion failures)
- [x] Commits 7b70dd5 and b4da6e8 exist — VERIFIED

## Self-Check: PASSED

---
*Phase: 04-results-dashboard*
*Completed: 2026-05-26*
