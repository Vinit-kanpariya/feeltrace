---
phase: 03-ai-pipeline
plan: "02"
subsystem: crawler/pipeline
tags: [ai-pipeline, stage1-scorer, deterministic, types, tdd]
dependency_graph:
  requires: ["03-01"]
  provides: ["crawler/src/pipeline/types.ts", "crawler/src/pipeline/stage1-scorer.ts"]
  affects: ["03-03", "03-04", "03-05"]
tech_stack:
  added: []
  patterns: ["TDD red/green", "pure function threshold scoring", "viewport deduplication"]
key_files:
  created:
    - crawler/src/pipeline/types.ts
    - crawler/src/pipeline/stage1-scorer.ts
    - crawler/src/pipeline/stage1-scorer.test.ts
  modified: []
decisions:
  - "Deduplication built inline per-rule (not post-process): when both viewports trigger the same threshold in the same loop iteration, emit one 'both' issue directly. deduplicateIssues() is a secondary safety net exported for unit testing."
  - "signal_source includes viewport suffix in parentheses: 'networkSignals.firstRequestTTFB (mobile)' rather than a separate field — matches test expectations and DB storage pattern"
  - "cdnCount === 0 uses condition='eq' in ThresholdRule to distinguish from gt-style rules"
metrics:
  duration: "~32min"
  completed: "2026-05-26T10:32:00Z"
  tasks_completed: 2
  files_created: 3
requirements_satisfied: [AI-01, AI-04]
---

# Phase 3 Plan 02: Pipeline Types and Stage 1 Scorer Summary

Pipeline type contracts defined and Stage 1 deterministic scorer implemented as a pure function with all 23 threshold rules, deduplication logic, and 20 passing unit tests covering AI-01 and AI-04 requirements.

## What Was Built

**crawler/src/pipeline/types.ts**
- `ScoredIssue` interface: category (perceived-perf | technical-perf | accessibility), signal_source, severity (1|2|3|4), raw_evidence, viewport
- `EnrichedIssue` extends ScoredIssue with technical_description
- `CausalEdgeCandidate`: fromIndex, toIndex, mechanism, relationship, confidence, explanation
- `NarrativeResult`: summary, perceivedPerformance, technicalPerformance, recommendations
- `SEVERITY_LABELS` const: { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' }
- `PERMITTED_MECHANISMS` readonly array with exactly 13 causality mechanism strings (single source of truth)

**crawler/src/pipeline/stage1-scorer.ts**
- `scoreSignals(mobile: CrawlPass, desktop: CrawlPass): ScoredIssue[]` — pure synchronous function, no I/O
- All 23 threshold rules from RESEARCH.md Pattern 1 across 4 signal groups: network, JS, CSS, DOM
- Mobile-only rules for `jsSignals.totalJSBytes` (>500KB Critical, >300KB High)
- Inline deduplication: same threshold triggered on both viewports → single issue with `viewport: 'both'`
- Different severity levels from each viewport → two separate issues emitted
- `deduplicateIssues(issues)` exported helper as secondary safety net
- `raw_evidence` format: `"${value}${unit} (threshold: >${threshold}${unit} ${label})"`

**crawler/src/pipeline/stage1-scorer.test.ts**
- 20 tests across 5 describe blocks: network thresholds, JS thresholds, CSS thresholds, DOM thresholds, deduplication, category assignment (AI-04)
- All 20 tests pass with `npm test -- --run crawler/src/pipeline/stage1-scorer.test.ts`

## Decisions Made

1. **Deduplication approach**: Built inline during rule evaluation (checking both viewports in the same iteration) rather than as a post-processing step. The `deduplicateIssues()` function handles any remaining duplicate signal_source+severity pairs as a safety net. This is simpler and matches the viewport-suffix pattern used in `signal_source`.

2. **signal_source format**: `"networkSignals.firstRequestTTFB (mobile)"` — includes viewport suffix in parentheses so the raw DB record is self-descriptive without requiring a join to the viewport field.

3. **cdnCount threshold**: Uses `condition: 'eq'` to check for `cdnCount === 0` — the only equality-condition rule. All other rules use `>` (greater-than).

4. **ThresholdRule structure**: Module-level constant arrays organized by signal group (NETWORK_RULES, JS_RULES, CSS_RULES, DOM_RULES) for readability and maintainability.

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED | `6d2251f` | test(03-02): add failing tests for stage1 scorer (TDD red) |
| GREEN | `f54728d` | feat(03-02): implement Stage 1 deterministic scorer (TDD green) |
| REFACTOR | N/A | No refactoring needed |

## Acceptance Criteria Verification

| Criterion | Status |
|-----------|--------|
| crawler/src/pipeline/types.ts exists | PASS |
| ScoredIssue exports with all 5 fields | PASS |
| EnrichedIssue with technical_description | PASS |
| CausalEdgeCandidate with 6 fields | PASS |
| NarrativeResult with 4 fields | PASS |
| SEVERITY_LABELS constant exported | PASS |
| PERMITTED_MECHANISMS with 13 entries | PASS |
| `npx tsc --noEmit` exits 0 | PASS |
| stage1-scorer.ts exports `scoreSignals` | PASS |
| stage1-scorer.test.ts with `// @vitest-environment node` | PASS |
| `npm test -- --run stage1-scorer.test.ts` exits 0 | PASS (20/20 tests) |
| TTFB 2400ms → severity 4 + category 'perceived-perf' | PASS |
| Mobile+desktop same TTFB threshold → single issue viewport 'both' | PASS |
| totalJSBytes 600000 (mobile) → category 'technical-perf' | PASS |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all threshold rules are fully implemented with real values from RESEARCH.md Pattern 1.

## Threat Surface Scan

Files created are pure in-memory functions with no network endpoints, no auth paths, no file access, and no schema changes. The scorer accepts only numeric aggregated signal values (CrawlPass) per the threat model — no raw HTML or string content from page passes through. Threat disposition: accept (per T-03-03 in plan threat register).

## Self-Check

### Created files exist:
- crawler/src/pipeline/types.ts: FOUND
- crawler/src/pipeline/stage1-scorer.ts: FOUND
- crawler/src/pipeline/stage1-scorer.test.ts: FOUND

### Commits exist:
- e562296: feat(03-02): define pipeline type contracts in types.ts — FOUND
- 6d2251f: test(03-02): add failing tests for stage1 scorer (TDD red) — FOUND
- f54728d: feat(03-02): implement Stage 1 deterministic scorer (TDD green) — FOUND

## Self-Check: PASSED
