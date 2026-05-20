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
- [ ] 01-01-PLAN.md — Project scaffold, pnpm setup, all Phase 1 dependencies, Vitest config, .env.local template
- [ ] 01-02-PLAN.md — SSRF validator (src/lib/ssrf.ts) with 9 unit tests (TDD, RED→GREEN→REFACTOR)
- [ ] 01-03-PLAN.md — Prisma schema (Job/Result/Issue/CausalEdge), prisma.config.ts, lib singletons (prisma.ts, qstash.ts, redis.ts), shared types
- [ ] 01-04-PLAN.md — [BLOCKING] Prisma generate + pnpm db:push — apply schema to Neon
- [ ] 01-05-PLAN.md — API routes: POST /api/analyze + GET /api/jobs/[jobId] + GET /api/results/[jobId] + route unit tests
- [ ] 01-06-PLAN.md — Vercel Edge Middleware with dual rate limiters (5/hour + 20/day per IP, Upstash Redis)
- [ ] 01-07-PLAN.md — UI: AnalyzeForm + JobStatusBadge + (dashboard)/page.tsx — walking skeleton complete
- [ ] 01-08-PLAN.md — End-to-end smoke test + human verification checkpoint

### Phase 2: Crawler Service
**Goal**: A Railway-hosted Playwright container crawls submitted URLs in both mobile and desktop viewports, executes JavaScript for SPA hydration, and writes typed signal payloads (DOM, CSS, JS, network) to the database
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: CRAWL-02, CRAWL-03, SIG-01, SIG-02, SIG-03, SIG-04
**Success Criteria** (what must be TRUE):
  1. Submitting a React or Next.js SPA URL produces signal data that reflects the hydrated DOM — not the pre-JS HTML shell
  2. Each analysis job produces two signal sets: one captured at 375 px mobile viewport with network throttling, and one at 1440 px desktop viewport
  3. The database contains populated DOM signal records (layout depth, element counts, ARIA attributes, semantic markup quality, form structure, CTA visibility) for a completed job
  4. The database contains populated CSS, JS loading-behavior, and network/HAR signal records (animation count, paint-trigger properties, bundle sizes, async/deferred classification, request waterfall, render-blocking assets) for the same completed job
  5. The crawler completes and writes signals within the 60-second window defined by the job SLA
**Plans**: TBD

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
**Plans**: TBD

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
| 2. Crawler Service | 0/0 | Not started | - |
| 3. AI Pipeline | 0/0 | Not started | - |
| 4. Results Dashboard | 0/0 | Not started | - |
