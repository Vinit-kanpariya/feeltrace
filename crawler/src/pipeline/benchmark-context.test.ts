// @vitest-environment node
// crawler/src/pipeline/benchmark-context.test.ts
import { describe, it, expect } from 'vitest'
import { buildBenchmarkContext } from './benchmark-context'
import type { CWVMetrics } from '../lib/types'

// ---------------------------------------------------------------------------
// Factory helper
// ---------------------------------------------------------------------------

function makeCWV(overrides: Partial<CWVMetrics> = {}): CWVMetrics {
  return {
    lcp_ms: null,
    cls_raw: null,
    inp_ms: null,
    origin_fallback: false,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// buildBenchmarkContext tests
// ---------------------------------------------------------------------------

describe('buildBenchmarkContext', () => {
  it("returns '' when cwv is null (regardless of pageType)", () => {
    expect(buildBenchmarkContext(null, 'e-commerce')).toBe('')
    expect(buildBenchmarkContext(null, 'unknown')).toBe('')
  })

  it("includes 'GOOD' when lcp_ms is 2000 (≤ 2500 threshold)", () => {
    const result = buildBenchmarkContext(makeCWV({ lcp_ms: 2000 }), 'unknown')
    expect(result).toContain('GOOD')
  })

  it("includes 'POOR' and a ratio string like '2.0×' when lcp_ms is 5000 (> 4000 threshold)", () => {
    const result = buildBenchmarkContext(makeCWV({ lcp_ms: 5000 }), 'unknown')
    expect(result).toContain('POOR')
    expect(result).toContain('2.0×')
  })

  it("includes 'NEEDS IMPROVEMENT' when lcp_ms is 3000 (> 2500, ≤ 4000)", () => {
    const result = buildBenchmarkContext(makeCWV({ lcp_ms: 3000 }), 'unknown')
    expect(result).toContain('NEEDS IMPROVEMENT')
  })

  it('includes the origin_fallback note when origin_fallback is true', () => {
    const result = buildBenchmarkContext(makeCWV({ lcp_ms: 2000, origin_fallback: true }), 'unknown')
    expect(result).toContain('origin')
  })

  it('includes CLS status line when cls_raw is non-null', () => {
    const result = buildBenchmarkContext(makeCWV({ cls_raw: 5 }), 'unknown')
    expect(result).toContain('CLS')
  })
})
