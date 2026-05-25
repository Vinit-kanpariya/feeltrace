import { chromium, Browser, BrowserContext, Page } from 'playwright-core'
import { CrawlPass, JSSignals, NetworkSignals } from './lib/types'
import { extractDOMSignals } from './extractors/dom'
import { extractCSSSignals } from './extractors/css'

export function isPrivateHost(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '::1') return true
  if (hostname.startsWith('127.')) return true
  if (hostname.startsWith('10.')) return true
  if (hostname.startsWith('192.168.')) return true
  if (hostname.startsWith('169.254.')) return true
  // 172.16.0.0/12 — 172.16.x.x through 172.31.x.x
  const parts = hostname.split('.')
  if (parts[0] === '172') {
    const second = parseInt(parts[1], 10)
    if (second >= 16 && second <= 31) return true
  }
  return false
}

export async function waitForSpaHydration(page: Page, timeoutMs = 10_000): Promise<void> {
  await page.waitForLoadState('domcontentloaded')
  try {
    await page.waitForFunction(
      () => {
        if ((window as any).__NEXT_DATA__) return true
        const root = document.getElementById('root') || document.getElementById('__next')
        if (root) {
          const keys = Object.keys(root)
          if (keys.some(k => k.startsWith('__reactFiber') || k.startsWith('__reactContainer'))) return true
        }
        if ((window as any).__vue_app__) return true
        if ((window as any).__nuxt) return true
        if (document.readyState === 'complete') return true
        return false
      },
      { timeout: timeoutMs }
    )
  } catch {
    console.log('[hydration] waitForFunction timed out — proceeding')
  }
  await page.waitForTimeout(500)
}

interface ThrottleOptions {
  downloadThroughput: number
  uploadThroughput: number
  latency: number
}

interface ViewportOptions {
  width: number
  height: number
  isMobile: boolean
  hasTouch: boolean
  throttle: ThrottleOptions | null
  viewport: 'mobile' | 'desktop'
}

async function crawlWithViewport(
  browser: Browser,
  url: string,
  options: ViewportOptions,
  jobId?: string
): Promise<CrawlPass> {
  const harPath = `/tmp/feeltrace-${jobId ?? Date.now()}-${options.viewport}.har`

  const context: BrowserContext = await browser.newContext({
    viewport: { width: options.width, height: options.height },
    isMobile: options.isMobile,
    hasTouch: options.hasTouch,
    recordHar: { path: harPath, content: 'omit', mode: 'full' },
  })

  const page = await context.newPage()

  // SSRF Layer 2: block RFC-1918 and loopback at the browser request level (D-13)
  await context.route('**', (route: import('playwright-core').Route) => {
    try {
      const hostname = new URL(route.request().url()).hostname
      if (isPrivateHost(hostname)) {
        route.abort('blockedbyclient')
        return
      }
    } catch {
      // malformed URL — allow and let the browser handle it
    }
    route.continue()
  })

  if (options.throttle) {
    const client = await context.newCDPSession(page)
    await client.send('Network.enable')
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: options.throttle.downloadThroughput,
      uploadThroughput: options.throttle.uploadThroughput,
      latency: options.throttle.latency,
    })
  }

  await page.coverage.startCSSCoverage({ resetOnNavigation: false })
  await page.coverage.startJSCoverage({ resetOnNavigation: false, reportAnonymousScripts: false })

  await page.goto(url, { timeout: 40_000, waitUntil: 'domcontentloaded' })
  await waitForSpaHydration(page, 10_000)

  const domSignals = await extractDOMSignals(page)
  const cssSignals = await extractCSSSignals(page) // internally calls stopCSSCoverage

  await page.coverage.stopJSCoverage() // must be called before context.close()

  await context.close() // flushes HAR to harPath

  return {
    viewport: options.viewport,
    domSignals,
    cssSignals,
    // jsSignals and networkSignals are wired in 02-05 (extracted from harPath and coverage)
    jsSignals: {} as JSSignals,
    networkSignals: { entries: [] } as unknown as NetworkSignals,
  }
}

// Mobile slow-3G throttle values per D-27
const MOBILE_THROTTLE: ThrottleOptions = {
  downloadThroughput: 40 * 1024,
  uploadThroughput: 20 * 1024,
  latency: 400,
}

export async function runDualViewportCrawl(
  url: string,
  jobId?: string
): Promise<{ mobile: CrawlPass; desktop: CrawlPass }> {
  const browser: Browser = await chromium.launch({
    args: ['--disable-dev-shm-usage', '--disable-gpu'],
    // NOTE: --no-sandbox is intentionally omitted (Pitfall 7 / T-02-20)
  })

  try {
    const mobile = await crawlWithViewport(
      browser,
      url,
      {
        width: 375,
        height: 812,
        isMobile: true,
        hasTouch: true,
        throttle: MOBILE_THROTTLE,
        viewport: 'mobile',
      },
      jobId
    )

    const desktop = await crawlWithViewport(
      browser,
      url,
      {
        width: 1440,
        height: 900,
        isMobile: false,
        hasTouch: false,
        throttle: null,
        viewport: 'desktop',
      },
      jobId
    )

    return { mobile, desktop }
  } finally {
    await browser.close()
  }
}
