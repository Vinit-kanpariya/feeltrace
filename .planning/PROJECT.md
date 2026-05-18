# FeelTrace

## What This Is

FeelTrace is a frontend UX intelligence platform. You paste a URL, FeelTrace crawls the page, extracts technical signals across DOM structure, CSS, JavaScript bundles, and network loading — then uses a structured AI pipeline to produce a scored issue list and a plain-English narrative that explains why users experience friction. It sits one layer above Lighthouse, PageSpeed, and axe: instead of metric scores, it delivers causal reasoning that developers, PMs, and agency teams can actually act on.

## Core Value

**Turn raw frontend signals into human-centered explanations of why users feel friction** — not metric scores, but narratives that connect technical causes to perceived user experience.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can paste a URL and trigger a full page crawl and analysis
- [ ] System extracts HTML/DOM signals (layout depth, element counts, ARIA, semantic markup, form structure)
- [ ] System extracts CSS signals (animations, layout complexity, paint triggers, font loading)
- [ ] System extracts JavaScript signals (bundle size, blocking scripts, framework detection, async patterns)
- [ ] System extracts network/asset signals (resource waterfall, render-blocking assets, CDN usage, image optimization)
- [ ] AI reasoning pipeline scores issues by severity using a structured extract → score → reason → narrate flow
- [ ] Dashboard displays: (1) narrative summary, (2) ranked issue list with explanations, (3) causality graph
- [ ] Output explains perceived performance separately from technical performance metrics
- [ ] Output identifies interaction friction chains (cause → effect → user experience impact)
- [ ] Narratives are readable by non-engineers (PMs, UX leads, agencies) without developer translation
- [ ] Analysis covers all three differentiation pillars: perceived performance, friction chains, human narrative

### Out of Scope

- Runtime tracking / session replays — not replacing LogRocket, Sentry, or Hotjar; no snippet injection
- Real user monitoring — no event collection from live user sessions
- User accounts / auth in MVP — single-use analysis, no persistence or history in v1
- Multi-page project management — MVP is single URL, not full site crawls
- API integrations with external monitoring tools — standalone product in v1

## Context

**Domain:** Frontend UX intelligence / AI-powered static analysis. Not a monitoring tool — an AI reasoning layer above monitoring. Comparable category to Lighthouse + axe + PageSpeed but differentiated by: (1) AI-generated causal narratives, (2) perceived vs technical performance distinction, (3) cross-signal chain detection.

**Existing tools FeelTrace does NOT replace:**
- Sentry (error tracking)
- LogRocket / FullStory (session replays)
- Datadog (infrastructure monitoring)
- Chrome DevTools / Lighthouse (technical profiling)
- Vercel Analytics (usage metrics)

**What FeelTrace adds:** The AI reasoning layer that answers "why do users feel friction here?" by connecting signals those tools already surface.

**Signal extraction approach:** Static analysis via page crawl — no browser extension, no snippet injection, no live user data required. Analysis runs entirely from a fetched page snapshot.

**AI architecture decision:** Structured pipeline chosen over single-shot LLM call. Each stage has a purpose: signals → rule-based scoring → LLM explains patterns → LLM narrates. This is more reliable, debuggable, and cheaper than one large unstructured prompt.

**Target users (all three served):**
- Frontend developer: auditing own code before shipping or debugging UX complaints
- Product manager / UX lead: understanding user frustration without reading source code
- Agency / freelancer: auditing client sites for deliverables or proposals

## Constraints

- **Tech Stack**: Next.js + TypeScript + Tailwind + PostgreSQL (Neon) + Prisma + Vercel — already established in CLAUDE.md
- **AI Provider**: Claude API (Anthropic) — matches the platform
- **Bundle constraint**: Crawler must handle SPAs (React, Vue, Next.js) — simple fetch won't capture dynamic content; needs headless browser (Playwright)
- **Cost**: AI pipeline must be efficient — too many tokens per analysis kills unit economics at scale
- **Privacy**: Crawled page data (HTML, scripts) must not be stored long-term; analysis results are stored, raw signals are ephemeral

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Static crawl, not runtime tracking | Removes dependency on snippet install; user gets value instantly from just a URL | — Pending |
| Structured pipeline (extract → score → reason → narrate) | Debuggable, cost-efficient, each stage can be optimized independently | — Pending |
| Playwright for crawling | SPAs need JS execution; Playwright handles React/Vue/Next.js hydrated DOM | — Pending |
| Claude API for reasoning | Best narrative quality; structured output support; already in platform stack | — Pending |
| MVP = URL → scored issues + narrative (no auth) | Fastest path to demonstrable value; can validate core AI quality before building auth/history | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-18 after initialization*
