// backend/src/routes/goldRoutes.js
import express from "express";
import {
  getGoldRates,
  getMyGoldPortfolio,
  getMyGoldHistory,
  buyGold,
  sellGold,
  adminGetAllPositions,
  adminGetUserPosition,
  adminBuyForUser,
  adminSellForUser,
  adminSearchUsers,
} from "../controllers/goldController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// User routes
router.get("/rates", getGoldRates);
router.get("/portfolio", getMyGoldPortfolio);
router.get("/history", getMyGoldHistory);
router.post("/buy", buyGold);
router.post("/sell", sellGold);

// Admin routes
router.get("/admin/all-positions", adminOnly, adminGetAllPositions);
router.get("/admin/search-users", adminOnly, adminSearchUsers);
router.get("/admin/user-position/:userId", adminOnly, adminGetUserPosition);
router.post("/admin/buy-for-user", adminOnly, adminBuyForUser);
router.post("/admin/sell-for-user", adminOnly, adminSellForUser);

export default router;
