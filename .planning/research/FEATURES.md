# Feature Landscape

**Domain:** AI-powered frontend UX intelligence / static analysis
**Project:** FeelTrace
**Researched:** 2026-05-18
**Confidence note:** Web access unavailable during this session. All findings are from training knowledge (verified through Aug 2025) plus project documentation. Confidence levels reflect this limitation.

---

## What Existing Tools Already Do (Gap Analysis)

Understanding what competitors already provide is prerequisite to knowing what FeelTrace must not reinvent and where the real gap lies.

### Lighthouse (Google, open source)

**What it provides:**
- Five scored categories: Performance, Accessibility, Best Practices, SEO, PWA (0–100 scores)
- Core Web Vitals: LCP, CLS, FID/INP, FCP, TTFB, Speed Index, TBT
- Per-audit pass/fail results with brief explanation strings
- Opportunity list with estimated savings in load time
- Diagnostic details (DOM size, render-blocking resources, image sizing, unused CSS/JS)
- Accessibility violations mapped to WCAG criteria via axe-core integration
- "Learn more" links to web.dev articles

**What it does NOT do:**
- Does not explain causal chains between issues (e.g., "this 2MB JS bundle delays LCP which increases bounce probability for mobile users on 4G")
- Does not rank issues by user-perceived frustration — ranks by estimated byte savings or score impact, not user experience severity
- Does not translate output for PMs or non-engineers — everything is developer-targeted
- Does not distinguish between technical performance and perceived performance
- Does not provide narrative — produces structured JSON / formatted audit list, not prose
- Does not detect interaction friction patterns (confusing form flows, hidden CTAs, cognitive overload)

**Confidence:** HIGH (Lighthouse is extensively documented and in wide use)

---

### PageSpeed Insights (Google, cloud service)

**What it provides:**
- Wraps Lighthouse lab data with field data from Chrome User Experience Report (CrUX)
- Both lab (simulated) and field (real user) Core Web Vitals
- URL-level comparison to 75th percentile real user data
- Same audit list as Lighthouse, surfaced via API or web UI
- "Good / Needs Improvement / Poor" thresholds on CWV metrics

**What it does NOT do:**
- Everything Lighthouse doesn't do (same audit engine)
- Field data is 28-day rolling aggregate — no time-series or trend analysis in the UI
- No qualitative reasoning about why scores are poor or how to prioritize fixes
- Cannot explain user experience impact of individual issues

**Confidence:** HIGH

---

### axe / axe DevTools (Deque)

**What it provides:**
- Automated accessibility violation detection (WCAG 2.1/2.2, Section 508)
- Issue categorization: violations, incomplete (needs manual review), passes, inapplicable
- Impact levels: critical, serious, moderate, minor
- Rule-level detail: what failed, why it matters per WCAG, suggested fix
- DOM node identification for each violation
- CI integration via axe-core npm package
- Paid tier (axe DevTools Pro): guided testing, intelligent guided tests for ARIA patterns

**What it does NOT do:**
- Accessibility only — no performance, interaction, or visual UX analysis
- No narrative for non-technical stakeholders — output is a structured violation list
- No cross-signal reasoning (e.g., "this inaccessible modal combined with slow LCP creates a frustrating checkout abandonment pattern")
- Does not explain which violations most impact real users

**Confidence:** HIGH

---

### WebPageTest (Catchpoint)

**What it provides:**
- Multi-location, multi-device performance testing
- Waterfall charts (full request-level timing detail)
- Filmstrip view (visual rendering timeline with screenshots)
- Core Web Vitals, custom metrics, user-defined scripts
- Video comparison between URLs / test runs
- Root cause hints for specific issues (render-blocking, connection overhead)
- API access for CI integration
- Opportunity Scores mapping technical issues to user outcomes (added ~2022)

**What it does NOT do:**
- Still largely a developer tool — waterfall and filmstrip are unreadable by PMs
- No AI narrative layer
- No friction chain detection beyond performance
- No ARIA/semantic analysis
- Opportunity Scores are heuristic, not AI-reasoned causal chains

**Confidence:** HIGH (slightly less detail on Opportunity Scores evolution — MEDIUM for that specific feature)

---

### Existing AI/UX Analysis Tools (2024–2025 landscape)

This is where training knowledge is less comprehensive — treated as MEDIUM confidence.

**Waldo / Qualcomm AI UX tools:** Visual regression and flow testing with ML-based anomaly detection. Focused on test automation, not advisory analysis.

**Uizard / Galileo AI:** AI tools that generate UI designs from prompts. Input-direction (creating UIs) not analysis-direction.

**Hotjar / FullStory / LogRocket:** Session replay + heatmaps + user feedback collection. Runtime-only, require snippet injection, no static analysis. Strong on "what users did" but not "why the interface caused friction."

**Heap Analytics:** Auto-capture of user interactions with retroactive analysis. Same class as FullStory — runtime monitoring, not static analysis.

**Siteimprove / Silktide:** Accessibility + SEO auditing for enterprise. Closer to FeelTrace's category but focused on compliance checklisting, no AI causal reasoning.

**Caliber (Codiga/Sonar-adjacent UX linters):** Code quality tools. Not UX experience-focused.

**Vercel Analytics / Speed Insights:** Core Web Vitals tracking for Vercel-deployed apps. Metrics dashboard only — no explanatory layer.

**Notable gap as of 2025:** No mainstream tool combines static page analysis with AI-generated causal narrative that explains user frustration in plain English. The closest approximation is a Lighthouse report + a developer who knows how to interpret it and can write a plain-English summary for their PM. FeelTrace automates that translation step.

**Confidence:** MEDIUM — AI tooling space evolves rapidly; new entrants likely but none with exactly this positioning as of Aug 2025 training cutoff.

---

## Table Stakes

Features users expect. Missing any of these makes FeelTrace feel incomplete or untrustworthy — users leave before validating the core value.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| URL input → analysis trigger | Core product interaction; if this fails or is slow, nothing else matters | Low (UI) / High (infra) | SPA crawl via Playwright adds complexity; simple fetch is insufficient |
| Loading / progress state | Analysis takes 10–30s; no feedback = users assume broken | Low | Needs progress indication, not just a spinner |
| Scored issue list | Lighthouse/axe have trained users to expect prioritized issue lists | Medium | Must be visibly ranked; unranked list looks like raw dump |
| Severity levels on issues | "Critical / High / Medium / Low" is the vocabulary every developer knows | Low | Map to this vocabulary even if internal scoring is more nuanced |
| Issue descriptions that are actionable | "Your LCP is 3.8s" is useless; "Your hero image is uncompressed (2.1MB) and has no `loading=lazy`" is actionable | Medium | Requires per-issue explanation generation, not just metric reporting |
| Mobile vs desktop distinction | Lighthouse has trained users to expect both; mobile-only analysis feels incomplete | Medium | Run two Playwright profiles or flag which was used |
| Shareable / copyable output | Frontend devs need to paste findings into Jira, Slack, PRs | Low | Share link or copy-to-clipboard; no auth required in MVP |
| Fast turnaround (under 60s) | Users won't wait longer for a free single-URL tool | Medium/High | Pipeline optimization required; token efficiency matters for cost+speed |
| Handles SPAs correctly | React/Next.js/Vue are the dominant deployment targets; if analysis fails on them, the tool looks broken | High | Playwright with JS execution required; wait-for-hydration strategy needed |
| Graceful failure messages | Paywalled pages, login-gated URLs, 500 errors — must explain why analysis failed | Low | Simple error states, clear messaging |

---

## Differentiators

Features that set FeelTrace apart. Users won't expect these — but they're the reason the product earns loyalty over just using Lighthouse.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Plain-English narrative | PMs, UX leads, and agency clients can read the output without a developer translating it | High | Core differentiator; quality depends entirely on AI pipeline quality |
| Causality graph (friction chains) | Shows "why" not just "what" — e.g., render-blocking JS → delayed LCP → premature interaction attempt → CLS spike → user abandons | High | Requires cross-signal reasoning; most novel feature technically |
| Perceived performance vs. technical performance distinction | Lighthouse scores technical reality; FeelTrace scores user perception — a 90 Lighthouse score can still feel slow | Medium | Requires custom scoring rubric and AI reasoning about perceptual impact |
| PM-targeted severity framing | Issues ranked by user frustration potential, not byte savings | Medium | Scoring rubric must incorporate UX psychology (above-the-fold, first interaction, form completion, etc.) |
| Interaction friction detection | Identifies patterns that cause confusion, not just slowness — e.g., hidden CTAs, form field labeling issues, cognitive overload from element density | High | Requires semantic DOM analysis beyond what Lighthouse does |
| Narrative explains cross-signal chains in business terms | "Users on mobile are likely abandoning at the checkout step because..." rather than "CLS score 0.15" | High | Depends on AI prompt design and multi-signal synthesis |
| Zero-install delivery | Value from URL only — no snippet, no CI integration, no plugin install | Low (UX) | Already a constraint; surface it as a feature in UI copy |
| Agency/deliverable-ready output | Agencies auditing client sites need a format they can include in proposals — clean, exportable, professional | Medium | Formatting and export features; downstream of core AI quality |

---

## Anti-Features

Features to explicitly NOT build in v1. These would dilute focus, balloon scope, or replicate tools that already do them better.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Raw metric dashboards (scores like Lighthouse's 0–100) | Already solved by Lighthouse/PageSpeed; replicating it makes FeelTrace look like a worse version | Reference Lighthouse scores in narrative as supporting evidence, don't surface them as primary output |
| Full accessibility violation lists (axe-style) | axe does this better; building it competes where FeelTrace has no advantage | Surface accessibility issues only when they contribute to a friction chain; link to axe for full audit |
| Historical tracking / trend charts | Requires auth, persistence, project management — scope explosion for v1 | Out of scope per PROJECT.md; revisit in v2 after validating core value |
| Multi-page / full-site crawl | Turns one URL analysis into a site audit product — different UX, much higher complexity | Single URL is the right MVP constraint; don't expand |
| CI/CD pipeline integration | Useful eventually, but requires API design, auth tokens, webhook management | v2+ feature after core product is validated |
| Browser extension | Adds distribution complexity; changes positioning from "paste URL" to "install required" | Contradicts zero-install value prop |
| User accounts / saved history | Requires auth system, data retention policy, privacy considerations | Out of scope per PROJECT.md; MVP is stateless single-use |
| Custom rule configuration | "Configure your own severity weights" is a power feature that adds UI complexity; most users want opinionated defaults | Opinionated defaults are a feature, not a limitation; enterprise customization is v3+ |
| Code-level fix suggestions (line-by-line) | Different product (linter / code review tool); requires repo access | Stay advisory: "your image loading strategy is the issue" not "change line 47 of ImageComponent.tsx" |
| Real user monitoring / session replay | Different product category; requires snippet injection | Explicitly out of scope; FeelTrace is static analysis only |
| Performance benchmarking / competitor comparison | "Your site is faster than 60% of industry peers" — sounds nice, requires a large benchmark dataset to be credible | No baseline data in v1; don't make claims that can't be supported |

---

## Feature Dependencies

```
URL Input
  └── Playwright Crawl (SPA-aware)
        ├── DOM/HTML Signal Extraction
        │     └── Interaction Friction Detection
        │           └── Plain-English Narrative (friction chains)
        ├── CSS Signal Extraction
        │     └── Perceived Performance Scoring
        │           └── Plain-English Narrative (performance)
        ├── JS Signal Extraction
        │     └── Perceived Performance Scoring
        ├── Network/Asset Signal Extraction
        │     └── Perceived Performance Scoring
        └── [All signals combined]
              └── AI Reasoning Pipeline
                    ├── Scored Issue List (with severity)
                    ├── Causality Graph (friction chains)
                    └── Plain-English Narrative (synthesis)
                          └── Shareable Output / Export
```

Critical path: Playwright crawl quality directly determines everything downstream. If signal extraction is incomplete or wrong, the AI produces plausible-sounding but incorrect narratives — which is worse than no output.

---

## MVP Recommendation

**Prioritize (v1 must-haves):**

1. URL input + Playwright crawl that handles SPAs reliably (React, Next.js, Vue minimum)
2. Signal extraction across all four domains (DOM, CSS, JS, network)
3. AI pipeline producing scored issue list with plain-English per-issue explanations
4. Plain-English narrative summary (2–4 paragraphs, PM-readable)
5. Loading state with progress indication
6. Graceful error handling for ungroupable pages (login-gated, 500s, paywalled)
7. Shareable output (link or copy-to-clipboard)

**Include in v1 if pipeline quality is strong enough:**

8. Causality graph (the most differentiating feature — but only if the chains are accurate; inaccurate chains destroy credibility faster than missing them)
9. Mobile vs desktop analysis distinction
10. Perceived vs technical performance distinction explicitly surfaced in output

**Defer to v2:**

- Export to PDF/Notion
- Historical analysis / URL re-analysis comparison
- Auth / saved history
- CI integration
- Full-site multi-page analysis

---

## What Frontend Devs Actually Want (User Perspective)

Based on community patterns and tooling discussions through 2025:

**Developers want:**
- Prioritization by impact, not just enumeration — "fix this first" guidance
- Explanation of why a metric is bad, not just that it is bad
- Actionable specifics about the cause, not generic best-practice links
- Fast results (under a minute for a URL tool)
- Something they can paste into a Jira ticket without rewriting

**PMs and UX leads want:**
- Output that doesn't require decoding developer acronyms (LCP, CLS, TBT, TTI)
- Business-frame framing: "users are likely to abandon the checkout flow" not "CLS is 0.18"
- Something they can share in a stakeholder deck
- Confidence that the AI findings are credible, not hallucinated

**Agencies want:**
- Professional-looking output for client deliverables
- Quick analysis per client site without per-site tooling setup
- Findings they can use to justify paid UX/performance work

**Shared pain point across all three:** Existing tools produce output that requires a developer who understands both the tool and the business context to translate findings into action. FeelTrace's core value proposition directly addresses this translation bottleneck.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Lighthouse / axe / PageSpeed feature inventory | HIGH | Extensively documented tools; training data is reliable |
| WebPageTest features | HIGH | Core features stable; Opportunity Scores evolution MEDIUM |
| AI UX tool landscape (2025) | MEDIUM | Rapid-moving space; new entrants likely since Aug 2025 cutoff |
| What devs/PMs want from UX tools | MEDIUM | Based on community patterns, not fresh user research |
| FeelTrace differentiator gaps | HIGH | Gap analysis from known tools is reliable; novelty of positioning is well-supported |

---

## Sources

- Project documentation: `.planning/PROJECT.md` (authoritative for constraints and out-of-scope decisions)
- Lighthouse features: Training knowledge from official Lighthouse documentation and Google web.dev (HIGH confidence, verified through Aug 2025)
- axe-core: Training knowledge from Deque Systems documentation (HIGH confidence)
- PageSpeed Insights: Training knowledge from Google Developers documentation (HIGH confidence)
- WebPageTest: Training knowledge from Catchpoint WebPageTest documentation (HIGH confidence)
- AI UX tool landscape: Training knowledge from community discussions and product announcements (MEDIUM confidence — web access unavailable to verify current state)

**Note:** Web access (WebSearch, WebFetch) was unavailable during this research session. The competitive landscape section for AI-based tools carries MEDIUM confidence and should be spot-checked before roadmap finalization. The gap analysis for established tools (Lighthouse, axe, PageSpeed, WebPageTest) is HIGH confidence and unlikely to have materially changed.
