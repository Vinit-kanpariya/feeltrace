// Severity: 4=Critical, 3=High, 2=Medium, 1=Low — maps to Issue.severity Int in Prisma schema
// Stage 1: purely deterministic threshold rules — no LLM involvement (AI-01).
import type { CrawlPass } from '../lib/types'
import type { ScoredIssue } from './types'

// ---------------------------------------------------------------------------
// Internal helper types
// ---------------------------------------------------------------------------

interface ThresholdRule {
  category: ScoredIssue['category']
  signal_source: string
  severity: 1 | 2 | 3 | 4
  threshold: number
  unit: string
  label: string
  mobileOnly?: boolean
  condition?: 'eq' | 'gt' // default 'gt'
}

// ---------------------------------------------------------------------------
// Threshold rules — all 23 rules from RESEARCH.md Pattern 1
// ---------------------------------------------------------------------------

const NETWORK_RULES: ThresholdRule[] = [
  {
    category: 'perceived-perf',
    signal_source: 'networkSignals.firstRequestTTFB',
    severity: 4,
    threshold: 2000,
    unit: 'ms',
    label: 'Critical',
  },
  {
    category: 'perceived-perf',
    signal_source: 'networkSignals.firstRequestTTFB',
    severity: 3,
    threshold: 800,
    unit: 'ms',
    label: 'High',
  },
  {
    category: 'technical-perf',
    signal_source: 'networkSignals.firstRequestTTFB',
    severity: 2,
    threshold: 400,
    unit: 'ms',
    label: 'Medium',
  },
  {
    category: 'technical-perf',
    signal_source: 'networkSignals.renderBlockingCount',
    severity: 4,
    threshold: 5,
    unit: '',
    label: 'Critical',
  },
  {
    category: 'technical-perf',
    signal_source: 'networkSignals.renderBlockingCount',
    severity: 3,
    threshold: 2,
    unit: '',
    label: 'High',
  },
  {
    category: 'perceived-perf',
    signal_source: 'networkSignals.oversizedImageCount',
    severity: 3,
    threshold: 5,
    unit: '',
    label: 'High',
  },
  {
    category: 'perceived-perf',
    signal_source: 'networkSignals.oversizedImageCount',
    severity: 2,
    threshold: 2,
    unit: '',
    label: 'Medium',
  },
  {
    category: 'technical-perf',
    signal_source: 'networkSignals.cdnCount',
    severity: 2,
    threshold: 0,
    unit: '',
    label: 'Medium',
    condition: 'eq',
  },
]

const JS_RULES: ThresholdRule[] = [
  {
    category: 'technical-perf',
    signal_source: 'jsSignals.totalJSBytes',
    severity: 4,
    threshold: 500_000,
    unit: 'B',
    label: 'Critical',
    mobileOnly: true,
  },
  {
    category: 'technical-perf',
    signal_source: 'jsSignals.totalJSBytes',
    severity: 3,
    threshold: 300_000,
    unit: 'B',
    label: 'High',
    mobileOnly: true,
  },
  {
    category: 'technical-perf',
    signal_source: 'jsSignals.renderBlockingCount',
    severity: 3,
    threshold: 3,
    unit: '',
    label: 'High',
  },
  {
    category: 'technical-perf',
    signal_source: 'jsSignals.renderBlockingCount',
    severity: 2,
    threshold: 1,
    unit: '',
    label: 'Medium',
  },
  {
    category: 'technical-perf',
    signal_source: 'jsSignals.unusedJSPercent',
    severity: 3,
    threshold: 60,
    unit: '%',
    label: 'High',
  },
  {
    category: 'technical-perf',
    signal_source: 'jsSignals.unusedJSPercent',
    severity: 2,
    threshold: 40,
    unit: '%',
    label: 'Medium',
  },
]

const CSS_RULES: ThresholdRule[] = [
  {
    category: 'technical-perf',
    signal_source: 'cssSignals.unusedCSSPercent',
    severity: 3,
    threshold: 80,
    unit: '%',
    label: 'High',
  },
  {
    category: 'technical-perf',
    signal_source: 'cssSignals.unusedCSSPercent',
    severity: 2,
    threshold: 60,
    unit: '%',
    label: 'Medium',
  },
  {
    category: 'perceived-perf',
    signal_source: 'cssSignals.fontDisplayStrategies.block',
    severity: 3,
    threshold: 0,
    unit: '',
    label: 'High',
  },
  {
    category: 'technical-perf',
    signal_source: 'cssSignals.paintTriggerPropertyCount',
    severity: 3,
    threshold: 20,
    unit: '',
    label: 'High',
  },
]

const DOM_RULES: ThresholdRule[] = [
  {
    category: 'accessibility',
    signal_source: 'domSignals.missingAltCount',
    severity: 3,
    threshold: 10,
    unit: '',
    label: 'High',
  },
  {
    category: 'accessibility',
    signal_source: 'domSignals.missingAltCount',
    severity: 2,
    threshold: 3,
    unit: '',
    label: 'Medium',
  },
  {
    category: 'accessibility',
    signal_source: 'domSignals.formWithoutLabelCount',
    severity: 3,
    threshold: 0,
    unit: '',
    label: 'High',
  },
  {
    category: 'technical-perf',
    signal_source: 'domSignals.maxDOMDepth',
    severity: 3,
    threshold: 32,
    unit: '',
    label: 'High',
  },
  {
    category: 'technical-perf',
    signal_source: 'domSignals.maxDOMDepth',
    severity: 2,
    threshold: 20,
    unit: '',
    label: 'Medium',
  },
]

// ---------------------------------------------------------------------------
// Signal extraction helpers
// ---------------------------------------------------------------------------

function getSignalValue(pass: CrawlPass, source: string): number {
  switch (source) {
    case 'networkSignals.firstRequestTTFB':
      return pass.networkSignals.firstRequestTTFB
    case 'networkSignals.renderBlockingCount':
      return pass.networkSignals.renderBlockingCount
    case 'networkSignals.oversizedImageCount':
      return pass.networkSignals.oversizedImageCount
    case 'networkSignals.cdnCount':
      return pass.networkSignals.cdnCount
    case 'jsSignals.totalJSBytes':
      return pass.jsSignals.totalJSBytes
    case 'jsSignals.renderBlockingCount':
      return pass.jsSignals.renderBlockingCount
    case 'jsSignals.unusedJSPercent':
      return pass.jsSignals.unusedJSPercent
    case 'cssSignals.unusedCSSPercent':
      return pass.cssSignals.unusedCSSPercent
    case 'cssSignals.fontDisplayStrategies.block':
      return pass.cssSignals.fontDisplayStrategies.block
    case 'cssSignals.paintTriggerPropertyCount':
      return pass.cssSignals.paintTriggerPropertyCount
    case 'domSignals.missingAltCount':
      return pass.domSignals.missingAltCount
    case 'domSignals.formWithoutLabelCount':
      return pass.domSignals.formWithoutLabelCount
    case 'domSignals.maxDOMDepth':
      return pass.domSignals.maxDOMDepth
    default:
      return 0
  }
}

function ruleTriggered(value: number, rule: ThresholdRule): boolean {
  if (rule.condition === 'eq') {
    return value === rule.threshold
  }
  // default: 'gt'
  return value > rule.threshold
}

function formatRawEvidence(value: number, rule: ThresholdRule): string {
  const op = rule.condition === 'eq' ? '===' : '>'
  return `${value}${rule.unit} (threshold: ${op}${rule.threshold}${rule.unit} ${rule.label})`
}

// ---------------------------------------------------------------------------
// Deduplication helper
// ---------------------------------------------------------------------------
// When both mobile and desktop produce an issue with the same signal_source
// and the same severity, emit only one issue with viewport='both'. Emit
// separate issues only when the two viewports trigger different severity levels.
// Exported for direct unit testing.
export function deduplicateIssues(issues: ScoredIssue[]): ScoredIssue[] {
  const seen = new Map<string, ScoredIssue>()

  for (const issue of issues) {
    // Key = signal_source + severity — same threshold trigger from both viewports
    const key = `${issue.signal_source}::${issue.severity}`
    const existing = seen.get(key)

    if (!existing) {
      seen.set(key, { ...issue })
    } else {
      // Both viewports triggered the same severity — merge into 'both'
      seen.set(key, { ...existing, viewport: 'both' })
    }
  }

  return Array.from(seen.values())
}

// ---------------------------------------------------------------------------
// Core function
// ---------------------------------------------------------------------------

/**
 * scoreSignals — Stage 1 deterministic threshold scoring.
 *
 * Takes two CrawlPass objects (mobile + desktop) and returns a flat
 * ScoredIssue[] with all threshold violations. Pure synchronous function;
 * no I/O, no async, no external dependencies.
 */
export function scoreSignals(mobile: CrawlPass, desktop: CrawlPass): ScoredIssue[] {
  const issues: ScoredIssue[] = []

  const allRules: ThresholdRule[] = [...NETWORK_RULES, ...JS_RULES, ...CSS_RULES, ...DOM_RULES]

  for (const rule of allRules) {
    if (rule.mobileOnly) {
      // Check mobile only
      const mobileValue = getSignalValue(mobile, rule.signal_source)
      if (ruleTriggered(mobileValue, rule)) {
        issues.push({
          category: rule.category,
          signal_source: `${rule.signal_source} (mobile)`,
          severity: rule.severity,
          raw_evidence: formatRawEvidence(mobileValue, rule),
          viewport: 'mobile',
        })
      }
    } else {
      // Check both viewports independently, then deduplicate by severity
      const mobileValue = getSignalValue(mobile, rule.signal_source)
      const desktopValue = getSignalValue(desktop, rule.signal_source)
      const mobileTriggered = ruleTriggered(mobileValue, rule)
      const desktopTriggered = ruleTriggered(desktopValue, rule)

      if (mobileTriggered && desktopTriggered) {
        // Both triggered same threshold — emit one issue with worst-case evidence
        const worstValue = mobileValue >= desktopValue ? mobileValue : desktopValue
        issues.push({
          category: rule.category,
          signal_source: `${rule.signal_source} (both)`,
          severity: rule.severity,
          raw_evidence: formatRawEvidence(worstValue, rule),
          viewport: 'both',
        })
      } else if (mobileTriggered) {
        issues.push({
          category: rule.category,
          signal_source: `${rule.signal_source} (mobile)`,
          severity: rule.severity,
          raw_evidence: formatRawEvidence(mobileValue, rule),
          viewport: 'mobile',
        })
      } else if (desktopTriggered) {
        issues.push({
          category: rule.category,
          signal_source: `${rule.signal_source} (desktop)`,
          severity: rule.severity,
          raw_evidence: formatRawEvidence(desktopValue, rule),
          viewport: 'desktop',
        })
      }
    }
  }

  return deduplicateIssues(issues)
}
