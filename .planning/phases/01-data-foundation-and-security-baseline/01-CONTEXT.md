# Phase 1: Data Foundation & Security Baseline - Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers the complete async job lifecycle and security baseline. By the end of this phase:

- A user can paste a URL and receive a job ID; the UI shows live progress (queued → crawling → extracting → analyzing → complete)
- SSRF targets (private IPs, localhost, cloud metadata endpoints) are blocked at URL submission time, with DNS resolution validation
- IP-based rate limiting enforces 5/hour and 20/day, with a global queue depth cap
- Completed analysis results are readable from the database; no raw signals stored
- A minimal URL input form with inline error states demonstrates the full flow end-to-end (with JSON dump when complete)

Phase 1 does NOT include: actual crawling (Phase 2), AI pipeline (Phase 3), or the results dashboard UI (Phase 4).

</domain>

<decisions>
## Implementation Decisions

### Queue Backend
- **D-01:** Use **Upstash QStash** as the job queue, NOT Vercel Queues. Vercel Queues requires Pro plan; project is on the free tier. QStash free tier supports 500 message deliveries/day.
- **D-02:** QStash uses a **push (callback) model** — QStash delivers jobs to the Railway crawler via HTTP POST, not a poll pattern. This means the Railway service must expose a public HTTP endpoint to receive job callbacks.
- **D-03:** Secure the Railway crawler endpoint with **QStash signing secret verification** (`QSTASH_CURRENT_SIGNING_KEY` + `QSTASH_NEXT_SIGNING_KEY`). Use the `@upstash/qstash` SDK's `verifySignatureEdge` / `Receiver` pattern. This works on the free tier and provides replay protection.
- **D-04:** On the Railway side, **accept QStash callbacks immediately (return 200)** and add jobs to an internal sequential queue. Process one job at a time to avoid Playwright resource contention. This prevents QStash retries caused by slow processing.
- **D-05:** QStash delivery **retries are enabled** (default QStash retry behavior). The Railway crawler checks job status before starting — if the job is already `in_progress` or `complete`, discard the duplicate delivery idempotently.

### Rate Limiting
- **D-06:** Rate limit: **5 submissions/IP/hour, 20/day**. Implement as Vercel Edge Middleware (runs before the API route, minimal latency). Store counters in Upstash Redis.
- **D-07:** Use a **separate Upstash Redis database** (same Upstash account as QStash, different database). Keeps rate limit counters isolated from queue state. Both are on the free tier.
- **D-08:** 429 response: standard **`Retry-After` header** (seconds until reset) + human-readable plain text message: `"Too many requests. Try again in {X} minutes."`. No JSON envelope needed for Phase 1.
- **D-09:** Add a **global queue depth cap of 50 pending jobs**. When `SELECT COUNT(*) FROM jobs WHERE status = 'pending' OR status = 'crawling'` exceeds 50, return `503 Service Unavailable` with message `"Service busy. Please try again shortly."`. This is a DB count, not a Redis counter — source of truth is the DB.

### Phase 1 UI
- **D-10:** Build **functional-only UI** — bare Tailwind, no design polish. Phase 4 owns the full design system. Phase 1 UI exists to prove the job lifecycle works.
- **D-11:** UI components for Phase 1: (1) URL input form, (2) submit button, (3) live job status badge that polls every 2 seconds, (4) when status is `complete`, show raw JSON from `GET /api/results/[jobId]` in a `<pre>` block.
- **D-12:** Show **inline error messages** in the form for: invalid URL format, private/blocked IP address, rate limit exceeded (with retry-after time), and service unavailable (queue full). These map directly to the API error responses.

### SSRF Validation
- **D-13:** **Two-layer SSRF protection**: Layer 1 (Phase 1) — DNS resolution at URL submission time, blocking RFC-1918 ranges (10.x, 172.16–31.x, 192.168.x), loopback (127.x, ::1), link-local (169.254.x.x / APIPA, which covers AWS/GCP metadata endpoint at 169.254.169.254), and all non-routable addresses. Layer 2 (Phase 2) — Playwright network interception blocking requests to RFC-1918 destinations at the browser level (DNS rebinding protection).
- **D-14:** URL scheme: **allow only `http://` and `https://`** at submission time. Block `file://`, `ftp://`, `gopher://`, and any other scheme. **No port restrictions** — developers legitimately use non-standard ports, and the IP check already blocks loopback/private ranges.
- **D-15:** The SSRF validator is a **shared utility module** at `src/lib/ssrf.ts`, used by `POST /api/analyze`. It must **resolve the hostname via DNS** and check all returned IPs — not just the URL string. This prevents bypass via `0.0.0.0`, `0177.0.0.1`, decimal IP encoding, and similar variants.
- **D-16:** Write **unit tests** for the SSRF validator (`src/lib/ssrf.test.ts` or equivalent). Test cases must include: valid public URL passes, private IP blocked (RFC-1918), localhost blocked, link-local (169.254.x.x) blocked, non-http scheme blocked, encoded IP variants blocked.

### Database Schema
- **D-17:** Use the schema defined in `.planning/research/ARCHITECTURE.md` as the starting point: `Job`, `Result`, `Issue`, `CausalEdge` tables. `CausalEdge.mechanism` is non-nullable (schema-level enforcement, not just application logic).
- **D-18:** Job status enum values: `pending`, `crawling`, `extracting`, `analyzing`, `complete`, `failed`. The `failed` state stores an `error_message` string field on the Job record.
- **D-19:** Jobs do **not** have a TTL in Phase 1 — records persist indefinitely. TTL/cleanup is a post-MVP concern.

### Claude's Discretion
- Job ID format: CUID or UUID — researcher/planner decides based on Prisma conventions.
- Neon connection: use pooler URL (PgBouncer, port 6543) for API routes and DIRECT_URL (port 5432) for migrations, per research recommendations. Planner handles the exact Prisma client setup.
- QStash publish error handling: if QStash publish fails after job creation, the job should be marked `failed` — planner decides whether to retry or surface immediately.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, out-of-scope items, and key architectural decisions
- `.planning/REQUIREMENTS.md` — Full v1 requirement list with traceability. Phase 1 covers: INFRA-01, INFRA-02, INFRA-03, INFRA-04, CRAWL-01
- `.planning/ROADMAP.md` — Phase 1 success criteria (5 criteria) and dependencies
- `.planning/STATE.md` — Accumulated architectural decisions and active todos

### Architecture & Stack
- `.planning/research/ARCHITECTURE.md` — DB schema (Job/Result/Issue/CausalEdge), data flow diagrams, component communication summary, API route design, anti-patterns to avoid
- `.planning/research/SUMMARY.md` — Executive summary, recommended stack, pitfall list, build order rationale

### Technical Decisions (from research)
- `.planning/research/STACK.md` — Package versions, Neon connection pooling pattern, Prisma adapter setup
- `.planning/research/PITFALLS.md` — Top 5 pitfalls ranked by severity; Pitfall 5 (no rate limiting) and SSRF risk are directly relevant to Phase 1

### Project Config
- `CLAUDE.md` — Project conventions (App Router, Prisma only, `sfw` prefix for package installs, snake_case event names, experience score is a 0.0–10.0 float)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — codebase is empty. Phase 1 is greenfield.

### Established Patterns
- Next.js App Router (`src/app/`) — all routes use the App Router pattern per CLAUDE.md. No Pages Router.
- Server Components by default; `"use client"` only when polling or form interactivity requires it (the status polling component will need `"use client"`).
- Prisma for all DB access — no raw SQL except in migrations.
- `sfw` prefix required on all package install commands (per CLAUDE.md security policy).

### Integration Points
- `POST /api/analyze` is the Phase 1→2 handoff point — Phase 2 reads from the queue that Phase 1 publishes to.
- `GET /api/jobs/[jobId]` is the client→server polling contract — Phase 4 UI will use this same endpoint.
- Neon PostgreSQL schema is the Phase 1→3 data contract — schema must be final before Phase 2 or 3 can write to it.

</code_context>

<specifics>
## Specific Ideas

- QStash free tier limit is 500 deliveries/day — at 5/IP/hour rate limit and expected MVP traffic, this is well within bounds. No need to optimize delivery count.
- The global queue depth cap (50 pending jobs) should query the DB (`Job` table), not a Redis counter. DB is the source of truth for job state.
- The Railway service is an Express (or Hono) HTTP server — lightweight, not a background worker polling a queue. It receives callbacks from QStash.

</specifics>

<deferred>
## Deferred Ideas

- Playwright-level network interception (DNS rebinding protection) — captured in D-13 as Layer 2; belongs in Phase 2 when the crawler is built.
- Visual design / branding of the URL input form — Phase 4 owns the full UI design. Phase 1 UI is intentionally unstyled beyond functional Tailwind basics.
- Job TTL and cleanup — post-MVP concern, not needed for Phase 1 or MVP launch.
- QStash webhook failure alerting (e.g., Slack notification when delivery fails after retries) — post-MVP observability.
- API versioning and breaking change policy — deferred until there are external consumers.

</deferred>

---

*Phase: 01-data-foundation-and-security-baseline*
*Context gathered: 2026-05-20*
