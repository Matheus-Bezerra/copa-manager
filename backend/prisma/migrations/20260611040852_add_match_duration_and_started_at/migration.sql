-- AlterTable
ALTER TABLE "championship_rules" ADD COLUMN     "match_duration" INTEGER NOT NULL DEFAULT 90;

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "started_at" TIMESTAMP(3);
