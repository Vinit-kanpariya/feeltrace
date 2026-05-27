import type { TechProfile } from '@/types/tech'

const RENDERING_STYLE: Record<string, string> = {
  SSR:     'bg-blue-500/15 border-blue-500/30 text-blue-400',
  SSG:     'bg-purple-500/15 border-purple-500/30 text-purple-400',
  SPA:     'bg-orange-500/15 border-orange-500/30 text-orange-400',
  MPA:     'bg-slate-500/15 border-slate-500/30 text-slate-400',
  unknown: 'bg-slate-700/40 border-slate-600/30 text-slate-500',
}

const RENDERING_DESC: Record<string, string> = {
  SSR:     'Pages generated on-demand by the server on each request',
  SSG:     'Pages pre-built at compile time and served as static files',
  SPA:     'Single-page app — all rendering happens in the browser',
  MPA:     'Traditional multi-page app with full page reloads',
  unknown: 'Rendering model could not be determined',
}

function Badge({ label, category }: { label: string; category: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-slate-700/40 border border-slate-600/40 min-w-0">
      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{category}</span>
      <span className="text-xs font-semibold text-slate-200 truncate">{label}</span>
    </div>
  )
}

function Chip({ label }: { label: string }) {
  return (
    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-700/50 border border-slate-600/40 text-slate-400">
      {label}
    </span>
  )
}

function StackRow({ dot, label, value }: { dot: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-700/40 last:border-0">
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      <span className="text-xs text-slate-500 w-24 shrink-0">{label}</span>
      <span className="text-xs font-medium text-slate-200">{value}</span>
    </div>
  )
}

function ArchStat({ value, label, status }: {
  value: string
  label: string
  status?: 'good' | 'warn' | 'bad' | 'neutral'
}) {
  const valueColor =
    status === 'good'  ? 'text-green-400' :
    status === 'warn'  ? 'text-yellow-400' :
    status === 'bad'   ? 'text-red-400' :
    'text-slate-100'

  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-700/40 min-w-[90px]">
      <span className={`text-lg font-bold tabular-nums leading-none ${valueColor}`}>{value}</span>
      <span className="text-[10px] text-slate-500 text-center leading-tight">{label}</span>
    </div>
  )
}

function ratingJsBundle(kb: number): 'good' | 'warn' | 'bad' {
  return kb < 200 ? 'good' : kb < 500 ? 'warn' : 'bad'
}
function ratingPageWeight(kb: number): 'good' | 'warn' | 'bad' {
  return kb < 500 ? 'good' : kb < 1500 ? 'warn' : 'bad'
}
function ratingRenderBlocking(n: number): 'good' | 'warn' | 'bad' {
  return n === 0 ? 'good' : n <= 2 ? 'warn' : 'bad'
}
function ratingUnusedJs(pct: number): 'good' | 'warn' | 'bad' {
  return pct < 30 ? 'good' : pct < 60 ? 'warn' : 'bad'
}

export function TechStackSection({ tech }: { tech: TechProfile }) {
  const renderingStyle = RENDERING_STYLE[tech.rendering] ?? RENDERING_STYLE.unknown
  const renderingDesc  = RENDERING_DESC[tech.rendering]  ?? RENDERING_DESC.unknown

  // Frontend badges
  const frontendBadges = [
    tech.framework    && { label: tech.framework,    category: 'Framework' },
    tech.buildTool    && { label: tech.buildTool,    category: 'Build tool' },
    tech.cssFramework && { label: tech.cssFramework, category: 'CSS' },
  ].filter(Boolean) as { label: string; category: string }[]

  // Infrastructure badges
  const infraBadges = [
    tech.hosting && { label: tech.hosting, category: 'Hosting' },
    tech.cdn     && { label: tech.cdn,     category: 'CDN' },
  ].filter(Boolean) as { label: string; category: string }[]

  // Data & services badges
  const dataBadges = [
    tech.database && { label: tech.database, category: 'Database' },
    tech.auth     && { label: tech.auth,     category: 'Auth' },
    tech.payments && { label: tech.payments, category: 'Payments' },
  ].filter(Boolean) as { label: string; category: string }[]

  const services = tech.services ?? []

  // Stack layer rows — only shown when 2+ layers detected
  type StackLayer = { dot: string; label: string; value: string }
  const stackLayers: StackLayer[] = []
  if (tech.framework) stackLayers.push({ dot: 'bg-blue-400',   label: 'Frontend', value: `${tech.framework} · ${tech.rendering}` })
  if (tech.hosting || tech.cdn) {
    const infra = [tech.hosting, tech.cdn].filter(Boolean).join(' + ')
    stackLayers.push({ dot: 'bg-violet-400', label: 'Infrastructure', value: infra })
  }
  if (tech.database) stackLayers.push({ dot: 'bg-green-400',  label: 'Database',  value: tech.database })
  if (tech.auth)     stackLayers.push({ dot: 'bg-yellow-400', label: 'Auth',       value: tech.auth })
  if (tech.payments) stackLayers.push({ dot: 'bg-pink-400',   label: 'Payments',   value: tech.payments })

  return (
    <div className="space-y-4">
      {/* ── Tech Stack ── */}
      <section className="rounded-xl bg-slate-800/50 border border-slate-700/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60">
          <h2 className="text-base font-semibold text-slate-100">Tech Stack</h2>
        </div>
        <div className="p-6 space-y-5">

          {frontendBadges.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Frontend</p>
              <div className="flex flex-wrap gap-2">
                {frontendBadges.map(b => <Badge key={b.category} label={b.label} category={b.category} />)}
              </div>
            </div>
          )}

          {infraBadges.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Infrastructure</p>
              <div className="flex flex-wrap gap-2">
                {infraBadges.map(b => <Badge key={b.category} label={b.label} category={b.category} />)}
              </div>
            </div>
          )}

          {dataBadges.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Data &amp; auth</p>
              <div className="flex flex-wrap gap-2">
                {dataBadges.map(b => <Badge key={b.category} label={b.label} category={b.category} />)}
              </div>
            </div>
          )}

          {tech.analytics.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Analytics &amp; tracking</p>
              <div className="flex flex-wrap gap-1.5">
                {tech.analytics.map(a => <Chip key={a} label={a} />)}
              </div>
            </div>
          )}

          {services.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Third-party services</p>
              <div className="flex flex-wrap gap-1.5">
                {services.map(s => <Chip key={s} label={s} />)}
              </div>
            </div>
          )}

          {frontendBadges.length === 0 && infraBadges.length === 0 &&
           dataBadges.length === 0 && tech.analytics.length === 0 && services.length === 0 && (
            <p className="text-sm text-slate-500">No specific technologies detected from network signals.</p>
          )}

          {/* Note: backend and DB are only detectable when the site uses client-exposed BaaS/DBaaS URLs */}
          {dataBadges.length === 0 && (frontendBadges.length > 0 || infraBadges.length > 0) && (
            <p className="text-xs text-slate-600 leading-relaxed">
              Database, auth and backend are only visible when the site makes direct API calls to a BaaS provider (Supabase, Firebase, PlanetScale, etc.). Server-side backends are not observable from browser signals.
            </p>
          )}
        </div>
      </section>

      {/* ── Architecture ── */}
      <section className="rounded-xl bg-slate-800/50 border border-slate-700/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-100">Architecture</h2>
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${renderingStyle}`}>
            {tech.rendering}
          </span>
        </div>
        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-400 leading-relaxed">{renderingDesc}</p>

          {/* Stack overview — only rendered when 2+ detected layers */}
          {stackLayers.length >= 2 && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Stack overview</p>
              <div className="rounded-lg bg-slate-900/60 border border-slate-700/40 px-4 divide-y divide-slate-700/40">
                {stackLayers.map(row => (
                  <StackRow key={row.label} dot={row.dot} label={row.label} value={row.value} />
                ))}
              </div>
            </div>
          )}

          {/* Performance signals */}
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Performance signals</p>
            <div className="flex flex-wrap gap-3">
              <ArchStat value={`${tech.totalJsBundleKb} KB`}     label="JS bundle"        status={ratingJsBundle(tech.totalJsBundleKb)} />
              <ArchStat value={`${tech.totalPageWeightKb} KB`}   label="Page weight"      status={ratingPageWeight(tech.totalPageWeightKb)} />
              <ArchStat value={String(tech.totalRequests)}        label="HTTP requests"    status={tech.totalRequests < 50 ? 'good' : tech.totalRequests < 100 ? 'warn' : 'bad'} />
              <ArchStat value={String(tech.renderBlockingCount)}  label="Render-blocking"  status={ratingRenderBlocking(tech.renderBlockingCount)} />
              <ArchStat value={`${tech.unusedJsPercent}%`}       label="Unused JS"        status={ratingUnusedJs(tech.unusedJsPercent)} />
              <ArchStat value={String(tech.thirdPartyScriptCount)} label="3rd-party scripts" status={tech.thirdPartyScriptCount <= 3 ? 'good' : tech.thirdPartyScriptCount <= 8 ? 'warn' : 'bad'} />
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-slate-600">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Good</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" /> Could be improved</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> Needs attention</span>
          </div>
        </div>
      </section>
    </div>
  )
}
