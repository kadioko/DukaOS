const router = require("express").Router();
const ctrl = require("../controllers/product.controller");
const { authenticate, requireRole } = require("../middleware/auth");

router.use(authenticate);
router.use(requireRole("MERCHANT", "ADMIN"));

router.get("/", ctrl.list);
router.get("/low-stock", ctrl.getLowStock);
router.get("/:id", ctrl.get);
router.post("/", ctrl.create);
router.patch("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
