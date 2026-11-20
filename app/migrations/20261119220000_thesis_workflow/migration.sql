-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "confirmedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blueprint" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "proposalVersion" INTEGER NOT NULL,
    "structure" JSONB NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'generic-template-v1',
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Blueprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThesisSection" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "blueprintKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "requirements" TEXT NOT NULL DEFAULT '',
    "targetWords" INTEGER NOT NULL DEFAULT 1000,
    "dependencies" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThesisSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_projectId_key" ON "Proposal"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Blueprint_projectId_version_key" ON "Blueprint"("projectId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ThesisSection_documentId_key" ON "ThesisSection"("documentId");

-- CreateIndex
CREATE INDEX "ThesisSection_projectId_position_idx" ON "ThesisSection"("projectId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ThesisSection_projectId_blueprintKey_key" ON "ThesisSection"("projectId", "blueprintKey");

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blueprint" ADD CONSTRAINT "Blueprint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThesisSection" ADD CONSTRAINT "ThesisSection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThesisSection" ADD CONSTRAINT "ThesisSection_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
