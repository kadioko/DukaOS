const prisma = require("../lib/prisma");

async function getShopId(userId) {
  const shop = await prisma.shop.findUnique({ where: { userId } });
  if (!shop) throw Object.assign(new Error("Shop not found"), { status: 404 });
  return shop.id;
}

function startOf(period) {
  const now = new Date();
  if (period === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "week") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

async function overview(req, res) {
  const shopId = await getShopId(req.user.userId);
  const { period = "today" } = req.query;
  const from = startOf(period);

  const [salesAgg, salesCount, allProducts, pendingOrders, recentSales] = await Promise.all([
    prisma.sale.aggregate({
      where: { shopId, createdAt: { gte: from } },
      _sum: { totalAmount: true, profit: true },
    }),
    prisma.sale.count({ where: { shopId, createdAt: { gte: from } } }),
    prisma.product.findMany({ where: { shopId, isActive: true } }),
    prisma.order.count({ where: { shopId, status: { in: ["PENDING", "CONFIRMED", "OUT_FOR_DELIVERY"] } } }),
    prisma.sale.findMany({
      where: { shopId, createdAt: { gte: from } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, totalAmount: true, profit: true, paymentMethod: true, createdAt: true },
    }),
  ]);

  const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minimumStock);
  const outOfStockProducts = allProducts.filter((p) => p.currentStock === 0);

  // Daily sales chart for the past 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dailySales = await prisma.sale.findMany({
    where: { shopId, createdAt: { gte: sevenDaysAgo } },
    select: { totalAmount: true, profit: true, createdAt: true },
  });

  const dailyMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyMap[key] = { date: key, sales: 0, profit: 0 };
  }
  for (const s of dailySales) {
    const key = s.createdAt.toISOString().split("T")[0];
    if (dailyMap[key]) {
      dailyMap[key].sales += s.totalAmount;
      dailyMap[key].profit += s.profit;
    }
  }

  // Top selling products in period
  const topProducts = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: { sale: { shopId, createdAt: { gte: from } } },
    _sum: { quantity: true, totalPrice: true },
    orderBy: { _sum: { totalPrice: "desc" } },
    take: 5,
  });

  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProducts.map((t) => t.productId) } },
    select: { id: true, name: true, unit: true },
  });
  const topProductMap = Object.fromEntries(topProductDetails.map((p) => [p.id, p]));

  res.json({
    period,
    summary: {
      totalSales: salesAgg._sum.totalAmount || 0,
      totalProfit: salesAgg._sum.profit || 0,
      salesCount,
      pendingOrders,
      totalProducts: allProducts.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
    },
    lowStockAlerts: lowStockProducts.map((p) => ({
      id: p.id,
      name: p.name,
      currentStock: p.currentStock,
      minimumStock: p.minimumStock,
      unit: p.unit,
    })),
    recentSales,
    dailyChart: Object.values(dailyMap),
    topProducts: topProducts.map((t) => ({
      product: topProductMap[t.productId],
      totalQuantity: t._sum.quantity,
      totalRevenue: t._sum.totalPrice,
    })),
  });
}

module.exports = { overview };
