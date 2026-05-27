/**
 * crawler/src/pipeline/stage1-external-scorer.test.ts
 * Unit tests for CWV + Lighthouse threshold scoring.
 * Pure unit tests — no fetch mocks needed.
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest'
import { scoreExternalSignals, scoreAxeViolations } from './stage1-external-scorer'
import type { ExternalSignals } from '../lib/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSignals(overrides: Partial<ExternalSignals> = {}): ExternalSignals {
  return {
    cwv: null,
    lighthouse: null,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// scoreExternalSignals — null inputs
// ---------------------------------------------------------------------------

describe('scoreExternalSignals', () => {
  it('returns [] when both cwv and lighthouse are null', () => {
    const result = scoreExternalSignals(makeSignals())
    expect(result).toEqual([])
  })

  // ---------------------------------------------------------------------------
  // LCP rules
  // ---------------------------------------------------------------------------

  it('LCP Critical triggered above 4000ms', () => {
    const signals = makeSignals({
      cwv: { lcp_ms: 4001, cls_raw: null, inp_ms: null, origin_fallback: false },
    })
    const issues = scoreExternalSignals(signals)
    expect(issues).toHaveLength(1)
    expect(issues[0].signal_source).toBe('cwv.lcp_ms')
    expect(issues[0].severity).toBe(4)
    expect(issues[0].viewport).toBe('both')
  })

  it('LCP High triggered above 2500ms (but not above 4000ms)', () => {
    const signals = makeSignals({
      cwv: { lcp_ms: 3000, cls_raw: null, inp_ms: null, origin_fallback: false },
    })
    const issues = scoreExternalSignals(signals)
    expect(issues).toHaveLength(1)
    expect(issues[0].signal_source).toBe('cwv.lcp_ms')
    expect(issues[0].severity).toBe(3)
  })

  it('emits only highest severity when both LCP thresholds exceeded (lcp_ms=5000)', () => {
    const signals = makeSignals({
      cwv: { lcp_ms: 5000, cls_raw: null, inp_ms: null, origin_fallback: false },
    })
    const issues = scoreExternalSignals(signals).filter((i) => i.signal_source === 'cwv.lcp_ms')
    expect(issues).toHaveLength(1)
    expect(issues[0].severity).toBe(4)
  })

  it('LCP at exactly 4000ms does NOT trigger Critical', () => {
    const signals = makeSignals({
      cwv: { lcp_ms: 4000, cls_raw: null, inp_ms: null, origin_fallback: false },
    })
    const issues = scoreExternalSignals(signals).filter((i) => i.signal_source === 'cwv.lcp_ms')
    // 4000 is not > 4000, but it is > 2500 so High should trigger
    expect(issues).toHaveLength(1)
    expect(issues[0].severity).toBe(3)
  })

  // ---------------------------------------------------------------------------
  // CLS rules
  // ---------------------------------------------------------------------------

  it('CLS Critical triggered above raw 25', () => {
    const signals = makeSignals({
      cwv: { lcp_ms: null, cls_raw: 26, inp_ms: null, origin_fallback: false },
    })
    const issues = scoreExternalSignals(signals)
    expect(issues).toHaveLength(1)
    expect(issues[0].signal_source).toBe('cwv.cls_raw')
    expect(issues[0].severity).toBe(4)
  })

  it('CLS High triggered above raw 10 (but not above 25)', () => {
    const signals = makeSignals({
      cwv: { lcp_ms: null, cls_raw: 15, inp_ms: null, origin_fallback: false },
    })
    const issues = scoreExternalSignals(signals)
    expect(issues).toHaveLength(1)
    expect(issues[0].signal_source).toBe('cwv.cls_raw')
    expect(issues[0].severity).toBe(3)
  })

  // ---------------------------------------------------------------------------
  // INP rules
  // ---------------------------------------------------------------------------

  it('INP Critical triggered above 500ms', () => {
    const signals = makeSignals({
      cwv: { lcp_ms: null, cls_raw: null, inp_ms: 501, origin_fallback: false },
    })
    const issues = scoreExternalSignals(signals)
    expect(issues).toHaveLength(1)
    expect(issues[0].signal_source).toBe('cwv.inp_ms')
    expect(issues[0].severity).toBe(4)
  })

  it('INP High triggered above 200ms (but not above 500ms)', () => {
    const signals = makeSignals({
      cwv: { lcp_ms: null, cls_raw: null, inp_ms: 350, origin_fallback: false },
    })
    const issues = scoreExternalSignals(signals)
    expect(issues).toHaveLength(1)
    expect(issues[0].signal_source).toBe('cwv.inp_ms')
    expect(issues[0].severity).toBe(3)
  })

  it('skips null CWV metric values', () => {
    const signals = makeSignals({
      cwv: { lcp_ms: null, cls_raw: null, inp_ms: null, origin_fallback: false },
    })
    const issues = scoreExternalSignals(signals)
    expect(issues).toEqual([])
  })

  // ---------------------------------------------------------------------------
  // Lighthouse rules
  // ---------------------------------------------------------------------------

  it('Lighthouse perf Critical below 0.5', () => {
    const signals = makeSignals({
      lighthouse: { performance: 0.45, accessibility: 1.0, seo: 1.0, bestPractices: 1.0 },
    })
    const issues = scoreExternalSignals(signals).filter((i) => i.signal_source === 'lighthouse.performance')
    expect(issues).toHaveLength(1)
    expect(issues[0].severity).toBe(4)
  })

  it('Lighthouse perf High below 0.7 (but not below 0.5)', () => {
    const signals = makeSignals({
      lighthouse: { performance: 0.6, accessibility: 1.0, seo: 1.0, bestPractices: 1.0 },
    })
    const issues = scoreExternalSignals(signals).filter((i) => i.signal_source === 'lighthouse.performance')
    expect(issues).toHaveLength(1)
    expect(issues[0].severity).toBe(3)
  })

  it('Lighthouse a11y High below 0.8', () => {
    const signals = makeSignals({
      lighthouse: { performance: 1.0, accessibility: 0.75, seo: 1.0, bestPractices: 1.0 },
    })
    const issues = scoreExternalSignals(signals).filter((i) => i.signal_source === 'lighthouse.accessibility')
    expect(issues).toHaveLength(1)
    expect(issues[0].severity).toBe(3)
  })

  it('Lighthouse a11y Medium below 0.9 (but not below 0.8)', () => {
    const signals = makeSignals({
      lighthouse: { performance: 1.0, accessibility: 0.85, seo: 1.0, bestPractices: 1.0 },
    })
    const issues = scoreExternalSignals(signals).filter((i) => i.signal_source === 'lighthouse.accessibility')
    expect(issues).toHaveLength(1)
    expect(issues[0].severity).toBe(2)
  })

  it('Lighthouse seo Medium below 0.7', () => {
    const signals = makeSignals({
      lighthouse: { performance: 1.0, accessibility: 1.0, seo: 0.65, bestPractices: 1.0 },
    })
    const issues = scoreExternalSignals(signals).filter((i) => i.signal_source === 'lighthouse.seo')
    expect(issues).toHaveLength(1)
    expect(issues[0].severity).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// scoreAxeViolations stub
// ---------------------------------------------------------------------------

describe('scoreAxeViolations', () => {
  it('returns [] (stub — full tests in Plan 06-02)', () => {
    const result = scoreAxeViolations([])
    expect(result).toEqual([])
  })
})
