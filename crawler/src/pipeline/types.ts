// Phase 3 AI pipeline type contracts. Source: .planning/phases/03-ai-pipeline/03-RESEARCH.md

import type { TechProfile } from '../lib/types'
import type { PageType } from './page-type-detector'

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
  fix_suggestion: string          // NEW — AI-01: specific implementation action (not advisory)
  severity_justification: string  // NEW — AI-02: estimated user impact in business terms
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

// Phase 8: multi-page crawl types

/** Structured result from a single-page pipeline run — consumed by run-pipeline.ts and processor.ts */
export interface PipelineResult {
  enrichedIssues: EnrichedIssue[]
  edges: CausalEdgeCandidate[]
  narrative: NarrativeResult
  screenshotUrl: string | null
  techProfile: TechProfile
  pageType: PageType
}

/** Per-page analysis result produced by the multi-page crawler — consumed by site-wide-merger.ts */
export interface PageAnalysisResult {
  url: string
  pageIndex: number
  enrichedIssues: EnrichedIssue[]
  edges: CausalEdgeCandidate[]
  narrative: NarrativeResult
  screenshotUrl: string | null
  techProfile: TechProfile
  pageType: PageType
  // Populated for page 0 (root page) only; empty array for all subsequent pages
  discoveredLinks: string[]
}

/** A cross-page pattern detected across multiple crawled pages */
export interface CrossPagePattern {
  signal_source: string
  page_count: number
  worst_severity: number
  affected_urls: string[]
  representative_evidence: string
}

/** Site-wide narrative aggregated from all per-page analyses */
export interface SiteWideNarrative {
  narrative: NarrativeResult
  crossPagePatterns: CrossPagePattern[]
}
