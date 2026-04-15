const router = require("express").Router();
const { overview, listUsers, listAuditLogs } = require("../controllers/admin.controller");
const { authenticate, requireRole } = require("../middleware/auth");

router.use(authenticate);
router.use(requireRole("ADMIN"));

router.get("/overview", overview);
router.get("/users", listUsers);
router.get("/audit-logs", listAuditLogs);

module.exports = router;
