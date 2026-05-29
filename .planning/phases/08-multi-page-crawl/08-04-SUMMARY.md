---
plan: 08-04
phase: 08-multi-page-crawl
status: complete
completed: "2026-05-29"
tasks_total: 2
tasks_completed: 2
---

# 08-04 SUMMARY: run-pipeline.ts mode param + site-wide-merger.ts

## What Was Built

### Task 1: runAIPipeline mode param (committed in feat(08-03) by parallel agent)
`crawler/src/pipeline/run-pipeline.ts` — added `mode: 'single' | 'multi' = 'single'` parameter. In `multi` mode the function returns `PipelineResult` instead of writing to the DB. The atomic DB write path is preserved unchanged for `single` mode.

### Task 2: site-wide-merger.ts created
`crawler/src/pipeline/site-wide-merger.ts` — two exported functions:

- **`detectCrossPagePatterns(pageResults, minPages=3)`** — pure synchronous function. Groups issues by `signal_source` across pages, counts distinct URLs, filters to entries appearing on `>= minPages` pages, returns `CrossPagePattern[]` sorted by `worst_severity` descending.

- **`runSiteWideAnalysis(pageResults)`** — async Stage 4 LLM function. Single-page shortcut returns per-page narrative directly with `crossPagePatterns: []`. Multi-page path calls Groq `llama-3.3-70b-versatile` with compact per-page summaries (top 5 issues by severity to stay under 12,000 TPM). Uses `getGroqClient()` singleton consistent with `run-pipeline.ts`.

## Deviations

- **Auto-fix (parallel collision):** `runAIPipeline` mode param was added by the parallel 08-03 agent (which read both plans before committing). 08-04 picked up the already-committed change; Task 1 was already complete on start.
- **Test fix:** `site-wide-merger.test.ts` had a vitest `vi.mock()` hoisting bug — `MOCK_NARRATIVE_CONTENT` const was referenced inside the hoisted mock factory (TDZ error). Fixed by mocking `../lib/groq-client` instead of `groq-sdk` directly, which also aligns with the codebase's existing singleton pattern.

## Key Files

- `crawler/src/pipeline/site-wide-merger.ts` — new file, Stage 4 merger
- `crawler/src/pipeline/run-pipeline.ts` — mode param added
- `crawler/src/pipeline/site-wide-merger.test.ts` — 6 tests GREEN

## Commits

- `feat(08-03): implement extractInternalLinks...` (run-pipeline.ts mode param included here by parallel agent)
- `feat(08-04): create site-wide-merger.ts with cross-page pattern detection and Stage 4 LLM narrative`

## Self-Check

- [x] `detectCrossPagePatterns` exported and pure sync
- [x] `runSiteWideAnalysis` exported, async, uses getGroqClient()
- [x] Single-page shortcut returns per-page narrative directly
- [x] All 6 site-wide-merger.test.ts tests GREEN
- [x] TypeScript clean (npx tsc --noEmit exits 0)
- [x] No regression to existing pipeline tests
