/**
 * crawler/src/lib/psi.test.ts
 * Unit tests for the PageSpeed Insights client.
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// We import after setting env vars so we can control PAGESPEED_API_KEY per test
// Use dynamic import inside each test to get a fresh module when needed.

// Minimal valid PSI response fixture
function makePSIResponse(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    loadingExperience: {
      overall_category: 'AVERAGE',
      metrics: {
        LARGEST_CONTENTFUL_PAINT_MS: { percentile: 3200 },
        CUMULATIVE_LAYOUT_SHIFT_SCORE: { percentile: 8 },
        INTERACTION_TO_NEXT_PAINT: { percentile: 180 },
      },
    },
    lighthouseResult: {
      categories: {
        performance: { score: 0.62 },
        accessibility: { score: 0.88 },
        seo: { score: 0.75 },
        'best-practices': { score: 0.92 },
      },
    },
    ...overrides,
  }
}

describe('fetchPSISignals', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns null when PAGESPEED_API_KEY is missing', async () => {
    vi.stubEnv('PAGESPEED_API_KEY', '')
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const { fetchPSISignals } = await import('./psi')
    const result = await fetchPSISignals('https://example.com', 5000)

    expect(result).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('returns null on fetch timeout', async () => {
    vi.stubEnv('PAGESPEED_API_KEY', 'test-key-123')

    // Simulate a fetch that detects the AbortSignal being aborted and rejects with AbortError
    const abortFetch = vi.fn((_, opts: { signal?: AbortSignal }) => {
      return new Promise<never>((_, reject) => {
        const signal = opts?.signal
        if (signal) {
          signal.addEventListener('abort', () => {
            const err = new Error('The operation was aborted')
            err.name = 'AbortError'
            reject(err)
          })
        }
      })
    })
    vi.stubGlobal('fetch', abortFetch)

    const { fetchPSISignals } = await import('./psi')
    // 50ms timeout — AbortController fires after 50ms, abortFetch rejects with AbortError
    const result = await fetchPSISignals('https://example.com', 50)

    expect(result).toBeNull()
  }, 10_000)

  it('parses loadingExperience metrics and lighthouse scores correctly', async () => {
    vi.stubEnv('PAGESPEED_API_KEY', 'test-key-123')

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makePSIResponse(),
    })
    vi.stubGlobal('fetch', mockFetch)

    const { fetchPSISignals } = await import('./psi')
    const result = await fetchPSISignals('https://example.com', 5000)

    expect(result).not.toBeNull()
    expect(result!.cwv).toEqual({
      lcp_ms: 3200,
      cls_raw: 8,
      inp_ms: 180,
      origin_fallback: false,
    })
    expect(result!.lighthouse).toEqual({
      performance: 0.62,
      accessibility: 0.88,
      seo: 0.75,
      bestPractices: 0.92,
    })
  })

  it('uses originLoadingExperience when primary is INSUFFICIENT_DATA', async () => {
    vi.stubEnv('PAGESPEED_API_KEY', 'test-key-123')

    const response = makePSIResponse({
      loadingExperience: {
        overall_category: 'INSUFFICIENT_DATA',
        metrics: {},
      },
      originLoadingExperience: {
        overall_category: 'SLOW',
        metrics: {
          LARGEST_CONTENTFUL_PAINT_MS: { percentile: 4800 },
          CUMULATIVE_LAYOUT_SHIFT_SCORE: { percentile: 30 },
          INTERACTION_TO_NEXT_PAINT: { percentile: 600 },
        },
      },
    })

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => response,
    })
    vi.stubGlobal('fetch', mockFetch)

    const { fetchPSISignals } = await import('./psi')
    const result = await fetchPSISignals('https://example.com', 5000)

    expect(result).not.toBeNull()
    expect(result!.cwv).toEqual({
      lcp_ms: 4800,
      cls_raw: 30,
      inp_ms: 600,
      origin_fallback: true,
    })
  })

  it('parses best-practices score via bracket notation', async () => {
    vi.stubEnv('PAGESPEED_API_KEY', 'test-key-123')

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makePSIResponse(),
    })
    vi.stubGlobal('fetch', mockFetch)

    const { fetchPSISignals } = await import('./psi')
    const result = await fetchPSISignals('https://example.com', 5000)

    expect(result!.lighthouse!.bestPractices).toBe(0.92)
  })

  it('returns null cwv when loadingExperience.metrics is empty object', async () => {
    vi.stubEnv('PAGESPEED_API_KEY', 'test-key-123')

    const response = makePSIResponse({
      loadingExperience: {
        overall_category: 'AVERAGE',
        metrics: {}, // empty — no metric keys
      },
      // No originLoadingExperience
    })

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => response,
    })
    vi.stubGlobal('fetch', mockFetch)

    const { fetchPSISignals } = await import('./psi')
    const result = await fetchPSISignals('https://example.com', 5000)

    expect(result).not.toBeNull()
    // CWV should be null because no metric keys present
    expect(result!.cwv).toBeNull()
    // Lighthouse should still parse
    expect(result!.lighthouse).not.toBeNull()
  })
})
