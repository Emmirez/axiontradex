// backend/src/routes/swapRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getRates,
  getSwapQuote,
  executeSwap,
  getSwapHistory,
} from "../controllers/swapController.js";

const router = express.Router();

router.get("/rates", protect, getRates);
router.post("/quote", protect, getSwapQuote);
router.post("/execute", protect, executeSwap);
router.get("/history", protect, getSwapHistory);

export default router;
