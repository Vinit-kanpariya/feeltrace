# Phase 1: Data Foundation & Security Baseline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-20
**Phase:** 01-data-foundation-and-security-baseline
**Areas discussed:** Queue backend, Rate limiting thresholds, Phase 1 UI scope, SSRF validation depth

---

## Queue Backend

| Option | Description | Selected |
|--------|-------------|----------|
| Vercel Queues (Pro plan) | Native Vercel SDK, no extra service | |
| Upstash QStash (free/hobby) | Same poll pattern, works on any plan | ✓ |
| I'll check / not sure | Treat as pre-flight check with QStash fallback | |

**User's choice:** Upstash QStash — project is staying on the Vercel free plan.
**Notes:** This changes the architecture from poll-mode consumer to push (callback) model. Railway needs an HTTP server to receive QStash deliveries.

---

| Option | Description | Selected |
|--------|-------------|----------|
| QStash signing secret | Signs every delivery; replay protection | ✓ |
| Shared bearer token | CRAWLER_SECRET env var; simpler, no replay protection | |
| You decide | Planner picks | |

**User's choice:** "You can decide by your own but need to make sure that we are going with the free plan."
**Claude decided:** QStash signing secret — works on free tier, standard QStash pattern.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Allow QStash retries (idempotent) | Crawler checks job status before starting | |
| No retries — fail fast | QStash retry count = 0; user re-submits | |
| You decide | Planner picks | ✓ |

**Claude decided:** Retries allowed with idempotency check.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Queue internally, process sequentially | Accept callback immediately (200), internal queue | ✓ |
| Reject if busy (return 429) | Simpler but risks retry storms | |
| You decide | Planner picks concurrency model | |

**User's choice:** Queue internally, process sequentially.

---

## Rate Limiting Thresholds

| Option | Description | Selected |
|--------|-------------|----------|
| 5/hour, 20/day | Balanced for MVP validation tool | ✓ |
| 10/hour, 50/day | More permissive, higher abuse surface | |
| 3/hour, 10/day | Stricter, lower cost exposure | |
| You decide | Planner sets configurable defaults | |

**User's choice:** 5/hour, 20/day.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Retry-After header + plain message | Standard HTTP 429 with seconds until reset | ✓ |
| JSON error with reset timestamp | { error, reset_at } for API clients | |
| You decide | Planner picks format | |

**User's choice:** Retry-After header + plain message.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Same Upstash account, separate Redis database | One account, two databases | ✓ |
| Same Upstash Redis database | One database with prefixed keys | |
| Different Redis provider | Another service entirely | |

**User's choice:** Same Upstash account, separate Redis database.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — add a queue depth cap | 503 when pending jobs exceed cap | ✓ |
| No — per-IP limits are enough | Skip global cap for MVP | |
| You decide | Planner determines necessity | |

**User's choice:** Yes — add queue depth cap. Decided on 50 pending jobs.

---

## Phase 1 UI Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Functional only — bare minimum | Plain form + status badge, no design polish | ✓ |
| Polished enough to share | Branded, shareable before Phase 4 | |

**User's choice:** Functional only.

---

| Option | Description | Selected |
|--------|-------------|----------|
| JSON dump in the browser | Raw result JSON in a `<pre>` block | ✓ |
| 'Analysis complete' with a placeholder | Cleaner but can't verify AI output | |
| Redirect to a bare results page | Minimal results page | |

**User's choice:** JSON dump in the browser.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — show inline error messages | Invalid URL, blocked IP, rate limited shown in form | ✓ |
| No — API errors only for now | Non-200 responses are enough for Phase 1 | |

**User's choice:** Yes — inline error messages.

---

## SSRF Validation Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Two layers: DNS check + Playwright interception | Phase 1 DNS + Phase 2 browser-level | ✓ |
| DNS resolution check only | Phase 1 only; full DNS rebinding deferred | |
| You decide | Planner picks layered approach | |

**User's choice:** Two layers — DNS resolution at submit time (Phase 1) + Playwright network interception (Phase 2).

---

| Option | Description | Selected |
|--------|-------------|----------|
| HTTP/HTTPS only, no port restrictions | Block non-http schemes; allow any port | ✓ |
| HTTP/HTTPS only + block non-standard ports | Also block ports outside 80/443/8080/8443 | |
| You decide | Planner picks based on SSRF best practices | |

**User's choice:** HTTP/HTTPS only, no port restrictions.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — unit tests for SSRF validator | Pure logic, easy to test, verification is clean | ✓ |
| No — manual testing is enough | Skip tests for Phase 1 | |

**User's choice:** Yes — unit tests.

---

## Claude's Discretion

- **Job ID format:** CUID or UUID — planner decides based on Prisma conventions.
- **QStash retry count:** Enabled (default) with idempotency check on Railway side.
- **SSRF port restrictions:** HTTP/HTTPS only, no port restrictions (decided per user preference).
- **QStash publish failure handling:** If QStash publish fails after job creation, job should be marked `failed` — planner determines retry vs immediate failure.
- **Neon connection setup:** Pooler URL for API routes, DIRECT_URL for migrations — planner follows research recommendations.

## Deferred Ideas

- Playwright network interception (DNS rebinding protection) — Phase 2 when crawler is built.
- Visual design / branding — Phase 4.
- Job TTL / cleanup — post-MVP.
- QStash webhook failure alerting — post-MVP observability.
- API versioning — deferred until external consumers exist.
