// src/components/JobStatusBadge.test.tsx
// RED test stubs for Phase 4 Wave 0 — contracts for JobStatusBadge D-03 rewrite behavior.
// These tests document the EXPECTED behavior after the D-03 rewrite in Plan 04-03.
// They WILL fail against the current implementation (pre-rewrite) — that is correct at Wave 0.
// Covers: D-03

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { JobStatusBadge } from './JobStatusBadge'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('JobStatusBadge (D-03 rewrite contracts)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockPush.mockClear()
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'complete' }),
    } as Response)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('calls router.push with /results/{jobId} when status is complete', async () => {
    render(<JobStatusBadge jobId="test-job-id" />)

    await act(async () => {
      vi.advanceTimersByTime(2000)
      // Allow promises to settle
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(mockPush).toHaveBeenCalledWith('/results/test-job-id')
  })

  it('displays error message when status is failed with error_message', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'failed', error_message: 'Analysis failed: timeout' }),
    } as Response)

    render(<JobStatusBadge jobId="test-job-id" />)

    await act(async () => {
      vi.advanceTimersByTime(2000)
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(screen.getByText('Analysis failed: timeout')).toBeDefined()
  })

  it('does NOT render a <pre> element (result state removed per D-03)', async () => {
    render(<JobStatusBadge jobId="test-job-id" />)

    await act(async () => {
      vi.advanceTimersByTime(2000)
      await Promise.resolve()
      await Promise.resolve()
    })

    const preElements = document.querySelectorAll('pre')
    expect(preElements).toHaveLength(0)
  })
})
