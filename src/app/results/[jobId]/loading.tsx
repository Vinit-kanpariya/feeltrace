// src/app/results/[jobId]/loading.tsx
// Next.js App Router loading skeleton — automatically used as the Suspense fallback for page.tsx.
// Server Component by default (no 'use client').
// Pattern: RESEARCH.md Pattern 7 (loading.tsx skeleton with animate-pulse)

export default function ResultsLoading() {
  return (
    <div className="min-h-dvh bg-[#0f172a] flex flex-col">
      {/* Header skeleton */}
      <div className="w-full max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-700 animate-pulse" />
          <div className="h-4 w-20 rounded bg-slate-700 animate-pulse" />
        </div>
        <div className="h-3 w-20 rounded bg-slate-800 animate-pulse" />
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 animate-pulse">
        {/* Title skeleton */}
        <div className="mb-8">
          <div className="h-3 w-20 rounded bg-slate-700 mb-2" />
          <div className="h-7 w-64 rounded-lg bg-slate-700" />
        </div>

        {/* Narrative card skeleton */}
        <div className="rounded-xl bg-slate-800/50 border border-slate-700/60 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-700/60">
            <div className="h-4 w-36 rounded bg-slate-700" />
          </div>
          <div className="p-6 space-y-5">
            {[0, 1, 2].map(i => (
              <div key={i}>
                <div className="h-3 w-20 rounded bg-slate-700 mb-2" />
                <div className="space-y-1.5">
                  <div className="h-3.5 rounded bg-slate-700/80 w-full" />
                  <div className="h-3.5 rounded bg-slate-700/80 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issue card skeletons */}
        <div className="h-4 w-28 rounded bg-slate-700 mb-4" />
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-4 mb-3">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-5 w-16 rounded-full bg-slate-700" />
              <div className="h-3 w-24 rounded bg-slate-700" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3.5 rounded bg-slate-700/80 w-full" />
              <div className="h-3.5 rounded bg-slate-700/80 w-4/5" />
            </div>
          </div>
        ))}

        {/* Graph skeleton */}
        <div className="rounded-xl bg-slate-800/30 border border-slate-700/40 h-[320px] md:h-[480px] flex items-center justify-center mt-8">
          <span className="text-slate-600 text-sm">Loading analysis…</span>
        </div>
      </div>
    </div>
  )
}
