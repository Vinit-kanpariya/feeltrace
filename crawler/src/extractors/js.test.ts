// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { classifyScripts } from './js'

const PAGE_ORIGIN = 'https://example.com'

function makeScript(overrides: Partial<{
  async: boolean; defer: boolean; type: string; src: string; inHead: boolean
}> = {}) {
  return {
    async: false,
    defer: false,
    type: '',
    src: 'https://example.com/script.js',
    inHead: false,
    ...overrides,
  }
}

describe('classifyScripts', () => {
  it('returns all-zero counts for empty array', () => {
    const result = classifyScripts([], PAGE_ORIGIN)
    expect(result.scriptCount).toBe(0)
    expect(result.renderBlockingCount).toBe(0)
    expect(result.asyncScriptCount).toBe(0)
    expect(result.deferredScriptCount).toBe(0)
    expect(result.moduleScriptCount).toBe(0)
    expect(result.thirdPartyScriptCount).toBe(0)
  })

  it('counts async script and does not mark as render-blocking', () => {
    const scripts = [makeScript({ async: true, inHead: true })]
    const result = classifyScripts(scripts, PAGE_ORIGIN)
    expect(result.asyncScriptCount).toBe(1)
    expect(result.renderBlockingCount).toBe(0)
    expect(result.scriptCount).toBe(1)
  })

  it('counts defer script', () => {
    const scripts = [makeScript({ defer: true, inHead: true })]
    const result = classifyScripts(scripts, PAGE_ORIGIN)
    expect(result.deferredScriptCount).toBe(1)
    expect(result.renderBlockingCount).toBe(0)
  })

  it('counts module script and does not mark as render-blocking', () => {
    const scripts = [makeScript({ type: 'module', inHead: true })]
    const result = classifyScripts(scripts, PAGE_ORIGIN)
    expect(result.moduleScriptCount).toBe(1)
    expect(result.renderBlockingCount).toBe(0)
  })

  it('marks head-only non-async/defer/module script as render-blocking', () => {
    const scripts = [makeScript({ inHead: true })]
    const result = classifyScripts(scripts, PAGE_ORIGIN)
    expect(result.renderBlockingCount).toBe(1)
  })

  it('does not mark body script as render-blocking', () => {
    const scripts = [makeScript({ inHead: false })]
    const result = classifyScripts(scripts, PAGE_ORIGIN)
    expect(result.renderBlockingCount).toBe(0)
  })

  it('counts third-party script from different origin', () => {
    const scripts = [makeScript({ src: 'https://cdn.example.net/lib.js' })]
    const result = classifyScripts(scripts, PAGE_ORIGIN)
    expect(result.thirdPartyScriptCount).toBe(1)
  })

  it('does not count same-origin script as third-party', () => {
    const scripts = [makeScript({ src: 'https://example.com/bundle.js' })]
    const result = classifyScripts(scripts, PAGE_ORIGIN)
    expect(result.thirdPartyScriptCount).toBe(0)
  })

  it('handles mixed scripts correctly', () => {
    const scripts = [
      makeScript({ async: true }), // async — not blocking
      makeScript({ inHead: true }), // head sync — blocking
      makeScript({ src: 'https://third.com/lib.js' }), // third-party
      makeScript({ defer: true, inHead: true }), // defer — not blocking
    ]
    const result = classifyScripts(scripts, PAGE_ORIGIN)
    expect(result.scriptCount).toBe(4)
    expect(result.asyncScriptCount).toBe(1)
    expect(result.deferredScriptCount).toBe(1)
    expect(result.renderBlockingCount).toBe(1)
    expect(result.thirdPartyScriptCount).toBe(1)
  })
})
