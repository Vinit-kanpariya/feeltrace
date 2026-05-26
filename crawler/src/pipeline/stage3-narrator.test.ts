// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { parseNarrativeOutput } from './stage3-narrator'

// Full fixture with all 4 section markers
const FIXTURE_NARRATIVE = `
[SUMMARY]
The site has significant performance issues affecting both perceived and technical metrics.

[PERCEIVED PERFORMANCE]
Users experience the page as slow and unresponsive. The initial page load feels like it hangs
before anything appears, creating a frustrating first impression.

[TECHNICAL PERFORMANCE]
TTFB is 2400ms, well above the 800ms threshold. Render-blocking JS count is 4, which delays
Time To Interactive. Total JS bundle size is 620KB on mobile.

[RECOMMENDATIONS]
- Enable CDN caching to reduce TTFB for geographically distributed users
- Defer non-critical JavaScript to unblock the main render path
- Implement code splitting to reduce the initial JS bundle size
`

// Fixture with [PERCEIVED PERFORMANCE] section omitted
const FIXTURE_MISSING_SECTION = `
[SUMMARY]
The site has moderate performance issues.

[TECHNICAL PERFORMANCE]
TTFB is 1200ms. Render-blocking count is 2.

[RECOMMENDATIONS]
- Optimize server response time
`

// Fixture with [RECOMMENDATIONS] section omitted
const FIXTURE_MISSING_RECOMMENDATIONS = `
[SUMMARY]
The site performs well overall.

[PERCEIVED PERFORMANCE]
Users notice a slight delay on initial load but the experience is generally smooth.

[TECHNICAL PERFORMANCE]
TTFB is 600ms. No render-blocking resources detected.
`

describe('parseNarrativeOutput', () => {
  describe('AI-03: section parsing with all 4 markers', () => {
    it('parses all 4 sections from a complete narrative', () => {
      const result = parseNarrativeOutput(FIXTURE_NARRATIVE)
      expect(result.summary).toBeTruthy()
      expect(result.perceivedPerformance).toBeTruthy()
      expect(result.technicalPerformance).toBeTruthy()
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('summary field contains text from [SUMMARY] section (trimmed)', () => {
      const result = parseNarrativeOutput(FIXTURE_NARRATIVE)
      expect(result.summary).toContain('significant performance issues')
      expect(result.summary).not.toMatch(/^\s/)
      expect(result.summary).not.toMatch(/\s$/)
    })

    it('perceivedPerformance field contains text from [PERCEIVED PERFORMANCE] section', () => {
      const result = parseNarrativeOutput(FIXTURE_NARRATIVE)
      expect(result.perceivedPerformance).toContain('Users experience the page as slow')
    })

    it('technicalPerformance field contains text from [TECHNICAL PERFORMANCE] section', () => {
      const result = parseNarrativeOutput(FIXTURE_NARRATIVE)
      expect(result.technicalPerformance).toContain('TTFB is 2400ms')
    })

    it('recommendations field is a string array with bullet prefix stripped', () => {
      const result = parseNarrativeOutput(FIXTURE_NARRATIVE)
      expect(Array.isArray(result.recommendations)).toBe(true)
      // Verify bullet prefix is stripped
      for (const rec of result.recommendations) {
        expect(rec).not.toMatch(/^- /)
        expect(rec).not.toMatch(/^\* /)
      }
      // Verify content is correct
      expect(result.recommendations).toContain('Enable CDN caching to reduce TTFB for geographically distributed users')
    })
  })

  describe('AI-03: missing section robustness', () => {
    it('returns empty string for perceivedPerformance when [PERCEIVED PERFORMANCE] section is absent', () => {
      const result = parseNarrativeOutput(FIXTURE_MISSING_SECTION)
      expect(result.perceivedPerformance).toBe('')
    })

    it('does not throw when [PERCEIVED PERFORMANCE] section is missing', () => {
      expect(() => parseNarrativeOutput(FIXTURE_MISSING_SECTION)).not.toThrow()
    })

    it('returns empty array for recommendations when [RECOMMENDATIONS] section is absent', () => {
      const result = parseNarrativeOutput(FIXTURE_MISSING_RECOMMENDATIONS)
      expect(result.recommendations).toEqual([])
    })

    it('does not throw when [RECOMMENDATIONS] section is missing', () => {
      expect(() => parseNarrativeOutput(FIXTURE_MISSING_RECOMMENDATIONS)).not.toThrow()
    })
  })

  describe('AI-04: perceived vs technical field extraction', () => {
    it('perceivedPerformance is populated when [PERCEIVED PERFORMANCE] section is present', () => {
      const result = parseNarrativeOutput(FIXTURE_NARRATIVE)
      expect(result.perceivedPerformance.length).toBeGreaterThan(0)
    })

    it('technicalPerformance is populated when [TECHNICAL PERFORMANCE] section is present', () => {
      const result = parseNarrativeOutput(FIXTURE_NARRATIVE)
      expect(result.technicalPerformance.length).toBeGreaterThan(0)
    })

    it('perceivedPerformance and technicalPerformance are distinct (not the same text)', () => {
      const result = parseNarrativeOutput(FIXTURE_NARRATIVE)
      expect(result.perceivedPerformance).not.toBe(result.technicalPerformance)
    })

    it('perceivedPerformance does not contain technical metrics from [TECHNICAL PERFORMANCE] section', () => {
      const result = parseNarrativeOutput(FIXTURE_NARRATIVE)
      // TTFB value is in technical section, not perceived
      expect(result.perceivedPerformance).not.toContain('TTFB is 2400ms')
    })

    it('technicalPerformance does not contain user-experience language from [PERCEIVED PERFORMANCE] section', () => {
      const result = parseNarrativeOutput(FIXTURE_NARRATIVE)
      expect(result.technicalPerformance).not.toContain('Users experience the page as slow')
    })
  })
})
