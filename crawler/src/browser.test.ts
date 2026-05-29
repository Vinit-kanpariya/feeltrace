// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'
import { extractInternalLinks } from './browser'

// ---------------------------------------------------------------------------
// Minimal mock page helper — avoids importing playwright-core types.
// Provides a page.evaluate() that resolves to the given hrefs array.
// Cast to the first parameter type of extractInternalLinks to satisfy TypeScript.
// ---------------------------------------------------------------------------
function makeMockPage(hrefs: (string | null)[]) {
  return {
    evaluate: vi.fn().mockResolvedValue(hrefs),
  } as unknown as Parameters<typeof extractInternalLinks>[0]
}

// ---------------------------------------------------------------------------
// extractInternalLinks unit tests (CRAWL-01)
// ---------------------------------------------------------------------------
describe('extractInternalLinks', () => {
  it('CRAWL-01: returns only same-origin links', async () => {
    const page = makeMockPage(['/about', 'https://other.com/page', 'https://example.com/contact'])
    const result = await extractInternalLinks(page, 'https://example.com')
    expect(result).toContain('https://example.com/about')
    expect(result).toContain('https://example.com/contact')
    expect(result).not.toContain('https://other.com/page')
  })

  it('CRAWL-01: excludes fragment-only hrefs', async () => {
    const page = makeMockPage(['#section', '#top'])
    const result = await extractInternalLinks(page, 'https://example.com')
    expect(result).toHaveLength(0)
  })

  it('CRAWL-01: excludes mailto: and tel: hrefs', async () => {
    const page = makeMockPage(['mailto:hi@example.com', 'tel:+1234567890'])
    const result = await extractInternalLinks(page, 'https://example.com')
    expect(result).toHaveLength(0)
  })

  it('CRAWL-01: deduplicates URLs', async () => {
    // /about, /about, /about/ — trailing slash normalisation makes all three the same
    const page = makeMockPage(['/about', '/about', '/about/'])
    const result = await extractInternalLinks(page, 'https://example.com')
    expect(result).toHaveLength(1)
  })

  it('CRAWL-01: normalizes relative paths to absolute', async () => {
    const base = 'https://example.com/app/'
    const expectedPricing = new URL('./pricing', base).href
    const page = makeMockPage(['./pricing', '../blog'])
    const result = await extractInternalLinks(page, base)
    expect(result).toContain(expectedPricing)
  })

  it('CRAWL-01: skips malformed hrefs without throwing', async () => {
    const page = makeMockPage(['not a url at all', '://bad', null])
    await expect(extractInternalLinks(page, 'https://example.com')).resolves.toBeInstanceOf(Array)
  })
})
