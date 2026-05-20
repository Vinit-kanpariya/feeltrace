---
phase: 1
slug: data-foundation-and-security-baseline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-20
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.7 |
| **Config file** | `vitest.config.mts` (❌ W0 — install: `sfw pnpm add -D vitest @vitejs/plugin-react vite-tsconfig-paths`) |
| **Quick run command** | `pnpm test --run src/lib/ssrf.test.ts` |
| **Full suite command** | `pnpm test --run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test --run src/lib/ssrf.test.ts`
- **After every plan wave:** Run `pnpm test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| SSRF-unit | Skeleton | 0 | INFRA-01 | SSRF bypass | Blocks RFC-1918, loopback, link-local, non-http schemes; passes valid public URLs | unit | `pnpm test --run src/lib/ssrf.test.ts` | ❌ W0 | ⬜ pending |
| SSRF-scheme | Skeleton | 0 | INFRA-01 | SSRF bypass | Blocks file://, ftp://, gopher:// schemes | unit | `pnpm test --run src/lib/ssrf.test.ts` | ❌ W0 | ⬜ pending |
| SSRF-encoded | Skeleton | 0 | INFRA-01 | Encoded IP bypass | DNS resolution normalizes encoded IPs (decimal, octal, hex) | unit | `pnpm test --run src/lib/ssrf.test.ts` | ❌ W0 | ⬜ pending |
| ANALYZE-202 | Skeleton | 0 | CRAWL-01 | — | POST /api/analyze returns 202 + jobId for valid URL | unit | `pnpm test --run src/app/api/analyze/route.test.ts` | ❌ W0 | ⬜ pending |
| ANALYZE-422 | Skeleton | 0 | CRAWL-01, INFRA-01 | SSRF bypass | POST /api/analyze returns 422 for SSRF URL | unit | `pnpm test --run src/app/api/analyze/route.test.ts` | ❌ W0 | ⬜ pending |
| RATE-LIMIT | Security | 1 | INFRA-02 | Mass abuse | Rate limiter returns 429 with Retry-After header after limit exceeded | integration (manual) | Manual — requires live Upstash Redis | N/A | ⬜ pending |
| DB-PERSIST | Schema | 0 | INFRA-03 | — | Job record created without raw signal payload; Result/Issue/CausalEdge tables exist | integration (manual) | `pnpm db:studio` — inspect Job table | N/A | ⬜ pending |
| STATUS-POLL | UI | 1 | INFRA-04 | — | GET /api/jobs/[jobId] returns correct status at each transition | manual | Manual — submit job, observe status badge transitions | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.mts` — Vitest configuration for Next.js App Router (`plugins: [tsconfigPaths(), react()]`, `environment: 'jsdom'`)
- [ ] `src/lib/ssrf.test.ts` — SSRF validator unit tests covering all D-16 cases: valid public URL, RFC-1918 ranges, localhost, link-local (169.254.x.x), non-http schemes, encoded variants, IPv6 loopback
- [ ] `src/app/api/analyze/route.test.ts` — API route unit tests for POST /api/analyze (mocks Prisma + QStash + dns modules)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Rate limiter returns 429 with correct Retry-After | INFRA-02 | Requires live Upstash Redis connection; cannot mock the distributed rate limit state | Submit >5 requests/IP within 1 hour; verify 429 + `Retry-After` header; check plain text message format |
| Job record persists without raw signal payload | INFRA-03 | Requires live Neon PostgreSQL connection | Open `pnpm db:studio`; create a job via POST /api/analyze; verify Job row exists with status `pending`; verify no raw signal columns |
| Job status polling displays correct transitions | INFRA-04 | Requires UI interaction + live DB | Submit a URL; observe status badge cycling through transitions; manually update job status in DB to verify badge updates |
| QStash delivery to Railway stub | CRAWL-01 | Requires live QStash + Railway stub endpoint | Submit a valid URL; verify QStash delivers to Railway stub; stub returns 200; job stays `pending` (no Phase 2 processing) |
| 503 when queue depth ≥ 50 pending jobs | INFRA-02, D-09 | Requires seeding DB with 50+ pending jobs | Seed 50 pending jobs via Prisma Studio; submit new URL; verify 503 response with correct message |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
