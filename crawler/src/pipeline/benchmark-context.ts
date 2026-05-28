// benchmark-context.ts — builds a CWV benchmark comparison paragraph for Stage 3 narrative.

import type { CWVMetrics } from '../lib/types'
import type { PageType } from './page-type-detector'

// Source: web.dev/articles/vitals (official Google thresholds)
// Source: 2025 Web Almanac (almanac.httparchive.org/en/2025/performance) — aggregate mobile pass rates
// Note: cls values are raw integers (PSI percentile × 100), matching the CWVMetrics.cls_raw field
// 0.1 × 100 = 10 (good threshold), 0.25 × 100 = 25 (poor threshold)
const CWV_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },   // ms
  cls: { good: 10,   poor: 25 },     // raw integer (PSI percentile × 100)
  inp: { good: 200,  poor: 500 },    // ms
} as const

// Web-wide aggregate data from 2025 Web Almanac + Google threshold-relative framing.
// Industry-specific medians are not officially published by Google or HTTP Archive by vertical.
// Using threshold-relative framing avoids the lack of authoritative per-vertical median data.
const PAGE_TYPE_CONTEXT: Record<string, string> = {
  'e-commerce': 'E-commerce pages. Slow LCP directly correlates with cart abandonment — every 100ms above 2.5s LCP reduces conversion by ~1-2%.',
  'saas-dashboard': 'SaaS dashboard. INP is the critical metric — users interacting with filters, tables, and controls need sub-200ms responses to feel in control.',
  'landing-page': 'Marketing landing page. LCP determines first impression — pages that load their hero in under 2.5s convert at 15-30% higher rates.',
  'blog': 'Blog or editorial page. CLS is critical — layout shifts while reading are highly frustrating and damage trust.',
  'unknown': 'Web page.',
}

export function buildBenchmarkContext(cwv: CWVMetrics | null, pageType: PageType): string {
  if (!cwv) return ''

  const lines: string[] = []
  const context = PAGE_TYPE_CONTEXT[pageType] ?? PAGE_TYPE_CONTEXT['unknown']
  lines.push(`Context: This is a ${context}`)
  lines.push('')
  lines.push('Real-user performance benchmarks (from CrUX field data):')

  if (cwv.lcp_ms !== null) {
    const lcpS = (cwv.lcp_ms / 1000).toFixed(2)
    const ratio = (cwv.lcp_ms / CWV_THRESHOLDS.lcp.good).toFixed(1)
    const status = cwv.lcp_ms <= CWV_THRESHOLDS.lcp.good ? 'GOOD' :
                   cwv.lcp_ms <= CWV_THRESHOLDS.lcp.poor ? 'NEEDS IMPROVEMENT' : 'POOR'
    lines.push(`- LCP: ${lcpS}s (${status}) — the "good" threshold is 2.5s; this page is ${ratio}× the good threshold`)
  }

  if (cwv.cls_raw !== null) {
    const clsFloat = (cwv.cls_raw / 100).toFixed(2)
    const status = cwv.cls_raw <= CWV_THRESHOLDS.cls.good ? 'GOOD' :
                   cwv.cls_raw <= CWV_THRESHOLDS.cls.poor ? 'NEEDS IMPROVEMENT' : 'POOR'
    lines.push(`- CLS: ${clsFloat} (${status}) — the "good" threshold is 0.1`)
  }

  if (cwv.inp_ms !== null) {
    const ratio = (cwv.inp_ms / CWV_THRESHOLDS.inp.good).toFixed(1)
    const status = cwv.inp_ms <= CWV_THRESHOLDS.inp.good ? 'GOOD' :
                   cwv.inp_ms <= CWV_THRESHOLDS.inp.poor ? 'NEEDS IMPROVEMENT' : 'POOR'
    lines.push(`- INP: ${cwv.inp_ms}ms (${status}) — the "good" threshold is 200ms; this page is ${ratio}× the good threshold`)
  }

  if (cwv.origin_fallback) {
    lines.push('(Note: these are origin-level metrics, not URL-specific)')
  }

  return lines.join('\n')
}
