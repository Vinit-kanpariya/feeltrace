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
      className={`min-h-[44px] px-4 flex items-center gap-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
        copied
          ? 'bg-green-500/15 border-green-500/40 text-green-400'
          : 'bg-white/[0.05] border-white/[0.10] text-slate-400 hover:bg-white/[0.09] hover:border-white/[0.15] hover:text-slate-300'
      }`}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {copied ? 'Link copied' : 'Copy link'}
    </button>
  )
}
