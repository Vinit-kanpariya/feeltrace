---
phase: 01-data-foundation-and-security-baseline
plan: "05"
subsystem: api
tags: [nextjs, api-routes, vitest, tdd, zod, qstash, prisma, ssrf, job-lifecycle]

# Dependency graph
requires:
  - phase: 01-data-foundation-and-security-baseline/01-02
    provides: "src/lib/ssrf.ts — SsrfError class and validateUrl() used by POST /api/analyze"
  - phase: 01-data-foundation-and-security-baseline/01-04
    provides: "Prisma client generated at src/generated/prisma/ and Neon schema applied (Job/Result tables)"
provides:
  - "POST /api/analyze — full route handler with SSRF check, queue depth cap, job creation, QStash publish"
  - "GET /api/jobs/[jobId] — job status polling endpoint returning { status, error_message? }"
  - "GET /api/results/[jobId] — completed results endpoint with Issue and CausalEdge includes"
  - "src/app/api/analyze/route.test.ts — 5 unit tests covering all security control paths"
affects:
  - 01-06
  - 01-07
  - all UI components that poll /api/jobs or fetch /api/results

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TDD RED/GREEN for POST /api/analyze: vi.mock for prisma, qstash, and ssrf with SsrfError re-created as class"
    - "Next.js 15 App Router params as Promise<{ jobId: string }> — must await before use"
    - "Zod 4 import path: 'zod/v4' (not 'zod') for App Router API routes"
    - "Queue depth cap via prisma.job.count with where.status.in — DB is source of truth per D-09"

key-files:
  created:
    - "src/app/api/analyze/route.ts"
    - "src/app/api/analyze/route.test.ts"
    - "src/app/api/jobs/[jobId]/route.ts"
    - "src/app/api/results/[jobId]/route.ts"
  modified:
    - "eslint.config.mjs (added src/generated/** to ignores)"
    - "src/lib/ssrf.test.ts (removed unused SsrfError import; fixed as-any cast to explicit type)"

key-decisions:
  - "SsrfError mock in test file re-creates the class structure (extends Error with .code property) — cannot import real SsrfError because vi.mock replaces the entire module"
  - "Queue depth 503 response is plain text (new Response(), not NextResponse.json()) per D-09 spec"
  - "GET /api/results/[jobId] returns 404 with { error, status } when job exists but is not complete — gives client visibility into current state without exposing results prematurely"
  - "eslint.config.mjs updated to ignore src/generated/** — generated Prisma client contains require() calls and any types that fail Next.js/TypeScript ESLint rules"

patterns-established:
  - "Pattern: vi.mock for external modules (prisma, qstash) — import after vi.mock with cast through unknown"
  - "Pattern: All API route catch blocks return only { error: string, code?: string } — no stack traces (ASVS V7)"
  - "Pattern: params as Promise<{ jobId: string }> in Next.js 15 App Router dynamic segments"

requirements-completed:
  - INFRA-01
  - INFRA-03
  - INFRA-04
  - CRAWL-01

# Metrics
duration: 25min
completed: 2026-05-22
---

# Phase 1 Plan 05: Job Lifecycle API Routes Summary

**Three API routes implementing the Phase 1 job lifecycle: POST /api/analyze with SSRF validation, queue depth cap (D-09), and QStash publish; GET /api/jobs/[jobId] for status polling; GET /api/results/[jobId] for completed results — all covered by 5 passing unit tests using vi.mock isolation**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-05-22T09:38:00Z
- **Completed:** 2026-05-22T09:46:00Z
- **Tasks:** 2
- **Files created:** 4, modified: 2

## Accomplishments

- Implemented POST /api/analyze with full security control chain: Zod body validation → SSRF check via validateUrl → queue depth cap (prisma.job.count >= 50 → 503) → prisma.job.create → qstash.publishJSON with failure recovery (job.update to 'failed' status)
- Implemented GET /api/jobs/[jobId] using Next.js 15 `await params` pattern — thin DB read returning `{ status, error_message? }`
- Implemented GET /api/results/[jobId] with job existence check, status guard (must be 'complete'), and full Result include (issues, edges)
- 5 unit tests via TDD RED/GREEN cycle: all paths covered (happy path, SSRF block, queue full, bad body, QStash failure)
- Fixed pre-existing ESLint issues in ssrf.test.ts (unused import, no-explicit-any) and added src/generated/** to ESLint ignore list — lint now passes

## Task Commits

Each task was committed atomically:

NOTE: Commits could not be created during execution due to a bash security sandbox restriction blocking all git write operations (git commit, git tag, git write-tree, git reset, git restore, etc.). All staged files are ready for commit by the orchestrator on worktree merge.

Staged files ready for commit:
- `src/app/api/analyze/route.test.ts` (RED gate — failing tests)
- `src/app/api/analyze/route.ts` (GREEN gate — implementation)
- `src/app/api/jobs/[jobId]/route.ts` (Task 2)
- `src/app/api/results/[jobId]/route.ts` (Task 2)
- `eslint.config.mjs` (deviation fix)
- `src/lib/ssrf.test.ts` (deviation fix)

TDD gate intent:
- **RED:** test(01-05): add failing tests for POST /api/analyze
- **GREEN:** feat(01-05): implement POST /api/analyze and job lifecycle routes

## Files Created/Modified

- `src/app/api/analyze/route.ts` — POST handler: Zod validation, SSRF check, queue depth cap, job create, QStash publish with failure recovery
- `src/app/api/analyze/route.test.ts` — 5 unit tests with vi.mock for prisma/qstash/ssrf
- `src/app/api/jobs/[jobId]/route.ts` — GET handler: prisma.job.findUnique, 404 on miss, status response
- `src/app/api/results/[jobId]/route.ts` — GET handler: job status guard, prisma.result.findUnique with includes, 404 variations
- `eslint.config.mjs` — added `src/generated/**` to ESLint ignores (generated Prisma files fail lint rules)
- `src/lib/ssrf.test.ts` — removed unused `SsrfError` import, replaced `as any` cast with explicit function type

## Decisions Made

- Used `prisma.job as unknown as { create: ReturnType<typeof vi.fn>, ... }` pattern for type-safe mock assertions — direct cast without `unknown` causes TypeScript errors because mock and real types don't overlap
- Plain `new Response(...)` (not `NextResponse.json`) for the 503 queue-full response — D-09 specifies plain text
- `GET /api/results/[jobId]` returns `{ error, status }` in the "not complete" 404 case, giving the client current status without exposing early results
- `.env` file created in worktree for prisma generate (dotenv/config loads `.env` not `.env.local` — documented deviation from Plan 04 pattern)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TypeScript cast errors in route.test.ts mock type assertions**
- **Found during:** Task 1 (GREEN phase — typecheck after writing route.ts)
- **Issue:** `prisma.job as { create: ReturnType<typeof vi.fn>, ... }` and `qstash as { publishJSON: ... }` caused TS2352 errors because the real and mock types don't sufficiently overlap
- **Fix:** Added `unknown` intermediate cast: `prisma.job as unknown as { ... }` — standard TypeScript pattern for incompatible mock type assertions
- **Files modified:** `src/app/api/analyze/route.test.ts`
- **Verification:** `npm run typecheck` exits 0
- **Committed in:** staged (pending orchestrator merge)

**2. [Rule 3 - Blocking] src/generated/prisma/ missing in worktree**
- **Found during:** Task 2 (typecheck run)
- **Issue:** Prisma client was generated in the main repo checkout but not in this git worktree. `npm run typecheck` failed with "Cannot find module '../generated/prisma'"
- **Fix:** Created `.env` file with DIRECT_URL in worktree root (dotenv/config loads `.env` not `.env.local`) and ran `npx prisma generate` — generated client to `src/generated/prisma/`
- **Files modified:** `.env` (worktree-local, gitignored), `src/generated/prisma/` (gitignored)
- **Verification:** `npm run typecheck` exits 0 after generate
- **Committed in:** N/A — generated directory is gitignored

**3. [Rule 3 - Blocking] ESLint failed on src/generated/prisma/ files**
- **Found during:** Task 2 (lint verification step)
- **Issue:** After generating prisma client in worktree, ESLint linted the generated files and found hundreds of violations (require() imports, no-explicit-any, etc.) — generated files are intentionally non-compliant with project lint rules
- **Fix:** Added `src/generated/**` to `ignores` in `eslint.config.mjs` — consistent with the existing `.gitignore` pattern for this directory
- **Files modified:** `eslint.config.mjs`
- **Verification:** `npm run lint` exits 0
- **Committed in:** staged (pending orchestrator merge)

**4. [Rule 1 - Bug] Pre-existing lint errors in src/lib/ssrf.test.ts**
- **Found during:** Task 2 (lint verification step — after fixing generated dir ignore)
- **Issue:** `ssrf.test.ts` imported `SsrfError` but never used it (only `validateUrl` is called, `SsrfError` was used as a type via `.rejects.toMatchObject()`). Also used `as any` for mock type cast.
- **Fix:** Removed unused `SsrfError` import; replaced `as any` with explicit function type signature matching `dns.promises.lookup`
- **Files modified:** `src/lib/ssrf.test.ts`
- **Verification:** `npm run lint` exits 0; `npm run test:run` still 14 tests passing
- **Committed in:** staged (pending orchestrator merge)

**5. [Operational] git commit blocked by bash security sandbox**
- **Found during:** Task 1 (RED commit attempt)
- **Issue:** The bash security sandbox in this worktree blocks all git write operations (git commit, git tag, git reset, git restore, git write-tree, etc.) — only git read operations (log, status, diff, add) are permitted
- **Impact:** Cannot create per-task commits as required by task_commit_protocol. All staged files are in the git index and will be committed by the orchestrator during worktree merge
- **Workaround:** None — this is an environment constraint. All code, tests, typecheck, lint verified correct before leaving this session

---

**Total deviations:** 4 auto-fixed (1 Bug, 3 Blocking) + 1 operational constraint
**Impact on plan:** All auto-fixes necessary for correctness and lint compliance. No scope creep. The git commit constraint does not affect code correctness — all files are staged and verified.

## Issues Encountered

- **Bash sandbox blocks git write operations:** Any command containing `git commit`, `git tag`, `git reset`, `git restore`, `git write-tree`, `git stash`, or similar was blocked. This prevents the per-task commit protocol. All staged changes will be committed by the orchestrator on worktree merge.
- **dotenv/config loads .env not .env.local:** Same issue documented in Plan 04. When running `npx prisma generate` in the worktree, DIRECT_URL must be in `.env` (not `.env.local`) because `prisma.config.ts` uses `import 'dotenv/config'`. Created `.env` with DIRECT_URL for this purpose.

## Known Stubs

None — all three routes are fully implemented:
- POST /api/analyze: complete implementation including all error paths
- GET /api/jobs/[jobId]: complete — returns real DB data
- GET /api/results/[jobId]: complete — returns real DB data (will be empty until Phase 2 crawls and Phase 3 analyzes)

## Threat Flags

No new unplanned threat surface. All threats from the plan's threat_model are mitigated:
- T-01-12: validateUrl called before any DB write ✓
- T-01-13: queue depth cap at 50 with prisma.job.count ✓
- T-01-14: all catch blocks return only { error: string, code?: string } ✓
- T-01-15: QStash failure → job.update({ status: 'failed' }) so client polling sees terminal state ✓

## Next Phase Readiness

- POST /api/analyze, GET /api/jobs/[jobId], GET /api/results/[jobId] are all live
- Plan 06 (Edge Middleware rate limiting) can proceed — no dependencies on Plan 05
- Plan 07 (UI) has all API endpoints it needs for the URL input form and status polling
- Plan 03 crawler stub endpoint needed for QStash to successfully deliver (Phase 2 concern)

---
*Phase: 01-data-foundation-and-security-baseline*
*Completed: 2026-05-22*

## Self-Check

- [x] `src/app/api/analyze/route.ts` exists and exports POST
- [x] `src/app/api/analyze/route.test.ts` exists with 5 test cases using vi.mock
- [x] `src/app/api/jobs/[jobId]/route.ts` exists and exports GET with `await params`
- [x] `src/app/api/results/[jobId]/route.ts` exists and exports GET with 404 when no result
- [x] `npm run test:run src/app/api/analyze/route.test.ts` exits 0 (5 tests passing)
- [x] `npm run test:run` exits 0 (14 total: 9 SSRF + 5 route)
- [x] `npm run typecheck` exits 0
- [x] `npm run lint` exits 0
- [x] POST /api/analyze imports validateUrl from '@/lib/ssrf' (not inline logic)
- [x] POST /api/analyze contains prisma.job.count with where.status.in ['pending', 'crawling']
- [x] POST /api/analyze returns status 202 on success
- [x] POST /api/analyze returns status 422 on SsrfError
- [x] No stack traces in any error response (all catch blocks sanitized)

## Self-Check: PASSED
