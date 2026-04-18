-- Create enums
CREATE TYPE "SaleChannel" AS ENUM ('POS', 'ONLINE');
CREATE TYPE "PricingTier" AS ENUM ('RETAIL', 'WHOLESALE');

-- Add channel and pricingTier to sales
ALTER TABLE "sales" ADD COLUMN "channel" "SaleChannel" NOT NULL DEFAULT 'POS';
ALTER TABLE "sales" ADD COLUMN "pricingTier" "PricingTier" NOT NULL DEFAULT 'RETAIL';

-- Create customer_orders table
CREATE TABLE "customer_orders" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "note" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "customer_orders_pkey" PRIMARY KEY ("id")
);

-- Create customer_order_items table
CREATE TABLE "customer_order_items" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "pricingTier" "PricingTier" NOT NULL DEFAULT 'RETAIL',
    "productId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    CONSTRAINT "customer_order_items_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys
ALTER TABLE "customer_orders" ADD CONSTRAINT "customer_orders_shopId_fkey"
    FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "customer_order_items" ADD CONSTRAINT "customer_order_items_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "customer_order_items" ADD CONSTRAINT "customer_order_items_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "customer_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
