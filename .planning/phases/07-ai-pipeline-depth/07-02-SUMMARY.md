---
phase: 07-ai-pipeline-depth
plan: "02"
subsystem: crawler/pipeline + prisma
tags: [stage2, enrichment, fix-suggestion, severity-justification, ai-01, ai-02, tdd]
dependency_graph:
  requires:
    - "03-03: Stage 2 reasoner (stage2-reasoner.ts, types.ts, EnrichedIssue interface)"
    - "01-04: Prisma schema + Neon DB (prisma/schema.prisma, Issue model)"
  provides:
    - "fix_suggestion field on EnrichedIssue: specific imperative action, max 300 chars, anti-advisory Zod refine"
    - "severity_justification field on EnrichedIssue: business-impact estimation, max 300 chars"
    - "Prisma Issue model: fix_suggestion + severity_justification columns with @default('')"
  affects:
    - "crawler/src/pipeline/types.ts: EnrichedIssue interface extended with two new fields"
    - "crawler/src/pipeline/stage2-reasoner.ts: Stage2OutputSchema, parseStage2Output, SYSTEM_PROMPT, max_tokens 4096"
    - "prisma/schema.prisma: Issue model extended with fix_suggestion and severity_justification"
tech_stack:
  added: []
  patterns:
    - "Zod .refine() check: rejects advisory language prefixes (Consider/You might/You could/Try to/It is recommended)"
    - "@default('') on Prisma columns: migration-safe backward compatibility for pre-Phase-7 rows"
    - "max_tokens bump 2048→4096: accommodates additional JSON fields in Stage 2 output"
key_files:
  created: []
  modified:
    - crawler/src/pipeline/types.ts
    - crawler/src/pipeline/stage2-reasoner.ts
    - crawler/src/pipeline/stage2-reasoner.test.ts
    - prisma/schema.prisma
status: complete
self_check: PASSED
---

## What Was Built

Extended Stage 2 (the LLM reasoning stage) with two new enrichment fields that satisfy requirements AI-01 and AI-02:

- **`fix_suggestion`** — A specific, imperative implementation action (e.g. "Add `aria-label` to the submit button"). Validated by a Zod `.refine()` that rejects advisory language starting with "Consider", "You might", "You could", "Try to", or "It is recommended". Max 300 chars.
- **`severity_justification`** — A business-impact statement explaining why the issue matters in user terms. Max 300 chars.

Both fields are emitted by the Groq LLM through the `EMIT_ANALYSIS_TOOL` definition, propagated through `parseStage2Output`, and persisted to the Neon DB via two new Prisma `Issue` model columns with `@default('')` for migration safety.

## Tasks Completed

| # | Task | Commit | Status |
|---|------|--------|--------|
| 1 | TDD RED: failing tests for both new fields (6 test cases) | 087ac12 | ✓ |
| 2 | Extend types.ts + stage2-reasoner.ts (schema, prompt, parser) | 2ff50f9 | ✓ |
| 3 | Extend Prisma Issue model + db:push to Neon | 7e4409c | ✓ |

## Must-Have Verification

| Truth | Status |
|-------|--------|
| Every EnrichedIssue has fix_suggestion (specific imperative action) | ✓ |
| Every EnrichedIssue has severity_justification (business impact) | ✓ |
| Stage 2 Zod schema validates both fields as required, max 300 chars | ✓ |
| fix_suggestion Zod .refine() rejects advisory language prefixes | ✓ |

## Deviations

None. All must-haves satisfied as planned. `crawler/prisma/schema.prisma` uses the same `@default('')` pattern as `prisma/schema.prisma` — both schemas kept in sync manually as the plan specifies.

## Self-Check

- [x] Types compile clean (EnrichedIssue interface extended)
- [x] Zod schema validates new fields with correct constraints
- [x] Prisma schema updated + db:push executed (Neon has new columns)
- [x] Tests updated to include new required fields in valid fixture objects
