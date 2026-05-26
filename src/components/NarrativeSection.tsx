import { ArrowRight } from 'lucide-react'
import type { NarrativeResult } from '@/types/narrative'

export function NarrativeSection({ narrative }: { narrative: NarrativeResult }) {
  return (
    <section className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">What users experience</h2>

      <div className="mb-4">
        <p className="text-sm text-zinc-500 mb-1">Overview</p>
        <p className="text-base leading-relaxed">{narrative.summary}</p>
      </div>

      <div className="mb-4">
        <p className="text-sm text-zinc-500 mb-1">How it feels</p>
        <p className="text-base leading-relaxed">{narrative.perceivedPerformance}</p>
      </div>

      <div className="mb-4">
        <p className="text-sm text-zinc-500 mb-1">What the data says</p>
        <p className="text-base leading-relaxed">{narrative.technicalPerformance}</p>
      </div>

      <div>
        <p className="text-sm text-zinc-500 mb-2">Recommended actions</p>
        <ul className="space-y-2">
          {narrative.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-base leading-relaxed">
              <ArrowRight size={14} className="text-blue-600 mt-1 shrink-0" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
