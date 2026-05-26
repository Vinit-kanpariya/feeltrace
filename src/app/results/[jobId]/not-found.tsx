// src/app/results/[jobId]/not-found.tsx
// Rendered when notFound() is called in page.tsx (D-05).
// Server Component by default (no 'use client').
// Pattern: RESEARCH.md Pattern 8 + UI-SPEC copywriting contract.

import Link from 'next/link'

export default function ResultNotFound() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-semibold">Results not found</h2>
      <p className="mt-4 text-base">
        This analysis link may have expired or never existed.{' '}
        <Link href="/" className="text-blue-600 underline">
          Return to the home page
        </Link>{' '}
        to run a new analysis.
      </p>
    </main>
  )
}
