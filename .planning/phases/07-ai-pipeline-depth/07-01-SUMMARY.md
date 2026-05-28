---
phase: 07-ai-pipeline-depth
plan: "01"
subsystem: crawler/pipeline
tags: [vision-scanner, groq, stage1-5, signal-expansion, tdd]
dependency_graph:
  requires:
    - "06-03: axe-core accessibility scanner (scoreAxeViolations wired into run-pipeline.ts)"
    - "03-xx: Stage 2 and Stage 3 LLM reasoning (run-pipeline.ts orchestration pattern)"
  provides:
    - "runVisualScanner: non-blocking Groq vision LLM call producing ScoredIssue[]"
    - "Stage 1.5 block in run-pipeline.ts: visual issues enter Stage 2 input before causal reasoning"
  affects:
    - "crawler/src/pipeline/run-pipeline.ts: Stage 1.5 block inserted, getGroqClient moved up"
tech_stack:
  added: []
  patterns:
    - "Groq vision API: forced tool_choice with multimodal image_url content blocks"
    - "Pre-encode size guard (2.5MB) before base64 conversion to prevent OOM"
    - "Non-blocking try/catch pattern: returns [] on any error, job always continues"
    - "TDD Red/Green with vi.fn() mock for Groq client in unit tests"
key_files:
  created:
    - crawler/src/pipeline/stage1-5-vision-scanner.ts
    - crawler/src/pipeline/stage1-5-vision-scanner.test.ts
  modified:
    - crawler/src/pipeline/run-pipeline.ts
decisions:
  - "Size guard threshold at 2.5MB pre-encode (not 4MB limit): provides 33% safety margin for base64 overhead"
  - "Stage 1.5 runs serially before Stage 2 (not parallel): visual issues must enter Stage 2 input for causal edge formation"
  - "getGroqClient() moved to before Stage 1.5 block and shared with Stage 2 — eliminates duplicate call"
metrics:
  duration: "6 minutes"
  completed: "2026-05-28"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 1
  tests_added: 6
  tests_total: 160
---

# Phase 7 Plan 01: Stage 1.5 Vision Scanner Summary

**One-liner:** Groq vision LLM call (llama-4-scout) wired as non-blocking Stage 1.5 between DOM scoring and Stage 2 reasoning, converting screenshots to ScoredIssue[] via forced tool-call output validated by Zod.

## What Was Built

Stage 1.5 — a new pipeline stage that feeds the captured page screenshot to Groq's multimodal model (`meta-llama/llama-4-scout-17b-16e-instruct`) and returns visual UX issues in `ScoredIssue[]` format. Visual issues (contrast failures, layout clutter, hierarchy problems, CTA visibility, spacing) enter the `scoredIssues` array BEFORE Stage 2, enabling the existing reasoning pipeline to form causal edges between visual and technical signals.

### Files Created

**`crawler/src/pipeline/stage1-5-vision-scanner.ts`**

- `VISION_SYSTEM_PROMPT`: static module-level const instructing the model to focus only on visually apparent issues and cap at 5
- `EMIT_VISUAL_ISSUES_TOOL`: typed `Groq.Chat.Completions.ChatCompletionTool` with enum for visual_category
- `VisualIssuesSchema` (exported): Zod schema with `.max(5)` cap on visual_issues array
- `parseVisualIssues` (exported): maps tool output to `ScoredIssue[]` with signal_source prefixed `visual.{category}`
- `runVisualScanner` (exported): async function with 2.5MB pre-encode guard, base64 encoding, forced `tool_choice`, and full try/catch returning `[]` on any error

**`crawler/src/pipeline/stage1-5-vision-scanner.test.ts`**

6 unit tests (TDD):
1. `VisualIssuesSchema.parse()` succeeds for valid contrast issue
2. `VisualIssuesSchema.parse()` throws for invalid `visual_category`
3. `parseVisualIssues` maps to ScoredIssue with correct shape (signal_source prefix, category, viewport)
4. `parseVisualIssues` enforced cap via schema — 6 items fails schema parse
5. `runVisualScanner` returns `[]` for buffer > 2.5MB (no Groq call)
6. `runVisualScanner` returns `[]` when Groq throws (non-blocking)

### Files Modified

**`crawler/src/pipeline/run-pipeline.ts`**

- Added `import { runVisualScanner } from './stage1-5-vision-scanner'`
- Moved `const client = getGroqClient()` from just before Stage 2 to just before Stage 1.5 block
- Inserted Stage 1.5 block: `if (screenshot) { runVisualScanner(client, screenshot); scoredIssues.push(...visualIssues) }` — positioned AFTER `scoreAxeViolations` push and BEFORE `uploadScreenshot`
- Removed duplicate `const client = getGroqClient()` call that was at original line 89
- Updated log message to reflect total issues count post Stage 1.5

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED | `8d2f9d7` test(07-01): add failing tests for stage1-5 vision scanner | PASS |
| GREEN | `72b3122` feat(07-01): implement stage1-5 vision scanner for SIGNAL-04 | PASS |
| REFACTOR | (not needed — implementation was clean) | N/A |

## Verification

| Check | Result |
|-------|--------|
| `stage1-5-vision-scanner.test.ts` — 6 tests | PASS |
| Full test suite (160 tests) | PASS |
| `runVisualScanner` export present | PASS |
| `parseVisualIssues` export present | PASS |
| `VisualIssuesSchema` export present | PASS |
| Model string is `meta-llama/llama-4-scout-17b-16e-instruct` | PASS |
| Pre-encode size guard at 2,500,000 bytes | PASS |
| try/catch wraps entire LLM call block | PASS |
| `runVisualScanner` in import + call in run-pipeline.ts | PASS |
| `getGroqClient()` appears exactly once in run-pipeline.ts | PASS |
| typecheck against main repo (groq-sdk available) | PASS |

## Deviations from Plan

None — plan executed exactly as written.

The typecheck verification (`npm run typecheck`) was run via the main repo's crawler tsc (since the worktree doesn't have `node_modules` symlinked). New files pass cleanly; pre-existing errors in `browser.ts`, `groq-client.ts`, and `queue.ts` are worktree-isolation artifacts unrelated to this plan's changes.

## Known Stubs

None. `runVisualScanner` returns real LLM output (or `[]` on graceful failure). No hardcoded values flow to UI rendering through this plan — Stage 1.5 output feeds into the existing `scoredIssues` → Stage 2 → DB write path unchanged.

## Threat Flags

No new threat surface beyond what is documented in the plan's `<threat_model>`. The three mitigations are implemented:
- T-7-01: Forced tool-call output (not free text) — EMIT_VISUAL_ISSUES_TOOL with `tool_choice`
- T-7-02: Pre-encode size guard at 2.5MB — implemented in `runVisualScanner`
- T-7-03: try/catch returning `[]` on any error including 429 — implemented in `runVisualScanner`

## Self-Check: PASSED

Files created:
- `crawler/src/pipeline/stage1-5-vision-scanner.ts` — FOUND
- `crawler/src/pipeline/stage1-5-vision-scanner.test.ts` — FOUND

Commits:
- `8d2f9d7` (test RED) — FOUND
- `72b3122` (feat GREEN) — FOUND
- `4f94247` (feat wire into run-pipeline) — FOUND
