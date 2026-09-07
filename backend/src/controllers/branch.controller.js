const crypto = require("node:crypto");
const prisma = require("../lib/prisma");
const { getBillingShopIdForUser, getShopIdForUser } = require("../lib/shopAccess");
const { activePlan, branchLimit } = require("../lib/entitlements");
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
const select = { id: true, name: true, location: true, district: true, parentShopId: true, branchArchived: true, isActive: true, createdAt: true };

function ownerOnly(req, res, next) {
  if (req.user.staffId || req.user.role !== "MERCHANT") return res.status(403).json({ error: "Only the business owner can manage branches" });
  next();
}

const list = wrap(async (req, res) => {
  const rootId = await getBillingShopIdForUser(req.user);
  const root = await prisma.shop.findUnique({ where: { id: rootId } });
  const branches = await prisma.shop.findMany({ where: { OR: [{ id: rootId }, { parentShopId: rootId }] }, select, orderBy: [{ createdAt: "asc" }, { id: "asc" }] });
  res.json({ branches, selectedId: await getShopIdForUser(req.user), mainId: rootId, pro: activePlan(root) === "PRO", limit: branchLimit(root), extraBranches: root.additionalBranchSlots, monthlyAmount: root.plan === "PRO" ? 35000 + 10000 * root.additionalBranchSlots : 15000 });
});

const create = wrap(async (req, res) => {
  const rootId = await getBillingShopIdForUser(req.user);
  const name = String(req.body.name || "").trim();
  const location = String(req.body.location || "").trim();
  if (!name || name.length > 100 || !location || location.length > 200) fail("Enter a branch name and location (maximum 100 and 200 characters).");
  const branch = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM shops WHERE id = ${rootId} FOR UPDATE`;
    const root = await tx.shop.findUnique({ where: { id: rootId } });
    if (activePlan(root) !== "PRO") fail("Branches require an active Pro subscription", 403);
    const count = await tx.shop.count({ where: { parentShopId: rootId, branchArchived: false } });
    if (count + 1 >= branchLimit(root)) fail("Branch limit reached. Pay for another branch in Billing first.", 403);
    if (await tx.shop.findFirst({ where: { OR: [{ id: rootId }, { parentShopId: rootId }], name: { equals: name, mode: "insensitive" } } })) fail("A branch with this name already exists", 409);
    return tx.shop.create({ data: { parentShopId: rootId, name, location, category: root.category, plan: root.plan, subscriptionEndsAt: root.subscriptionEndsAt, isActive: root.isActive, isCatalogPublished: false, referralCode: crypto.randomBytes(16).toString("hex") }, select });
  });
  req.audit = { action: "branch.create", resourceType: "shop", resourceId: branch.id };
  res.status(201).json({ branch });
});

const update = wrap(async (req, res) => {
  const rootId = await getBillingShopIdForUser(req.user);
  const branch = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM shops WHERE id = ${rootId} FOR UPDATE`;
    const current = await tx.shop.findFirst({ where: { id: req.params.id, parentShopId: rootId } });
    if (!current) fail("Additional branch not found", 404);
    const data = {};
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name || name.length > 100) fail("Invalid branch name");
      if (await tx.shop.findFirst({ where: { id: { not: current.id }, OR: [{ id: rootId }, { parentShopId: rootId }], name: { equals: name, mode: "insensitive" } } })) fail("A branch with this name already exists", 409);
      data.name = name;
    }
    if (req.body.branchArchived !== undefined) {
      if (typeof req.body.branchArchived !== "boolean") fail("Invalid archive option");
      const root = await tx.shop.findUnique({ where: { id: rootId } });
      if (!req.body.branchArchived && current.branchArchived) {
        if (activePlan(root) !== "PRO") fail("Branches require an active Pro subscription", 403);
        const count = await tx.shop.count({ where: { parentShopId: rootId, branchArchived: false } });
        if (count + 1 >= branchLimit(root)) fail("Branch limit reached", 403);
      }
      if (req.body.branchArchived && await tx.cashSession.findFirst({ where: { shopId: current.id, status: "OPEN" } })) fail("Close the branch's Daily Close sessions before archiving", 409);
      data.branchArchived = req.body.branchArchived;
      data.isActive = !data.branchArchived && activePlan(root) === "PRO";
      if (data.branchArchived) data.isCatalogPublished = false;
    }
    if (!Object.keys(data).length) fail("No changes supplied");
    return tx.shop.update({ where: { id: current.id }, data, select });
  });
  req.audit = { action: "branch.update", resourceType: "shop", resourceId: branch.id, metadata: { archived: branch.branchArchived } };
  res.json({ branch });
});

const overview = wrap(async (req, res) => {
  const rootId = await getBillingShopIdForUser(req.user);
  const root = await prisma.shop.findUnique({ where: { id: rootId } });
  if (activePlan(root) !== "PRO") fail("Combined branch reports require Pro", 403);
  const from = new Date(String(req.query.from || new Date().toISOString().slice(0, 7) + "-01"));
  const to = req.query.to ? new Date(String(req.query.to)) : new Date();
  if (Number.isNaN(+from) || Number.isNaN(+to) || to < from || +to - +from > 366 * 86400000) fail("Choose a date range of up to one year");
  const branches = await prisma.shop.findMany({ where: { OR: [{ id: rootId }, { parentShopId: rootId }] }, select });
  const shopIds = branches.map((b) => b.id);
  const [sales, expenses, debts] = await Promise.all([
    prisma.sale.groupBy({ by: ["shopId"], where: { shopId: { in: shopIds }, status: "COMPLETED", createdAt: { gte: from, lte: to } }, _sum: { totalAmount: true, profit: true }, _count: { _all: true } }),
    prisma.expense.groupBy({ by: ["shopId"], where: { shopId: { in: shopIds }, spentAt: { gte: from, lte: to }, category: { not: "STOCK" } }, _sum: { amount: true } }),
    prisma.debt.groupBy({ by: ["shopId"], where: { shopId: { in: shopIds }, status: { in: ["OPEN", "PARTIAL"] } }, _sum: { amount: true, amountPaid: true } }),
  ]);
  res.json({ from, to, branches: branches.map((b) => {
    const s = sales.find((row) => row.shopId === b.id), e = expenses.find((row) => row.shopId === b.id), d = debts.find((row) => row.shopId === b.id);
    return { ...b, sales: s?._sum.totalAmount || 0, saleCount: s?._count._all || 0, grossProfit: s?._sum.profit || 0, expenses: e?._sum.amount || 0, receivables: (d?._sum.amount || 0) - (d?._sum.amountPaid || 0) };
  }) });
});
module.exports = { ownerOnly, list, create, update, overview };
