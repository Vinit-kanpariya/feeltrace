// src/types/narrative.ts
// Copy of the NarrativeResult shape from crawler/src/pipeline/types.ts.
// Each sub-project owns its copy; do not import from crawler/.
// Source of truth: .planning/phases/04-results-dashboard/04-CONTEXT.md (D-01, D-02)

/**
 * AI-generated narrative result stored as JSON in the Result.narrative column.
 * Mirrors the NarrativeResult interface in crawler/src/pipeline/types.ts.
 */
export interface NarrativeResult {
  summary: string
  perceivedPerformance: string
  technicalPerformance: string
  recommendations: string[]
}

/** Maps numeric severity levels to human-readable labels (D-01). */
export const SEVERITY_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Critical',
}

/** Maps issue category keys to display labels (D-02). */
export const CATEGORY_LABELS: Record<string, string> = {
  'perceived-perf': 'Perceived Performance',
  'technical-perf': 'Technical Performance',
  'accessibility': 'Accessibility',
}
