// src/components/ShareButton.test.tsx
// RED test stubs for Phase 4 Wave 0 — contracts for ShareButton clipboard behavior.
// These tests WILL fail until src/components/ShareButton.tsx is created in Wave 3 (Plan 04-05).
// Covers: DASH-04

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ShareButton } from './ShareButton'

// Mock next/navigation — ShareButton does not use router but ensure no import errors
vi.mock('next/navigation', () => ({
  useRouter: () => ({}),
}))

describe('ShareButton', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('calls navigator.clipboard.writeText when button is clicked', async () => {
    render(<ShareButton />)
    const button = screen.getByRole('button')
    await act(async () => {
      fireEvent.click(button)
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledOnce()
  })

  it('shows "Link copied" immediately after click', async () => {
    render(<ShareButton />)
    const button = screen.getByRole('button')
    await act(async () => {
      fireEvent.click(button)
    })
    expect(screen.getByText('Link copied')).toBeDefined()
  })

  it('reverts to "Copy link" after 2000ms', async () => {
    render(<ShareButton />)
    const button = screen.getByRole('button')
    await act(async () => {
      fireEvent.click(button)
    })
    expect(screen.getByText('Link copied')).toBeDefined()

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByText('Copy link')).toBeDefined()
  })
})
