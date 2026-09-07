const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const prismaPath = path.resolve(__dirname, "../src/lib/prisma.js");
let shops = [], items = [], transfers = [], moves = [], counts = 0;
const db = {
  $queryRaw: async () => [],
  shop: {
    findUnique: async ({ where }) => shops.find((s) => where.id ? s.id === where.id : s.userId === where.userId),
    findFirst: async ({ where }) => shops.find((s) => s.id === where.id && s.parentShopId === where.parentShopId),
    count: async () => counts,
  },
  product: {
    findMany: async ({ where }) => items.filter((p) => where.id.in.includes(p.id) && shops.some((s) => s.id === p.shopId && !s.branchArchived && (s.id === where.shop.OR[0].id || s.parentShopId === where.shop.OR[1].parentShopId))),
    update: async ({ where, data }) => { const p = items.find((p) => p.id === where.id); p.currentStock += data.currentStock.increment || -data.currentStock.decrement; if (data.buyingPrice !== undefined) p.buyingPrice = data.buyingPrice; },
  },
  branchTransfer: { findUnique: async ({ where }) => transfers.find((t) => t.requestKey === where.businessId_requestKey.requestKey), create: async ({ data }) => { const t = { id: "transfer", ...data }; transfers.push(t); return t; } },
  stockMovement: { createMany: async ({ data }) => moves.push(...data) },
};
db.$transaction = async (fn) => fn(db);
require.cache[prismaPath] = { id: prismaPath, filename: prismaPath, loaded: true, exports: db };
const access = require("../src/lib/shopAccess");
const { priceSubscription, validateBranchCapacity } = require("../src/lib/subscriptionPricing");
const { branchLimit } = require("../src/lib/entitlements");
const controller = require("../src/controllers/branchTransfer.controller");
const pro = { id: "root", userId: "owner", plan: "PRO", isActive: true, subscriptionEndsAt: new Date(Date.now() + 30 * 86400000), additionalBranchSlots: 0 };
function reset() { shops = [{ ...pro }, { id: "child", parentShopId: "root" }]; counts = 0; transfers = []; moves = []; items = [{ id: "a", shopId: "root", unit: "pcs", currentStock: 10, buyingPrice: 100, expiryDate: null, doesNotExpire: true }, { id: "b", shopId: "child", unit: "pcs", currentStock: 10, buyingPrice: 200, expiryDate: null, doesNotExpire: true }]; }
function call(body) { return new Promise((resolve, reject) => controller.transfer({ user: { userId: "owner", businessShopId: "root" }, body }, { json: resolve }, reject)); }
const body = { sourceProductId: "a", targetProductId: "b", quantity: 10, requestKey: "11111111-1111-1111-1111-111111111111" };

test("owner selects only their own child; staff remains assigned", async () => {
  reset();
  assert.equal(await access.getShopIdForUser({ userId: "owner", requestedShopId: "child" }), "child");
  await assert.rejects(access.getShopIdForUser({ userId: "owner", requestedShopId: "foreign" }), { status: 403 });
  assert.equal(await access.getShopIdForUser({ staffId: "staff", shopId: "child" }), "child");
  assert.equal(await access.getBillingShopIdForUser({ userId: "owner", requestedShopId: "child" }), "root");
});
test("Pro includes four locations and paid slots add to that allowance", () => {
  assert.equal(branchLimit(pro), 4); assert.equal(branchLimit({ ...pro, additionalBranchSlots: 2 }), 6);
  assert.equal(branchLimit({ ...pro, plan: "BASIC" }), 1);
  assert.equal(branchLimit({ ...pro, isActive: false }), 1);
});
test("monthly renewal includes extra branch price; Basic cannot buy branch slots", () => {
  assert.equal(priceSubscription(pro, { plan: "PRO", extraBranches: 2 }).amount, 55000);
  assert.throws(() => priceSubscription(pro, { plan: "BASIC", extraBranches: 1 }), { status: 400 });
  assert.throws(() => priceSubscription(pro, { extraBranches: 1.2 }), { status: 400 });
});
test("mid-cycle extra capacity is prorated without extending renewal", () => {
  const now = new Date("2026-09-01T00:00:00Z"), end = new Date("2026-09-16T00:00:00Z");
  const quote = priceSubscription({ ...pro, subscriptionEndsAt: end }, { kind: "BRANCH_ADDON", extraBranches: 1 }, now);
  assert.equal(quote.amount, 5000); assert.equal(quote.months, 0); assert.equal(+quote.expectedEndsAt, +end);
  assert.throws(() => priceSubscription(pro, { kind: "BRANCH_ADDON", extraBranches: 0 }), { status: 400 });
});
test("downgrade and allowance reduction cannot strand active locations", async () => {
  reset(); counts = 4;
  await assert.rejects(validateBranchCapacity(db, "root", "PRO", 0), { status: 400 });
  await validateBranchCapacity(db, "root", "PRO", 1);
  await assert.rejects(validateBranchCapacity(db, "root", "BASIC", 0), { status: 400 });
});
test("transfer records two movements, preserves stock total and is idempotent", async () => {
  reset(); await call(body); await call(body);
  assert.equal(items[0].currentStock, 0); assert.equal(items[1].currentStock, 20);
  assert.equal(items[1].buyingPrice, 150); assert.equal(transfers.length, 1); assert.equal(moves.length, 2);
  await assert.rejects(call({ ...body, quantity: 1 }), { status: 409 });
});
test("transfer rejects insufficient stock before any writes", async () => {
  reset(); await assert.rejects(call({ ...body, quantity: 11 }), { status: 409 }); assert.equal(transfers.length, 0);
});
test("transfer refuses another business's product", async () => {
  reset(); items[1].shopId = "foreign"; await assert.rejects(call(body), { status: 403 }); assert.equal(moves.length, 0);
});
test("transfer preserves unit and expiry boundaries", async () => {
  reset(); items[1].unit = "kg"; await assert.rejects(call(body), { status: 400 });
  reset(); items[1].expiryDate = new Date("2030-01-01"); await assert.rejects(call(body), { status: 400 });
});
test("staff cannot manage branches even when their role is OWNER", () => {
  const { ownerOnly } = require("../src/controllers/branch.controller"); let status;
  ownerOnly({ user: { role: "MERCHANT", staffId: "staff", staffRole: "OWNER" } }, { status: (s) => { status = s; return { json: () => {} }; } }, () => assert.fail("Allowed staff")); assert.equal(status, 403);
});
