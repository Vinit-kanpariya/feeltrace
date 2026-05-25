// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { getMaxDepth, computeSemanticScore } from './dom'

describe('getMaxDepth', () => {
  it('returns 0 for a single element with no children', () => {
    const el = document.createElement('div')
    expect(getMaxDepth(el)).toBe(0)
  })

  it('returns correct depth for 3-level nesting', () => {
    const outer = document.createElement('div')
    const middle = document.createElement('div')
    const inner = document.createElement('div')
    outer.appendChild(middle)
    middle.appendChild(inner)
    expect(getMaxDepth(outer)).toBe(2)
  })

  it('returns correct depth for siblings at same level', () => {
    const parent = document.createElement('div')
    const c1 = document.createElement('span')
    const c2 = document.createElement('span')
    parent.appendChild(c1)
    parent.appendChild(c2)
    expect(getMaxDepth(parent)).toBe(1)
  })
})

describe('computeSemanticScore', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('counts h1 elements correctly', () => {
    document.body.innerHTML = '<h1>A</h1><h1>B</h1><h1>C</h1>'
    const score = computeSemanticScore(document)
    expect(score.h1Count).toBe(3)
  })

  it('counts main element', () => {
    document.body.innerHTML = '<main><p>content</p></main>'
    const score = computeSemanticScore(document)
    expect(score.mainCount).toBe(1)
  })

  it('detects skip link', () => {
    document.body.innerHTML = '<a href="#main">Skip to main content</a>'
    const score = computeSemanticScore(document)
    expect(score.hasSkipLink).toBe(true)
  })

  it('returns zero counts for empty document', () => {
    document.body.innerHTML = ''
    const score = computeSemanticScore(document)
    expect(score.h1Count).toBe(0)
    expect(score.navCount).toBe(0)
    expect(score.mainCount).toBe(0)
  })
})

describe('DOM signal helpers — accessibility', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('detects missing alt on img', () => {
    document.body.innerHTML = '<img src="hero.jpg"><img src="logo.png" alt="logo">'
    const imgs = Array.from(document.querySelectorAll('img'))
    const missingAltCount = imgs.filter((img) => !img.hasAttribute('alt')).length
    expect(missingAltCount).toBe(1)
  })

  it('detects aria-label attribute', () => {
    document.body.innerHTML = '<button aria-label="Close dialog">X</button>'
    const ariaLabelledCount = Array.from(document.querySelectorAll('*')).filter(
      (el) => el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby')
    ).length
    expect(ariaLabelledCount).toBeGreaterThanOrEqual(1)
  })

  it('detects form input without label', () => {
    document.body.innerHTML = '<form><input id="name" type="text"></form>'
    let formWithoutLabelCount = 0
    for (const input of Array.from(document.querySelectorAll('input[id], select[id], textarea[id]'))) {
      const id = input.getAttribute('id')
      if (
        id &&
        !document.querySelector(`label[for="${id}"]`) &&
        !input.hasAttribute('aria-label') &&
        !input.hasAttribute('aria-labelledby')
      ) {
        formWithoutLabelCount++
      }
    }
    expect(formWithoutLabelCount).toBeGreaterThanOrEqual(1)
  })

  it('does not count labeled form input as missing label', () => {
    document.body.innerHTML = '<form><label for="email">Email</label><input id="email" type="email"></form>'
    let formWithoutLabelCount = 0
    for (const input of Array.from(document.querySelectorAll('input[id], select[id], textarea[id]'))) {
      const id = input.getAttribute('id')
      if (
        id &&
        !document.querySelector(`label[for="${id}"]`) &&
        !input.hasAttribute('aria-label') &&
        !input.hasAttribute('aria-labelledby')
      ) {
        formWithoutLabelCount++
      }
    }
    expect(formWithoutLabelCount).toBe(0)
  })
})
