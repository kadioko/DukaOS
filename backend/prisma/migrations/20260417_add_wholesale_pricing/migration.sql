-- Add wholesale pricing fields to products
ALTER TABLE "products" ADD COLUMN "wholesalePrice" DOUBLE PRECISION;
ALTER TABLE "products" ADD COLUMN "wholesaleMinQty" INTEGER;
