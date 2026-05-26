# Phase 4: Results Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-26
**Phase:** 04-results-dashboard
**Areas discussed:** Shared types, JobStatusBadge scope, React Flow CSS, 404 handling

---

## Shared Types

### Q1: Where should NarrativeResult and SEVERITY_LABELS live?

| Option | Description | Selected |
|--------|-------------|----------|
| Copy to src/types/narrative.ts | Create src/types/narrative.ts. Matches existing src/types/job.ts pattern. Clean separation — crawler and Next.js each own their copies. | ✓ |
| Inline in results page | Declare in src/app/results/[jobId]/page.tsx. No new file, but scatters type definitions. | |
| Shared root-level types package | Create a shared types package (e.g. packages/types/). Clean but adds monorepo overhead — overkill for MVP. | |

**User's choice:** Copy to src/types/narrative.ts
**Notes:** Matches the established src/types/job.ts pattern.

### Q2: Should CATEGORY_LABELS also go in src/types/narrative.ts?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — all in src/types/narrative.ts | CATEGORY_LABELS joins NarrativeResult and SEVERITY_LABELS. One import, everything related to result display types in one place. | ✓ |
| Separate src/lib/categories.ts | Mapping function in lib/ alongside prisma.ts, ssrf.ts. Feels like utility logic rather than a type declaration. | |
| Inline in IssueCard component | Define the mapping object directly where it's used. No new file, but only works if the mapping is never reused. | |

**User's choice:** Yes — all in src/types/narrative.ts
**Notes:** All three display-layer constants/types in one file.

---

## JobStatusBadge Scope

### Q1: How extensively should JobStatusBadge be updated?

| Option | Description | Selected |
|--------|-------------|----------|
| Clean rewrite — navigate only | Remove result state + /api/results fetch + <pre> dump entirely. On complete: router.push('/results/{jobId}'). On failed: show error message. Current JSON dump was a Phase 1 stub — Phase 4 makes it obsolete. | ✓ |
| Minimal add — keep the dump, add navigation | Keep existing result state and <pre> output. Add router.push as an additional side-effect on complete. Leaves dead code path. | |

**User's choice:** Clean rewrite — navigate only

### Q2: Should the polling status display be improved?

| Option | Description | Selected |
|--------|-------------|----------|
| Stay minimal — text status only | Keep "Status: {status}" as plain text. Error message shown on failed. Navigation on complete. No animated spinner or progress bar. | ✓ |
| Improve with a progress step indicator | Show pending → crawling → extracting → analyzing → complete as a step sequence with visual states. More polished but adds scope beyond Phase 4. | |

**User's choice:** Stay minimal — text status only
**Notes:** Progress step indicator deferred to a later phase.

---

## React Flow CSS

### Q1: Where should the @xyflow/react stylesheet be imported?

| Option | Description | Selected |
|--------|-------------|----------|
| Inside CausalityGraph component | import '@xyflow/react/dist/style.css' at the top of src/components/CausalityGraph.tsx. Self-contained — the component owns its dependency. | |
| In globals.css via @import | @import '@xyflow/react/dist/style.css' in src/app/globals.css. Centralised, but loads the stylesheet on every page — not just the results page. | ✓ |
| In the results page layout | Import in src/app/results/layout.tsx. Scoped to results pages but adds an extra file. | |

**User's choice:** In globals.css via @import
**Notes:** User prefers centralised stylesheet management.

---

## 404 Handling

### Q1: How should ResultsPage handle a missing or not-found result?

| Option | Description | Selected |
|--------|-------------|----------|
| Next.js notFound() + not-found.tsx | Call notFound() in the Server Component. Create not-found.tsx with UI-SPEC copywriting. Returns HTTP 404 — correct for broken share links. | ✓ |
| Inline ResultNotFound component in page.tsx | Render inline component when fetch returns null. Returns HTTP 200 with error content. Misleading HTTP status. | |

**User's choice:** Next.js notFound() + not-found.tsx
**Notes:** Proper HTTP 404 semantics for broken share links.

### Q2: How should the 'Analysis failed' state be rendered?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline in page.tsx — check status, render error section | If job.status === 'failed', render the error section inline with UI-SPEC copy. HTTP 200, error_message displayed. The job record is there — it just failed. | ✓ |
| Redirect back to homepage with error param | Redirect to /?error=failed&job={jobId}. User lands back at URL input form. Loses the job context. | |
| Next.js error.tsx boundary | Throw an Error in Server Component, caught by error.tsx. Semantically wrong — a failed analysis is expected state, not an unexpected exception. | |

**User's choice:** Inline in page.tsx — check status, render error section

---

## Claude's Discretion

None — all areas had clear user selections.

## Deferred Ideas

- Progress step indicator for JobStatusBadge (pending → crawling → extracting → analyzing visual sequence) — polish concern, future phase.
- Improved homepage status display during polling — out of Phase 4 scope; Phase 4 is the results page.
