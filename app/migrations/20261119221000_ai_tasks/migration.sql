-- AlterTable
ALTER TABLE "AIJob" ADD COLUMN     "cancelRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "error" TEXT,
ADD COLUMN     "input" JSONB,
ADD COLUMN     "inputTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "output" JSONB,
ADD COLUMN     "outputTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "reservedTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sectionId" TEXT,
ADD COLUMN     "startedAt" TIMESTAMP(3);
