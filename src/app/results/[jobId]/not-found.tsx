// src/app/results/[jobId]/not-found.tsx
// Rendered when notFound() is called in page.tsx (D-05).
// Server Component by default (no 'use client').
// Pattern: RESEARCH.md Pattern 8 + UI-SPEC copywriting contract.

import Link from 'next/link'

export default function ResultNotFound() {
  return (
    <div className="min-h-dvh bg-[#0f172a] flex flex-col items-center justify-center px-6">
      <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center mb-6">
        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-100 mb-2 text-center">Results not found</h2>
      <p className="text-sm text-slate-400 text-center max-w-sm leading-relaxed mb-6">
        This analysis link may have expired or never existed.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-green-500 hover:bg-green-400 text-slate-900 font-semibold text-sm transition-colors"
      >
        Run a new analysis
      </Link>
    </div>
  )
}
