import { AnalyzeForm } from '@/components/AnalyzeForm'

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-[#0f172a] flex flex-col">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="font-semibold text-slate-100 text-[15px] tracking-tight">FeelTrace</span>
        </div>
        <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700/60">
          No account required
        </span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg">
          {/* Live badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
              Real browser signals — mobile &amp; desktop
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 text-center leading-tight tracking-tight mb-4">
            Trace how users{' '}
            <span className="text-green-400">actually&nbsp;experience</span>{' '}
            your&nbsp;UI
          </h1>

          <p className="text-base text-slate-400 text-center leading-relaxed mb-8 max-w-md mx-auto">
            Paste any public URL. Get a ranked issue list, plain&#8209;English narrative, and causality graph — backed by real Playwright signals.
          </p>

          {/* Form card */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6">
            <AnalyzeForm />
          </div>

          <p className="text-center text-xs text-slate-600 mt-4">
            Results are shareable via a permanent link — no sign-in needed
          </p>
        </div>
      </main>

      {/* Feature pills */}
      <section className="px-6 pb-14" aria-label="Features">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Signal Detection',
              desc: 'DOM, CSS, JS loading, and network HAR signals across two viewports',
              path: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2',
            },
            {
              label: 'AI Narrative',
              desc: 'Plain-English analysis that a PM or designer can act on without a dev translator',
              path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            },
            {
              label: 'Causality Graph',
              desc: 'See how one technical bottleneck creates a cascade of perceived UX failures',
              path: 'M13 10V3L4 14h7v7l9-11h-7z',
            },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col gap-2 p-4 rounded-xl bg-slate-800/30 border border-slate-700/40"
            >
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.path} />
              </svg>
              <p className="text-sm font-semibold text-slate-200">{f.label}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-5 border-t border-slate-800/80">
        <p className="text-center text-xs text-slate-600">
          © {new Date().getFullYear()} FeelTrace — UX signal analysis for product teams
        </p>
      </footer>
    </div>
  )
}
