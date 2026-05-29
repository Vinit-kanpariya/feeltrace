-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "cross_page_patterns" JSONB;

-- CreateTable
CREATE TABLE "CrawledPage" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "page_index" INTEGER NOT NULL,
    "narrative" JSONB NOT NULL,
    "screenshot_url" TEXT,
    "tech_stack" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrawledPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawledPageIssue" (
    "id" TEXT NOT NULL,
    "crawledPageId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "signal_source" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "raw_evidence" TEXT NOT NULL,
    "technical_description" TEXT NOT NULL,
    "fix_suggestion" TEXT NOT NULL DEFAULT '',
    "severity_justification" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CrawledPageIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawledPageEdge" (
    "id" TEXT NOT NULL,
    "crawledPageId" TEXT NOT NULL,
    "fromIssueId" TEXT NOT NULL,
    "toIssueId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "mechanism" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,

    CONSTRAINT "CrawledPageEdge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrawledPage_resultId_idx" ON "CrawledPage"("resultId");

-- AddForeignKey
ALTER TABLE "CrawledPage" ADD CONSTRAINT "CrawledPage_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawledPageIssue" ADD CONSTRAINT "CrawledPageIssue_crawledPageId_fkey" FOREIGN KEY ("crawledPageId") REFERENCES "CrawledPage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawledPageEdge" ADD CONSTRAINT "CrawledPageEdge_crawledPageId_fkey" FOREIGN KEY ("crawledPageId") REFERENCES "CrawledPage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawledPageEdge" ADD CONSTRAINT "CrawledPageEdge_fromIssueId_fkey" FOREIGN KEY ("fromIssueId") REFERENCES "CrawledPageIssue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawledPageEdge" ADD CONSTRAINT "CrawledPageEdge_toIssueId_fkey" FOREIGN KEY ("toIssueId") REFERENCES "CrawledPageIssue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
