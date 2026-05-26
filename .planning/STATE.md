---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
last_updated: "2026-05-26T14:00:00.000Z"
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 19
  completed_plans: 14
  percent: 50
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
| Current Phase | 3 — AI Pipeline |
| Phase Name | AI Pipeline |
| Status | Phase 3 PLANNED — ready to execute (5 plans, 4 waves) |

**Progress**: Phase 2 of 4 complete, Phase 3 planned

```
[Phase 1] ✓ → [Phase 2] ✓ → [Phase 3] → [Phase 4]
                                  ^
                               Current
```

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases complete | 2 / 4 |
| Plans complete | 14 / 14 (Phase 1 + Phase 2) |
| Unit tests | 27 passing (DOM: 11, JS: 9, Network: 7) |

---

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
| postbuild cpSync for Prisma generated files | tsc does not copy .js/.wasm Prisma runtime files to dist/ |

### Active Todos

- [x] Phase 1 complete — data foundation and security baseline
- [x] Phase 2 complete — crawler service with dual viewport + all 4 signal extractors
- [ ] Define causality mechanism rule set (10-15 rules) before Phase 3 Stage 2 prompt is written
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

**To resume work**: Run `/gsd:execute-phase 3` to execute the AI Pipeline plans.

**Context for next session**:

- Phase 3 has 5 plans across 4 waves — start with 03-01 (ANTHROPIC_API_KEY checkpoint + SDK install)
- Wave 1: 03-01 (SDK install, human checkpoint for ANTHROPIC_API_KEY)
- Wave 2: 03-02 (pipeline types + Stage 1 scorer + tests) — deterministic, no Claude
- Wave 3: 03-03 + 03-04 in parallel (Stage 2 reasoner + Stage 3 narrator + pipeline orchestrator)
- Wave 4: 03-05 (wire into processor.ts + end-to-end smoke test with real URL)
- Key pitfall: processor.ts TODO stub is at ~line 39; import `runAIPipeline` from `./pipeline/run-pipeline`
- Key pitfall: Prisma 7 requires PrismaNeon adapter; postbuild must copy src/generated/prisma to dist/
- Severity mapping: Critical=4, High=3, Medium=2, Low=1; Phase 4 orders by severity DESC
- PERMITTED_MECHANISMS list (13 rules) defined in pipeline/types.ts — single source of truth for Stage 2 prompt + zod
