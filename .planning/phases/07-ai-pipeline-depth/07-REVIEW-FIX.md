---
phase: 07-ai-pipeline-depth
fixed_at: 2026-05-28T11:04:00Z
review_path: .planning/phases/07-ai-pipeline-depth/07-REVIEW.md
iteration: 1
findings_in_scope: 9
fixed: 9
skipped: 0
status: all_fixed
---

# Phase 7: Code Review Fix Report

**Fixed at:** 2026-05-28T11:04:00Z
**Source review:** .planning/phases/07-ai-pipeline-depth/07-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 9 (4 Critical + 5 Warning)
- Fixed: 9
- Skipped: 0

## Fixed Issues

### CR-01: Unguarded array index access inside DB transaction

**Files modified:** `crawler/src/pipeline/run-pipeline.ts`
**Commit:** a4f6e3b
**Applied fix:** Changed `include: { issues: true }` to `include: { issues: { orderBy: { id: 'asc' } } }` for deterministic return order. Built a `Map<number, string>` (`issueIdByPosition`) from the returned issues keyed by insertion position. Used this map in the `causalEdge.createMany` call with explicit bounds-checked lookups — throws a descriptive `Error` if `fromIssueId` or `toIssueId` is undefined.

### CR-02: Zod parse throws on over-cap arrays in vision scanner

**Files modified:** `crawler/src/pipeline/stage1-5-vision-scanner.ts`, `crawler/src/pipeline/stage1-5-vision-scanner.test.ts`
**Commit:** 0f230df
**Applied fix:** Added a slice to `parseVisualIssues` that caps `raw.visual_issues` to 5 elements before calling `VisualIssuesSchema.parse()`, so over-cap LLM responses are capped rather than rejected and discarded. Updated the test: replaced the old "6 items should throw on Zod parse" assertion (which was testing the wrong layer) with a new test verifying that 7 input issues passed to `parseVisualIssues` return exactly 5 results without throwing.

### CR-03: SSRF vulnerability in screenshot proxy route

**Files modified:** `src/app/api/screenshot/[jobId]/route.ts`
**Commit:** c5d3e3d
**Applied fix:** Added a `BLOB_BASE = 'https://blob.vercel-storage.com/'` prefix check — returns 400 if the stored URL does not start with it. Removed the forwarded `Authorization: Bearer BLOB_READ_WRITE_TOKEN` header from the fetch call (Vercel Blob private URLs carry auth in the URL itself).

### CR-04: Crawler schema drift — `url` field missing from datasource block

**Files modified:** `crawler/prisma/schema.prisma`
**Commit:** 6d1ceca
**Applied fix:** Added `url = env("DATABASE_URL")` to the `datasource db` block, matching the requirement documented in the file header comment.

### WR-01: Silent data loss when Stage 2 strips all enriched issues

**Files modified:** `crawler/src/pipeline/run-pipeline.ts`
**Commit:** 5de1edd
**Applied fix:** Added a `console.warn` after `runStage2Reasoning` returns when `enrichedIssues.length === 0`, logging the count of scored issues fed in for debugging. The pipeline continues to write an empty result (preserving current implicit behaviour) but the condition is now visible in logs.

### WR-02: Stage 2 JSON parse unguarded; Stage 3 silent empty sections

**Files modified:** `crawler/src/pipeline/stage2-reasoner.ts`, `crawler/src/pipeline/stage3-narrator.ts`
**Commit:** 5a67fda
**Applied fix:** Wrapped `JSON.parse(toolCall.function.arguments)` in `stage2-reasoner.ts` in a try/catch that re-throws a descriptive `Error`. Added a `console.warn` in `parseNarrativeOutput` (`stage3-narrator.ts`) when all three sections (`summary`, `perceivedPerformance`, `technicalPerformance`) parse as empty strings, indicating the LLM did not follow the marker format.

### WR-03: Advisory-language refine check is case-sensitive

**Files modified:** `crawler/src/pipeline/stage2-reasoner.ts`, `crawler/src/pipeline/stage2-reasoner.test.ts`
**Commit:** 98e3547
**Applied fix:** Changed the `fix_suggestion` refine validator to compare against `v.toLowerCase()` using lowercase prefix strings, making the check case-insensitive. Added two new test cases (Test F, Test G) verifying that `'consider ...'` and `'you might ...'` with lowercase first letters are also rejected.

### WR-04: SaaS dashboard detection broken when analytics tools present

**Files modified:** `crawler/src/pipeline/page-type-detector.ts`, `crawler/src/pipeline/page-type-detector.test.ts`
**Commit:** 6950669
**Applied fix:** Removed the `techProfile.analytics.length === 0` constraint from the `saas-dashboard` detection branch. Added a test case verifying that a Next.js app with `['Mixpanel', 'Segment']` in analytics and 30 interactive elements correctly detects as `'saas-dashboard'`.

### WR-05: issueLabel shows "0 issues ranked by UX impact" instead of being hidden

**Files modified:** `src/app/results/[jobId]/page.tsx`
**Commit:** a56e07b
**Applied fix:** Added an `issueCount === 0` branch to `issueLabel` that returns `''`. Changed the JSX render from unconditional `<span>` to `{issueLabel && <span ...>}` so the element is not rendered when the count is zero.

---

_Fixed: 2026-05-28T11:04:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
