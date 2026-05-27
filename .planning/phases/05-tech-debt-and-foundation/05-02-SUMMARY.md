---
phase: 05-tech-debt-and-foundation
plan: "02"
subsystem: results-page, crawler
tags: [error-handling, ux, startup-validation, fail-fast]
dependency_graph:
  requires: []
  provides:
    - failed-job-error-card
    - crawler-env-validation
  affects:
    - src/app/results/[jobId]/page.tsx
    - crawler/src/index.ts
tech_stack:
  added: []
  patterns:
    - two-step 404 branch (query Job before notFound)
    - fail-fast env validation at process start
key_files:
  modified:
    - src/app/results/[jobId]/page.tsx
    - crawler/src/index.ts
decisions:
  - Two-step branch in results page queries Job only when Result is null — avoids extra DB call on the happy path
  - Validate each env var individually so the log message names the specific failing variable
  - URL format validated with new URL() constructor — native, no extra dependency
  - No dev/prod branching for env validation — validate unconditionally per plan
metrics:
  duration: "~10 minutes"
  completed: "2026-05-27"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 5 Plan 02: Error Pages and Crawler Startup Validation Summary

Two targeted TypeScript-only fixes: results page now shows a descriptive red error card for failed jobs instead of a misleading 404, and the crawler exits immediately at startup with a named-variable message when any required QStash env var is missing or malformed.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add failed-job error card branch to results page | d7b7a1f | src/app/results/[jobId]/page.tsx |
| 2 | Add startup env var validation to crawler start() | 4123625 | crawler/src/index.ts |

## What Was Built

### Task 1 — Results page failed-job branch

Replaced the single-line `if (!result) notFound()` at line 68 of `src/app/results/[jobId]/page.tsx` with a two-step branch:

1. When `result` is null, query `prisma.job.findUnique({ where: { id: jobId } })`.
2. If no Job record exists either, call `notFound()` — unknown jobId still produces a proper 404.
3. If a Job record exists (job failed before a Result was written), render a red error card using the D-06 CSS classes (`rounded-xl bg-red-950/40 border border-red-800/50 p-6`) with `job.error_message` or the fallback copy `'Analysis failed — try submitting again'`, plus a `<Link href="/">← Try again</Link>` CTA.

The existing D-06 block (lines 71-85, handles `result.job.status === 'failed'` when a Result exists) was not modified.

### Task 2 — Crawler startup env var validation

Added a validation block at the top of `start()` in `crawler/src/index.ts`, before `await initQueue()`. Checks three variables individually:

- `RAILWAY_CRAWLER_URL`: presence check + `new URL()` format validation
- `QSTASH_CURRENT_SIGNING_KEY`: presence check
- `QSTASH_NEXT_SIGNING_KEY`: presence check

On failure, logs `[feeltrace-crawler] Missing or invalid required env var: {VAR_NAME}` and calls `process.exit(1)`. The existing `start().catch` block at the bottom remains unchanged (still handles unexpected errors during queue/server init).

## Verification Evidence

```
prisma.job.findUnique in results page:
  src/app/results/[jobId]/page.tsx:70 — const job = await prisma.job.findUnique({ where: { id: jobId } })

Fallback copy:
  {job.error_message ?? 'Analysis failed — try submitting again'}  ✓

href="/" count in results page: 3 matches (header logo, "New analysis" link, "← Try again" CTA)  ✓

Crawler new URL( present:
  new URL(process.env.RAILWAY_CRAWLER_URL)  ✓

Crawler env var coverage: 11 lines reference the three required vars  ✓

process.exit(1) count in crawler/src/index.ts: 5 (4 in new validation block + 1 in start().catch)  ✓

typecheck: pre-existing errors only (missing deps: groq-sdk, p-queue, playwright-core, @vercel/blob, generated Prisma types) — zero errors in modified files
```

## Deviations from Plan

None — plan executed exactly as written.

## Threat Surface Scan

No new network endpoints, auth paths, or schema changes introduced. The results page error card renders `job.error_message` from the DB — per T-05-02 in the plan's threat model, this is accepted (no secrets stored in error_message; shareable-link model). No new threat surface.

## Self-Check

**Files exist:**
- src/app/results/[jobId]/page.tsx — modified (not a new file)
- crawler/src/index.ts — modified (not a new file)
- .planning/phases/05-tech-debt-and-foundation/05-02-SUMMARY.md — this file

**Commits exist:**
- d7b7a1f — feat(05-02): add failed-job error card branch to results page
- 4123625 — feat(05-02): add startup env var validation to crawler start()

## Self-Check: PASSED
