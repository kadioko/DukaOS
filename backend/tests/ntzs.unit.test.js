const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const path = require("node:path");
const ntzs = require("../src/lib/ntzs");

const checkout = { id: "checkout-1", shopId: "shop-1", providerId: "provider-1", amount: 15000, plan: "BASIC", status: "PENDING" };
const deposit = { id: "provider-1", amountTzs: 15000, paymentMethod: "mobile_money", status: "completed" };

test("verified completion requires exact ID, integer amount and payment method", () => {
  assert.equal(ntzs.verifyDeposit(checkout, deposit), true);
  for (const patch of [{ id: "other" }, { amountTzs: "15000" }, { amountTzs: 14999 }, { paymentMethod: "card" }, { livemode: false }]) {
    assert.throws(() => ntzs.verifyDeposit(checkout, { ...deposit, ...patch }), /mismatch/);
  }
  for (const status of ["submitted", "pending", "review", "failed"]) assert.equal(ntzs.verifyDeposit(checkout, { ...deposit, status }), false);
});

test("webhooks reject bad signatures, stale payloads and changed bodies", () => {
  const raw = Buffer.from('{"type":"deposit.completed"}');
  const timestamp = String(Math.floor(Date.now() / 1000));
  const sign = (time) => crypto.createHmac("sha256", "test-secret").update(`${time}.`).update(raw).digest("hex");
  assert.equal(ntzs.verifySignature(raw, timestamp, sign(timestamp), "test-secret"), true);
  assert.equal(ntzs.verifySignature(Buffer.from("{}"), timestamp, sign(timestamp), "test-secret"), false);
  assert.equal(ntzs.verifySignature(raw, timestamp, "bad", "test-secret"), false);
  assert.equal(ntzs.verifySignature(raw, timestamp, sign(timestamp), ""), false);
  const old = String(Number(timestamp) - 600);
  assert.equal(ntzs.verifySignature(raw, old, sign(old), "test-secret"), false);
});

test("renewal preserves prepaid days and clamps month end", () => {
  assert.equal(ntzs.renewalEnd({ subscriptionEndsAt: new Date("2027-01-31T12:00:00Z") }, new Date("2027-01-01")).toISOString(), "2027-02-28T12:00:00.000Z");
  assert.equal(ntzs.renewalEnd({ subscriptionEndsAt: new Date("2025-01-01") }, new Date("2026-09-06T00:00:00Z")).toISOString(), "2026-10-06T00:00:00.000Z");
});

test("online checkout stays disabled without all launch variables", () => {
  const before = { enabled: process.env.NTZS_ENABLED, key: process.env.NTZS_API_KEY, secret: process.env.NTZS_WEBHOOK_SECRET };
  try {
    process.env.NTZS_ENABLED = "false";
    assert.equal(ntzs.configured(), false);
    process.env.NTZS_ENABLED = "true";
    process.env.NTZS_API_KEY = "ntzs_test_placeholder";
    process.env.NTZS_WEBHOOK_SECRET = "placeholder";
    assert.equal(ntzs.configured(), false);
    process.env.NTZS_API_KEY = "ntzs_live_placeholder";
    process.env.NTZS_WEBHOOK_SECRET = "";
    assert.equal(ntzs.configured(), false);
  } finally {
    for (const [key, value] of Object.entries({ NTZS_ENABLED: before.enabled, NTZS_API_KEY: before.key, NTZS_WEBHOOK_SECRET: before.secret })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test("online configuration tolerates secret-manager whitespace without exposing the key", () => {
  const previous = { enabled: process.env.NTZS_ENABLED, key: process.env.NTZS_API_KEY, secret: process.env.NTZS_WEBHOOK_SECRET };
  process.env.NTZS_ENABLED = "true"; process.env.NTZS_API_KEY = "ntzs_live_example\n"; process.env.NTZS_WEBHOOK_SECRET = "whsec_example\n";
  assert.equal(ntzs.configured(), true);
  process.env.NTZS_ENABLED = previous.enabled; process.env.NTZS_API_KEY = previous.key; process.env.NTZS_WEBHOOK_SECRET = previous.secret;
});

test("reconciliation activates once and never overrides suspension or pending payments", async () => {
  let current = { ...checkout };
  let shop = { id: "shop-1", isActive: true, plan: "BASIC", subscriptionEndsAt: null };
  let payments = 0;
  let updates = 0;
  let provider = { ...deposit };
  const prismaPath = path.resolve(__dirname, "../src/lib/prisma.js");
  const db = {
    $queryRaw: async () => [],
    subscriptionCheckout: { findUnique: async () => current, update: async ({ data }) => (current = { ...current, ...data }) },
    subscriptionPayment: { create: async () => { payments++; } },
    shop: { count: async () => 0, findUnique: async () => shop, update: async ({ data }) => { updates++; shop = { ...shop, ...data }; } },
  };
  db.$transaction = async (fn) => fn(db);
  require.cache[prismaPath] = { id: prismaPath, filename: prismaPath, loaded: true, exports: db };
  const original = ntzs.request;
  ntzs.request = async () => provider;
  try {
    const { reconcile, ownerOnly, publicCheckout } = require("../src/controllers/subscriptionCheckout.controller");
    provider.status = "pending";
    await reconcile(current);
    assert.equal(payments, 0);
    provider.status = "completed";
    await reconcile(current);
    await reconcile(current);
    assert.equal(payments, 1);
    assert.equal(updates, 1);
    assert.equal(current.status, "CONFIRMED");
    assert.equal(current.activeShopKey, null);
    current = { ...checkout }; shop.isActive = false;
    await reconcile(current);
    assert.equal(current.status, "REVIEW");
    assert.equal(payments, 1);
    assert.equal("phone" in publicCheckout({ ...checkout, phone: "private" }), false);
    let denied;
    ownerOnly({ user: { role: "MERCHANT", staffId: "staff" } }, { status: (code) => { denied = code; return { json: () => {} }; } }, () => assert.fail("Staff allowed"));
    assert.equal(denied, 403);
  } finally { ntzs.request = original; }
});
