import { Page } from 'playwright-core'
import { JSSignals } from '../lib/types'

interface ScriptDescriptor {
  async: boolean
  defer: boolean
  type: string
  src: string
  inHead: boolean
}

interface ScriptClassification {
  scriptCount: number
  renderBlockingCount: number
  asyncScriptCount: number
  deferredScriptCount: number
  moduleScriptCount: number
  thirdPartyScriptCount: number
}

/**
 * Classify a list of script descriptors against the page origin.
 * Exported for unit testing without requiring a live browser.
 */
export function classifyScripts(
  scripts: ScriptDescriptor[],
  pageOrigin: string
): ScriptClassification {
  let scriptCount = 0
  let renderBlockingCount = 0
  let asyncScriptCount = 0
  let deferredScriptCount = 0
  let moduleScriptCount = 0
  let thirdPartyScriptCount = 0

  for (const s of scripts) {
    if (!s.src) continue
    scriptCount++

    if (s.async) asyncScriptCount++
    if (s.defer) deferredScriptCount++
    if (s.type === 'module') moduleScriptCount++

    // render-blocking: external script with no async/defer/module, inside <head>
    if (!s.async && !s.defer && s.type !== 'module' && s.inHead) {
      renderBlockingCount++
    }

    try {
      const origin = new URL(s.src).origin
      if (origin !== pageOrigin) thirdPartyScriptCount++
    } catch {
      // relative URL or malformed — treat as same origin
    }
  }

  return {
    scriptCount,
    renderBlockingCount,
    asyncScriptCount,
    deferredScriptCount,
    moduleScriptCount,
    thirdPartyScriptCount,
  }
}

/**
 * NOTE: page.coverage.stopJSCoverage() provides V8 source ranges, not transfer
 * sizes. totalJSBytes is computed from source text length — for accurate transfer
 * sizes use the HAR entries in NetworkSignals instead.
 */
export async function extractJSSignals(page: Page): Promise<JSSignals> {
  const coverageEntries = await page.coverage.stopJSCoverage()

  let totalJSBytes = 0
  let usedJSBytes = 0

  for (const entry of coverageEntries) {
    const len = entry.source?.length ?? 0
    totalJSBytes += len
    for (const fn of entry.functions) {
      for (const range of fn.ranges) {
        if (range.count > 0) {
          usedJSBytes += range.endOffset - range.startOffset
        }
      }
    }
  }

  const unusedJSBytes = Math.max(0, totalJSBytes - usedJSBytes)
  const unusedJSPercent =
    totalJSBytes > 0 ? Math.round((unusedJSBytes / totalJSBytes) * 100) : 0

  const inPageSignals = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[]
    const pageOrigin = window.location.origin

    let scriptCount = 0
    let renderBlockingCount = 0
    let asyncScriptCount = 0
    let deferredScriptCount = 0
    let moduleScriptCount = 0
    let thirdPartyScriptCount = 0

    for (const s of scripts) {
      scriptCount++
      if (s.async) asyncScriptCount++
      if (s.defer) deferredScriptCount++
      if (s.type === 'module') moduleScriptCount++

      const inHead = s.closest('head') !== null
      if (!s.async && !s.defer && s.type !== 'module' && inHead) renderBlockingCount++

      try {
        const origin = new URL(s.src).origin
        if (origin !== pageOrigin) thirdPartyScriptCount++
      } catch {
        // relative URL — same origin
      }
    }

    // Framework fingerprint — whitelist only; never include arbitrary window properties
    type FrameworkWindow = Window & {
      __NEXT_DATA__?: unknown; React?: unknown; __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown
      __vue_app__?: unknown; __nuxt?: unknown; Svelte?: unknown
    }
    const w = window as FrameworkWindow
    const frameworkFingerprint: string[] = []
    if (w.__NEXT_DATA__) frameworkFingerprint.push('nextjs')
    if (w.React || w.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      if (!frameworkFingerprint.includes('react')) frameworkFingerprint.push('react')
    }
    if (w.__vue_app__) frameworkFingerprint.push('vue3')
    if (w.__nuxt) frameworkFingerprint.push('nuxt')
    if (w.Svelte || document.querySelector('[class^="svelte-"]')) {
      frameworkFingerprint.push('svelte')
    }

    return {
      scriptCount,
      renderBlockingCount,
      asyncScriptCount,
      deferredScriptCount,
      moduleScriptCount,
      thirdPartyScriptCount,
      frameworkFingerprint,
    }
  })

  return {
    totalJSBytes,
    unusedJSBytes,
    unusedJSPercent,
    scriptCount: inPageSignals.scriptCount,
    renderBlockingCount: inPageSignals.renderBlockingCount,
    asyncScriptCount: inPageSignals.asyncScriptCount,
    deferredScriptCount: inPageSignals.deferredScriptCount,
    moduleScriptCount: inPageSignals.moduleScriptCount,
    thirdPartyScriptCount: inPageSignals.thirdPartyScriptCount,
    frameworkFingerprint: inPageSignals.frameworkFingerprint,
  }
}
