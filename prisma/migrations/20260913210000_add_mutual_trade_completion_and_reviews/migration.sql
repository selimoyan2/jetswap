-- AlterTable: Add completion confirmation timestamps
ALTER TABLE "TradeOffer" ADD COLUMN IF NOT EXISTS "senderCompletionConfirmedAt" TIMESTAMP(3);
ALTER TABLE "TradeOffer" ADD COLUMN IF NOT EXISTS "receiverCompletionConfirmedAt" TIMESTAMP(3);

-- AlterTable: Drop single-column unique constraint on Review(offerId)
DROP INDEX IF EXISTS "Review_offerId_key";

-- AlterTable: Add compound unique constraint on Review(offerId, authorId)
CREATE UNIQUE INDEX IF NOT EXISTS "Review_offerId_authorId_key" ON "Review"("offerId", "authorId");

-- AlterTable: Add lookup indexes for Review queries
CREATE INDEX IF NOT EXISTS "Review_targetUserId_idx" ON "Review"("targetUserId");
CREATE INDEX IF NOT EXISTS "Review_authorId_idx" ON "Review"("authorId");
