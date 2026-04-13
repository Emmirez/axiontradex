import express from "express";
import { body } from "express-validator";
import * as tradeController from "../controllers/tradeController.js";
import {
  protect,
  requireEmailVerified,
  requireKYC,
} from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect, requireEmailVerified);

router.post(
  "/",
  requireKYC,
  [
    body("symbol").notEmpty().withMessage("Symbol is required"),
    body("side").isIn(["buy", "sell"]).withMessage("Side must be buy or sell"),
    body("type")
      .isIn(["market", "limit", "stop"])
      .withMessage("Invalid order type"),
    body("quantity")
      .isFloat({ gt: 0 })
      .withMessage("Quantity must be greater than 0"),
  ],
  validate,
  tradeController.placeTrade,
);

router.get("/positions", tradeController.getOpenPositions);
router.get("/history", tradeController.getTradeHistory);
router.get("/pnl", tradeController.getPnLSummary);
router.get("/all-history", tradeController.getAllTradeHistory);

// check-signal MUST be before /:id — otherwise Express matches it as an id
router.get("/check-signal", tradeController.checkSignalTrade);

//  /:id routes last
router.get("/:id", tradeController.getTrade);
router.delete("/:id", tradeController.cancelTrade);
router.post("/:id/close", tradeController.closeTrade);

export default router;