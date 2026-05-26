# Phase 4: Results Dashboard - Context

**Gathered:** 2026-05-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Read-only output layer: display ranked issues, plain-English narrative, and causality graph on a results page. Users can share the analysis with teammates via a persistent URL without creating an account.

Builds on data Phase 3's AI pipeline already writes to the database (Result, Issue, CausalEdge records). No new AI calls, no new data writes, no auth. Pure display and share.

</domain>

<decisions>
## Implementation Decisions

### Shared Types

- **D-01:** Create `src/types/narrative.ts` containing `NarrativeResult` interface, `SEVERITY_LABELS` constant, and `CATEGORY_LABELS` constant. These are copied from `crawler/src/pipeline/types.ts` — each sub-project owns its copy; no cross-boundary import.
- **D-02:** `CATEGORY_LABELS` maps: `perceived-perf` → "Perceived Performance", `technical-perf` → "Technical Performance", `accessibility` → "Accessibility". All three display-layer constants live in `src/types/narrative.ts`.

### JobStatusBadge Update

- **D-03:** Clean rewrite of `src/components/JobStatusBadge.tsx`. Remove: `result` state, `/api/results/{jobId}` fetch, `<pre>` JSON dump. Behaviour after rewrite: on `status === 'complete'` → `router.push('/results/${jobId}')`. On `status === 'failed'` → show error message. Status text display stays minimal (plain text: "Status: {status}").

### React Flow Stylesheet

- **D-04:** Add `@import '@xyflow/react/dist/style.css'` to `src/app/globals.css`. Centralised — loaded once globally. Without this import, React Flow nodes and edges render broken silently.

### Error / Not-Found Handling

- **D-05:** Missing result (no DB record for the jobId): call Next.js `notFound()` in the Server Component + create `src/app/results/[jobId]/not-found.tsx` with the copywriting from the UI-SPEC. Returns HTTP 404.
- **D-06:** Failed analysis (`job.status === 'failed'` or result has an error_message): render an inline error section in `page.tsx` using the "Analysis failed" copywriting from the UI-SPEC. Returns HTTP 200.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Contract (MANDATORY)
- `.planning/phases/04-results-dashboard/04-UI-SPEC.md` — Full visual and interaction contract. All component designs, colors, typography, spacing, copywriting, and interaction contracts are locked here. Do not re-derive from scratch.

### Data Models
- `crawler/prisma/schema.prisma` — Result, Issue, CausalEdge models. Issue.severity is Int (1–4). Result.narrative is Json (typed as NarrativeResult).
- `prisma/schema.prisma` — Root project schema (same structure, used by Next.js app).

### Pipeline Types (source of truth for copied types)
- `crawler/src/pipeline/types.ts` — NarrativeResult interface, SEVERITY_LABELS, PERMITTED_MECHANISMS. Copy NarrativeResult + SEVERITY_LABELS to `src/types/narrative.ts` (do not import across sub-project boundary).

### Existing Components to Update
- `src/components/JobStatusBadge.tsx` — Current implementation; must be rewritten per D-03.

### Infrastructure
- `src/lib/prisma.ts` — Prisma singleton; ResultsPage Server Component imports directly from here.
- `src/app/globals.css` — React Flow stylesheet import goes here (D-04).
- `src/app/layout.tsx` — Geist Sans + Geist Mono fonts already loaded; CSS vars `--font-geist-sans` and `--font-geist-mono` available globally.

### Roadmap
- `.planning/ROADMAP.md` Phase 4 — Goal and success criteria.
- `.planning/STATE.md` — Key decisions from prior phases; smoke test data (react.dev, 6 issues, 5 causal edges).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/prisma.ts` — Prisma singleton; import directly in ResultsPage Server Component (`import { prisma } from '@/lib/prisma'`).
- `src/types/job.ts` — Establishes the types file pattern; `narrative.ts` follows the same structure.
- `src/app/layout.tsx` — Geist fonts already wired; no font setup needed in the results route.

### Established Patterns
- Server Components by default; `"use client"` added only for interactive components. ResultsPage and NarrativeSection are Server Components. CausalityGraph and ShareButton require `"use client"`.
- API routes exist at `src/app/api/results/[jobId]/route.ts` — already fetches Result + Issues + CausalEdges. The ResultsPage Server Component queries Prisma directly (not via the API route) per the UI-SPEC.
- Issue ordering: `orderBy: { severity: 'desc' }` enforced at the Prisma query layer, not sorted in JavaScript after fetch.

### Integration Points
- `src/app/(dashboard)/page.tsx` — JobStatusBadge is rendered here; after D-03 rewrite it navigates to `/results/{jobId}` on completion.
- New route segment: `src/app/results/[jobId]/` — public route (no auth group), contains `page.tsx`, `loading.tsx`, `not-found.tsx`.
- `src/app/globals.css` — receives the React Flow `@import` (D-04); edit this file, do not add a separate stylesheet.

</code_context>

<specifics>
## Specific Ideas

- The UI-SPEC copywriting contract is authoritative for all strings — copy exactly, including the 2-second revert on the ShareButton success state.
- Graph credibility threshold from UI-SPEC: render React Flow only when (1) at least 1 CausalEdge exists, (2) at least 1 edge has `confidence = 'high'`, (3) total edge count >= 2. All three conditions must be true simultaneously.
- Smoke test data for local verification: Result id `cmpmjx5xo0000rcjd0nxrvh5g` (react.dev), 6 issues, 5 causal edges, severity distribution from STATE.md.

</specifics>

<deferred>
## Deferred Ideas

- Progress step indicator for JobStatusBadge (pending → crawling → extracting → analyzing → complete visual step sequence) — polish concern, deferred to a later phase.
- Improved homepage status display — out of Phase 4 scope; Phase 4 is about the results page, not the submission flow.

</deferred>

---

*Phase: 04-results-dashboard*
*Context gathered: 2026-05-26*
