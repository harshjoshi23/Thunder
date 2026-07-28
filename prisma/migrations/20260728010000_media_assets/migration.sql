-- Phase 2 MediaAsset table
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "analysisRunId" TEXT,
    "projectId" TEXT,
    "kind" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "provenanceJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MediaAsset_analysisRunId_idx" ON "MediaAsset"("analysisRunId");
CREATE INDEX "MediaAsset_projectId_idx" ON "MediaAsset"("projectId");
CREATE INDEX "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");

ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_analysisRunId_fkey" FOREIGN KEY ("analysisRunId") REFERENCES "AnalysisRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
