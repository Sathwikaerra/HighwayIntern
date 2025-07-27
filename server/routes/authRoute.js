import express from "express";
import {
  signup,
  verifySignup,
  login,
  verifyLogin,
  loginWithoutOTP,protect
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-signup", verifySignup);
router.post("/login", login);
router.post("/verify-login", verifyLogin);
router.post("/login-no-otp", loginWithoutOTP);


router.get("/profile", protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;
