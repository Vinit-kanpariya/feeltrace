# Phase 1: Data Foundation & Security Baseline - Research

**Researched:** 2026-05-20
**Domain:** Async job lifecycle, SSRF protection, IP rate limiting, Prisma/Neon schema, QStash message queue, Next.js App Router
**Confidence:** HIGH (stack packages verified on npm registry; patterns confirmed via official docs and Upstash docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Queue Backend**
- D-01: Use Upstash QStash as the job queue, NOT Vercel Queues. Vercel Queues requires Pro plan; project is on the free tier. QStash free tier supports 500 message deliveries/day.
- D-02: QStash uses a push (callback) model — QStash delivers jobs to the Railway crawler via HTTP POST, not a poll pattern. The Railway service must expose a public HTTP endpoint to receive job callbacks.
- D-03: Secure the Railway crawler endpoint with QStash signing secret verification (`QSTASH_CURRENT_SIGNING_KEY` + `QSTASH_NEXT_SIGNING_KEY`). Use the `@upstash/qstash` SDK's `verifySignatureAppRouter` / `Receiver` pattern.
- D-04: On the Railway side, accept QStash callbacks immediately (return 200) and add jobs to an internal sequential queue. Process one job at a time to avoid Playwright resource contention.
- D-05: QStash delivery retries are enabled (default). The Railway crawler checks job status before starting — if already `in_progress` or `complete`, discard the duplicate idempotently.

**Rate Limiting**
- D-06: Rate limit: 5 submissions/IP/hour, 20/day. Implement as Vercel Edge Middleware (runs before the API route). Store counters in Upstash Redis.
- D-07: Use a separate Upstash Redis database (same Upstash account as QStash, different database). Keeps rate limit counters isolated.
- D-08: 429 response: standard `Retry-After` header (seconds until reset) + human-readable plain text: `"Too many requests. Try again in {X} minutes."` No JSON envelope needed for Phase 1.
- D-09: Add a global queue depth cap of 50 pending jobs. When `SELECT COUNT(*) FROM jobs WHERE status = 'pending' OR status = 'crawling'` exceeds 50, return 503. This is a DB count, not a Redis counter.

**Phase 1 UI**
- D-10: Build functional-only UI — bare Tailwind, no design polish. Phase 4 owns the full design system.
- D-11: UI components: (1) URL input form, (2) submit button, (3) live job status badge polling every 2 seconds, (4) when complete, show raw JSON from `GET /api/results/[jobId]` in a `<pre>` block.
- D-12: Inline error messages for: invalid URL format, private/blocked IP address, rate limit exceeded (with retry-after time), and service unavailable (queue full).

**SSRF Validation**
- D-13: Two-layer SSRF protection. Layer 1 (Phase 1): DNS resolution at submission time, blocking RFC-1918 ranges (10.x, 172.16–31.x, 192.168.x), loopback (127.x, ::1), link-local (169.254.x.x). Layer 2 (Phase 2): Playwright network interception.
- D-14: URL scheme: allow only `http://` and `https://`. No port restrictions.
- D-15: SSRF validator is a shared utility at `src/lib/ssrf.ts`. Must resolve hostname via DNS and check all returned IPs.
- D-16: Unit tests for SSRF validator in `src/lib/ssrf.test.ts`. Test cases: valid public URL passes, RFC-1918 blocked, localhost blocked, link-local (169.254.x.x) blocked, non-http scheme blocked, encoded IP variants blocked.

**Database Schema**
- D-17: Use Job/Result/Issue/CausalEdge tables from ARCHITECTURE.md. `CausalEdge.mechanism` non-nullable.
- D-18: Job status enum: `pending`, `crawling`, `extracting`, `analyzing`, `complete`, `failed`. Failed state stores `error_message`.
- D-19: No TTL in Phase 1 — records persist indefinitely.

**Claude's Discretion**
- Job ID format: CUID or UUID — researcher/planner decides based on Prisma conventions.
- Neon connection: pooler URL (PgBouncer, port 6543) for API routes and DIRECT_URL (port 5432) for migrations.
- QStash publish error handling: if QStash publish fails after job creation, mark job `failed` — planner decides whether to retry or surface immediately.

### Deferred Ideas (OUT OF SCOPE)
- Playwright-level network interception (DNS rebinding protection) — Phase 2
- Visual design / branding of the URL input form — Phase 4
- Job TTL and cleanup — post-MVP
- QStash webhook failure alerting — post-MVP
- API versioning and breaking change policy — deferred
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | URL submission endpoint validates and blocks SSRF targets — private IP ranges (RFC-1918), localhost, link-local addresses, and cloud metadata endpoints (169.254.x.x) | SSRF validator pattern using `dns.promises.lookup` with `{ all: true }` + IP range checks; see Code Examples section |
| INFRA-02 | URL submission is rate-limited per IP to prevent abuse and uncontrolled Claude API spend | `@upstash/ratelimit` slidingWindow + `@upstash/redis` in Vercel Edge Middleware; two limiters (hourly + daily) evaluated per request |
| INFRA-03 | Final analysis results (scored issues, narrative, causality edges) are persisted to PostgreSQL; raw signal payloads are ephemeral and not stored | Schema design with Job/Result/Issue/CausalEdge tables; no raw signal columns; Prisma 7 + Neon pooler pattern |
| INFRA-04 | Frontend polls a job-status endpoint during analysis so the user sees meaningful progress state | `GET /api/jobs/[jobId]` returns `{ status, error_message? }`; client-side polling with `setInterval` at 2s intervals in a `"use client"` component |
| CRAWL-01 | User can submit a URL and receive an analysis result within 60 seconds via async job queue | `POST /api/analyze` → SSRF check → create Job (pending) → QStash publish → return `{ jobId }`; QStash delivers to Railway; job lifecycle tracked via status transitions |
</phase_requirements>

---

## Summary

Phase 1 establishes the complete async job lifecycle and security baseline for FeelTrace. The codebase is greenfield — there is no existing `src/` directory, no `package.json`, no Prisma schema, and no migrations. Everything is built from scratch.

The primary technical challenge is wiring three external services together correctly before any crawling happens: Neon PostgreSQL (job persistence), Upstash QStash (job queue delivery), and Upstash Redis (rate limit counters). All three are serverless/HTTP-native services that work without persistent TCP connections — well matched to Vercel's function model. The key constraint is that Phase 1 creates the infrastructure placeholders that Phase 2 will fill: the Railway crawler endpoint that receives QStash callbacks is not built in Phase 1, but the QStash publish call from `POST /api/analyze` must be able to target it.

The walking skeleton deliverable is: user submits URL → `POST /api/analyze` creates a DB job and publishes to QStash → client polls `GET /api/jobs/[jobId]` → sees status transitions. Phase 1 cannot complete the full pipeline (crawling is Phase 2), but the job record can be manually advanced to test each status transition, and unit tests for the SSRF validator exercise all security cases independently.

**Primary recommendation:** Build in vertical slices — schema first, then the ingest route (no queue yet), then polling UI, then add QStash publish, then add rate limiting middleware. Each slice is a complete working increment.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| URL submission + SSRF validation | API / Backend | — | Server-side only; client cannot be trusted to enforce security |
| Job creation and status management | API / Backend | Database | API route writes to DB; DB is source of truth |
| QStash message publishing | API / Backend | — | Happens inside API route post-validation; external service call |
| IP rate limiting | Frontend Server (Edge Middleware) | — | Must run before API route; Vercel Edge Middleware is the correct layer |
| Queue depth cap (50 jobs) | API / Backend | Database | DB count query inside API route, not middleware — requires Prisma |
| Job status polling | API / Backend | — | `GET /api/jobs/[jobId]` is a thin DB read route |
| Results fetching | API / Backend | — | `GET /api/results/[jobId]` serializes Job+Result from DB |
| URL input form + submit | Browser / Client | Frontend Server | Form interaction requires `"use client"`; initial render is server |
| Job status badge (polling) | Browser / Client | — | Polling with `setInterval` requires `"use client"` |
| Database schema + migrations | Database / Storage | — | Prisma schema + Neon; DIRECT_URL for migrate commands |
| QStash callback receiver | API / Backend (Railway) | — | Phase 2 concern — stub endpoint only in Phase 1 |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.x | App Router framework, API routes, middleware | Project mandate (CLAUDE.md) |
| typescript | 5.x | Type safety | Project mandate |
| tailwindcss | 4.x | Styling | Project mandate |
| prisma | 7.8.0 | ORM + migration tool | Project mandate; Context7-verified |
| @prisma/client | 7.8.0 | Generated DB client | Required companion to prisma |
| @prisma/adapter-neon | 7.8.0 | Neon serverless driver adapter | Required for Prisma + Neon on serverless Vercel |
| @neondatabase/serverless | 1.1.0 | Neon HTTP/WebSocket driver (pulled in by adapter) | Required by adapter-neon |

[VERIFIED: npm registry] — all versions confirmed via `npm view` on 2026-05-20. Prisma 7.8.0 is the current latest.

### Job Queue + Rate Limiting

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @upstash/qstash | 2.11.0 | QStash TypeScript SDK — publish messages, verify callbacks | D-01 through D-05; official SDK from Upstash |
| @upstash/ratelimit | 2.0.8 | Sliding window rate limiting with Redis | D-06; designed for Vercel Edge + Upstash Redis |
| @upstash/redis | 1.38.0 | HTTP-based Redis client for Upstash | Required by @upstash/ratelimit; edge-compatible |

[VERIFIED: npm registry + official Upstash docs] — packages confirmed via `npm view`, GitHub repos confirmed, creation dates 2021–2022. Verified as official Upstash packages at upstash.com/docs.

### Testing

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vitest | 4.1.7 | Test runner | Project mandate (CLAUDE.md: `npm test` runs vitest) |
| @vitejs/plugin-react | — | React support in Vitest | Required for component tests |
| vite-tsconfig-paths | — | TypeScript path aliases in Vitest | Required for `@/` path imports |

[VERIFIED: npm registry] — vitest 4.1.7 confirmed. React plugin and tsconfig-paths are standard vitest ecosystem packages.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 4.4.3 | Runtime schema validation | Validate incoming JSON body on `POST /api/analyze`; input sanitization before SSRF check |

[VERIFIED: npm registry] — zod 4.4.3 confirmed.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @upstash/qstash | Vercel Queues | Vercel Queues requires Pro plan; QStash free tier is sufficient for MVP |
| @upstash/ratelimit | Custom Redis counter | ratelimit handles sliding window math, race conditions, and TTL correctly; hand-rolling is a pitfall |
| Prisma 7 | Prisma 6 | Prisma 7 changes `output` path and `prisma.config.ts` pattern; use 7 since it's current; adapter-neon matches version |
| `dns.promises.lookup` (all: true) | External SSRF library | `dns.promises.lookup` is Node.js built-in; no dependency needed; see SSRF pattern below |

**Installation:**

```bash
# Next.js app — run from project root
sfw npm install @prisma/adapter-neon @neondatabase/serverless @upstash/qstash @upstash/ratelimit @upstash/redis zod
sfw npm install --save-dev prisma vitest @vitejs/plugin-react vite-tsconfig-paths @testing-library/react @testing-library/dom
```

> CLAUDE.md requires `sfw` prefix on all package install commands.

---

## Package Legitimacy Audit

> slopcheck was run but returned false positives: it checked PyPI instead of npm. These are npm packages; slopcheck's SLOP verdicts are ecosystem confusion false positives. Registry verification performed directly via `npm view` and official Upstash documentation.

| Package | Registry | Age | Source Repo | npm registry check | Disposition |
|---------|----------|-----|-------------|-------------------|-------------|
| @upstash/qstash | npm | 4 yrs (2022-06-14) | github.com/upstash/qstash-js | npm view: 2.11.0 | Approved |
| @upstash/ratelimit | npm | 4 yrs (2022-05-06) | github.com/upstash/ratelimit-js | npm view: 2.0.8 | Approved |
| @upstash/redis | npm | 5 yrs (2021-10-22) | github.com/upstash/redis-js | npm view: 1.38.0 | Approved |
| @prisma/adapter-neon | npm | ~2 yrs | github.com/prisma/prisma | npm view: 7.8.0 | Approved |
| @neondatabase/serverless | npm | ~2 yrs | github.com/neondatabase/serverless | npm view: 1.1.0 | Approved |
| prisma | npm | 7+ yrs | github.com/prisma/prisma | npm view: 7.8.0 | Approved |
| zod | npm | 5+ yrs | github.com/colinhacks/zod | npm view: 4.4.3 | Approved |
| vitest | npm | 4+ yrs | github.com/vitest-dev/vitest | npm view: 4.1.7 | Approved |

**No postinstall scripts found** for any Upstash package (checked via `npm view <pkg> scripts.postinstall`).

**Packages removed due to slopcheck [SLOP] verdict:** none — slopcheck SLOP verdicts were false positives (PyPI ecosystem confusion on npm packages).

**Packages flagged as suspicious [SUS]:** none.

---

## Architecture Patterns

### System Architecture Diagram

```
Browser (client)
  |
  |  POST /api/analyze { url }
  v
[Vercel Edge Middleware] ← checks Upstash Redis rate limit counters
  | 429 if exceeded
  v
[Next.js API Route: POST /api/analyze]
  | 1. zod validate body
  | 2. SSRF check (dns.promises.lookup → IP range check)
  | 3. DB count check (pending/crawling jobs ≤ 50)
  | 4. prisma.job.create({ status: 'pending' })
  | 5. qstash.publishJSON({ url: RAILWAY_CALLBACK_URL, body: { jobId, url } })
  | 6. if publish fails → prisma.job.update({ status: 'failed', error_message })
  | return { jobId }
  v
[Neon PostgreSQL]
  ^    ^
  |    |
  |    +-- GET /api/jobs/[jobId] → { status, error_message? }
  |    |         ^
  |    |         | polls every 2s
  |    |    [Browser "use client" StatusBadge]
  |    |
  |    +-- GET /api/results/[jobId] → { ... }
  |              ^
  |              | on status === 'complete'
  |         [Browser <pre> JSON dump]
  |
[Upstash QStash]
  | HTTP POST callback (Phase 2 — stub endpoint only in Phase 1)
  v
[Railway crawler — Phase 2]
  → updates job status via POST /api/jobs/[jobId]/status
```

**Data flow notes:**
- Edge Middleware intercepts ALL requests to `/api/analyze` before they reach the route handler
- Rate limit identifiers: `{ip}:hourly` and `{ip}:daily` — two separate `ratelimit.limit()` calls
- QStash publish in Phase 1 targets a stub URL or the actual Railway URL (even if Phase 2 isn't built yet — QStash will retry and eventually exhaust retries; job stays `pending`)
- The crawler status callback (`POST /api/jobs/[jobId]/status`) is a Phase 2 route; Phase 1 creates the job and publishes, but status only advances beyond `pending` when Phase 2 processes the callback

### Recommended Project Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── page.tsx              # URL input form + status polling UI (main page)
│   └── api/
│       ├── analyze/
│       │   └── route.ts          # POST /api/analyze
│       ├── jobs/
│       │   └── [jobId]/
│       │       └── route.ts      # GET /api/jobs/[jobId]
│       └── results/
│           └── [jobId]/
│               └── route.ts      # GET /api/results/[jobId]
├── components/
│   ├── AnalyzeForm.tsx           # "use client" — URL input + submit
│   └── JobStatusBadge.tsx        # "use client" — polls GET /api/jobs/[jobId]
├── lib/
│   ├── prisma.ts                 # Prisma singleton (PrismaNeon adapter)
│   ├── qstash.ts                 # QStash client singleton
│   ├── redis.ts                  # Upstash Redis client singleton
│   └── ssrf.ts                   # SSRF validator utility
├── types/
│   └── job.ts                    # JobStatus enum, Job type, shared API response types
middleware.ts                     # Vercel Edge Middleware — rate limiting
prisma/
├── schema.prisma                 # Job/Result/Issue/CausalEdge tables
└── migrations/                   # Never edit committed migrations
prisma.config.ts                  # Prisma 7 datasource config (DIRECT_URL)
vitest.config.mts                 # Vitest config
```

### Pattern 1: Prisma 7 + Neon Serverless — Singleton Client

**What:** Prisma 7 uses a `prisma.config.ts` for the datasource connection, and a singleton in `src/lib/prisma.ts` prevents multiple client instances during Next.js hot reloads.

**When to use:** All DB access across all API routes imports from `src/lib/prisma.ts`.

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  // No url here in Prisma 7 — configured in prisma.config.ts
}
```

```typescript
// prisma.config.ts  (project root)
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL'),  // direct connection for migrations
  },
})
```

```typescript
// src/lib/prisma.ts
// Source: neon.com/docs/guides/prisma + prisma.io/docs/guides/frameworks/nextjs
import { PrismaClient } from '../generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,  // pooler URL (port 6543)
  })
  return new PrismaClient({ adapter })
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

```env
# .env.local  (never commit)
DATABASE_URL="postgresql://user:pass@host-pooler.region.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@host.region.aws.neon.tech/dbname?sslmode=require"
```

[VERIFIED: neon.com/docs/guides/prisma + prisma.io/docs/guides/frameworks/nextjs]

**Critical:** `DATABASE_URL` hostname has `-pooler` suffix (port 6543, PgBouncer). `DIRECT_URL` does not (port 5432). `DIRECT_URL` is used in `prisma.config.ts` for migrations; `DATABASE_URL` is used in runtime adapter for all API route queries.

---

### Pattern 2: Prisma Schema — Job Lifecycle Tables

**What:** The four tables that form Phase 1's data contract. Schema must be finalized here because Phases 2, 3, and 4 all write to/read from it.

```prisma
// prisma/schema.prisma
// Source: .planning/research/ARCHITECTURE.md (D-17, D-18)

enum JobStatus {
  pending
  crawling
  extracting
  analyzing
  complete
  failed
}

model Job {
  id            String    @id @default(cuid())
  url           String
  status        JobStatus @default(pending)
  error_message String?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  result        Result?

  @@index([status])
  @@index([created_at])
}

model Result {
  id         String   @id @default(cuid())
  jobId      String   @unique
  job        Job      @relation(fields: [jobId], references: [id])
  narrative  Json
  issues     Issue[]
  edges      CausalEdge[]
  created_at DateTime @default(now())
}

model Issue {
  id                    String       @id @default(cuid())
  resultId              String
  result                Result       @relation(fields: [resultId], references: [id])
  category              String
  signal_source         String
  severity              Int
  raw_evidence          String
  technical_description String
  causedBy              CausalEdge[] @relation("ToIssue")
  causes                CausalEdge[] @relation("FromIssue")
}

model CausalEdge {
  id          String  @id @default(cuid())
  resultId    String
  result      Result  @relation(fields: [resultId], references: [id])
  fromIssueId String
  fromIssue   Issue   @relation("FromIssue", fields: [fromIssueId], references: [id])
  toIssueId   String
  toIssue     Issue   @relation("ToIssue", fields: [toIssueId], references: [id])
  relationship String
  confidence   String
  mechanism    String  // NON-NULLABLE — schema-level enforcement (D-17)
  explanation  String
}
```

**Job ID format:** CUID (`@default(cuid())`). Prisma's built-in `cuid()` generates collision-resistant IDs that are URL-safe and sortable by creation time — preferable to UUID for this use case. No external library needed.

---

### Pattern 3: SSRF Validator

**What:** Pure utility function resolving the hostname via DNS and checking all returned IPs against blocked ranges.

**When to use:** Called inside `POST /api/analyze` before any DB write or QStash publish.

```typescript
// src/lib/ssrf.ts
// Source: nodejs.org/api/dns.html + OWASP SSRF Prevention Cheat Sheet

import dns from 'node:dns'

const BLOCKED_RANGES: Array<(parts: number[]) => boolean> = [
  // Loopback: 127.0.0.0/8
  (p) => p[0] === 127,
  // RFC-1918: 10.0.0.0/8
  (p) => p[0] === 10,
  // RFC-1918: 172.16.0.0/12
  (p) => p[0] === 172 && p[1] >= 16 && p[1] <= 31,
  // RFC-1918: 192.168.0.0/16
  (p) => p[0] === 192 && p[1] === 168,
  // Link-local / APIPA / cloud metadata: 169.254.0.0/16
  (p) => p[0] === 169 && p[1] === 254,
  // Unspecified: 0.0.0.0
  (p) => p[0] === 0,
]

export class SsrfError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'BLOCKED_SCHEME'
      | 'INVALID_URL'
      | 'DNS_RESOLUTION_FAILED'
      | 'BLOCKED_IP',
  ) {
    super(message)
    this.name = 'SsrfError'
  }
}

export async function validateUrl(rawUrl: string): Promise<void> {
  // 1. Parse URL and enforce scheme
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new SsrfError('Invalid URL format', 'INVALID_URL')
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new SsrfError(
      `Scheme "${parsed.protocol}" is not allowed`,
      'BLOCKED_SCHEME',
    )
  }

  const hostname = parsed.hostname

  // 2. Resolve hostname to all IP addresses (catches 0.0.0.0, decimal encoding, etc.)
  let addresses: dns.LookupAddress[]
  try {
    // { all: true } returns every resolved address — critical for multi-A-record hosts
    addresses = await dns.promises.lookup(hostname, { all: true })
  } catch {
    throw new SsrfError(
      `Could not resolve hostname "${hostname}"`,
      'DNS_RESOLUTION_FAILED',
    )
  }

  for (const { address, family } of addresses) {
    if (family === 4) {
      const parts = address.split('.').map(Number)
      if (BLOCKED_RANGES.some((check) => check(parts))) {
        throw new SsrfError(
          `Hostname "${hostname}" resolves to a blocked IP address`,
          'BLOCKED_IP',
        )
      }
    }

    if (family === 6) {
      // Block IPv6 loopback (::1) and link-local (fe80::/10)
      if (address === '::1' || address.toLowerCase().startsWith('fe80:')) {
        throw new SsrfError(
          `Hostname "${hostname}" resolves to a blocked IPv6 address`,
          'BLOCKED_IP',
        )
      }
    }
  }
}
```

**Key implementation notes:**
- `dns.promises.lookup` with `{ all: true }` — returns every A/AAAA record; prevents bypass by a host that resolves to multiple addresses where one is private
- Use `{ all: true }` NOT `dns.promises.resolve4` — `lookup` respects system resolver (including `/etc/hosts`) while `resolve4` uses the DNS protocol directly; for SSRF purposes both are acceptable but `lookup` catches hosts defined in `/etc/hosts`
- IPv4-mapped IPv6 addresses (e.g., `::ffff:127.0.0.1`) are not handled by the code above — consider checking `family === 6` addresses via `ipaddr.js` for production hardening (Phase 1 MVP scope may accept this limitation)

[CITED: nodejs.org/api/dns.html + OWASP SSRF Prevention Cheat Sheet]

---

### Pattern 4: QStash — Publish from API Route

**What:** Publishing a job to QStash from `POST /api/analyze`. QStash delivers it via HTTP POST to the Railway crawler callback URL.

```typescript
// src/lib/qstash.ts
import { Client } from '@upstash/qstash'

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
})
```

```typescript
// Inside POST /api/analyze route handler (simplified)
// Source: upstash.com/docs/qstash/quickstarts/vercel-nextjs

import { qstash } from '@/lib/qstash'

const message = await qstash.publishJSON({
  url: process.env.RAILWAY_CRAWLER_URL!,  // e.g. https://crawler.railway.app/api/crawl
  body: { jobId: job.id, url: validatedUrl },
  retries: 3,
})
```

**Required environment variables:**
- `QSTASH_TOKEN` — from Upstash Console → QStash tab
- `QSTASH_CURRENT_SIGNING_KEY` — for callback verification (Phase 2 crawler)
- `QSTASH_NEXT_SIGNING_KEY` — for key rotation support
- `RAILWAY_CRAWLER_URL` — the Railway service endpoint that receives QStash callbacks

**Note on Phase 1 scope:** In Phase 1, the Railway crawler is not built. The `RAILWAY_CRAWLER_URL` can be a placeholder or the actual URL if Railway is set up as a stub server. QStash will retry delivery up to the configured retry count; the job stays in `pending` until Phase 2's crawler processes it.

**QStash delivery model:** QStash sends an HTTP POST to the target URL with the body and a cryptographic signature in the `Upstash-Signature` header. The callback receiver uses `verifySignatureAppRouter` to validate the signature before processing.

[VERIFIED: upstash.com/docs/qstash/quickstarts/vercel-nextjs]

---

### Pattern 5: Vercel Edge Middleware — IP Rate Limiting

**What:** Two sliding window limiters (hourly and daily) checked in sequence in `middleware.ts`. Returns 429 with `Retry-After` header if either limit is exceeded.

```typescript
// middleware.ts  (project root — runs as Vercel Edge Middleware)
// Source: upstash.com/blog/edge-rate-limiting + github.com/upstash/ratelimit-js

import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Two limiters: 5/hour and 20/day per IP (D-06)
const hourlyLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'rl:hourly',
})

const dailyLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 d'),
  prefix: 'rl:daily',
})

export async function middleware(
  request: NextRequest,
  _event: NextFetchEvent,
): Promise<Response | undefined> {
  const ip = request.ip ?? '127.0.0.1'

  // Check hourly limit first (stricter)
  const hourly = await hourlyLimiter.limit(ip)
  if (!hourly.success) {
    const retryAfter = Math.ceil((hourly.reset - Date.now()) / 1000)
    const minutes = Math.ceil(retryAfter / 60)
    return new Response(`Too many requests. Try again in ${minutes} minutes.`, {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'Content-Type': 'text/plain',
      },
    })
  }

  // Check daily limit
  const daily = await dailyLimiter.limit(ip)
  if (!daily.success) {
    const retryAfter = Math.ceil((daily.reset - Date.now()) / 1000)
    const hours = Math.ceil(retryAfter / 3600)
    return new Response(
      `Too many requests. Daily limit reached. Try again in ${hours} hours.`,
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'Content-Type': 'text/plain',
        },
      },
    )
  }

  return NextResponse.next()
}

// Only apply rate limiting to the analyze endpoint (D-06)
export const config = {
  matcher: '/api/analyze',
}
```

**Required environment variables:**
- `UPSTASH_REDIS_REST_URL` — from Upstash Console → Redis database
- `UPSTASH_REDIS_REST_TOKEN` — from Upstash Console → Redis database

**Important:** `request.ip` is available in Vercel Edge Middleware via the `NextRequest` object. It is set by Vercel's infrastructure from the client IP. In local development it may be `undefined` or `127.0.0.1`.

[VERIFIED: upstash.com/blog/edge-rate-limiting + github.com/upstash/ratelimit-js README]

---

### Pattern 6: POST /api/analyze — Full Route Handler

**What:** The core ingest route — validates, checks security, creates job, publishes to queue.

```typescript
// src/app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { prisma } from '@/lib/prisma'
import { qstash } from '@/lib/qstash'
import { validateUrl, SsrfError } from '@/lib/ssrf'

const BodySchema = z.object({
  url: z.string().min(1),
})

export async function POST(request: NextRequest) {
  // 1. Parse and validate body
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // 2. SSRF validation (D-13, D-14, D-15)
  try {
    await validateUrl(body.url)
  } catch (err) {
    if (err instanceof SsrfError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 422 },
      )
    }
    throw err
  }

  // 3. Global queue depth cap (D-09)
  const pendingCount = await prisma.job.count({
    where: { status: { in: ['pending', 'crawling'] } },
  })
  if (pendingCount >= 50) {
    return new Response('Service busy. Please try again shortly.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  // 4. Create job record
  const job = await prisma.job.create({
    data: { url: body.url, status: 'pending' },
  })

  // 5. Publish to QStash (D-01, D-02)
  try {
    await qstash.publishJSON({
      url: process.env.RAILWAY_CRAWLER_URL!,
      body: { jobId: job.id, url: body.url },
      retries: 3,
    })
  } catch {
    // If publish fails, mark job failed (Claude's Discretion)
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: 'failed',
        error_message: 'Failed to enqueue analysis job. Please try again.',
      },
    })
    return NextResponse.json({ error: 'Failed to start analysis' }, { status: 503 })
  }

  return NextResponse.json({ jobId: job.id }, { status: 202 })
}
```

---

### Pattern 7: Client-Side Polling Component

**What:** A `"use client"` React component that polls the job status endpoint and drives UI state transitions.

```typescript
// src/components/JobStatusBadge.tsx
'use client'

import { useEffect, useState } from 'react'

type JobStatus =
  | 'pending'
  | 'crawling'
  | 'extracting'
  | 'analyzing'
  | 'complete'
  | 'failed'

interface JobStatusResponse {
  status: JobStatus
  error_message?: string
}

export function JobStatusBadge({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<JobStatus>('pending')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<unknown>(null)

  useEffect(() => {
    if (status === 'complete' || status === 'failed') return

    const interval = setInterval(async () => {
      const res = await fetch(`/api/jobs/${jobId}`)
      if (!res.ok) return
      const data: JobStatusResponse = await res.json()
      setStatus(data.status)
      if (data.error_message) setError(data.error_message)

      if (data.status === 'complete') {
        const resultsRes = await fetch(`/api/results/${jobId}`)
        if (resultsRes.ok) setResult(await resultsRes.json())
        clearInterval(interval)
      }
      if (data.status === 'failed') clearInterval(interval)
    }, 2000)  // D-11: poll every 2 seconds

    return () => clearInterval(interval)
  }, [jobId, status])

  return (
    <div>
      <span>Status: {status}</span>
      {error && <p className="text-red-600">{error}</p>}
      {result && (
        <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  )
}
```

---

### Anti-Patterns to Avoid

- **Importing `playwright` or `playwright-core` anywhere in `src/app/api/`**: Vercel's 250 MB bundle limit is a hard blocker. Phase 1 establishes the boundary; Phase 2 puts the crawler on Railway.
- **Raw SQL for the queue depth cap**: The `prisma.job.count` call with a `where` filter is the correct Prisma approach. Never write `SELECT COUNT(*)` directly (CLAUDE.md convention).
- **Storing `QSTASH_TOKEN` on the client**: All Upstash credentials are server-side only. `NEXT_PUBLIC_` prefix must never be used for any Upstash variable.
- **Single rate limiter checking both limits**: Two separate `Ratelimit` instances are needed — one for hourly (prefix `rl:hourly`) and one for daily (prefix `rl:daily`). Sharing a limiter with one config is not equivalent to two independent limits.
- **Using `dns.promises.resolve4` alone**: `resolve4` bypasses `/etc/hosts` entries. Using `dns.promises.lookup` with `{ all: true }` is the correct approach for SSRF prevention as it also catches system-level host overrides.
- **Not checking all returned IPs**: If a hostname resolves to multiple IPs (round-robin, CDN), every resolved IP must be checked. Checking only the first returned address leaves a bypass vector.
- **Polling endpoint hitting DB on every request with no index**: The `jobs` table needs an index on `id` (the PK) which Prisma creates automatically. The `status` index added to the schema above speeds the queue depth `COUNT` query.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rate limit sliding window math | Custom Redis INCRBY + TTL | `@upstash/ratelimit` slidingWindow | Sliding window across 2 time buckets has edge cases at bucket boundaries; ratelimit handles this correctly |
| QStash signature verification | Manual HMAC-SHA256 comparison | `verifySignatureAppRouter` from `@upstash/qstash/nextjs` | Key rotation (current + next signing key) and replay protection (timestamp check) are non-trivial; SDK handles both |
| DNS resolution + IP classification | `net.isIPv4` + regex | `dns.promises.lookup` + integer range math | String-based IP checks fail on encoded variants (octal, hex, decimal); integer range comparison is immune |
| Prisma connection pooling for serverless | Custom pg pool logic | `PrismaNeon` adapter + `DATABASE_URL` pooler hostname | Neon's PgBouncer pooler handles connection multiplexing; the adapter is the correct integration layer |
| CUID generation | Custom random string | Prisma `@default(cuid())` | Prisma's built-in CUID is monotonically sortable, URL-safe, and collision-resistant; no dependency needed |

**Key insight:** Rate limiting and signature verification each have subtle correctness requirements at scale. Using the official SDKs means correctness is maintained by the service provider as their protocol evolves.

---

## Common Pitfalls

### Pitfall 1: Prisma 7 Changed the Import Path

**What goes wrong:** Code imports `@prisma/client` directly (`import { PrismaClient } from '@prisma/client'`) instead of from the generated output path.

**Why it happens:** Prisma 6 and earlier used `@prisma/client` as the import. Prisma 7 changed the default output to the project's `src/` directory and the import must match.

**How to avoid:** In `schema.prisma`, set `output = "../src/generated/prisma"`. Import from `../generated/prisma` (relative) or configure `@/generated/prisma` as a path alias.

**Warning signs:** TypeScript error `Cannot find module '@prisma/client'` after generating the client.

---

### Pitfall 2: DATABASE_URL Without `-pooler` Suffix Exhausts Neon Connections

**What goes wrong:** Using the direct connection URL (no `-pooler` in hostname) for API routes causes each serverless function invocation to open a new Postgres connection. Under any real request load, Neon's free tier connection limit (typically 10 on free tier) is exhausted, causing `P1017: Server has closed the connection` errors.

**Why it happens:** Developers copy the Neon connection string from the console and use it everywhere, not realizing there are two connection types.

**How to avoid:** `DATABASE_URL` must use the pooler hostname (`-pooler` suffix, port 6543). `DIRECT_URL` (port 5432, no pooler) is only used in `prisma.config.ts` for migrations. The `PrismaNeon` adapter is initialized with `DATABASE_URL`.

**Warning signs:** `P1017` errors in production but not in dev; error rate increases with concurrent requests.

[VERIFIED: neon.com/docs/guides/prisma]

---

### Pitfall 3: `request.ip` Is `undefined` in Local Development

**What goes wrong:** The Edge Middleware crashes or misidentifies IPs locally because `request.ip` is undefined.

**Why it happens:** Vercel injects the client IP into `request.ip` in production. In local dev (`next dev`), the middleware runs but `request.ip` is typically `undefined` or `::1`.

**How to avoid:** Use `const ip = request.ip ?? '127.0.0.1'` as a safe fallback. Rate limiting against `127.0.0.1` locally is acceptable — it hits the same Redis key each time, which is fine for development testing.

**Warning signs:** `undefined` as the Redis key; all local requests rate-limited together or null-pointer errors.

---

### Pitfall 4: QStash Retries Can Re-Deliver After Job Completes

**What goes wrong:** QStash retries a message delivery after a transient failure. If the Railway crawler has already processed the job, the retry triggers a second crawl of the same job.

**Why it happens:** At-least-once delivery semantics are the fundamental QStash guarantee. Retries are not suppressed after a successful first delivery.

**How to avoid:** The crawler must implement idempotency (D-05): check `job.status` before starting work. If status is already `in_progress`, `complete`, or `failed`, return 200 and discard the message. This check must be atomic (use a DB transaction or an atomic status update with a precondition).

**Warning signs:** Same job appears twice in results; status transitions that go backward (e.g., `complete` → `crawling`).

---

### Pitfall 5: SSRF Bypass via Non-Routable IP Encodings

**What goes wrong:** The SSRF validator checks the URL string for obvious private IPs but misses encoded variants: `http://0177.0.0.1/` (octal), `http://2130706433/` (decimal), `http://0x7f000001/` (hex). Node.js's `URL` parser normalizes some of these, but `dns.promises.lookup` resolves others that bypass string matching.

**Why it happens:** SSRF validation implemented as string pattern matching (`if url.includes('127.')`) rather than DNS resolution + integer range check.

**How to avoid:** The validator in Pattern 3 above uses `dns.promises.lookup` which resolves the hostname through the OS resolver — it returns normalized IP addresses that bypass encoding tricks. Decimal IPs like `2130706433` may be parsed by the OS resolver as `127.0.0.1`.

**Warning signs:** Submitting `http://2130706433/` succeeds where `http://127.0.0.1/` is blocked.

---

### Pitfall 6: Missing `"use client"` on Polling Component Causes Server Error

**What goes wrong:** The `JobStatusBadge` component uses `useEffect` and `useState` but is accidentally rendered as a Server Component, causing a React runtime error about hooks.

**Why it happens:** Next.js App Router defaults to Server Components. Any component using React hooks must be explicitly marked.

**How to avoid:** Always add `'use client'` as the first line of any component that uses `useState`, `useEffect`, or any browser API. Keep the server component (the page) minimal and delegate interactivity to small `"use client"` leaf components.

**Warning signs:** `Error: useState can only be called in a Client Component.`

---

### Pitfall 7: Walking Skeleton Test Coverage Gap

**What goes wrong:** Phase 1 ships without a test for the SSRF validator. The validator is the highest-risk security logic in the phase. If it has a logic error, there is no automated catch.

**Why it happens:** Security utilities are often tested manually but not in automated suites.

**How to avoid:** D-16 mandates unit tests in `src/lib/ssrf.test.ts`. Vitest tests for the SSRF validator do not require a real network — use `vi.mock('node:dns', ...)` to mock `dns.promises.lookup` return values for each test case.

**Warning signs:** `ssrf.test.ts` does not exist; the SSRF validator has no automated test coverage.

---

## Code Examples

### SSRF Unit Test Pattern

```typescript
// src/lib/ssrf.test.ts
import { describe, it, expect, vi } from 'vitest'
import { validateUrl, SsrfError } from './ssrf'

// Mock dns module — no real network calls in unit tests
vi.mock('node:dns', () => ({
  promises: {
    lookup: vi.fn(),
  },
}))

import dns from 'node:dns'

const mockLookup = vi.mocked(dns.promises.lookup as any)

describe('validateUrl', () => {
  it('allows a valid public URL', async () => {
    mockLookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }])
    await expect(validateUrl('https://example.com')).resolves.toBeUndefined()
  })

  it('blocks RFC-1918 private IP (10.x.x.x)', async () => {
    mockLookup.mockResolvedValue([{ address: '10.0.0.1', family: 4 }])
    await expect(validateUrl('https://internal.example.com')).rejects.toMatchObject({
      code: 'BLOCKED_IP',
    })
  })

  it('blocks RFC-1918 private IP (172.16.x.x)', async () => {
    mockLookup.mockResolvedValue([{ address: '172.16.0.1', family: 4 }])
    await expect(validateUrl('https://internal.example.com')).rejects.toMatchObject({
      code: 'BLOCKED_IP',
    })
  })

  it('blocks RFC-1918 private IP (192.168.x.x)', async () => {
    mockLookup.mockResolvedValue([{ address: '192.168.1.1', family: 4 }])
    await expect(validateUrl('https://internal.example.com')).rejects.toMatchObject({
      code: 'BLOCKED_IP',
    })
  })

  it('blocks localhost (127.0.0.1)', async () => {
    mockLookup.mockResolvedValue([{ address: '127.0.0.1', family: 4 }])
    await expect(validateUrl('http://localhost')).rejects.toMatchObject({
      code: 'BLOCKED_IP',
    })
  })

  it('blocks link-local / cloud metadata (169.254.x.x)', async () => {
    mockLookup.mockResolvedValue([{ address: '169.254.169.254', family: 4 }])
    await expect(validateUrl('http://metadata.example.com')).rejects.toMatchObject({
      code: 'BLOCKED_IP',
    })
  })

  it('blocks non-http schemes (file://)', async () => {
    await expect(validateUrl('file:///etc/passwd')).rejects.toMatchObject({
      code: 'BLOCKED_SCHEME',
    })
  })

  it('blocks non-http schemes (ftp://)', async () => {
    await expect(validateUrl('ftp://example.com/file')).rejects.toMatchObject({
      code: 'BLOCKED_SCHEME',
    })
  })

  it('blocks IPv6 loopback (::1)', async () => {
    mockLookup.mockResolvedValue([{ address: '::1', family: 6 }])
    await expect(validateUrl('http://example.com')).rejects.toMatchObject({
      code: 'BLOCKED_IP',
    })
  })
})
```

### Vitest Configuration

```typescript
// vitest.config.mts  (project root)
// Source: nextjs.org/docs/app/guides/testing/vitest
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
  },
})
```

### GET /api/jobs/[jobId] — Status Polling Route

```typescript
// src/app/api/jobs/[jobId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { status: true, error_message: true },
  })

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json({
    status: job.status,
    ...(job.error_message ? { error_message: job.error_message } : {}),
  })
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vercel Queues (poll model) | Upstash QStash (push/callback model) | Phase 1 decision (D-01) | Vercel Queues unavailable on free tier; QStash is the standard free-tier substitute |
| Prisma 6 `@prisma/client` import | Prisma 7 `../generated/prisma` import | Prisma 7 release | Import path changed; `prisma.config.ts` replaces `url` in `schema.prisma` datasource |
| `dns.promises.resolve4` for SSRF | `dns.promises.lookup` with `{ all: true }` | Node.js v20+ documentation | `lookup` catches system-level overrides; `{ all: true }` ensures all A records are checked |
| `@prisma/adapter-neon` with `neonConfig.webSocketConstructor` | `PrismaNeon({ connectionString })` directly | Prisma 7 adapter update | New constructor API is simpler; `neonConfig` is no longer required for basic setup |

**Deprecated/outdated:**
- `pgbouncer=true` query param in `DATABASE_URL`: Earlier Prisma versions required this explicitly. Current Prisma 7 + adapter-neon does not require the query param; the `-pooler` hostname suffix is sufficient.
- Vercel Queues in this project: Moved to QStash per D-01.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `request.ip` is available in Vercel Edge Middleware for IP rate limiting | Pattern 5 | If unavailable in some edge regions, all rate limit IDs fall back to `127.0.0.1` and the limit applies globally instead of per-IP. Fallback: use `X-Forwarded-For` header as secondary source |
| A2 | QStash free tier allows targeting the Railway URL directly (no allowlist required) | Pattern 4 | If QStash requires URL allowlisting on free tier, Railway URL must be added to Upstash console before first publish |
| A3 | Neon free tier connection limit is sufficient for Phase 1 MVP traffic via pooler | Pitfall 2 | If Neon free tier connection limit is lower than expected, the PgBouncer pooler multiplexes connections and should be sufficient |
| A4 | `@prisma/adapter-neon` v7.8.0 uses the `PrismaNeon({ connectionString })` constructor (not the older `NeonConfig` approach) | Pattern 1 | If the API changed between v6 and v7.8.0, the adapter setup code needs to follow Prisma 7-era documentation |

---

## Open Questions

1. **RAILWAY_CRAWLER_URL placeholder for Phase 1**
   - What we know: QStash needs a valid HTTPS destination URL to publish to. Phase 2 builds the Railway crawler.
   - What's unclear: Should Phase 1 plan include creating a Railway stub service, or should the planner leave `RAILWAY_CRAWLER_URL` unset with a graceful no-op?
   - Recommendation: Create a minimal Railway stub that accepts POST requests and returns 200, so QStash delivery succeeds and doesn't exhaust retries. This unblocks Phase 1 end-to-end smoke testing.

2. **IPv4-mapped IPv6 addresses in SSRF validator**
   - What we know: An IPv4 address can be expressed as an IPv6 address (e.g., `::ffff:127.0.0.1`). The current validator checks `family === 6` addresses for `::1` and `fe80:` prefix but not IPv4-mapped addresses.
   - What's unclear: Whether `dns.promises.lookup` ever returns IPv4-mapped IPv6 addresses in practice on Node.js v22.
   - Recommendation: For MVP, accept this limitation and document it. Add `ipaddr.js` for full IPv6 normalization in a follow-up security hardening task.

3. **Vercel free tier — Edge Middleware Redis latency**
   - What we know: Edge Middleware adds latency to every matched request. Upstash Redis REST API adds ~10–30ms per call (HTTP round-trip).
   - What's unclear: Two `ratelimit.limit()` calls per request adds ~20–60ms of latency before the API route runs.
   - Recommendation: Acceptable for MVP. If latency becomes a concern, combine both checks into a single Redis pipeline call (Upstash ratelimit supports `analytics` mode which may batch).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js, Prisma CLI, Vitest | Yes | v22.19.0 | — |
| npm | Package installation | Yes | 11.11.0 | — |
| npm | `npm run dev`, `npm test` (CLAUDE.md) | Yes | 11.11.0 | — |
| Neon PostgreSQL | DB schema, API routes | Not provisioned | — | Create project at neon.com (free tier) |
| Upstash QStash | Job queue | Not provisioned | — | Create at console.upstash.com → QStash tab (free tier: 500 deliveries/day) |
| Upstash Redis | Rate limiting | Not provisioned | — | Create at console.upstash.com → Redis tab (separate database, free tier) |
| Railway | Crawler callback target (stub) | Not provisioned | — | Create project at railway.app; deploy minimal Express stub |

**Missing dependencies with no fallback:**
- None (npm is already available).

**Missing dependencies with fallback:**
- Neon, Upstash QStash, Upstash Redis, Railway: All are external services that must be provisioned. Free tier accounts are sufficient for MVP. No fallback — they are required for any functionality.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.7 |
| Config file | `vitest.config.mts` (Wave 0 — does not exist yet) |
| Quick run command | `npm run test:run` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | SSRF validator blocks RFC-1918, loopback, link-local, non-http schemes | unit | `npm run test:run src/lib/ssrf.test.ts` | Wave 0 |
| INFRA-01 | SSRF validator passes valid public URLs | unit | `npm run test:run src/lib/ssrf.test.ts` | Wave 0 |
| INFRA-02 | Rate limiter returns 429 after limit exceeded | integration (manual) | Manual — requires live Upstash Redis connection | N/A |
| INFRA-03 | Job record persisted without raw signal payload | integration (manual) | Manual — DB inspection via `npm run db:studio` | N/A |
| INFRA-04 | Polling endpoint returns correct status per transition | manual | Manual — submit job, observe status badge transitions | N/A |
| CRAWL-01 | POST /api/analyze returns 202 + jobId for valid URL | unit | `npm run test:run src/app/api/analyze/route.test.ts` | Wave 0 |
| CRAWL-01 | POST /api/analyze returns 422 for SSRF URL | unit | `npm run test:run src/app/api/analyze/route.test.ts` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run test:run src/lib/ssrf.test.ts`
- **Per wave merge:** `npm run test:run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.mts` — Vitest configuration file; install: `sfw npm install --save-dev vitest @vitejs/plugin-react vite-tsconfig-paths`
- [ ] `src/lib/ssrf.test.ts` — SSRF validator unit tests (covers INFRA-01 all cases per D-16)
- [ ] `src/app/api/analyze/route.test.ts` — API route unit tests for POST /api/analyze (mocks Prisma + QStash + dns)

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in MVP |
| V3 Session Management | No | No sessions in MVP |
| V4 Access Control | No | No user-level authorization in Phase 1 |
| V5 Input Validation | Yes | zod schema on request body; URL validation via `URL` parser |
| V6 Cryptography | Partial | QStash signature verification via HMAC-SHA256 (`verifySignatureAppRouter` handles this) |
| V7 Error Handling | Yes | Never expose internal stack traces; all errors return structured messages |
| V10 Malicious Code | Yes (SSRF) | DNS resolution + IP range check prevents SSRF; server-side only |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SSRF via URL submission | Tampering / Information Disclosure | `dns.promises.lookup` + RFC-1918 range check in `src/lib/ssrf.ts` |
| Abuse via mass job submission | Denial of Service | IP rate limit (Upstash ratelimit) + queue depth cap (DB count) |
| QStash callback spoofing | Spoofing | `verifySignatureAppRouter` with QSTASH_CURRENT_SIGNING_KEY |
| Encoded IP bypass (octal/hex/decimal) | Tampering | DNS resolution normalizes addresses; integer range check is encoding-immune |
| Rate limit evasion via IP spoofing | Elevation of Privilege | `request.ip` from Vercel infrastructure is injection-resistant (set by Vercel edge, not from headers) |
| Sensitive data in error responses | Information Disclosure | Return only `{ error: string, code: string }` — no stack traces, no internal paths |

---

## Project Constraints (from CLAUDE.md)

| Directive | Constraint |
|-----------|-----------|
| App Router only | All pages under `src/app/`; no `pages/` directory |
| Server Components by default | Add `"use client"` only for interactive/polling components |
| Prisma for all DB access | Never raw SQL in API routes or application code |
| `sfw` prefix on all package installs | `sfw npm install ...` — never bare `npm install` |
| Experience score is float 0.0–10.0 | Not applicable to Phase 1 tables (score lives in `Result.narrative` JSON) |
| snake_case event names in tracker | Not applicable to Phase 1 (tracker is separate build in `tracker/`) |
| NEVER modify `tracker/dist/` | Not in scope for Phase 1 |
| NEVER edit committed migrations | Create new migrations only; never edit `prisma/migrations/` |
| NEVER commit `.env.local` | All Upstash tokens and Neon credentials stay in `.env.local` |

---

## Sources

### Primary (HIGH confidence)

- [neon.com/docs/guides/prisma](https://neon.com/docs/guides/prisma) — Prisma 7 + Neon configuration, pooler URL pattern, adapter-neon setup
- [nextjs.org/docs/app/guides/testing/vitest](https://nextjs.org/docs/app/guides/testing/vitest) — Vitest setup for Next.js App Router (version 16.2.6, last updated 2026-05-19)
- [upstash.com/docs/qstash/quickstarts/vercel-nextjs](https://upstash.com/docs/qstash/quickstarts/vercel-nextjs) — `verifySignatureAppRouter` pattern, environment variables
- [nodejs.org/api/dns.html](https://nodejs.org/api/dns.html) — `dns.promises.lookup` with `{ all: true }`, lookup vs resolve semantics
- npm registry (`npm view`) — package versions verified 2026-05-20: @upstash/qstash@2.11.0, @upstash/ratelimit@2.0.8, @upstash/redis@1.38.0, prisma@7.8.0, @prisma/adapter-neon@7.8.0, vitest@4.1.7, zod@4.4.3

### Secondary (MEDIUM confidence)

- [upstash.com/blog/edge-rate-limiting](https://upstash.com/blog/edge-rate-limiting) — Edge Middleware rate limiting pattern with `request.ip`
- [prisma.io/docs/guides/frameworks/nextjs](https://www.prisma.io/docs/guides/frameworks/nextjs) — Prisma singleton pattern for Next.js hot reload
- github.com/upstash/ratelimit-js README — slidingWindow algorithm, Redis.fromEnv() pattern, prefix configuration

### Tertiary (LOW confidence)

- WebSearch results on multiple limiters and Retry-After header patterns — consistent across multiple community sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all package versions verified via `npm view`; official docs confirmed package names
- Architecture: HIGH — derived directly from locked decisions (D-01 through D-19) with no new architectural decisions required
- SSRF patterns: HIGH — Node.js official DNS docs + OWASP SSRF guidance; integer range check is standard approach
- QStash/rate limiting patterns: HIGH — confirmed via official Upstash docs and blog posts
- Prisma 7 specifics: MEDIUM — Neon docs confirmed adapter-neon v7 constructor; import path change confirmed via search; some Prisma 7 details from search rather than direct Context7

**Research date:** 2026-05-20
**Valid until:** 2026-06-20 (30 days — all services are stable/versioned; Prisma 7 API is unlikely to change)
