import { describe, it, expect } from 'vitest'
import { isAllowedBlobUrl } from './route'

describe('isAllowedBlobUrl', () => {
  it('accepts a public-subdomain Vercel Blob URL', () => {
    expect(
      isAllowedBlobUrl('https://abc123xyz.public.blob.vercel-storage.com/screenshots/shot.jpg')
    ).toBe(true)
  })

  it('accepts a hyphenated store-id Vercel Blob URL', () => {
    expect(
      isAllowedBlobUrl('https://my-store-01.public.blob.vercel-storage.com/file.png')
    ).toBe(true)
  })

  it('accepts the legacy top-level blob.vercel-storage.com URL', () => {
    expect(
      isAllowedBlobUrl('https://blob.vercel-storage.com/file.jpg')
    ).toBe(true)
  })

  it('rejects an arbitrary HTTPS URL', () => {
    expect(isAllowedBlobUrl('https://evil.com/steal.jpg')).toBe(false)
  })

  it('rejects a URL that only contains the domain as a path segment', () => {
    expect(
      isAllowedBlobUrl('https://evil.com/blob.vercel-storage.com/file.jpg')
    ).toBe(false)
  })

  it('rejects a blob subdomain that is not a Vercel Blob store', () => {
    expect(
      isAllowedBlobUrl('https://evil.blob.evil.com/file.jpg')
    ).toBe(false)
  })
})
