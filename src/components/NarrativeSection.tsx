import { ArrowRight } from 'lucide-react'
import type { NarrativeResult } from '@/types/narrative'

export function NarrativeSection({ narrative }: { narrative: NarrativeResult }) {
  return (
    <section className="rounded-xl bg-slate-800/50 border border-slate-700/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700/60">
        <h2 className="text-base font-semibold text-slate-100">What users experience</h2>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Overview</p>
          <p className="text-sm text-slate-300 leading-relaxed">{narrative.summary}</p>
        </div>

        <div className="h-px bg-slate-700/50" />

        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">How it feels</p>
          <p className="text-sm text-slate-300 leading-relaxed">{narrative.perceivedPerformance}</p>
        </div>

        <div className="h-px bg-slate-700/50" />

        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">What the data says</p>
          <p className="text-sm text-slate-300 leading-relaxed">{narrative.technicalPerformance}</p>
        </div>

        <div className="h-px bg-slate-700/50" />

        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Recommended actions</p>
          <ul className="space-y-2">
            {narrative.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <ArrowRight size={13} className="text-green-400 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-300 leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
