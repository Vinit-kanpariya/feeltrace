// src/app/results/[jobId]/page.tsx
// ResultsPage Server Component — full /results/[jobId] route.
// Fetches Result + Job + Issues + CausalEdges from Neon and renders the full analysis page.
//
// Key decisions applied:
//   D-05: notFound() when Result record does not exist
//   D-06: inline error section when job.status === 'failed' or error_message is set
//   Next.js 15: params is a Promise — must await before use
//   Issues ordered severity DESC at Prisma query layer (not JS)
//   NarrativeResult cast via unknown (STATE.md locked decision)
//   XSS prevention: all DB content rendered as JSX text children (T-04-10)

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { NarrativeResult } from '@/types/narrative'
import type { TechProfile } from '@/types/tech'
import { meetsCredibilityThreshold, buildGraphData } from '@/lib/graph-utils'
import { NarrativeSection } from '@/components/NarrativeSection'
import { IssueCard } from '@/components/IssueCard'
import { PageAccordionSection } from '@/components/PageAccordionSection'
import { CausalityGraph } from '@/components/CausalityGraph'
import { GraphAbsent } from '@/components/GraphAbsent'
import { ShareButton } from '@/components/ShareButton'
import { ScreenshotPreview } from '@/components/ScreenshotPreview'
import { TechStackSection } from '@/components/TechStackSection'

function ResultsHeader() {
  return (
    <header className="w-full max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <span className="font-semibold text-slate-100 text-[15px] tracking-tight">FeelTrace</span>
      </Link>
      <Link
        href="/"
        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        ← New analysis
      </Link>
    </header>
  )
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  // Next.js 15 App Router: params is a Promise — MUST await before use (RESEARCH.md Pitfall 2)
  const { jobId } = await params

  // Single query: Result + Job + Issues (ordered severity DESC) + CausalEdges
  // Lookup by jobId (Result.jobId @unique), NOT by Result.id (RESEARCH.md Pitfall 7)
  const result = await prisma.result.findUnique({
    where: { jobId },
    include: {
      job: true,
      issues: { orderBy: { severity: 'desc' } }, // DB-layer sort — not JS (CONTEXT.md)
      edges: true,
      crawledPages: {                    // Phase 8: per-page breakdown
        orderBy: { page_index: 'asc' },
        include: {
          issues: { orderBy: { severity: 'desc' } },
          edges: true,
        },
      },
    },
  })

  // D-05: No Result record for this jobId — query Job before calling notFound()
  if (!result) {
    // Second query: check if a Job record exists for this jobId (failed jobs may lack a Result)
    const job = await prisma.job.findUnique({ where: { id: jobId } })

    // No Job record either — unknown jobId, return 404 via not-found.tsx
    if (!job) notFound()

    // Job exists but failed — render red error card (HTTP 200)
    return (
      <div className="min-h-dvh bg-[#060d1a] flex flex-col">
        <ResultsHeader />
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
          <div className="rounded-xl bg-red-950/40 border border-red-800/50 p-6">
            <p className="text-sm font-semibold text-red-300 mb-1.5">Analysis failed</p>
            <p className="text-sm text-red-400">
              {job.error_message ?? 'Analysis failed — try submitting again'}
            </p>
            <Link href="/" className="inline-block mt-4 text-sm text-red-300 hover:text-red-200 transition-colors">
              ← Try again
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // D-06: Failed analysis — render inline error section (HTTP 200)
  // WR-01: Gate strictly on status === 'failed'. error_message alone is not a reliable
  // failure signal — it is never cleared on retry and could be set on non-terminal jobs.
  if (result.job.status === 'failed') {
    return (
      <div className="min-h-dvh bg-[#060d1a] flex flex-col">
        <ResultsHeader />
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
          <div className="rounded-xl bg-red-950/40 border border-red-800/50 p-6">
            <p className="text-sm font-semibold text-red-300 mb-1.5">Analysis failed</p>
            <p className="text-sm text-red-400">
              {result.job.error_message ?? 'Something went wrong. Please submit the URL again from the home page.'}
            </p>
          </div>
        </main>
      </div>
    )
  }

  // Cast narrative: Result.narrative is Prisma Json — double-cast via unknown is safe
  // (STATE.md key decision: "NarrativeResult cast via unknown for Prisma Json type")
  const narrative = result.narrative as unknown as NarrativeResult
  const techProfile = result.tech_stack ? (result.tech_stack as unknown as TechProfile) : null

  // Phase 8: for multi-page jobs, top-level result.issues / result.edges are empty.
  // All issues and edges live in crawledPages[]. Fall back to root page (page_index=0)
  // so Sections 4 and 6 render meaningful data for both single-page and multi-page results.
  const rootPage = result.crawledPages.find(p => p.page_index === 0) ?? null
  const displayIssues = result.issues.length > 0 ? result.issues : (rootPage?.issues ?? [])
  const displayEdges  = result.edges.length  > 0 ? result.edges  : (rootPage?.edges  ?? [])
  // Extract hostname for page title (UI-SPEC copywriting: "UX Analysis: {hostname}")
  // CR-01: new URL() throws TypeError on malformed URLs (e.g. bare hostnames without scheme).
  // Fall back to the raw string rather than crashing the Server Component.
  let hostname: string
  try {
    hostname = new URL(result.job.url).hostname
  } catch {
    hostname = result.job.url
  }

  // Graph credibility check — must meet threshold before rendering React Flow canvas
  const showGraph = meetsCredibilityThreshold(displayEdges)
  const { nodes, edges: graphEdges } = showGraph
    ? buildGraphData(displayIssues, displayEdges)
    : { nodes: [], edges: [] }

  // Issue count sub-label (UI-SPEC copywriting contract)
  const issueCount = displayIssues.length
  const issueLabel =
    issueCount === 0
      ? ''
      : issueCount === 1
        ? '1 issue ranked by UX impact'
        : `${issueCount} issues ranked by UX impact`

  const analysedDate = result.job.created_at.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="min-h-dvh bg-[#060d1a] flex flex-col">
      <ResultsHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {/* Section 1 — Page title + ShareButton */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-green-400 mb-1">
              UX Analysis
            </p>
            <h1 className="text-[26px] font-bold text-slate-100 tracking-tight leading-tight">
              {hostname}
            </h1>
            <p className="text-[13px] text-[#64748b] mt-1">
              Analysed {analysedDate} · {issueCount === 0 ? 'no issues found' : issueCount === 1 ? '1 issue found' : `${issueCount} issues found`}
            </p>
          </div>
          <div className="mt-1 shrink-0">
            <ShareButton />
          </div>
        </div>

        {/* Section 2 — Screenshot */}
        <div className="mb-8">
          <ScreenshotPreview url={result.job.url} screenshotUrl={`/api/screenshot/${jobId}`} />
        </div>

        {/* Section 3 — Narrative */}
        <NarrativeSection narrative={narrative} />

        {/* Section 4 — Issue list */}
        <div className="mt-8">
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-base font-semibold text-slate-100">Issues Found</h2>
            {issueLabel && <span className="text-xs text-slate-500">{issueLabel}</span>}
          </div>
          {displayIssues.length === 0 ? (
            <div className="rounded-xl bg-slate-800/30 border border-slate-700/40 border-dashed p-6">
              <p className="text-sm font-semibold text-slate-300 mb-1">No issues detected</p>
              <p className="text-sm text-slate-500">
                This page passed all signal thresholds. Review the narrative summary for qualitative observations.
              </p>
            </div>
          ) : (
            displayIssues.map((issue: {
              id: string
              category: string
              signal_source: string
              severity: number
              raw_evidence: string
              technical_description: string
              fix_suggestion: string
              severity_justification: string
            }) => <IssueCard key={issue.id} issue={issue} />)
          )}
        </div>

        {/* Section 5 — Tech stack (when available) */}
        {techProfile && (
          <div className="mt-8">
            <TechStackSection tech={techProfile} />
          </div>
        )}

        {/* Section 6 — Causality graph */}
        <div className="mt-8">
          {showGraph ? (
            <>
              <h2 className="text-base font-semibold text-slate-100 mb-1">Why these issues are connected</h2>
              <p className="text-sm text-slate-500 mb-4">
                Red nodes are root causes; orange nodes are downstream effects. Arrows show the causal chain.
              </p>
              <CausalityGraph nodes={nodes} edges={graphEdges} />
            </>
          ) : (
            <GraphAbsent />
          )}
        </div>

        {/* Section 7a — Site-wide cross-page patterns (Phase 8 only) */}
        {result.cross_page_patterns != null &&
          Array.isArray(result.cross_page_patterns) &&
          (result.cross_page_patterns as unknown[]).length > 0 && (
          <div className="mt-8">
            <h2 className="text-base font-semibold text-slate-100 mb-1">Site-wide Patterns</h2>
            <p className="text-sm text-slate-500 mb-4">Issues detected across multiple crawled pages</p>
            <div className="space-y-2">
              {(result.cross_page_patterns as unknown as Array<{
                signal_source: string
                page_count: number
                worst_severity: number
              }>).map((pattern, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-[#131f35] border border-white/[0.07] px-4 py-3 flex items-center gap-3"
                >
                  <span className="font-mono text-[11px] text-[#64748b] bg-black/30 px-2 py-0.5 rounded shrink-0">
                    {pattern.signal_source}
                  </span>
                  <span className="text-sm text-slate-400">
                    detected on {pattern.page_count} page{pattern.page_count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 7b — Per-page accordion breakdown (Phase 8 only) */}
        {result.crawledPages.length > 0 && (
          <div className="mt-8">
            <h2 className="text-base font-semibold text-slate-100 mb-1">Per-page Breakdown</h2>
            <p className="text-sm text-slate-500 mb-4">
              {result.crawledPages.length} page{result.crawledPages.length !== 1 ? 's' : ''} crawled
            </p>
            <div className="space-y-3">
              {result.crawledPages.map((page) => (
                <PageAccordionSection
                  key={page.id}
                  page={page}
                  defaultOpen={page.page_index === 0}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="px-6 py-5 border-t border-slate-800/80">
        <p className="text-center text-xs text-slate-600">
          © {new Date().getFullYear()} FeelTrace — UX signal analysis for product teams
        </p>
      </footer>
    </div>
  )
}
