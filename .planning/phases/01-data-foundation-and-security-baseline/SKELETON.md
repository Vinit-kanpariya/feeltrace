# Walking Skeleton — FeelTrace

**Phase:** 1
**Generated:** 2026-05-20

## Capability Proven End-to-End

A user pastes a URL into the input form, a job is created in the PostgreSQL database, and the status badge shows "pending" — demonstrating the full Next.js → API route → Neon DB → client polling stack in a single user action.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 App Router (TypeScript) | Project mandate (CLAUDE.md); App Router enables Server Components by default with selective `"use client"` for interactive leaves |
| Data layer | Neon PostgreSQL + Prisma 7 (PrismaNeon adapter) | Project mandate; Prisma 7 uses generated output at `src/generated/prisma` and `prisma.config.ts` for datasource; Neon pooler URL (port 6543) for API routes, DIRECT_URL (port 5432) for migrations only |
| Auth | None in MVP | Validated decision: shareable-link model proves core AI quality fastest; auth deferred to post-validation |
| Job queue | Upstash QStash (push/callback model) | D-01: Vercel Queues requires Pro plan; project is on free tier; QStash free tier supports 500 deliveries/day |
| Rate limiting | Vercel Edge Middleware + Upstash Redis | D-06: runs before API route at edge, minimal latency; two separate Ratelimit instances (hourly + daily) per D-06 |
| Crawler runtime | Railway (Phase 2) — stub endpoint only in Phase 1 | Architecture mandate: Vercel 250 MB bundle limit blocks Chromium; Railway Docker container is the only viable path |
| Deployment target | Vercel (Next.js) + Railway (crawler stub) | Vercel for all Next.js; Railway for the QStash callback receiver |
| Directory layout | `src/app/` (App Router), `src/components/`, `src/lib/`, `src/types/`, `src/generated/` (Prisma output) | Per CLAUDE.md architecture diagram; `tracker/` is a separate build not touched in Phase 1 |
| SSRF protection | Layer 1: `dns.promises.lookup` + RFC-1918 integer range check in `src/lib/ssrf.ts`; Layer 2: Playwright network interception (Phase 2) | D-13, D-15: DNS resolution is encoding-immune; integer range math prevents octal/hex/decimal bypass variants |
| Job ID format | CUID via Prisma `@default(cuid())` | Monotonically sortable, URL-safe, collision-resistant; no external dependency needed |

## Stack Touched in Phase 1

- [x] Project scaffold (Next.js 15, TypeScript, Tailwind 4, npm, Vitest 4.1.7, ESLint)
- [x] Routing — `src/app/(dashboard)/page.tsx` (main URL input page), `src/app/api/analyze/route.ts`, `src/app/api/jobs/[jobId]/route.ts`, `src/app/api/results/[jobId]/route.ts`
- [x] Database — Prisma schema pushed to Neon; `POST /api/analyze` writes a Job record; `GET /api/jobs/[jobId]` reads it
- [x] UI — `AnalyzeForm` (submit URL) + `JobStatusBadge` (polls `/api/jobs/[jobId]`) wired into the main page
- [x] Deployment — local full-stack: `npm run dev` starts Next.js on :3000; `npm run test:run` runs SSRF unit tests; `npm run db:push` applies schema to Neon

## Out of Scope (Deferred to Later Slices)

- Actual Playwright crawling — Phase 2 (Railway Docker container)
- Signal extraction (DOM, CSS, JS, network) — Phase 2
- AI pipeline (scoring, reasoning, narration) — Phase 3
- Full results dashboard UI (narrative, issue list, causality graph) — Phase 4
- User accounts / auth / saved history — post-MVP
- Playwright-level DNS rebinding protection (Layer 2 SSRF) — Phase 2
- Job TTL / cleanup — post-MVP
- QStash webhook failure alerting — post-MVP
- Visual design / branding — Phase 4 owns the design system

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- Phase 2: Playwright crawler on Railway extracts DOM/CSS/JS/network signals and writes them to Neon; job status advances through `crawling → extracting`
- Phase 3: Three-stage AI pipeline converts signals into scored issues, causality edges, and plain-English narrative; job status advances to `analyzing → complete`
- Phase 4: Full results dashboard renders narrative, ranked issues, and causality graph; shareable link with no login required
