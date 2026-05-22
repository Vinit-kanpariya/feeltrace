'use client'

import { useEffect, useState } from 'react'
import type { JobStatus, JobStatusResponse } from '@/types/job'

export function JobStatusBadge({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<JobStatus>('pending')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    if (status === 'complete' || status === 'failed') return

    const interval = setInterval(async () => {
      const res = await fetch(`/api/jobs/${jobId}`)
      if (!res.ok) return
      const data: JobStatusResponse = await res.json()
      setStatus(data.status)
      if (data.error_message) setError(data.error_message)

      if (data.status === 'complete') {
        const resultsRes = await fetch(`/api/results/${jobId}`)
        if (resultsRes.ok) setResult(await resultsRes.json())
        clearInterval(interval)
      }
      if (data.status === 'failed') clearInterval(interval)
    }, 2000)

    return () => clearInterval(interval)
  }, [jobId, status])

  return (
    <div>
      <span>Status: {status}</span>
      {error && <p className="text-red-600">{error}</p>}
      {result && (
        <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  )
}
