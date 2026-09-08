const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const prisma = require("../src/lib/prisma");
const { anonymizeMerchantAccount } = require("../src/services/accountDeletion.service");

const databaseUrl = String(process.env.DATABASE_URL || "");
if (!/localhost|127\.0\.0\.1|dukapilot_test/i.test(databaseUrl)) {
  throw new Error("PostgreSQL integrity tests require an explicitly named local test database");
}

test("merchant deletion anonymizes a business with branches and retained financial records", async (t) => {
  const suffix = crypto.randomUUID();
  const user = await prisma.user.create({ data: { phone: `deleted-test-${suffix}`, pin: "not-a-real-pin", name: "Synthetic deletion owner" } });
  const root = await prisma.shop.create({ data: { name: "Synthetic root", location: "Test", userId: user.id, referralCode: `root-${suffix}` } });
  const branch = await prisma.shop.create({ data: { name: "Synthetic branch", location: "Test", parentShopId: root.id, referralCode: `branch-${suffix}` } });
  const customer = await prisma.customer.create({ data: { shopId: branch.id, name: "Synthetic customer", phone: "+255700000001", email: `customer-${suffix}@example.test` } });
  const product = await prisma.product.create({ data: { shopId: branch.id, name: "Owner surname product", buyingPrice: 1000, sellingPrice: 1500 } });
  const expense = await prisma.expense.create({ data: { shopId: branch.id, title: "Owner home delivery", vendor: "Private person", note: "Private address", amount: 1000 } });
  const report = await prisma.report.create({ data: { userId: user.id, title: "Private shop issue", description: "Private customer detail" } });
  const debt = await prisma.debt.create({ data: { shopId: branch.id, customerName: customer.name, customerPhone: customer.phone, amount: 10000, amountPaid: 3000, status: "PARTIAL" } });
  await prisma.debtPayment.create({ data: { debtId: debt.id, amount: 3000, requestKey: crypto.randomUUID() } });
  const payment = await prisma.subscriptionPayment.create({ data: { shopId: root.id, plan: "PRO", amount: 35000, reference: suffix, normalizedReference: `TEST:${suffix}` } });
  const checkout = await prisma.subscriptionCheckout.create({ data: { shopId: root.id, requestKey: crypto.randomUUID(), plan: "PRO", amount: 35000, phone: "+255700000001", status: "REVIEW" } });

  t.after(async () => {
    await prisma.subscriptionCheckout.deleteMany({ where: { id: checkout.id } });
    await prisma.subscriptionPayment.deleteMany({ where: { id: payment.id } });
    await prisma.shop.deleteMany({ where: { id: branch.id } });
    await prisma.shop.deleteMany({ where: { id: root.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
    await prisma.$disconnect();
  });

  await anonymizeMerchantAccount(user.id);
  const [accountAfter, rootAfter, branchAfter, customerAfter, debtAfter, productAfter, expenseAfter, reportAfter, paymentAfter, checkoutAfter] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id } }),
    prisma.shop.findUnique({ where: { id: root.id } }),
    prisma.shop.findUnique({ where: { id: branch.id } }),
    prisma.customer.findUnique({ where: { id: customer.id } }),
    prisma.debt.findUnique({ where: { id: debt.id } }),
    prisma.product.findUnique({ where: { id: product.id } }),
    prisma.expense.findUnique({ where: { id: expense.id } }),
    prisma.report.findUnique({ where: { id: report.id } }),
    prisma.subscriptionPayment.findUnique({ where: { id: payment.id } }),
    prisma.subscriptionCheckout.findUnique({ where: { id: checkout.id } }),
  ]);

  assert.match(accountAfter.phone, /^deleted-/);
  assert.equal(rootAfter.userId, user.id);
  assert.equal(rootAfter.isActive, false);
  assert.equal(branchAfter.isActive, false);
  assert.equal(branchAfter.branchArchived, true);
  assert.equal(customerAfter.phone, null);
  assert.equal(debtAfter.customerPhone, "deleted");
  assert.equal(productAfter.name, "Deleted product");
  assert.equal(productAfter.isActive, false);
  assert.equal(expenseAfter.vendor, null);
  assert.equal(reportAfter.description, "Account deleted");
  assert.equal(paymentAfter.amount, 35000);
  assert.equal(checkoutAfter.status, "REVIEW");
});
