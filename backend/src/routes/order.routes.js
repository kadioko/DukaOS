const router = require("express").Router();
const ctrl = require("../controllers/order.controller");
const { authenticate, requireRole } = require("../middleware/auth");

router.use(authenticate);
router.use(requireRole("MERCHANT", "ADMIN"));

router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", ctrl.create);
router.post("/:id/reorder", ctrl.reorder);
router.patch("/:id/confirm-delivery", ctrl.confirmDelivery);
router.patch("/:id/cancel", ctrl.cancel);

module.exports = router;
