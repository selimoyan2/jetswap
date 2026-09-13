-- AlterTable
ALTER TABLE "TradeOffer" ADD COLUMN IF NOT EXISTS "parentOfferId" TEXT;
ALTER TABLE "TradeOffer" ADD COLUMN IF NOT EXISTS "revision" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TradeOffer_parentOfferId_idx" ON "TradeOffer"("parentOfferId");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TradeOffer_parentOfferId_fkey'
    ) THEN
        ALTER TABLE "TradeOffer" ADD CONSTRAINT "TradeOffer_parentOfferId_fkey" FOREIGN KEY ("parentOfferId") REFERENCES "TradeOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
