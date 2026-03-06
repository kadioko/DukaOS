const router = require("express").Router();
const { overview } = require("../controllers/dashboard.controller");
const { authenticate, requireRole } = require("../middleware/auth");

router.use(authenticate);
router.use(requireRole("MERCHANT", "ADMIN"));

router.get("/", overview);

module.exports = router;
