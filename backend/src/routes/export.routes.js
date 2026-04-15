const router = require("express").Router();
const { exportSalesCsv, exportInventoryCsv } = require("../controllers/export.controller");
const { authenticate, requireRole } = require("../middleware/auth");

router.use(authenticate);
router.use(requireRole("MERCHANT", "ADMIN"));

router.get("/sales.csv", exportSalesCsv);
router.get("/inventory.csv", exportInventoryCsv);

module.exports = router;
