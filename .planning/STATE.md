---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: milestone
status: in_progress
last_updated: "2026-05-27T14:52:00.000Z"
last_activity: "2026-05-27 — Phase 5 executed (2/2 plans complete, all tests pass)"
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 2
  completed_plans: 2
  percent: 25
---

# FeelTrace — Project State

*Last updated: 2026-05-27 — Milestone v1.1 started*

---

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-27)

**Core value:** Turn raw frontend signals into human-centered explanations of why users feel friction — not metric scores, but narratives that connect technical causes to perceived user experience.

**Current focus:** v1.1 Analysis Depth — richer signals, smarter AI reasoning, multi-page crawl.

---

## Current Position

Phase: Phase 5 — Tech Debt & Foundation
Plan: Complete (2/2)
Status: Phase 5 complete — ready for Phase 6
Last activity: 2026-05-27 — Phase 5 executed; all plans complete, tests pass

---

## Accumulated Context

### Key Decisions (v1.0 — carried forward)

| Decision | Rationale |
|----------|-----------|
| Playwright on Fly.io (local/ngrok for dev), not Vercel | Vercel 250 MB bundle limit is a hard blocker for Chromium |
| Structured 3-stage AI pipeline | Single-shot LLM on raw HTML produces hallucinations and costs 30-60x more |
| CausalEdge.mechanism is non-nullable | Schema-level enforcement prevents correlation-only edges |
| JS signal scope = loading behavior only | Minified production bundles are unanalyzable for code quality |
| QStash as async bridge | Crawl duration 15-45s exceeds synchronous API route safety |
| No auth in MVP | Shareable-link model validates core AI quality fastest |
| PrismaNeon adapter in crawler | Prisma 7 removed url from schema datasource (P1012); adapter pattern required |
| RAILWAY_CRAWLER_URL reused for QStash verify | Guarantees exact URL match; CRAWLER_PUBLIC_URL + /crawl caused 401s |
| Groq (llama-3.3-70b-versatile) replaces Gemini as LLM provider | Gemini free-tier quota exhausted; Groq provides 14,400 RPD free with no billing required |
| Causal edge indices must be remapped from scoredIssue space to enrichedIssue space | LLM returns indices into the scored array; DB write requires IDs of enriched issues; remap via signalKey |

### Tech Debt Carried Forward from v1.0

- `crawler/src/lib/gemini.ts` is dead code; `@google/generative-ai` is a dead dependency
- Failed jobs show generic "Results not found" (404-style) rather than descriptive error page
- TechProfile interface type mismatch (required in crawler, optional in Next.js app)
- RAILWAY_CRAWLER_URL cross-service sync has no startup validation

### Blockers

None.

---

## Session Continuity

**Next step:** `/gsd:plan-phase 5` after roadmap is defined

**v1.0 archive:**

- `.planning/milestones/v1.0-ROADMAP.md`
- `.planning/milestones/v1.0-REQUIREMENTS.md`
- `.planning/milestones/v1.0-MILESTONE-AUDIT.md`
- `.planning/MILESTONES.md`
