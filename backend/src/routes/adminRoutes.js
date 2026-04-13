import express from "express";
import { body } from "express-validator";
import * as adminController from "../controllers/adminController.js";
import * as adminMarket from "../controllers/adminMarketController.js";
import * as depositSettings from "../controllers/depositSettingsController.js";
import {
  protect,
  adminOnly,
  superAdminOnly,
} from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/dashboard", adminController.getDashboardOverview);
//deposit-settings
router.get("/deposit-settings", depositSettings.getDepositSettings);
router.patch("/deposit-settings/coins", depositSettings.updateCoinAddresses);
router.patch("/deposit-settings/bank", depositSettings.updateBankDetails);
router.patch("/deposit-settings/address", depositSettings.updateSingleAddress);

//users
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.patch("/users/:id/status", adminController.updateUserStatus);
router.patch("/users/:id/role", adminController.updateUserRole);
router.patch("/users/:id/wallet", adminController.adjustWallet);

router.patch(
  "/users/:id/kyc",
  [
    body("status")
      .isIn(["approved", "rejected"])
      .withMessage("Status must be approved or rejected"),
  ],
  validate,
  adminController.reviewKYC,
);

// Superadmin only
router.patch(
  "/users/:id/promote",
  superAdminOnly,
  adminController.promoteToAdmin,
);
router.patch("/users/:id/demote", superAdminOnly, adminController.demoteToUser);
//Transactions
router.get("/transactions", adminMarket.getAllTransactions);
router.patch("/transactions/:id", adminMarket.editTransaction);
router.post("/transactions/adjustment", adminMarket.addAdjustment);
router.post("/transactions/:id/approve-deposit", adminMarket.approveDeposit);
router.post("/transactions/:id/reject-deposit", adminMarket.rejectDeposit);
router.post(
  "/transactions/:id/approve-withdrawal",
  adminMarket.approveWithdrawal,
);
router.post(
  "/transactions/:id/reject-withdrawal",
  adminMarket.rejectWithdrawal,
);
//Trade
router.get("/trades", adminMarket.getAllTrades);
router.post("/trades", adminMarket.adminOpenTrade);
router.post("/trades/:id/close", adminMarket.adminCloseTrade);
router.get("/users/search", adminController.searchUsers);
router.get("/users/:userId/balance", adminController.getUserBalance);

export default router;
