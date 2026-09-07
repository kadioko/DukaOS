CREATE TABLE "subscription_checkouts" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "shopId" TEXT NOT NULL REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "requestKey" TEXT NOT NULL,
  "activeShopKey" TEXT,
  "providerId" TEXT,
  "plan" TEXT NOT NULL,
  "amount" INTEGER NOT NULL CHECK ("amount" > 0),
  "phone" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "subscription_checkouts_requestKey_key" ON "subscription_checkouts"("requestKey");
CREATE UNIQUE INDEX "subscription_checkouts_activeShopKey_key" ON "subscription_checkouts"("activeShopKey");
CREATE UNIQUE INDEX "subscription_checkouts_providerId_key" ON "subscription_checkouts"("providerId");
CREATE INDEX "subscription_checkouts_shopId_createdAt_idx" ON "subscription_checkouts"("shopId", "createdAt");
CREATE INDEX "subscription_checkouts_status_updatedAt_idx" ON "subscription_checkouts"("status", "updatedAt");
