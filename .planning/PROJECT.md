# FeelTrace

## What This Is

FeelTrace is a frontend UX intelligence platform. You paste a URL, FeelTrace crawls the page in dual viewport (mobile + desktop), extracts technical signals across DOM structure, CSS, JavaScript bundles, and network loading — then runs a structured 3-stage AI pipeline to produce a scored issue list and a plain-English narrative that explains why users experience friction. It sits one layer above Lighthouse, PageSpeed, and axe: instead of metric scores, it delivers causal reasoning that developers, PMs, and agency teams can actually act on.

**v1.0 shipped 2026-05-27.** The full URL → crawl → AI → results flow is live.

## Core Value

**Turn raw frontend signals into human-centered explanations of why users feel friction** — not metric scores, but narratives that connect technical causes to perceived user experience.

## Current State

**Version:** v1.0 MVP (shipped 2026-05-27)
**Codebase:** ~7,300 LOC TypeScript across Next.js app + crawler sub-project
**Tech stack:** Next.js 15 + TypeScript + Tailwind + PostgreSQL (Neon) + Prisma 7 + Vercel + Fly.io (crawler) + Groq llama-3.3-70b + React Flow
**Tests:** 117 passing (Vitest)
**Status:** Full pipeline working end-to-end; shareable results page live

## Requirements

### Validated

- ✓ User can paste a URL and trigger a full page crawl and analysis — v1.0 (async job queue, QStash-backed, 60s SLA)
- ✓ System extracts HTML/DOM signals (layout depth, element counts, ARIA, semantic markup, form structure) — v1.0
- ✓ System extracts CSS signals (animations, layout complexity, paint triggers, font loading) — v1.0
- ✓ System extracts JavaScript signals (bundle size, blocking scripts, framework detection, async patterns) — v1.0
- ✓ System extracts network/asset signals (resource waterfall, render-blocking assets, CDN usage, image optimization) — v1.0
- ✓ AI reasoning pipeline scores issues by severity using a structured extract → score → reason → narrate flow — v1.0 (deterministic Stage 1, Groq LLM Stages 2 + 3)
- ✓ Dashboard displays: (1) narrative summary, (2) ranked issue list with explanations, (3) causality graph — v1.0
- ✓ Output explains perceived performance separately from technical performance metrics — v1.0 (explicit NarrativeResult sections)
- ✓ Output identifies interaction friction chains (cause → effect → user experience impact) — v1.0 (CausalEdge with mechanism strings)
- ✓ Narratives are readable by non-engineers (PMs, UX leads, agencies) without developer translation — v1.0 (Groq narrator with PM-oriented system prompt)
- ✓ Analysis covers all three differentiation pillars: perceived performance, friction chains, human narrative — v1.0

### Active

- [ ] Graceful error handling for failed analyses (login-gated, 500 errors, bot-blocked pages) — failed jobs currently show generic 404
- [ ] Remove dead Gemini code + dependency from crawler (`getGeminiClient`, `@google/generative-ai`)
- [ ] TechProfile interface consistency across packages (optional vs required fields)
- [ ] RAILWAY_CRAWLER_URL startup validation in crawler to catch URL mismatch early
- [ ] User accounts and saved analysis history (v1.1 candidate)

### Out of Scope

- Runtime tracking / session replays — not replacing LogRocket, Sentry, or Hotjar; no snippet injection
- Real user monitoring — no event collection from live user sessions
- Multi-page project management — MVP is single URL
- API integrations with external monitoring tools — standalone product in v1
- Raw Lighthouse-style composite scores (0–100) — referencing in narrative context only
- Code-level fix suggestions (line-by-line) — advisory framing only
- Browser extension — contradicts zero-install value proposition
- Custom rule configuration / scoring weights — opinionated defaults are a feature; v3+

## Context

**Domain:** Frontend UX intelligence / AI-powered static analysis.

**Existing tools FeelTrace does NOT replace:**
- Sentry (error tracking)
- LogRocket / FullStory (session replays)
- Datadog (infrastructure monitoring)
- Chrome DevTools / Lighthouse (technical profiling)
- Vercel Analytics (usage metrics)

**What FeelTrace adds:** The AI reasoning layer that answers "why do users feel friction here?" by connecting signals those tools already surface.

**Architecture decisions validated in v1.0:**
- Static crawl via Playwright — no snippet injection required; user gets value from just a URL ✓
- Structured 3-stage pipeline — debuggable, cost-efficient vs single-shot LLM call ✓
- QStash async bridge — necessary; crawl takes 15-45s, exceeds synchronous API timeout ✓
- No auth in MVP — shareable-link model works; users can share results without accounts ✓

**LLM provider:** Groq llama-3.3-70b-versatile (migrated from Gemini in v1.0 after free-tier quota exhaustion). 14,400 RPD free tier.

**Known issues (tech debt from v1.0):**
- `crawler/src/lib/gemini.ts` is dead code; `@google/generative-ai` is a dead dependency
- Failed analysis jobs show 404-style "Results not found" rather than descriptive error
- TechProfile fields (database/auth/payments/services) are required in crawler, optional in Next.js app

## Constraints

- **Tech Stack**: Next.js + TypeScript + Tailwind + PostgreSQL (Neon) + Prisma + Vercel — established in CLAUDE.md
- **Crawler**: Fly.io (not Vercel — Vercel 250 MB bundle limit blocks Chromium); Docker-based Hono server
- **AI Provider**: Groq (llama-3.3-70b-versatile) for Stages 2+3; no LLM in Stage 1 (deterministic scorer)
- **Bundle constraint**: Signals extracted in-memory — raw payloads never stored (INFRA-03)
- **Privacy**: Crawled page data never persisted; only analysis results stored
- **Cost**: AI pipeline efficient — Groq free tier handles MVP volume; unit economics at scale TBD

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Static crawl, not runtime tracking | Removes dependency on snippet install; user gets value from just a URL | ✓ Validated in v1.0 |
| Structured pipeline (extract → score → reason → narrate) | Debuggable, cost-efficient, each stage optimized independently | ✓ Validated in v1.0 |
| Playwright for crawling | SPAs need JS execution; handles React/Vue/Next.js hydrated DOM | ✓ Validated in v1.0 |
| Fly.io over Railway for crawler | Railway requires payment method; Fly.io identical Docker workflow | ✓ Validated in v1.0 |
| Groq over Gemini/Claude API | Gemini free-tier quota exhausted; Groq 14,400 RPD free with no billing required | ✓ Validated in v1.0 |
| MVP = URL → scored issues + narrative (no auth) | Fastest path to demonstrable value; validated core AI quality | ✓ Validated in v1.0 |
| QStash as async bridge | Crawl duration 15-45s exceeds synchronous API route safety window | ✓ Validated in v1.0 |
| In-memory signals only | INFRA-03: raw signal payloads are ephemeral, never stored | ✓ Validated in v1.0 |
| Causal edge mechanism non-nullable | Schema-level enforcement prevents correlation-only edges | ✓ Validated in v1.0 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-27 after v1.0 milestone*
