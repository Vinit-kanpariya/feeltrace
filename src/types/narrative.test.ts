// src/types/narrative.test.ts
// RED test stubs for Phase 4 Wave 0 — contracts for SEVERITY_LABELS and CATEGORY_LABELS.
// These tests WILL fail until src/types/narrative.ts is created in Wave 1 (Plan 04-02).
// Covers: DASH-01

import { describe, it, expect } from 'vitest'
import { SEVERITY_LABELS, CATEGORY_LABELS } from './narrative'

describe('SEVERITY_LABELS', () => {
  it('maps severity 1 to "Low"', () => {
    expect(SEVERITY_LABELS[1]).toBe('Low')
  })

  it('maps severity 2 to "Medium"', () => {
    expect(SEVERITY_LABELS[2]).toBe('Medium')
  })

  it('maps severity 3 to "High"', () => {
    expect(SEVERITY_LABELS[3]).toBe('High')
  })

  it('maps severity 4 to "Critical"', () => {
    expect(SEVERITY_LABELS[4]).toBe('Critical')
  })
})

describe('CATEGORY_LABELS', () => {
  it('maps "perceived-perf" to "Perceived Performance"', () => {
    expect(CATEGORY_LABELS['perceived-perf']).toBe('Perceived Performance')
  })

  it('maps "technical-perf" to "Technical Performance"', () => {
    expect(CATEGORY_LABELS['technical-perf']).toBe('Technical Performance')
  })

  it('maps "accessibility" to "Accessibility"', () => {
    expect(CATEGORY_LABELS['accessibility']).toBe('Accessibility')
  })
})
