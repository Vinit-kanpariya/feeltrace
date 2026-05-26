'use client'

import { useState } from 'react'
import { JobStatusBadge } from './JobStatusBadge'
import type { AnalyzeResponse, AnalyzeErrorResponse } from '@/types/job'

export function AnalyzeForm() {
  const [url, setUrl] = useState('')
  const [jobId, setJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setJobId(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (res.status === 202) {
        const data: AnalyzeResponse = await res.json()
        setJobId(data.jobId)
      } else if (res.status === 422) {
        const data: AnalyzeErrorResponse = await res.json()
        setError(data.error)
      } else if (res.status === 429) {
        const body = await res.text()
        setError(body || 'Too many requests. Please try again in a moment.')
      } else if (res.status === 503) {
        const ct = res.headers.get('content-type') ?? ''
        if (ct.includes('application/json')) {
          const data: AnalyzeErrorResponse = await res.json()
          setError(data.error || 'Service busy. Please try again shortly.')
        } else {
          const body = await res.text()
          setError(body || 'Service busy. Please try again shortly.')
        }
      } else if (res.status === 502 || res.status === 500) {
        setError('The analysis service is temporarily unavailable. Please try again in a moment.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Unable to connect. Check your network and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleReset() {
    setJobId(null)
    setError(null)
    setUrl('')
  }

  if (jobId) {
    return (
      <div className="space-y-4">
        <JobStatusBadge jobId={jobId} />
        <button
          onClick={handleReset}
          className="text-sm text-slate-500 hover:text-slate-300 underline underline-offset-4 transition-colors cursor-pointer"
        >
          Analyze a different URL
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div>
        <label
          htmlFor="url-input"
          className="block text-sm font-medium text-slate-300 mb-2"
        >
          Website URL
        </label>
        <input
          id="url-input"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yoursite.com"
          required
          disabled={isSubmitting}
          autoComplete="url"
          className="w-full h-12 px-4 rounded-lg bg-slate-900/70 border border-slate-600/80 text-slate-100 placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 transition-colors"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 p-3.5 rounded-lg bg-red-950/50 border border-red-800/50 text-red-300 text-sm"
        >
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-lg bg-green-500 hover:bg-green-400 active:bg-green-600 text-slate-900 font-semibold text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Starting analysis…
          </>
        ) : (
          'Analyze'
        )}
      </button>
    </form>
  )
}
