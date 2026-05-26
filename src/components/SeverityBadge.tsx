import { SEVERITY_LABELS } from '@/types/narrative'

const SEVERITY_STYLES: Record<number, { bg: string; text: string }> = {
  4: { bg: 'bg-red-600', text: 'text-white' },
  3: { bg: 'bg-orange-600', text: 'text-white' },
  2: { bg: 'bg-yellow-600', text: 'text-black' },
  1: { bg: 'bg-green-600', text: 'text-white' },
}

export function SeverityBadge({ severity }: { severity: number }) {
  const styles = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES[1]
  return (
    <span className={`rounded-full px-2 py-1 text-sm font-semibold ${styles.bg} ${styles.text}`}>
      {SEVERITY_LABELS[severity as 1 | 2 | 3 | 4]}
    </span>
  )
}
