// Pipeline orchestrator: sequences Stage 1 (scoring) → Stage 2 (LLM reasoning) →
// Stage 3 (LLM narration) → atomic Prisma DB write (Result + Issues + CausalEdges).
// Source: .planning/phases/03-ai-pipeline/03-RESEARCH.md Pattern 6
import { prisma } from '../lib/prisma'
import { getGeminiClient } from '../lib/gemini'
import { scoreSignals } from './stage1-scorer'
import { runStage2Reasoning } from './stage2-reasoner'
import { runStage3Narration } from './stage3-narrator'
import type { CrawlPass } from '../lib/types'

/**
 * Runs the full AI pipeline for a crawl job:
 *   Stage 1: Deterministic signal scoring (no LLM)
 *   Stage 2: Gemini LLM reasoning — per-issue explanations + causality edges
 *   Stage 3: Gemini LLM narration — plain-English summary with perceived/technical split
 *   DB write: Atomic Prisma transaction (Result + Issues + CausalEdges)
 *
 * No try/catch here — processor.ts outer catch handles job failure status update.
 */
export async function runAIPipeline(
  jobId: string,
  signals: { mobile: CrawlPass; desktop: CrawlPass },
): Promise<void> {
  // Stage 1: deterministic scoring — no LLM, pure threshold rules
  const scoredIssues = scoreSignals(signals.mobile, signals.desktop)
  console.log(`[pipeline] Job ${jobId}: ${scoredIssues.length} issues scored`)

  // Zero-issues path: skip Stage 2 + Stage 3 API calls entirely to avoid unnecessary spend
  if (scoredIssues.length === 0) {
    await prisma.result.create({
      data: {
        jobId,
        narrative: {
          summary: 'No significant issues found. This page performs well across the measured signal categories.',
          perceivedPerformance: '',
          technicalPerformance: '',
          recommendations: [],
        },
      },
    })
    console.log(`[pipeline] Job ${jobId}: no issues — wrote empty result`)
    return
  }

  // Stage 2: LLM reasoning — enriches scored issues with technical descriptions and causal edges
  const client = getGeminiClient()
  const { enrichedIssues, edges } = await runStage2Reasoning(client, scoredIssues)
  console.log(`[pipeline] Job ${jobId}: Stage 2 complete — ${edges.length} causal edges`)

  // Stage 3: LLM narration — generates plain-English narrative with perceived/technical split
  const narrative = await runStage3Narration(client, enrichedIssues, edges)
  console.log(`[pipeline] Job ${jobId}: Stage 3 complete`)

  // Atomic DB transaction: Result + Issues (nested create) + CausalEdges
  // Pattern: result.create with include: { issues: true } returns issue IDs needed for edges
  // Source: RESEARCH.md Pattern 6 — T-03-13 mitigation (partial write prevention)
  await prisma.$transaction(async (tx) => {
    // Cast NarrativeResult to Prisma's Json type via unknown intermediate.
    // NarrativeResult is a plain serialisable object; the double-cast is safe here.
    // Prisma's InputJsonValue requires an index signature which typed interfaces don't have.
    const narrativeJson = narrative as unknown as Parameters<typeof tx.result.create>[0]['data']['narrative']

    const result = await tx.result.create({
      data: {
        jobId,
        narrative: narrativeJson,
        issues: {
          create: enrichedIssues.map((issue) => ({
            category: issue.category,
            signal_source: issue.signal_source,
            severity: issue.severity,
            raw_evidence: issue.raw_evidence,
            technical_description: issue.technical_description,
          })),
        },
      },
      include: { issues: true },
    })

    // CausalEdges reference the newly created Issue IDs via fromIndex/toIndex
    // mechanism is NON-NULLABLE per schema — zod in stage2-reasoner ensures it is always present
    // explanation is NON-NULLABLE per schema — use ?? '' fallback (T-03-12 mitigation)
    if (edges.length > 0) {
      await tx.causalEdge.createMany({
        data: edges.map((edge) => ({
          resultId: result.id,
          fromIssueId: result.issues[edge.fromIndex].id,
          toIssueId: result.issues[edge.toIndex].id,
          relationship: edge.relationship,
          confidence: edge.confidence,
          mechanism: edge.mechanism,
          explanation: edge.explanation ?? '',
        })),
      })
    }
  })

  console.log(`[pipeline] Job ${jobId} DB write complete — ${enrichedIssues.length} issues, ${edges.length} edges`)
}
