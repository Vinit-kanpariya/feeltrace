---
phase: 01-data-foundation-and-security-baseline
plan: "04"
subsystem: database
tags: [prisma, neon, postgresql, prisma-client, schema-push]

# Dependency graph
requires:
  - phase: 01-data-foundation-and-security-baseline/01-03
    provides: "Prisma schema (Job, Result, Issue, CausalEdge) and prisma.config.ts with DIRECT_URL"
provides:
  - "Prisma TypeScript client generated at src/generated/prisma/ (gitignored, regenerated on deploy)"
  - "Neon PostgreSQL schema applied: Job, Result, Issue, CausalEdge tables + JobStatus enum"
  - "TypeScript module resolution working — no 'Cannot find module' errors"
affects:
  - 01-05
  - 01-06
  - all subsequent phases that import from @/lib/prisma

# Tech tracking
tech-stack:
  added:
    - "@prisma/client@7.8.0 (runtime companion required by Prisma 7 prisma-client-js generator)"
  patterns:
    - "Prisma 7 generate with custom output to src/generated/prisma/ (gitignored, must set DIRECT_URL env var for prisma.config.ts to load)"
    - "dotenv/config in prisma.config.ts loads .env not .env.local — DIRECT_URL must be passed explicitly when running CLI commands"

key-files:
  created:
    - "src/generated/prisma/ (gitignored — regenerated on each deploy via prisma generate)"
  modified:
    - "package.json — added @prisma/client@^7.8.0 dependency"
    - "package-lock.json — updated lockfile"

key-decisions:
  - "@prisma/client@7.8.0 added as explicit dependency — Prisma 7 prisma-client-js generator requires it even with custom output path"
  - "src/generated/prisma/ remains gitignored — regenerated on deploy; no force-add needed"
  - "DIRECT_URL must be passed as env var when running Prisma CLI because dotenv/config loads .env not .env.local"

patterns-established:
  - "Pattern: Run prisma CLI with DIRECT_URL env var set inline — e.g. DIRECT_URL=... npx prisma generate"
  - "Pattern: prisma generate must be run before any typecheck or build that imports from @/lib/prisma"

requirements-completed:
  - INFRA-03

# Metrics
duration: 7min
completed: 2026-05-22
---

# Phase 1 Plan 04: Generate Prisma Client and Push Schema to Neon Summary

**Prisma 7 client generated at src/generated/prisma/ and Job/Result/Issue/CausalEdge schema applied to Neon PostgreSQL with JobStatus enum**

## Performance

- **Duration:** 7 min
- **Started:** 2026-05-22T03:46:34Z
- **Completed:** 2026-05-22T03:53:14Z
- **Tasks:** 1
- **Files modified:** 2 (package.json, package-lock.json)

## Accomplishments

- Generated Prisma TypeScript client to `src/generated/prisma/` using `npx prisma generate`
- Applied schema to Neon PostgreSQL — created Job, Result, Issue, CausalEdge tables and JobStatus enum
- TypeScript typecheck passes (exit 0) — the `Cannot find module '../generated/prisma'` error is fully resolved
- Identified and auto-fixed missing `@prisma/client` dependency (Rule 3 — blocking issue)

## Task Commits

Each task was committed atomically:

1. **Task 1: Generate Prisma client and push schema to Neon** - `c3928a8` (feat)

**Plan metadata:** (final commit below)

## Files Created/Modified

- `src/generated/prisma/` - Prisma TypeScript client (gitignored, regenerated on deploy — includes index.d.ts, client.d.ts, edge.d.ts, runtime/)
- `package.json` - Added @prisma/client@^7.8.0 dependency
- `package-lock.json` - Updated lockfile with @prisma/client and its transitive deps

## Decisions Made

- `@prisma/client` added as explicit runtime dependency (not just dev) — required by Prisma 7's prisma-client-js generator even when using a custom output path
- `src/generated/prisma/` remains gitignored per `.gitignore` (`src/generated/`) — no force-add; consistent with standard Prisma 7 deployment pattern (regenerate on each deploy)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing @prisma/client dependency**
- **Found during:** Task 1 (prisma generate)
- **Issue:** `npx prisma generate` failed with "Could not resolve @prisma/client" — the package was not in package.json despite being required by Prisma 7's prisma-client-js generator. Package was in RESEARCH.md as "Required companion to prisma" but was not included in the Plan 01-01/01-03 installs.
- **Fix:** Ran `sfw npm install @prisma/client@^7.8.0` — package is first-party Prisma (github.com/prisma/prisma), verified legitimate in RESEARCH.md package audit
- **Files modified:** package.json, package-lock.json
- **Verification:** `npx prisma generate` succeeded after install; `npm run typecheck` exits 0
- **Committed in:** c3928a8 (Task 1 commit)

**2. [Rule 3 - Blocking] DIRECT_URL env var must be passed explicitly to Prisma CLI**
- **Found during:** Task 1 (first prisma generate attempt)
- **Issue:** `prisma.config.ts` uses `import 'dotenv/config'` which loads `.env`, not `.env.local`. Project only has `.env.local`. The CLI failed with `PrismaConfigEnvError: Cannot resolve environment variable: DIRECT_URL`.
- **Fix:** Passed `DIRECT_URL` as inline env var: `DIRECT_URL=... npx prisma generate`. No file changes needed — this is a CLI invocation pattern, not a code fix.
- **Files modified:** None
- **Verification:** CLI loaded config successfully after passing env var inline
- **Committed in:** Not a file change — documented as operational pattern

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both required for basic operation. No scope creep. @prisma/client was listed in RESEARCH.md standard stack but missed from install commands.

## Issues Encountered

- `dotenv/config` in `prisma.config.ts` loads `.env` not `.env.local` — this is a permanent operational constraint. Any CI/CD pipeline or deployment script that runs `prisma generate` or `prisma db push` must have `DIRECT_URL` set as an environment variable (not rely on `.env.local` file loading). This is expected behavior for Prisma CLI and is not a bug.

## Known Stubs

None — this plan creates no application code, only generates the DB client and applies the schema.

## User Setup Required

None for this plan — credentials were already in `.env.local`.

**Note for CI/CD:** When adding `prisma generate` to a build script or deployment pipeline, `DIRECT_URL` must be set as an environment variable (not sourced from `.env.local`). Add it to Vercel's environment variable settings.

## Next Phase Readiness

- All four database tables (Job, Result, Issue, CausalEdge) and JobStatus enum are live in Neon
- Prisma TypeScript client is generated — `import { prisma } from '@/lib/prisma'` works without TypeScript errors
- Plans 01-05 and 01-06 can now write DB queries against the generated client
- No blockers for next phase

---
*Phase: 01-data-foundation-and-security-baseline*
*Completed: 2026-05-22*

## Self-Check: PASSED

- FOUND: src/generated/prisma/index.d.ts
- FOUND: commit c3928a8
- FOUND: 01-04-SUMMARY.md
