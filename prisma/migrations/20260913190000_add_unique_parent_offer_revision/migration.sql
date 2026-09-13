-- Drop old non-unique index if exists
DROP INDEX IF EXISTS "TradeOffer_parentOfferId_idx";

-- Create unique index / constraint for TradeOffer.parentOfferId
CREATE UNIQUE INDEX IF NOT EXISTS "TradeOffer_parentOfferId_key" ON "TradeOffer"("parentOfferId");
