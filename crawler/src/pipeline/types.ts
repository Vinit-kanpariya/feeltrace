// Phase 3 AI pipeline type contracts. Source: .planning/phases/03-ai-pipeline/03-RESEARCH.md

// Stage 1 output: a single scored issue from deterministic threshold rules.
// Severity: 4=Critical, 3=High, 2=Medium, 1=Low — maps to Issue.severity Int in Prisma schema.
export interface ScoredIssue {
  category: 'perceived-perf' | 'technical-perf' | 'accessibility'
  signal_source: string       // e.g. "networkSignals.firstRequestTTFB (mobile)"
  severity: 1 | 2 | 3 | 4    // 1=Low, 2=Medium, 3=High, 4=Critical
  raw_evidence: string        // e.g. "2400ms (threshold: >2000ms Critical)"
  viewport: 'mobile' | 'desktop' | 'both'
}

// Stage 2 output: ScoredIssue enriched with LLM-generated technical description.
export interface EnrichedIssue extends ScoredIssue {
  technical_description: string  // 1-3 sentence plain-English explanation from Stage 2 LLM
}

// Stage 2 output: a directed causality edge between two scored issues.
// fromIndex and toIndex are zero-based indices into the ScoredIssue array.
export interface CausalEdgeCandidate {
  fromIndex: number
  toIndex: number
  mechanism: string       // must be one of PERMITTED_MECHANISMS (validated by zod enum)
  relationship: string    // short label, e.g. "causes", "amplifies"
  confidence: 'high' | 'medium' | 'low'
  explanation: string     // plain-English edge explanation
}

// Stage 3 output: structured narrative stored in Result.narrative: Json
export interface NarrativeResult {
  summary: string
  perceivedPerformance: string
  technicalPerformance: string
  recommendations: string[]
}

// Human-readable severity labels — used by Phase 4 display layer.
// Critical=4, High=3, Medium=2, Low=1 (order by severity DESC for Critical-first display).
export const SEVERITY_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Critical',
}

// Single source of truth for all permitted causality mechanism strings.
// Referenced in stage2-reasoner.ts system prompt and Stage2OutputSchema zod validation.
// Adding new mechanisms here automatically propagates to both consumers.
export const PERMITTED_MECHANISMS = [
  'render-blocking-delays-fcp',
  'ttfb-delays-fcp',
  'large-js-bundle-delays-tti',
  'render-blocking-js-delays-tti',
  'unused-js-inflates-bundle',
  'font-block-causes-foit',
  'missing-cdn-increases-ttfb',
  'oversized-images-increase-lcp',
  'deep-dom-increases-layout-cost',
  'paint-trigger-properties-cause-jank',
  'unlabelled-forms-block-conversion',
  'excessive-css-inflates-render-blocking',
  'third-party-scripts-contend-bandwidth',
] as const
