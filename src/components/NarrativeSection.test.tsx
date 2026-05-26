// src/components/NarrativeSection.test.tsx
// RED test stubs for Phase 4 Wave 0 — contracts for NarrativeSection rendering.
// These tests WILL fail until src/components/NarrativeSection.tsx is created in Wave 2 (Plan 04-04).
// Covers: DASH-02

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NarrativeSection } from './NarrativeSection'

// Minimal NarrativeResult fixture — no DB or Prisma dependencies
const fixtureNarrative = {
  summary: 'Test summary',
  perceivedPerformance: 'Test perceived',
  technicalPerformance: 'Test technical',
  recommendations: ['Fix A', 'Fix B'],
}

describe('NarrativeSection', () => {
  it('renders the narrative summary text', () => {
    render(<NarrativeSection narrative={fixtureNarrative} />)
    expect(screen.getByText('Test summary')).toBeDefined()
  })

  it('renders the perceivedPerformance text', () => {
    render(<NarrativeSection narrative={fixtureNarrative} />)
    expect(screen.getByText('Test perceived')).toBeDefined()
  })

  it('renders the technicalPerformance text', () => {
    render(<NarrativeSection narrative={fixtureNarrative} />)
    expect(screen.getByText('Test technical')).toBeDefined()
  })

  it('renders each string in the recommendations array', () => {
    render(<NarrativeSection narrative={fixtureNarrative} />)
    expect(screen.getByText('Fix A')).toBeDefined()
    expect(screen.getByText('Fix B')).toBeDefined()
  })

  it('renders the "Overview" sub-label', () => {
    render(<NarrativeSection narrative={fixtureNarrative} />)
    expect(screen.getByText('Overview')).toBeDefined()
  })

  it('renders the "How it feels" sub-label', () => {
    render(<NarrativeSection narrative={fixtureNarrative} />)
    expect(screen.getByText('How it feels')).toBeDefined()
  })

  it('renders the "What the data says" sub-label', () => {
    render(<NarrativeSection narrative={fixtureNarrative} />)
    expect(screen.getByText('What the data says')).toBeDefined()
  })

  it('renders the "Recommended actions" sub-label', () => {
    render(<NarrativeSection narrative={fixtureNarrative} />)
    expect(screen.getByText('Recommended actions')).toBeDefined()
  })
})
