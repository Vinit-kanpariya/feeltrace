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

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (res.status === 202) {
        const data: AnalyzeResponse = await res.json()
        setJobId(data.jobId)
        setError(null)
      } else if (res.status === 422) {
        const data: AnalyzeErrorResponse = await res.json()
        setError(data.error)
      } else if (res.status === 429) {
        const body = await res.text()
        setError(body)
      } else if (res.status === 503) {
        const contentType = res.headers.get('content-type') ?? ''
        if (contentType.includes('application/json')) {
          const data: AnalyzeErrorResponse = await res.json()
          setError(data.error || 'Service busy. Please try again shortly.')
        } else {
          const body = await res.text()
          setError(body || 'Service busy. Please try again shortly.')
        }
      } else {
        setError('An unexpected error occurred')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        required
      />
      <button type="submit" disabled={isSubmitting}>
        Analyze
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      {jobId && <JobStatusBadge jobId={jobId} />}
    </form>
  )
}
