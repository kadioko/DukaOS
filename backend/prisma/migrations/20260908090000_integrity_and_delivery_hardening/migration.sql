-- Retry-safe debt collections, revocable sessions, and claimable push deliveries.
ALTER TABLE "users" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "staff_members" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "assistant_actions" ADD COLUMN "baselineValue" INTEGER;
ALTER TABLE "assistant_actions" ADD COLUMN "outcomeValue" INTEGER;
ALTER TABLE "assistant_actions" ADD COLUMN "outcomeVerifiedAt" TIMESTAMP(3);

ALTER TABLE "debt_payments" ADD COLUMN "requestKey" TEXT;
CREATE UNIQUE INDEX "debt_payments_debtId_requestKey_key"
  ON "debt_payments"("debtId", "requestKey");

ALTER TABLE "notification_preferences" ADD COLUMN "privatePreview" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "push_deliveries" ADD COLUMN "dedupeKey" TEXT;
ALTER TABLE "push_deliveries" ADD COLUMN "leaseId" TEXT;
ALTER TABLE "push_deliveries" ADD COLUMN "leaseExpiresAt" TIMESTAMP(3);

-- Existing delivery rows predate daily deduplication. Their id makes each one unique.
UPDATE "push_deliveries" SET "dedupeKey" = 'legacy:' || "id" WHERE "dedupeKey" IS NULL;
ALTER TABLE "push_deliveries" ALTER COLUMN "dedupeKey" SET NOT NULL;
CREATE UNIQUE INDEX "push_deliveries_dedupeKey_key" ON "push_deliveries"("dedupeKey");
DROP INDEX IF EXISTS "push_deliveries_status_retryAt_idx";
CREATE INDEX "push_deliveries_status_retryAt_leaseExpiresAt_idx"
  ON "push_deliveries"("status", "retryAt", "leaseExpiresAt");
