const router = require("express").Router();
const ctrl = require("../controllers/supplier.controller");
const { authenticate, requireRole } = require("../middleware/auth");

router.use(authenticate);

// Merchant-facing supplier directory (read-only is fine for any role)
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", requireRole("MERCHANT", "ADMIN"), ctrl.create);
router.patch("/:id", requireRole("MERCHANT", "ADMIN"), ctrl.update);

// Supplier portal routes
router.get("/portal/orders", requireRole("SUPPLIER", "ADMIN"), ctrl.myOrders);
router.get("/portal/dashboard", requireRole("SUPPLIER", "ADMIN"), ctrl.supplierDashboard);
router.patch("/portal/orders/:orderId/status", requireRole("SUPPLIER", "ADMIN"), ctrl.updateOrderStatus);

module.exports = router;
