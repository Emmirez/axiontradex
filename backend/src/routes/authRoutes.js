import express from "express";
import { body } from "express-validator";
import * as authController from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  validate,
  authController.register,
);

router.get("/verify-email/:token", authController.verifyEmail);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  authController.login,
);

router.post("/refresh-token", authController.refreshToken);
router.post("/logout", protect, authController.logout);

router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
  ],
  validate,
  authController.forgotPassword,
);

router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
], validate, authController.resendVerification)

router.patch(
  "/reset-password/:token",
  [
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  validate,
  authController.resetPassword,
);

router.post("/2fa/setup", protect, authController.setup2FA);
router.post("/2fa/enable", protect, authController.enable2FA);
router.post("/2fa/disable", protect, authController.disable2FA);

export default router;
