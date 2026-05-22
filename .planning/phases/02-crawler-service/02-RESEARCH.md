# Phase 2: Crawler Service — Research

**Researched:** 2026-05-22
**Domain:** Playwright browser automation on Railway Docker, QStash signature verification, SPA hydration detection, signal extraction (DOM/CSS/JS/Network)
**Confidence:** HIGH (Playwright patterns verified from official docs; Railway healthcheck from official Railway docs; QStash Receiver from official Upstash docs; Neon TCP connection from official Neon docs)

---

<user_constraints>
## User Constraints (from Phase 1 CONTEXT.md)

### Locked Decisions
- **D-01:** Use **Upstash QStash** as the job queue (NOT Vercel Queues). QStash free tier: 500 deliveries/day.
- **D-02:** QStash uses a **push (callback) model** — QStash delivers jobs to the Railway crawler via HTTP POST. The Railway service must expose a public HTTP endpoint.
- **D-03:** Secure the Railway endpoint with **QStash signing secret verification** (`QSTASH_CURRENT_SIGNING_KEY` + `QSTASH_NEXT_SIGNING_KEY`). Use `@upstash/qstash` `Receiver` pattern.
- **D-04:** Railway crawler accepts QStash callbacks immediately (return 200) and adds jobs to an **internal sequential queue**. Process one job at a time to avoid Playwright resource contention.
- **D-05:** QStash retries are enabled. Crawler checks job status before starting — discards if already `in_progress` or `complete`.
- **D-13:** Two-layer SSRF: Layer 2 (Phase 2) — Playwright network interception blocking requests to RFC-1918 destinations at the browser level (DNS rebinding protection).
- **D-17/18:** DB schema is fixed: `Job`, `Result`, `Issue`, `CausalEdge`. Status enum: `pending → crawling → extracting → analyzing → complete | failed`.
- **D-19:** No job TTL.

### Claude's Discretion
- Framework for the Railway HTTP server (Express vs Hono — researcher recommends Hono, see Standard Stack below).
- Prisma client setup for the Railway container (standard PrismaClient over TCP, no PrismaNeon adapter — see Pattern 6).

### Deferred Ideas (OUT OF SCOPE)
- Playwright stealth / anti-bot bypass (post-MVP).
- Auth-gated route detection.
- Source map enrichment.
- Multi-page crawl.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CRAWL-02 | Crawler executes JavaScript and waits for SPA hydration before signal extraction (handles React, Next.js, Vue) | Pattern 3: SPA hydration wait strategy; Pitfall 2 (networkidle trap) |
| CRAWL-03 | Crawler runs each analysis in both mobile (375px, throttled) and desktop (1440px) viewport profiles | Pattern 4: Dual viewport crawl sequence; CDPSession emulateNetworkConditions |
| SIG-01 | System extracts DOM/HTML signals — layout depth, element counts, ARIA attributes, semantic markup quality, form structure, CTA visibility | Pattern 5a: DOM extractor via page.evaluate() |
| SIG-02 | System extracts CSS signals — animation performance, layout complexity, paint-triggering properties, unused CSS (via Playwright coverage API), font loading patterns | Pattern 5b: CSS extractor via page.coverage + getComputedStyle |
| SIG-03 | System extracts JavaScript signals — bundle transfer size, chunk count, render-blocking vs async/deferred classification, framework fingerprint | Pattern 5c: JS extractor via page.coverage + resource interception |
| SIG-04 | System extracts network/asset signals — full request timing waterfall (DNS/TLS/TTFB/download), render-blocking asset identification, CDN usage, image compression and sizing | Pattern 5d: Network/HAR extractor via recordHar + request.timing() |
</phase_requirements>

---

## Summary

Phase 2 builds the Railway-hosted Playwright crawl service that is the data engine for all subsequent phases. The service is an Express/Hono HTTP server that receives job payloads from QStash (push/callback model, per D-02), processes them sequentially through a p-queue (per D-04), and writes typed signal records to Neon PostgreSQL via a standard PrismaClient TCP connection.

The core crawl loop uses the Playwright Chromium engine with `mcr.microsoft.com/playwright/node:v1.60.0-noble` as the Docker base image. Each job runs two sequential crawl passes: mobile (375px viewport, CDPSession network throttling simulating slow 3G) then desktop (1440px viewport, no throttling). SPA hydration is detected by waiting for both `domcontentloaded` and a `__NEXT_DATA__` / `window.__reactFiber` marker with a fallback timeout, avoiding the `networkidle` trap that blocks forever on apps with background polling.

Signal extraction for all four domains (DOM, CSS, JS, Network) runs after the hydrated page is stable. DOM signals use `page.evaluate()` with in-browser DOM traversal. CSS signals combine `page.coverage.startCSSCoverage()` (unused CSS bytes) with `page.evaluate()` for computed style paint-trigger analysis. JS signals use `page.coverage.startJSCoverage()` for per-script byte sizes plus resource interception for render-blocking classification. Network signals use `browser.newContext({ recordHar })` to capture the full request waterfall. Job status transitions (`crawling → extracting → analyzing → complete | failed`) are written to Neon at each stage boundary, ensuring the Phase 1 polling endpoint always reflects current state.

**Primary recommendation:** Use Hono (not Express) as the Railway HTTP server framework — it is lighter, has native TypeScript support, and the middleware pattern for raw-body QStash signature verification is cleaner. Use `playwright-core` 1.60.0 with the official `mcr.microsoft.com/playwright/node` Docker image (not `@sparticuz/chromium`) since Railway is a Docker container environment, not a serverless function.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Receive QStash job callback | Railway HTTP server | — | QStash pushes to a public endpoint; Railway service owns the webhook receiver |
| QStash signature verification | Railway HTTP server | — | Raw body must be verified before parsing; happens at the edge of the service boundary |
| Internal job serialization (concurrency=1) | Railway HTTP server | — | p-queue with concurrency:1 prevents two Playwright instances racing for memory |
| Playwright browser lifecycle | Railway Crawler | — | Browser.launch → Context.new → Page.goto → close happens entirely within the Railway container |
| SPA hydration detection | Railway Crawler (page context) | — | waitForFunction executes inside the browser; no external component needed |
| Dual viewport crawl (375px + 1440px) | Railway Crawler | — | Two sequential context.new calls with different viewport/throttle settings |
| DOM signal extraction | Railway Crawler (in-page JS) | — | page.evaluate() runs serializable JS inside Chromium; returns typed object |
| CSS signal extraction | Railway Crawler (Coverage API + in-page JS) | — | Coverage API is Playwright/Chromium-only; must run within the crawl context |
| JS signal extraction | Railway Crawler (Coverage API + route interception) | — | JS coverage and route interception are crawler-side; not possible from outside the browser |
| Network/HAR extraction | Railway Crawler (recordHar context option) | — | HAR recording is configured at context creation; crawler owns the context |
| Job status writes | Railway Crawler → Neon (direct TCP) | — | Persistent Docker container can use standard PrismaClient over TCP without adapter overhead |
| Signal write to Neon | Railway Crawler → Neon (direct TCP) | — | Same as job status — standard Prisma, no edge constraint |
| SSRF Layer 2 (DNS rebinding) | Railway Crawler (page.route) | — | Browser-level network interception blocks requests to RFC-1918 IPs; deferred from Phase 1 |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| playwright-core | 1.60.0 | Headless Chromium crawling, Coverage API, HAR recording, CDP sessions | The only library with Coverage API (CSS/JS) and native HAR recording; core-only (no bundled browsers) since the Docker image provides Chromium |
| hono | 4.12.21 | Railway HTTP server (receives QStash callbacks, serves /health) | Web-standards API, native TypeScript, smaller than Express, cleaner raw-body middleware for signature verification |
| @upstash/qstash | 2.11.0 | QStash `Receiver` for signature verification | Same SDK already used in the Next.js app; `Receiver` class handles both signing keys |
| prisma | 7.8.0 | Prisma CLI (Railway container needs `prisma generate` at build) | Same version as main app — must match to share the same schema |
| @prisma/client | 7.8.0 | Standard PrismaClient — NO adapter, direct TCP to Neon pooler | Docker/Railway is a persistent process; no serverless adapter needed (see Pattern 6) |
| p-queue | 9.3.0 | In-memory sequential job queue (concurrency: 1) | Prevents two Playwright instances running simultaneously; prevents OOM kills |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| typescript | 6.0.3 | TypeScript compiler for the crawler service | Separate `tsconfig.json` in `crawler/` |
| zod | 4.4.3 | Validate QStash payload shape `{ jobId, url }` before processing | Same version as main app; prevents malformed payloads from crashing the crawler |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hono | Express 5.2.1 | Express is heavier, more dependencies; raw body handling requires `express.raw()` middleware; Hono is lighter and native to Web Standards |
| p-queue | Bull / BullMQ | BullMQ adds Redis dependency to the crawler; p-queue is in-memory and sufficient for concurrency:1 |
| Standard PrismaClient | @prisma/adapter-neon | Adapter-neon is for serverless/edge runtimes; in a Docker container with a persistent process, standard TCP is more efficient and eliminates WebSocket overhead |
| playwright-core + Docker image | @sparticuz/chromium | @sparticuz/chromium is for Lambda/serverless where you can't install Chromium; Docker containers use the official image directly |

**Installation (Railway crawler service):**
```bash
# In crawler/ directory
sfw npm install playwright-core hono @upstash/qstash @prisma/client prisma p-queue zod
sfw npm install --save-dev typescript @types/node
```

**Version verification (confirmed against npm registry 2026-05-22):**
```bash
npm view playwright-core version   # 1.60.0 (modified 2026-05-21)
npm view hono version              # 4.12.21 (modified 2026-05-19)
npm view @upstash/qstash version   # 2.11.0 (modified 2026-05-13)
npm view p-queue version           # 9.3.0 (modified 2026-05-16)
npm view prisma version            # 7.8.0
npm view @prisma/client version    # 7.8.0
```

---

## Package Legitimacy Audit

> slopcheck was run on 2026-05-22 via `py -m slopcheck install ...` — all packages returned `[OK]`.
> Postinstall scripts checked with `npm view <pkg> scripts.postinstall` — no suspicious scripts found for any package.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| playwright-core | npm | 5+ yrs | very high (Microsoft) | github.com/microsoft/playwright | [OK] | Approved |
| hono | npm | 3+ yrs | high | github.com/honojs/hono | [OK] | Approved |
| @upstash/qstash | npm | 3+ yrs | high | github.com/upstash/qstash-js | [OK] | Approved |
| @prisma/client | npm | 5+ yrs | very high (Prisma) | github.com/prisma/prisma | [OK] | Approved |
| prisma | npm | 5+ yrs | very high (Prisma) | github.com/prisma/prisma | [OK] | Approved |
| p-queue | npm | 8+ yrs | high | github.com/sindresorhus/p-queue | [OK] | Approved |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
QStash (Upstash)
  │  HTTP POST { jobId, url }   (push/callback model — D-02)
  │  Upstash-Signature header
  ▼
Railway Crawler Service (Hono HTTP server, port=$PORT)
  │
  ├── /health  → 200 OK   (Railway healthcheck)
  │
  └── /crawl   → verifySignature → 200 immediately → enqueue
                                                       │
                                              p-queue (concurrency: 1)
                                                       │
                                              ┌────────▼────────┐
                                              │   Job Processor  │
                                              │                  │
                                              │ 1. Check status  │──already done──→ discard
                                              │ 2. Set crawling  │
                                              │                  │
                                              │ ┌─────────────┐  │
                                              │ │ Playwright   │  │
                                              │ │ browser.launch│  │
                                              │ │              │  │
                                              │ │ Pass 1: 375px│  │  (mobile + throttle)
                                              │ │ Pass 2: 1440x│  │  (desktop)
                                              │ └─────────────┘  │
                                              │                  │
                                              │ 3. Set extracting│
                                              │                  │
                                              │ ┌─────────────┐  │
                                              │ │ Extractors   │  │
                                              │ │ DOM  signals │  │
                                              │ │ CSS  signals │  │
                                              │ │ JS   signals │  │
                                              │ │ HAR  signals │  │
                                              │ └─────────────┘  │
                                              │                  │
                                              │ 4. Write to Neon │
                                              │    (signals as   │
                                              │    JSON in Job   │
                                              │    or separate   │
                                              │    ephemeral     │
                                              │    storage)      │
                                              │                  │
                                              │ 5. Set analyzing │
                                              │   (Phase 3 hook) │
                                              └──────────────────┘
                                                       │
                                              Neon PostgreSQL (TCP)
                                              Job status updates
                                              Signal records (INFRA-03)
```

**Note on signal persistence:** Per INFRA-03, raw signal payloads are ephemeral. Signals are extracted in-memory during the crawl and passed directly to the Phase 3 AI pipeline. They are NOT stored as permanent DB records. Job status transitions ARE stored. Structured results (Issues, CausalEdges) written by Phase 3 ARE stored.

### Recommended Project Structure
```
crawler/
├── src/
│   ├── server.ts           # Hono app, /health + /crawl routes
│   ├── queue.ts            # p-queue instance (concurrency: 1)
│   ├── processor.ts        # Job processor: status transitions + calls extractors
│   ├── browser.ts          # Playwright browser lifecycle (launch, context, close)
│   ├── extractors/
│   │   ├── dom.ts          # SIG-01: DOM signal extractor
│   │   ├── css.ts          # SIG-02: CSS signal extractor
│   │   ├── js.ts           # SIG-03: JS signal extractor
│   │   └── network.ts      # SIG-04: Network/HAR signal extractor
│   ├── lib/
│   │   ├── prisma.ts       # Standard PrismaClient (no adapter)
│   │   └── types.ts        # Typed signal interfaces
│   └── index.ts            # Entry point: start server
├── prisma/                 # Symlink or copy of root prisma/schema.prisma
├── Dockerfile
├── package.json
├── tsconfig.json
└── railway.toml
```

---

## Pattern 1: Railway Dockerfile for Playwright

**What:** Docker image using the official Microsoft Playwright base. Playwright 1.60.0 ships with Chromium pre-installed at the correct binary path.

**Why:** On a Docker container environment (Railway), use the full official image — not `@sparticuz/chromium` (which is for Lambda/serverless). The official image pre-installs all Chromium system dependencies, avoiding the "missing library" trap that consumes an afternoon.

**Source:** [playwright.dev/docs/docker](https://playwright.dev/docs/docker) [CITED: playwright.dev/docs/docker]

```dockerfile
# Source: Playwright official Docker docs + Railway Playwright guide [CITED]
FROM mcr.microsoft.com/playwright/node:v1.60.0-noble

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source and run build
COPY . .
RUN npm run build

# Railway injects PORT at runtime; default 3000 for local dev
ENV PORT=3000
ENV NODE_ENV=production
# Tell playwright-core where Chromium binary lives in this image
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

EXPOSE $PORT

# Run as non-root user (pwuser is created by the official image)
# Running as root disables the Chromium sandbox — use pwuser for security
USER pwuser

CMD ["node", "dist/index.js"]
```

**railway.toml:**
```toml
[build]
dockerfile = "Dockerfile"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 60
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

**Key notes:**
- Pin to an explicit version tag (`v1.60.0-noble`), never `:latest`. [VERIFIED: playwright.dev/docs/docker]
- `pwuser` is pre-created by the official image. Running as root disables Chromium sandbox. [VERIFIED: playwright.dev/docs/docker]
- Railway injects `PORT` automatically — do not hardcode it.
- Allocate minimum 1 GB RAM in Railway Service Settings > Resources. A single Chromium instance can use several hundred MB. [CITED: docs.railway.com/guides/playwright]
- The `--no-sandbox` flag is NOT needed when running as `pwuser` with the official image. Only add it if you must run as root (not recommended).

---

## Pattern 2: QStash Signature Verification in Railway Hono App

**What:** Verify that every incoming POST to `/crawl` genuinely originated from QStash before processing.

**Why:** The Railway endpoint is public — without verification, anyone can POST crafted job payloads. QStash signs requests with a JWT in the `Upstash-Signature` header using your signing keys. [CITED: upstash.com/docs/qstash/howto/signature]

**Critical constraint:** The `Receiver.verify()` method requires the **raw request body as a string**. Converting the parsed JSON back to a string (`JSON.stringify(parsed)`) will cause signature verification to fail due to key ordering and whitespace differences.

**Source:** [upstash.com/docs/qstash/howto/signature](https://upstash.com/docs/qstash/howto/signature) [CITED]

```typescript
// src/server.ts
import { Hono } from 'hono'
import { Receiver } from '@upstash/qstash'
import { queue } from './queue'
import { z } from 'zod/v4'

const app = new Hono()

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
})

const PayloadSchema = z.object({
  jobId: z.string().min(1),
  url: z.string().url(),
})

// Health check — Railway calls this before marking deployment live
app.get('/health', (c) => c.json({ status: 'ok' }))

// QStash callback endpoint
app.post('/crawl', async (c) => {
  // 1. Read raw body BEFORE any parsing — signature is over the raw bytes
  const rawBody = await c.req.text()
  const signature = c.req.header('upstash-signature')

  if (!signature) {
    return c.json({ error: 'Missing signature' }, 401)
  }

  // 2. Verify signature — throws if invalid; catch and return 401
  try {
    await receiver.verify({
      body: rawBody,         // MUST be raw string, not JSON.stringify(parsed)
      signature,
      url: process.env.RAILWAY_PUBLIC_URL + '/crawl',  // must match the URL QStash published to
    })
  } catch {
    return c.json({ error: 'Invalid signature' }, 401)
  }

  // 3. Parse and validate payload after verification
  let payload: z.infer<typeof PayloadSchema>
  try {
    payload = PayloadSchema.parse(JSON.parse(rawBody))
  } catch {
    return c.json({ error: 'Invalid payload' }, 400)
  }

  // 4. Return 200 IMMEDIATELY (D-04) — QStash retries if we don't respond quickly
  // Enqueue the job for async processing
  queue.add(() => processJob(payload.jobId, payload.url))

  return c.json({ received: true }, 200)
})

export default app
```

**Environment variables required in Railway:**
```
QSTASH_CURRENT_SIGNING_KEY=...  # from Upstash QStash console
QSTASH_NEXT_SIGNING_KEY=...     # from Upstash QStash console
RAILWAY_PUBLIC_URL=https://...  # the public Railway service URL
DATABASE_URL=postgresql://...   # Neon pooler URL (see Pattern 6)
PORT=3000                       # Railway injects this automatically
```

---

## Pattern 3: Playwright SPA Hydration Wait Strategy

**What:** Wait for the page to be fully hydrated (interactive React/Next.js DOM, not just server-rendered HTML) before running signal extractors.

**Why:** Extracting DOM signals from pre-hydration HTML produces incorrect results — element counts include the server-rendered shell, not the hydrated state. Event listeners are not yet attached. Framework-injected elements (portals, modals, lazy components) have not rendered.

**The networkidle trap:** `waitForLoadState('networkidle')` waits for 500 ms of network silence. Modern apps with analytics, polling, or background sync never become network-idle. This causes the crawler to hang until it times out. [CITED: github.com/microsoft/playwright/issues/22661]

**Source:** Playwright docs on `waitForFunction` and `waitForLoadState` [CITED: playwright.dev/docs/api/class-page]

```typescript
// src/browser.ts
import { chromium, Browser, BrowserContext, Page } from 'playwright-core'

export async function waitForSpaHydration(page: Page, timeoutMs = 10_000): Promise<void> {
  // Step 1: Wait for DOM to be parsed and scripts to start executing
  await page.waitForLoadState('domcontentloaded')

  // Step 2: Wait for SPA hydration signal
  // Next.js: window.__NEXT_DATA__ is set by the server; React hydration completes
  //          when interactive elements are present in the DOM
  // React (generic): look for a root fiber node
  // Vue: window.__vue_app__ is set after hydration
  // Fallback: wait for DOMContentLoaded + 2s (acceptable for non-SPA sites)
  try {
    await page.waitForFunction(
      () => {
        // Next.js App Router — hydration marker
        if ((window as any).__NEXT_DATA__) return true
        // React 18 root detection — hydration attaches _reactFiber* props to the root element
        const root = document.getElementById('root') || document.getElementById('__next')
        if (root) {
          return Object.keys(root).some(key => key.startsWith('__reactFiber') || key.startsWith('__reactContainer'))
        }
        // Vue 3
        if ((window as any).__vue_app__) return true
        // Nuxt
        if ((window as any).__nuxt) return true
        // Fallback: treat load event as sufficient
        return document.readyState === 'complete'
      },
      { timeout: timeoutMs },
    )
  } catch {
    // Timeout: page may be non-SPA or use a framework we don't detect.
    // Proceed with signal extraction anyway — signals will reflect whatever state
    // the page is in at this point. Log the fallback for debugging.
    console.warn('[hydration] waitForFunction timed out — proceeding with extraction')
  }

  // Step 3: Brief pause for late-initializing components (lazy imports, async effects)
  // 500ms is empirically sufficient; do not use page.waitForTimeout in tests but
  // it's acceptable here for the signal-extraction use case.
  await page.waitForTimeout(500)
}
```

**Anti-pattern — do not use:**
```typescript
// BAD: Hangs on sites with analytics, polling, websockets, background sync
await page.waitForLoadState('networkidle')
```

---

## Pattern 4: Dual Viewport Crawl Sequence

**What:** Run two sequential crawl passes — 375px mobile (throttled) then 1440px desktop — for each job. Sequential, not parallel, to stay within the 60-second SLA and avoid memory contention.

**Why (CRAWL-03):** Mobile and desktop signal sets must be captured separately because viewport affects layout, element visibility, and critical rendering path. [ASSUMED: specific throttle values for "mobile" are not defined in requirements; the values below represent standard 3G/Slow-3G profiles]

**Network throttling via CDPSession:** Playwright does not have a first-class `emulateNetworkConditions` API; it must be invoked via Chrome DevTools Protocol (CDP). This is Chromium-only (not Firefox/WebKit) and consistent with our Docker/Chromium-only environment. [CITED: github.com/microsoft/playwright/issues/6038]

**Source:** CDPSession pattern verified from Playwright docs [CITED: playwright.dev/docs/network]

```typescript
// src/browser.ts (continued)
import { chromium, Browser, BrowserContext } from 'playwright-core'

export interface CrawlPass {
  viewport: 'mobile' | 'desktop'
  domSignals: DOMSignals
  cssSignals: CSSSignals
  jsSignals: JSSignals
  networkSignals: NetworkSignals
}

export async function runDualViewportCrawl(url: string): Promise<{
  mobile: CrawlPass
  desktop: CrawlPass
}> {
  const browser = await chromium.launch({
    // executablePath is automatically resolved from PLAYWRIGHT_BROWSERS_PATH env
    args: [
      '--disable-dev-shm-usage',  // Prevents /dev/shm OOM in Docker
      '--disable-gpu',             // Not needed in headless; saves resources
      // Do NOT add --no-sandbox when running as pwuser with official image
    ],
  })

  try {
    // Pass 1: Mobile 375px with network throttling
    const mobileResult = await crawlWithViewport(browser, url, {
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
      throttle: {
        downloadThroughput: 40 * 1024,    // 40 KB/s (slow 3G)
        uploadThroughput: 20 * 1024,      // 20 KB/s
        latency: 400,                      // 400ms RTT
      },
    })

    // Pass 2: Desktop 1440px, no throttling
    const desktopResult = await crawlWithViewport(browser, url, {
      viewport: { width: 1440, height: 900 },
      isMobile: false,
      hasTouch: false,
      throttle: null,
    })

    return { mobile: mobileResult, desktop: desktopResult }
  } finally {
    await browser.close()
  }
}

async function crawlWithViewport(
  browser: Browser,
  url: string,
  options: ViewportOptions,
): Promise<CrawlPass> {
  // Start HAR recording at context creation (must be set before any navigation)
  const context = await browser.newContext({
    viewport: options.viewport,
    isMobile: options.isMobile,
    hasTouch: options.hasTouch,
    recordHar: {
      path: `/tmp/crawl-${Date.now()}.har`,
      content: 'omit',   // Do not embed response bodies — reduces memory; we need timing only
      mode: 'full',       // Full timing data (DNS, TLS, TTFB)
    },
  })

  const page = await context.newPage()

  // Apply network throttling via CDP (Chromium only) [CITED: Playwright CDP docs]
  if (options.throttle) {
    const client = await context.newCDPSession(page)
    await client.send('Network.enable')
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: options.throttle.downloadThroughput,
      uploadThroughput: options.throttle.uploadThroughput,
      latency: options.throttle.latency,
    })
  }

  // Layer 2 SSRF protection (D-13): block RFC-1918 + loopback requests at browser level
  await context.route('**', async (route) => {
    const requestUrl = new URL(route.request().url())
    if (isPrivateHost(requestUrl.hostname)) {
      await route.abort('blockedbyclient')
    } else {
      await route.continue()
    }
  })

  // Start coverage recording before navigation
  await page.coverage.startCSSCoverage({ resetOnNavigation: false })
  await page.coverage.startJSCoverage({ resetOnNavigation: false, reportAnonymousScripts: false })

  // Navigate with an overall timeout budget (40s of the 60s SLA)
  await page.goto(url, { timeout: 40_000, waitUntil: 'domcontentloaded' })

  // Wait for SPA hydration (Pattern 3)
  await waitForSpaHydration(page, 10_000)

  // Extract signals (Pattern 5)
  const [domSignals, cssSignals, jsSignals] = await Promise.all([
    extractDOMSignals(page),
    extractCSSSignals(page),
    extractJSSignals(page),
  ])

  // Stop coverage (must happen before context.close to get data)
  await page.coverage.stopCSSCoverage()
  await page.coverage.stopJSCoverage()

  // Close context to flush HAR to disk
  await context.close()

  // Read HAR from disk and extract network signals
  const networkSignals = await extractNetworkSignals(`/tmp/crawl-${Date.now()}.har`)

  return {
    viewport: options.isMobile ? 'mobile' : 'desktop',
    domSignals,
    cssSignals,
    jsSignals,
    networkSignals,
  }
}
```

---

## Pattern 5: Signal Extraction Patterns

### 5a: DOM Signals (SIG-01)

**What to extract:** Layout depth, element counts, ARIA attribute coverage, semantic HTML5 quality, form structure, CTA visibility.

**Method:** `page.evaluate()` — runs a JavaScript function inside the browser page context and returns a serializable value. [VERIFIED: playwright.dev/docs/evaluating]

```typescript
// src/extractors/dom.ts
import { Page } from 'playwright-core'

export interface DOMSignals {
  maxDOMDepth: number
  totalElementCount: number
  interactiveElementCount: number   // buttons, inputs, links, selects
  ariaLabelledCount: number          // elements with aria-label or aria-labelledby
  ariaRoleCount: number              // elements with explicit role= attribute
  ariaLandmarkCount: number          // header, main, nav, footer, aside, section
  missingAltCount: number            // <img> without alt attribute
  semanticScore: {
    h1Count: number                  // should be exactly 1
    h2Count: number
    h3Count: number
    navCount: number
    mainCount: number                // should be exactly 1
    footerCount: number
    articleCount: number
    hasSkipLink: boolean
  }
  formCount: number
  formFieldCount: number             // inputs + selects + textareas
  formWithoutLabelCount: number      // form fields not associated with <label>
  ctaVisibility: {
    buttonCount: number
    visibleButtonCount: number       // in viewport (boundingClientRect check)
    primaryCtaText: string | null    // text of first visible button/CTA
  }
}

export async function extractDOMSignals(page: Page): Promise<DOMSignals> {
  // Source: page.evaluate() pattern [CITED: playwright.dev/docs/evaluating]
  return page.evaluate((): DOMSignals => {
    // Max DOM depth — recursive walk
    function getMaxDepth(el: Element, depth = 0): number {
      let max = depth
      for (const child of el.children) {
        max = Math.max(max, getMaxDepth(child, depth + 1))
      }
      return max
    }

    const allElements = document.querySelectorAll('*')
    const buttons = document.querySelectorAll('button, [role="button"], a[href], input[type="submit"]')
    const visibleButtons = Array.from(buttons).filter(el => {
      const rect = el.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight
    })

    const formFields = document.querySelectorAll('input:not([type="hidden"]), select, textarea')
    const fieldsWithoutLabel = Array.from(formFields).filter(field => {
      const id = field.getAttribute('id')
      const hasAriaLabel = field.hasAttribute('aria-label') || field.hasAttribute('aria-labelledby')
      const hasLabelFor = id ? !!document.querySelector(`label[for="${id}"]`) : false
      return !hasAriaLabel && !hasLabelFor
    })

    return {
      maxDOMDepth: getMaxDepth(document.documentElement),
      totalElementCount: allElements.length,
      interactiveElementCount: buttons.length,
      ariaLabelledCount: document.querySelectorAll('[aria-label], [aria-labelledby]').length,
      ariaRoleCount: document.querySelectorAll('[role]').length,
      ariaLandmarkCount: document.querySelectorAll('header, main, nav, footer, aside, section').length,
      missingAltCount: document.querySelectorAll('img:not([alt])').length,
      semanticScore: {
        h1Count: document.querySelectorAll('h1').length,
        h2Count: document.querySelectorAll('h2').length,
        h3Count: document.querySelectorAll('h3').length,
        navCount: document.querySelectorAll('nav, [role="navigation"]').length,
        mainCount: document.querySelectorAll('main, [role="main"]').length,
        footerCount: document.querySelectorAll('footer, [role="contentinfo"]').length,
        articleCount: document.querySelectorAll('article').length,
        hasSkipLink: !!document.querySelector('a[href="#main"], a[href="#content"], a[href^="#skip"]'),
      },
      formCount: document.querySelectorAll('form').length,
      formFieldCount: formFields.length,
      formWithoutLabelCount: fieldsWithoutLabel.length,
      ctaVisibility: {
        buttonCount: buttons.length,
        visibleButtonCount: visibleButtons.length,
        primaryCtaText: visibleButtons[0]?.textContent?.trim().slice(0, 100) ?? null,
      },
    }
  })
}
```

### 5b: CSS Signals (SIG-02)

**What to extract:** Animation count, paint-trigger properties (will-change, transform, opacity animations), unused CSS bytes, font loading strategy.

**Method:** `page.coverage.startCSSCoverage()` / `stopCSSCoverage()` for unused CSS (Chromium-only). `page.evaluate()` + `getComputedStyle()` for computed property analysis. [VERIFIED: playwright.dev/docs/api/class-coverage]

```typescript
// src/extractors/css.ts
import { Page } from 'playwright-core'

export interface CSSSignals {
  totalCSSBytes: number
  unusedCSSBytes: number
  unusedCSSPercent: number
  animationCount: number            // elements with active CSS animations
  transitionCount: number           // elements with CSS transitions
  willChangeCount: number           // elements with will-change (paint layer promotions)
  paintTriggerPropertyCount: number // transform, opacity, filter on animated elements
  fontDisplayStrategies: {
    block: number    // font-display: block → FOIT risk
    swap: number     // font-display: swap
    fallback: number
    optional: number
    auto: number     // worst: browser decides
  }
}

export async function extractCSSSignals(page: Page): Promise<CSSSignals> {
  // Coverage API — must have called startCSSCoverage() before navigation [CITED]
  const coverageEntries = await page.coverage.stopCSSCoverage()

  let totalBytes = 0
  let usedBytes = 0
  for (const entry of coverageEntries) {
    if (!entry.text) continue
    totalBytes += entry.text.length
    for (const range of entry.ranges) {
      usedBytes += range.end - range.start
    }
  }

  // Computed style analysis for paint triggers and animations
  const inPageSignals = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*')
    let animationCount = 0
    let transitionCount = 0
    let willChangeCount = 0
    let paintTriggerCount = 0

    const fontDisplayMap = { block: 0, swap: 0, fallback: 0, optional: 0, auto: 0 }

    for (const el of allElements) {
      const style = window.getComputedStyle(el)
      if (style.animationName !== 'none') animationCount++
      if (style.transition !== 'none' && style.transition !== 'all 0s ease 0s') transitionCount++
      if (style.willChange !== 'auto') willChangeCount++
      // Paint triggers: transform/opacity/filter on elements with animation or will-change
      if (
        (style.animationName !== 'none' || style.willChange !== 'auto') &&
        (style.transform !== 'none' || parseFloat(style.opacity) < 1 || style.filter !== 'none')
      ) {
        paintTriggerCount++
      }
    }

    // Font display: check @font-face rules
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule instanceof CSSFontFaceRule) {
            const display = (rule.style as CSSStyleDeclaration).getPropertyValue('font-display').trim() || 'auto'
            if (display in fontDisplayMap) {
              fontDisplayMap[display as keyof typeof fontDisplayMap]++
            } else {
              fontDisplayMap.auto++
            }
          }
        }
      } catch {
        // Cross-origin stylesheets throw SecurityError on cssRules access — skip
      }
    }

    return { animationCount, transitionCount, willChangeCount, paintTriggerCount, fontDisplayMap }
  })

  return {
    totalCSSBytes: totalBytes,
    unusedCSSBytes: totalBytes - usedBytes,
    unusedCSSPercent: totalBytes > 0 ? Math.round(((totalBytes - usedBytes) / totalBytes) * 100) : 0,
    animationCount: inPageSignals.animationCount,
    transitionCount: inPageSignals.transitionCount,
    willChangeCount: inPageSignals.willChangeCount,
    paintTriggerPropertyCount: inPageSignals.paintTriggerCount,
    fontDisplayStrategies: inPageSignals.fontDisplayMap,
  }
}
```

### 5c: JS Signals (SIG-03)

**What to extract:** Bundle transfer sizes, chunk count, render-blocking vs async/deferred classification, framework fingerprint (loading behavior only). NOT code quality analysis on minified bundles (see Pitfalls).

**Method:** `page.coverage.startJSCoverage()` / `stopJSCoverage()` for per-script bytes. `page.evaluate()` to check `<script>` attributes for async/defer. Framework fingerprints via known window properties. [CITED: STACK.md Pitfall 5, playwright.dev/docs/api/class-coverage]

```typescript
// src/extractors/js.ts
import { Page } from 'playwright-core'

export interface JSSignals {
  totalJSBytes: number              // sum of all script transfer sizes
  scriptCount: number
  renderBlockingCount: number       // <script> without async/defer before </head>
  asyncScriptCount: number          // <script async>
  deferredScriptCount: number       // <script defer>
  moduleScriptCount: number         // <script type="module">
  thirdPartyScriptCount: number     // scripts from different origins than the page
  frameworkFingerprint: string[]    // e.g. ['nextjs', 'react'] — from window properties
  unusedJSBytes: number
  unusedJSPercent: number
}

export async function extractJSSignals(page: Page): Promise<JSSignals> {
  const coverageEntries = await page.coverage.stopJSCoverage()

  let totalBytes = 0
  let usedBytes = 0
  for (const entry of coverageEntries) {
    // V8 coverage entry: url, source, functions
    // Total bytes approximated from source length (transfer size unavailable from coverage API)
    if (entry.url && !entry.url.startsWith('v8-snapshot://')) {
      totalBytes += entry.url.length  // placeholder — actual size from HAR is more accurate
    }
    for (const fn of entry.functions) {
      for (const range of fn.ranges) {
        if (range.count > 0) usedBytes += range.endOffset - range.startOffset
      }
    }
  }

  const inPageSignals = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[]
    const pageOrigin = window.location.origin

    const blocking = scripts.filter(s =>
      !s.async && !s.defer && s.type !== 'module' &&
      !document.head?.contains(s) === false  // in head, not async/defer
    )

    const frameworks: string[] = []
    if ((window as any).__NEXT_DATA__) frameworks.push('nextjs')
    if ((window as any).React || (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) frameworks.push('react')
    if ((window as any).__vue_app__) frameworks.push('vue3')
    if ((window as any).Vue) frameworks.push('vue2')
    if ((window as any).__nuxt) frameworks.push('nuxt')
    if ((window as any).angular) frameworks.push('angularjs')
    if ((window as any).ng) frameworks.push('angular')
    if ((window as any).Svelte || document.querySelector('[class^="svelte-"]')) frameworks.push('svelte')
    if ((window as any).Remix) frameworks.push('remix')

    return {
      scriptCount: scripts.length,
      renderBlockingCount: blocking.length,
      asyncScriptCount: scripts.filter(s => s.async).length,
      deferredScriptCount: scripts.filter(s => s.defer).length,
      moduleScriptCount: scripts.filter(s => s.type === 'module').length,
      thirdPartyScriptCount: scripts.filter(s => {
        try { return new URL(s.src).origin !== pageOrigin } catch { return false }
      }).length,
      frameworks,
    }
  })

  return {
    totalJSBytes: totalBytes,
    scriptCount: inPageSignals.scriptCount,
    renderBlockingCount: inPageSignals.renderBlockingCount,
    asyncScriptCount: inPageSignals.asyncScriptCount,
    deferredScriptCount: inPageSignals.deferredScriptCount,
    moduleScriptCount: inPageSignals.moduleScriptCount,
    thirdPartyScriptCount: inPageSignals.thirdPartyScriptCount,
    frameworkFingerprint: inPageSignals.frameworks,
    unusedJSBytes: totalBytes - usedBytes,
    unusedJSPercent: totalBytes > 0 ? Math.round(((totalBytes - usedBytes) / totalBytes) * 100) : 0,
  }
}
```

### 5d: Network/HAR Signals (SIG-04)

**What to extract:** Full request timing waterfall (DNS, TLS, TTFB, download), render-blocking asset identification, CDN detection, image optimization signals.

**Method:** `browser.newContext({ recordHar })` records all network requests with timing. `context.close()` flushes the HAR to disk. Read the HAR file and extract typed signals. Request timing fields: `domainLookupStart/End`, `connectStart`, `secureConnectionStart`, `connectEnd`, `requestStart`, `responseStart`, `responseEnd`. [VERIFIED: playwright.dev/docs/api/class-request#request-timing]

```typescript
// src/extractors/network.ts
import * as fs from 'fs/promises'

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
    wait: number         // TTFB (time to first byte)
    receive: number      // download time
    total: number
  }
  isRenderBlocking: boolean
  cdnProvider: string | null
}

export interface NetworkSignals {
  totalRequests: number
  totalTransferSize: number     // bytes
  renderBlockingCount: number
  renderBlockingAssets: string[]  // URLs
  cdnCount: number               // requests served from CDN
  firstRequestTTFB: number       // TTFB of the primary HTML document (ms)
  maxTTFB: number                // worst TTFB across all requests
  imageCount: number
  oversizedImageCount: number    // images where transfer > 100KB
  totalImageBytes: number
  entries: HAREntry[]
}

const CDN_FINGERPRINTS = [
  'cloudfront.net', 'fastly.net', 'cdn.jsdelivr.net', 'unpkg.com',
  'cdnjs.cloudflare.com', 'akamaized.net', 'azureedge.net',
]

export async function extractNetworkSignals(harPath: string): Promise<NetworkSignals> {
  const harContent = await fs.readFile(harPath, 'utf-8')
  const har = JSON.parse(harContent)
  const entries: HAREntry[] = []

  let totalSize = 0
  let renderBlockingCount = 0
  const renderBlockingAssets: string[] = []
  let cdnCount = 0
  let firstTTFB = -1
  let maxTTFB = 0
  let imageCount = 0
  let oversizedImageCount = 0
  let totalImageBytes = 0

  for (const entry of har.log.entries) {
    const timings = entry.timings || {}
    const dns = timings.dns ?? -1
    const connect = timings.connect ?? -1
    const ssl = timings.ssl ?? -1
    const wait = timings.wait ?? -1     // TTFB
    const receive = timings.receive ?? -1

    const url: string = entry.request?.url ?? ''
    const transferSize: number = entry.response?.bodySize ?? 0
    const mimeType: string = entry.response?.content?.mimeType ?? ''
    const status: number = entry.response?.status ?? 0

    totalSize += transferSize

    // TTFB tracking
    if (wait > 0) {
      if (firstTTFB === -1 && (mimeType.includes('html') || mimeType.includes('text'))) {
        firstTTFB = wait
      }
      maxTTFB = Math.max(maxTTFB, wait)
    }

    // CDN detection
    const isCDN = CDN_FINGERPRINTS.some(fp => url.includes(fp))
    if (isCDN) cdnCount++

    // Render-blocking heuristic: scripts/CSS loaded before first paint that are not async
    // HAR does not include async/defer attributes directly; use initiatorType heuristic
    const isRenderBlocking =
      (mimeType.includes('javascript') || mimeType.includes('css')) &&
      !url.includes('async') &&
      !url.includes('defer') &&
      entry.pageref === har.log.pages?.[0]?.id   // only first page's requests

    if (isRenderBlocking) {
      renderBlockingCount++
      renderBlockingAssets.push(url)
    }

    // Image signals
    if (mimeType.startsWith('image/')) {
      imageCount++
      totalImageBytes += transferSize
      if (transferSize > 100 * 1024) oversizedImageCount++  // >100KB is flagged
    }

    entries.push({
      url,
      method: entry.request?.method ?? 'GET',
      status,
      mimeType,
      transferSize,
      timings: { dns, connect, ssl, wait, receive, total: entry.time ?? -1 },
      isRenderBlocking,
      cdnProvider: CDN_FINGERPRINTS.find(fp => url.includes(fp)) ?? null,
    })
  }

  // Clean up temporary HAR file
  await fs.unlink(harPath).catch(() => {})

  return {
    totalRequests: entries.length,
    totalTransferSize: totalSize,
    renderBlockingCount,
    renderBlockingAssets,
    cdnCount,
    firstRequestTTFB: firstTTFB,
    maxTTFB,
    imageCount,
    oversizedImageCount,
    totalImageBytes,
    entries,
  }
}
```

---

## Pattern 6: Prisma from Railway (Standard PrismaClient, No Adapter)

**What:** Use standard `PrismaClient` in the Railway crawler — no `@prisma/adapter-neon`. Connect to Neon via the pooler URL over standard TCP.

**Why:** The `@prisma/adapter-neon` (and `@neondatabase/serverless`) exist specifically for serverless/edge runtimes that cannot maintain persistent TCP connections — Vercel Functions, Cloudflare Workers, Netlify Functions. A Railway Docker container is a **persistent process** that maintains a connection pool across requests. Using the serverless WebSocket adapter from a persistent process adds unnecessary overhead. [CITED: neon.com/docs/connect/choose-connection]

**Source:** [neon.com/docs/connect/choose-connection](https://neon.com/docs/connect/choose-connection) [CITED]

```typescript
// crawler/src/lib/prisma.ts
// Standard PrismaClient — no @prisma/adapter-neon needed for Docker/Railway
// Railway is a persistent process; use TCP connection pool directly.
//
// DATABASE_URL format: postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
// Note: still use the -pooler URL (PgBouncer) to efficiently manage connections
// across multiple job processing cycles without hitting Neon's max connection limit.

import { PrismaClient } from '../generated/prisma'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

**Prisma schema copy:** The crawler needs `prisma generate` at Docker build time. Copy or symlink `prisma/schema.prisma` from the root into `crawler/prisma/schema.prisma`. The generator output path must point to `crawler/src/generated/prisma`.

**railway.toml addition for `prisma generate` at build:**
```toml
[build]
buildCommand = "npm ci && npx prisma generate && npm run build"
```

**Important:** The `DATABASE_URL` env var in Railway should be the **pooler URL** (hostname contains `-pooler`, port 6543) even for a persistent process. This routes through Neon's PgBouncer. Without the pooler URL, a long-running process can exhaust Neon's free-tier connection limit (default 20 concurrent connections) during high-volume periods.

---

## Pattern 7: Job Status Transition Sequence

**What:** The crawler updates `Job.status` through each transition so the Phase 1 polling endpoint (`GET /api/jobs/[jobId]`) always reflects current state.

**Source:** D-18 (status enum) from Phase 1 CONTEXT.md

```typescript
// src/processor.ts
import { prisma } from './lib/prisma'
import { runDualViewportCrawl } from './browser'

export async function processJob(jobId: string, url: string): Promise<void> {
  // Idempotency check (D-05): discard duplicate QStash deliveries
  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { status: true } })
  if (!job) {
    console.warn(`[processor] Job ${jobId} not found — discarding`)
    return
  }
  if (job.status !== 'pending') {
    console.warn(`[processor] Job ${jobId} already ${job.status} — discarding duplicate delivery`)
    return
  }

  const startedAt = Date.now()
  const SLA_MS = 55_000   // 55s budget (5s headroom within the 60s SLA)

  try {
    // Transition 1: pending → crawling
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'crawling' },
    })

    // Abort if already over SLA (should not happen here but defensive)
    if (Date.now() - startedAt > SLA_MS) throw new Error('SLA exceeded before crawl start')

    // Run dual viewport crawl (mobile + desktop)
    const { mobile, desktop } = await runDualViewportCrawl(url)

    // Transition 2: crawling → extracting
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'extracting' },
    })

    // Signal payloads are in-memory objects at this point.
    // Phase 3 (AI Pipeline) will consume these signals directly.
    // Per INFRA-03: raw signals are NOT written to the DB as permanent records.
    // Signals are passed to the Phase 3 invocation (next phase will wire this).
    const signals = { mobile, desktop }

    // Transition 3: extracting → analyzing
    // Phase 3 integration will go here (out of scope for Phase 2)
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'analyzing' },
    })

    // TODO Phase 3: invoke AI pipeline with signals, write Result/Issue/CausalEdge records
    // For Phase 2, mark complete after signal extraction to prove end-to-end flow
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'complete' },
    })

    console.log(`[processor] Job ${jobId} completed in ${Date.now() - startedAt}ms`)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown crawler error'
    console.error(`[processor] Job ${jobId} failed:`, message)
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        error_message: message.slice(0, 500),   // truncate to stay within column limit
      },
    })
  }
}
```

**SLA enforcement pattern:** Use a `Promise.race` with a timeout to enforce the 60-second SLA on the entire crawl + extract cycle:

```typescript
// In processor.ts, wrap the crawl in a timeout race
const crawlWithTimeout = Promise.race([
  runDualViewportCrawl(url),
  new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('SLA exceeded: crawl timed out after 55s')), SLA_MS)
  ),
])
const { mobile, desktop } = await crawlWithTimeout
```

---

## Common Pitfalls

### Pitfall 1: `--no-sandbox` Flag When Running as Root

**What goes wrong:** Developers add `--no-sandbox` to Playwright launch args to get Chromium running inside Docker. This works but disables Chromium's process sandbox entirely, creating a security risk if the crawler ever processes a page with malicious content (which is the entire use case).

**Why it happens:** Many tutorials recommend `--no-sandbox` as the quick fix for Docker/Linux permission errors.

**How to avoid:** Use the official `mcr.microsoft.com/playwright/node` image with `USER pwuser`. The `pwuser` non-root user is created in the image and includes the correct seccomp profile to run Chromium with sandbox intact. Reserve `--no-sandbox` only as a documented fallback if `pwuser` is incompatible with Railway's runtime, and note the security implication. [CITED: playwright.dev/docs/docker]

**Warning signs:** `--no-sandbox` in Chromium launch args combined with a `USER root` or no USER directive in the Dockerfile.

---

### Pitfall 2: `waitForLoadState('networkidle')` Blocks Forever on Modern SPAs

**What goes wrong:** The crawler hangs waiting for network idle on pages with analytics (Segment, GA4), background polling, WebSocket connections, or infinite scroll. The job times out after 60 seconds and the error message misleads the team into thinking the page failed to load.

**Why it happens:** `networkidle` waits for 500 ms of no network requests. Modern SPAs make this condition nearly impossible.

**How to avoid:** Use `waitForLoadState('domcontentloaded')` as the navigation `waitUntil`, then follow with `waitForFunction()` checking for framework hydration markers (Pattern 3). Never use `'networkidle'` as the primary wait strategy. [CITED: github.com/microsoft/playwright/issues/22661]

**Warning signs:** Crawl timeout errors that correlate with SPA-heavy sites (React apps, Vue apps, Next.js pages) but not static sites.

---

### Pitfall 3: QStash Signature Verification Fails on Parsed Body

**What goes wrong:** The crawler verifies the signature after parsing the JSON body and re-serializing it with `JSON.stringify()`. Signature verification fails because key order and whitespace may differ from the original wire bytes.

**Why it happens:** Frameworks like Express automatically parse JSON bodies. Developers call `receiver.verify({ body: JSON.stringify(req.body), ... })` using the already-parsed object.

**How to avoid:** In Hono, read the raw body with `c.req.text()` before any parsing. Verify signature against the raw string. Only parse `JSON.parse(rawBody)` after verification passes. [CITED: upstash.com/docs/qstash/howto/signature]

**Warning signs:** Intermittent 401 errors from the crawler; signature verification failures on valid QStash deliveries; `receiver.verify()` throwing consistently.

---

### Pitfall 4: HAR File Not Flushed — `context.close()` Required

**What goes wrong:** The crawler reads the HAR file immediately after navigation and gets an empty or incomplete file. HAR recording buffers in memory during the session.

**Why it happens:** `recordHar` writes data to disk only when `context.close()` is called. Reading the file path before closing the context reads partial data.

**How to avoid:** Always call `await context.close()` before reading the HAR file. Stop CSS/JS coverage (`stopCSSCoverage()`, `stopJSCoverage()`) before `context.close()` — once the context is closed, coverage data is lost. [CITED: playwright.dev/docs/api/class-browser#browser-new-context]

**Warning signs:** HAR file exists but contains zero entries; coverage `stopXxxCoverage()` throws after context.close().

---

### Pitfall 5: Railway Cold Start Delays QStash Retry Logic

**What goes wrong:** If the Railway service is restarted (deploy, OOM kill, health check failure), there is a ~10-30 second cold start window during which QStash deliveries return non-200 and trigger retries. QStash retries will arrive after the service is back up, but the job may be processed twice if status is still `pending`.

**Why it happens:** QStash uses retry-on-non-200. Railway process restarts clear in-process p-queue state.

**How to avoid:** The idempotency check in Pattern 7 (check job status before processing) handles this: if the first delivery started processing before the restart, the job status is `crawling` or later, and the retry is discarded. If the restart happened before any processing, the status is still `pending` and the retry is processed correctly. No additional state management needed beyond the DB check. [CITED: D-05 from Phase 1 CONTEXT.md]

**Warning signs:** Duplicate "crawling" state entries in logs for the same jobId.

---

### Pitfall 6: CSS Coverage Misses Dynamically Injected Styles

**What goes wrong:** CSS injected by JavaScript at runtime (e.g., CSS-in-JS like styled-components, Tailwind's JIT, emotion) shows as 100% unused by Playwright CSS Coverage because `startCSSCoverage()` only tracks stylesheets loaded as network resources, not `<style>` tags inserted by JS.

**Why it happens:** Playwright's Coverage API documentation notes: "CSS Coverage doesn't include dynamically injected style tags without sourceURLs." [VERIFIED: playwright.dev/docs/api/class-coverage]

**How to avoid:** Treat CSS coverage numbers as a lower bound on unused CSS, not an exact figure. Log the number of `<style>` tags in the DOM (via `page.evaluate`) and note when dynamically injected styles appear to dominate. Do not present the unused CSS percentage as authoritative on CSS-in-JS pages — this limitation must be documented in the signal metadata.

**Warning signs:** CSS coverage shows 90-100% unused on a visually styled page; many `<style>` tags in the DOM without `src` attributes.

---

### Pitfall 7: Chromium --disable-dev-shm-usage Required in Docker

**What goes wrong:** Chromium crashes with `SIGBUS` or `No space left on device` in Docker containers because the default `/dev/shm` shared memory allocation (64 MB) is too small for Chromium's memory requirements.

**Why it happens:** Docker containers default to 64 MB `/dev/shm`. Chromium uses shared memory for GPU compositing even in headless mode.

**How to avoid:** Always include `--disable-dev-shm-usage` in Chromium launch args. This redirects shared memory use to `/tmp` which has no size constraint. Alternatively, pass `--shm-size=2g` to `docker run`, but `--disable-dev-shm-usage` is more portable (no docker run flag required). [CITED: playwright.dev/docs/docker — recommended flags]

**Warning signs:** Random Chromium crashes inside Docker that don't reproduce locally; `SIGBUS` in crash logs.

---

## Decisions

New architectural decisions introduced by Phase 2:

| ID | Decision | Rationale |
|----|----------|-----------|
| D-20 | Railway HTTP framework: **Hono** (not Express) | Native TypeScript, Web Standards API, lighter than Express. Raw-body access via `c.req.text()` is first-class — critical for QStash signature verification |
| D-21 | Playwright base image: **`mcr.microsoft.com/playwright/node:v1.60.0-noble`** (not `@sparticuz/chromium`) | Railway is a Docker container (persistent), not Lambda (serverless). Official image pre-installs all Chromium system deps. @sparticuz/chromium is Lambda-specific |
| D-22 | Railway Prisma client: **standard PrismaClient, no adapter** | Docker/Railway is a persistent TCP process. `@prisma/adapter-neon` is for serverless/edge environments. Standard PrismaClient with pooler URL is more efficient |
| D-23 | Internal job queue: **p-queue (concurrency: 1)** | Prevents two Playwright instances running simultaneously. OOM kills are silent and unrecoverable — sequential processing is safer than concurrent within one container |
| D-24 | Network throttling method: **CDPSession `Network.emulateNetworkConditions`** | Playwright has no native emulateNetworkConditions API; CDP is the only method. Chromium-only, consistent with our stack |
| D-25 | SPA hydration wait strategy: **`domcontentloaded` + `waitForFunction` for framework markers** | `networkidle` blocks forever on modern SPAs with analytics/polling. Framework-specific markers (`__NEXT_DATA__`, `__reactFiber*`, `__vue_app__`) are reliable hydration signals |
| D-26 | HAR recording: **`recordHar: { content: 'omit', mode: 'full' }`** | `omit` skips response body storage (memory/disk efficiency); `mode: 'full'` preserves all timing data (DNS, TLS, TTFB) needed for SIG-04 |
| D-27 | Mobile viewport profile: **375×812px, download 40KB/s, upload 20KB/s, latency 400ms (slow 3G)** | Industry-standard mobile crawl profile. Defined here as a locked value — avoid drift between plans |
| D-28 | SLA timeout enforcement: **55-second `Promise.race` timeout** wrapping the crawl | The 60s SLA is the outer constraint. 5 seconds of headroom for DB writes and cleanup. On timeout, job transitions to `failed` with `error_message: 'SLA exceeded'` |

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| QStash signature verification | Custom HMAC validation | `@upstash/qstash` `Receiver.verify()` | Handles both current and next signing keys, replay protection, JWT validation edge cases |
| Playwright browser lifecycle | Custom browser pool | `playwright-core` `chromium.launch()` | Browser lifecycle (launch, context, page, close) has many edge cases around zombie processes and resource leaks |
| Network throttling | Proxy-based bandwidth limiting | CDPSession `Network.emulateNetworkConditions` | CDP is the authoritative Chromium API for this; proxy approaches add latency overhead to timing measurements |
| In-memory job queue | Custom queue with Redis | `p-queue` | p-queue is battle-tested, TypeScript-native, zero dependencies for concurrency:1 use case |
| HAR parsing | Custom binary/text parser | Read JSON from disk (Playwright writes valid JSON HAR) | HAR format is standard JSON; just `JSON.parse` the file |
| CSS unused analysis | Parse CSS AST | `page.coverage.startCSSCoverage()` | Coverage API uses V8's instrumentation — more accurate than static parsing |

**Key insight:** Every signal extraction pattern has a browser-native API (`coverage`, `evaluate`, CDP, HAR) that is more accurate and less brittle than any post-hoc parsing approach. Resist the temptation to parse downloaded scripts or stylesheets — extract from the live browser context.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Railway service runtime | ✓ (in Docker image) | 22.x (in mcr.microsoft.com/playwright/node:v1.60.0-noble) | — |
| Chromium | Playwright crawl | ✓ (in Docker image) | Bundled with Playwright 1.60.0 | — |
| Railway account | Container hosting | ✓ (per architecture decision) | — | Fly.io (see ARCHITECTURE.md) |
| Neon PostgreSQL | Signal storage | ✓ (provisioned in Phase 1) | — | — |
| Upstash QStash | Job delivery | ✓ (provisioned in Phase 1) | — | — |
| Docker | Local dev / Railway build | ✓ (assumed for Railway deployments) | — | — |

**Missing dependencies with no fallback:** None — all dependencies are either bundled in the Docker image or provisioned in Phase 1.

**Local development note:** To run the crawler service locally without Docker, `npm install playwright-core && npx playwright install chromium` installs the Chromium binary. This is a development convenience only — production always uses the Docker image.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (root vitest.config.mts) |
| Config file | `vitest.config.mts` (project root) |
| Quick run command | `npm test -- --run crawler/src/extractors` |
| Full suite command | `npm test -- --run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CRAWL-02 | SPA hydration wait resolves on a Next.js page | manual-only | — | — (requires live Chromium) |
| CRAWL-03 | Dual viewport crawl produces two signal sets with correct widths | manual-only | — | — (requires live Chromium) |
| SIG-01 | DOM extractor returns correct counts for a known HTML fixture | unit | `npm test -- --run crawler/src/extractors/dom.test.ts` | ❌ Wave 0 |
| SIG-02 | CSS extractor returns non-zero animationCount for a page with animations | manual-only | — | — (Coverage API needs browser) |
| SIG-03 | JS extractor correctly classifies async/defer scripts | unit | `npm test -- --run crawler/src/extractors/js.test.ts` | ❌ Wave 0 |
| SIG-04 | HAR parser extracts TTFB and render-blocking from a fixture HAR | unit | `npm test -- --run crawler/src/extractors/network.test.ts` | ❌ Wave 0 |

**Note on test scope:** Signal extractors that run in-browser (DOM, CSS) can only be fully tested with a live Chromium instance. Unit tests cover: (a) the in-page evaluation logic extracted into pure functions that take DOM snapshots, and (b) the HAR JSON parsing logic. The browser-dependent steps are covered by the end-to-end smoke test in the final wave.

### Wave 0 Gaps
- [ ] `crawler/src/extractors/dom.test.ts` — covers SIG-01 DOM signal shape validation
- [ ] `crawler/src/extractors/js.test.ts` — covers SIG-03 script classification logic
- [ ] `crawler/src/extractors/network.test.ts` — covers SIG-04 HAR parsing with a fixture HAR file

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Service-to-service auth via QStash signing keys |
| V3 Session Management | no | Stateless HTTP; no sessions in the crawler |
| V4 Access Control | yes | QStash Receiver.verify() — reject unauthenticated requests at /crawl |
| V5 Input Validation | yes | zod validation on QStash payload `{ jobId, url }` before processing |
| V6 Cryptography | no | QStash uses HMAC signing — do not re-implement |

### Known Threat Patterns for Playwright Crawler

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SSRF via QStash payload URL | Spoofing / Information Disclosure | D-13 Layer 2: `context.route()` blocks RFC-1918 and loopback at the browser level |
| Prompt injection via page content | Tampering | Signals are extracted as typed numbers/counts — no raw HTML or text passes to the AI pipeline (INFRA-03) |
| Unauthenticated job injection | Spoofing | QStash `Receiver.verify()` in Pattern 2; reject without 401 if signature missing or invalid |
| Duplicate QStash delivery | Denial of Service | Idempotency check in Pattern 7 (status ≠ pending → discard) |
| Crawler OOM kills | Denial of Service | p-queue concurrency:1 + `--disable-dev-shm-usage` + Railway min 1GB RAM |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Mobile viewport throttle: 40KB/s down, 20KB/s up, 400ms latency (slow 3G) | D-27, Pattern 4 | Different throttle values would change what "mobile throttled" means — phase-dependent but not blocking; values can be adjusted without schema changes |
| A2 | `pwuser` is pre-created in `mcr.microsoft.com/playwright/node` and has the correct seccomp profile for Chromium sandbox | Pattern 1 | If not, must either add `--no-sandbox` (security tradeoff) or create the user manually |
| A3 | HAR files are safe to write to `/tmp` in Railway containers | Pattern 4, 5d | Railway containers may restrict `/tmp` or have small ephemeral disk — fallback is `context.har()` API which returns HAR as a Buffer without a file path |
| A4 | Neon pooler URL works from Railway persistent container without additional configuration | Pattern 6 | If Neon blocks persistent TCP connections from Railway's egress IPs, may need to switch to direct URL or contact Neon support |

---

## Open Questions

1. **Signal storage between Phase 2 and Phase 3**
   - What we know: INFRA-03 says raw signals are NOT persisted to the DB. Phase 3 needs signals to run the AI pipeline.
   - What's unclear: Since signals are in-memory objects in the crawler process, Phase 3 either runs in the same Railway process (crawler calls AI pipeline directly) or signals need a transit mechanism (short-lived Redis, callback POST to Next.js, etc.).
   - Recommendation: For Phase 2 scope, mark the job `analyzing` after extraction and leave a `TODO Phase 3` comment in the processor. Phase 3 research resolves this.

2. **Playwright version pinning in Dockerfile vs package.json**
   - What we know: The Docker image `mcr.microsoft.com/playwright/node:v1.60.0-noble` pins Playwright at 1.60.0. The `package.json` `playwright-core` version must match exactly.
   - What's unclear: When Playwright releases a new version, both the Dockerfile and package.json must be updated in sync.
   - Recommendation: Pin to `"playwright-core": "1.60.0"` (exact, no caret) in `crawler/package.json` and use the matching Docker tag. Update as a deliberate dependency bump.

3. **Railway service scale — one instance or multiple?**
   - What we know: p-queue with concurrency:1 processes jobs sequentially within one instance. Multiple Railway instances would run separate queues and could process jobs simultaneously.
   - What's unclear: QStash at-least-once delivery with multiple Railway instances could deliver the same job to different instances simultaneously, potentially bypassing the DB idempotency check if both check status before either updates it (race condition).
   - Recommendation: For MVP, configure Railway to run **one instance** (Replicas = 1). Note this as a scaling concern for future phases.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@sparticuz/chromium` for all environments | Official `mcr.microsoft.com/playwright/node` for Docker containers | 2022–2023 | @sparticuz was a Lambda-only workaround; use it only for Lambda, never for Docker |
| `waitForLoadState('networkidle')` | `waitForLoadState('domcontentloaded')` + framework-specific `waitForFunction` | 2021–2022 | networkidle was the Puppeteer pattern; SPAs made it unreliable |
| Puppeteer for browser automation | Playwright | 2020–2021 | Playwright adds Coverage API (CSS/JS), better async handling, multi-browser support |
| Manual HAR capture via CDP tracing | `browser.newContext({ recordHar })` | Playwright 1.23+ | First-class HAR recording eliminated manual CDP event handling |
| `page.coverage` via separate CDPSession | `page.coverage.startCSSCoverage()` (native API) | Playwright 1.x | Coverage API is now a first-class Playwright API, not a CDP wrapper |

---

## Sources

### Primary (HIGH confidence)
- [playwright.dev/docs/docker](https://playwright.dev/docs/docker) — Playwright Docker image format, non-root user, sandbox flags
- [playwright.dev/docs/api/class-coverage](https://playwright.dev/docs/api/class-coverage) — CSS/JS Coverage API return shapes
- [playwright.dev/docs/api/class-request#request-timing](https://playwright.dev/docs/api/class-request#request-timing) — request.timing() field definitions
- [playwright.dev/docs/api/class-browser#browser-new-context](https://playwright.dev/docs/api/class-browser#browser-new-context) — recordHar options
- [upstash.com/docs/qstash/howto/signature](https://upstash.com/docs/qstash/howto/signature) — Receiver class, raw body requirement
- [neon.com/docs/connect/choose-connection](https://neon.com/docs/connect/choose-connection) — Standard TCP recommendation for Docker/Railway
- [docs.railway.com/guides/healthchecks](https://docs.railway.com/guides/healthchecks) — Railway healthcheck path, timeout, PORT injection
- [docs.railway.com/guides/playwright](https://docs.railway.com/guides/playwright) — Memory requirements, PLAYWRIGHT_BROWSERS_PATH

### Secondary (MEDIUM confidence)
- [github.com/microsoft/playwright/issues/22661](https://github.com/microsoft/playwright/issues/22661) — networkidle limitations with SPAs
- [github.com/microsoft/playwright/issues/6038](https://github.com/microsoft/playwright/issues/6038) — CDPSession Network.emulateNetworkConditions as the network throttle approach
- Phase 1 CONTEXT.md (D-01 through D-19) — authoritative locked decisions

### Tertiary (LOW confidence)
- None — all claims either verified from official documentation or tagged [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Pattern 1 (Dockerfile): HIGH — from official Playwright Docker docs
- Pattern 2 (QStash verification): HIGH — from official Upstash QStash docs
- Pattern 3 (SPA hydration): MEDIUM — `waitForFunction` approach is sound, but framework detection heuristics are training-knowledge based
- Pattern 4 (Dual viewport): MEDIUM-HIGH — CDPSession throttle from official Playwright issue tracker; viewport values [ASSUMED]
- Pattern 5 (Signal extraction): MEDIUM — `page.evaluate()` patterns and Coverage API from official Playwright docs; specific DOM queries are implementation-level detail [ASSUMED]
- Pattern 6 (Prisma TCP): HIGH — from official Neon connection guide
- Pattern 7 (Job transitions): HIGH — derived from locked D-18 decisions

**Research date:** 2026-05-22
**Valid until:** 2026-07-22 (60 days — Playwright and QStash APIs are stable; Railway healthcheck config unlikely to change)
