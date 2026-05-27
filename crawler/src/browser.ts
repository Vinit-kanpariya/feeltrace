import { chromium, Browser, BrowserContext, Page } from 'playwright-core'
import { AxeBuilder } from '@axe-core/playwright'
import { BrowserFingerprint, CrawlPass, TechProfile, AxeViolation } from './lib/types'
import { extractDOMSignals } from './extractors/dom'
import { extractCSSSignals } from './extractors/css'
import { extractJSSignals } from './extractors/js'
import { extractNetworkSignals } from './extractors/network'
import { buildTechProfile } from './extractors/tech-detector'

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
        const w = window as Window & { __NEXT_DATA__?: unknown; __vue_app__?: unknown; __nuxt?: unknown }
        if (w.__NEXT_DATA__) return true
        const root = document.getElementById('root') || document.getElementById('__next')
        if (root) {
          const keys = Object.keys(root)
          if (keys.some(k => k.startsWith('__reactFiber') || k.startsWith('__reactContainer'))) return true
        }
        if (w.__vue_app__) return true
        if (w.__nuxt) return true
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
  // Unique path per pass so parallel passes don't race on the same file
  const harPath = `/tmp/feeltrace-${jobId ?? Date.now()}-${options.isMobile ? 'mobile' : 'desktop'}.har`

  const context: BrowserContext = await browser.newContext({
    viewport: { width: options.width, height: options.height },
    isMobile: options.isMobile,
    hasTouch: options.hasTouch,
    recordHar: { path: harPath, content: 'omit', mode: 'full' },
    // bypassCSP allows axe-core's injected script to run on pages with strict CSP headers.
    // Desktop-only — mobile pass never runs axe, so no need to bypass CSP there.
    ...(options.viewport === 'desktop' ? { bypassCSP: true } : {}),
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

  // Axe WCAG 2.1 A + AA scan — desktop pass only (bypassCSP is set on this context)
  let axeViolations: AxeViolation[] | undefined
  if (options.viewport === 'desktop') {
    try {
      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag21aa'])  // WCAG 2.1 A + AA — matches SC-2 requirement
        .analyze()
      axeViolations = axeResults.violations.map((v) => ({
        id: v.id,
        impact: (v.impact ?? 'minor') as AxeViolation['impact'],
        description: v.description,
        helpUrl: v.helpUrl,
        nodes: v.nodes.slice(0, 5).map((n) => ({
          target: n.target.join(', '),
          failureSummary: n.failureSummary ?? '',
        })),
      }))
    } catch (axeErr) {
      console.warn('[browser] axe scan failed:', axeErr instanceof Error ? axeErr.message : axeErr)
      axeViolations = []
    }
  }

  const domSignals = await extractDOMSignals(page)
  const cssSignals = await extractCSSSignals(page) // internally calls stopCSSCoverage
  const jsSignals = await extractJSSignals(page)  // internally calls stopJSCoverage

  // Desktop-only: capture screenshot + browser fingerprint before context closes
  let screenshot: Buffer | undefined
  let browserFingerprint: BrowserFingerprint | undefined
  if (options.viewport === 'desktop') {
    screenshot = await page.screenshot({ fullPage: false, type: 'jpeg', quality: 82 })
      .then((buf) => { console.log(`[browser] Screenshot captured: ${buf.length} bytes`); return buf })
      .catch((err: unknown) => { console.warn('[browser] Screenshot failed:', err instanceof Error ? err.message : err); return undefined })
    browserFingerprint = await page.evaluate(() => {
      const w = window as Window & {
        __NEXT_DATA__?: unknown
        __vue_app__?: unknown
        __nuxt?: unknown
        ___gatsby?: unknown
        Stripe?: unknown
        firebase?: unknown
        supabase?: unknown
        Clerk?: unknown
        Auth0?: unknown
        Paddle?: unknown
      }
      const root = document.getElementById('root') || document.getElementById('__next')
      const hasReactRoot = root
        ? Object.keys(root).some((k) => k.startsWith('__reactFiber') || k.startsWith('__reactContainer'))
        : false
      return {
        hasNextData: !!w.__NEXT_DATA__,
        hasVue: !!w.__vue_app__,
        hasNuxt: !!w.__nuxt,
        hasGatsby: !!w.___gatsby,
        hasAngular: !!document.querySelector('[ng-version]'),
        hasReactRoot,
        hasStripe: !!w.Stripe,
        hasFirebase: !!w.firebase,
        hasSupabase: !!w.supabase,
        hasClerk: !!w.Clerk,
        hasAuth0: !!w.Auth0,
        hasPaddle: !!w.Paddle,
      }
    }).catch(() => undefined)
  }

  await context.close() // flushes HAR to disk (must happen after coverage stops)

  const networkSignals = await extractNetworkSignals(harPath) // reads flushed HAR

  return {
    viewport: options.viewport,
    domSignals,
    cssSignals,
    jsSignals,
    networkSignals,
    screenshot,
    browserFingerprint,
    axeViolations,
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
): Promise<{ mobile: CrawlPass; desktop: CrawlPass; screenshot: Buffer | null; techProfile: TechProfile }> {
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

    const techProfile = buildTechProfile(
      desktop.browserFingerprint,
      desktop.jsSignals,
      desktop.networkSignals,
    )

    return {
      mobile,
      desktop,
      screenshot: desktop.screenshot ?? null,
      techProfile,
    }
  } finally {
    await browser.close()
  }
}
