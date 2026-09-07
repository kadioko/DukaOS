const express = require("express");
const { authenticate, requireRole } = require("../middleware/auth");
const {
  getStatus,
  adminListSubscriptions,
  adminUpdateSubscription,
  adminExtendTrial,
  adminExtendSubscription,
  adminRemoveSubscription,
  adminRecordPayment,
} = require("../controllers/subscription.controller");

const router = express.Router();
const checkout = require("../controllers/subscriptionCheckout.controller");
const { subscriptionPaymentLimiter } = require("../middleware/rateLimit");
router.get("/checkout", authenticate, checkout.ownerOnly, subscriptionPaymentLimiter, checkout.getCheckoutConfig);
router.post("/checkout", authenticate, checkout.ownerOnly, subscriptionPaymentLimiter, checkout.createCheckout);
router.post("/checkout/:id/check", authenticate, checkout.ownerOnly, subscriptionPaymentLimiter, checkout.checkCheckout);

// Merchant: check own subscription
router.get("/status", authenticate, getStatus);
router.get("/quote", authenticate, checkout.ownerOnly, async (req, res, next) => {
  try {
    const prisma = require("../lib/prisma");
    const id = await require("../lib/shopAccess").getBillingShopIdForUser(req.user);
    const shop = await prisma.shop.findUnique({ where: { id } });
    res.json(require("../lib/subscriptionPricing").priceSubscription(shop, req.query));
  } catch (error) { next(error); }
});

// Admin routes
router.get("/admin", authenticate, requireRole("ADMIN"), adminListSubscriptions);
router.use("/admin/:shopId", authenticate, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const shop = await require("../lib/prisma").shop.findUnique({ where: { id: req.params.shopId }, select: { parentShopId: true } });
    if (shop?.parentShopId) return res.status(400).json({ error: "Manage this subscription through the main business" });
    next();
  } catch (error) { next(error); }
});
router.patch("/admin/:shopId", authenticate, requireRole("ADMIN"), adminUpdateSubscription);
router.delete("/admin/:shopId", authenticate, requireRole("ADMIN"), adminRemoveSubscription);
router.post("/admin/:shopId/extend-trial", authenticate, requireRole("ADMIN"), adminExtendTrial);
router.post("/admin/:shopId/extend-subscription", authenticate, requireRole("ADMIN"), adminExtendSubscription);
router.post("/admin/:shopId/payments", authenticate, requireRole("ADMIN"), adminRecordPayment);

module.exports = router;
