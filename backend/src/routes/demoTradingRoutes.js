// backend/src/routes/demoTradingRoutes.js
import express from "express";
import { body } from "express-validator";
import * as demoTradingController from "../controllers/demoTradingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/account", demoTradingController.getDemoAccount);
router.get("/stats", demoTradingController.getDemoStats);
router.get("/leaderboard", demoTradingController.getDemoLeaderboard);
router.post(
  "/trade/open",
  [
    body("symbol").notEmpty(),
    body("side").isIn(["buy", "sell"]),
    body("quantity").isNumeric(),
    body("entryPrice").isNumeric(),
  ],
  validate,
  demoTradingController.openDemoTrade,
);
router.post(
  "/trade/close",
  [body("tradeId").notEmpty(), body("exitPrice").isNumeric()],
  validate,
  demoTradingController.closeDemoTrade,
);
router.post("/reset", demoTradingController.resetDemoAccount);

export default router;
