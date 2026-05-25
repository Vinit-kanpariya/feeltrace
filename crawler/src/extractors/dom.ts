import { Page } from 'playwright-core'
import { DOMSignals } from '../lib/types'

export function getMaxDepth(el: Element, depth = 0): number {
  let max = depth
  for (const child of Array.from(el.children)) {
    const childDepth = getMaxDepth(child, depth + 1)
    if (childDepth > max) max = childDepth
  }
  return max
}

export function computeSemanticScore(doc: Document): DOMSignals['semanticScore'] {
  return {
    h1Count: doc.querySelectorAll('h1').length,
    h2Count: doc.querySelectorAll('h2').length,
    h3Count: doc.querySelectorAll('h3').length,
    navCount: doc.querySelectorAll('nav').length,
    mainCount: doc.querySelectorAll('main').length,
    footerCount: doc.querySelectorAll('footer').length,
    articleCount: doc.querySelectorAll('article').length,
    hasSkipLink:
      doc.querySelector('a[href="#main"], a[href="#content"], a[href="#skip"]') !== null ||
      (() => {
        const links = Array.from(doc.querySelectorAll('a'))
        return links.some(
          (a) =>
            a.textContent?.toLowerCase().includes('skip') === true ||
            a.getAttribute('class')?.toLowerCase().includes('skip') === true
        )
      })(),
  }
}

export async function extractDOMSignals(page: Page): Promise<DOMSignals> {
  return page.evaluate(() => {
    function getMaxDepthInner(el: Element, depth = 0): number {
      let max = depth
      for (const child of Array.from(el.children)) {
        const d = getMaxDepthInner(child, depth + 1)
        if (d > max) max = d
      }
      return max
    }

    const allElements = Array.from(document.querySelectorAll('*'))
    const interactiveTags = new Set(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL'])

    // Accessibility counts
    const ariaLabelledCount = allElements.filter(
      (el) => el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby')
    ).length
    const ariaRoleCount = allElements.filter((el) => el.hasAttribute('role')).length
    const landmarkRoles = new Set(['banner', 'complementary', 'contentinfo', 'form', 'main', 'navigation', 'region', 'search'])
    const ariaLandmarkCount = allElements.filter((el) => {
      const role = el.getAttribute('role')
      return role !== null && landmarkRoles.has(role)
    }).length + document.querySelectorAll('header, nav, main, footer, aside, section[aria-label], section[aria-labelledby]').length

    const missingAltCount = Array.from(document.querySelectorAll('img')).filter(
      (img) => !img.hasAttribute('alt')
    ).length

    // Semantic score
    const hasSkipLink =
      document.querySelector('a[href="#main"], a[href="#content"], a[href="#skip"]') !== null ||
      Array.from(document.querySelectorAll('a')).some(
        (a) =>
          a.textContent?.toLowerCase().includes('skip') === true ||
          (a.getAttribute('class') ?? '').toLowerCase().includes('skip')
      )

    const semanticScore = {
      h1Count: document.querySelectorAll('h1').length,
      h2Count: document.querySelectorAll('h2').length,
      h3Count: document.querySelectorAll('h3').length,
      navCount: document.querySelectorAll('nav').length,
      mainCount: document.querySelectorAll('main').length,
      footerCount: document.querySelectorAll('footer').length,
      articleCount: document.querySelectorAll('article').length,
      hasSkipLink,
    }

    // Forms
    const forms = Array.from(document.querySelectorAll('form'))
    const formCount = forms.length
    const formFieldCount = document.querySelectorAll('input, select, textarea').length
    let formWithoutLabelCount = 0
    for (const input of Array.from(document.querySelectorAll('input[id], select[id], textarea[id]'))) {
      const id = input.getAttribute('id')
      if (id && !document.querySelector(`label[for="${id}"]`) && !input.hasAttribute('aria-label') && !input.hasAttribute('aria-labelledby')) {
        formWithoutLabelCount++
      }
    }

    // CTA visibility
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], a[href]:not([href=""])'))
    const buttonCount = buttons.length
    const visibleButtons = buttons.filter((el) => {
      const rect = el.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0
    })
    const primaryCtaText =
      visibleButtons.length > 0
        ? (visibleButtons[0].textContent?.trim().slice(0, 100) ?? null)
        : null

    return {
      maxDOMDepth: getMaxDepthInner(document.documentElement),
      totalElementCount: allElements.length,
      interactiveElementCount: allElements.filter((el) => interactiveTags.has(el.tagName)).length,
      ariaLabelledCount,
      ariaRoleCount,
      ariaLandmarkCount,
      missingAltCount,
      semanticScore,
      formCount,
      formFieldCount,
      formWithoutLabelCount,
      ctaVisibility: {
        buttonCount,
        visibleButtonCount: visibleButtons.length,
        primaryCtaText,
      },
    }
  })
}
