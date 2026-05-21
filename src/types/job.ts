// src/types/job.ts
// Shared TypeScript types consumed by all API routes and UI components.
// Source: .planning/phases/01-data-foundation-and-security-baseline/01-03-PLAN.md Task 1
// Must stay in sync with the JobStatus enum in prisma/schema.prisma (D-18).

/**
 * Job status lifecycle values.
 * Maps to the JobStatus enum in prisma/schema.prisma.
 * pending → crawling → extracting → analyzing → complete | failed
 */
export type JobStatus =
  | 'pending'
  | 'crawling'
  | 'extracting'
  | 'analyzing'
  | 'complete'
  | 'failed'

/**
 * Response shape for GET /api/jobs/[jobId].
 * Used by the client-side polling component (JobStatusBadge) to track job progress.
 */
export interface JobStatusResponse {
  status: JobStatus
  error_message?: string
}

/**
 * Response shape for POST /api/analyze (success).
 * Returns the created job ID so the client can begin polling.
 */
export interface AnalyzeResponse {
  jobId: string
}

/**
 * Response shape for POST /api/analyze (error).
 * code is a machine-readable error token (e.g. BLOCKED_IP, BLOCKED_SCHEME, QUEUE_FULL).
 */
export interface AnalyzeErrorResponse {
  error: string
  code?: string
}
