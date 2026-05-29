'use client'
import { useState } from 'react'
import type { NarrativeResult } from '@/types/narrative'
import { NarrativeSection } from './NarrativeSection'
import { IssueCard } from './IssueCard'

interface PageAccordionSectionProps {
  page: {
    id: string
    url: string
    page_index: number
    narrative: unknown
    screenshot_url: string | null
    issues: {
      id: string
      category: string
      signal_source: string
      severity: number
      raw_evidence: string
      technical_description: string
      fix_suggestion: string
      severity_justification: string
    }[]
    edges: unknown[]
  }
  defaultOpen?: boolean
}

export function PageAccordionSection({ page, defaultOpen = false }: PageAccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const narrative = page.narrative as unknown as NarrativeResult

  return (
    <div className="rounded-xl bg-[#131f35] border border-white/[0.08] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-mono text-slate-300 truncate">{page.url}</span>
        <span className="text-slate-500 flex-shrink-0 ml-3" aria-hidden="true">
          {isOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="px-5 py-5 space-y-4 border-t border-white/[0.07]">
          <NarrativeSection narrative={narrative} />
          {page.issues.length > 0 ? (
            <div className="mt-6 space-y-3">
              {page.issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No issues detected on this page.</p>
          )}
        </div>
      )}
    </div>
  )
}
