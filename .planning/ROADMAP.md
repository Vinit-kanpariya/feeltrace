# FeelTrace — Roadmap

*Generated: 2026-05-18*

---

## Phases

- [ ] **Phase 1: Data Foundation & Security Baseline** - Job lifecycle, DB schema, SSRF protection, rate limiting, and status polling before any public URL is accepted
- [ ] **Phase 2: Crawler Service** - Playwright on Railway extracts DOM, CSS, JS, and network signals from live SPA pages
- [ ] **Phase 3: AI Pipeline** - Three-stage scoring → reasoning → narration pipeline converts raw signals into structured issues and plain-English output
- [ ] **Phase 4: Results Dashboard** - Full UI delivers ranked issue list, narrative summary, causality graph, and shareable links

---

## Phase Details

### Phase 1: Data Foundation & Security Baseline
**Goal**: The system accepts a URL safely, creates an async analysis job, persists results, and surfaces job progress to the user — all security controls enforced before a single crawl runs
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, CRAWL-01
**Success Criteria** (what must be TRUE):
  1. User submits a URL and immediately receives a job ID; the UI begins polling and displays a progress state (queued → crawling → extracting → analyzing → complete)
  2. Submitting a private IP address, localhost, or cloud metadata endpoint (169.254.x.x) returns a validation error — no crawl is triggered
  3. An IP that submits more than the configured rate limit receives a 429 response; subsequent requests are blocked without queuing a job
  4. Completed analysis results (issues, narrative, causal edges) are readable from the database; raw signal payloads are absent from persistent storage
  5. The job-status polling endpoint returns the correct state at each transition throughout the full job lifecycle
**Plans:** 8 plans

Plans:

**Wave 1** *(no dependencies — start here)*
- [ ] 01-01-PLAN.md — Project scaffold, pnpm setup, all Phase 1 dependencies, Vitest config, .env.local template

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 01-02-PLAN.md — SSRF validator (src/lib/ssrf.ts) with 9 unit tests (TDD, RED→GREEN→REFACTOR)
- [ ] 01-03-PLAN.md — Prisma schema (Job/Result/Issue/CausalEdge), prisma.config.ts, lib singletons (prisma.ts, qstash.ts, redis.ts), shared types

**Wave 3** *(blocked on Wave 2 completion — schema must exist before push)*
- [ ] 01-04-PLAN.md — [BLOCKING] Prisma generate + pnpm db:push — apply schema to Neon

**Wave 4** *(blocked on Wave 3 completion — generated client must exist)*
- [ ] 01-05-PLAN.md — API routes: POST /api/analyze + GET /api/jobs/[jobId] + GET /api/results/[jobId] + route unit tests
- [ ] 01-06-PLAN.md — Vercel Edge Middleware with dual rate limiters (5/hour + 20/day per IP, Upstash Redis)

**Wave 5** *(blocked on Wave 4 completion — API routes must exist before UI wires to them)*
- [ ] 01-07-PLAN.md — UI: AnalyzeForm + JobStatusBadge + (dashboard)/page.tsx — walking skeleton complete

**Wave 6** *(blocked on Wave 5 completion)*
- [ ] 01-08-PLAN.md — End-to-end smoke test + human verification checkpoint

**Cross-cutting constraints:** `src/lib/ssrf.ts` used by POST /api/analyze (01-02 → 01-05); `src/generated/prisma` must exist before any API route compiles (01-04 → 01-05, 01-06, 01-07); `"use client"` required on AnalyzeForm and JobStatusBadge

### Phase 2: Crawler Service
**Goal**: A Railway-hosted Playwright container crawls submitted URLs in both mobile and desktop viewports, executes JavaScript for SPA hydration, and writes typed signal payloads (DOM, CSS, JS, network) to the database
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: CRAWL-02, CRAWL-03, SIG-01, SIG-02, SIG-03, SIG-04
**Success Criteria** (what must be TRUE):
  1. Submitting a React or Next.js SPA URL produces signal data that reflects the hydrated DOM — not the pre-JS HTML shell
  2. Each analysis job produces two signal sets: one captured at 375 px mobile viewport with network throttling, and one at 1440 px desktop viewport
  3. Crawler logs confirm populated DOM signal payloads (layout depth, element counts, ARIA attributes, semantic markup quality, form structure, CTA visibility) for both mobile and desktop passes — signals are in-memory per INFRA-03, not written to DB
  4. Crawler logs confirm populated CSS, JS loading-behavior, and network/HAR signal payloads (animation count, paint-trigger properties, bundle sizes, async/deferred classification, request waterfall, render-blocking assets) for both passes — signals passed to Phase 3 pipeline, not persisted raw
  5. The crawler completes and writes signals within the 60-second window defined by the job SLA
**Plans:** 6 plans

Plans:

**Wave 1** *(no dependencies — start here)*
- [ ] 02-01-PLAN.md — crawler/ sub-project scaffold: package.json, tsconfig, Dockerfile, railway.toml, signal type contracts, Prisma client singleton

**Wave 2** *(blocked on Wave 1 completion — scaffold must exist)*
- [ ] 02-02-PLAN.md — Hono server with /health + /crawl routes, QStash signature verification (raw body), p-queue singleton (concurrency: 1), server entry point

**Wave 3** *(blocked on Wave 1 completion — parallel: 02-03 and 02-04 run simultaneously)*
- [ ] 02-03-PLAN.md — Playwright browser lifecycle: dual viewport crawl, SPA hydration wait (domcontentloaded + waitForFunction), SSRF Layer 2, DOM extractor (SIG-01) + unit tests, CSS extractor (SIG-02)
- [ ] 02-04-PLAN.md — JS signal extractor (SIG-03) + unit tests, Network/HAR extractor (SIG-04) + unit tests, fixture HAR file

**Wave 4** *(blocked on Wave 2 + Wave 3 completion — all extractors must exist before wiring)*
- [ ] 02-05-PLAN.md — Job processor: status transitions (pending→crawling→extracting→analyzing→complete), 55s SLA timeout, idempotency check, all four extractors wired

**Wave 5** *(blocked on Wave 4 completion)*
- [ ] 02-06-PLAN.md — [HUMAN CHECKPOINT] Railway deployment, env var setup, end-to-end verification with a Next.js SPA URL

**Cross-cutting constraints:** `crawler/src/lib/types.ts` (02-01) is the canonical signal type source — all extractors import from it; CSS/JS coverage must stop before `context.close()` and HAR must be read after `context.close()` (Pitfall 4); 02-03 and 02-04 run in parallel (Wave 3) — no file overlap

### Phase 3: AI Pipeline
**Goal**: The three-stage AI pipeline converts raw signals into a scored issue list, a mechanism-grounded causality graph, and a plain-English narrative distinguishing perceived from technical performance
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: AI-01, AI-02, AI-03, AI-04
**Success Criteria** (what must be TRUE):
  1. Every issue in the output carries a severity label (Critical / High / Medium / Low) derived from deterministic rule thresholds — not from LLM inference
  2. Each causality edge in the output has a non-null mechanism field stating the specific technical mechanism; no edge is created from correlation alone
  3. The narrative output includes a section that explicitly distinguishes perceived performance (how slow it feels) from technical performance (what the metrics say)
  4. The narrative is written at a level readable by a non-engineer — a PM or UX lead can understand the findings without a developer translator
**Plans:** 5 plans

Plans:

**Wave 1** *(no dependencies — start here)*
- [ ] 03-01-PLAN.md — [HUMAN CHECKPOINT] Provision ANTHROPIC_API_KEY + install @anthropic-ai/sdk in crawler/

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 03-02-PLAN.md — Pipeline type contracts (types.ts) + Stage 1 deterministic scorer + unit tests (AI-01, AI-04)

**Wave 3** *(blocked on Wave 2 completion — types must exist; plans 03-03 and 03-04 run in parallel)*
- [ ] 03-03-PLAN.md — Anthropic SDK singleton (lib/anthropic.ts) + Stage 2 LLM reasoner + zod validation tests (AI-02)
- [ ] 03-04-PLAN.md — Stage 3 LLM narrator + parser tests + run-pipeline.ts orchestrator with DB transaction (AI-03, AI-04)

**Wave 4** *(blocked on Wave 3 completion — all pipeline files must exist before wiring)*
- [ ] 03-05-PLAN.md — [HUMAN CHECKPOINT] Wire runAIPipeline into processor.ts + end-to-end smoke test

**Cross-cutting constraints:** `crawler/src/pipeline/types.ts` (03-02) is the canonical pipeline type source — all pipeline files import from it; 03-03 and 03-04 run in parallel (Wave 3) — no file overlap; ANTHROPIC_API_KEY must be set in crawler/.env before any Wave 3+ execution

### Phase 4: Results Dashboard
**Goal**: Users can view ranked issues, the plain-English narrative, and the causality graph on a results page — and share the analysis with teammates via a persistent link, without creating an account
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04
**Success Criteria** (what must be TRUE):
  1. The results page displays issues ordered by UX impact severity (Critical first), with each issue showing its plain-English explanation and the specific signal evidence that triggered it
  2. The plain-English narrative summary is the first and most prominent section on the results page — visible without scrolling on a standard desktop viewport
  3. When the causality graph meets the credibility threshold, a directed graph renders with technical cause nodes flowing toward perceived effect nodes; the graph is absent (not empty) when the threshold is not met
  4. A user can copy a share URL for an analysis and open it in a new browser session without logging in — the full results are visible to anyone with the link
**Plans**: TBD
**UI hint**: yes

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Foundation & Security Baseline | 0/8 | Planning complete | - |
| 2. Crawler Service | 0/6 | Planning complete | - |
| 3. AI Pipeline | 3/5 | In progress | - |
| 4. Results Dashboard | 0/0 | Not started | - |
