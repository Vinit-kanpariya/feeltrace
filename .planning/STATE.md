---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
last_updated: "2026-05-26T00:00:00.000Z"
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 14
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
| Current Phase | 3 — AI Analysis Pipeline |
| Phase Name | AI Analysis Pipeline |
| Status | Phase 2 COMPLETE — ready to plan Phase 3 |

**Progress**: Phase 2 of 4 complete

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

**To resume work**: Run `/gsd:plan-phase 3` to plan the AI Analysis Pipeline phase.

**Context for next session**:

- Phase 2 produced: browser.ts (dual viewport crawl), 4 signal extractors (DOM/CSS/JS/Network), processor.ts (job lifecycle), server.ts (Hono + QStash)
- Signals are in-memory only (INFRA-03) — Phase 3 will consume them from processJob and write Result/Issue/CausalEdge records
- The TODO stub in processor.ts line 39: `// TODO Phase 3: invoke AI pipeline with _signals, write Result/Issue/CausalEdge records`
- Key pitfall from Phase 2: Prisma 7 requires PrismaNeon adapter; postbuild must copy src/generated/prisma to dist/
- Key pitfall from Phase 2: QStash receiver.verify() URL must exactly match delivery URL (use RAILWAY_CRAWLER_URL directly)
