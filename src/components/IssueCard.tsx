import { SeverityBadge } from './SeverityBadge'
import { CATEGORY_LABELS } from '@/types/narrative'

const SEVERITY_BORDER_COLORS: Record<number, string> = {
  4: '#dc2626',
  3: '#ea580c',
  2: '#ca8a04',
  1: '#16a34a',
}

interface IssueCardProps {
  issue: {
    id: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
  }
}

export function IssueCard({ issue }: IssueCardProps) {
  const borderColor = SEVERITY_BORDER_COLORS[issue.severity] ?? SEVERITY_BORDER_COLORS[1]
  return (
    <div
      className="p-4 mb-4 rounded border border-zinc-200"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className="flex items-center gap-2">
        <SeverityBadge severity={issue.severity} />
        <span className="text-sm text-zinc-500">
          {CATEGORY_LABELS[issue.category] ?? issue.category}
        </span>
      </div>
      <p className="mt-2 text-base leading-relaxed">{issue.technical_description}</p>
      <div className="mt-3 bg-zinc-100 rounded p-2 font-mono text-sm">
        <p>Signal: {issue.signal_source}</p>
        <p>Evidence: {issue.raw_evidence}</p>
      </div>
    </div>
  )
}
