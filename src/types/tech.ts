// TechProfile shape stored in Result.tech_stack (Prisma Json field)
// New fields are optional for backward compat with records created before the expansion.
export interface TechProfile {
  // Frontend stack
  framework: string | null
  rendering: string
  cdn: string | null
  hosting: string | null
  buildTool: string | null
  cssFramework: string | null
  analytics: string[]
  // Backend + data layer (optional — populated for results after detection expansion)
  database?: string | null
  auth?: string | null
  payments?: string | null
  services?: string[]
  // Architecture metrics
  totalJsBundleKb: number
  totalPageWeightKb: number
  totalRequests: number
  renderBlockingCount: number
  thirdPartyScriptCount: number
  unusedJsPercent: number
}
