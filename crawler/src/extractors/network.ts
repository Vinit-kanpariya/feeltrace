import fs from 'fs/promises'
import { NetworkSignals, HAREntry } from '../lib/types'

const CDN_FINGERPRINTS = [
  'cloudfront.net',
  'fastly.net',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'cdnjs.cloudflare.com',
  'akamaized.net',
  'azureedge.net',
]

interface HARFile {
  log: {
    pages?: Array<{ id: string; title: string }>
    entries: Array<{
      pageref?: string
      time: number
      request: { url: string; method: string }
      response: {
        status: number
        content: { mimeType: string }
        bodySize: number
      }
      timings: {
        dns: number
        connect: number
        ssl: number
        send?: number
        wait: number
        receive: number
      }
    }>
  }
}

export async function extractNetworkSignals(harPath: string): Promise<NetworkSignals> {
  const raw = await fs.readFile(harPath, 'utf-8')
  const har: HARFile = JSON.parse(raw)

  const firstPageId = har.log.pages?.[0]?.id

  const entries: HAREntry[] = []
  let totalTransferSize = 0
  let renderBlockingCount = 0
  const renderBlockingAssets: string[] = []
  let cdnCount = 0
  let firstRequestTTFB = -1
  let maxTTFB = 0
  let imageCount = 0
  let oversizedImageCount = 0
  let totalImageBytes = 0

  for (const entry of har.log.entries) {
    const url = entry.request.url
    const method = entry.request.method
    const status = entry.response.status
    const mimeType = entry.response.content.mimeType || ''
    const transferSize = entry.response.bodySize ?? 0

    const { dns, connect, ssl, wait, receive } = entry.timings
    const total = (dns ?? 0) + (connect ?? 0) + (ssl ?? 0) + (wait ?? 0) + (receive ?? 0)

    // TTFB tracking (first HTML document request)
    if (mimeType.includes('html') && firstRequestTTFB === -1 && wait > 0) {
      firstRequestTTFB = wait
    }
    if (wait > maxTTFB) maxTTFB = wait

    // CDN detection
    const matchedCDN = CDN_FINGERPRINTS.find((fp) => url.includes(fp)) ?? null
    if (matchedCDN) cdnCount++

    // Render-blocking heuristic: JS or CSS on the first page, no async/defer in URL
    const isBlockingMime =
      mimeType.includes('javascript') || mimeType.includes('css')
    const hasAsyncDefer = url.includes('async') || url.includes('defer')
    const isFirstPage = !firstPageId || entry.pageref === firstPageId
    const isRenderBlocking = isBlockingMime && !hasAsyncDefer && isFirstPage

    if (isRenderBlocking) {
      renderBlockingCount++
      renderBlockingAssets.push(url)
    }

    // Image signals
    if (mimeType.startsWith('image/')) {
      imageCount++
      totalImageBytes += transferSize
      if (transferSize > 100 * 1024) oversizedImageCount++
    }

    totalTransferSize += transferSize

    entries.push({
      url,
      method,
      status,
      mimeType,
      transferSize,
      timings: {
        dns: dns ?? 0,
        connect: connect ?? 0,
        ssl: ssl ?? 0,
        wait: wait ?? 0,
        receive: receive ?? 0,
        total,
      },
      isRenderBlocking,
      cdnProvider: matchedCDN,
    })
  }

  // Clean up temp HAR file (T-02-13)
  await fs.unlink(harPath).catch(() => {})

  return {
    totalRequests: entries.length,
    totalTransferSize,
    renderBlockingCount,
    renderBlockingAssets,
    cdnCount,
    firstRequestTTFB,
    maxTTFB,
    imageCount,
    oversizedImageCount,
    totalImageBytes,
    entries,
  }
}
