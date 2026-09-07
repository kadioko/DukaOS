const MONTH_MS = 30n * 24n * 60n * 60n * 1000n;
const error = (message) => { throw Object.assign(new Error(message), { status: 400 }); };

function priceSubscription(shop, input, now = new Date()) {
  const plan = String(input.plan || shop.plan).toUpperCase();
  const kind = input.kind || "RENEWAL";
  const extraBranches = Number(input.extraBranches ?? (plan === "PRO" ? shop.additionalBranchSlots || 0 : 0));
  const months = Number(input.months ?? 1);
  if (!["BASIC", "PRO"].includes(plan) || !["RENEWAL", "BRANCH_ADDON"].includes(kind)) error("Invalid payment plan or purpose");
  if (!Number.isInteger(extraBranches) || extraBranches < 0 || extraBranches > 100 || (plan !== "PRO" && extraBranches !== 0)) error("Extra branches must be a whole number from 0 to 100 on Pro");
  if (!Number.isInteger(months) || months < 1 || months > 24) error("Months must be a whole number from 1 to 24");
  const monthlyAmount = plan === "PRO" ? 35000 + extraBranches * 10000 : 15000;
  if (kind === "RENEWAL") return { plan, kind, extraBranches, months, amount: monthlyAmount * months, monthlyAmount, expectedEndsAt: null };
  if (!shop.isActive || shop.plan !== "PRO" || plan !== "PRO" || !shop.subscriptionEndsAt || shop.subscriptionEndsAt <= now) error("An active Pro subscription is required to add branches");
  const added = extraBranches - (shop.additionalBranchSlots || 0);
  if (added <= 0) error("Choose a higher total number of extra branches");
  const remainingMs = BigInt(+shop.subscriptionEndsAt - +now);
  // Whole TZS, rounded up; added capacity expires with the existing subscription.
  const amount = Number((BigInt(added * 10000) * remainingMs + MONTH_MS - 1n) / MONTH_MS);
  return { plan, kind, extraBranches, months: 0, amount, monthlyAmount, expectedEndsAt: shop.subscriptionEndsAt };
}

async function validateBranchCapacity(tx, shopId, plan, extraBranches) {
  const count = await tx.shop.count({ where: { parentShopId: shopId, branchArchived: false } });
  if (count + 1 > (plan === "PRO" ? 4 + extraBranches : 1)) error("Archive excess branches before reducing your plan or branch allowance");
}
module.exports = { priceSubscription, validateBranchCapacity };
