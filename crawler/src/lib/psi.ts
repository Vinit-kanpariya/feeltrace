// crawler/src/lib/psi.ts
// PageSpeed Insights API client — fetches CWV (CrUX field data) + Lighthouse scores.
// Returns null (never throws) on missing API key, timeout, HTTP error, or parse failure.
// PAGESPEED_API_KEY is soft-required: warn at startup, skip PSI gracefully if absent.

import type { ExternalSignals, CWVMetrics, LighthouseScores } from './types'

const PSI_BASE = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

/**
 * Fetches PageSpeed Insights signals for a URL.
 * Uses MOBILE strategy to match mobile-first crawl philosophy.
 *
 * @param url        The URL to analyse
 * @param timeoutMs  Abort the fetch after this many milliseconds (default 30s)
 * @returns ExternalSignals on success, null on any failure
 */
export async function fetchPSISignals(url: string, timeoutMs: number): Promise<ExternalSignals | null> {
  const apiKey = process.env.PAGESPEED_API_KEY
  if (!apiKey) {
    return null
  }

  const psiUrl =
    `${PSI_BASE}?url=${encodeURIComponent(url)}` +
    `&strategy=MOBILE` +
    `&category=PERFORMANCE` +
    `&category=ACCESSIBILITY` +
    `&category=SEO` +
    `&category=BEST_PRACTICES` +
    `&key=${apiKey}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(psiUrl, { signal: controller.signal })
    clearTimeout(timer)

    if (!response.ok) {
      console.warn(`[psi] HTTP ${response.status} for ${url} — skipping`)
      return null
    }

    const data = await response.json()

    // Parse CWV from loadingExperience, falling back to originLoadingExperience
    const cwv = parseCWV(data)

    // Parse Lighthouse category scores
    const lighthouse = parseLighthouse(data)

    return { cwv, lighthouse }
  } catch (err) {
    clearTimeout(timer)
    // AbortError = timeout; other errors = network or parse failures
    if (err instanceof Error && err.name === 'AbortError') {
      // timeout — return null silently (caller knows about timeoutMs)
    } else {
      console.warn(`[psi] Error fetching PSI for ${url}:`, err instanceof Error ? err.message : err)
    }
    return null
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function parseCWV(data: Record<string, unknown>): CWVMetrics | null {
  try {
    // Try primary loadingExperience first
    const le = data.loadingExperience as Record<string, unknown> | undefined
    if (le && le.overall_category !== 'INSUFFICIENT_DATA') {
      const metrics = le.metrics as Record<string, unknown> | undefined
      const cwv = extractCWVFromMetrics(metrics, false)
      if (cwv) return cwv
    }

    // Fall back to originLoadingExperience if primary is insufficient or absent
    const ole = data.originLoadingExperience as Record<string, unknown> | undefined
    if (ole) {
      const metrics = ole.metrics as Record<string, unknown> | undefined
      const cwv = extractCWVFromMetrics(metrics, true)
      if (cwv) return cwv
    }

    return null
  } catch {
    return null
  }
}

function extractCWVFromMetrics(
  metrics: Record<string, unknown> | undefined,
  originFallback: boolean,
): CWVMetrics | null {
  if (!metrics) return null

  const lcpEntry = metrics.LARGEST_CONTENTFUL_PAINT_MS as Record<string, unknown> | undefined
  const clsEntry = metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE as Record<string, unknown> | undefined
  const inpEntry = metrics.INTERACTION_TO_NEXT_PAINT as Record<string, unknown> | undefined

  // If none of the metric keys exist, treat as no data
  if (!lcpEntry && !clsEntry && !inpEntry) return null

  const lcp_ms = typeof lcpEntry?.percentile === 'number' ? lcpEntry.percentile : null
  const cls_raw = typeof clsEntry?.percentile === 'number' ? clsEntry.percentile : null
  const inp_ms = typeof inpEntry?.percentile === 'number' ? inpEntry.percentile : null

  return { lcp_ms, cls_raw, inp_ms, origin_fallback: originFallback }
}

function parseLighthouse(data: Record<string, unknown>): LighthouseScores | null {
  try {
    const lr = data.lighthouseResult as Record<string, unknown> | undefined
    if (!lr) return null

    const cats = lr.categories as Record<string, Record<string, unknown>> | undefined
    if (!cats) return null

    const perf = cats.performance?.score
    const a11y = cats.accessibility?.score
    const seo = cats.seo?.score
    const bp = cats['best-practices']?.score

    if (
      typeof perf !== 'number' ||
      typeof a11y !== 'number' ||
      typeof seo !== 'number' ||
      typeof bp !== 'number'
    ) {
      return null
    }

    return {
      performance: perf,
      accessibility: a11y,
      seo,
      bestPractices: bp,
    }
  } catch {
    return null
  }
}
