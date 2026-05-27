---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: in-progress
last_updated: "2026-05-26T16:46:14.277Z"
progress:
  total_phases: 4
  completed_phases: 4
  total_plans: 26
  completed_plans: 26
  percent: 100
---

# FeelTrace — Project State

*Last updated: 2026-05-26*

---

## Project Reference

**Core value**: Turn raw frontend signals into human-centered explanations of why users feel friction — not metric scores, but narratives that connect technical causes to perceived user experience.

**Current focus**: Phase 3 — AI Analysis Pipeline

---

## Current Position

| Field | Value |
|-------|-------|
| Milestone | MVP |
| Current Phase | 4 — Results Dashboard |
| Phase Name | Results Dashboard |
| Current Plan | 04-07 (Wave 5) |
| Status | Phase 4 IN PROGRESS — Waves 0+1+2+3+4 complete (6/7 plans done), ready for Wave 5 |

**Progress**: Phase 3 of 4 complete, Phase 4 in progress (4/7 plans executed)

```
[Phase 1] ✓ → [Phase 2] ✓ → [Phase 3] ✓ → [Phase 4]
                                                ^
                                             Current
```

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases complete | 3 / 4 |
| Plans complete | 19 / 19 (Phase 1 + Phase 2 + Phase 3 all complete) |
| Unit tests | 89 passing (DOM: 11, JS: 9, Network: 7, Stage1: 20, Stage2: 7, Stage3: 14, server: 21) |

| Phase 03-ai-pipeline P01 | 5min | 2 tasks | 2 files |
| Phase 03-ai-pipeline P02 | 32min | 2 tasks | 3 files |
| Phase 03-ai-pipeline P03 | 6min | 2 tasks | 3 files |
| Phase 03-ai-pipeline P04 | 12min | 2 tasks | 3 files |
| Phase 03-ai-pipeline P05 | ~2h | 2 tasks | 4 files |

**Phase 4 Plan Summary (7 plans, 6 waves):**

| Plan | Wave | Objective |
|------|------|-----------|
| 04-01 | 0 | Vitest config fix + 5 RED test stubs (Nyquist baseline) |
| 04-02 | 1 | src/types/narrative.ts (D-01/D-02) + globals.css React Flow import (D-04) |
| 04-03 | 1 | Install @xyflow/react + lucide-react, graph-utils.ts, JobStatusBadge rewrite (D-03) |
| 04-04 | 2 | SeverityBadge + IssueCard + NarrativeSection + GraphAbsent (Server Components) |
| 04-05 | 3 | CausalityGraph (React Flow, "use client") + ShareButton (clipboard, "use client") |
| 04-06 | 4 | Results route assembly: page.tsx + loading.tsx + not-found.tsx |
| 04-07 | 5 | Full test suite + browser smoke test (react.dev, 6 issues, 5 edges) |

## Accumulated Context

### Key Decisions

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
| signal_source includes viewport suffix in parentheses | "networkSignals.firstRequestTTFB (mobile)" is self-descriptive in DB without requiring a join |
| PERMITTED_MECHANISMS in pipeline/types.ts is single source of truth | Both stage2-reasoner.ts prompt and zod enum import from this constant |
| postbuild cpSync for Prisma generated files | tsc does not copy .js/.wasm Prisma runtime files to dist/ |
| Install @google/generative-ai in crawler/ only (not root) | Keeps Gemini SDK out of Next.js bundle; crawler AI pipeline is the only consumer |
| z.string().refine() over z.enum() cast for PERMITTED_MECHANISMS | readonly const tuple not castable to [string, ...string[]] in TypeScript 6; refine() is semantically equivalent |
| EMIT_ANALYSIS_TOOL typed as Tool with SchemaType.ARRAY literal cast | @google/generative-ai FunctionDeclaration requires literal SchemaType enum values, not general SchemaType |
| NarrativeResult cast via unknown for Prisma Json type | Plain interfaces lack the string index signature InputJsonValue requires; double-cast is safe since NarrativeResult is fully serialisable |
| Groq (llama-3.3-70b-versatile) replaces Gemini as LLM provider | Gemini free-tier quota exhausted across all models; Groq provides 14,400 RPD free with no billing required |
| Causal edge indices must be remapped from scoredIssue space to enrichedIssue space | LLM returns indices into the scored array; DB write requires IDs of enriched issues (different array); remap via signalKey as stable cross-array identifier |

### Active Todos

- [x] Phase 1 complete — data foundation and security baseline
- [x] Phase 2 complete — crawler service with dual viewport + all 4 signal extractors
- [x] Define causality mechanism rule set (13 rules) — defined in CAUSALITY_MECHANISM_RULES in stage2-reasoner.ts
- [ ] Define CLS/LCP/INP/Long Task severity thresholds before Phase 3 Stage 1 scoring logic is written
- [ ] Validate AI narrative quality against 3+ real sites before launch

### Blockers

None currently.

### Notes

- Crawler runs locally via `node --env-file=.env dist/index.js` on port 3001; exposed via ngrok for QStash delivery
- For production deployment: fly.toml is configured for Fly.io (1 GB VM, auto_stop off, /health check at 30s interval)
- Causality graph is the highest trust risk — cap MVP at 3-5 high-confidence edges
- Phase 3 will replace the TODO stub in processJob (analyzer -> complete transition) with real AI pipeline calls

---

## Session Continuity

**To resume work**: Run `/gsd:execute-phase 4` to begin Phase 4 — Results Dashboard.

**Context for next session**:

- Phase 3 COMPLETE — all 5 plans done; Result/Issue/CausalEdge records live in Neon DB
- LLM provider is Groq (llama-3.3-70b-versatile via groq-sdk) — GROQ_API_KEY required in crawler/.env
- GEMINI_API_KEY remains in crawler/.env but is no longer used (quota exhausted)
- Smoke test record: Result id cmpmjx5xo0000rcjd0nxrvh5g (react.dev), 6 issues, 5 causal edges
- Severity mapping: Critical=4, High=3, Medium=2, Low=1; Phase 4 orders by severity DESC
- PERMITTED_MECHANISMS list (13 rules) defined in pipeline/types.ts — single source of truth for Stage 2
- Phase 4 has no defined plans yet — planner must generate them before execution
