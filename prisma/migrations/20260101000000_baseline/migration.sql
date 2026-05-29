-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('pending', 'crawling', 'extracting', 'analyzing', 'complete', 'failed');

-- CreateTable
CREATE TABLE "public"."CausalEdge" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "fromIssueId" TEXT NOT NULL,
    "toIssueId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "mechanism" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,

    CONSTRAINT "CausalEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Issue" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "signal_source" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "raw_evidence" TEXT NOT NULL,
    "technical_description" TEXT NOT NULL,
    "fix_suggestion" TEXT NOT NULL DEFAULT '',
    "severity_justification" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Result" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "narrative" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "screenshot_url" TEXT,
    "tech_stack" JSONB,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Job_created_at_idx" ON "public"."Job"("created_at" ASC);

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "public"."Job"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Result_jobId_key" ON "public"."Result"("jobId" ASC);

-- AddForeignKey
ALTER TABLE "public"."CausalEdge" ADD CONSTRAINT "CausalEdge_fromIssueId_fkey" FOREIGN KEY ("fromIssueId") REFERENCES "public"."Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CausalEdge" ADD CONSTRAINT "CausalEdge_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "public"."Result"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CausalEdge" ADD CONSTRAINT "CausalEdge_toIssueId_fkey" FOREIGN KEY ("toIssueId") REFERENCES "public"."Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Issue" ADD CONSTRAINT "Issue_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "public"."Result"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Result" ADD CONSTRAINT "Result_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
