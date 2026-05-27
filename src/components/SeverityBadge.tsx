import { SEVERITY_LABELS } from '@/types/narrative'

const STYLES: Record<number, string> = {
  4: 'bg-red-500/15 border border-red-500/30 text-red-400',
  3: 'bg-orange-500/15 border border-orange-500/30 text-orange-400',
  2: 'bg-yellow-500/15 border border-yellow-500/30 text-yellow-400',
  1: 'bg-green-500/15 border border-green-500/30 text-green-400',
}

const DOT: Record<number, string> = {
  4: 'bg-red-400',
  3: 'bg-orange-400',
  2: 'bg-yellow-400',
  1: 'bg-green-400',
}

export function SeverityBadge({ severity }: { severity: number }) {
  const style = STYLES[severity] ?? STYLES[1]
  const dot = DOT[severity] ?? DOT[1]
  const label = SEVERITY_LABELS[severity as 1 | 2 | 3 | 4]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} aria-hidden="true" />
      {label}
    </span>
  )
}
