# FeelTrace — v1 Requirements

*Generated: 2026-05-18*

---

## v1 Requirements

### Crawling (CRAWL)

- [ ] **CRAWL-01**: User can submit a URL and receive an analysis result within 60 seconds via async job queue
- [ ] **CRAWL-02**: Crawler executes JavaScript and waits for SPA hydration before signal extraction (handles React, Next.js, Vue)
- [ ] **CRAWL-03**: Crawler runs each analysis in both mobile (375px, throttled) and desktop (1440px) viewport profiles

### Signal Extraction (SIG)

- [ ] **SIG-01**: System extracts DOM/HTML signals — layout depth, element counts, ARIA attributes, semantic markup quality, form structure, CTA visibility
- [ ] **SIG-02**: System extracts CSS signals — animation performance, layout complexity, paint-triggering properties, unused CSS (via Playwright coverage API), font loading patterns
- [ ] **SIG-03**: System extracts JavaScript signals — bundle transfer size, chunk count, render-blocking vs async/deferred classification, framework fingerprint (loading behavior only; no code-quality analysis of minified bundles)
- [ ] **SIG-04**: System extracts network/asset signals — full request timing waterfall (DNS/TLS/TTFB/download), render-blocking asset identification, CDN usage, image compression and sizing

### AI Pipeline (AI)

- [ ] **AI-01**: Rule-based scoring stage classifies each extracted signal into Critical / High / Medium / Low severity using deterministic thresholds (no LLM at this stage)
- [ ] **AI-02**: LLM reasoning stage (Claude Sonnet) explains why each scored issue matters and generates causality edges between issues — grounded only in signals that passed scoring; LLM is not permitted to invent issues
- [ ] **AI-03**: LLM narration stage (Claude Sonnet) generates a 2–4 paragraph plain-English summary readable by non-engineers (PMs, UX leads, agency clients)
- [ ] **AI-04**: AI pipeline explicitly distinguishes perceived performance (how slow it feels) from technical performance (what the metrics say) in both the issue list and narrative

### Dashboard & Output (DASH)

- [ ] **DASH-01**: Dashboard displays a ranked issue list ordered by UX impact severity (Critical first), with per-issue plain-English explanation and the signal evidence that triggered it
- [ ] **DASH-02**: Dashboard displays the plain-English narrative summary prominently as the primary output section
- [ ] **DASH-03**: Dashboard renders a causality graph (directed graph) showing technical cause → perceived effect chains using React Flow; only displayed when chain quality meets credibility threshold
- [ ] **DASH-04**: User can share analysis results via a persistent link or copy the full output to clipboard without requiring an account

### Infrastructure & Security (INFRA)

- [ ] **INFRA-01**: URL submission endpoint validates and blocks SSRF targets — private IP ranges (RFC-1918), localhost, link-local addresses, and cloud metadata endpoints (169.254.x.x)
- [ ] **INFRA-02**: URL submission is rate-limited per IP to prevent abuse and uncontrolled Claude API spend
- [ ] **INFRA-03**: Final analysis results (scored issues, narrative, causality edges) are persisted to PostgreSQL; raw signal payloads are ephemeral and not stored
- [ ] **INFRA-04**: Frontend polls a job-status endpoint during analysis so the user sees meaningful progress state (queued → crawling → extracting → analyzing → complete)

---

## v2 Requirements (Deferred)

These are expected features that did not make v1 scope. Include after core value is validated.

- Graceful per-error-type failure messages (login-gated pages, 500 errors, paywalled content, bot-blocked pages)
- User accounts and saved analysis history
- Historical re-analysis with before/after comparison
- PDF and Notion export of analysis output
- Multi-page / full-site crawl mode
- CI/CD integration (API + webhook)
- Source map enrichment (optional — if target site serves public source maps)

---

## Out of Scope

Explicitly excluded from FeelTrace v1 and v2. Adding these would change the product category.

- **Runtime tracking / session replays** — not replacing LogRocket, FullStory, or Hotjar; no snippet injection; no live user data collection
- **Real user monitoring (RUM)** — no event collection from actual user sessions
- **Raw Lighthouse-style composite scores (0–100)** — Lighthouse does this better; referencing them in narrative context only
- **Full axe violation checklists** — axe does this better; surfacing accessibility issues only when they contribute to a friction chain
- **Code-level fix suggestions (line-by-line)** — advisory only ("your image loading strategy is the issue"), not code review
- **Browser extension** — contradicts zero-install value proposition
- **Custom rule configuration / scoring weights** — opinionated defaults are a feature; enterprise customization is v3+
- **Performance benchmarking / competitor comparison** — requires benchmark dataset not available in v1
- **User accounts in MVP** — single-use, shareable-link model only

---

## Traceability

*Populated by roadmapper — 2026-05-18*

| REQ-ID | Phase | Status |
|--------|-------|--------|
| CRAWL-01 | Phase 1 | Pending |
| CRAWL-02 | Phase 2 | Pending |
| CRAWL-03 | Phase 2 | Pending |
| SIG-01 | Phase 2 | Pending |
| SIG-02 | Phase 2 | Pending |
| SIG-03 | Phase 2 | Pending |
| SIG-04 | Phase 2 | Pending |
| AI-01 | Phase 3 | Pending |
| AI-02 | Phase 3 | Pending |
| AI-03 | Phase 3 | Pending |
| AI-04 | Phase 3 | Pending |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 4 | Pending |
| DASH-04 | Phase 4 | Pending |
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
