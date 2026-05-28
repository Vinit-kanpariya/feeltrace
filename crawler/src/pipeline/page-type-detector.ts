// page-type-detector.ts — deterministic page-type classifier using TechProfile + DOMSignals.

import type { TechProfile } from '../lib/types'
import type { DOMSignals } from '../lib/types'

export type PageType = 'e-commerce' | 'saas-dashboard' | 'landing-page' | 'blog' | 'unknown'

export function detectPageType(techProfile: TechProfile, domSignals: DOMSignals): PageType {
  // E-commerce signal: payment integration detected
  if (techProfile.payments) return 'e-commerce'

  // SaaS dashboard: authenticated app-like structure
  // Heuristic: many interactive elements, likely Next.js/React.
  // analytics.length constraint removed — real SaaS dashboards commonly use product analytics
  // (Mixpanel, Amplitude, Segment) alongside their app.
  if (
    domSignals.interactiveElementCount > 20 &&
    (techProfile.framework === 'Next.js' || techProfile.framework === 'React')
  ) return 'saas-dashboard'

  // Blog: many article/semantic elements, few interactive elements, no payments
  if (
    domSignals.semanticScore.articleCount > 2 ||
    (domSignals.semanticScore.h2Count > 5 && domSignals.interactiveElementCount < 5)
  ) return 'blog'

  // Landing page: few form fields but CTAs present, marketing stack
  if (
    domSignals.formCount < 2 &&
    domSignals.ctaVisibility.buttonCount > 0 &&
    techProfile.analytics.length > 0
  ) return 'landing-page'

  return 'unknown'
}
