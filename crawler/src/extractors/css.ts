import { Page } from 'playwright-core'
import { CSSSignals } from '../lib/types'

/**
 * Extract CSS signals from a page using Playwright's CSS coverage API.
 *
 * NOTE: page.coverage.startCSSCoverage() does not capture styles injected by
 * JavaScript (CSS-in-JS, Tailwind JIT, styled-components). Therefore
 * unusedCSSPercent is a lower bound — the true figure may be higher.
 */
export async function extractCSSSignals(page: Page): Promise<CSSSignals> {
  // stopCSSCoverage both stops recording AND returns the coverage data
  // Must be called before context.close() (Pitfall 4)
  const coverageEntries = await page.coverage.stopCSSCoverage()

  let totalBytes = 0
  let usedBytes = 0

  for (const entry of coverageEntries) {
    const len = entry.text?.length ?? 0
    totalBytes += len
    for (const range of entry.ranges) {
      usedBytes += range.end - range.start
    }
  }

  const unusedCSSBytes = totalBytes - usedBytes
  const unusedCSSPercent =
    totalBytes > 0 ? Math.round(((totalBytes - usedBytes) / totalBytes) * 100) : 0

  const inPageSignals = await page.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('*'))
    let animationCount = 0
    let transitionCount = 0
    let willChangeCount = 0
    let paintTriggerPropertyCount = 0
    const fontDisplayMap = { block: 0, swap: 0, fallback: 0, optional: 0, auto: 0 }

    for (const el of allElements) {
      const style = window.getComputedStyle(el)
      const hasAnimation = style.animationName !== 'none'
      const hasTransition =
        style.transition !== 'none' && style.transition !== 'all 0s ease 0s'
      const hasWillChange = style.willChange !== 'auto'

      if (hasAnimation) animationCount++
      if (hasTransition) transitionCount++
      if (hasWillChange) willChangeCount++

      // paint trigger: element with animation or willChange AND compositing property
      if (
        (hasAnimation || hasWillChange) &&
        (style.transform !== 'none' ||
          parseFloat(style.opacity) < 1 ||
          style.filter !== 'none')
      ) {
        paintTriggerPropertyCount++
      }
    }

    // font-display strategies from @font-face rules
    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        const sheet = document.styleSheets[i]
        const rules = Array.from(sheet.cssRules ?? [])
        for (const rule of rules) {
          if (rule instanceof CSSFontFaceRule) {
            const fd = rule.style.getPropertyValue('font-display') || 'auto'
            const key = fd.trim() as keyof typeof fontDisplayMap
            if (key in fontDisplayMap) {
              fontDisplayMap[key]++
            } else {
              fontDisplayMap.auto++
            }
          }
        }
      } catch {
        // cross-origin SecurityError — skip this stylesheet
      }
    }

    return { animationCount, transitionCount, willChangeCount, paintTriggerPropertyCount, fontDisplayMap }
  })

  return {
    totalCSSBytes: totalBytes,
    unusedCSSBytes,
    unusedCSSPercent,
    animationCount: inPageSignals.animationCount,
    transitionCount: inPageSignals.transitionCount,
    willChangeCount: inPageSignals.willChangeCount,
    paintTriggerPropertyCount: inPageSignals.paintTriggerPropertyCount,
    fontDisplayStrategies: inPageSignals.fontDisplayMap,
  }
}
