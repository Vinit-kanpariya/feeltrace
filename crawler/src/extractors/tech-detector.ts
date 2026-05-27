import type { BrowserFingerprint, JSSignals, NetworkSignals, TechProfile } from '../lib/types'

export function buildTechProfile(
  fingerprint: BrowserFingerprint | undefined,
  jsSignals: JSSignals,
  networkSignals: NetworkSignals,
): TechProfile {
  const urls = networkSignals.entries.map((e) => e.url)
  const urlsLower = urls.map((u) => u.toLowerCase())

  const framework = detectFramework(fingerprint, jsSignals, urlsLower)
  const rendering = detectRendering(fingerprint, framework)
  const cdn = detectCDN(networkSignals)
  const hosting = detectHosting(urlsLower)
  const buildTool = detectBuildTool(urlsLower)
  const cssFramework = detectCSSFramework(urlsLower)
  const analytics = detectAnalytics(urlsLower)
  const database = detectDatabase(fingerprint, urlsLower)
  const auth = detectAuth(fingerprint, urlsLower)
  const payments = detectPayments(fingerprint, urlsLower)
  const services = detectServices(urlsLower)

  const totalJsBundleKb = Math.round(jsSignals.totalJSBytes / 1024)
  const totalPageWeightKb = Math.round(networkSignals.totalTransferSize / 1024)

  return {
    framework,
    rendering,
    cdn,
    hosting,
    buildTool,
    cssFramework,
    analytics,
    database,
    auth,
    payments,
    services,
    totalJsBundleKb,
    totalPageWeightKb,
    totalRequests: networkSignals.totalRequests,
    renderBlockingCount: networkSignals.renderBlockingCount,
    thirdPartyScriptCount: jsSignals.thirdPartyScriptCount,
    unusedJsPercent: Math.round(jsSignals.unusedJSPercent),
  }
}

function detectFramework(
  fp: BrowserFingerprint | undefined,
  jsSignals: JSSignals,
  urlsLower: string[],
): string | null {
  // Browser fingerprint takes highest priority (runtime globals)
  if (fp?.hasNextData) return 'Next.js'
  if (fp?.hasGatsby) return 'Gatsby'
  if (fp?.hasNuxt) return 'Nuxt'
  if (fp?.hasVue) return 'Vue'
  if (fp?.hasAngular) return 'Angular'

  // JS signal fingerprint (from script URLs collected during crawl)
  const prints = jsSignals.frameworkFingerprint.map((s) => s.toLowerCase())
  if (prints.some((p) => p.includes('next'))) return 'Next.js'
  if (prints.some((p) => p.includes('gatsby'))) return 'Gatsby'
  if (prints.some((p) => p.includes('nuxt'))) return 'Nuxt'
  if (prints.some((p) => p.includes('angular'))) return 'Angular'
  if (prints.some((p) => p.includes('svelte'))) return 'Svelte'
  if (prints.some((p) => p.includes('ember'))) return 'Ember'
  if (prints.some((p) => p.includes('react'))) return 'React'
  if (prints.some((p) => p.includes('vue'))) return 'Vue'
  if (fp?.hasReactRoot) return 'React'

  // CMS / platform detection from URL patterns
  if (urlsLower.some((u) => u.includes('wp-content') || u.includes('wp-includes'))) return 'WordPress'
  if (urlsLower.some((u) => u.includes('shopify'))) return 'Shopify'
  if (urlsLower.some((u) => u.includes('webflow'))) return 'Webflow'
  if (urlsLower.some((u) => u.includes('squarespace'))) return 'Squarespace'
  if (urlsLower.some((u) => u.includes('wix'))) return 'Wix'
  if (urlsLower.some((u) => u.includes('hubspot'))) return 'HubSpot CMS'

  return null
}

function detectRendering(fp: BrowserFingerprint | undefined, framework: string | null): string {
  if (framework === 'Next.js') {
    // Next.js can be SSR, SSG, or ISR — fp.hasNextData is present for all three
    // Without a server-side signal we default to SSR as the safer assumption
    return 'SSR'
  }
  if (framework === 'Gatsby') return 'SSG'
  if (framework === 'Nuxt') return 'SSR'
  if (framework === 'Webflow' || framework === 'Squarespace' || framework === 'Wix') return 'SSG'
  if (framework === 'WordPress' || framework === 'HubSpot CMS') return 'MPA'
  if (fp?.hasReactRoot || framework === 'React' || framework === 'Vue' || framework === 'Angular' || framework === 'Svelte') return 'SPA'
  return 'unknown'
}

function detectCDN(networkSignals: NetworkSignals): string | null {
  const counts: Record<string, number> = {}
  for (const entry of networkSignals.entries) {
    if (entry.cdnProvider) {
      counts[entry.cdnProvider] = (counts[entry.cdnProvider] ?? 0) + 1
    }
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] ?? null
}

function detectHosting(urlsLower: string[]): string | null {
  if (urlsLower.some((u) => u.includes('.vercel.app') || u.includes('vercel-scripts'))) return 'Vercel'
  if (urlsLower.some((u) => u.includes('.netlify.app') || u.includes('netlify'))) return 'Netlify'
  if (urlsLower.some((u) => u.includes('pages.dev') || u.includes('cloudflareinsights'))) return 'Cloudflare Pages'
  if (urlsLower.some((u) => u.includes('.amplifyapp.com'))) return 'AWS Amplify'
  if (urlsLower.some((u) => u.includes('railway.app'))) return 'Railway'
  if (urlsLower.some((u) => u.includes('fly.dev'))) return 'Fly.io'
  if (urlsLower.some((u) => u.includes('github.io'))) return 'GitHub Pages'
  if (urlsLower.some((u) => u.includes('render.com'))) return 'Render'
  if (urlsLower.some((u) => u.includes('heroku'))) return 'Heroku'
  return null
}

function detectBuildTool(urlsLower: string[]): string | null {
  if (urlsLower.some((u) => u.includes('/_next/'))) return 'Next.js (Webpack/Turbopack)'
  if (urlsLower.some((u) => u.includes('/@vite/') || u.includes('.vite/'))) return 'Vite'
  if (urlsLower.some((u) => /\/assets\/index-[a-z0-9]+\.(js|css)/.test(u))) return 'Vite'
  if (urlsLower.some((u) => u.includes('/gatsby-'))) return 'Gatsby (Webpack)'
  if (urlsLower.some((u) => u.includes('/chunk.'))) return 'Webpack'
  if (urlsLower.some((u) => u.includes('/parcel'))) return 'Parcel'
  if (urlsLower.some((u) => u.includes('/rollup'))) return 'Rollup'
  return null
}

function detectCSSFramework(urlsLower: string[]): string | null {
  if (urlsLower.some((u) => u.includes('bootstrap'))) return 'Bootstrap'
  if (urlsLower.some((u) => u.includes('tailwind'))) return 'Tailwind CSS'
  if (urlsLower.some((u) => u.includes('bulma'))) return 'Bulma'
  if (urlsLower.some((u) => u.includes('material-ui') || u.includes('@mui'))) return 'Material UI'
  if (urlsLower.some((u) => u.includes('antd') || u.includes('ant-design'))) return 'Ant Design'
  if (urlsLower.some((u) => u.includes('chakra'))) return 'Chakra UI'
  if (urlsLower.some((u) => u.includes('foundation'))) return 'Foundation'
  return null
}

function detectAnalytics(urlsLower: string[]): string[] {
  const hits: string[] = []
  if (urlsLower.some((u) => u.includes('google-analytics') || u.includes('googletagmanager') || u.includes('/gtag/'))) hits.push('Google Analytics')
  if (urlsLower.some((u) => u.includes('hotjar'))) hits.push('Hotjar')
  if (urlsLower.some((u) => u.includes('mixpanel'))) hits.push('Mixpanel')
  if (urlsLower.some((u) => u.includes('amplitude'))) hits.push('Amplitude')
  if (urlsLower.some((u) => u.includes('segment.com') || u.includes('segment.io'))) hits.push('Segment')
  if (urlsLower.some((u) => u.includes('fullstory'))) hits.push('FullStory')
  if (urlsLower.some((u) => u.includes('heap'))) hits.push('Heap')
  if (urlsLower.some((u) => u.includes('posthog'))) hits.push('PostHog')
  if (urlsLower.some((u) => u.includes('intercom'))) hits.push('Intercom')
  if (urlsLower.some((u) => u.includes('clarity.ms'))) hits.push('Microsoft Clarity')
  if (urlsLower.some((u) => u.includes('logrocket'))) hits.push('LogRocket')
  if (urlsLower.some((u) => u.includes('datadog-browser'))) hits.push('Datadog RUM')
  if (urlsLower.some((u) => u.includes('vercel-analytics') || u.includes('/_vercel/insights'))) hits.push('Vercel Analytics')
  if (urlsLower.some((u) => u.includes('vitals.vercel-insights'))) hits.push('Vercel Speed Insights')
  if (urlsLower.some((u) => u.includes('plausible.io'))) hits.push('Plausible')
  if (urlsLower.some((u) => u.includes('umami'))) hits.push('Umami')
  if (urlsLower.some((u) => u.includes('pirsch.io'))) hits.push('Pirsch')
  return hits
}

function detectDatabase(fp: BrowserFingerprint | undefined, urlsLower: string[]): string | null {
  // Firebase takes priority — check window global first
  if (fp?.hasFirebase || urlsLower.some((u) => u.includes('firebaseio.com') || u.includes('firestore.googleapis.com') || u.includes('firebase.google.com'))) return 'Firebase'
  if (fp?.hasSupabase || urlsLower.some((u) => u.includes('.supabase.co') || u.includes('supabase.io'))) return 'Supabase'
  if (urlsLower.some((u) => u.includes('planetscale.com'))) return 'PlanetScale'
  if (urlsLower.some((u) => u.includes('neon.tech') || u.includes('neondb.net'))) return 'Neon (PostgreSQL)'
  if (urlsLower.some((u) => u.includes('.mongodb.net') || u.includes('cloud.mongodb.com'))) return 'MongoDB Atlas'
  if (urlsLower.some((u) => u.includes('convex.cloud') || u.includes('convex.site'))) return 'Convex'
  if (urlsLower.some((u) => u.includes('turso.tech') || u.includes('.turso.io'))) return 'Turso'
  if (urlsLower.some((u) => u.includes('upstash.io'))) return 'Upstash (Redis)'
  if (urlsLower.some((u) => u.includes('xata.io'))) return 'Xata'
  if (urlsLower.some((u) => u.includes('appwrite.io'))) return 'Appwrite'
  if (urlsLower.some((u) => u.includes('fauna.com') || u.includes('fauna.net'))) return 'FaunaDB'
  if (urlsLower.some((u) => u.includes('hasura.io') || u.includes('.hasura.app'))) return 'Hasura (GraphQL)'
  return null
}

function detectAuth(fp: BrowserFingerprint | undefined, urlsLower: string[]): string | null {
  if (fp?.hasClerk || urlsLower.some((u) => u.includes('clerk.com') || u.includes('clerk.dev') || u.includes('clerk.accounts.dev'))) return 'Clerk'
  if (fp?.hasAuth0 || urlsLower.some((u) => u.includes('auth0.com'))) return 'Auth0'
  if (fp?.hasFirebase || urlsLower.some((u) => u.includes('identitytoolkit.googleapis.com') || u.includes('securetoken.googleapis.com'))) return 'Firebase Auth'
  if (fp?.hasSupabase || urlsLower.some((u) => u.includes('.supabase.co/auth'))) return 'Supabase Auth'
  if (urlsLower.some((u) => u.includes('cognito-idp.') || u.includes('.auth.us-') || u.includes('.auth.eu-'))) return 'AWS Cognito'
  if (urlsLower.some((u) => u.includes('okta.com'))) return 'Okta'
  if (urlsLower.some((u) => u.includes('kinde.com'))) return 'Kinde'
  if (urlsLower.some((u) => u.includes('stytch.com'))) return 'Stytch'
  if (urlsLower.some((u) => u.includes('next-auth') || u.includes('nextauth'))) return 'NextAuth.js'
  if (urlsLower.some((u) => u.includes('workos.com'))) return 'WorkOS'
  return null
}

function detectPayments(fp: BrowserFingerprint | undefined, urlsLower: string[]): string | null {
  if (fp?.hasStripe || urlsLower.some((u) => u.includes('js.stripe.com') || u.includes('stripe.com/v'))) return 'Stripe'
  if (fp?.hasPaddle || urlsLower.some((u) => u.includes('paddle.com') || u.includes('paddle.js'))) return 'Paddle'
  if (urlsLower.some((u) => u.includes('paypal.com') || u.includes('paypalobjects.com'))) return 'PayPal'
  if (urlsLower.some((u) => u.includes('braintreegateway.com'))) return 'Braintree'
  if (urlsLower.some((u) => u.includes('square.com') || u.includes('squareup.com'))) return 'Square'
  if (urlsLower.some((u) => u.includes('adyen.com'))) return 'Adyen'
  if (urlsLower.some((u) => u.includes('lemonsqueezy.com') || u.includes('lemoncommerce.app'))) return 'Lemon Squeezy'
  if (urlsLower.some((u) => u.includes('chargebee.com'))) return 'Chargebee'
  if (urlsLower.some((u) => u.includes('recurly.com'))) return 'Recurly'
  return null
}

function detectServices(urlsLower: string[]): string[] {
  const hits: string[] = []
  // Email
  if (urlsLower.some((u) => u.includes('sendgrid.net') || u.includes('sendgrid.com'))) hits.push('SendGrid')
  if (urlsLower.some((u) => u.includes('mailchimp.com') || u.includes('list-manage.com'))) hits.push('Mailchimp')
  if (urlsLower.some((u) => u.includes('resend.com'))) hits.push('Resend')
  if (urlsLower.some((u) => u.includes('postmarkapp.com'))) hits.push('Postmark')
  // Maps
  if (urlsLower.some((u) => u.includes('maps.googleapis.com') || u.includes('maps.gstatic.com'))) hits.push('Google Maps')
  if (urlsLower.some((u) => u.includes('api.mapbox.com') || u.includes('mapbox.com'))) hits.push('Mapbox')
  // Search
  if (urlsLower.some((u) => u.includes('algolia.net') || u.includes('algolia.com'))) hits.push('Algolia')
  if (urlsLower.some((u) => u.includes('typesense.org'))) hits.push('Typesense')
  // Realtime / websockets
  if (urlsLower.some((u) => u.includes('pusher.com') || u.includes('pusherapp.com'))) hits.push('Pusher')
  if (urlsLower.some((u) => u.includes('ably.com') || u.includes('ably.net') || u.includes('ably.io'))) hits.push('Ably')
  if (urlsLower.some((u) => u.includes('getstream.io'))) hits.push('Stream')
  // Media / CDN / uploads
  if (urlsLower.some((u) => u.includes('cloudinary.com'))) hits.push('Cloudinary')
  if (urlsLower.some((u) => u.includes('imgix.net'))) hits.push('imgix')
  if (urlsLower.some((u) => u.includes('b-cdn.net') || u.includes('bunnycdn.net') || u.includes('bunny.net'))) hits.push('BunnyCDN')
  if (urlsLower.some((u) => u.includes('imagekit.io'))) hits.push('ImageKit')
  if (urlsLower.some((u) => u.includes('mux.com'))) hits.push('Mux')
  if (urlsLower.some((u) => u.includes('uploadcare.com'))) hits.push('Uploadcare')
  // Error monitoring
  if (urlsLower.some((u) => u.includes('sentry.io') || u.includes('browser.sentry-cdn.com'))) hits.push('Sentry')
  if (urlsLower.some((u) => u.includes('bugsnag.com'))) hits.push('Bugsnag')
  if (urlsLower.some((u) => u.includes('newrelic.com') || u.includes('nr-data.net'))) hits.push('New Relic')
  if (urlsLower.some((u) => u.includes('rollbar.com'))) hits.push('Rollbar')
  // CMS headless
  if (urlsLower.some((u) => u.includes('contentful.com'))) hits.push('Contentful')
  if (urlsLower.some((u) => u.includes('sanity.io'))) hits.push('Sanity')
  if (urlsLower.some((u) => u.includes('prismic.io'))) hits.push('Prismic')
  if (urlsLower.some((u) => u.includes('ghost.io') || u.includes('ghost.org'))) hits.push('Ghost')
  if (urlsLower.some((u) => u.includes('hygraph.com'))) hits.push('Hygraph')
  // Feature flags
  if (urlsLower.some((u) => u.includes('launchdarkly.com'))) hits.push('LaunchDarkly')
  if (urlsLower.some((u) => u.includes('split.io'))) hits.push('Split')
  if (urlsLower.some((u) => u.includes('growthbook.io'))) hits.push('GrowthBook')
  // Customer support / chat
  if (urlsLower.some((u) => u.includes('zendesk.com'))) hits.push('Zendesk')
  if (urlsLower.some((u) => u.includes('crisp.chat') || u.includes('crisp.website'))) hits.push('Crisp')
  if (urlsLower.some((u) => u.includes('tawk.to'))) hits.push('tawk.to')
  if (urlsLower.some((u) => u.includes('freshdesk.com') || u.includes('freshworks.com'))) hits.push('Freshdesk')
  return hits
}
