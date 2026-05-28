import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IssueCard } from './IssueCard'

const base = {
  id: 'i1',
  category: 'performance',
  signal_source: 'network HAR',
  severity: 4,
  raw_evidence: 'LCP 4.8s on mobile',
  technical_description: 'Render-blocking stylesheet delays FMP',
  fix_suggestion: '',
  severity_justification: '',
}

describe('IssueCard', () => {
  it('renders the technical description', () => {
    render(<IssueCard issue={base} />)
    expect(screen.getByText('Render-blocking stylesheet delays FMP')).toBeDefined()
  })

  it('renders the raw evidence text', () => {
    render(<IssueCard issue={base} />)
    expect(screen.getByText('LCP 4.8s on mobile')).toBeDefined()
  })

  it('renders the signal source', () => {
    render(<IssueCard issue={base} />)
    expect(screen.getByText('network HAR')).toBeDefined()
  })

  it('does not render the fix callout when fix_suggestion is empty string', () => {
    render(<IssueCard issue={{ ...base, fix_suggestion: '' }} />)
    expect(screen.queryByText('How to fix')).toBeNull()
  })

  it('does not render the fix callout when fix_suggestion is absent', () => {
    const { fix_suggestion: _f, ...noFix } = base
    render(<IssueCard issue={noFix} />)
    expect(screen.queryByText('How to fix')).toBeNull()
  })

  it('renders the fix callout label when fix_suggestion is present', () => {
    render(<IssueCard issue={{ ...base, fix_suggestion: 'Add preload hint to stylesheet' }} />)
    expect(screen.getByText('How to fix')).toBeDefined()
  })

  it('renders the fix_suggestion text inside the callout', () => {
    render(<IssueCard issue={{ ...base, fix_suggestion: 'Add preload hint to stylesheet' }} />)
    expect(screen.getByText('Add preload hint to stylesheet')).toBeDefined()
  })

  it('renders severity_justification inside the evidence block when present', () => {
    render(<IssueCard issue={{ ...base, severity_justification: 'Impacts 60% of mobile users' }} />)
    expect(screen.getByText('Impacts 60% of mobile users')).toBeDefined()
  })

  it('does not render severity_justification row when it is empty', () => {
    render(<IssueCard issue={{ ...base, severity_justification: '' }} />)
    expect(screen.queryByText('Impacts 60% of mobile users')).toBeNull()
  })
})
