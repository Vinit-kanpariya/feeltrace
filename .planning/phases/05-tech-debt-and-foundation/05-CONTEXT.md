# Phase 5: Tech Debt & Foundation - Context

**Gathered:** 2026-05-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Clean up four targeted v1.0 tech debt items and stabilize interfaces before expanding signal coverage in Phase 6. Nothing new is added — this phase only removes dead code, fixes misleading UX, aligns types, and adds a startup safety guard.

Requirements in scope: DEBT-01, DEBT-02, DEBT-03, DEBT-04

</domain>

<decisions>
## Implementation Decisions

### DEBT-01: Remove Dead Gemini Code
- **D-01:** Delete `crawler/src/lib/gemini.ts` in its entirety — confirmed not imported anywhere in the codebase.
- **D-02:** Remove `@google/generative-ai` from `crawler/package.json` dependencies (currently at `^0.24.1`).
- **D-03:** No replacement needed — Groq is the active LLM provider.

### DEBT-02: Failed-Job Error Page
- **D-04:** When `result` is null in `page.tsx`, query the Job record before calling `notFound()`. Branch: if the job exists and `status === 'failed'` → show error UI; if no Job record exists → call `notFound()`.
- **D-05:** Use the same inline red error card design as D-06 (already in `page.tsx`) — no new component needed. Reuse: `bg-red-950/40 border border-red-800/50` card with `error_message` if available.
- **D-06:** Fallback copy when `error_message` is null or empty: `"Analysis failed — try submitting again"`. Do not speculate about the cause.
- **D-07:** The "retry" CTA is a Link to `/` — same as the existing D-06 error block's "home page" reference.

### DEBT-03: TechProfile Type Alignment
- **D-08:** Align direction: make the **crawler** optional — add `?` to `database`, `auth`, `payments`, `services` in `crawler/src/lib/types.ts` to match `src/types/tech.ts`. Both packages now agree these fields might not be present.
- **D-09:** The crawler still always writes these fields in practice (tech-detector.ts fills them). Making them optional is a TypeScript-level defensive measure, not a behavior change.
- **D-10:** Do NOT change the app types in `src/types/tech.ts` — they're already correct (optional for backward compat with old DB records).

### DEBT-04: Startup Validation for RAILWAY_CRAWLER_URL
- **D-11:** Add env var validation to `crawler/src/index.ts` in the `start()` function, before `initQueue()` and `serve()`.
- **D-12:** Validate **presence + valid URL format** — use `new URL(value)` to parse; catch the TypeError if it throws. Check `RAILWAY_CRAWLER_URL`, `QSTASH_CURRENT_SIGNING_KEY`, and `QSTASH_NEXT_SIGNING_KEY` (the three required env vars for the crawler to function).
- **D-13:** On validation failure: log a descriptive error message (`[feeltrace-crawler] Missing or invalid required env var: RAILWAY_CRAWLER_URL`) and call `process.exit(1)`. This matches the existing `start().catch` pattern in `index.ts`.
- **D-14:** No special dev/prod branching — validate unconditionally. If `RAILWAY_CRAWLER_URL` is missing locally, the developer should notice immediately.

### Claude's Discretion
- Gemini file deletion: straightforward — delete and remove dep.
- Whether to also check `GROQ_API_KEY`, `DATABASE_URL` at startup: Claude's call. Keep it minimal; only the three QStash-related vars need fail-fast behavior. DB errors will surface naturally at first query.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### App code
- `src/app/results/[jobId]/page.tsx` — D-06 inline error pattern + notFound() call site; primary edit target for DEBT-02
- `src/app/results/[jobId]/not-found.tsx` — existing "Results not found" UI; stays unchanged
- `src/types/tech.ts` — app TechProfile interface (optional fields); read before touching crawler types

### Crawler code
- `crawler/src/lib/gemini.ts` — dead code to delete (DEBT-01)
- `crawler/src/lib/types.ts` — crawler TechProfile interface (required fields); edit target for DEBT-03
- `crawler/src/index.ts` — startup entry point; edit target for DEBT-04
- `crawler/src/server.ts` — shows where `RAILWAY_CRAWLER_URL!` is used (line 52); context for why validation matters

### Planning
- `.planning/REQUIREMENTS.md` — DEBT-01 through DEBT-04 requirements
- `.planning/ROADMAP.md` — Phase 5 success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- D-06 error card in `page.tsx` (lines 73–85): `bg-red-950/40 border border-red-800/50 p-6` card — reuse for DEBT-02 failed-job-no-result path
- `ResultsHeader()` component in `page.tsx` — can be reused in the new failed-job branch for layout consistency

### Established Patterns
- `start().catch` in `crawler/src/index.ts`: process.exit(1) on startup errors — extend this pattern for env validation
- `process.env.VARIABLE!` non-null assertions in `server.ts`: these are the validation gaps being fixed by DEBT-04

### Integration Points
- `page.tsx` adds a second Prisma query (`prisma.job.findUnique({ where: { id: jobId } })`) only on the `!result` path — no performance cost in the happy path

</code_context>

<specifics>
## Specific Ideas

- Error page copy (exact): `"Analysis failed — try submitting again"` when no `error_message` is available
- Startup validation: check `RAILWAY_CRAWLER_URL`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`
- TechProfile fix: add `?` to 4 fields in crawler types only (`database`, `auth`, `payments`, `services`)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 5-Tech Debt & Foundation*
*Context gathered: 2026-05-27*
