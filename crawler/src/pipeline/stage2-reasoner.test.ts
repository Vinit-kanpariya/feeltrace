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

// Helper: minimal valid enriched issue item (all required fields)
function validEnrichedItem(index: number, overrides?: Partial<{
  technical_description: string
  fix_suggestion: string
  severity_justification: string
}>) {
  return {
    index,
    technical_description: 'Default technical description for testing.',
    fix_suggestion: 'Set Cache-Control: max-age=300 on all API responses to reduce TTFB.',
    severity_justification: 'Users on mobile connections will see a blank screen for 2+ seconds, increasing bounce rate.',
    ...overrides,
  }
}

describe('Stage2OutputSchema', () => {
  it('passes for valid input with 2 enriched_issues and 2 causal_edges', () => {
    const valid = {
      enriched_issues: [
        validEnrichedItem(0, { technical_description: 'TTFB of 2400ms means the server takes over 2 seconds before the first byte arrives.' }),
        validEnrichedItem(1, { technical_description: 'Over 500KB of JS must be parsed and compiled before interactivity.' }),
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
        validEnrichedItem(0, { technical_description: 'Some description here.' }),
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
        validEnrichedItem(0, { technical_description: 'Some description.' }),
      ],
      causal_edges: [edge, edge, edge, edge, edge, edge], // 6 items
    }
    expect(() => Stage2OutputSchema.parse(invalid)).toThrow()
  })

  it('fails parse when technical_description exceeds 500 characters', () => {
    const longDesc = 'A'.repeat(501)
    const invalid = {
      enriched_issues: [
        validEnrichedItem(0, { technical_description: longDesc }),
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
        validEnrichedItem(0, { technical_description: 'TTFB description.' }),
        validEnrichedItem(1, { technical_description: 'JS bundle description.' }),
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
        validEnrichedItem(0, { technical_description: 'Valid description.' }),
        validEnrichedItem(5, { technical_description: 'Out-of-range index — should be discarded.' }), // index 5 but only 2 issues
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
        validEnrichedItem(0, { technical_description: 'TTFB causes users to wait.' }),
        validEnrichedItem(1, { technical_description: 'Large JS delays interactivity.' }),
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

// ---------------------------------------------------------------------------
// New tests for AI-01 (fix_suggestion) and AI-02 (severity_justification)
// ---------------------------------------------------------------------------

describe('Stage2OutputSchema — fix_suggestion and severity_justification', () => {
  // Test A: parse succeeds when both new fields are present and non-empty
  it('Test A: passes when fix_suggestion and severity_justification are present and non-empty', () => {
    const valid = {
      enriched_issues: [
        {
          index: 0,
          technical_description: 'TTFB of 2400ms means the server takes over 2 seconds.',
          fix_suggestion: 'Enable server-side caching with Cache-Control: max-age=300 on all API responses.',
          severity_justification: 'Users on mobile connections will see a blank screen for 2+ seconds, increasing bounce rate by an estimated 20-30%.',
        },
      ],
      causal_edges: [],
    }
    expect(() => Stage2OutputSchema.parse(valid)).not.toThrow()
  })

  // Test B: parse fails when fix_suggestion is missing
  it('Test B: throws when fix_suggestion is missing from an enriched_issues item', () => {
    const invalid = {
      enriched_issues: [
        {
          index: 0,
          technical_description: 'TTFB of 2400ms means the server takes over 2 seconds.',
          // fix_suggestion intentionally omitted
          severity_justification: 'Users will experience slow load times.',
        },
      ],
      causal_edges: [],
    }
    expect(() => Stage2OutputSchema.parse(invalid)).toThrow()
  })

  // Test C: parse fails when fix_suggestion exceeds 300 characters
  it('Test C: throws when fix_suggestion.length > 300', () => {
    const longFixSuggestion = 'A'.repeat(301)
    const invalid = {
      enriched_issues: [
        {
          index: 0,
          technical_description: 'TTFB description.',
          fix_suggestion: longFixSuggestion,
          severity_justification: 'User impact description.',
        },
      ],
      causal_edges: [],
    }
    expect(() => Stage2OutputSchema.parse(invalid)).toThrow()
  })

  // Test D: parse fails (refine rejects) when fix_suggestion starts with 'Consider '
  it('Test D: throws when fix_suggestion starts with "Consider "', () => {
    const invalid = {
      enriched_issues: [
        {
          index: 0,
          technical_description: 'TTFB description.',
          fix_suggestion: 'Consider lazy-loading images to improve LCP.',
          severity_justification: 'User impact description.',
        },
      ],
      causal_edges: [],
    }
    expect(() => Stage2OutputSchema.parse(invalid)).toThrow()
  })

  // Test E: parse fails (refine rejects) when fix_suggestion starts with 'You might'
  it('Test E: throws when fix_suggestion starts with "You might"', () => {
    const invalid = {
      enriched_issues: [
        {
          index: 0,
          technical_description: 'TTFB description.',
          fix_suggestion: 'You might want to reduce render-blocking scripts.',
          severity_justification: 'User impact description.',
        },
      ],
      causal_edges: [],
    }
    expect(() => Stage2OutputSchema.parse(invalid)).toThrow()
  })
})

describe('parseStage2Output — fix_suggestion and severity_justification propagation', () => {
  // Test F: parseStage2Output result includes fix_suggestion and severity_justification on each enriched issue
  it('Test F: includes fix_suggestion and severity_justification on each enriched issue', () => {
    const raw = {
      enriched_issues: [
        {
          index: 0,
          technical_description: 'TTFB causes users to wait.',
          fix_suggestion: 'Add a CDN layer and enable HTTP/2 server push for critical assets.',
          severity_justification: 'A 2.4s TTFB pushes LCP past the 4s poor threshold — pages with LCP > 4s see 24% higher bounce rates.',
        },
        {
          index: 1,
          technical_description: 'Large JS delays interactivity.',
          fix_suggestion: 'Split the main bundle with dynamic import() at route boundaries to reduce initial JS payload below 200KB.',
          severity_justification: 'Users on 3G connections wait 5+ seconds for interactivity — 3x more likely to abandon versus a sub-200ms INP.',
        },
      ],
      causal_edges: [],
    }
    const { enrichedIssues } = parseStage2Output(raw, TWO_ISSUES)
    expect(enrichedIssues).toHaveLength(2)
    expect(enrichedIssues[0].fix_suggestion).toBe('Add a CDN layer and enable HTTP/2 server push for critical assets.')
    expect(enrichedIssues[0].severity_justification).toBe('A 2.4s TTFB pushes LCP past the 4s poor threshold — pages with LCP > 4s see 24% higher bounce rates.')
    expect(enrichedIssues[1].fix_suggestion).toBe('Split the main bundle with dynamic import() at route boundaries to reduce initial JS payload below 200KB.')
    expect(enrichedIssues[1].severity_justification).toBe('Users on 3G connections wait 5+ seconds for interactivity — 3x more likely to abandon versus a sub-200ms INP.')
  })
})
