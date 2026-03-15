-- AlterTable
ALTER TABLE "products" ADD COLUMN "expiryDate" TIMESTAMP(3);
ALTER TABLE "products" ADD COLUMN "doesNotExpire" BOOLEAN NOT NULL DEFAULT false;
