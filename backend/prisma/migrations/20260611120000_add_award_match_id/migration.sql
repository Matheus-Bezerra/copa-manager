-- AlterTable
ALTER TABLE "awards" ADD COLUMN "match_id" TEXT;

-- AddForeignKey
ALTER TABLE "awards" ADD CONSTRAINT "awards_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "awards_match_id_idx" ON "awards"("match_id");
