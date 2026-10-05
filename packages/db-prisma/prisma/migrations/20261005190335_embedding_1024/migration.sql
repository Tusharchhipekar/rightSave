-- This is an empty migration.-- This is an empty migration.

UPDATE "Content" SET "embedding" = NULL;
UPDATE "UserMemory" SET "embedding" = NULL;

ALTER TABLE "Content" ALTER COLUMN "embedding" TYPE vector(1024);
ALTER TABLE "UserMemory" ALTER COLUMN "embedding" TYPE vector(1024);