# Phase 5: Tech Debt & Foundation — Discussion Log

**Date:** 2026-05-27
**Phase:** 5 — Tech Debt & Foundation
**Requirements:** DEBT-01, DEBT-02, DEBT-03, DEBT-04

---

## Areas Discussed

### 1. Failed-job error page (DEBT-02)

**Context presented:** When a job fails before writing a Result record, `page.tsx` calls `notFound()` which shows "Results not found" — misleading for a real failure. D-06 already handles the case where Result exists but job.status === 'failed'.

| Question | Options | Selection |
|----------|---------|-----------|
| What should page show when no Result record? | Same inline error card as D-06 / Dedicated not-found variant / You decide | You decide |
| Fallback copy when no error_message? | "Analysis failed — try submitting again" / "Couldn't reach this page..." | "Analysis failed — try submitting again" |

**Decision:** Claude chose to reuse D-06 inline error card design (red card, consistent with existing) + query Job before calling notFound(). Fallback copy: "Analysis failed — try submitting again".

---

### 2. TechProfile type direction (DEBT-03)

**Context presented:** Crawler types have `database`, `auth`, `payments`, `services` as required; app types have them as optional (`?`). Both packages are separate so no compile errors, but mismatch is confusing.

| Question | Options | Selection |
|----------|---------|-----------|
| Which direction to align? | Make crawler optional (Recommended) / Make app required | Make crawler optional |

**Decision:** Add `?` to `database`, `auth`, `payments`, `services` in `crawler/src/lib/types.ts`. App types unchanged. Backward-compat safe.

---

### 3. Startup validation behavior (DEBT-04)

**Context presented:** `RAILWAY_CRAWLER_URL` used with `!` assertion in server.ts. Missing value causes silent 401 failures on all crawl jobs.

| Question | Options | Selection |
|----------|---------|-----------|
| Hard-fail or warn? | Hard-fail process.exit (Recommended) / Log warning only | Hard-fail |
| Check presence only or format too? | Presence only / Presence + valid URL format | Presence + valid URL format |

**Decision:** Validate `RAILWAY_CRAWLER_URL`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY` at startup in `index.ts`. Validate presence + parse as URL. `process.exit(1)` with descriptive message on failure.

---

## Deferred Ideas

None.

---

## Notes

- DEBT-01 (Gemini removal) is clear-cut — not discussed, no gray areas. Delete file, remove dep.
- All four debt items are localized; no cross-cutting concerns or new capabilities.
