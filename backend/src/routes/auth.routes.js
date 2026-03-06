const router = require("express").Router();
const { register, login, me, updateLanguage } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);
router.patch("/language", authenticate, updateLanguage);

module.exports = router;
