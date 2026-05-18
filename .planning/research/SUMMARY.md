# Research Summary: FeelTrace

**Synthesized:** 2026-05-18
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md, PROJECT.md

---

## Executive Summary

FeelTrace is an AI-powered frontend UX intelligence platform that crawls a URL, extracts technical signals from the live rendered DOM, and produces a structured narrative explaining why users experience friction - not metric scores, but causal reasoning. It occupies a gap that Lighthouse, axe, PageSpeed, and WebPageTest leave open: none of those tools explain why issues matter to users in plain English, or connect signal chains from technical cause to perceived user experience. FeelTrace automates the translation work that currently requires a developer who understands both the tooling and the business context.

The recommended architecture splits cleanly into two runtime environments. Vercel hosts the Next.js dashboard, API routes, and job queue. A separate containerized service (Railway recommended for MVP) hosts the Playwright crawler - this split is non-negotiable. Vercel 250 MB function bundle limit is a hard blocker for Chromium; there is no workaround. The async bridge between them is Vercel Queues (poll-mode consumer on the crawler side), which decouples the crawl job lifecycle from the 60-second Vercel function timeout.

The AI pipeline must be structured in discrete stages: rule-based signal extraction, heuristic scoring, LLM-based reasoning, and LLM-based narration. A single-shot LLM call on raw page content is the most dangerous architectural mistake available - it produces confident-sounding hallucinations, costs 30-60x more per analysis, and destroys developer trust the moment one fabricated signal is caught. The structured pipeline enforces grounding: every LLM claim must reference a specific extracted value. Unit economics with this approach are viable at approximately 0.04 USD per analysis.

---

## 1. Recommended Stack

| Layer | Technology | Version | Confidence |
|-------|-----------|---------|------------|
| Framework | Next.js App Router | 15.x | HIGH - already established |
| Language | TypeScript | 5.x | HIGH - already established |
| Styling | Tailwind CSS | 4.x | HIGH - already established |
| Crawler library | playwright-core | 1.58.x | HIGH - Context7 verified |
| Crawler runtime | mcr.microsoft.com/playwright/node Docker image | v1.58.x | HIGH - official Playwright image |
| Crawler hosting | Railway (Docker container) | -- | HIGH - matches Vercel Queues poll pattern |
| Job queue | Vercel Queues | -- | HIGH - official Vercel docs |
| Database | Neon PostgreSQL | -- | HIGH - already established |
| ORM | Prisma | 6.x/7.x | HIGH - Context7 verified |
| Neon adapter | @prisma/adapter-neon | 6.x | HIGH - required for serverless |
| AI SDK | @anthropic-ai/sdk | 0.40+ | HIGH - Context7 verified |
| Schema validation | zod | 4.x | HIGH - required for messages.parse |

Critical installation note: Use playwright-core (no bundled browsers), NOT playwright (bundles ~170 MB of browsers). The Docker crawler image provides Chromium natively via the official Playwright base image.

Neon connection pattern: DATABASE_URL must use the PgBouncer pooler hostname (-pooler suffix, port 6543) for Vercel serverless functions. DIRECT_URL (port 5432, no pooler) is required separately for Prisma migrations. Skipping the pooler exhausts Neon connection limit under any real load.

AI model allocation per stage:
- Stage 1 (Score): claude-haiku-3-5 - fast, cheap, pattern matching only (~0.002 USD/analysis)
- Stage 2 (Reason): claude-sonnet-4-5 - cross-signal causal reasoning (~0.020 USD/analysis)
- Stage 3 (Narrate): claude-sonnet-4-5 - narrative quality matters; haiku produces flat prose (~0.015 USD/analysis)
- Total: ~0.04 USD/analysis - viable unit economics

---

## 2. Table Stakes Features

Features that must exist for FeelTrace to be taken seriously. Absence of any causes users to leave before validating core value.

| Feature | Why Non-Negotiable |
|---------|-------------------|
| URL input to analysis trigger | The entire product interaction; slow or unreliable = nothing else matters |
| Progress indication during crawl | Analysis takes 15-45s; no feedback = users assume the product is broken |
| Scored issue list with severity | Lighthouse/axe trained users to expect Critical / High / Medium / Low vocabulary |
| Actionable per-issue descriptions | Your LCP is 3.8s is useless; Hero image is 2.1 MB uncompressed with no lazy-loading is actionable |
| Plain-English narrative summary | 2-4 paragraphs; PM-readable without developer translation |
| SPA-aware crawl (React, Next.js, Vue) | Primary target audience uses SPAs; failure here means failure with the target market |
| Graceful failure states | Login-gated, paywalled, 500-error, bot-protected pages must return clear error messages |
| Shareable output | Developers need to paste findings into Jira/Slack/PRs; copy-to-clipboard or share link |
| Under-60-second turnaround | URL-paste tools that exceed a minute fail to retain users |

---

## 3. Differentiating Features

What separates FeelTrace from running a free Lighthouse report. These are the reason users return.

| Feature | Value Proposition | Complexity |
|---------|-------------------|-----------|
| Plain-English narrative | PMs and agencies can read output without a developer translator | HIGH - quality entirely AI pipeline dependent |
| Perceived vs technical performance distinction | Lighthouse scores technical reality; FeelTrace scores user perception | MEDIUM - requires custom scoring rubric |
| Friction chain causality graph | Shows why: render-blocking JS causes delayed LCP causes perceived slowness | HIGH - most novel; highest trust risk if wrong |
| PM-targeted severity framing | Issues ranked by user frustration potential, not byte savings | MEDIUM - requires UX psychology-informed scoring weights |
| Interaction friction detection | Identifies confusion patterns: hidden CTAs, form labeling, cognitive overload | HIGH - semantic DOM analysis beyond Lighthouse |
| Zero-install delivery | Value from a URL alone; no snippet, extension, or CI setup | LOW - already a constraint; surface as a feature |

Causality graph warning: This is simultaneously the most differentiating feature and the highest trust risk. A graph with 3-5 high-confidence, mechanism-grounded edges is more valuable than 20 speculative correlation-based edges. One incorrect causal edge caught by a developer will discredit the entire product.

Defer to v2: PDF/Notion export, historical analysis comparison, auth/saved history, CI integration, multi-page full-site crawl.

---

## 4. Critical Architecture Decisions

### Decision 1: Crawler CANNOT Run on Vercel - Use Railway + Docker

Non-negotiable hard constraint. Vercel maximum function bundle size is 250 MB uncompressed. The Playwright/Chromium binary is 200-400 MB. No workaround exists within Vercel platform.

Required split:
- Next.js dashboard + API routes -> Vercel
- Playwright crawler -> Railway Docker container (mcr.microsoft.com/playwright/node:v1.58.x-noble)
- Bridge -> Vercel Queues (Railway service polls in poll-mode consumer pattern)

Migration path (in order): Railway (MVP) -> Fly Machines (scale-to-zero, if cost matters at scale) -> Browserless.io (fully managed, if ops burden grows). Do not pre-optimize.

Also viable but higher ops: AWS Lambda + @sparticuz/chromium Lambda Layer. Railway is lower-ops for MVP (no Lambda Layers, no IAM policies, no cold starts).

### Decision 2: Vercel Queues as the Async Bridge

Crawl duration is 15-45 seconds. A synchronous crawl-in-API-route will intermittently timeout and produces broken UX.

Required async pattern:
1. POST /api/analyze - SSRF validation, creates job (status pending), publishes to Vercel Queues, returns { jobId } immediately
2. Client polls GET /api/jobs/[jobId] every 2-3 seconds
3. Railway service polls Vercel Queues, executes crawl + AI pipeline, writes results, sets status complete
4. Client detects complete, fetches GET /api/results/[jobId], renders output

### Decision 3: Structured 3-Stage AI Pipeline - No Single-Shot LLM Calls

Three discrete, independently testable stages. The LLM never sees raw HTML, CSS, or JavaScript source.

| Stage | Model | Task | Token Budget |
|-------|-------|------|-------------|
| 1: Score | claude-haiku-3-5 | Rule-based signals -> typed ScoredIssue list | ~2K in / ~1K out |
| 2: Reason | claude-sonnet-4-5 | Identify causal edges between issues (mechanism-grounded) | ~4K in / ~2K out |
| 3: Narrate | claude-sonnet-4-5 | Executive summary, developer actions, perceived vs technical | ~3K in / ~2K out |

Use client.messages.parse with zodOutputFormat from @anthropic-ai/sdk. This returns typed, schema-validated output - no manual JSON.parse needed.

### Decision 4: CausalEdge Schema Requires mechanism Field (Non-Nullable)

Every CausalEdge record must have a mechanism field stating the specific technical mechanism connecting cause to consequence. If the pipeline cannot populate this field with something specific, the edge must not be created. This is a schema-level constraint enforced at the database layer.

Correct mechanism examples:
- Script X is render-blocking AND loads before LCP element -> blocks HTML parser, delays LCP
- CSS contains font-display block -> FOIT: text invisible until font loads (spec-defined behavior)

Incorrect correlation-only rule to avoid: Bundle greater than 500 KB AND LCP greater than 2.5s -> no confirmed mechanism without checking whether the bundle is on the critical rendering path.

### Decision 5: JS Signal Scope Is Loading Behavior Only, Not Code Quality

Minified production JavaScript is unanalyzable for code quality. JS signal extraction must be scoped strictly to:
- Total transfer size and per-chunk sizes
- Render-blocking vs async/deferred status
- Third-party domain count
- Framework fingerprint detection (via __NEXT_DATA__, window.__nuxt, etc.)
- Script execution timing via page.metrics()

Source map analysis is optional enrichment only - never a required path. Do not claim code quality analysis features that depend on source maps.

---

## 5. Top 5 Pitfalls Ranked by Severity

### Pitfall 1 (CRITICAL): Running Playwright in Vercel Functions

Severity: Product-killing rewrite trigger.
What happens: 250 MB bundle limit causes deployment failure or OOM. SPA hydration (6-12s for React/Next.js pages) exceeds function timeout. Non-deterministic Analysis failed errors destroy user trust.
Prevention: Playwright in a dedicated Docker container on Railway from day one. Never import playwright or playwright-core in any file under src/app/api/.

### Pitfall 2 (CRITICAL): LLM Hallucinating UX Problems That Do Not Exist

Severity: Existential trust failure with developers - the most skeptical user segment.
What happens: Claude invents signal values or fabricates causal chains. A developer checks DevTools, finds nothing matching the analysis, and tells their network the tool is broken.
Prevention: Enforce extract -> score -> explain -> narrate pipeline. LLM only explains scored issues using provided signal values. Every LLM claim must reference a specific extracted value via a signal_reference field. Never pass raw HTML/CSS/JS to any LLM prompt.

### Pitfall 3 (CRITICAL): Correlation-Based Causality Graph Edges

Severity: Same trust failure as Pitfall 2, specifically targeting the most differentiating feature.
What happens: Graph shows Large JS Bundle causes Slow LCP when the bundle is fully async/deferred and causally irrelevant to LCP. One expert user catches this and it circulates.
Prevention: mechanism field non-nullable in CausalEdge schema. Cap MVP graph at 3-5 high-confidence edges. LLM prompt must include: Only draw an edge if you can state the specific technical mechanism. Do not infer from correlation.

### Pitfall 4 (HIGH): Token Cost Death Spiral

Severity: Runway destruction on launch day.
What happens: A popular link sends 2,000 analyses. At 400K-800K tokens each on the raw HTML path, that is 960-1920 USD in input tokens in one day.
Prevention: LLM never receives raw source. Structured signal JSON is 2,000-8,000 tokens per analysis. Enforce max_tokens per stage. Log cost_estimate_usd per analysis from the first run. Alert at 0.05 USD/analysis.

### Pitfall 5 (HIGH): No Rate Limiting Before Public Launch

Severity: Cost blowout + service disruption + SSRF security risk.
What happens: A bot submits 10,000 analysis jobs. At 0.05 USD each, 500 USD/hour in AI spend. Playwright workers saturate. Without SSRF validation, internal services are reachable.
Prevention (layered):
1. IP rate limit: 5 analyses/IP/hour, 20/day - Vercel Edge Middleware + Upstash Redis
2. Queue depth cap: 50 pending jobs max; return 503 + retry guidance beyond cap
3. Per-analysis circuit breaker: abort if Playwright time > 60s or Claude input > 100K tokens
4. SSRF validation: reject RFC-1918 IPs, loopback, link-local, non-http/https schemes - server-side before any crawl starts

---

## 6. Recommended Build Order

Dependencies are strict. AI pipeline cannot be tested without signals. Signals cannot be extracted without the crawler. The crawler cannot be built without a job model.

### Phase 1: Data Foundation + Infrastructure + Security Baseline

Delivers: Working job lifecycle from URL submission to status polling; crawler infrastructure deployed; security in place before any public URL is shared.

1. Prisma schema: Job, Result, Issue, CausalEdge tables - mechanism field non-nullable on CausalEdge
2. Neon setup: DATABASE_URL (pooler, port 6543) + DIRECT_URL (direct, port 5432)
3. POST /api/analyze - SSRF validation -> create job -> publish to Vercel Queues -> return { jobId }
4. GET /api/jobs/[id] - status polling route
5. Basic dashboard: URL input form, status polling display, progress indication
6. Rate limiting: Vercel Edge Middleware + Upstash Redis (IP-based + queue depth cap)
7. SSRF validation utility (shared module, used by API route)

Research flags: Standard patterns - no phase-level research sprint needed.
Pitfalls addressed: Playwright in Vercel functions (prevented by architecture), no rate limiting, no SSRF validation.

### Phase 2: Crawler Service

Delivers: Real extracted signals from live URLs flowing into the database.

1. Dockerfile: mcr.microsoft.com/playwright/node:v1.58.x-noble base image
2. Railway deployment + Vercel Queues poll-mode consumer wired up
3. Playwright wait strategy: domcontentloaded + waitForSelector on above-fold content (not networkidle)
4. URL integrity checks: compare submitted URL vs page.url() post-navigation; detect password fields = login page
5. Bot detection: check for Cloudflare challenge headers, empty body + script-only pattern; surface as clear error
6. DOM extractor: layout depth, element counts, ARIA presence, semantic markup, form structure
7. Network/HAR extractor: context.tracing.startHar() - waterfall, render-blocking, CDN usage, image sizes
8. CSS extractor: animation count, paint-trigger properties, font-display values, layout complexity
9. JS extractor (loading behavior only): bundle sizes, async/deferred status, third-party domains, framework fingerprint, page.metrics() timing
10. Signal serialization: write typed signal objects to Neon; update job status transitions

Research flags: Test against Next.js 15 + Suspense pages before finalizing wait strategy. Survey bot detection coverage on target site types before building stealth config.
Pitfalls addressed: JS code quality on minified bundles, bot detection silent failures, auth-gated URL misattribution.

### Phase 3: AI Pipeline

Delivers: Structured analysis with scored issues, causality graph, and plain-English narrative.

1. Stage 1 (Score) with claude-haiku-3-5: zodOutputFormat schema -> ScoredIssue[]; validate structured output
2. Stage 2 (Reason) with claude-sonnet-4-5: CausalEdge[] with mechanism-grounded rules only; cap at 5 edges
3. Stage 3 (Narrate) with claude-sonnet-4-5: executive summary, developer actions, perceived/technical distinction
4. Wire stages sequentially in crawler service; each stage independently logged and testable
5. Write Result, Issue, CausalEdge records to Neon; update job status to complete
6. Cost instrumentation: cost_estimate_usd logged per analysis from first run; alert at 0.05 USD/analysis

Research flags: Causality mechanism rule set must be explicitly defined before Stage 2 is built (not delegated entirely to the LLM). Prompt grounding constraints need validation against 3+ real sites before launch. Scoring thresholds for CLS/LCP/INP/Long Tasks must be defined before Stage 1 scoring logic is written.
Pitfalls addressed: Single-shot LLM call, correlation-based causality edges, token cost spiral, perceived/technical conflation (CLS/LCP/INP are the right perceived signals; TTFB is not).

### Phase 4: Results Dashboard

Delivers: Full end-to-end experience from URL input to shareable, readable results page.

1. GET /api/results/[jobId] - serialize { narrative, issues, graphData } from DB
2. Narrative display: executive summary + developer action list + perceived/technical distinction
3. Issue list: severity-ranked, per-issue explanation with signal reference visible
4. Causality graph: React Flow (@xyflow/react) - DAG layout, technical causes flow toward perceived effects
5. Share link: URL-based, no auth required in MVP
6. End-to-end integration test: real URL -> full pipeline -> rendered results
7. Error states: bot-protected, login-gated, 500, timeout - all with clear user-facing messages

Research flags: Standard frontend patterns - no deep research sprint needed.
Pitfalls addressed: Displaying speculative causality edges, surfacing raw metric scores as primary output (would make FeelTrace look like a worse Lighthouse).

---

## 7. Open Questions

Ordered by when they block progress.

| Question | Blocks | Resolution Path |
|----------|--------|----------------|
| Vercel Queues plan availability - Hobby or Pro only? | Phase 1 | Check Vercel billing page before starting. If unavailable, substitute Upstash QStash (same poll pattern). |
| Railway poll latency - what delay does Vercel Queues poll mode introduce, and is it acceptable for UX? | Phase 1 | Test during Phase 1 setup. If delay > 5s consistently, consider HTTP callback from crawler instead of polling. |
| Playwright wait strategy for React Suspense + Next.js streaming - does waitForSelector on a generic above-fold element work reliably? | Phase 2 | Test against a real Next.js 15 + Suspense app during Phase 2. Document fallback strategy. |
| Causality mechanism rule set - who defines initial rules and how many at launch? | Phase 3 | Define 10-15 mechanism-grounded rules covering CLS, LCP, INP, font blocking, render-blocking scripts before Stage 2 prompt is written. |
| AI narrative quality bar - what does good enough look like and who validates? | Phase 3 | Requires 3+ real-site test analyses reviewed by someone matching the PM persona. Do not launch without this validation. |
| Perceived performance scoring thresholds - what CLS, LCP, INP, Long Task values map to severity 1-5? | Phase 3 | Must be defined before Stage 1 scoring logic is written. Use Chrome UX Report P75 thresholds as baseline. |
| SSRF DNS rebinding risk - is there a TOCTOU race between DNS validation and Playwright actual connection? | Phase 1 | Mitigate via Playwright network interception: block all requests to RFC-1918 destinations at the browser request level, not only at URL validation time. |
| Bot detection coverage - which protection vendors are most common on target sites? | Phase 2 | Survey a sample of 20 target-type sites before building stealth configuration. Adjust playwright-extra stealth plugins accordingly. |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core decisions Context7-verified; Playwright + Railway architecture validated against official Vercel limits |
| Features (established tools) | HIGH | Lighthouse, axe, PageSpeed, WebPageTest gap analysis is reliable; these tools are stable and well-documented |
| Features (AI UX tool landscape) | MEDIUM | Space moves fast; new entrants possible since Aug 2025 cutoff; spot-check before roadmap finalization |
| Architecture | HIGH | Vercel limits documented to 2026-02-24; queue pattern from official Vercel Queues docs; component boundaries are clean |
| Pitfalls | HIGH | Core failure modes are well-documented across Playwright ops, LLM pipelines, and web vitals domains |
| AI pipeline cost estimates | MEDIUM | Based on training knowledge of Claude pricing; verify current Anthropic pricing before setting budget alerts |
| What devs/PMs want | MEDIUM | Based on community patterns through Aug 2025; no fresh user research conducted |

Overall: HIGH on technical architecture and stack. MEDIUM on competitive landscape details and current pricing.

---

## Aggregated Sources

HIGH confidence (Context7 / official docs):
- Context7 /microsoft/playwright: Coverage API, HAR recording, network timing, Docker images (v1.58.x, v1.59.0)
- Context7 /sparticuz/chromium: Lambda Layer patterns (documented; Railway/Docker preferred for MVP)
- Context7 /anthropics/anthropic-sdk-typescript: messages.parse, zodOutputFormat, structured output (SDK 0.40+)
- Context7 /prisma/web: Neon adapter, serverless connection pooling, Vercel Fluid compute pattern (Prisma 6.x/7.x)
- Vercel Function Limits (official docs, 2026-02-24): https://vercel.com/docs/functions/limitations
- Vercel Queues Concepts (official docs, 2026-02-27): https://vercel.com/docs/queues/concepts
- Project constraints: .planning/PROJECT.md

HIGH confidence (training knowledge, stable tools):
- Lighthouse, axe-core, PageSpeed Insights, WebPageTest feature inventory
- Core Web Vitals specification (INP replacing FID in Chrome 2024)
- OWASP SSRF Prevention Cheat Sheet
- Google CLS/LCP/INP perceived performance research

MEDIUM confidence (training knowledge, fast-moving):
- AI UX tool competitive landscape (August 2025 cutoff; verify before finalizing positioning)
- Anthropic Claude API pricing (verify current rates before setting cost alerts)
- What frontend devs and PMs want from UX tools (community patterns, not fresh research)
