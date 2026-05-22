# Phase 2: Crawler Service — Context

**Gathered:** 2026-05-22
**Status:** Ready for planning
**Mode:** MVP

---

## Phase Boundary

Phase 2 builds and deploys the Railway-hosted Playwright crawl service. By the end of this phase:

- QStash delivers a `{ jobId, url }` payload to the Railway `/crawl` endpoint
- The Railway service verifies the QStash signature, returns 200 immediately, and enqueues the job
- Playwright crawls the URL in two passes: 375px mobile (slow-3G throttle) then 1440px desktop
- SPA hydration is detected via `__NEXT_DATA__` / `__reactFiber*` / `__vue_app__` markers — not `networkidle`
- All four signal extractors (DOM, CSS, JS, Network/HAR) run after hydration is confirmed
- Job status transitions (`pending → crawling → extracting → analyzing → complete/failed`) are written to Neon at each stage boundary
- Raw signal payloads are ephemeral (in-memory only, per INFRA-03) — not stored to DB as permanent records

Phase 2 does NOT include: the AI pipeline (Phase 3), results dashboard (Phase 4), or score/issue writing to the DB.

---

## Decisions

### Inherited from Phase 1 (locked — do not revisit)

| ID | Decision |
|----|----------|
| D-01 | Job queue: Upstash QStash, push/callback model |
| D-02 | QStash delivers to Railway via HTTP POST |
| D-03 | Railway endpoint secured with QStash `Receiver` signature verification |
| D-04 | Accept callbacks immediately (200), process one job at a time internally |
| D-05 | Idempotency: check job status before processing — discard if not `pending` |
| D-13 | Layer 2 SSRF: `context.route()` blocks RFC-1918 / loopback at the browser level |
| D-17 | DB schema: Job, Result, Issue, CausalEdge (fixed — no new signal tables) |
| D-18 | Job status enum: `pending → crawling → extracting → analyzing → complete \| failed` |
| D-19 | No job TTL |

### New in Phase 2 (locked)

| ID | Decision |
|----|----------|
| D-20 | Railway HTTP framework: **Hono** (not Express) — native TS, Web Standards API, `c.req.text()` for raw body QStash verification |
| D-21 | Playwright base image: **`mcr.microsoft.com/playwright/node:v1.60.0-noble`** — Docker/persistent, not serverless |
| D-22 | Prisma client on Railway: **standard `PrismaClient`, no `@prisma/adapter-neon`** — persistent TCP connection, pooler URL |
| D-23 | Internal job queue: **`p-queue` (concurrency: 1)** — prevents concurrent Playwright OOM |
| D-24 | Network throttling: **CDPSession `Network.emulateNetworkConditions`** — Playwright has no native API |
| D-25 | SPA hydration wait: **`domcontentloaded` + `waitForFunction`** checking framework markers — NOT `networkidle` |
| D-26 | HAR recording: **`recordHar: { content: 'omit', mode: 'full' }`** — no body storage, full timing |
| D-27 | Mobile viewport: **375×812px, 40KB/s down, 20KB/s up, 400ms latency (slow 3G)** |
| D-28 | SLA timeout: **55-second `Promise.race`** wrapping crawl+extract — 5s headroom within the 60s SLA |

### Signal Persistence Decision (INFRA-03)

Raw signal payloads (DOMSignals, CSSSignals, JSSignals, NetworkSignals) are **NOT** written to the database as permanent records. They are in-memory objects passed to the Phase 3 AI pipeline. The Phase 3 pipeline writes structured results (Issues, CausalEdges, narrative) to the DB.

For Phase 2 scope, after signal extraction, the job transitions `extracting → analyzing → complete` as a stub (no AI pipeline yet). Phase 3 will replace the stub with real pipeline invocation.

**This means: no new Prisma models are needed in Phase 2.** The existing Job/Result/Issue/CausalEdge schema is sufficient.

---

## Signal Type Contracts

These TypeScript interfaces are the contracts between the crawler and the Phase 3 AI pipeline. All four extractors produce values conforming to these shapes.

### DOMSignals (SIG-01)

```typescript
export interface DOMSignals {
  maxDOMDepth: number
  totalElementCount: number
  interactiveElementCount: number
  ariaLabelledCount: number
  ariaRoleCount: number
  ariaLandmarkCount: number
  missingAltCount: number
  semanticScore: {
    h1Count: number
    h2Count: number
    h3Count: number
    navCount: number
    mainCount: number
    footerCount: number
    articleCount: number
    hasSkipLink: boolean
  }
  formCount: number
  formFieldCount: number
  formWithoutLabelCount: number
  ctaVisibility: {
    buttonCount: number
    visibleButtonCount: number
    primaryCtaText: string | null
  }
}
```

### CSSSignals (SIG-02)

```typescript
export interface CSSSignals {
  totalCSSBytes: number
  unusedCSSBytes: number
  unusedCSSPercent: number
  animationCount: number
  transitionCount: number
  willChangeCount: number
  paintTriggerPropertyCount: number
  fontDisplayStrategies: {
    block: number
    swap: number
    fallback: number
    optional: number
    auto: number
  }
}
```

### JSSignals (SIG-03)

```typescript
export interface JSSignals {
  totalJSBytes: number
  scriptCount: number
  renderBlockingCount: number
  asyncScriptCount: number
  deferredScriptCount: number
  moduleScriptCount: number
  thirdPartyScriptCount: number
  frameworkFingerprint: string[]
  unusedJSBytes: number
  unusedJSPercent: number
}
```

### NetworkSignals (SIG-04)

```typescript
export interface HAREntry {
  url: string
  method: string
  status: number
  mimeType: string
  transferSize: number
  timings: {
    dns: number
    connect: number
    ssl: number
    wait: number
    receive: number
    total: number
  }
  isRenderBlocking: boolean
  cdnProvider: string | null
}

export interface NetworkSignals {
  totalRequests: number
  totalTransferSize: number
  renderBlockingCount: number
  renderBlockingAssets: string[]
  cdnCount: number
  firstRequestTTFB: number
  maxTTFB: number
  imageCount: number
  oversizedImageCount: number
  totalImageBytes: number
  entries: HAREntry[]
}
```

### CrawlPass

```typescript
export interface CrawlPass {
  viewport: 'mobile' | 'desktop'
  domSignals: DOMSignals
  cssSignals: CSSSignals
  jsSignals: JSSignals
  networkSignals: NetworkSignals
}
```

---

## Crawler Project Structure

```
crawler/
├── src/
│   ├── server.ts           # Hono app, /health + /crawl routes (D-20)
│   ├── queue.ts            # p-queue instance (concurrency: 1) (D-23)
│   ├── processor.ts        # Job processor: status transitions + signal extraction
│   ├── browser.ts          # Playwright: launch, dual viewport, SPA hydration (D-21, D-24, D-25)
│   ├── extractors/
│   │   ├── dom.ts          # SIG-01 DOM signal extractor
│   │   ├── css.ts          # SIG-02 CSS signal extractor
│   │   ├── js.ts           # SIG-03 JS signal extractor
│   │   └── network.ts      # SIG-04 Network/HAR extractor
│   ├── lib/
│   │   ├── prisma.ts       # Standard PrismaClient (no adapter) (D-22)
│   │   └── types.ts        # All signal type interfaces (canonical source)
│   └── index.ts            # Entry point: start Hono server
├── prisma/
│   └── schema.prisma       # Copy of root prisma/schema.prisma (for prisma generate in Docker)
├── Dockerfile              # FROM mcr.microsoft.com/playwright/node:v1.60.0-noble (D-21)
├── package.json
├── tsconfig.json
└── railway.toml            # healthcheckPath=/health, buildCommand with prisma generate
```

---

## Environment Variables (Railway)

| Variable | Source | Purpose |
|----------|--------|---------|
| `QSTASH_CURRENT_SIGNING_KEY` | Upstash Console → QStash | Signature verification (D-03) |
| `QSTASH_NEXT_SIGNING_KEY` | Upstash Console → QStash | Key rotation (D-03) |
| `RAILWAY_PUBLIC_URL` | Railway Settings → Domains | Passed to `Receiver.verify()` as expected URL |
| `DATABASE_URL` | Neon Console → pooler URL | Standard PrismaClient TCP connection (D-22) |
| `PORT` | Railway injects automatically | Hono server listen port |
| `NODE_ENV` | Set in Dockerfile: `production` | Prisma production mode |

---

## QStash Payload Shape

Confirmed from `src/app/api/analyze/route.ts` (Phase 1):

```typescript
// Published by POST /api/analyze (Phase 1)
{ jobId: string, url: string }

// Validated by crawler with zod:
const PayloadSchema = z.object({
  jobId: z.string().min(1),
  url: z.string().url(),
})
```

---

## Known Pitfalls (baked into plans)

1. `--no-sandbox` must NOT be used — run as `pwuser` with the official image sandbox intact
2. `waitForLoadState('networkidle')` hangs on SPAs — use `domcontentloaded` + `waitForFunction`
3. QStash signature verification requires raw body string (`c.req.text()`), NOT `JSON.stringify(parsed)`
4. HAR file is only flushed to disk after `context.close()` — read HAR after close, stop coverage before close
5. Include `--disable-dev-shm-usage` in Chromium launch args to prevent Docker SIGBUS
6. CSS Coverage misses CSS-in-JS (styled-components, Tailwind JIT) — document as lower bound

---

## Test Strategy

Unit tests live in the root `vitest.config.mts` project (Phase 1 established Vitest as the test runner).

| Extractor | Test Type | File |
|-----------|-----------|------|
| DOM (`dom.ts`) | Unit — pure functions extracted from `page.evaluate()` payload | `crawler/src/extractors/dom.test.ts` |
| JS (`js.ts`) | Unit — script classification logic (async/defer/module detection) | `crawler/src/extractors/js.test.ts` |
| Network (`network.ts`) | Unit — HAR JSON parsing with fixture file | `crawler/src/extractors/network.test.ts` |
| CSS (`css.ts`) | Manual only — Coverage API requires live Chromium | end-to-end checkpoint |

---

*Phase: 02-crawler-service*
*Context gathered: 2026-05-22*
