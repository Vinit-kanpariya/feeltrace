// src/app/results/[jobId]/page.test.tsx
// Wave 0 RED stubs for CRAWL-03 — contracts for per-page accordion rendering.
// These tests WILL fail until src/components/PageAccordionSection.tsx is created in Plan 08-06.

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageAccordionSection } from '@/components/PageAccordionSection'

// ---------------------------------------------------------------------------
// Fixture — minimal page object matching PageAccordionSectionProps.
// Covers all fields the component will receive once implemented.
// ---------------------------------------------------------------------------
const fixturePage = {
  id: 'page-1',
  url: 'https://example.com/about',
  page_index: 0,
  narrative: {
    summary: 'About page summary',
    perceivedPerformance: 'Fast',
    technicalPerformance: 'Efficient',
    recommendations: [],
  },
  screenshot_url: null,
  issues: [
    {
      id: 'issue-1',
      category: 'performance',
      signal_source: 'networkSignals.renderBlockingCount',
      severity: 3,
      raw_evidence: 'Blocking scripts found',
      technical_description: 'Render-blocking JS',
      fix_suggestion: 'Defer scripts',
      severity_justification: 'High impact',
    },
  ],
  edges: [],
}

// ---------------------------------------------------------------------------
// PageAccordionSection tests (CRAWL-03)
// ---------------------------------------------------------------------------
describe('PageAccordionSection', () => {
  it('CRAWL-03: renders accordion section when crawledPages.length > 0', () => {
    render(<PageAccordionSection page={fixturePage} defaultOpen={true} />)
    expect(screen.getByText('https://example.com/about')).toBeDefined()
  })

  it('CRAWL-03: does not render accordion when crawledPages.length === 0 (backward compat)', () => {
    const crawledPages: typeof fixturePage[] = []
    const { container } = render(
      <div>
        {crawledPages.length > 0 && <PageAccordionSection page={crawledPages[0]} />}
      </div>
    )
    expect(container.querySelector('[data-testid="accordion"]') ?? null).toBeNull()
  })
})
