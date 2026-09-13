-- AlterTable
ALTER TABLE "TradeOffer" ADD COLUMN IF NOT EXISTS "senderContactApprovedAt" TIMESTAMP(3);
ALTER TABLE "TradeOffer" ADD COLUMN IF NOT EXISTS "receiverContactApprovedAt" TIMESTAMP(3);
