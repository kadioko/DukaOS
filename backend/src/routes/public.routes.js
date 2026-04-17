const router = require("express").Router();
const prisma = require("../lib/prisma");

// GET /api/public/shops -> list shops that have active products
router.get("/shops", async (req, res, next) => {
  try {
    const shops = await prisma.shop.findMany({
      where: { products: { some: { isActive: true } } },
      select: {
        id: true,
        name: true,
        location: true,
        district: true,
        category: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { name: "asc" },
    });

    res.json({
      shops: shops.map((s) => ({
        id: s.id,
        name: s.name,
        location: s.location,
        district: s.district,
        category: s.category,
        productCount: s._count.products,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/public/products?shopId=&search= -> browse active products
router.get("/products", async (req, res, next) => {
  try {
    const { shopId, search, limit = 100 } = req.query;
    const where = { isActive: true, currentStock: { gt: 0 } };
    if (shopId) where.shopId = String(shopId);
    if (search) where.name = { contains: String(search), mode: "insensitive" };

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        unit: true,
        sellingPrice: true,
        wholesalePrice: true,
        wholesaleMinQty: true,
        currentStock: true,
        shop: { select: { id: true, name: true, location: true, category: true } },
      },
      orderBy: [{ shop: { name: "asc" } }, { name: "asc" }],
      take: Math.min(Number(limit) || 100, 200),
    });

    res.json({ products });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
