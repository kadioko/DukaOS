const crypto = require("node:crypto");

const PRICES = Object.freeze({ BASIC: 15000, PRO: 35000 });

function configured() {
  return process.env.NTZS_ENABLED === "true" && /^ntzs_live_/.test((process.env.NTZS_API_KEY || "").trim()) && Boolean((process.env.NTZS_WEBHOOK_SECRET || "").trim());
}

async function request(path, options = {}) {
  if (!/^ntzs_live_/.test((process.env.NTZS_API_KEY || "").trim())) throw Object.assign(new Error("Live payment verification is not configured"), { status: 503 });
  const response = await fetch(`https://www.ntzs.co.tz/api/v1${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${process.env.NTZS_API_KEY.trim()}`, "Content-Type": "application/json", ...options.headers },
    signal: AbortSignal.timeout(12000),
  });
  const body = await response.json();
  if (!response.ok) throw Object.assign(new Error("Payment provider unavailable"), { status: 502 });
  return body;
}

function verifyDeposit(checkout, deposit) {
  if (deposit.id !== checkout.providerId || deposit.amountTzs !== checkout.amount || deposit.paymentMethod !== "mobile_money" || deposit.livemode === false) {
    throw Object.assign(new Error("Payment verification mismatch. Contact support."), { status: 409 });
  }
  return deposit.status === "completed";
}

function verifySignature(rawBody, timestamp, signature, secret) {
  if (!secret || !Buffer.isBuffer(rawBody) || typeof timestamp !== "string" || !/^\d{10,13}$/.test(timestamp) || typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const time = Number(timestamp) * (timestamp.length === 10 ? 1000 : 1);
  if (Math.abs(Date.now() - time) > 5 * 60 * 1000) return false;
  const expected = crypto.createHmac("sha256", secret.trim()).update(`${timestamp}.`).update(rawBody).digest();
  return crypto.timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

function renewalEnd(shop, now = new Date()) {
  const end = shop.subscriptionEndsAt && shop.subscriptionEndsAt > now ? new Date(shop.subscriptionEndsAt) : new Date(now);
  const day = end.getUTCDate();
  end.setUTCDate(1);
  end.setUTCMonth(end.getUTCMonth() + 1);
  end.setUTCDate(Math.min(day, new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate()));
  return end;
}

module.exports = { PRICES, configured, request, verifyDeposit, verifySignature, renewalEnd };
