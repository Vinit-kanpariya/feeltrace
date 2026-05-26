---
phase: 03-ai-pipeline
plan: "05"
subsystem: crawler
tags: [integration, ai-pipeline, processor, groq, llama]
dependency_graph:
  requires:
    - 03-03  # stage2-reasoner.ts
    - 03-04  # stage3-narrator.ts + run-pipeline.ts
  provides:
    - processJob with full AI pipeline wired end-to-end
    - Result/Issue/CausalEdge records written to Neon via real LLM calls
  affects:
    - crawler/src/processor.ts
    - crawler/src/pipeline/stage2-reasoner.ts
    - crawler/src/pipeline/run-pipeline.ts
tech_stack:
  added:
    - groq-sdk (Groq LLM provider — llama-3.3-70b-versatile, 14,400 RPD free tier)
  patterns:
    - runAIPipeline called from processJob — in-process function call (no serialization)
    - _signals renamed to signals — Phase 2 unused-variable suppression prefix removed
    - Causal edge index remapping from scoredIssue space to enrichedIssue space before DB write
key_files:
  modified:
    - crawler/src/processor.ts
    - crawler/src/pipeline/stage2-reasoner.ts
    - crawler/src/pipeline/run-pipeline.ts
    - crawler/package.json
decisions:
  - "Switched from Gemini (gemini-2.0-flash) to Groq (llama-3.3-70b-versatile): Gemini free-tier quota exhausted across all models (gemini-1.5-flash, gemini-1.5-flash-8b, gemini-2.0-flash-lite); Groq provides 14,400 RPD free with no billing required"
  - "Causal edge indices must be remapped from scoredIssue space to enrichedIssue space before passing to prisma createMany — LLM returns indices into the original scored array, but DB write requires IDs of enriched issues whose indices differ"
  - "GROQ_API_KEY replaces GEMINI_API_KEY as the active LLM credential in crawler/.env"
  - "Rename _signals to signals: unused-variable suppression prefix removed now that pipeline consumes signals"
metrics:
  duration: "~2h (includes provider migration iteration)"
  completed: "2026-05-26"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 4
requirements_completed:
  - AI-01
  - AI-02
  - AI-03
  - AI-04
---

# Phase 3 Plan 05: Wire runAIPipeline + End-to-End Smoke Test Summary

**Full AI pipeline live end-to-end: Groq llama-3.3-70b-versatile replaced Gemini after quota exhaustion; causal edge index remap bug fixed; smoke test confirmed Result/5 Issues/5 CausalEdges written to Neon for https://react.dev.**

---

## What Was Built

### Task 1: Wire runAIPipeline into processor.ts

Made exactly two surgical changes to `crawler/src/processor.ts`:

1. Added `import { runAIPipeline } from './pipeline/run-pipeline'` after existing imports
2. Replaced the TODO Phase 3 stub with:
   ```ts
   // Phase 3: AI pipeline — scoreSignals → LLM reasoning → LLM narration → DB write
   await runAIPipeline(jobId, signals)
   ```
3. Renamed `_signals` to `signals` (removed Phase 2 unused-variable suppression prefix)

Build and TypeScript type-check both pass cleanly.

### Task 2: End-to-end smoke test (human-verified PASSED)

Smoke test URL: **https://react.dev/**

**DB records written to Neon:**

| Table | Count | Key values |
|-------|-------|------------|
| Result | 1 | id `cmpmjx5xo0000rcjd0nxrvh5g`, non-null narrative JSON with summary, perceivedPerformance, technicalPerformance, recommendations |
| Issue | 6 | severity values: 2, 4, 2, 4, 2, 2 — all in {1,2,3,4} |
| CausalEdge | 5 | mechanisms: ttfb-delays-fcp, render-blocking-js-delays-tti, missing-cdn-increases-ttfb, unused-js-inflates-bundle, deep-dom-increases-layout-cost |

All Phase 3 acceptance criteria satisfied (AI-01 through AI-04).

---

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wire runAIPipeline into processor.ts | 0325a35 | crawler/src/processor.ts |
| 1a | Switch Gemini model iterations | e4dc2d0, 8f83a01, 37c9a36, 0fa7d1d | crawler/src/pipeline/ |
| 1b | Migrate AI pipeline from Gemini to Groq | acb3281 | crawler/src/pipeline/, crawler/package.json |
| 1c | Fix causal edge index remap bug | ef36429 | crawler/src/pipeline/run-pipeline.ts |
| 2 | End-to-end smoke test | human-verified PASSED | — |

---

## Acceptance Criteria Status

- [x] `processor.ts` contains `import { runAIPipeline } from './pipeline/run-pipeline'`
- [x] `processor.ts` contains `await runAIPipeline(jobId, signals)`
- [x] `processor.ts` does NOT contain `TODO Phase 3`
- [x] `cd crawler && npm run build` exits 0
- [x] Result record exists in Neon DB with non-null narrative JSON
- [x] `narrative.summary` is non-empty (AI-04)
- [x] `narrative.perceivedPerformance` is a non-empty string (AI-04)
- [x] `narrative.technicalPerformance` is a non-empty string (AI-04)
- [x] At least 1 Issue record linked to Result with severity in {1,2,3,4} — 6 issues found
- [x] CausalEdge records with valid mechanism strings — 5 edges found
- [x] End-to-end smoke test with real URL: PASSED

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Gemini free-tier quota exhausted — migrated to Groq**
- **Found during:** Task 2 smoke test execution
- **Issue:** Gemini free-tier quota was exhausted across all available models (gemini-1.5-flash, gemini-1.5-flash-8b, gemini-2.0-flash, gemini-2.0-flash-lite). Each model iteration returned 429 Resource Exhausted. No model on the Gemini free tier remained available.
- **Fix:** Migrated LLM provider from `@google/generative-ai` to `groq-sdk`. Replaced `gemini.ts` singleton with `groq.ts` singleton using `llama-3.3-70b-versatile` model. Updated `stage2-reasoner.ts` and `stage3-narrator.ts` to use Groq chat completions API with JSON mode for Stage 2 and plain-text for Stage 3. `GROQ_API_KEY` added to `crawler/.env`. Groq provides 14,400 requests/day free with no billing setup required.
- **Files modified:** `crawler/src/pipeline/groq.ts` (new), `crawler/src/pipeline/stage2-reasoner.ts`, `crawler/src/pipeline/stage3-narrator.ts`, `crawler/package.json`
- **Commits:** e4dc2d0, 8f83a01, 37c9a36, 0fa7d1d (Gemini model iterations), acb3281 (Groq migration)

**2. [Rule 1 - Bug] Causal edge index remapping — undefined.id crash prevented**
- **Found during:** Task 2 smoke test — Stage 2 reasoning completed but DB write crashed
- **Issue:** `run-pipeline.ts` passed causal edge `issueIndex` values directly as indices into `enrichedIssues` array. However, the LLM returns indices into the `scoredIssues` array (which may be a different ordering/length than `enrichedIssues` after Stage 2 enrichment). Accessing `enrichedIssues[edge.issueIndex]` returned `undefined`, causing `.id` to throw.
- **Fix:** Added index remapping in `run-pipeline.ts`: before DB write, remap each edge's `issueIndex` from scoredIssue space to the corresponding enriched issue ID using the issue's `signalKey` as the stable cross-array identifier.
- **Files modified:** `crawler/src/pipeline/run-pipeline.ts`
- **Commit:** ef36429

---

**Total deviations:** 2 (1 blocking provider migration, 1 bug fix)
**Impact on plan:** Provider migration was forced by external quota exhaustion — not a design choice. Groq provides equivalent capabilities. Index remap bug was a latent defect in run-pipeline.ts that only manifested during live LLM output. Both fixes were necessary for end-to-end correctness.

---

## Issues Encountered

- Gemini model naming is inconsistent across API versions (v1 vs v1beta) — iterated through 4 model names before concluding quota exhaustion was the root cause, not model naming.
- Groq JSON mode requires `response_format: { type: 'json_object' }` in the chat completions call; the function-calling pattern from Gemini does not translate directly.

---

## Known Stubs

None. All exported functions are fully implemented with real LLM calls. The TODO stub in `processor.ts` has been replaced. `runAIPipeline` has been exercised against a production URL with verified DB output.

---

## Threat Surface Scan

No new network endpoints introduced. The Groq API is called from within the existing crawl pipeline process (same trust boundary as the former Gemini calls). `GROQ_API_KEY` is never logged — only passed as a constructor argument to the Groq SDK client.

| T-ID | Mitigated | How |
|------|-----------|-----|
| T-03-14 | Yes | Only two surgical changes to processor.ts; surrounding try/catch and status transitions unchanged |
| T-03-15 | Yes | processJob's 55s SLA timeout (Promise.race) still wraps runAIPipeline; Groq calls complete well within budget |
| T-03-16 | Yes | GROQ_API_KEY never appears in any logging path |

---

## Next Phase Readiness

Phase 3 is complete. All requirements AI-01 through AI-04 are satisfied end-to-end:

- **AI-01:** Issue severity derived from deterministic Stage 1 thresholds — not LLM inference
- **AI-02:** Each CausalEdge has a non-null mechanism from the PERMITTED_MECHANISMS list
- **AI-03:** Narrative includes distinct `[PERCEIVED PERFORMANCE]` and `[TECHNICAL PERFORMANCE]` sections
- **AI-04:** Narrative written at PM/UX-lead reading level; smoke test confirmed non-empty perceivedPerformance and technicalPerformance fields

Phase 4 (Results Dashboard) can begin. The Neon DB contains real Result/Issue/CausalEdge records from the smoke test that can be used to develop and verify dashboard rendering.

**Environment note for Phase 4:** `GROQ_API_KEY` must be present in `crawler/.env` (replaces `GEMINI_API_KEY` as the active LLM credential). `GEMINI_API_KEY` remains in `.env` but is no longer used.

---

## Self-Check: PASSED

Files modified:
- `crawler/src/processor.ts` — FOUND (modified)
- `crawler/src/pipeline/run-pipeline.ts` — FOUND (modified)

Commits:
- 0325a35 — FOUND (wire runAIPipeline)
- acb3281 — FOUND (Groq migration)
- ef36429 — FOUND (index remap fix)

Smoke test: Result id `cmpmjx5xo0000rcjd0nxrvh5g` — human-verified PASSED
- Issues: 6 records, severity {2,4,2,4,2,2} — all in {1,2,3,4}
- CausalEdges: 5 records with valid mechanism strings

---

*Phase: 03-ai-pipeline*
*Completed: 2026-05-26*
