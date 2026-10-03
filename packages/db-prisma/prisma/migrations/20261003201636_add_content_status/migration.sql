-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('pending', 'processing', 'ready', 'failed');

-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "Content_userId_status_idx" ON "Content"("userId", "status");
