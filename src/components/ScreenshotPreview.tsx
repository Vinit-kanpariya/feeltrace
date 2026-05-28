'use client'

import { useState } from 'react'
import Image from 'next/image'

export function ScreenshotPreview({ url, screenshotUrl }: { url: string; screenshotUrl: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="rounded-xl bg-[#131f35] border border-white/[0.08] overflow-hidden">
      {/* Browser chrome */}
      <div className="px-4 py-2.5 border-b border-white/[0.07] bg-[#1b2336] flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-center text-[11px] text-[#475569] font-mono truncate bg-black/30 px-[10px] py-[3px] rounded mx-2">
          {url}
        </span>
      </div>
      <div className="relative w-full aspect-video bg-[#0d1929]">
        {failed ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-[12px] font-mono text-[#2d4a6e]">screenshot unavailable</span>
          </div>
        ) : (
          <Image
            src={screenshotUrl}
            alt={`Screenshot of ${url}`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 896px"
            unoptimized
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  )
}
