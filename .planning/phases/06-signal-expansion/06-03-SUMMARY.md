---
phase: "06"
plan: "03"
subsystem: "crawler"
tags: [integration-test, stage1, cwv, lighthouse, axe, typecheck, verification]
dependency_graph:
  requires: [06-01 — ExternalSignals, scoreExternalSignals, scoreAxeViolations; 06-02 — real scoreAxeViolations implementation]
  provides: [stage1-integration.test.ts, Stage 2 prompt audit result, full Phase 6 test suite verification]
  affects: [crawler/src/pipeline/stage1-integration.test.ts]
tech_stack:
  added: []
  patterns: [fully-zeroed CrawlPass stub (no threshold triggers), cross-scorer combine pattern]
key_files:
  created:
    - crawler/src/pipeline/stage1-integration.test.ts
  modified: []
decisions:
  - "Stage 2 audit: stage2-reasoner.ts has no signal_source allowlist — zod schema only validates mechanism strings, not signal_source — no change needed"
  - "CrawlPass stub uses networkSignals.cdnCount=1 (not 0) to avoid triggering the cdnCount===0 Medium rule, keeping integration test focused on external and axe signals only"
  - "allIssues combined outside describe() block so all six test cases share the same computed array — avoids redundant recomputation"
metrics:
  duration: "~10 minutes"
  completed: "2026-05-27"
  tasks: 3
  files: 1
---

# Phase 06 Plan 03: Pipeline Verification & Integration Test Summary

Integration test created covering all three Stage 1 signal scorers (scoreSignals + scoreExternalSignals + scoreAxeViolations) in combination, Stage 2 prompt audited (no allowlist found), and full test suite passes with 112 tests and clean typecheck.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Stage 2 prompt audit (read-only) — no signal_source allowlist in stage2-reasoner.ts | — (no change needed) | — |
| 2 | Create stage1-integration.test.ts — 6 test cases, all three signal types | 38ded4b | crawler/src/pipeline/stage1-integration.test.ts |
| 3 | Full test suite + typecheck verification (112 tests pass, tsc --noEmit exits 0) | — (verification only) | — |

## Test Results

- **112 tests pass** (10 test files total)
- **6 new integration tests** in stage1-integration.test.ts:
  - `combined scorer emits cwv signal_source issues from ExternalSignals` — PASS
  - `combined scorer emits lighthouse signal_source issues from ExternalSignals` — PASS
  - `combined scorer emits axe signal_source issues from AxeViolation[]` — PASS
  - `CWV LCP Critical issue has severity 4` — PASS
  - `axe critical violation maps to severity 4` — PASS
  - `_signals payload is JSON-serialisable` — PASS
- **typecheck: clean** (tsc --noEmit exits 0)

## Stage 2 Prompt Audit Result

`stage2-reasoner.ts` was audited for hard-coded `signal_source` prefix allowlists, enum strings, or prompt instructions referencing specific prefixes.

**Finding:** No allowlist found. The Stage2OutputSchema zod schema validates only the `mechanism` field (against the 13-entry `PERMITTED_MECHANISMS` constant). The `signal_source` field is not referenced in the zod schema at all — it flows through `ScoredIssue` as a plain string. The system prompt instructs the LLM on causality mechanisms and confidence levels but contains no reference to specific `signal_source` prefixes. The new `cwv.*`, `lighthouse.*`, and `axe.*` prefixes will be handled generically by the LLM.

**Action taken:** None — no change to stage2-reasoner.ts required.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — integration test file is test-only. No new network endpoints, auth paths, file access patterns, or schema changes introduced.

## Self-Check: PASSED

- [x] crawler/src/pipeline/stage1-integration.test.ts exists
- [x] 6 test cases match the plan specification exactly
- [x] Stage 2 audit complete — finding documented in test file comment and SUMMARY
- [x] npm run typecheck exits 0
- [x] npm test exits 0 — 112 tests pass, 0 failures
- [x] Commit 38ded4b exists in git log
