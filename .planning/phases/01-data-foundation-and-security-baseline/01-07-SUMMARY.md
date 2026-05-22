---
phase: 01-data-foundation-and-security-baseline
plan: "07"
subsystem: ui
tags: [client-components, polling, form, dashboard, next-app-router]

# Dependency graph
requires:
  - phase: 01-data-foundation-and-security-baseline/01-05
    provides: "POST /api/analyze, GET /api/jobs/[jobId], GET /api/results/[jobId] routes"
  - phase: 01-data-foundation-and-security-baseline/01-06
    provides: "Edge Middleware rate limiting — upstream of POST /api/analyze"
provides:
  - "src/components/AnalyzeForm.tsx — 'use client' URL input form with inline error handling for all 4 error codes"
  - "src/components/JobStatusBadge.tsx — 'use client' polling badge with setInterval(2000ms) and clearInterval cleanup"
  - "src/app/(dashboard)/page.tsx — Server Component main page serving at /"
affects:
  - 01-08

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "'use client' must be the first line (not a comment) on polling/interactive components"
    - "Route group (dashboard) in Next.js App Router — parenthesized folder name does not appear in URL"
    - "Server Component page delegates interactivity to 'use client' leaf components"
    - "useEffect returns clearInterval cleanup; also calls clearInterval inline on terminal status"
    - "result state typed as Record<string, unknown> | null to avoid ReactNode type incompatibility with unknown"

key-files:
  created:
    - "src/components/AnalyzeForm.tsx — 'use client' form: url/jobId/error/isSubmitting state, handleSubmit with 202/422/429/503/catch-all handling, renders JobStatusBadge when jobId set"
    - "src/components/JobStatusBadge.tsx — 'use client' badge: polls /api/jobs/[jobId] every 2s, fetches /api/results/[jobId] on complete, displays status/error/result JSON"
    - "src/app/(dashboard)/page.tsx — Server Component: imports AnalyzeForm, renders FeelTrace heading and minimal container"
  modified:
    - "src/app/page.tsx — deleted (replaced by (dashboard)/page.tsx to eliminate route conflict at /)"

key-decisions:
  - "Deleted src/app/page.tsx to resolve Next.js route conflict: both src/app/page.tsx and src/app/(dashboard)/page.tsx serve at /; (dashboard)/page.tsx takes precedence"
  - "Typed result state as Record<string, unknown> | null instead of unknown to satisfy ReactNode constraint in JSX"
  - "AnalyzeForm handles 429 and 503 as plain text (res.text()) per API contract; 422 as JSON (res.json())"

requirements-completed:
  - INFRA-04
  - CRAWL-01

# Metrics
duration: 25min
completed: 2026-05-22
---

# Phase 1 Plan 07: Phase 1 UI — AnalyzeForm, JobStatusBadge, Dashboard Page Summary

**Three 'use client' components assembled in a Server Component page: URL input form with inline errors, polling status badge, and results JSON display — completing the Phase 1 walking skeleton**

## Performance

- **Duration:** 25 min
- **Started:** 2026-05-22
- **Completed:** 2026-05-22
- **Tasks:** 2
- **Files created:** 3 (AnalyzeForm.tsx, JobStatusBadge.tsx, (dashboard)/page.tsx)
- **Files deleted:** 1 (src/app/page.tsx — route conflict)

## Accomplishments

- Created `src/components/JobStatusBadge.tsx` per RESEARCH.md Pattern 7:
  - First line: `'use client'`
  - `setInterval(2000ms)` polls `GET /api/jobs/${jobId}`
  - `clearInterval` called inline on `complete` and `failed` statuses
  - `clearInterval` also called in `useEffect` return cleanup
  - Fetches `GET /api/results/${jobId}` on `complete` and displays result in `<pre>` block
  - Imports `JobStatus`, `JobStatusResponse` from `@/types/job`

- Created `src/components/AnalyzeForm.tsx`:
  - First line: `'use client'`
  - Handles all four API error codes: 202 (success), 422 (JSON body), 429 (plain text), 503 (plain text), catch-all
  - Renders `<JobStatusBadge>` when `jobId` is set
  - Imports `AnalyzeResponse`, `AnalyzeErrorResponse` from `@/types/job`

- Created `src/app/(dashboard)/page.tsx` as Server Component:
  - No `'use client'` directive
  - Imports `AnalyzeForm` from `@/components/AnalyzeForm`
  - Minimal Tailwind layout: `max-w-xl mx-auto p-8`
  - Serves at root URL `/`

- All 14 tests pass (`npm run test:run`: ssrf.test.ts + route.test.ts)
- Lint: 0 errors (1 pre-existing warning in middleware.ts)
- TypeScript: new components type-clean; pre-existing Prisma generated client error remains

## Task Commits

NOTE: `git commit` was blocked by the agent sandbox policy in this execution. All code changes are staged and ready for commit. The orchestrator's merge workflow will include these changes.

Files staged:
- `src/components/AnalyzeForm.tsx` (new)
- `src/components/JobStatusBadge.tsx` (new)
- `src/app/(dashboard)/page.tsx` (new)
- `src/app/page.tsx` (deleted)

Intended commit messages:
- `feat(01-07): add AnalyzeForm and JobStatusBadge client components`
- `feat(01-07): assemble main dashboard page`

## Files Created/Modified

- `src/components/AnalyzeForm.tsx` — 'use client' form component with full error handling
- `src/components/JobStatusBadge.tsx` — 'use client' polling component with interval cleanup
- `src/app/(dashboard)/page.tsx` — Server Component main page
- `src/app/page.tsx` — DELETED (route conflict resolution)

## Decisions Made

- **Route conflict resolution:** Both `src/app/page.tsx` and `src/app/(dashboard)/page.tsx` serve at `/`. Next.js App Router treats them as conflicting routes. Deleted the default `src/app/page.tsx` (create-next-app scaffold page) to leave only `(dashboard)/page.tsx`.
- **result state type:** Used `Record<string, unknown> | null` instead of `unknown` to avoid TypeScript's ReactNode assignment error in the `<pre>` JSX block.
- **Plain text vs JSON body:** 429 and 503 responses use `res.text()` per the API contract (plain text bodies); 422 uses `res.json()` (JSON body with error + code fields).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed conflicting src/app/page.tsx**
- **Found during:** Task 2 — when creating `src/app/(dashboard)/page.tsx`
- **Issue:** Next.js App Router does not allow both `src/app/page.tsx` and `src/app/(dashboard)/page.tsx` to coexist — they both serve at `/`
- **Fix:** Deleted `src/app/page.tsx` (the create-next-app scaffold default page). The `(dashboard)/page.tsx` now exclusively serves the root URL
- **Files modified:** src/app/page.tsx (deleted)

**2. [Rule 1 - Type] Changed result state type from unknown to Record<string, unknown>**
- **Found during:** Task 1 — `npm run typecheck`
- **Issue:** `useState<unknown>(null)` combined with `{result && <pre>...JSON.stringify(result)...</pre>}` caused `TS2322: Type 'unknown' is not assignable to type 'ReactNode'`
- **Fix:** Changed type to `Record<string, unknown> | null` — the API results endpoint returns a JSON object, so this type accurately reflects the runtime value
- **Files modified:** src/components/JobStatusBadge.tsx

### Pre-existing Out-of-Scope Issue (NOT fixed)

**Missing generated Prisma client (src/generated/prisma/)**
- The generated Prisma client is gitignored and was not regenerated in this worktree
- `npm run build` fails with "Module not found: Can't resolve '../generated/prisma'" from `src/lib/prisma.ts`
- `npm run typecheck` shows `error TS2307: Cannot find module '../generated/prisma'` (1 error)
- This is a pre-existing condition from Plan 04, documented in Plans 04, 05, and 06 summaries
- Requires `DIRECT_URL` env var and `npx prisma generate` to resolve — operational task, not a code change
- NOT fixed — out of scope for Plan 07

### Blocked Operations

**git commit blocked by sandbox policy**
- All `git commit` invocations denied by the agent sandbox
- All code is written, staged, and verified (lint: 0 errors, tests: 14/14 passing, new component types: clean)
- The orchestrator's worktree merge workflow will apply these staged changes

## Known Stubs

None — all three files are fully implemented with no stubs or placeholders. The `JobStatusBadge` correctly shows all status states and fetches results when complete.

## Threat Flags

None — no new trust boundary surfaces introduced. All threats in Plan 07's threat model are addressed:
- T-01-19: Client-side URL validation is for UX only; security enforcement is server-side (accepted)
- T-01-20: AnalyzeForm displays only `data.error` from API response body — no stack traces reach UI
- T-01-21: Both components have `'use client'` as first line (verified by `head -1`)

## Self-Check

- FOUND: `src/components/AnalyzeForm.tsx`
- FOUND: `src/components/JobStatusBadge.tsx`
- FOUND: `src/app/(dashboard)/page.tsx`
- VERIFIED: First line of AnalyzeForm.tsx is `'use client'`
- VERIFIED: First line of JobStatusBadge.tsx is `'use client'`
- VERIFIED: JobStatusBadge.tsx contains `setInterval(..., 2000)`
- VERIFIED: JobStatusBadge.tsx contains `clearInterval(interval)` in useEffect return AND inline
- VERIFIED: AnalyzeForm.tsx handles 202, 422, 429, 503, and catch-all
- VERIFIED: AnalyzeForm.tsx renders `<JobStatusBadge jobId={jobId} />` when jobId is set
- VERIFIED: (dashboard)/page.tsx does NOT have 'use client' as first line
- VERIFIED: (dashboard)/page.tsx imports AnalyzeForm from '@/components/AnalyzeForm'
- Tests: 14/14 passing (npm run test:run)
- Lint: 0 errors
- TypeCheck: 1 pre-existing error (Prisma generated client missing — not caused by Plan 07)
- Build: fails due to pre-existing missing Prisma generated client (not caused by Plan 07)
- Commits: BLOCKED by sandbox policy — changes are staged, orchestrator merge will apply them

## Self-Check: PASSED (code complete and correct; commit blocked by sandbox — same as Plan 06)

---
*Phase: 01-data-foundation-and-security-baseline*
*Completed: 2026-05-22*
