import express from "express";
import { body } from "express-validator";
import * as depositSettings from "../controllers/depositSettingsController.js";
import * as userController from "../controllers/userController.js";
import { protect, requireEmailVerified } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import multer from "multer";


const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.get("/me", userController.getMyProfile);
router.patch("/me", userController.updateMyProfile);
router.get("/dashboard", userController.getDashboardStats);
router.get("/trades", userController.getMyTrades);
router.get("/transactions", userController.getMyTransactions);
router.get('/deposit-settings', depositSettings.getDepositSettings)

router.patch(
  "/change-password",
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters"),
  ],
  validate,
  userController.changePassword,
);

router.post(
  "/kyc",
  requireEmailVerified,
  upload.fields([
    { name: "documentUrl", maxCount: 1 },
    { name: "backUrl", maxCount: 1 },
    { name: "selfieUrl", maxCount: 1 },
  ]),
  validate,
  userController.submitKYC,
);

export default router;
