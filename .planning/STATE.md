---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-05-26T10:48:39.690Z"
progress:
  total_phases: 4
  completed_phases: 3
  total_plans: 19
  completed_plans: 19
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
| Current Phase | 3 — AI Pipeline |
| Phase Name | AI Pipeline |
| Current Plan | 03-05 (Wave 4: wire processor.ts + end-to-end smoke test) |
| Status | Phase 3 IN PROGRESS — 03-01, 03-02, 03-03, 03-04 complete, 1 plan remaining |

**Progress**: Phase 2 of 4 complete, Phase 3 in progress (4/5 plans done)

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
| Plans complete | 18 / 19 (Phase 1 + Phase 2 + 03-01 + 03-02 + 03-03 + 03-04) |
| Unit tests | 89 passing (DOM: 11, JS: 9, Network: 7, Stage1: 20, Stage2: 7, Stage3: 14, server: 21) |

| Phase 03-ai-pipeline P01 | 5min | 2 tasks | 2 files |
| Phase 03-ai-pipeline P02 | 32min | 2 tasks | 3 files |
| Phase 03-ai-pipeline P03 | 6min | 2 tasks | 3 files |
| Phase 03-ai-pipeline P04 | 12min | 2 tasks | 3 files |
| Phase 03-ai-pipeline P05 | 5 | 1 tasks | 1 files |

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

**To resume work**: Run `/gsd:execute-phase 3` to continue Phase 3 from plan 03-05.

**Context for next session**:

- Phase 3 has 5 plans across 4 waves — 03-01, 03-02, 03-03, 03-04 COMPLETE, 1 plan remaining
- Wave 1: 03-01 COMPLETE (Gemini SDK installed, GEMINI_API_KEY confirmed in crawler/.env)
- Wave 2: 03-02 COMPLETE (types.ts + stage1-scorer.ts with 20 passing tests — AI-01, AI-04 satisfied)
- Wave 3: 03-03 COMPLETE (gemini.ts singleton + stage2-reasoner.ts with 7 passing tests — AI-02 satisfied)
- Wave 3: 03-04 COMPLETE (stage3-narrator.ts with 14 passing tests, run-pipeline.ts orchestrator — AI-03, AI-04 satisfied)
- Wave 4: 03-05 (wire into processor.ts + end-to-end smoke test with real URL)
- Key pitfall: processor.ts TODO stub is at line 39; replace with `await runAIPipeline(jobId, _signals)`, import from `./pipeline/run-pipeline`
- Key pitfall: Prisma 7 requires PrismaNeon adapter; postbuild must copy src/generated/prisma to dist/
- Severity mapping: Critical=4, High=3, Medium=2, Low=1; Phase 4 orders by severity DESC
- PERMITTED_MECHANISMS list (13 rules) defined in pipeline/types.ts — single source of truth for Stage 2 prompt + zod
- stage2-reasoner.ts: z.string().refine() used for mechanism validation (not z.enum() — TypeScript 6 readonly cast issue)
- run-pipeline.ts: NarrativeResult requires `as unknown as` double-cast for Prisma Json field type
