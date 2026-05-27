# FeelTrace v1.1 — Requirements

**Milestone:** v1.1 Analysis Depth
**Status:** Active
**Last updated:** 2026-05-27

---

## v1.1 Requirements

### Signal Coverage

- [ ] **SIGNAL-01**: System fetches Core Web Vitals field data (LCP, CLS, INP) via PageSpeed Insights CrUX API for the crawled URL
- [ ] **SIGNAL-02**: System runs axe-core accessibility scan during Playwright crawl and captures WCAG 2.1 violations with element selectors and impact levels
- [ ] **SIGNAL-03**: System captures Lighthouse scores (Performance, Accessibility, SEO, Best Practices) as a benchmark grounding layer
- [ ] **SIGNAL-04**: System feeds page screenshot to a vision model to surface visual, layout, and contrast issues not detectable via DOM parsing

### AI Reasoning Depth

- [ ] **AI-01**: Each issue in the output includes a concrete actionable fix suggestion (specific implementation action, not advisory framing)
- [ ] **AI-02**: Each issue includes a severity justification that estimates user impact (e.g. bounce rate correlation, task abandonment risk)
- [ ] **AI-03**: System detects page type (e-commerce, landing page, SaaS dashboard, blog, etc.) and tailors issue framing and narrative to that context
- [ ] **AI-04**: System compares crawled metrics against industry baseline benchmarks (e.g. "your LCP is 2× the median for e-commerce")

### Multi-page Crawl

- [ ] **CRAWL-01**: System auto-discovers internal links from the root URL and crawls up to a configurable max number of pages (default: 5)
- [ ] **CRAWL-02**: System merges signals from all crawled pages into a unified site-wide analysis with cross-page pattern detection
- [ ] **CRAWL-03**: Results UI shows per-page breakdowns alongside the site-wide summary

### Tech Debt (v1.0 Carried Forward)

- [ ] **DEBT-01**: Remove `crawler/src/lib/gemini.ts` dead code and `@google/generative-ai` dependency from crawler
- [ ] **DEBT-02**: Replace 404-style "Results not found" with a descriptive failed-job error page explaining what went wrong and next steps
- [ ] **DEBT-03**: Align TechProfile optional/required fields between crawler package and Next.js app
- [ ] **DEBT-04**: Add startup validation for `RAILWAY_CRAWLER_URL` in the crawler service to catch misconfiguration at boot

---

## Future Requirements (Deferred)

- User accounts and saved analysis history — auth-free model preserved in v1.1; re-evaluate in v1.2 once analysis depth is proven
- Multi-page: user-specified URL list — auto-discovery chosen for v1.1; manual list input is a differentiator for v1.2+
- Custom scoring weights / rule configuration — opinionated defaults are a feature; v3+
- Code-level fix suggestions (line-by-line) — advisory framing only in v1.1

---

## Out of Scope

- Runtime tracking / session replays — not replacing LogRocket, Sentry, or Hotjar; no snippet injection
- Real user monitoring — no event collection from live user sessions
- API integrations with external monitoring tools — standalone product
- Browser extension — contradicts zero-install value proposition
- Raw Lighthouse-style composite scores (0–100) as primary output — referenced in narrative only

---

## Traceability

| REQ-ID | Phase | Plan |
|--------|-------|------|
| SIGNAL-01 | Phase 6 | — |
| SIGNAL-02 | Phase 6 | — |
| SIGNAL-03 | Phase 6 | — |
| SIGNAL-04 | Phase 7 | — |
| AI-01 | Phase 7 | — |
| AI-02 | Phase 7 | — |
| AI-03 | Phase 7 | — |
| AI-04 | Phase 7 | — |
| CRAWL-01 | Phase 8 | — |
| CRAWL-02 | Phase 8 | — |
| CRAWL-03 | Phase 8 | — |
| DEBT-01 | Phase 5 | — |
| DEBT-02 | Phase 5 | — |
| DEBT-03 | Phase 5 | — |
| DEBT-04 | Phase 5 | — |
