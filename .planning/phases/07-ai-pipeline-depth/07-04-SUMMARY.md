---
phase: 07-ai-pipeline-depth
plan: "04"
subsystem: ui
tags: [issue-card, fix-suggestion, severity-justification, ai-01, ai-02, results-page, conditional-rendering]

requires:
  - phase: 07-02
    provides: "fix_suggestion + severity_justification fields on EnrichedIssue and Prisma Issue model (@default(''))"

provides:
  - "IssueCard conditionally renders fix and impact rows for AI-enriched issue fields"
  - "results/[jobId]/page.tsx inline type widened to include fix_suggestion and severity_justification"

affects:
  - "Any component consuming IssueCardProps — now accepts optional fix_suggestion and severity_justification"

tech-stack:
  added: []
  patterns:
    - "Empty-string-falsy conditional rendering: {field && <row />} — backward compat with pre-Phase-7 DB rows that have @default('')"
    - "JSX text children (not dangerouslySetInnerHTML) for LLM-generated content — T-7-10 XSS mitigation"

key-files:
  created: []
  modified:
    - src/components/IssueCard.tsx
    - src/app/results/[jobId]/page.tsx

key-decisions:
  - "Optional fields (fix_suggestion?: string) on IssueCardProps — pre-Phase-7 DB rows have empty strings which are falsy, so rows are hidden without any explicit undefined check"
  - "Non-optional fields in results page inline type cast — Prisma Issue model post-07-02 migration has non-nullable String columns"
  - "Label words 'fix' and 'impact' follow existing 'signal'/'evidence' convention: short, lowercase, select-none prefix span"

patterns-established:
  - "Conditional row pattern: {issue.field && (<p className='text-xs font-mono text-slate-500'>...)} — reuse for future evidence block extensions"

requirements-completed: [AI-01, AI-02]

duration: 8min
completed: 2026-05-28
---

# Phase 7 Plan 04: AI Pipeline Depth — UI Display Summary

**IssueCard extended with conditional fix and impact rows that display AI-01/AI-02 enrichment fields from Stage 2, with backward-compatible empty-string suppression for pre-Phase-7 rows**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-28T10:40:00Z
- **Completed:** 2026-05-28T10:48:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Extended `IssueCardProps` with `fix_suggestion?: string` and `severity_justification?: string` optional fields
- Added conditional `fix` and `impact` rows in IssueCard evidence block — empty string is falsy so pre-Phase-7 rows render unchanged
- Widened `results/[jobId]/page.tsx` inline type annotation to include non-optional `fix_suggestion: string` and `severity_justification: string` matching Prisma's post-07-02-migration Issue shape
- All 178 tests continue to pass; TypeScript shows no errors on the modified files

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend IssueCard with fix_suggestion and severity_justification display** - `94c98ee` (feat)

**Plan metadata:** (docs commit follows this SUMMARY write)

## Files Created/Modified

- `src/components/IssueCard.tsx` - IssueCardProps extended with two optional fields; two conditional rows added to evidence block after existing `evidence` row
- `src/app/results/[jobId]/page.tsx` - Inline type annotation for `result.issues.map` extended with `fix_suggestion: string` and `severity_justification: string`

## Decisions Made

- Optional fields on `IssueCardProps` (`fix_suggestion?: string`) so the component remains usable even when the DB rows predate Phase 7 and the fields are undefined. Empty string (the `@default('')` migration value) is falsy in JS, so the conditional `{issue.fix_suggestion && ...}` suppresses the row without an explicit `!== ""` check.
- Non-optional (`string`) on the results page inline type cast because after the Plan 07-02 migration the Prisma-generated type has them as `String` (non-nullable). Using optional here would widen the type unnecessarily and hide future mismatches.
- XSS mitigation: both fields rendered as JSX text children per T-7-10 — React auto-escapes content, no `dangerouslySetInnerHTML` surface.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

The `npm run build` and `npm run typecheck` commands fail in the worktree environment due to pre-existing missing generated artifacts (`src/generated/prisma` — gitignored Prisma client output, `crawler/node_modules` packages). Neither failure is caused by this plan's changes — `grep` and targeted typecheck output confirmed zero errors in `IssueCard.tsx` and `results/[jobId]/page.tsx`. All 178 tests pass.

## User Setup Required

None — no external service configuration required. Changes are UI-only and take effect on next deploy once the 07-02 migration has run on the Neon DB.

## Next Phase Readiness

- AI-01 and AI-02 requirements fully satisfied: enrichment fields flow from Stage 2 Groq output → Prisma Issue model → results page → IssueCard conditional rows
- Phase 7 Wave 3 complete — all four plans (07-01 through 07-04) are done
- Visual spot-check: after a live job run with Groq inference, open `/results/[jobId]` and confirm `fix` and `impact` rows appear in each issue card that has AI enrichment

---
*Phase: 07-ai-pipeline-depth*
*Completed: 2026-05-28*
