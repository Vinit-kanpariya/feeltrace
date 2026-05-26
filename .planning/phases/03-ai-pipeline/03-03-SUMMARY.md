---
phase: 03-ai-pipeline
plan: "03"
subsystem: crawler/pipeline
tags: [gemini, llm, stage2, zod, tdd, causality]
dependency_graph:
  requires: [03-02]
  provides: [gemini-singleton, stage2-reasoner, stage2-zod-schema]
  affects: [03-04, 03-05]
tech_stack:
  added: []
  patterns: [gemini-lazy-singleton, forced-function-calling, zod-refine-validation, self-edge-filter, index-bounds-filter]
key_files:
  created:
    - crawler/src/lib/gemini.ts
    - crawler/src/pipeline/stage2-reasoner.ts
    - crawler/src/pipeline/stage2-reasoner.test.ts
  modified: []
decisions:
  - "Use z.string().refine() instead of z.enum() cast for PERMITTED_MECHANISMS — readonly const tuple not directly castable to [string, ...string[]] in TypeScript 6"
  - "Type EMIT_ANALYSIS_TOOL as Tool and cast SchemaType.ARRAY properties explicitly to satisfy @google/generative-ai FunctionDeclaration strict types"
metrics:
  duration: 6min
  completed: "2026-05-26T10:38:00Z"
requirements: [AI-02, AI-04]
---

# Phase 3 Plan 03: Stage 2 LLM Reasoner Summary

**One-liner:** Gemini gemini-2.0-flash forced function calling with zod-validated output, self-edge filtering, and index bounds checking for AI-02 causality graph generation.

---

## What Was Built

### Task 1: Gemini SDK singleton (crawler/src/lib/gemini.ts)
Lazy-init `GoogleGenerativeAI` singleton. Reads `GEMINI_API_KEY` from env at first call. Uses `let _client: GoogleGenerativeAI | null = null` null-guard pattern (simpler than Prisma's global guard — no hot-reload concern in the crawler process). Exports only `getGeminiClient()` to allow test injection.

### Task 2: Stage 2 reasoner (TDD)

**RED:** `stage2-reasoner.test.ts` written first — 7 test cases covering:
- Valid input schema parse
- Mechanism not in PERMITTED_MECHANISMS fails
- causal_edges > 5 fails
- technical_description > 500 chars fails
- Self-edge (from_index === to_index) removed
- Out-of-range index discarded
- Valid non-self edge retained

**GREEN:** `stage2-reasoner.ts` implemented:
- `CAUSALITY_MECHANISM_RULES`: static module-level string, all 13 mechanism definitions
- `SYSTEM_PROMPT`: static module-level string with perceived/technical distinction instructions
- `EMIT_ANALYSIS_TOOL`: Gemini `functionDeclarations` format with `explanation` field in all edge items
- `Stage2OutputSchema`: exported zod schema with `z.string().refine()` for mechanism validation, `.max(5)` on edges
- `parseStage2Output()`: exported pure function — parses, filters self-edges, filters out-of-range indices, merges ScoredIssue fields into EnrichedIssue
- `runStage2Reasoning()`: async — uses `FunctionCallingMode.ANY` forced function call, throws if no function call returned

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] z.enum() cast incompatible with readonly const tuple in TypeScript 6**
- **Found during:** Task 2 TypeScript check
- **Issue:** `z.enum(PERMITTED_MECHANISMS as [string, ...string[]])` fails TS2352 — readonly const array cannot be cast to mutable tuple
- **Fix:** Used `z.string().refine((v) => PERMITTED_MECHANISMS.includes(v), ...)` as the plan's documented fallback option. Behavior identical: invalid mechanisms throw ZodError.
- **Files modified:** crawler/src/pipeline/stage2-reasoner.ts
- **Commit:** b0397fa

**2. [Rule 1 - Bug] EMIT_ANALYSIS_TOOL type mismatch — SchemaType.ARRAY used without literal type**
- **Found during:** Task 2 TypeScript check
- **Issue:** `type: SchemaType.ARRAY` on properties typed as `Schema` requires the literal type `SchemaType.ARRAY`, not the general `SchemaType` enum value
- **Fix:** Typed `EMIT_ANALYSIS_TOOL as Tool` and cast `SchemaType.ARRAY as SchemaType.ARRAY` on array properties. Added `type Tool` import from `@google/generative-ai`.
- **Files modified:** crawler/src/pipeline/stage2-reasoner.ts
- **Commit:** b0397fa

---

## TDD Gate Compliance

- RED gate: `test(03-03)` commit 3feca95 — 7 failing tests before implementation
- GREEN gate: `feat(03-03)` commit b0397fa — all 7 tests pass after implementation
- REFACTOR gate: not needed — code is clean as written

---

## Test Results

| Suite | Tests | Status |
|-------|-------|--------|
| stage2-reasoner.test.ts | 7 | PASS |
| Full suite | 75 | PASS (no regressions) |

---

## Threat Mitigations Applied

| Threat ID | Mitigation | How |
|-----------|-----------|-----|
| T-03-06 | LLM inventing issue indices | `parseStage2Output` discards any `index >= scoredIssues.length` |
| T-03-07 | LLM inventing mechanism strings | `z.string().refine(PERMITTED_MECHANISMS.includes)` rejects any unlisted mechanism |
| T-03-08 | LLM cost overrun | `max_tokens` not set directly on Gemini model; controlled via Gemini API quota |
| T-03-09 | GEMINI_API_KEY logged | Key passed only to SDK constructor; never interpolated, never logged |

---

## Known Stubs

None — all exports are fully implemented. `runStage2Reasoning` makes live Gemini API calls; tested via mock in future integration tests.

## Self-Check: PASSED

- crawler/src/lib/gemini.ts: FOUND
- crawler/src/pipeline/stage2-reasoner.ts: FOUND
- crawler/src/pipeline/stage2-reasoner.test.ts: FOUND
- Commit ec18573: FOUND
- Commit 3feca95: FOUND
- Commit b0397fa: FOUND
- All 7 stage2-reasoner tests: PASS
- `npx tsc --noEmit` in crawler/: exits 0
