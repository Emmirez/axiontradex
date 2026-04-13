// backend/src/routes/investmentRoutes.js
import express from "express";
import { body } from "express-validator";
import * as investmentController from "../controllers/investmentController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

// User routes (protected)
router.use(protect);

router.get("/plans", investmentController.getInvestmentPlans);
router.get("/my", investmentController.getUserInvestments);
router.get("/summary", investmentController.getInvestmentSummary);
router.get("/:id", investmentController.getInvestmentById);
router.post(
  "/",
  [
    body("market").isIn(["stocks", "crypto", "realestate"]),
    body("planType").isIn(["fixed", "custom"]),
    body("amount").isNumeric().withMessage("Valid amount required"),
  ],
  validate,
  investmentController.createInvestment
);
router.post("/:id/cancel", investmentController.cancelInvestment);
router.delete("/:id", investmentController.deleteInvestment);
router.post("/:id/withdraw", protect, investmentController.withdrawInvestment);

// Admin routes
router.get("/admin/all", adminOnly, investmentController.getAllInvestments);
router.get("/admin/plans", adminOnly, investmentController.getAllInvestmentPlans);
router.post(
  "/admin/plans",
  adminOnly,
  [
    body("market").isIn(["stocks", "crypto", "realestate"]),
    body("name").notEmpty(),
    body("minAmount").isNumeric(),
    body("roi").isNumeric(),
    body("duration").isNumeric(),
    body("riskLevel").isIn(["Low", "Medium", "High"]),
  ],
  validate,
  investmentController.createInvestmentPlan
);
router.patch("/admin/plans/:id", adminOnly, investmentController.updateInvestmentPlan);
router.delete("/admin/plans/:id", adminOnly, investmentController.deleteInvestmentPlan);
router.post("/admin/:id/mature", adminOnly, investmentController.matureInvestment);

export default router;