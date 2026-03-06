const prisma = require("../lib/prisma");

async function getShopId(userId) {
  const shop = await prisma.shop.findUnique({ where: { userId } });
  if (!shop) throw Object.assign(new Error("Shop not found"), { status: 404 });
  return shop.id;
}

async function list(req, res) {
  const shopId = await getShopId(req.user.userId);
  const { lowStock, search } = req.query;

  const where = { shopId, isActive: true };
  if (search) where.name = { contains: search, mode: "insensitive" };

  const products = await prisma.product.findMany({
    where,
    include: { supplier: { select: { id: true, name: true, phone: true } } },
    orderBy: { name: "asc" },
  });

  const result = lowStock === "true"
    ? products.filter((p) => p.currentStock <= p.minimumStock)
    : products;

  res.json({ products: result });
}

async function get(req, res) {
  const shopId = await getShopId(req.user.userId);
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, shopId },
    include: {
      supplier: { select: { id: true, name: true, phone: true } },
      stockMovements: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ product });
}

async function create(req, res) {
  const shopId = await getShopId(req.user.userId);
  const { name, sku, unit, buyingPrice, sellingPrice, currentStock, minimumStock, supplierId } = req.body;

  if (!name || buyingPrice == null || sellingPrice == null) {
    return res.status(400).json({ error: "name, buyingPrice, and sellingPrice are required" });
  }

  const product = await prisma.product.create({
    data: {
      name,
      sku,
      unit: unit || "pcs",
      buyingPrice: Number(buyingPrice),
      sellingPrice: Number(sellingPrice),
      currentStock: Number(currentStock) || 0,
      minimumStock: Number(minimumStock) || 5,
      shopId,
      supplierId: supplierId || null,
    },
    include: { supplier: { select: { id: true, name: true, phone: true } } },
  });

  // Record initial stock as a stock-in movement
  if (product.currentStock > 0) {
    await prisma.stockMovement.create({
      data: {
        type: "IN",
        quantity: product.currentStock,
        note: "Initial stock",
        productId: product.id,
      },
    });
  }

  res.status(201).json({ product });
}

async function update(req, res) {
  const shopId = await getShopId(req.user.userId);
  const existing = await prisma.product.findFirst({ where: { id: req.params.id, shopId } });
  if (!existing) return res.status(404).json({ error: "Product not found" });

  const { name, sku, unit, buyingPrice, sellingPrice, minimumStock, supplierId, isActive } = req.body;

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(sku !== undefined && { sku }),
      ...(unit !== undefined && { unit }),
      ...(buyingPrice !== undefined && { buyingPrice: Number(buyingPrice) }),
      ...(sellingPrice !== undefined && { sellingPrice: Number(sellingPrice) }),
      ...(minimumStock !== undefined && { minimumStock: Number(minimumStock) }),
      ...(supplierId !== undefined && { supplierId }),
      ...(isActive !== undefined && { isActive }),
    },
    include: { supplier: { select: { id: true, name: true, phone: true } } },
  });

  res.json({ product });
}

async function remove(req, res) {
  const shopId = await getShopId(req.user.userId);
  const existing = await prisma.product.findFirst({ where: { id: req.params.id, shopId } });
  if (!existing) return res.status(404).json({ error: "Product not found" });

  // Soft delete
  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ message: "Product deactivated" });
}

async function getLowStock(req, res) {
  const shopId = await getShopId(req.user.userId);
  const products = await prisma.product.findMany({
    where: {
      shopId,
      isActive: true,
      currentStock: { lte: prisma.product.fields.minimumStock },
    },
    include: { supplier: { select: { id: true, name: true, phone: true } } },
    orderBy: { currentStock: "asc" },
  });
  // Use JS filter since Prisma doesn't support column comparison directly
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  const allProducts = await prisma.product.findMany({
    where: { shopId, isActive: true },
    include: { supplier: { select: { id: true, name: true, phone: true } } },
  });
  const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minimumStock);
  res.json({ products: lowStockProducts });
}

module.exports = { list, get, create, update, remove, getLowStock };
