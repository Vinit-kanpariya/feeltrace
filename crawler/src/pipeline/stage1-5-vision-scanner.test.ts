// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'
import Groq from 'groq-sdk'
import { VisualIssuesSchema, parseVisualIssues, runVisualScanner } from './stage1-5-vision-scanner'

// Fixture: valid tool output with 1 visual issue (contrast category, severity 3)
const VALID_TOOL_OUTPUT = {
  visual_issues: [
    {
      description: 'Low contrast between text and background in the hero section makes it difficult to read.',
      location: 'hero section',
      severity: 3,
      visual_category: 'contrast',
    },
  ],
}

describe('VisualIssuesSchema', () => {
  it('passes for a valid tool output with 1 visual issue (contrast, severity 3)', () => {
    expect(() => VisualIssuesSchema.parse(VALID_TOOL_OUTPUT)).not.toThrow()
  })

  it('fails parse when visual_category is not in the allowed enum', () => {
    const invalid = {
      visual_issues: [
        {
          description: 'Some visual problem.',
          location: 'header',
          severity: 2,
          visual_category: 'invalid-category-not-in-enum',
        },
      ],
    }
    expect(() => VisualIssuesSchema.parse(invalid)).toThrow()
  })
})

describe('parseVisualIssues', () => {
  it('maps a VALID_TOOL_OUTPUT with 1 entry to ScoredIssue[] with correct shape', () => {
    const result = parseVisualIssues(VALID_TOOL_OUTPUT)
    expect(result).toHaveLength(1)
    const issue = result[0]
    expect(issue.signal_source).toMatch(/^visual\./)
    expect(issue.category).toBe('perceived-perf')
    expect(issue.viewport).toBe('desktop')
  })

  it('caps output at 5 issues even when tool output contains 6 entries', () => {
    const sixIssues = {
      visual_issues: [
        { description: 'Issue 1', location: 'header', severity: 2, visual_category: 'contrast' },
        { description: 'Issue 2', location: 'nav', severity: 1, visual_category: 'layout' },
        { description: 'Issue 3', location: 'hero', severity: 3, visual_category: 'hierarchy' },
        { description: 'Issue 4', location: 'footer', severity: 2, visual_category: 'spacing' },
        { description: 'Issue 5', location: 'cta area', severity: 4, visual_category: 'cta-visibility' },
        { description: 'Issue 6', location: 'sidebar', severity: 1, visual_category: 'other' },
      ],
    }
    // VisualIssuesSchema.parse enforces max(5) — parsing 6 items should throw
    expect(() => VisualIssuesSchema.parse(sixIssues)).toThrow()
  })
})

describe('runVisualScanner', () => {
  it('returns [] when screenshotBuffer.length > 2_500_000 (no Groq call made)', async () => {
    const largeBuffer = Buffer.alloc(2_600_000)
    const mockClient = {} as Groq // no methods needed — guard fires before any call
    const result = await runVisualScanner(mockClient, largeBuffer)
    expect(result).toEqual([])
  })

  it('returns [] when Groq client.chat.completions.create throws (non-blocking)', async () => {
    const mockClient = {
      chat: {
        completions: {
          create: vi.fn().mockRejectedValue(new Error('Groq 429')),
        },
      },
    } as unknown as Groq
    const smallBuffer = Buffer.alloc(100)
    const result = await runVisualScanner(mockClient, smallBuffer)
    expect(result).toEqual([])
  })
})
