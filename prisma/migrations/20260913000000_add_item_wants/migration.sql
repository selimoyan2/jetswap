-- CreateTable
CREATE TABLE IF NOT EXISTS "ItemWant" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "categoryId" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "minimumCondition" "ItemCondition",
    "country" TEXT DEFAULT 'TR',
    "city" TEXT,
    "maxDistanceKm" INTEGER,
    "keywords" TEXT,
    "note" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isFlexible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemWant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ItemWant_itemId_idx" ON "ItemWant"("itemId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ItemWant_categoryId_idx" ON "ItemWant"("categoryId");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ItemWant_itemId_fkey'
    ) THEN
        ALTER TABLE "ItemWant" ADD CONSTRAINT "ItemWant_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ItemWant_categoryId_fkey'
    ) THEN
        ALTER TABLE "ItemWant" ADD CONSTRAINT "ItemWant_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
