const prisma = require("../lib/prisma");

async function overview(req, res) {
  const [users, merchants, suppliers, admins, shops, products, sales, orders, auditLogs] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "MERCHANT" } }),
    prisma.user.count({ where: { role: "SUPPLIER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.shop.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.sale.count(),
    prisma.order.count(),
    prisma.auditLog.count(),
  ]);

  res.json({
    summary: { users, merchants, suppliers, admins, shops, products, sales, orders, auditLogs },
  });
}

async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      phone: true,
      name: true,
      role: true,
      language: true,
      createdAt: true,
      shop: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  res.json({ users });
}

async function listAuditLogs(req, res) {
  const { action, resourceType, userId, limit = 100 } = req.query;
  const where = {};
  if (action) where.action = String(action);
  if (resourceType) where.resourceType = String(resourceType);
  if (userId) where.userId = String(userId);

  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, phone: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(Number(limit) || 100, 500),
  });

  res.json({ logs });
}

module.exports = { overview, listUsers, listAuditLogs };
