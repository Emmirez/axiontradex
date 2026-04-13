// backend/src/routes/signalRoutes.js
import express from "express";
import { body } from "express-validator";
import * as signalController from "../controllers/signalController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

// User routes
router.use(protect);

// Admin routes
router.get("/admin/all", adminOnly, signalController.getAllSignals);
router.post(
  "/admin/signal",
  adminOnly,
  [
    body("title").notEmpty(),
    body("market").notEmpty(),
    body("symbol").notEmpty(),
    body("signalType").isIn(["buy", "sell", "hold"]),
    body("entryPrice").isNumeric(),
    body("targetPrice").isNumeric(),
    body("stopLoss").isNumeric(),
  ],
  validate,
  signalController.createSignal,
);
router.patch("/admin/:id", adminOnly, signalController.updateSignalStatus);
router.delete("/admin/:id", adminOnly, signalController.deleteSignal);

router.get("/", signalController.getSignals);
router.get("/subscription", signalController.getSubscriptionStatus);
router.get("/:id", signalController.getSignalById);
router.post("/subscribe", signalController.subscribeToSignals);
router.post("/:id/received", protect, signalController.incrementSignalReceived);
router.post("/:id/execute", protect, signalController.executeSignal);
router.post("/unsubscribe", protect, signalController.unsubscribeFromSignals);
router.post("/:signalId/profit", protect, signalController.recordSignalProfit);

export default router;
