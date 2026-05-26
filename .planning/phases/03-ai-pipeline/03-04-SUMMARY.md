---
phase: "03-ai-pipeline"
plan: "04"
subsystem: "crawler/pipeline"
tags: [ai-pipeline, stage3, narration, orchestrator, prisma, gemini]
dependency_graph:
  requires: ["03-02", "03-03"]
  provides: ["stage3-narrator.ts", "run-pipeline.ts"]
  affects: ["crawler/src/processor.ts"]
tech_stack:
  added: []
  patterns:
    - "Section-marker narrative parsing (parseNarrativeOutput)"
    - "Gemini plain-text output (no function calling for Stage 3)"
    - "Prisma $transaction with nested create + include for atomic multi-model writes"
    - "NarrativeResult cast via unknown for Prisma Json type compatibility"
key_files:
  created:
    - crawler/src/pipeline/stage3-narrator.ts
    - crawler/src/pipeline/stage3-narrator.test.ts
    - crawler/src/pipeline/run-pipeline.ts
  modified: []
decisions:
  - "NarrativeResult cast via unknown intermediate to satisfy Prisma InputJsonValue index signature requirement — plain interface types lack the string index signature Prisma's Json field requires; double-cast is safe since the object is fully serialisable"
  - "NARRATOR_SYSTEM_PROMPT requires exact section labels on their own lines, enforcing [PERCEIVED PERFORMANCE] / [TECHNICAL PERFORMANCE] distinction at the prompt level (AI-04 enforcement)"
  - "Zero-issues path writes a hardcoded narrative Result immediately, skipping both Stage 2 and Stage 3 API calls to eliminate unnecessary Gemini spend on clean pages"
metrics:
  duration: "12min"
  completed_date: "2026-05-26"
  tasks_completed: 2
  files_created: 3
  tests_added: 14
  tests_passing: 14
requirements_satisfied:
  - AI-03
  - AI-04
---

# Phase 3 Plan 04: Stage 3 Narrator + Pipeline Orchestrator Summary

**One-liner:** Gemini plain-text narration with section-marker parser separating perceived vs technical UX performance, wired into atomic Prisma transaction orchestrator.

---

## What Was Built

### Task 1: Stage 3 Narrator (TDD — RED/GREEN)

`crawler/src/pipeline/stage3-narrator.ts` exports:

- **`parseNarrativeOutput(text: string): NarrativeResult`** — pure parser that splits LLM text on `[SUMMARY]`, `[PERCEIVED PERFORMANCE]`, `[TECHNICAL PERFORMANCE]`, `[RECOMMENDATIONS]` section markers. Missing sections return empty string or empty array without throwing. Strips `- ` and `* ` bullet prefixes from recommendations.

- **`runStage3Narration(client, enrichedIssues, edges): Promise<NarrativeResult>`** — calls Gemini 2.0 Flash with a static `NARRATOR_SYSTEM_PROMPT` that explicitly requires both `[PERCEIVED PERFORMANCE]` and `[TECHNICAL PERFORMANCE]` labeled sections in the output. Uses plain text output (no function calling needed for narration). Returns `parseNarrativeOutput(text)`.

`crawler/src/pipeline/stage3-narrator.test.ts` has 14 passing tests covering:
- All 4 section markers parse into correct NarrativeResult fields
- Summary is trimmed; recommendations have bullet prefixes stripped
- Missing sections return empty string/array without throwing
- AI-04: perceivedPerformance and technicalPerformance are populated from distinct section markers
- AI-04: neither field bleeds into the other

### Task 2: Pipeline Orchestrator

`crawler/src/pipeline/run-pipeline.ts` exports `runAIPipeline(jobId, signals)`:

1. Stage 1: `scoreSignals(mobile, desktop)` — deterministic scoring, no LLM
2. Zero-issues short-circuit: if `scoredIssues.length === 0`, creates empty Result with hardcoded narrative and returns (skips both API calls)
3. Stage 2: `runStage2Reasoning(client, scoredIssues)` — Gemini function calling
4. Stage 3: `runStage3Narration(client, enrichedIssues, edges)` — Gemini plain text
5. `prisma.$transaction` atomic write: `result.create` with nested `issues: { create: [...] }` and `include: { issues: true }`, followed by `causalEdge.createMany` using the returned Issue IDs

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Prisma Json type compatibility for NarrativeResult**
- **Found during:** Task 2 TypeScript check
- **Issue:** `NarrativeResult` interface is not assignable to Prisma's `InputJsonValue` because TypeScript interfaces lack the `[key: string]: unknown` index signature required for JSON types. Direct cast failed; TypeScript required `unknown` intermediate.
- **Fix:** `narrative as unknown as Parameters<typeof tx.result.create>[0]['data']['narrative']` — double-cast through `unknown` is the standard TypeScript pattern for this. The object is fully serialisable so the cast is safe.
- **Files modified:** `crawler/src/pipeline/run-pipeline.ts`
- **Commit:** fe59372

---

## Known Stubs

None. All exported functions are fully implemented. `runStage3Narration` and `runAIPipeline` are production-ready (no TODOs, no placeholder returns).

---

## Threat Surface Scan

No new network endpoints introduced. Files stay within the existing crawl pipeline process.

| T-ID | Mitigated | How |
|------|-----------|-----|
| T-03-11 | Yes | `max_tokens` bounded by Gemini model default; Stage 3 called once per job |
| T-03-12 | Yes | `explanation: edge.explanation ?? ''` fallback prevents null constraint violation |
| T-03-13 | Yes | `prisma.$transaction` wraps result.create + causalEdge.createMany atomically |

---

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED (test) | 46993bc | `test(03-04): add failing tests for stage3-narrator parseNarrativeOutput` |
| GREEN (feat) | 33ed2f3 | `feat(03-04): implement stage3-narrator with parseNarrativeOutput and runStage3Narration` |

---

## Self-Check: PASSED

Files created:
- `crawler/src/pipeline/stage3-narrator.ts` — FOUND
- `crawler/src/pipeline/stage3-narrator.test.ts` — FOUND
- `crawler/src/pipeline/run-pipeline.ts` — FOUND

Commits:
- 46993bc — FOUND (RED test)
- 33ed2f3 — FOUND (GREEN narrator impl)
- fe59372 — FOUND (run-pipeline orchestrator)

`npm test -- --run crawler/src/pipeline/stage3-narrator.test.ts` — 14 tests PASSED

`cd crawler && npx tsc --noEmit` — EXIT 0 (no type errors)
