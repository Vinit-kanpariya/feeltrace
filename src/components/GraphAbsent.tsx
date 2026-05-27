export function GraphAbsent() {
  return (
    <div className="rounded-xl bg-slate-800/30 border border-slate-700/40 border-dashed flex flex-col items-center justify-center min-h-[200px] py-10 px-6">
      <div className="w-10 h-10 rounded-full bg-slate-700/60 flex items-center justify-center mb-4">
        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-slate-300 text-center mb-1.5">
        Causality graph not available
      </h3>
      <p className="text-xs text-slate-500 text-center max-w-sm leading-relaxed">
        The analysis did not find enough high-confidence causal relationships to render a graph
        reliably. Individual issue details are listed above.
      </p>
    </div>
  )
}
