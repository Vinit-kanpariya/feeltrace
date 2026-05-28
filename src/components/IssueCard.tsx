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
    fix_suggestion?: string
    severity_justification?: string
  }
}

export function IssueCard({ issue }: IssueCardProps) {
  const accent = SEVERITY_ACCENT[issue.severity] ?? SEVERITY_ACCENT[1]

  return (
    <div className="rounded-[10px] bg-[#131f35] border border-white/[0.07] overflow-hidden mb-3 transition-colors duration-200 hover:bg-[#172240] hover:border-white/[0.13] flex">
      {/* Left severity bar */}
      <div style={{ width: '4px', flexShrink: 0, background: accent }} aria-hidden="true" />

      <div className="p-5 flex-1 min-w-0">
        {/* Meta row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <SeverityBadge severity={issue.severity} />
            <span className="text-[11px] font-medium text-[#475569]">
              {CATEGORY_LABELS[issue.category] ?? issue.category}
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#334155] bg-black/30 px-[7px] py-[2px] rounded shrink-0">
            {issue.signal_source}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-200 leading-relaxed mb-4">
          {issue.technical_description}
        </p>

        {/* Evidence rows — plain labeled, no box */}
        <div className={`space-y-1 font-mono text-[12px]${issue.fix_suggestion ? ' mb-4' : ''}`}>
          <div className="flex gap-4">
            <span className="text-[#2d4a6e] select-none w-[68px] shrink-0">evidence</span>
            <span className="text-[#64748b] leading-relaxed">{issue.raw_evidence}</span>
          </div>
          {issue.severity_justification && (
            <div className="flex gap-4">
              <span className="text-[#2d4a6e] select-none w-[68px] shrink-0">impact</span>
              <span className="text-[#64748b] leading-relaxed">{issue.severity_justification}</span>
            </div>
          )}
        </div>

        {/* How to fix — clean left-border block */}
        {issue.fix_suggestion && (
          <div className="border-l-2 border-green-500/40 pl-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-green-600 mb-1">
              How to fix
            </p>
            <p className="text-[12px] text-[#86efac] leading-relaxed">
              {issue.fix_suggestion}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
