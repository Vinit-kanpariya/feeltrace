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

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { NarrativeResult } from '@/types/narrative'
import { meetsCredibilityThreshold, buildGraphData } from '@/lib/graph-utils'
import { NarrativeSection } from '@/components/NarrativeSection'
import { IssueCard } from '@/components/IssueCard'
import { CausalityGraph } from '@/components/CausalityGraph'
import { GraphAbsent } from '@/components/GraphAbsent'
import { ShareButton } from '@/components/ShareButton'

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
    },
  })

  // D-05: No Result record for this jobId — return 404 via not-found.tsx
  if (!result) notFound()

  // D-06: Failed analysis — render inline error section (HTTP 200)
  if (result.job.status === 'failed' || result.job.error_message) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold">Analysis failed</h2>
        <p className="mt-4 text-base">
          Something went wrong processing this URL.{' '}
          {result.job.error_message ?? 'Please submit the URL again from the home page.'}
        </p>
      </main>
    )
  }

  // Cast narrative: Result.narrative is Prisma Json — double-cast via unknown is safe
  // (STATE.md key decision: "NarrativeResult cast via unknown for Prisma Json type")
  const narrative = result.narrative as unknown as NarrativeResult

  // Extract hostname for page title (UI-SPEC copywriting: "UX Analysis: {hostname}")
  const hostname = new URL(result.job.url).hostname

  // Graph credibility check — must meet threshold before rendering React Flow canvas
  const showGraph = meetsCredibilityThreshold(result.edges)
  const { nodes, edges: graphEdges } = showGraph
    ? buildGraphData(result.issues, result.edges)
    : { nodes: [], edges: [] }

  // Issue count sub-label (UI-SPEC copywriting contract)
  const issueCount = result.issues.length
  const issueLabel =
    issueCount === 1
      ? '1 issue ranked by UX impact'
      : `${issueCount} issues ranked by UX impact`

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Section 1 — Header row: page title + ShareButton */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">UX Analysis: {hostname}</h1>
        <ShareButton />
      </div>

      {/* Section 2 — NarrativeSection (above the fold — primary output) */}
      <div className="mt-8">
        <NarrativeSection narrative={narrative} />
      </div>

      {/* Section 3 — Issue list */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-1">Issues Found</h2>
        <p className="text-sm text-zinc-500 mb-4">{issueLabel}</p>
        {result.issues.length === 0 ? (
          <div className="bg-zinc-100 rounded-lg p-6">
            <h3 className="text-xl font-semibold">No issues detected</h3>
            <p className="mt-2 text-base">
              This page passed all signal thresholds. Review the narrative summary for qualitative
              observations.
            </p>
          </div>
        ) : (
          result.issues.map((issue: {
            id: string
            category: string
            signal_source: string
            severity: number
            raw_evidence: string
            technical_description: string
          }) => <IssueCard key={issue.id} issue={issue} />)
        )}
      </div>

      {/* Section 4 — CausalityGraph or GraphAbsent */}
      <div className="mt-8">
        {showGraph ? (
          <>
            <h2 className="text-2xl font-semibold mb-4">Why these issues are connected</h2>
            <CausalityGraph nodes={nodes} edges={graphEdges} />
          </>
        ) : (
          <GraphAbsent />
        )}
      </div>
    </main>
  )
}
