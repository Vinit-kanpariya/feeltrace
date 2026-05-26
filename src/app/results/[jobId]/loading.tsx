// src/app/results/[jobId]/loading.tsx
// Next.js App Router loading skeleton — automatically used as the Suspense fallback for page.tsx.
// Server Component by default (no 'use client').
// Pattern: RESEARCH.md Pattern 7 (loading.tsx skeleton with animate-pulse)

export default function ResultsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      {/* Section 1 — Narrative skeleton */}
      <div className="bg-zinc-100 rounded p-6 mb-8">
        <div className="h-4 bg-zinc-300 rounded w-3/4 mb-3" />
        <div className="h-4 bg-zinc-300 rounded w-full mb-3" />
        <div className="h-4 bg-zinc-300 rounded w-5/6" />
      </div>

      {/* Section 2 — Issue card skeletons */}
      {[0, 1, 2].map(i => (
        <div key={i} className="bg-zinc-100 rounded p-4 mb-4">
          <div className="h-5 bg-zinc-300 rounded w-16 mb-3" />
          <div className="h-4 bg-zinc-300 rounded w-full mb-2" />
          <div className="h-4 bg-zinc-300 rounded w-4/5" />
        </div>
      ))}

      {/* Section 3 — Graph panel skeleton */}
      <div className="bg-zinc-100 rounded h-[480px] flex items-center justify-center">
        <span className="text-zinc-400 text-sm">Loading analysis...</span>
      </div>
    </div>
  )
}
