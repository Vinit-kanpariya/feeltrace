---
phase: 04-results-dashboard
plan: "06"
subsystem: frontend/results-route
tags: [next.js, server-component, prisma, results-page, loading-skeleton, not-found]
dependency_graph:
  requires: [04-04, 04-05]
  provides: [results-route-assembly]
  affects: [src/app/results]
tech_stack:
  added: []
  patterns:
    - Next.js 15 async params (Promise<{ jobId: string }>)
    - Server Component direct Prisma query (no API hop)
    - NarrativeResult Json double-cast via unknown
    - meetsCredibilityThreshold gate for CausalityGraph vs GraphAbsent
    - loading.tsx animate-pulse skeleton
    - not-found.tsx with notFound() trigger
key_files:
  created:
    - src/app/results/[jobId]/page.tsx
    - src/app/results/[jobId]/loading.tsx
    - src/app/results/[jobId]/not-found.tsx
  modified: []
decisions:
  - NarrativeResult cast uses double-cast (as unknown as NarrativeResult) per STATE.md locked decision
  - Issues map callback typed inline to avoid implicit any from missing generated prisma client in worktree
  - dangerouslySetInnerHTML excluded from comments to satisfy grep verification check
metrics:
  duration: "~3 minutes"
  completed: "2026-05-26T15:56:47Z"
  tasks_completed: 2
  files_created: 3
  files_modified: 0
---

# Phase 4 Plan 06: Results Route Assembly Summary

Full /results/[jobId] route assembly wiring all Phase 04-04 and 04-05 components into a working Server Component page — ResultsPage fetches Prisma data, dispatches to NarrativeSection, IssueCard list, CausalityGraph/GraphAbsent, and ShareButton with proper Next.js 15 async params pattern.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create loading.tsx and not-found.tsx | 8ffd21e | src/app/results/[jobId]/loading.tsx, not-found.tsx |
| 2 | Create ResultsPage (page.tsx) — full route assembly | 0b28fa6 | src/app/results/[jobId]/page.tsx |

## What Was Built

### Task 1 — loading.tsx and not-found.tsx

**loading.tsx** (`src/app/results/[jobId]/loading.tsx`): Server Component that Next.js App Router automatically wraps as the Suspense fallback for the results page. 3-section animate-pulse skeleton:
- Section 1: Narrative shimmer (3 gray lines at w-3/4, w-full, w-5/6)
- Section 2: 3 issue card skeletons (badge shimmer + 2 text line shimmers each)
- Section 3: Graph panel rectangle (h-[480px]) with "Loading analysis..." centered text

**not-found.tsx** (`src/app/results/[jobId]/not-found.tsx`): Server Component rendered when `notFound()` is called. Implements D-05 with exact UI-SPEC copywriting: "Results not found" heading, body with Link back to home page.

### Task 2 — ResultsPage page.tsx

**page.tsx** (`src/app/results/[jobId]/page.tsx`): Async Server Component implementing the full results route.

Key implementation decisions:
- **Next.js 15 async params**: `const { jobId } = await params` — params is a Promise in Next.js 15
- **Prisma query**: `findUnique({ where: { jobId }, include: { job, issues: { orderBy: { severity: 'desc' } }, edges } })` — lookup by `Result.jobId @unique`, sort at DB layer not JS
- **D-05 notFound()**: Called immediately after null result check
- **D-06 inline error**: `job.status === 'failed' || job.error_message` → renders "Analysis failed" section with error message (HTTP 200)
- **NarrativeResult cast**: `result.narrative as unknown as NarrativeResult` — double-cast per locked decision
- **Graph credibility gate**: `meetsCredibilityThreshold(result.edges)` → CausalityGraph or GraphAbsent
- **Section order** (UI-SPEC): (1) title + ShareButton, (2) NarrativeSection mt-8, (3) Issues Found mt-8, (4) Graph/GraphAbsent mt-8
- **XSS safety**: All DB content via JSX text children; no dangerouslySetInnerHTML (T-04-10)

## Verification Results

| Check | Expected | Result |
|-------|----------|--------|
| npm run typecheck (results route) | No errors in src/app/results | PASS |
| await params | 1 | 1 |
| where: { jobId } | 1 | 1 |
| orderBy: { severity: | 1 | 1 |
| as unknown as NarrativeResult | 1 | 1 |
| dangerouslySetInnerHTML | 0 | 0 |
| meetsCredibilityThreshold | >= 1 | 2 |
| Results not found (not-found.tsx) | 1 | 1 |
| animate-pulse (loading.tsx) | >= 1 | 2 |

Note: `npm run typecheck` exits with pre-existing errors in `crawler/` subdirectory (playwright-core, groq-sdk, p-queue, @google/generative-ai not installed in root node_modules) and `src/lib/prisma.ts` (generated prisma client not symlinked into worktree). These errors existed in commits prior to this plan (04-04, 04-05). No new TypeScript errors were introduced by this plan's files.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Explicit type annotation on issues.map callback**
- **Found during:** Task 2 — typecheck after creating page.tsx
- **Issue:** `result.issues.map(issue => ...)` caused `TS7006: Parameter 'issue' implicitly has an 'any' type.` because the Prisma generated client is not present in the worktree (only in main repo at `src/generated/prisma/`), so TypeScript cannot infer the Issue type from the Prisma query result.
- **Fix:** Added inline type annotation on the map callback parameter matching the Issue schema fields exactly.
- **Files modified:** `src/app/results/[jobId]/page.tsx`
- **Commit:** 0b28fa6

**2. [Rule 1 - Bug] Removed dangerouslySetInnerHTML from comment text**
- **Found during:** Task 2 — running verification grep check
- **Issue:** The string "dangerouslySetInnerHTML" appeared in a code comment documenting the XSS prevention approach, causing the grep verification check to return 1 instead of 0.
- **Fix:** Rephrased comment to "all DB content rendered as JSX text children (T-04-10)" without using the string.
- **Files modified:** `src/app/results/[jobId]/page.tsx`
- **Commit:** 0b28fa6

## Known Stubs

None — all data flows are wired. The results page renders real DB data (Result, Job, Issues, CausalEdges) from Prisma queries.

## Threat Flags

No new security surface beyond what was documented in the plan's threat model (T-04-09 through T-04-13). All threats are addressed:
- T-04-10 (XSS): All DB content via JSX text children, no dangerouslySetInnerHTML
- T-04-11 (SQL Injection): Prisma findUnique parameterizes jobId
- T-04-09 (enumeration): CUIDs are unguessable

## Self-Check: PASSED

Files exist:
- src/app/results/[jobId]/page.tsx: FOUND
- src/app/results/[jobId]/loading.tsx: FOUND
- src/app/results/[jobId]/not-found.tsx: FOUND

Commits exist:
- 8ffd21e (loading.tsx + not-found.tsx): FOUND
- 0b28fa6 (page.tsx): FOUND
