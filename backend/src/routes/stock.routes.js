const router = require("express").Router();
const ctrl = require("../controllers/stock.controller");
const { authenticate, requireRole } = require("../middleware/auth");

router.use(authenticate);
router.use(requireRole("MERCHANT", "ADMIN"));

router.post("/adjust", ctrl.adjust);
router.get("/:productId/movements", ctrl.movements);

module.exports = router;
