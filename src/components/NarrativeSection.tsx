import { ArrowRight } from 'lucide-react'
import type { NarrativeResult } from '@/types/narrative'

export function NarrativeSection({ narrative }: { narrative: NarrativeResult }) {
  return (
    <section className="rounded-xl bg-[#131f35] border border-white/[0.08] overflow-hidden">
      {/* Header with green accent dot */}
      <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center gap-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" aria-hidden="true" />
        <h2 className="text-[13px] font-semibold text-slate-200">What users experience</h2>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Overview */}
        <div className="flex gap-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#334155] shrink-0 whitespace-nowrap w-[90px] mt-0.5">
            Overview
          </span>
          <p className="text-[13px] text-[#94a3b8] leading-[1.65]">{narrative.summary}</p>
        </div>

        <div className="h-px bg-white/[0.05]" />

        {/* How it feels */}
        <div className="flex gap-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#334155] shrink-0 whitespace-nowrap w-[90px] mt-0.5">
            How it feels
          </span>
          <p className="text-[13px] text-[#94a3b8] leading-[1.65]">{narrative.perceivedPerformance}</p>
        </div>

        <div className="h-px bg-white/[0.05]" />

        {/* What the data says */}
        <div className="flex gap-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#334155] shrink-0 whitespace-nowrap w-[90px] mt-0.5">
            What the data says
          </span>
          <p className="text-[13px] text-[#94a3b8] leading-[1.65]">{narrative.technicalPerformance}</p>
        </div>

        <div className="h-px bg-white/[0.05]" />

        {/* Recommended actions */}
        <div className="flex gap-4 items-start">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#334155] shrink-0 whitespace-nowrap w-[90px] mt-0.5">
            Recommended actions
          </span>
          <ul className="space-y-2 flex-1">
            {narrative.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <ArrowRight size={12} className="text-green-400 mt-0.5 shrink-0" aria-hidden="true" />
                <span className="text-[13px] text-[#94a3b8] leading-[1.65]">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
