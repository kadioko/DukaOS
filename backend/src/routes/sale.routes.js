const router = require("express").Router();
const ctrl = require("../controllers/sale.controller");
const { authenticate, requireRole } = require("../middleware/auth");

router.use(authenticate);
router.use(requireRole("MERCHANT", "ADMIN"));

router.get("/", ctrl.list);
router.get("/summary", ctrl.summary);
router.get("/:id", ctrl.get);
router.post("/", ctrl.create);

module.exports = router;
