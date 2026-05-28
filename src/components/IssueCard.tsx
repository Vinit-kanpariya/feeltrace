import { SeverityBadge } from './SeverityBadge'
import { CATEGORY_LABELS } from '@/types/narrative'

const SEVERITY_ACCENT: Record<number, string> = {
  4: '#ef4444',
  3: '#f97316',
  2: '#eab308',
  1: '#22c55e',
}

interface IssueCardProps {
  issue: {
    id: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string        // AI-01 — may be "" on pre-Phase-7 rows
    severity_justification?: string // AI-02 — may be "" on pre-Phase-7 rows
  }
}

export function IssueCard({ issue }: IssueCardProps) {
  const accent = SEVERITY_ACCENT[issue.severity] ?? SEVERITY_ACCENT[1]
  return (
    <div
      className="rounded-xl bg-slate-800/40 border border-slate-700/60 overflow-hidden mb-3"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <SeverityBadge severity={issue.severity} />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {CATEGORY_LABELS[issue.category] ?? issue.category}
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{issue.technical_description}</p>
        <div className="mt-3 rounded-lg bg-slate-900/60 border border-slate-700/40 px-3 py-2.5 space-y-1">
          <p className="text-xs font-mono text-slate-500">
            <span className="text-slate-600 select-none">signal </span>
            <span className="text-slate-400">{issue.signal_source}</span>
          </p>
          <p className="text-xs font-mono text-slate-500">
            <span className="text-slate-600 select-none">evidence </span>
            <span className="text-slate-400">{issue.raw_evidence}</span>
          </p>
          {issue.fix_suggestion && (
            <p className="text-xs font-mono text-slate-500">
              <span className="text-slate-600 select-none">fix </span>
              <span className="text-slate-400">{issue.fix_suggestion}</span>
            </p>
          )}
          {issue.severity_justification && (
            <p className="text-xs font-mono text-slate-500">
              <span className="text-slate-600 select-none">impact </span>
              <span className="text-slate-400">{issue.severity_justification}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
