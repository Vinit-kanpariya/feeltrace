# FeelTrace — Project State

*Last updated: 2026-05-18*

---

## Project Reference

**Core value**: Turn raw frontend signals into human-centered explanations of why users feel friction — not metric scores, but narratives that connect technical causes to perceived user experience.

**Current focus**: Phase 1 — Data Foundation & Security Baseline

---

## Current Position

| Field | Value |
|-------|-------|
| Milestone | MVP |
| Current Phase | 1 |
| Phase Name | Data Foundation & Security Baseline |
| Current Plan | None — planning not yet started |
| Status | Not started |

**Progress**: Phase 1 of 4

```
[Phase 1] → [Phase 2] → [Phase 3] → [Phase 4]
  ^
  Current
```

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases complete | 0 / 4 |
| Requirements complete | 0 / 19 |
| Plans created | 0 |

---

## Accumulated Context

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| Playwright on Railway, not Vercel | Vercel 250 MB bundle limit is a hard blocker for Chromium; Railway Docker container is the only viable MVP path |
| Structured 3-stage AI pipeline | Single-shot LLM on raw HTML produces hallucinations and costs 30–60x more; grounding each stage prevents fabricated signals |
| CausalEdge.mechanism is non-nullable | Schema-level enforcement prevents correlation-only edges from reaching the causality graph |
| JS signal scope = loading behavior only | Minified production bundles are unanalyzable for code quality; scope prevents misleading claims |
| Vercel Queues as async bridge | Crawl duration 15–45 s exceeds synchronous API route safety; queue + polling decouples job lifecycle |
| No auth in MVP | Shareable-link model validates core AI quality fastest; auth/history deferred to post-validation |

### Active Todos

- [ ] Start Phase 1 planning (`/gsd:plan-phase 1`)
- [ ] Verify Vercel Queues availability on current billing plan before Phase 1 build
- [ ] Define causality mechanism rule set (10–15 rules) before Phase 3 Stage 2 prompt is written
- [ ] Define CLS/LCP/INP/Long Task severity thresholds before Phase 3 Stage 1 scoring logic is written
- [ ] Validate AI narrative quality against 3+ real sites before launch

### Blockers

None currently.

### Notes

- SSRF DNS rebinding risk: mitigate via Playwright network interception (block RFC-1918 at browser request level, not only URL validation time)
- Railway poll latency: if consistently > 5 s, consider HTTP callback from crawler instead of Vercel Queues poll-mode
- Causality graph is the highest trust risk — cap MVP at 3–5 high-confidence edges; one incorrect causal edge caught by a developer can discredit the product

---

## Session Continuity

**To resume work**: Run `/gsd:plan-phase 1` to begin planning Phase 1.

**Context for next session**:
- ROADMAP.md defines 4 phases with full success criteria
- All 19 v1 requirements are mapped (coverage 19/19)
- Phase 1 is the mandatory starting point — security controls (INFRA-01, INFRA-02) must be in place before any public URL is accepted
- Research summary at `.planning/research/SUMMARY.md` contains architecture decisions, pitfall analysis, and open questions that must inform Phase 1–3 planning
