# Architecture Patterns

**Domain:** AI-powered frontend UX intelligence (crawler + signal extraction + AI pipeline + dashboard)
**Researched:** 2026-05-18
**Confidence:** HIGH (Vercel limits verified from official docs; Playwright patterns from Context7/official; design patterns from domain knowledge)

---

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Next.js on Vercel                       │
│                                                          │
│  ┌──────────────┐    ┌──────────────────────────────┐   │
│  │  Dashboard   │    │  API Routes                  │   │
│  │  (React RSC) │    │  POST /api/analyze → submit  │   │
│  │              │    │  GET  /api/jobs/[id] → poll   │   │
│  │  ┌─────────┐ │    │  GET  /api/results/[id]       │   │
│  │  │Narrative│ │    └──────────────┬───────────────┘   │
│  │  │Issues   │ │                   │                    │
│  │  │Causality│ │                   │ publish msg        │
│  │  │Graph    │ │    ┌──────────────▼───────────────┐   │
│  └──────────────┘    │  Vercel Queues (topic:crawl) │   │
│                      └──────────────┬───────────────┘   │
└─────────────────────────────────────┼───────────────────┘
                                      │ poll (external consumer)
                          ┌───────────▼───────────┐
                          │  Crawler Service       │
                          │  (Railway / Fly.io /   │
                          │   self-hosted Docker)  │
                          │                        │
                          │  Playwright + Chromium │
                          │  Signal Extractors     │
                          │  POST result → API     │
                          └───────────┬────────────┘
                                      │ HTTP callback
                          ┌───────────▼────────────┐
                          │  AI Pipeline           │
                          │  (Vercel Function or   │
                          │   same crawler svc)    │
                          │                        │
                          │  Stage 1: Score        │
                          │  Stage 2: Reason       │
                          │  Stage 3: Narrate      │
                          └───────────┬────────────┘
                                      │ write results
                          ┌───────────▼────────────┐
                          │  PostgreSQL (Neon)     │
                          │  jobs table            │
                          │  results table         │
                          │  issues table          │
                          │  causality_edges table │
                          └────────────────────────┘
```

---

## Crawler Hosting Decision (Critical)

### Why Vercel Cannot Run Playwright

Verified from official Vercel documentation (2026-02-24):

| Constraint | Value | Impact on Playwright |
|------------|-------|---------------------|
| Max bundle size (uncompressed) | 250 MB | Chromium headless binary alone is ~200-400 MB — **hard block** |
| Max memory | 2 GB (Hobby), 4 GB (Pro) | Technically sufficient, but bundle limit is the blocker |
| Max duration | 300s (Hobby), 800s (Pro) | Sufficient for crawl if bundle weren't the problem |
| `/tmp` writable space | 500 MB | Would suffice for HAR files, but binary install is blocked |
| File descriptors | 1,024 shared | Chromium opens many descriptors — risky at scale |

**Verdict: Playwright cannot run on Vercel Functions. The 250 MB bundle limit is a hard blocker — Chromium cannot be bundled into the deployment.**

### Real Options for the Crawler (2025/2026)

**Option A: Railway (Recommended for MVP)**
- Deploys any Docker container from `mcr.microsoft.com/playwright/node:v1.x-noble`
- Persistent process: crawler polls Vercel Queues, no incoming port needed
- Memory: configurable up to 32 GB on paid plans; 512 MB–1 GB free tier
- Cost: ~$5/month for a 512 MB service that runs 24/7 or on-demand
- No cold start latency vs. serverless options
- Simple ops: push a Docker image, Railway runs it
- **Tradeoff:** Always-on billing even when idle; need to manage one non-Vercel service

**Option B: Fly.io**
- Identical capability to Railway — Docker containers, Playwright-compatible
- Machines API allows programmatic spin-up/down (pay only when running)
- More operational overhead than Railway
- Fly Machines can be triggered via API from a Vercel function, scaling to zero between analyses
- **Tradeoff:** More complex ops than Railway; Fly Machines API adds complexity

**Option C: Browserless.io (Managed Playwright)**
- Hosted Playwright/Puppeteer API — connect via WebSocket (`ws://chrome.browserless.io`)
- No infrastructure to manage; they handle Chromium lifecycle
- Playwright supports connecting to remote browsers via `browser.connect(wsEndpoint)`
- Pricing is usage-based (sessions/minute); adds per-analysis cost
- Cold start can be 1-3 seconds per session
- **Tradeoff:** Vendor lock-in; adds per-request cost; less control over browser environment

**Option D: Modal.com**
- Serverless containers with GPU/CPU, supports Playwright natively
- Function timeout: up to 24 hours (no practical limit for crawl jobs)
- Pay-per-second billing, scales to zero
- Requires Python SDK primarily (Node.js support is limited/community)
- **Tradeoff:** Not TypeScript-native; adds a Python service to a TypeScript codebase

**Option E: Trigger.dev v3**
- Background job runner with Playwright support via custom base images
- Task timeouts up to 1 hour on Pro
- Stays in the Node.js/TypeScript ecosystem
- Managed infrastructure; no Docker ops
- **Tradeoff:** Another vendor dependency; slightly less control than Railway

### Recommendation

**Use Railway for MVP.** Rationale:
1. Stays in Docker/Node.js — same TypeScript codebase
2. No cold starts — crawler is always ready (important for UX)
3. Simple operational model — one Dockerfile, Railway handles the rest
4. Vercel Queues poll mode is designed exactly for this: external consumers polling a Vercel-hosted queue
5. If traffic grows: migrate to Fly Machines (scale to zero) or Browserless (managed)

**Migration path:** Railway (MVP) → Browserless.io (if ops burden grows) or Fly Machines (if cost at scale matters)

---

## Component Boundaries

| Component | Responsibility | Communicates With | Runtime |
|-----------|---------------|-------------------|---------|
| Next.js Dashboard | User input form, job status polling, results rendering, causality graph | API Routes (HTTP), Neon (via Prisma) | Vercel |
| API Route: POST /api/analyze | Validate URL, create job record (status=pending), publish to Vercel Queues | Neon, Vercel Queues | Vercel Function |
| API Route: GET /api/jobs/[id] | Return job status for frontend polling | Neon | Vercel Function |
| API Route: POST /api/results/callback | Receive completed results from crawler service | Neon, AI Pipeline | Vercel Function |
| Vercel Queues (topic: crawl-jobs) | Durable job queue; at-least-once delivery; bridges Vercel and external crawler | Crawler Service (poll mode) | Vercel managed |
| Crawler Service | Poll queue for jobs, run Playwright, extract signals, invoke AI pipeline, POST results | Vercel Queues (poll), Neon (direct or via callback), Claude API | Railway Docker |
| Signal Extractors (4 modules) | DOM, CSS, JS bundle, Network HAR — each produces a typed signal object | Crawler Service (internal) | Crawler Service |
| AI Pipeline (3 stages) | Score → Reason → Narrate; structured Claude API calls | Claude API, Neon | Crawler Service or Vercel Function |
| Neon PostgreSQL | Persistent storage for jobs, results, issues, causality graph edges | All server-side components | Neon managed |

---

## Data Flow

### Submit-to-Result Flow

```
1. User submits URL in dashboard
   → POST /api/analyze
   → Create job: { id, url, status: "pending", created_at }
   → Publish to Vercel Queues: { jobId, url }
   → Return { jobId } to client

2. Client polls GET /api/jobs/[jobId] every 2 seconds
   → Returns { status: "pending"|"crawling"|"analyzing"|"complete"|"failed" }

3. Crawler service (Railway) polls Vercel Queues
   → Receives { jobId, url }
   → Updates job status to "crawling" via callback or direct DB write
   → Launches Playwright browser
   → Runs 4 signal extractors in parallel (DOM, CSS, JS, Network)
   → Closes browser, discards raw HTML/scripts (privacy)
   → Updates job status to "analyzing"
   → Runs AI pipeline (3 stages)
   → Writes structured results to Neon
   → Updates job status to "complete"

4. Client poll detects status="complete"
   → Fetches GET /api/results/[jobId]
   → Renders narrative, issue list, causality graph
```

### Signal Extraction Flow (within Crawler Service)

```
Playwright Page Load
  ↓
  ├── DOM Extractor    → DOMSignals { layoutDepth, elementCount, ariaIssues, semanticScore, formStructure }
  ├── CSS Extractor    → CSSSignals { animationCount, layoutComplexity, paintTriggers, fontLoadStrategy }
  ├── JS Extractor     → JSSignals  { bundleSize, blockingScripts, framework, asyncPatterns }
  └── Network Extractor → NetworkSignals { harEntries, renderBlocking, cdnUsage, imageOptimization }
                                 ↓
                         RawSignals (aggregated)
```

HAR recording: use `context.tracing.startHar('trace.har')` and `context.tracing.stopHar()`. Verified from Playwright official docs — this captures all network requests with timing.

---

## AI Pipeline Stage Design

### Overview

Three sequential stages, each a separate Claude API call with structured output (tool use / JSON schema). Keeping stages separate is non-negotiable: it allows independent debugging, cost monitoring, and prompt iteration.

### Stage 1: Score

**Input:**
```typescript
interface ScoreInput {
  domSignals: DOMSignals;
  cssSignals: CSSSignals;
  jsSignals: JSSignals;
  networkSignals: NetworkSignals;
}
```

**Task:** Convert raw signals into a typed issue list with severity scores. This stage uses rule-based heuristics first (fast, cheap), then passes ambiguous cases to Claude for scoring.

**Output:**
```typescript
interface ScoredIssue {
  id: string;
  category: "perceived_performance" | "interaction_friction" | "accessibility" | "load_performance";
  signal_source: "dom" | "css" | "js" | "network";
  severity: 1 | 2 | 3 | 4 | 5;  // 1=minor, 5=critical
  raw_evidence: string;  // specific signal value that triggered this
  technical_description: string;  // machine-readable
}
```

**Model:** claude-haiku-3-5 (fast, cheap — this is pattern matching, not deep reasoning)
**Token budget:** ~2K input, ~1K output

### Stage 2: Reason

**Input:** Array of ScoredIssues + original signals
**Task:** Identify causal relationships between issues. "Issue A (blocking JS) causes Issue B (slow LCP) which causes Issue C (user perceives slowness)."

**Output:**
```typescript
interface ReasonOutput {
  issues: ScoredIssue[];  // may refine scores from Stage 1
  causalEdges: CausalEdge[];  // the causality graph edges
}

interface CausalEdge {
  fromIssueId: string;
  toIssueId: string;
  relationship: "causes" | "amplifies" | "masks";
  confidence: "high" | "medium" | "low";
  explanation: string;  // one sentence
}
```

**Model:** claude-sonnet-4-5 (needs cross-signal reasoning capability)
**Token budget:** ~4K input, ~2K output

### Stage 3: Narrate

**Input:** ScoredIssues + CausalEdges (Stage 2 output)
**Task:** Write the human narrative. Separate paragraphs for: (1) executive summary for PMs, (2) developer action list, (3) perceived vs. technical performance distinction.

**Output:**
```typescript
interface NarrateOutput {
  executiveSummary: string;     // 2-3 sentences, PM-readable
  developerActions: string[];   // ordered by impact, each actionable
  perceivedVsTechnical: string; // explains the distinction for this specific page
  overallFrictionScore: number; // 0.0-10.0, higher = more friction
}
```

**Model:** claude-sonnet-4-5 (narrative quality matters; haiku produces flat prose)
**Token budget:** ~3K input, ~2K output

### Total cost estimate per analysis

- Stage 1 (haiku): ~$0.002
- Stage 2 (sonnet): ~$0.02
- Stage 3 (sonnet): ~$0.015
- **Total: ~$0.04 per analysis** — viable unit economics

---

## Causality Graph Data Model

### Why a Graph

The causality graph is the core differentiator. It needs to support: (1) directed edges (causes flow from technical to perceived), (2) multi-hop chains (A → B → C), (3) frontend rendering as a force-directed or DAG layout.

### Schema

```typescript
// Postgres tables (Prisma schema)

model Job {
  id          String   @id @default(cuid())
  url         String
  status      JobStatus
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  result      Result?
}

model Result {
  id          String   @id @default(cuid())
  jobId       String   @unique
  job         Job      @relation(fields: [jobId], references: [id])
  narrative   Json     // NarrateOutput
  issues      Issue[]
  edges       CausalEdge[]
  created_at  DateTime @default(now())
}

model Issue {
  id                   String       @id @default(cuid())
  resultId             String
  result               Result       @relation(fields: [resultId], references: [id])
  category             String       // perceived_performance | interaction_friction | etc
  signal_source        String       // dom | css | js | network
  severity             Int          // 1-5
  raw_evidence         String
  technical_description String
  causedBy             CausalEdge[] @relation("ToIssue")
  causes               CausalEdge[] @relation("FromIssue")
}

model CausalEdge {
  id           String  @id @default(cuid())
  resultId     String
  result       Result  @relation(fields: [resultId], references: [id])
  fromIssueId  String
  fromIssue    Issue   @relation("FromIssue", fields: [fromIssueId], references: [id])
  toIssueId    String
  toIssue      Issue   @relation("ToIssue", fields: [toIssueId], references: [id])
  relationship String  // causes | amplifies | masks
  confidence   String  // high | medium | low
  explanation  String
}
```

### Frontend Graph Representation

For rendering the causality graph in the dashboard, serialize to this wire format:

```typescript
interface GraphData {
  nodes: {
    id: string;
    label: string;          // short technical_description
    severity: number;       // 1-5, controls node size/color
    category: string;       // controls node color group
  }[];
  edges: {
    source: string;         // fromIssueId
    target: string;         // toIssueId
    relationship: string;   // causes | amplifies | masks
    confidence: string;
  }[];
}
```

**Recommended visualization library:** `react-force-graph-2d` or `@xyflow/react` (React Flow). React Flow is better for DAG layout (issues flow top-to-bottom from technical causes to perceived effects). Force-graph is better if you expect cycles or dense graphs.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Monolithic LLM Call

**What:** Single Claude call receiving all signals + producing final narrative
**Why bad:** Undebuggable ("why did the score change?"), expensive to iterate, no stage-level cost visibility, unstable outputs
**Instead:** Three-stage pipeline as described above — each stage is independently testable and swappable

### Anti-Pattern 2: Storing Raw HTML/Scripts in Postgres

**What:** Saving the full crawled page content alongside analysis results
**Why bad:** Massive storage cost, PII/IP liability, not needed post-analysis
**Instead:** Extract signals in-memory during crawl; write only typed signal objects and results to DB; discard raw content immediately

### Anti-Pattern 3: Synchronous Crawl in API Route

**What:** Playwright crawl triggered directly in a Next.js API route (even with external Playwright service)
**Why bad:** Frontend waits for 20-60 second HTTP response; Vercel function timeout; terrible UX
**Instead:** Fire-and-forget with queue (submit returns jobId immediately, client polls)

### Anti-Pattern 4: Polling with Short-Lived DB Queries

**What:** Client polls every 500ms; each poll hits DB directly
**Why bad:** At scale, polling hammers Neon with read queries on every active job
**Instead:** Poll at 2-3 second intervals; use Neon connection pooling (PgBouncer via Neon's built-in pooler); optionally add a status cache in the job record that only updates on state transitions

### Anti-Pattern 5: Coupling Signal Extractors to Analysis Pipeline

**What:** Signal extraction and AI reasoning in one tightly coupled class
**Why bad:** Cannot test extractors independently; cannot swap AI models; cannot add new extractors without touching reasoning code
**Instead:** Extractors emit typed signal objects; pipeline consumes signal objects; interface boundary between them

### Anti-Pattern 6: Single Causality Stage

**What:** Asking Claude to produce scored issues AND causal edges in one call
**Why bad:** Asking a model to both score AND reason simultaneously produces worse results on both; harder to debug which step is wrong
**Instead:** Score first (Stage 1), reason about relationships second (Stage 2)

---

## Scalability Considerations

| Concern | At 10 analyses/day | At 1K analyses/day | At 10K analyses/day |
|---------|-------------------|-------------------|---------------------|
| Crawler | Single Railway service | Multiple Railway replicas or Fly Machines (scale-to-zero) | Browserless.io managed pool |
| AI Pipeline | Sequential calls, ~5-10s total | Still fast enough; monitor rate limits | Anthropic API rate limits may need batching/retry logic |
| Neon DB | Single connection pool, fine | Enable Neon connection pooler (built-in PgBouncer) | Consider read replicas for results fetching |
| Vercel Queues | Default throughput sufficient | Default throughput sufficient | May need queue sharding by region |
| Cost per analysis | ~$0.04 AI + ~$0.02 infra | Same unit economics | Renegotiate Anthropic pricing |

---

## Suggested Build Order

Dependencies determine order. Cannot test AI pipeline without signal data. Cannot test end-to-end flow without queue. Build order:

### Phase 1: Data Foundation
1. Prisma schema (Job, Result, Issue, CausalEdge tables)
2. Neon database setup and migration
3. `POST /api/analyze` route — creates job, returns jobId (no crawl yet, just DB)
4. `GET /api/jobs/[id]` polling route
5. Basic dashboard UI: URL input form, status polling display

**Why first:** Everything else writes to and reads from the DB. Get schema right before building on top of it.

### Phase 2: Crawler Service
1. Docker image with `mcr.microsoft.com/playwright/node` base
2. Railway deployment setup
3. Vercel Queues integration (poll mode consumer)
4. DOM signal extractor (simplest — pure `page.evaluate()` calls)
5. Network/HAR extractor (second — high signal value, `context.tracing.startHar`)
6. CSS signal extractor
7. JS bundle extractor (most complex — needs resource interception)
8. Signal serialization to Neon via callback to Next.js API

**Why second:** Need real signals before AI pipeline can be built or tested meaningfully.

### Phase 3: AI Pipeline
1. Stage 1 (Score) with claude-haiku — validate structured output schema
2. Stage 2 (Reason) with claude-sonnet — validate causality edge generation
3. Stage 3 (Narrate) with claude-sonnet — validate narrative quality
4. Wire stages together in crawler service
5. Write results to Neon (Result, Issue, CausalEdge records)
6. Update job status to "complete"

**Why third:** Needs real signal data from Phase 2. Each stage should be built and tested independently before wiring together.

### Phase 4: Results Dashboard
1. `GET /api/results/[jobId]` — serialize graph data from DB
2. Narrative display component
3. Issue list with severity ranking
4. Causality graph visualization (React Flow recommended)
5. End-to-end integration test

**Why fourth:** Dashboard is read-only display of data that must exist first. Also allows iterating on visualization without touching backend.

---

## Component Communication Summary

```
Dashboard (browser)
  → POST /api/analyze          [HTTP, JSON]
  ← { jobId }
  → GET /api/jobs/[id]         [HTTP polling, JSON]
  ← { status, ... }
  → GET /api/results/[id]      [HTTP, JSON]
  ← { narrative, issues, graphData }

Vercel API Routes
  → Vercel Queues              [Vercel SDK, publish message]
  → Neon PostgreSQL            [Prisma, TCP]

Railway Crawler Service
  → Vercel Queues              [HTTP poll mode, @vercel/queue SDK]
  → Playwright/Chromium        [in-process]
  → Claude API                 [HTTPS, Anthropic SDK]
  → Neon PostgreSQL            [Prisma, TCP — direct or via API callback]
```

---

## Sources

- Vercel Function Limits (official docs, 2026-02-24): https://vercel.com/docs/functions/limitations
- Vercel Function Max Duration (official docs, 2026-02-27): https://vercel.com/docs/functions/configuring-functions/duration
- Vercel Queues Concepts (official docs, 2026-02-27): https://vercel.com/docs/queues/concepts
- Vercel Workflows (official docs): https://vercel.com/docs/workflows
- Playwright HAR Recording (Context7 / microsoft/playwright.dev, v1.59.0)
- Playwright Docker images (Context7 / microsoft/playwright.dev, v1.59.0): `mcr.microsoft.com/playwright/node`
- Playwright DOM Evaluation (Context7 / microsoft/playwright.dev): `page.evaluate()`, `locator.evaluateAll()`
