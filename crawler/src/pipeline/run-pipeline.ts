// Pipeline orchestrator: sequences Stage 1 (scoring) → Stage 2 (LLM reasoning) →
// Stage 3 (LLM narration) → atomic Prisma DB write (Result + Issues + CausalEdges).
// Source: .planning/phases/03-ai-pipeline/03-RESEARCH.md Pattern 6
import { put } from '@vercel/blob'
import { prisma } from '../lib/prisma'
import { getGroqClient } from '../lib/groq-client'
import { scoreSignals } from './stage1-scorer'
import { scoreExternalSignals, scoreAxeViolations } from './stage1-external-scorer'
import { runStage2Reasoning } from './stage2-reasoner'
import { runStage3Narration } from './stage3-narrator'
import { runVisualScanner } from './stage1-5-vision-scanner'
import type { CrawlPass, TechProfile, ExternalSignals } from '../lib/types'

/**
 * Runs the full AI pipeline for a crawl job:
 *   Stage 1: Deterministic signal scoring (no LLM)
 *   Stage 2: Gemini LLM reasoning — per-issue explanations + causality edges
 *   Stage 3: Gemini LLM narration — plain-English summary with perceived/technical split
 *   DB write: Atomic Prisma transaction (Result + Issues + CausalEdges)
 *
 * No try/catch here — processor.ts outer catch handles job failure status update.
 */
async function uploadScreenshot(jobId: string, screenshot: Buffer): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn(`[pipeline] Job ${jobId}: BLOB_READ_WRITE_TOKEN not set — skipping screenshot upload`)
    return null
  }
  try {
    console.log(`[pipeline] Job ${jobId}: uploading screenshot (${screenshot.length} bytes)…`)
    const { url } = await put(`screenshots/${jobId}.jpg`, screenshot, {
      access: 'private',
      contentType: 'image/jpeg',
    })
    console.log(`[pipeline] Job ${jobId}: screenshot uploaded → ${url}`)
    return url
  } catch (err) {
    console.warn(`[pipeline] Job ${jobId}: screenshot upload failed —`, err instanceof Error ? err.message : err)
    return null
  }
}

export async function runAIPipeline(
  jobId: string,
  signals: { mobile: CrawlPass; desktop: CrawlPass },
  screenshot: Buffer | null,
  techProfile: TechProfile,
  externalSignals: ExternalSignals | null,
): Promise<void> {
  // Stage 1: deterministic scoring — no LLM, pure threshold rules
  const scoredIssues = scoreSignals(signals.mobile, signals.desktop)
  // Append external signal scores (CWV + Lighthouse from PSI)
  scoredIssues.push(...scoreExternalSignals(externalSignals ?? { cwv: null, lighthouse: null }))
  // Append axe accessibility violation scores (desktop-only; axeViolations is undefined on mobile pass)
  scoredIssues.push(...scoreAxeViolations(signals.desktop.axeViolations ?? []))
  console.log('[pipeline] Job ' + jobId + ': ' + scoredIssues.length + ' total issues scored')

  // Stage 1.5: vision scanner — insert visual issues into scoredIssues BEFORE Stage 2
  // so Stage 2 can reason about them and form causal edges with visual signals
  const client = getGroqClient()
  if (screenshot) {
    const visualIssues = await runVisualScanner(client, screenshot)
    scoredIssues.push(...visualIssues)
    console.log('[pipeline] Job ' + jobId + ': Stage 1.5 complete — ' + visualIssues.length + ' visual issues')
  }

  // Upload screenshot to Vercel Blob (non-blocking — proceeds even if upload fails)
  const screenshotUrl = screenshot ? await uploadScreenshot(jobId, screenshot) : null

  // Merge _signals (raw CWV + Lighthouse) into tech_stack JSON column (no schema change needed)
  const techStackWithSignals = {
    ...(techProfile as object),
    _signals: {
      cwv: externalSignals?.cwv ?? null,
      lighthouse: externalSignals?.lighthouse ?? null,
    },
  }
  const techStackJson = techStackWithSignals as unknown as Parameters<typeof prisma.result.create>[0]['data']['tech_stack']

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
        screenshot_url: screenshotUrl,
        tech_stack: techStackJson,
      },
    })
    console.log(`[pipeline] Job ${jobId}: no issues — wrote empty result`)
    return
  }

  // Stage 2: LLM reasoning — enriches scored issues with technical descriptions and causal edges
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
        screenshot_url: screenshotUrl,
        tech_stack: techStackJson,
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
