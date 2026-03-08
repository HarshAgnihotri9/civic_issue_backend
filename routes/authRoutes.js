const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  googleLogin,
  facebookLogin
} = require("../controllers/authController");
const { changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/facebook", facebookLogin);

router.put("/change-password", protect, changePassword);
module.exports = router;
