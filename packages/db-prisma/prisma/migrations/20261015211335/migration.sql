/*
  Warnings:

  - You are about to drop the `UserMemory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserMemory" DROP CONSTRAINT "UserMemory_userId_fkey";

-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "summary" TEXT;

-- DropTable
DROP TABLE "UserMemory";

-- DropEnum
DROP TYPE "MemorySource";

-- DropEnum
DROP TYPE "MemoryType";
