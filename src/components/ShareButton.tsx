'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function ShareButton() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Could not copy link. URL: ' + url)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`min-h-[44px] px-4 flex items-center gap-2 rounded border ${
        copied
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-transparent border-blue-600 text-blue-600'
      }`}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? 'Link copied' : 'Copy share link'}
    </button>
  )
}
