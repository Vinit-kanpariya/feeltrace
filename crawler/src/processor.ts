import { prisma } from './lib/prisma'
import { runDualViewportCrawl } from './browser'
import { runAIPipeline } from './pipeline/run-pipeline'

const SLA_MS = 55_000 // D-28: 55s budget, 5s headroom from 60s job SLA

export async function processJob(jobId: string, url: string): Promise<void> {
  // D-05 idempotency: discard if already being processed or done
  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { status: true } })
  if (!job) {
    console.warn(`[processor] Job ${jobId} not found — discarding`)
    return
  }
  if (job.status !== 'pending') {
    console.warn(`[processor] Job ${jobId} already ${job.status} — discarding duplicate delivery`)
    return
  }

  const startedAt = Date.now()

  try {
    await prisma.job.update({ where: { id: jobId }, data: { status: 'crawling' } })

    // D-28: 55-second SLA timeout wrapping the dual viewport crawl
    const { mobile, desktop, screenshot, techProfile } = await Promise.race([
      runDualViewportCrawl(url, jobId),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('SLA exceeded: crawl timed out after 55s')), SLA_MS)
      ),
    ])

    await prisma.job.update({ where: { id: jobId }, data: { status: 'extracting' } })

    // Signals are in-memory only per INFRA-03 — raw signal payloads are not written to DB
    const signals = { mobile, desktop }
    console.log(`[processor] Job ${jobId} signals collected: mobile=${mobile.viewport}, desktop=${desktop.viewport}`)

    await prisma.job.update({ where: { id: jobId }, data: { status: 'analyzing' } })

    // Phase 3: AI pipeline — scoreSignals → LLM reasoning → LLM narration → DB write
    await runAIPipeline(jobId, signals, screenshot, techProfile)

    await prisma.job.update({ where: { id: jobId }, data: { status: 'complete' } })
    console.log(`[processor] Job ${jobId} completed in ${Date.now() - startedAt}ms`)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown crawler error'
    console.error(`[processor] Job ${jobId} failed:`, message)
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'failed', error_message: message.slice(0, 500) },
    })
  }
}
