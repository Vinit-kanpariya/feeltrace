'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { JobStatus, JobStatusResponse } from '@/types/job'

export function JobStatusBadge({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<JobStatus>('pending')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (status === 'complete' || status === 'failed') return

    const interval = setInterval(async () => {
      const res = await fetch(`/api/jobs/${jobId}`)
      if (!res.ok) return
      const data: JobStatusResponse = await res.json()
      setStatus(data.status)
      if (data.error_message) setError(data.error_message)

      if (data.status === 'complete') {
        clearInterval(interval)
        router.push(`/results/${jobId}`)
      }
      if (data.status === 'failed') clearInterval(interval)
    }, 2000)

    return () => clearInterval(interval)
  }, [jobId, status, router])

  return (
    <div>
      <span>Status: {status}</span>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  )
}
