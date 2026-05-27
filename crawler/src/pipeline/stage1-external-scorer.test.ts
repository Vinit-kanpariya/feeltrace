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
// scoreAxeViolations — helpers
// ---------------------------------------------------------------------------

import type { AxeViolation } from '../lib/types'

function makeViolation(overrides: Partial<AxeViolation> & { id: string }): AxeViolation {
  return {
    id: overrides.id,
    impact: overrides.impact ?? 'minor',
    description: overrides.description ?? 'Test violation',
    helpUrl: overrides.helpUrl ?? 'https://axe-core.org',
    nodes: overrides.nodes ?? [{ target: '#btn', failureSummary: 'Fix this' }],
  }
}

// ---------------------------------------------------------------------------
// scoreAxeViolations — real implementation tests (Plan 06-02)
// ---------------------------------------------------------------------------

describe('scoreAxeViolations', () => {
  it('returns [] for empty input', () => {
    expect(scoreAxeViolations([])).toEqual([])
  })

  it('maps critical impact to severity 4', () => {
    const issues = scoreAxeViolations([makeViolation({ id: 'v1', impact: 'critical' })])
    expect(issues).toHaveLength(1)
    expect(issues[0].severity).toBe(4)
  })

  it('maps serious impact to severity 3', () => {
    const issues = scoreAxeViolations([makeViolation({ id: 'v1', impact: 'serious' })])
    expect(issues[0].severity).toBe(3)
  })

  it('maps moderate impact to severity 2', () => {
    const issues = scoreAxeViolations([makeViolation({ id: 'v1', impact: 'moderate' })])
    expect(issues[0].severity).toBe(2)
  })

  it('maps minor impact to severity 1', () => {
    const issues = scoreAxeViolations([makeViolation({ id: 'v1', impact: 'minor' })])
    expect(issues[0].severity).toBe(1)
  })

  it('caps output at 10 unique violation IDs when given 15', () => {
    const violations = Array.from({ length: 15 }, (_, i) =>
      makeViolation({ id: `violation-${i}`, impact: 'minor' })
    )
    const issues = scoreAxeViolations(violations)
    expect(issues).toHaveLength(10)
  })

  it('uses first 5 nodes in raw_evidence when violation has 8 nodes', () => {
    const nodes = Array.from({ length: 8 }, (_, i) => ({
      target: `#target-${i}`,
      failureSummary: 'Fix it',
    }))
    const issues = scoreAxeViolations([makeViolation({ id: 'v1', impact: 'serious', nodes })])
    expect(issues).toHaveLength(1)
    // raw_evidence should mention "5 node(s)" not 8
    expect(issues[0].raw_evidence).toContain('5 node(s)')
    // Should NOT contain target-5 through target-7 (only 0-4 included)
    expect(issues[0].raw_evidence).not.toContain('#target-5')
    expect(issues[0].raw_evidence).not.toContain('#target-6')
    expect(issues[0].raw_evidence).not.toContain('#target-7')
  })

  it('deduplicates violations with the same id — emits only one ScoredIssue', () => {
    const violations = [
      makeViolation({ id: 'duplicate', impact: 'critical' }),
      makeViolation({ id: 'duplicate', impact: 'minor' }),
    ]
    const issues = scoreAxeViolations(violations)
    expect(issues).toHaveLength(1)
    // First occurrence wins — severity should be 4 (critical)
    expect(issues[0].severity).toBe(4)
  })

  it('prefixes signal_source with axe dot notation', () => {
    const issues = scoreAxeViolations([makeViolation({ id: 'color-contrast' })])
    expect(issues[0].signal_source).toBe('axe.color-contrast')
  })

  it('emits viewport desktop for all violations', () => {
    const violations = [
      makeViolation({ id: 'v1', impact: 'critical' }),
      makeViolation({ id: 'v2', impact: 'minor' }),
    ]
    const issues = scoreAxeViolations(violations)
    expect(issues.every((i) => i.viewport === 'desktop')).toBe(true)
  })
})
