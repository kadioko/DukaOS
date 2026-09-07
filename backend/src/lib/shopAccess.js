const prisma = require("./prisma");

async function getShopIdForUser(user) {
  if (user.resolvedShopId) return user.resolvedShopId;
  if (user.staffId) {
    if (user.shopId) return user.shopId;
    const staff = await prisma.staffMember.findUnique({ where: { id: user.staffId } });
    if (!staff || !staff.isActive) throw Object.assign(new Error("Staff access not found"), { status: 403 });
    return staff.shopId;
  }

  const shop = await prisma.shop.findUnique({ where: { userId: user.userId } });
  if (!shop) throw Object.assign(new Error("Shop not found"), { status: 404 });
  if (user.requestedShopId && user.requestedShopId !== shop.id) {
    const branch = await prisma.shop.findFirst({ where: { id: user.requestedShopId, parentShopId: shop.id } });
    if (!branch) throw Object.assign(new Error("Branch not found"), { status: 403 });
    return branch.id;
  }
  return shop.id;
}

async function getBillingShopIdForUser(user) {
  if (user.businessShopId) return user.businessShopId;
  const id = await getShopIdForUser(user);
  const shop = await prisma.shop.findUnique({ where: { id }, select: { parentShopId: true } });
  return shop?.parentShopId || id;
}

module.exports = { getShopIdForUser, getBillingShopIdForUser };
