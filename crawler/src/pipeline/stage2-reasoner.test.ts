// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { Stage2OutputSchema, parseStage2Output } from './stage2-reasoner'
import type { ScoredIssue } from './types'

// Fixture: two valid scored issues used across tests
const TWO_ISSUES: ScoredIssue[] = [
  {
    category: 'perceived-perf',
    signal_source: 'networkSignals.firstRequestTTFB (mobile)',
    severity: 4,
    raw_evidence: '2400ms (threshold: >2000ms Critical)',
    viewport: 'mobile',
  },
  {
    category: 'technical-perf',
    signal_source: 'jsSignals.totalJSBytes (mobile)',
    severity: 3,
    raw_evidence: '520000 bytes (threshold: >500000 Critical)',
    viewport: 'mobile',
  },
]

describe('Stage2OutputSchema', () => {
  it('passes for valid input with 2 enriched_issues and 2 causal_edges', () => {
    const valid = {
      enriched_issues: [
        { index: 0, technical_description: 'TTFB of 2400ms means the server takes over 2 seconds before the first byte arrives.' },
        { index: 1, technical_description: 'Over 500KB of JS must be parsed and compiled before interactivity.' },
      ],
      causal_edges: [
        {
          from_index: 0,
          to_index: 1,
          mechanism: 'ttfb-delays-fcp',
          relationship: 'causes',
          confidence: 'high',
          explanation: 'Slow TTFB delays FCP, compounding the JS parsing burden.',
        },
        {
          from_index: 1,
          to_index: 0,
          mechanism: 'large-js-bundle-delays-tti',
          relationship: 'amplifies',
          confidence: 'medium',
          explanation: 'Large JS bundle amplifies the perceived slowness from TTFB.',
        },
      ],
    }
    expect(() => Stage2OutputSchema.parse(valid)).not.toThrow()
  })

  it('fails parse when mechanism is not in PERMITTED_MECHANISMS', () => {
    const invalid = {
      enriched_issues: [
        { index: 0, technical_description: 'Some description here.' },
      ],
      causal_edges: [
        {
          from_index: 0,
          to_index: 1,
          mechanism: 'invented-mechanism-not-in-list',
          relationship: 'causes',
          confidence: 'high',
          explanation: 'Some explanation.',
        },
      ],
    }
    expect(() => Stage2OutputSchema.parse(invalid)).toThrow()
  })

  it('fails parse when causal_edges array has more than 5 items', () => {
    const edge = {
      from_index: 0,
      to_index: 1,
      mechanism: 'ttfb-delays-fcp',
      relationship: 'causes',
      confidence: 'high',
      explanation: 'Explanation.',
    }
    const invalid = {
      enriched_issues: [
        { index: 0, technical_description: 'Some description.' },
      ],
      causal_edges: [edge, edge, edge, edge, edge, edge], // 6 items
    }
    expect(() => Stage2OutputSchema.parse(invalid)).toThrow()
  })

  it('fails parse when technical_description exceeds 500 characters', () => {
    const longDesc = 'A'.repeat(501)
    const invalid = {
      enriched_issues: [
        { index: 0, technical_description: longDesc },
      ],
      causal_edges: [],
    }
    expect(() => Stage2OutputSchema.parse(invalid)).toThrow()
  })
})

describe('parseStage2Output', () => {
  it('removes self-edges where from_index === to_index', () => {
    const raw = {
      enriched_issues: [
        { index: 0, technical_description: 'TTFB description.' },
        { index: 1, technical_description: 'JS bundle description.' },
      ],
      causal_edges: [
        {
          from_index: 0,
          to_index: 0, // self-edge
          mechanism: 'ttfb-delays-fcp',
          relationship: 'causes',
          confidence: 'high',
          explanation: 'Self-loop — should be removed.',
        },
        {
          from_index: 0,
          to_index: 1, // valid edge
          mechanism: 'ttfb-delays-fcp',
          relationship: 'causes',
          confidence: 'high',
          explanation: 'Valid edge.',
        },
      ],
    }
    const { edges } = parseStage2Output(raw, TWO_ISSUES)
    expect(edges).toHaveLength(1)
    expect(edges[0].fromIndex).toBe(0)
    expect(edges[0].toIndex).toBe(1)
  })

  it('discards enriched_issues with index >= scoredIssues.length', () => {
    const raw = {
      enriched_issues: [
        { index: 0, technical_description: 'Valid description.' },
        { index: 5, technical_description: 'Out-of-range index — should be discarded.' }, // index 5 but only 2 issues
      ],
      causal_edges: [],
    }
    const { enrichedIssues } = parseStage2Output(raw, TWO_ISSUES)
    expect(enrichedIssues).toHaveLength(1)
    expect(enrichedIssues[0].technical_description).toBe('Valid description.')
  })

  it('retains valid non-self edges in output', () => {
    const raw = {
      enriched_issues: [
        { index: 0, technical_description: 'TTFB causes users to wait.' },
        { index: 1, technical_description: 'Large JS delays interactivity.' },
      ],
      causal_edges: [
        {
          from_index: 0,
          to_index: 1,
          mechanism: 'ttfb-delays-fcp',
          relationship: 'causes',
          confidence: 'medium',
          explanation: 'TTFB and JS parsing stack up.',
        },
      ],
    }
    const { edges } = parseStage2Output(raw, TWO_ISSUES)
    expect(edges).toHaveLength(1)
    expect(edges[0].mechanism).toBe('ttfb-delays-fcp')
    expect(edges[0].confidence).toBe('medium')
  })
})
