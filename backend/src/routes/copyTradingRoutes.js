// backend/src/routes/copyTradingRoutes.js
import express from "express";
import { body } from "express-validator";
import * as copyTradingController from "../controllers/copyTradingController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

// User routes (protected)
router.use(protect);

router.get("/traders", copyTradingController.getTopTraders);
router.get("/traders/:id", copyTradingController.getTraderDetails);
router.get("/my-follows", copyTradingController.getMyFollowedTraders);
router.get("/stats", copyTradingController.getCopyStats);

router.patch(
  "/allocation/:copyTradeId",
  copyTradingController.updateAllocation,
);

router.get("/history", copyTradingController.getCopyTradeHistory);
router.post(
  "/follow",
  [
    body("traderId").notEmpty().withMessage("Trader ID required"),
    body("allocationType").isIn(["fixed", "percentage"]),
    body("allocationAmount").isNumeric().optional(),
    body("allocationPercentage").isNumeric().optional(),
  ],
  validate,
  copyTradingController.followTrader,
);
router.post("/:traderId/unfollow", copyTradingController.unfollowTrader);
router.patch(
  "/settings/:copyTradeId",
  copyTradingController.updateCopySettings,
);

// Admin routes
router.get("/admin/all", adminOnly, copyTradingController.getAllTraders);
router.post("/admin/trader", adminOnly, copyTradingController.manageTrader);
router.patch(
  "/admin/trader/:id",
  adminOnly,
  copyTradingController.updateTrader,
);
router.delete(
  "/admin/trader/:id",
  adminOnly,
  copyTradingController.deleteTrader,
);

router.post(
  "/admin/trade/open",
  adminOnly,
  copyTradingController.openTraderTrade,
);
router.post(
  "/admin/trade/:tradeId/close",
  adminOnly,
  copyTradingController.closeTraderTrade,
);
router.get(
  "/admin/trader/:traderId/trades",
  adminOnly,
  copyTradingController.getTraderTrades,
);

export default router;
