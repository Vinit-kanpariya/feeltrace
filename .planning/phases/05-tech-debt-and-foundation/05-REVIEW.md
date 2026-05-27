---
phase: 05-tech-debt-and-foundation
reviewed: 2026-05-27T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - crawler/src/lib/types.ts
  - crawler/package.json
  - src/app/results/[jobId]/page.tsx
  - crawler/src/index.ts
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: fixed
---

# Phase 5: Code Review Report

**Reviewed:** 2026-05-27T00:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Four files reviewed covering: optional TechProfile backend fields, dead-dependency removal, a new failed-job error card branch in the results page, and crawler startup env var validation.

The dependency removal and TechProfile type alignment are clean. The startup validation in `index.ts` is structurally correct. The most significant defect is in `src/app/results/[jobId]/page.tsx`: an unguarded `new URL()` call on an untrusted DB string will crash the server component on any malformed job URL, producing an unhandled exception instead of a graceful 404 or error page. Three additional warnings cover a logic gap in the failed-job guard, missing env validation for `GROQ_API_KEY`, and duplicate section comment labels in the results page.

---

## Critical Issues

### CR-01: `new URL(result.job.url)` crashes on malformed URLs — unhandled exception in Server Component

**File:** `src/app/results/[jobId]/page.tsx:117`
**Issue:** `result.job.url` is a raw string stored by the ingest path. If it was persisted without a scheme (e.g. `"example.com"` instead of `"https://example.com"`) or is otherwise malformed, `new URL(result.job.url)` throws a `TypeError: Invalid URL`. In a Next.js 15 Server Component this bubbles up as a 500 error instead of a recoverable UI state. The surrounding code has no try/catch and `notFound()` has already been bypassed at this point, so there is no fallback.

This is reachable in production whenever a job URL was stored without protocol validation at ingest time (the ingest route validates the URL at write time, but historical rows or edge cases in the queue can contain bare hostnames).

**Fix:**
```tsx
// Replace line 117 with a guarded extraction:
let hostname: string
try {
  hostname = new URL(result.job.url).hostname
} catch {
  hostname = result.job.url // fall back to the raw string rather than crashing
}
```

---

## Warnings

### WR-01: Failed-job guard (`result.job.status === 'failed' || result.job.error_message`) fires even on non-terminal statuses

**File:** `src/app/results/[jobId]/page.tsx:95`
**Issue:** The condition on line 95 renders the red error card whenever `result.job.error_message` is non-null, regardless of status. The `error_message` column is written by `processor.ts` at the time of failure but is never cleared if a job is retried or re-processed. If any future code path sets `error_message` to a diagnostic string on a non-failed job (e.g., a warning logged during `analyzing`), this branch would show the error card to a user whose result was actually produced successfully. The intent from D-06 is to gate on failure state, not just on message presence; the `error_message` alone is not a reliable failure signal.

**Fix:**
```tsx
// Tighten the guard to require status === 'failed':
if (result.job.status === 'failed') {
  // error_message is only meaningful when the job is confirmed failed
  const msg = result.job.error_message ?? 'Something went wrong. Please submit the URL again.'
  ...
}
```

### WR-02: `GROQ_API_KEY` not validated at startup — crawler starts silently broken

**File:** `crawler/src/index.ts:23-53`
**Issue:** The startup validation added in this phase checks `RAILWAY_CRAWLER_URL`, `QSTASH_CURRENT_SIGNING_KEY`, and `QSTASH_NEXT_SIGNING_KEY`, but omits `GROQ_API_KEY`. The Groq client is initialized lazily in `getGroqClient()` (`crawler/src/lib/groq-client.ts`) and the missing key is only detected when a job actually reaches the AI pipeline stage — after a full crawl has already been performed. A missing `GROQ_API_KEY` will let the service start, accept jobs, run the expensive browser crawl, and then fail every job at the `analyzing` status with a Groq authentication error. The philosophy established by this phase is "fail fast with a descriptive error"; `GROQ_API_KEY` should be held to the same standard as the other three env vars.

**Fix:**
```typescript
// Add after the QSTASH_NEXT_SIGNING_KEY check (line 49):
if (!process.env.GROQ_API_KEY) {
  console.error('[feeltrace-crawler] Missing required env var: GROQ_API_KEY')
  process.exit(1)
}
```

### WR-03: Duplicate section comment label "Section 3" — masking a missing Section 4

**File:** `src/app/results/[jobId]/page.tsx:155,158`
**Issue:** Two consecutive JSX comment blocks are both labelled `{/* Section 3 — Narrative */}` (line 155) and `{/* Section 3 — Issue list */}` (line 158). The Issue list is the fourth visual section (after header, screenshot, narrative) but is numbered 3. Section 4 does not exist; sections continue at 5 (tech stack) and 6 (causality graph). This is not merely cosmetic: it creates a gap in the section numbering that makes future developers mis-count sections when inserting new UI regions, and it suggests the screenshot section (Section 2) was not counted in the comment pass. The duplicate label will cause confusion when cross-referencing with the UI-SPEC.

**Fix:**
```tsx
{/* Section 3 — Narrative */}
<NarrativeSection narrative={narrative} />

{/* Section 4 — Issue list */}
<div className="mt-8">
  ...
</div>

{/* Section 5 — Tech stack (when available) */}
...

{/* Section 6 — Causality graph */}
...
```

---

## Info

### IN-01: `TechProfile` defined in two separate files with no shared source of truth

**File:** `crawler/src/lib/types.ts:130-151` and `src/types/tech.ts:3-24`
**Issue:** `TechProfile` is defined independently in both `crawler/src/lib/types.ts` and `src/types/tech.ts`. The fields are currently in sync after this phase's alignment work, but any future addition to the interface must be applied to both files manually. The phase solved the symptom (required vs optional mismatch) without addressing the root cause (duplication). A future developer adding a new detection field in `tech-detector.ts` will update `crawler/src/lib/types.ts` and may not know to update `src/types/tech.ts`, re-introducing a mismatch that will only surface at runtime as a type assertion bug.

**Fix:** Consider extracting the canonical definition to a shared package or using a `/// <reference>` / path-alias that both consumers import. At minimum, add a comment to both files pointing to the other:
```typescript
// crawler/src/lib/types.ts — TechProfile section
// IMPORTANT: Keep in sync with src/types/tech.ts (no shared package yet — manual sync required)
```

### IN-02: `crawler/package.json` uses exact version pins for some deps, caret ranges for others — inconsistent version strategy

**File:** `crawler/package.json:15-27`
**Issue:** Dependencies mix exact pins (`"@prisma/client": "7.8.0"`, `"@upstash/qstash": "2.11.0"`, `"p-queue": "9.3.0"`, `"hono": "4.12.21"`, `"zod": "4.4.3"`, `"playwright-core": "1.60.0"`) with caret ranges (`"@hono/node-server": "^2.0.3"`, `"@neondatabase/serverless": "^1.1.0"`, `"dotenv": "^17.4.2"`, `"groq-sdk": "^1.2.0"`, `"@vercel/blob": "^2.4.0"`). The exact pins for security-sensitive packages (Prisma, QStash, Playwright) are intentional, but the caret ranges on `groq-sdk` and `dotenv` mean a `npm install` in a clean environment can resolve different versions than the ones tested. For a service that processes untrusted crawl targets, `groq-sdk` in particular should be pinned.

**Fix:** Pin `groq-sdk` to its current resolved version: `"groq-sdk": "1.2.0"` (or whatever the lock file currently resolves to). Alternatively, document the mixed strategy intentionally in a comment so future maintainers do not accidentally introduce caret ranges on security-critical deps.

---

_Reviewed: 2026-05-27T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
