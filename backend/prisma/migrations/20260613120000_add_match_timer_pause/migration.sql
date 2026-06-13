-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "paused_at" TIMESTAMP(3),
ADD COLUMN     "accumulated_paused_ms" INTEGER NOT NULL DEFAULT 0;
