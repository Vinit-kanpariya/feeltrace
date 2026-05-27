---
phase: 05-tech-debt-and-foundation
plan: 01
subsystem: infra
tags: [typescript, npm, crawler, types, dead-code-removal]

# Dependency graph
requires: []
provides:
  - "crawler/src/lib/gemini.ts deleted — Gemini dead code removed"
  - "crawler/package.json without @google/generative-ai — 5 MB+ dead dependency removed"
  - "crawler TechProfile.database, .auth, .payments, .services are optional (?) — matches app types"
affects: [06-core-web-vitals, 07-accessibility, 08-multi-page-crawl]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TechProfile optionality contract: backend fields (database/auth/payments/services) are optional in both crawler and app TechProfile interfaces"

key-files:
  created: []
  modified:
    - crawler/src/lib/types.ts
    - crawler/package.json
    - crawler/package-lock.json

key-decisions:
  - "Pre-existing tsc errors in prisma.ts and run-pipeline.ts are out-of-scope — they existed before this plan and require prisma generate / a separate fix; documented as deferred"

patterns-established:
  - "Optional backend fields in TechProfile: database?, auth?, payments?, services? — crawler and app agree on this contract going forward"

requirements-completed: [DEBT-01, DEBT-03]

# Metrics
duration: 16min
completed: 2026-05-27
---

# Phase 5 Plan 01: Tech Debt — Gemini Removal and TechProfile Type Alignment Summary

**Deleted dead Gemini LLM integration (gemini.ts + @google/generative-ai) and aligned TechProfile backend fields to optional (?) in crawler to match the app's existing interface contract**

## Performance

- **Duration:** 16 min
- **Started:** 2026-05-27T09:01:00Z
- **Completed:** 2026-05-27T09:16:44Z
- **Tasks:** 2
- **Files modified:** 3 (crawler/src/lib/types.ts, crawler/package.json, crawler/package-lock.json) + 1 deleted (crawler/src/lib/gemini.ts)

## Accomplishments
- Deleted crawler/src/lib/gemini.ts — the dead Gemini client singleton that was never called after the Groq migration in v1.0
- Removed @google/generative-ai: ^0.24.1 from crawler/package.json, eliminating a 5 MB+ unused dependency and reducing the attack surface; ran sfw npm install to update the lock file
- Made TechProfile.database, .auth, .payments, .services optional (?) in crawler/src/lib/types.ts, aligning the crawler's type contract with src/types/tech.ts in the Next.js app

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete gemini.ts and remove @google/generative-ai dependency** - `4f98306` (feat)
2. **Task 2: Make TechProfile backend fields optional in crawler types** - `7be2cfc` (feat)

**Plan metadata:** (to be committed with this SUMMARY)

## Files Created/Modified
- `crawler/src/lib/gemini.ts` - DELETED — Gemini client singleton, dead code since v1.0 Groq migration
- `crawler/package.json` - Removed @google/generative-ai dependency entry
- `crawler/package-lock.json` - Updated by sfw npm install after dependency removal
- `crawler/src/lib/types.ts` - Added ? to database, auth, payments, services in TechProfile interface

## Decisions Made
- Pre-existing TypeScript errors in crawler/src/lib/prisma.ts (TS2307: cannot find module '../generated/prisma') and crawler/src/pipeline/run-pipeline.ts (TS7006, TS2339) are out-of-scope for this plan. They exist because prisma generate has not been run to produce the generated client types. These were present before this plan's changes and are deferred to a dedicated fix.

## Deviations from Plan

None — plan executed exactly as written. The sfw npm install succeeded, both files were modified/deleted as specified, and all acceptance criteria were verified.

The tsc verification produced pre-existing errors unrelated to this plan's changes (confirmed by reverting the edit via git stash and seeing identical errors). These are documented as deferred items.

## Issues Encountered
- `cd crawler && npx tsc --noEmit` exits with code 2 due to 3 pre-existing errors in prisma.ts and run-pipeline.ts. These errors exist before this plan's changes (verified by stash-reverting and re-running tsc). They require `prisma generate` to fix the missing generated client module. Out of scope for DEBT-01/DEBT-03.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Gemini dead code and dependency fully removed; crawler install is cleaner
- TechProfile interfaces now agree on optionality across both packages — type friction eliminated
- Remaining tech debt items (error pages, RAILWAY_CRAWLER_URL startup validation) are addressed in plan 02
- No blockers for subsequent phases

---
*Phase: 05-tech-debt-and-foundation*
*Completed: 2026-05-27*
