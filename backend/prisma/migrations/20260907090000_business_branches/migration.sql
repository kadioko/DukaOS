ALTER TABLE shops ALTER COLUMN "userId" DROP NOT NULL;
CREATE TABLE branch_transfers (
  id TEXT PRIMARY KEY,
  "businessId" TEXT NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
  "requestKey" TEXT NOT NULL,
  "sourceShopId" TEXT NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
  "targetShopId" TEXT NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
  "sourceProductId" TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  "targetProductId" TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  "unitCost" INTEGER NOT NULL CHECK ("unitCost" >= 0),
  "createdBy" TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ("sourceShopId" <> "targetShopId")
);
CREATE UNIQUE INDEX "branch_transfers_businessId_requestKey_key" ON branch_transfers("businessId", "requestKey");
CREATE INDEX "branch_transfers_businessId_createdAt_idx" ON branch_transfers("businessId", "createdAt");
ALTER TABLE subscription_checkouts ADD COLUMN "extraBranches" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE subscription_checkouts ADD COLUMN kind TEXT NOT NULL DEFAULT 'RENEWAL';
ALTER TABLE subscription_checkouts ADD COLUMN "expectedEndsAt" TIMESTAMP(3);
ALTER TABLE subscription_checkouts ADD COLUMN "providerUserId" TEXT;
ALTER TABLE subscription_payments ADD COLUMN "extraBranches" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE subscription_payments ADD COLUMN kind TEXT NOT NULL DEFAULT 'RENEWAL';
ALTER TABLE shops ADD COLUMN "parentShopId" TEXT;
ALTER TABLE shops ADD COLUMN "branchArchived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE shops ADD COLUMN "additionalBranchSlots" INTEGER NOT NULL DEFAULT 0 CHECK ("additionalBranchSlots" >= 0);
ALTER TABLE shops ADD CONSTRAINT "shops_parentShopId_fkey" FOREIGN KEY ("parentShopId") REFERENCES shops(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE shops ADD CONSTRAINT "shops_owner_or_parent" CHECK (("userId" IS NOT NULL AND "parentShopId" IS NULL) OR ("userId" IS NULL AND "parentShopId" IS NOT NULL));
CREATE INDEX "shops_parentShopId_branchArchived_idx" ON shops("parentShopId", "branchArchived");
DROP INDEX IF EXISTS "products_barcode_key";
DROP INDEX IF EXISTS "products_shopId_barcode_idx";
CREATE UNIQUE INDEX "products_shopId_barcode_key" ON products("shopId", barcode);

-- Billing changes apply to every location in the same commit, including admin,
-- referral and online renewals. Archived locations stay suspended.
CREATE FUNCTION inherit_branch_subscription() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."parentShopId" IS NULL THEN
    IF NEW.plan <> 'PRO' AND EXISTS (SELECT 1 FROM shops WHERE "parentShopId" = NEW.id AND NOT "branchArchived") THEN
      RAISE EXCEPTION 'Archive additional branches before downgrading' USING ERRCODE = '23514';
    END IF;
    UPDATE shops SET plan = NEW.plan, "trialEndsAt" = NEW."trialEndsAt",
      "subscriptionEndsAt" = NEW."subscriptionEndsAt",
      "isActive" = NEW."isActive" AND NEW.plan = 'PRO' AND NOT "branchArchived"
    WHERE "parentShopId" = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER shops_inherit_subscription AFTER UPDATE OF plan, "subscriptionEndsAt", "trialEndsAt", "isActive" ON shops
FOR EACH ROW EXECUTE FUNCTION inherit_branch_subscription();
