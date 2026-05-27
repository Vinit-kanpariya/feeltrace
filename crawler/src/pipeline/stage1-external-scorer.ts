// crawler/src/pipeline/stage1-external-scorer.ts
// Stage 1 external signal scorer — CWV (CrUX) + Lighthouse threshold rules.
// Completely separate from stage1-scorer.ts; existing scoreSignals() is untouched.
// scoreAxeViolations is a stub here — Plan 06-02 fills in the body.

import type { ExternalSignals, AxeViolation } from '../lib/types'
import type { ScoredIssue } from './types'

// ---------------------------------------------------------------------------
// CWV threshold rules (signal_source prefix: cwv., category: perceived-perf)
// CLS note: PSI returns CLS as raw integer percentile (e.g. 8 = CLS 0.08).
// Thresholds use the raw integer — do NOT divide by 100.
// ---------------------------------------------------------------------------

interface ExternalThresholdRule {
  signal_source: string
  category: ScoredIssue['category']
  severity: 1 | 2 | 3 | 4
  threshold: number
  op: 'gt' | 'lt'
  label: string
  unit: string
}

const CWV_RULES: ExternalThresholdRule[] = [
  {
    signal_source: 'cwv.lcp_ms',
    category: 'perceived-perf',
    severity: 4,
    threshold: 4000,
    op: 'gt',
    label: 'Critical',
    unit: 'ms',
  },
  {
    signal_source: 'cwv.lcp_ms',
    category: 'perceived-perf',
    severity: 3,
    threshold: 2500,
    op: 'gt',
    label: 'High',
    unit: 'ms',
  },
  {
    signal_source: 'cwv.cls_raw',
    category: 'perceived-perf',
    severity: 4,
    threshold: 25,
    op: 'gt',
    label: 'Critical',
    unit: '',
  },
  {
    signal_source: 'cwv.cls_raw',
    category: 'perceived-perf',
    severity: 3,
    threshold: 10,
    op: 'gt',
    label: 'High',
    unit: '',
  },
  {
    signal_source: 'cwv.inp_ms',
    category: 'perceived-perf',
    severity: 4,
    threshold: 500,
    op: 'gt',
    label: 'Critical',
    unit: 'ms',
  },
  {
    signal_source: 'cwv.inp_ms',
    category: 'perceived-perf',
    severity: 3,
    threshold: 200,
    op: 'gt',
    label: 'High',
    unit: 'ms',
  },
]

const LIGHTHOUSE_RULES: ExternalThresholdRule[] = [
  {
    signal_source: 'lighthouse.performance',
    category: 'perceived-perf',
    severity: 4,
    threshold: 0.5,
    op: 'lt',
    label: 'Critical',
    unit: '',
  },
  {
    signal_source: 'lighthouse.performance',
    category: 'perceived-perf',
    severity: 3,
    threshold: 0.7,
    op: 'lt',
    label: 'High',
    unit: '',
  },
  {
    signal_source: 'lighthouse.accessibility',
    category: 'accessibility',
    severity: 3,
    threshold: 0.8,
    op: 'lt',
    label: 'High',
    unit: '',
  },
  {
    signal_source: 'lighthouse.accessibility',
    category: 'accessibility',
    severity: 2,
    threshold: 0.9,
    op: 'lt',
    label: 'Medium',
    unit: '',
  },
  {
    signal_source: 'lighthouse.seo',
    category: 'technical-perf',
    severity: 2,
    threshold: 0.7,
    op: 'lt',
    label: 'Medium',
    unit: '',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ruleTriggered(value: number, rule: ExternalThresholdRule): boolean {
  return rule.op === 'gt' ? value > rule.threshold : value < rule.threshold
}

function formatEvidence(value: number, rule: ExternalThresholdRule): string {
  const op = rule.op === 'gt' ? '>' : '<'
  return `${value}${rule.unit} (threshold: ${op}${rule.threshold}${rule.unit} ${rule.label})`
}

/**
 * Applies highest-severity-wins deduplication per signal_source.
 * For each signal_source, only the highest triggered severity is emitted.
 */
function applyHighestSeverityWins(candidates: ScoredIssue[]): ScoredIssue[] {
  const best = new Map<string, ScoredIssue>()
  for (const issue of candidates) {
    const existing = best.get(issue.signal_source)
    if (!existing || issue.severity > existing.severity) {
      best.set(issue.signal_source, issue)
    }
  }
  return Array.from(best.values())
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Scores external signals (CWV + Lighthouse) from PSI API.
 * Returns [] if both signals.cwv and signals.lighthouse are null.
 */
export function scoreExternalSignals(signals: ExternalSignals): ScoredIssue[] {
  const candidates: ScoredIssue[] = []

  // CWV rules
  if (signals.cwv) {
    const { lcp_ms, cls_raw, inp_ms } = signals.cwv
    const metricMap: Record<string, number | null> = {
      'cwv.lcp_ms': lcp_ms,
      'cwv.cls_raw': cls_raw,
      'cwv.inp_ms': inp_ms,
    }

    for (const rule of CWV_RULES) {
      const value = metricMap[rule.signal_source]
      if (value === null || value === undefined) continue
      if (ruleTriggered(value, rule)) {
        candidates.push({
          category: rule.category,
          signal_source: rule.signal_source,
          severity: rule.severity,
          raw_evidence: formatEvidence(value, rule),
          viewport: 'both',
        })
      }
    }
  }

  // Lighthouse rules
  if (signals.lighthouse) {
    const { performance, accessibility, seo } = signals.lighthouse
    const metricMap: Record<string, number> = {
      'lighthouse.performance': performance,
      'lighthouse.accessibility': accessibility,
      'lighthouse.seo': seo,
    }

    for (const rule of LIGHTHOUSE_RULES) {
      const value = metricMap[rule.signal_source]
      if (value === undefined) continue
      if (ruleTriggered(value, rule)) {
        candidates.push({
          category: rule.category,
          signal_source: rule.signal_source,
          severity: rule.severity,
          raw_evidence: formatEvidence(value, rule),
          viewport: 'both',
        })
      }
    }
  }

  return applyHighestSeverityWins(candidates)
}

/**
 * Maps axe-core impact strings to ScoredIssue severity integers.
 * critical → 4, serious → 3, moderate → 2, minor → 1
 */
const AXE_IMPACT_SEVERITY: Record<string, 1 | 2 | 3 | 4> = {
  critical: 4,
  serious: 3,
  moderate: 2,
  minor: 1,
}

/**
 * Scores axe-core accessibility violations into ScoredIssue[].
 *
 * Dedup: one ScoredIssue per unique violation ID (first occurrence wins).
 * Cap: at most 10 unique violation IDs emitted.
 * raw_evidence: "<id>: <impact> impact — <count> node(s) affected: <target1>; <target2>; ..."
 * viewport: 'desktop' — axe only runs on the desktop pass.
 */
export function scoreAxeViolations(violations: AxeViolation[]): ScoredIssue[] {
  // Deduplicate by violation ID — first occurrence wins
  const seen = new Set<string>()
  const unique: AxeViolation[] = []
  for (const v of violations) {
    if (!seen.has(v.id)) {
      seen.add(v.id)
      unique.push(v)
    }
  }

  // Cap at 10 unique violation IDs
  const capped = unique.slice(0, 10)

  return capped.map((v) => {
    const severity = AXE_IMPACT_SEVERITY[v.impact] ?? 1
    // Defensively re-slice to 5 nodes (browser.ts already slices, but guard here too)
    const topNodes = v.nodes.slice(0, 5)
    const nodeTargets = topNodes.map((n) => n.target).join('; ')
    const raw_evidence = `${v.id}: ${v.impact} impact — ${topNodes.length} node(s) affected: ${nodeTargets}`

    return {
      category: 'accessibility' as const,
      signal_source: `axe.${v.id}`,
      severity,
      raw_evidence,
      viewport: 'desktop' as const,
    }
  })
}
