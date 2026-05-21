# Technology Stack

**Project:** FeelTrace
**Researched:** 2026-05-18
**Confidence note:** Stack decisions verified against Context7 library docs (Playwright v1.58.x, Anthropic SDK TypeScript, Prisma v6/7, sparticuz/chromium). Vercel size limits from documented constraints known through training cutoff + Puppeteer troubleshooting docs. Confidence levels assigned per finding.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js App Router | 15.x | Dashboard UI + API routes | Already established in CLAUDE.md; App Router Server Components for zero-JS dashboard pages |
| TypeScript | 5.x | Type safety throughout | Already established; critical for AI pipeline contract types |
| Tailwind CSS | 4.x | Styling | Already established |

### Headless Browser (Crawling)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| playwright-core | 1.58.x | SPA crawling, DOM/CSS/JS/network extraction | Chromium-only APIs (`page.coverage`, `request.timing()`) needed for signal extraction; `playwright-core` has no bundled browser (unlike `playwright`) |
| @sparticuz/chromium | 133.x | Chromium binary for serverless | Stripped Chromium ~45MB compressed, purpose-built for Lambda/serverless; Playwright integration is first-class documented |

**Why `playwright-core` over `playwright`:** The full `playwright` package bundles Chromium (~170MB), Firefox, and WebKit — none of which can be deployed to serverless functions. `playwright-core` is the library without browsers; you supply the executable path separately.

**Why Playwright over Puppeteer:**
- `page.coverage.startCSSCoverage()` / `stopCSSCoverage()` and `startJSCoverage()` / `stopJSCoverage()` are Playwright Coverage APIs that return per-stylesheet and per-script range coverage data. These are essential for "which CSS/JS is actually used" signal extraction.
- `request.timing()` on `requestfinished` events provides full DNS + TLS + TTFB + download waterfall data natively.
- Playwright's network interception (`page.route()`) is more ergonomic.
- Playwright is actively maintained at a higher velocity than Puppeteer as of 2025.

**Confidence:** HIGH (Context7 verified, official Playwright docs)

### Crawl Execution Environment

**This is the most constrained architectural decision in the stack. Read carefully.**

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| AWS Lambda (Node.js 22.x) | — | Execute Playwright crawl jobs | Only viable serverless option for Playwright; Vercel cannot host Playwright directly |
| @sparticuz/chromium Lambda Layer | 133.x | Provide Chromium binary to Lambda | Published as a Lambda Layer zip (~45MB compressed), keeps function bundle under the 50MB limit |

**Why NOT Vercel for the crawler:** Vercel imposes a 50MB unzipped size limit per function and a 250MB total deployment limit. The `@sparticuz/chromium` binary alone is ~45MB compressed / ~180MB unzipped. Even with Lambda Layers (which are unzipped separately), Vercel has no equivalent layering mechanism. Multiple community-tested approaches confirm that Playwright on Vercel is not reliably achievable in 2025. The Puppeteer troubleshooting docs explicitly call out Lambda's ~50MB deployment constraint and recommend `sparticuz/chromium` as the community solution for Lambda — and even that solution is Lambda-specific.

**Architecture consequence:** The Next.js app on Vercel calls an API endpoint on AWS Lambda (or another container runtime) that runs the crawl and returns signals. This is a service call, not an inline function execution.

**Alternative if AWS Lambda setup cost is too high for MVP:** Use a managed remote browser service.

| Technology | Purpose | Trade-off |
|------------|---------|-----------|
| Browserless.io | Hosted Playwright/Puppeteer API, returns page data | Simpler ops, but adds per-call cost and a third-party dependency for core functionality |
| Apify | Web scraping platform with Playwright actors | Good developer UX, but Apify pricing and vendor lock-in |
| Bright Data Scraping Browser | Managed browser with anti-bot bypass | Overkill for MVP; used for sites with aggressive bot detection |

**Recommendation for MVP:** Start with AWS Lambda + sparticuz/chromium Lambda Layer. The ops overhead is real but manageable, and it keeps the crawler fully under your control. Browserless.io is a reasonable fallback if Lambda setup becomes a blocker.

**Confidence:** HIGH for Vercel constraints (documented limits, sparticuz docs confirm Lambda as target). MEDIUM for Browserless.io as alternative (training knowledge, not Context7-verified).

### Database

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Neon PostgreSQL | — | Store analysis results | Already established in CLAUDE.md; serverless Postgres with connection pooling built in |
| Prisma ORM | 6.x / 7.x | Database access layer | Already established; `@prisma/adapter-neon` required for serverless |

**Neon + Prisma configuration pattern (verified from Context7):**

```env
DATABASE_URL="postgres://user:pass@host-pooler:6543/db?pgbouncer=true"
DIRECT_URL="postgres://user:pass@host:5432/db"
```

```typescript
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "./generated/prisma";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

`DATABASE_URL` points to Neon's PgBouncer pooler (port 6543). `DIRECT_URL` is required for Prisma migrations (bypasses the pooler). Without the `-pooler` hostname, Vercel serverless functions will exhaust Neon's connection limit under any real load.

**Vercel Fluid compute pattern (verified from Context7):**

```typescript
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
attachDatabasePool(pool);

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
```

`attachDatabasePool` from `@vercel/functions` ensures idle connections are released when a Vercel function suspends — prevents connection pool exhaustion in the serverless model.

**Confidence:** HIGH (Context7 verified from prisma/web docs)

### AI Pipeline

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @anthropic-ai/sdk | 0.40+ | Claude API access | Already mandated in PROJECT.md; current SDK has first-class structured output support |
| zod | 4.x | Schema definition for structured output | Integrates directly with `zodOutputFormat` in Anthropic SDK; provides TypeScript types from schemas automatically |

**Structured output pattern (verified from Context7):**

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod/v4";

const client = new Anthropic();

const IssueSchema = z.object({
  id: z.string(),
  severity: z.enum(["critical", "high", "medium", "low"]),
  category: z.enum(["performance", "accessibility", "interaction", "visual"]),
  title: z.string(),
  explanation: z.string().describe("Plain-English explanation for a non-engineer"),
  technical_detail: z.string().describe("Developer-targeted specifics"),
  signal_sources: z.array(z.string()).describe("Which signals triggered this issue"),
});

const AnalysisSchema = z.object({
  issues: z.array(IssueSchema),
  narrative_summary: z.string().describe("2-4 paragraph PM-readable narrative"),
  perceived_performance_grade: z.enum(["A", "B", "C", "D", "F"]),
});

const result = await client.messages.parse({
  model: "claude-sonnet-4-5",
  max_tokens: 4096,
  messages: [{ role: "user", content: prompt }],
  output_config: { format: zodOutputFormat(AnalysisSchema) },
});

const analysis = result.parsed_output!;
```

**Why `messages.parse` over raw `messages.create`:** `client.messages.parse` with `zodOutputFormat` returns a `parsed_output` field that is already validated against the schema and typed — no manual `JSON.parse` + try/catch needed. If Claude produces output that doesn't match the schema, the SDK throws a typed error rather than returning malformed data silently.

**Multi-stage pipeline design:** Each stage should be a separate `messages.parse` call with its own focused schema, NOT one giant prompt with all signals. Reasons:
1. Individual stages can be debugged and logged independently
2. Token costs are lower per stage — focused prompts generate focused outputs
3. If one stage produces low-confidence output, you can retry that stage only
4. Schemas per stage enforce contracts between pipeline stages

**Model selection:** Use `claude-sonnet-4-5` as the default. Reserve `claude-opus-4` for the final narrative/synthesis stage if quality requires it. Do not use Opus for extraction/scoring stages — the quality difference does not justify the token cost differential.

**Confidence:** HIGH (Context7 verified from anthropics/anthropic-sdk-typescript docs, current SDK)

### Infrastructure

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vercel | — | Next.js hosting, dashboard API routes | Already established; optimal for Next.js App Router |
| AWS Lambda | Node.js 22.x | Playwright crawl execution | Only serverless environment where Playwright + sparticuz/chromium works reliably |
| Amazon S3 (optional) | — | Lambda Layer storage for Chromium binary | Standard pattern: store the Layer zip in S3, publish Lambda Layer from it |

**Job queue consideration:** Crawl jobs take 15–45 seconds. Vercel function timeout is 10 seconds on the Hobby plan, 60 seconds on Pro. If targeting Hobby plan, you must either: (a) upgrade to Pro, (b) use a background job pattern where the Next.js API route enqueues the job and polls for results, or (c) use streaming responses via Vercel's streaming support. Recommended approach for MVP: accept 60s Pro timeout with a polling pattern — Next.js route triggers Lambda crawl, polls for completion, returns result.

**Confidence:** MEDIUM for job queue recommendation (based on Vercel timeout documentation from training knowledge, not Context7-verified for current limits).

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @prisma/adapter-neon | 6.x | Neon serverless driver adapter for Prisma | Required when using Neon with Prisma in serverless (Vercel, Lambda) |
| @neondatabase/serverless | 0.10.x | Neon's WebSocket-based serverless driver | Pulled in by adapter-neon; may need direct use for Lambda edge cases |
| @vercel/functions | latest | `attachDatabasePool` for connection management | Required when using Prisma with pg Pool on Vercel Fluid compute |
| zod | 4.x | Schema validation for AI pipeline contracts | Shared schemas between API and AI pipeline stages; also used for input validation |
| v8-to-istanbul | 9.x | Convert Playwright V8 JS coverage to Istanbul format | Used to interpret `page.coverage.stopJSCoverage()` output into meaningful coverage data |

---

## What NOT to Use and Why

| Rejected Option | Category | Why Rejected |
|-----------------|----------|--------------|
| `playwright` (full package) | Crawler | Bundles Chromium (~170MB) + Firefox + WebKit — cannot deploy to any serverless environment; use `playwright-core` instead |
| Puppeteer | Crawler | Lacks `page.coverage` CSS/JS API; less ergonomic network interception; lower maintenance velocity in 2025; same binary size problem |
| Simple `fetch` + `cheerio` | Crawler | Cannot execute JavaScript — fails on React, Next.js, Vue SPAs; captures server-rendered HTML only; misses hydrated DOM, dynamic content, client-side network requests |
| Playwright on Vercel (any approach) | Deployment | 50MB function size limit + no Lambda Layer equivalent; `@sparticuz/chromium` unzipped is ~180MB; this combination is not resolvable on Vercel |
| Edge Runtime for crawler | Deployment | Edge Runtime forbids `child_process`, binary execution, and native Node.js APIs — Playwright requires all three |
| Single-shot LLM prompt | AI Pipeline | Unstructured prompt returning all signals at once is expensive, unreliable to parse, hard to debug, and cannot be individually optimized; structured multi-stage pipeline is the right architecture |
| GPT-4 / OpenAI | AI Pipeline | Mandated as Claude in PROJECT.md; Claude's narrative quality for UX explanations is the stated competitive advantage |
| Prisma without adapter on Neon | Database | Direct TCP connections from serverless exhaust Neon's connection limit; `@prisma/adapter-neon` with the `-pooler` hostname is mandatory for any serverless deployment |
| Prisma Accelerate | Database | Adds Prisma's paid connection proxy in front of Neon — double-wrapping the pooler; unnecessary complexity and cost when Neon's native PgBouncer pooler already solves the problem |
| Raw SQL | Database | Already established convention in CLAUDE.md: Prisma for all DB access |

---

## Installation Reference

### Next.js app (Vercel)

```bash
# AI pipeline
sfw npm install @anthropic-ai/sdk zod

# Database
sfw npm install @prisma/adapter-neon @neondatabase/serverless @vercel/functions

# Dev
sfw npm install --save-dev prisma
```

### Lambda crawl function (separate deployment package)

```bash
# Crawler
sfw npm install playwright-core @sparticuz/chromium

# Do NOT install playwright (full) — it bundles browsers
# Do NOT include @sparticuz/chromium in the Lambda zip — use a Lambda Layer
```

**Lambda Layer strategy:** `@sparticuz/chromium` publishes pre-built Layer zips to their GitHub releases. Download the Layer zip for your target Chromium version and publish it as a Lambda Layer separately from your function code. Your function code only references the Layer ARN — this keeps the function zip well under 50MB.

---

## Version Pins (as of 2026-05-18)

| Package | Confirmed Version | Source |
|---------|------------------|--------|
| playwright-core | 1.58.x | Context7: `/microsoft/playwright` versions v1.51.0, v1.58.2 |
| @anthropic-ai/sdk | 0.40+ | Context7: `/anthropics/anthropic-sdk-typescript` (current SDK features confirmed) |
| prisma | 6.x / 7.x | Context7: `/prisma/prisma` versions 6.19.2, 7.4.2–7.6.0 |
| zod | 4.x | Context7: `/colinhacks/zod` versions v3.24.2, v4.0.1 (use v4) |
| @sparticuz/chromium | 133.x | Context7: `/sparticuz/chromium` (supports Playwright integration) |

**Note on Zod versions:** The Anthropic SDK examples use `zod/v4` import path (`import { z } from "zod/v4"`). Ensure Zod 4.x is installed. Zod 3.x and 4.x coexist in the same package with version-gated imports; the Anthropic SDK helpers are built against v4.

---

## Sources

- Context7 `/microsoft/playwright`: Coverage API docs, network timing API, request interception — HIGH confidence
- Context7 `/sparticuz/chromium`: Lambda Layer deployment patterns, Playwright integration — HIGH confidence
- Context7 `/anthropics/anthropic-sdk-typescript`: `messages.parse`, `zodOutputFormat`, `toolRunner` — HIGH confidence
- Context7 `/prisma/web`: Neon adapter, serverless connection pooling, Vercel Fluid compute pattern — HIGH confidence
- Context7 `/puppeteer/puppeteer`: Lambda constraints, `sparticuz/chromium` recommendation — HIGH confidence
- Context7 `/colinhacks/zod`: Version availability — HIGH confidence
- Project constraints: `.planning/PROJECT.md` — authoritative for stack mandates
