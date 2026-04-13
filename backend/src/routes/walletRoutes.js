import express from "express";
import { body } from "express-validator";
import * as walletController from "../controllers/walletController.js";
import { protect, requireEmailVerified } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import multer from "multer";
import path from "path";

const router = express.Router();

router.use(protect, requireEmailVerified);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/receipts/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `receipt_${req.user._id}_${Date.now()}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Invalid file type"));
  },
});

router.get("/", walletController.getWallet);
router.get("/transactions", walletController.getTransactionHistory);

router.post(
  "/deposit",
  upload.single("receipt"),
  [
    body("amount")
      .toFloat()
      .isFloat({ gt: 0 })
      .withMessage("Amount must be greater than 0"),
    body("currency").notEmpty().withMessage("Currency is required"),
  ],
  validate,
  walletController.requestDeposit,
);

router.post(
  "/withdraw/send-otp",
  [
    body("amount")
      .toFloat()
      .isFloat({ gt: 0 })
      .withMessage("Amount must be greater than 0"),
    body("currency").notEmpty().withMessage("Currency is required"),
    body("address").notEmpty().withMessage("Address is required"),
  ],
  validate,
  walletController.sendWithdrawalOtp,
);

router.post(
  "/withdraw",
  [
    body("amount")
      .toFloat()
      .isFloat({ gt: 0 })
      .withMessage("Amount must be greater than 0"),
    body("currency").notEmpty().withMessage("Currency is required"),
  ],
  validate,
  walletController.requestWithdrawal,
);

export default router;
