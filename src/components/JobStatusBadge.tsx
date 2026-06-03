'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { JobStatus, JobStatusResponse } from '@/types/job'

const STEPS: { key: JobStatus; label: string }[] = [
  { key: 'pending', label: 'Queued' },
  { key: 'crawling', label: 'Crawling' },
  { key: 'extracting', label: 'Extracting' },
  { key: 'analyzing', label: 'Analyzing' },
  { key: 'complete', label: 'Complete' },
]

function stepIndex(status: JobStatus): number {
  const i = STEPS.findIndex((s) => s.key === status)
  return i === -1 ? 0 : i
}

// Poll faster while queued (transitions quickly), slower during long-running phases.
// crawling lasts ~50s, analyzing ~20s — no need to hammer the API every 2s.
function pollInterval(status: JobStatus): number {
  if (status === 'pending') return 3_000
  if (status === 'crawling') return 10_000
  return 3_000
}

export function JobStatusBadge({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<JobStatus>('pending')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (status === 'complete' || status === 'failed') return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`)
        if (!res.ok) return
        const data: JobStatusResponse = await res.json()
        setStatus(data.status)
        if (data.error_message) setErrorMsg(data.error_message)
        if (data.status === 'complete') {
          clearInterval(interval)
          router.push(`/results/${jobId}`)
        }
        if (data.status === 'failed') clearInterval(interval)
      } catch {
        // network hiccup — retry on next tick
      }
    }, pollInterval(status))

    return () => clearInterval(interval)
  }, [jobId, status, router])

  if (status === 'failed') {
    return (
      <div role="alert" className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 space-y-1.5">
        <p className="text-sm font-semibold text-red-300">Analysis failed</p>
        {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
        <p className="text-xs text-slate-500">
          The crawler service may be unavailable. Please try again shortly.
        </p>
      </div>
    )
  }

  const current = stepIndex(status)

  return (
    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-200">Analysis in progress</p>
        <span className="text-xs text-slate-500">Redirecting when complete</span>
      </div>

      {/* Step track */}
      <div className="flex items-start" role="status" aria-label={`Analysis status: ${STEPS[current]?.label}`}>
        {STEPS.map((step, idx) => {
          const done = idx < current
          const active = idx === current
          const pending = idx > current

          return (
            <div key={step.key} className="flex items-start flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                <div
                  className={[
                    'w-2.5 h-2.5 rounded-full transition-all duration-300 shrink-0',
                    done ? 'bg-green-500' : '',
                    active ? 'bg-green-400 ring-4 ring-green-500/25 animate-pulse' : '',
                    pending ? 'bg-slate-600' : '',
                  ].join(' ')}
                />
                <span
                  className={[
                    'text-[10px] font-medium leading-none text-center',
                    done ? 'text-green-500' : '',
                    active ? 'text-green-400' : '',
                    pending ? 'text-slate-600' : '',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={[
                    'flex-1 h-px mt-[5px] mx-1 transition-colors duration-500',
                    done ? 'bg-green-500/50' : 'bg-slate-700',
                  ].join(' ')}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
