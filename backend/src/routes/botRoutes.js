// backend/src/routes/botRoutes.js
import express from "express";
import {
  getAllBots,
  getBotStats,
  subscribeBot,
  unsubscribeBot,
  getMyBotTrades,
  adminGetAllBots,
  adminCreateBot,
  adminUpdateBot,
  adminDeleteBot,
  adminOpenBotTrade,
  adminCloseBotTrade,
  adminGetBotTrades,
} from "../controllers/botController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// User routes
router.get("/", getAllBots);
router.get("/stats", getBotStats);
router.get("/my-trades", getMyBotTrades);
router.post("/subscribe", subscribeBot);
router.post("/:botId/unsubscribe", unsubscribeBot);

// Admin routes
router.get("/admin/all", adminOnly, adminGetAllBots);
router.post("/admin/bots", adminOnly, adminCreateBot);
router.patch("/admin/bots/:id", adminOnly, adminUpdateBot);
router.delete("/admin/bots/:id", adminOnly, adminDeleteBot);
router.post("/admin/trade/open", adminOnly, adminOpenBotTrade);
router.post("/admin/trade/:tradeId/close", adminOnly, adminCloseBotTrade);
router.get("/admin/bots/:botId/trades", adminOnly, adminGetBotTrades);

export default router;
