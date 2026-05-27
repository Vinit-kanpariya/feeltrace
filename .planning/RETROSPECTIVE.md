# FeelTrace — Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

---

## Milestone: v1.0 — MVP

**Shipped:** 2026-05-27
**Phases:** 4 | **Plans:** 26 | **Timeline:** 9 days

### What Was Built

- **Async job pipeline** — URL → SSRF validation → QStash → Playwright crawler → AI pipeline → Neon DB → results page; full end-to-end in 9 days
- **Dual-viewport Playwright crawler** — mobile (375px, slow-3G) + desktop (1440px); SPA hydration detection; 4 signal extractors (DOM, CSS, JS, Network/HAR); deployed on Fly.io
- **3-stage AI pipeline** — deterministic Stage 1 scorer (23 rules, no LLM), Groq LLM Stage 2 causal reasoner (mechanism-validated), Groq LLM Stage 3 plain-English narrator (perceived vs technical distinction)
- **Results dashboard** — NarrativeSection, severity-ranked IssueCards, React Flow CausalityGraph (credibility-gated), ShareButton; 117 Vitest tests green

### What Worked

- **Wave-based parallel execution** — plans within each phase were sequenced into waves so independent plans ran concurrently; significantly reduced total execution time
- **Smoke-test checkpoints after every phase** — human verification at 01-08, 02-06, 03-05, and 04-07 caught integration issues (4 crawler bugs, 1 Prisma adapter issue, 1 causal edge index bug) before they became blockers in later phases
- **Structured pipeline over single-shot LLM** — Stage 1 deterministic scorer kept the LLM focused on reasoning, not signal detection; dramatically improved output consistency and reduced token cost
- **SUMMARY.md per plan** — rich per-plan records with requirements-completed frontmatter made the milestone audit fast and the requirements traceability reliable
- **Groq as free-tier LLM** — free-tier Gemini quota exhausted mid-Phase 3; Groq migration took ~2h and was transparent to the pipeline API shape; kept costs at $0 through MVP

### What Was Inefficient

- **VALIDATION.md files created but never updated** — Nyquist validation templates were generated pre-execution but never updated post-execution to reflect test passes; all show `nyquist_compliant: false` at milestone close even though tests were green
- **No VERIFICATION.md files** — formal phase verification step was skipped in favor of smoke tests in SUMMARY.md; this creates a procedural gap even when the work is done correctly
- **Gemini model iteration wasted ~1 hour** — tried 4 different Gemini model names (v1 vs v1beta naming inconsistency) before concluding it was quota exhaustion, not a model-naming issue
- **Subagent permissions blocked 02-03 parallel execution** — 02-03 and 02-04 were planned to run in parallel but subagent permission issues forced sequential execution in the main conversation
- **REQUIREMENTS.md traceability never updated** — traceability table remained "Pending" for all requirements throughout execution; required manual audit at milestone close

### Patterns Established

- **QStash + Fly.io combo for async crawl** — QStash for message delivery, Fly.io for always-on Hono server; p-queue concurrency:1 prevents Playwright resource exhaustion; this pattern is repeatable for any long-running async job
- **Groq SDK pattern for LLM stages** — `getGroqClient()` singleton in `crawler/src/pipeline/groq.ts`; Stage 2 uses JSON mode with explicit schema; Stage 3 uses plain text with section markers; clean separation
- **Causal edge index remapping** — when LLM returns indices into one array (scored) and DB write requires IDs from another (enriched), remap via stable `signalKey` identifier before DB write
- **PrismaNeon adapter in sub-project** — Prisma 7 requires adapter pattern for connection config in both root project and crawler sub-project; url removed from schema datasource entirely
- **Postbuild cpSync for Prisma runtime** — tsc compiles .ts but doesn't copy Prisma-generated .js/.wasm files; postbuild step: `cpSync('src/generated/prisma', 'dist/generated/prisma', {recursive:true})`

### Key Lessons

1. **Verify QStash signature URL before assuming HMAC logic** — a single env var mismatch (CRAWLER_PUBLIC_URL + /crawl vs RAILWAY_CRAWLER_URL) caused consistent 401s with no useful error message; always use the exact same env var both sides
2. **Fly.io requires explicit 1 GB memory for Playwright** — default Fly.io memory (256 MB) is insufficient for Chromium; `[vm] memory = '1gb'` in fly.toml is mandatory
3. **Prisma 7 adapter pattern is different from Prisma 5/6** — `url = env("DATABASE_URL")` removed from schema entirely (causes P1012 error if left in); connection passed via `new PrismaNeon({ connectionString })` constructor
4. **React Flow requires explicit container height** — zero-pixel height collapse is a common pitfall; set `h-[320px] md:h-[480px]` on the container, not just on the ReactFlow component
5. **Structured deterministic scoring before LLM** — using a deterministic scorer in Stage 1 and passing only scored issues to the LLM prevents hallucination of issues; the LLM's job is reasoning, not detection

### Cost Observations

- **LLM provider:** Groq llama-3.3-70b-versatile (free tier: 14,400 RPD)
- **Groq API cost for MVP:** $0 (free tier sufficient for development + smoke testing)
- **Notable:** Gemini migration cost ~2 hours of iteration time; having a fallback LLM provider pre-identified would have saved this

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Days | Phases | Plans | Key Pattern |
|-----------|------|--------|-------|-------------|
| v1.0 MVP | 9 | 4 | 26 | Wave-based parallel execution; smoke test gates per phase |

### Cumulative Quality

| Milestone | Tests | Status | Notable |
|-----------|-------|--------|---------|
| v1.0 MVP | 117 | All green | VALIDATION.md procedural gap; no VERIFICATION.md |

### Top Lessons (Verified Across Milestones)

1. **External service integration always finds bugs** — every human checkpoint (01-08, 02-06, 03-05) found at least one bug that unit tests couldn't catch. Budget time for deployment issues.
2. **Structured pipelines beat single-shot LLMs for reliability** — the 3-stage architecture made each stage independently testable and debuggable; single-shot would have been faster to build but much harder to trust.
