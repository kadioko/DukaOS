const router = require("express").Router();
const { register, login, me, updateLanguage, logout } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");
const { authRateLimiter } = require("../middleware/rateLimit");

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);
router.patch("/language", authenticate, updateLanguage);

module.exports = router;
