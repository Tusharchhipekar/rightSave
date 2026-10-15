/*
  Warnings:

  - You are about to drop the column `summary` on the `Conversation` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MemoryType" AS ENUM ('factual', 'semantic', 'episodic');

-- DropIndex
DROP INDEX "UserMemory_userId_isActive_idx";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "summary";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "sources" JSONB,
ADD COLUMN     "toolsUsed" JSONB;

-- AlterTable
ALTER TABLE "UserMemory" ADD COLUMN     "type" "MemoryType" NOT NULL DEFAULT 'factual';

-- CreateIndex
CREATE INDEX "UserMemory_userId_isActive_type_idx" ON "UserMemory"("userId", "isActive", "type");
