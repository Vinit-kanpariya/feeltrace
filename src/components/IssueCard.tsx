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
    <div className="rounded-[10px] bg-[#131f35] border border-white/[0.07] overflow-hidden mb-[10px] transition-colors duration-200 hover:bg-[#172240] hover:border-white/[0.13]">
      {/* 3px severity top bar */}
      <div style={{ height: '3px', background: accent }} aria-hidden="true" />

      <div className="p-4">
        {/* Meta row: badge + category left, signal tag right */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <SeverityBadge severity={issue.severity} />
            <span className="text-[11px] font-medium text-[#475569]">
              {CATEGORY_LABELS[issue.category] ?? issue.category}
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#334155] bg-black/30 px-[7px] py-[2px] rounded">
            {issue.signal_source}
          </span>
        </div>

        {/* Description */}
        <p className="text-[13px] text-slate-200 leading-[1.65] mb-3">
          {issue.technical_description}
        </p>

        {/* Evidence block */}
        <div className="rounded-lg bg-black/35 border border-white/[0.05] px-3 py-2.5 mb-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#1e3a5f] mb-1.5">
            Evidence
          </p>
          <p className="text-[11px] font-mono text-[#64748b] leading-[1.7]">
            <span className="text-[#1e3a5f] select-none">evidence  </span>
            {issue.raw_evidence}
          </p>
          {issue.severity_justification && (
            <p className="text-[11px] font-mono text-[#64748b] leading-[1.7]">
              <span className="text-[#1e3a5f] select-none">impact    </span>
              {issue.severity_justification}
            </p>
          )}
        </div>

        {/* How to fix callout — rendered only when fix_suggestion is non-empty */}
        {issue.fix_suggestion && (
          <div
            className="rounded-lg px-3 py-2.5 flex gap-2.5"
            style={{
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.18)',
            }}
          >
            <div
              className="w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: 'rgba(34,197,94,0.12)' }}
              aria-hidden="true"
            >
              <svg
                className="w-[11px] h-[11px] text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#16a34a] mb-1">
                How to fix
              </p>
              <p className="text-[12px] leading-[1.65]" style={{ color: '#86efac' }}>
                {issue.fix_suggestion}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
