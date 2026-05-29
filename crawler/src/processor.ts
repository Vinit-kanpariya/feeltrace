import { prisma } from './lib/prisma'
import { runDualViewportCrawl } from './browser'
import { runAIPipeline } from './pipeline/run-pipeline'
import { runSiteWideAnalysis } from './pipeline/site-wide-merger'
import { fetchPSISignals } from './lib/psi'
import type { PageAnalysisResult, SiteWideNarrative } from './pipeline/types'

// MAX_CRAWL_PAGES defaults to 5 via env; hard cap is 10 (T-08-12 DoS mitigation)
const MAX_PAGES = Math.min(parseInt(process.env.MAX_CRAWL_PAGES ?? '5', 10), 10)
const PER_PAGE_TIMEOUT_MS = 90_000  // 90 seconds per page (T-08-13 mitigation)
const TOTAL_CRAWL_TIMEOUT_MS = 480_000  // 8 minutes total — declared for documentation; per-page timeouts provide effective budget

/** Race a promise against a timeout reject. */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ])
}

/** Crawl a single page and run the AI pipeline in multi mode. Returns PageAnalysisResult. */
async function crawlAndAnalyzePage(
  jobId: string,
  pageUrl: string,
  pageIndex: number,
): Promise<PageAnalysisResult> {
  const [crawlResult, psiResult] = await Promise.all([
    runDualViewportCrawl(pageUrl, jobId),
    fetchPSISignals(pageUrl, 30_000),
  ])
  const { mobile, desktop, screenshot, techProfile } = crawlResult

  const pipelineResult = await runAIPipeline(
    jobId,
    { mobile, desktop },
    screenshot,
    techProfile,
    psiResult,
    'multi',
  ) as Awaited<ReturnType<typeof runAIPipeline>> & object

  // runAIPipeline with mode='multi' always returns PipelineResult (never void)
  const result = pipelineResult as {
    enrichedIssues: PageAnalysisResult['enrichedIssues']
    edges: PageAnalysisResult['edges']
    narrative: PageAnalysisResult['narrative']
    screenshotUrl: string | null
    techProfile: PageAnalysisResult['techProfile']
    pageType: PageAnalysisResult['pageType']
  }

  return {
    url: pageUrl,
    pageIndex,
    enrichedIssues: result.enrichedIssues,
    edges: result.edges,
    narrative: result.narrative,
    screenshotUrl: result.screenshotUrl,
    techProfile: result.techProfile,
    pageType: result.pageType,
    discoveredLinks: desktop.internalLinks ?? [],
  }
}

/** Write all crawl results atomically: one Result + N CrawledPage records (T-08-14 mitigation). */
async function writeCrawlResults(
  jobId: string,
  allPageResults: PageAnalysisResult[],
  siteWide: SiteWideNarrative,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Cast narrative and crossPagePatterns to Prisma Json types via unknown intermediate.
    // These are plain serialisable objects; the double-cast is safe here.
    const narrativeJson = siteWide.narrative as unknown as Parameters<typeof tx.result.create>[0]['data']['narrative']
    const crossPagePatternsJson = siteWide.crossPagePatterns as unknown as Parameters<typeof tx.result.create>[0]['data']['cross_page_patterns']

    const result = await tx.result.create({
      data: {
        jobId,
        narrative: narrativeJson,
        screenshot_url: allPageResults[0]?.screenshotUrl ?? null,
        tech_stack: allPageResults[0]?.techProfile as unknown as Parameters<typeof tx.result.create>[0]['data']['tech_stack'],
        cross_page_patterns: crossPagePatternsJson,
      },
    })

    // Create each CrawledPage with its issues (nested create)
    // Capture returned pages to get CrawledPageIssue IDs for edge creation
    for (const pageResult of allPageResults) {
      const pageNarrativeJson = pageResult.narrative as unknown as Parameters<typeof tx.crawledPage.create>[0]['data']['narrative']
      const pageTechStackJson = pageResult.techProfile as unknown as Parameters<typeof tx.crawledPage.create>[0]['data']['tech_stack']

      const crawledPage = await tx.crawledPage.create({
        data: {
          resultId: result.id,
          url: pageResult.url,
          page_index: pageResult.pageIndex,
          narrative: pageNarrativeJson,
          screenshot_url: pageResult.screenshotUrl,
          tech_stack: pageTechStackJson,
          issues: {
            create: pageResult.enrichedIssues.map((issue) => ({
              category: issue.category,
              signal_source: issue.signal_source,
              severity: issue.severity,
              raw_evidence: issue.raw_evidence,
              technical_description: issue.technical_description,
              fix_suggestion: issue.fix_suggestion,
              severity_justification: issue.severity_justification,
            })),
          },
        },
        include: { issues: { orderBy: { id: 'asc' } } },
      })

      // Create CrawledPageEdge records using same fromIndex/toIndex → issue ID pattern as CausalEdge
      if (pageResult.edges.length > 0) {
        const issueIdByPosition = new Map<number, string>()
        crawledPage.issues.forEach((issue, pos) => issueIdByPosition.set(pos, issue.id))

        await tx.crawledPageEdge.createMany({
          data: pageResult.edges.map((edge) => {
            const fromIssueId = issueIdByPosition.get(edge.fromIndex)
            const toIssueId = issueIdByPosition.get(edge.toIndex)
            if (!fromIssueId || !toIssueId) {
              throw new Error(
                `CrawledPageEdge references out-of-bounds index: from=${edge.fromIndex} to=${edge.toIndex} (issues.length=${crawledPage.issues.length})`,
              )
            }
            return {
              crawledPageId: crawledPage.id,
              fromIssueId,
              toIssueId,
              relationship: edge.relationship,
              confidence: edge.confidence,
              mechanism: edge.mechanism,
              explanation: edge.explanation ?? '',
            }
          }),
        })
      }
    }
  })
}

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
  const allPageResults: PageAnalysisResult[] = []

  try {
    await prisma.job.update({ where: { id: jobId }, data: { status: 'crawling' } })

    // Crawl root URL (page index 0) with per-page timeout (T-08-13)
    const rootResult = await withTimeout(
      crawlAndAnalyzePage(jobId, url, 0),
      PER_PAGE_TIMEOUT_MS,
      `[processor] Job ${jobId}: root page exceeded per-page timeout (${PER_PAGE_TIMEOUT_MS}ms)`,
    )
    allPageResults.push(rootResult)

    // Filter root URL from discovered links to avoid duplicate crawl (T-08-15)
    const normalizedRoot = url.split('#')[0].replace(/\/$/, '')
    const additionalUrls = rootResult.discoveredLinks
      .filter((u) => u !== normalizedRoot)
      .slice(0, MAX_PAGES - 1)

    // Crawl additional pages sequentially with per-page error isolation
    for (let i = 0; i < additionalUrls.length; i++) {
      try {
        const pageResult = await withTimeout(
          crawlAndAnalyzePage(jobId, additionalUrls[i], i + 1),
          PER_PAGE_TIMEOUT_MS,
          `[processor] Job ${jobId}: page ${additionalUrls[i]} exceeded per-page timeout (${PER_PAGE_TIMEOUT_MS}ms)`,
        )
        allPageResults.push(pageResult)
      } catch (pageErr) {
        console.warn(
          `[processor] Job ${jobId}: page ${additionalUrls[i]} failed — continuing`,
          pageErr,
        )
      }
    }

    if (allPageResults.length === 0) {
      throw new Error('All pages failed — no results to write')
    }

    await prisma.job.update({ where: { id: jobId }, data: { status: 'analyzing' } })

    // Stage 4: site-wide analysis — aggregates per-page results into unified narrative
    const siteWide = await runSiteWideAnalysis(allPageResults)

    // Atomic DB write: one Result + N CrawledPage records (T-08-14)
    await writeCrawlResults(jobId, allPageResults, siteWide)

    await prisma.job.update({ where: { id: jobId }, data: { status: 'complete' } })
    console.log(
      `[processor] Job ${jobId} completed in ${Date.now() - startedAt}ms — ${allPageResults.length} pages`,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown crawler error'
    console.error(`[processor] Job ${jobId} failed:`, message)
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'failed', error_message: message.slice(0, 500) },
    })
  }
}
