const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Create a demo supplier
  const supplierUser = await prisma.user.upsert({
    where: { phone: "+255700000001" },
    update: {},
    create: {
      phone: "+255700000001",
      pin: await bcrypt.hash("1234", 10),
      name: "Jumla Traders",
      role: "SUPPLIER",
    },
  });

  const supplier = await prisma.supplier.upsert({
    where: { userId: supplierUser.id },
    update: {},
    create: {
      name: "Jumla Traders Ltd",
      phone: "+255700000001",
      address: "Kariakoo, Dar es Salaam",
      userId: supplierUser.id,
    },
  });

  // Create a demo merchant
  const merchantUser = await prisma.user.upsert({
    where: { phone: "+255700000002" },
    update: {},
    create: {
      phone: "+255700000002",
      pin: await bcrypt.hash("1234", 10),
      name: "Mama Amina",
      role: "MERCHANT",
    },
  });

  const shop = await prisma.shop.upsert({
    where: { userId: merchantUser.id },
    update: {},
    create: {
      name: "Duka la Amina",
      location: "Mbagala",
      district: "Temeke",
      category: "grocery",
      userId: merchantUser.id,
    },
  });

  // Seed demo products
  const products = [
    {
      name: "Unga wa Sembe (2kg)",
      sku: "UNG001",
      unit: "bag",
      buyingPrice: 2800,
      sellingPrice: 3200,
      currentStock: 30,
      minimumStock: 10,
      shopId: shop.id,
      supplierId: supplier.id,
    },
    {
      name: "Mchele (1kg)",
      sku: "MCH001",
      unit: "kg",
      buyingPrice: 1800,
      sellingPrice: 2200,
      currentStock: 4,
      minimumStock: 10,
      shopId: shop.id,
      supplierId: supplier.id,
    },
    {
      name: "Mafuta ya Kupikia (1L)",
      sku: "MAF001",
      unit: "litre",
      buyingPrice: 3500,
      sellingPrice: 4000,
      currentStock: 12,
      minimumStock: 5,
      shopId: shop.id,
      supplierId: supplier.id,
    },
    {
      name: "Sukari (1kg)",
      sku: "SUK001",
      unit: "kg",
      buyingPrice: 2200,
      sellingPrice: 2600,
      currentStock: 3,
      minimumStock: 8,
      shopId: shop.id,
      supplierId: supplier.id,
    },
    {
      name: "Sabuni ya Kufulia (bar)",
      sku: "SAB001",
      unit: "bar",
      buyingPrice: 600,
      sellingPrice: 800,
      currentStock: 25,
      minimumStock: 10,
      shopId: shop.id,
      supplierId: supplier.id,
    },
    {
      name: "Chumvi (500g)",
      sku: "CHU001",
      unit: "pkt",
      buyingPrice: 300,
      sellingPrice: 500,
      currentStock: 20,
      minimumStock: 10,
      shopId: shop.id,
      supplierId: supplier.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.sku || product.name },
      update: {},
      create: product,
    });
  }

  console.log("✅ Seed complete");
  console.log("📱 Merchant login: +255700000002 / PIN: 1234");
  console.log("🏭 Supplier login: +255700000001 / PIN: 1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
