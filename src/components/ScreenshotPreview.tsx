import Image from 'next/image'

export function ScreenshotPreview({ url, screenshotUrl }: { url: string; screenshotUrl: string }) {
  return (
    <div className="rounded-xl bg-slate-800/50 border border-slate-700/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/60 flex items-center gap-2.5">
        {/* Browser chrome dots */}
        <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
        <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
        <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
        <span className="flex-1 text-center text-xs text-slate-500 font-mono truncate">{url}</span>
      </div>
      <div className="relative w-full aspect-video bg-slate-900">
        <Image
          src={screenshotUrl}
          alt={`Screenshot of ${url}`}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 896px"
          unoptimized
        />
      </div>
    </div>
  )
}
