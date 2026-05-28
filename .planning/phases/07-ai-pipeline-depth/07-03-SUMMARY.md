---
phase: 07-ai-pipeline-depth
plan: "03"
subsystem: crawler/pipeline
tags: [page-type-detection, benchmark-context, cwv, stage3-narrator, deterministic-classifier, ai-pipeline]
dependency_graph:
  requires:
    - "07-01: Stage 1.5 vision scanner (run-pipeline.ts orchestration established, client wiring pattern)"
    - "07-02: Stage 2 enrichment (EnrichedIssue.fix_suggestion + severity_justification fields added)"
  provides:
    - "detectPageType: deterministic PageType classifier using TechProfile + DOMSignals"
    - "buildBenchmarkContext: CWV threshold-relative comparison paragraph builder (returns '' when cwv null)"
    - "runStage3Narration extended: accepts pageType + benchmarkContext params, builds systemPrompt dynamically"
    - "run-pipeline.ts: page-type detection + benchmark context wired between Stage 2 and Stage 3"
    - "run-pipeline.ts: issues.create map includes fix_suggestion + severity_justification from Plan 07-02"
  affects:
    - "07-04: multi-page crawl will call detectPageType per page and may aggregate page types"
    - "Next.js app display layer: IssueCard + results page will receive fix_suggestion/severity_justification"
tech_stack:
  added: []
  patterns:
    - "Deterministic early-return classifier: TechProfile.payments → saas-dashboard → blog → landing-page → unknown"
    - "CWV threshold-relative framing: GOOD/NEEDS IMPROVEMENT/POOR labels + ratio multiplier (value/threshold)"
    - "Dynamic system prompt construction inside async LLM function (not at module scope) for per-call context injection"
    - "TDD Red/Green pattern: test files committed before implementation files"
key_files:
  created:
    - crawler/src/pipeline/page-type-detector.ts
    - crawler/src/pipeline/page-type-detector.test.ts
    - crawler/src/pipeline/benchmark-context.ts
    - crawler/src/pipeline/benchmark-context.test.ts
  modified:
    - crawler/src/pipeline/stage3-narrator.ts
    - crawler/src/pipeline/run-pipeline.ts
key_decisions:
  - "Dynamic systemPrompt built inside runStage3Narration (not at module scope): pageType and benchmarkContext are per-call values; module-scope const cannot interpolate runtime params"
  - "fix_suggestion and severity_justification added to issues.create map in this plan (07-03) even though schema migration was Plan 07-02: run-pipeline.ts wiring is a single atomic change"
  - "PAGE_TYPE_CONTEXT uses threshold-relative framing (not per-industry median): no authoritative per-vertical median published by Google or HTTP Archive"
  - "CWV_THRESHOLDS.cls.good=10 and cls.poor=25 are raw integers matching CWVMetrics.cls_raw (PSI percentile × 100)"
requirements-completed: [AI-03, AI-04]
duration: 6min
completed: "2026-05-28"
---

# Phase 7 Plan 03: Page-Type Detector and Benchmark Context Summary

**Deterministic PageType classifier (e-commerce/saas-dashboard/blog/landing-page/unknown) and CWV threshold-relative benchmark context builder wired into Stage 3 for context-aware narrative framing.**

## Performance

- **Duration:** 6 minutes
- **Started:** 2026-05-28T10:25:42Z
- **Completed:** 2026-05-28T10:41:30Z
- **Tasks:** 2
- **Files modified:** 6 (4 created, 2 modified)

## Accomplishments

- Created `page-type-detector.ts`: deterministic 5-rule classifier using TechProfile.payments, analytics, framework, and DOMSignals.interactiveElementCount, semanticScore.articleCount/h2Count, formCount, ctaVisibility.buttonCount
- Created `benchmark-context.ts`: builds CWV GOOD/NEEDS IMPROVEMENT/POOR paragraph with threshold-relative ratio multipliers (e.g. "2.0× the good threshold"), returns '' when cwv is null
- Extended `runStage3Narration` to accept `pageType: PageType` and `benchmarkContext: string`, building the system prompt dynamically inside the function with page-type framing and CWV benchmark injection
- Wired detection + context building into `run-pipeline.ts` between Stage 2 and Stage 3, including `fix_suggestion` and `severity_justification` in the DB issues.create map
- All 12 new unit tests pass (6 page-type + 6 benchmark-context), full crawler suite 136 tests green

## Task Commits

TDD task with RED/GREEN split:

1. **RED — page-type-detector + benchmark-context tests** - `aad7918` (test)
2. **GREEN — page-type-detector + benchmark-context implementation** - `b63788d` (feat)
3. **Task 2: Stage 3 + run-pipeline.ts wiring** - `31d227f` (feat)

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED | `aad7918` test(07-03): add failing tests for page-type-detector and benchmark-context | PASS |
| GREEN | `b63788d` feat(07-03): implement page-type-detector and benchmark-context utilities | PASS |
| REFACTOR | (not needed — implementation was clean) | N/A |

## Files Created/Modified

- `crawler/src/pipeline/page-type-detector.ts` — Pure deterministic PageType classifier, exports `PageType` type and `detectPageType` function
- `crawler/src/pipeline/page-type-detector.test.ts` — 6 unit tests covering all 5 PageType values
- `crawler/src/pipeline/benchmark-context.ts` — CWV benchmark context builder with `CWV_THRESHOLDS`, `PAGE_TYPE_CONTEXT`, exports `buildBenchmarkContext`
- `crawler/src/pipeline/benchmark-context.test.ts` — 6 unit tests: null cwv, GOOD/NEEDS IMPROVEMENT/POOR labels, ratio multiplier, origin_fallback note, CLS line
- `crawler/src/pipeline/stage3-narrator.ts` — Added `PageType` import, extended `runStage3Narration` signature with 2 new params, dynamic systemPrompt construction
- `crawler/src/pipeline/run-pipeline.ts` — Added `detectPageType` + `buildBenchmarkContext` imports, page-type detection block before Stage 3, updated Stage 3 call, added `fix_suggestion` + `severity_justification` to issues.create

## Decisions Made

- **Dynamic systemPrompt vs module-scope const:** `pageType` and `benchmarkContext` are runtime values passed per-call; building the full prompt string inside `runStage3Narration` (not at module scope) is the only correct approach.
- **`fix_suggestion` + `severity_justification` wired here:** Although the schema columns were added in Plan 07-02, the `run-pipeline.ts` issues.create map update belongs in this plan (07-03) as part of the DB write wiring alongside the Stage 3 changes.
- **CLS threshold as raw integer:** `CWV_THRESHOLDS.cls.good = 10` and `cls.poor = 25` match `CWVMetrics.cls_raw` which is the PSI percentile × 100 format (0.1 CLS = 10 raw). Dividing by 100 only happens for display formatting.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. Typecheck in worktree shows only pre-existing isolation errors (missing node_modules for `groq-sdk`, `playwright-core`, etc.) — same artifacts documented in Plan 07-01 SUMMARY. No new type errors were introduced.

## Known Stubs

None. Both new utility modules are pure functions with no hardcoded empty values. Stage 3 receives real CWV data from externalSignals (PSI API, fetched in prior crawl step) and real TechProfile from the browser fingerprint.

## Threat Flags

No new threat surface introduced. All items in the plan's threat register:
- T-7-07: PAGE_TYPE_CONTEXT benchmark strings are static compile-time constants — no user PII
- T-7-08: benchmarkContext is built from server-side PSI data + static strings — not a prompt injection vector
- T-7-09: detectPageType returning 'unknown' falls back to current narrative behavior gracefully

## Next Phase Readiness

- Wave 2 complete for Plan 03. The page-type detection and benchmark context building are fully wired.
- Plan 07-04 (if applicable) can reference `PageType` and `detectPageType` for multi-page aggregation.
- The fix_suggestion and severity_justification DB write is active — once the Prisma migration from Plan 07-02 is applied, new analyses will store all five enrichment fields per issue.

---
*Phase: 07-ai-pipeline-depth*
*Completed: 2026-05-28*

## Self-Check: PASSED

Files created:
- `crawler/src/pipeline/page-type-detector.ts` — FOUND
- `crawler/src/pipeline/page-type-detector.test.ts` — FOUND
- `crawler/src/pipeline/benchmark-context.ts` — FOUND
- `crawler/src/pipeline/benchmark-context.test.ts` — FOUND

Commits:
- `aad7918` (test RED) — FOUND
- `b63788d` (feat GREEN) — FOUND
- `31d227f` (feat Task 2 wiring) — FOUND
