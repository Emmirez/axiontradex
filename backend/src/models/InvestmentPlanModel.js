// backend/src/models/InvestmentPlanModel.js
import mongoose from "mongoose";

const investmentPlanSchema = new mongoose.Schema(
  {
    market: {
      type: String,
      enum: ["stocks", "crypto", "realestate"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    minAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    maxAmount: {
      type: Number,
      min: 0,
    },
    roi: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    features: [String],
  },
  { timestamps: true }
);

investmentPlanSchema.index({ market: 1, isActive: 1 });

const InvestmentPlan = mongoose.model("InvestmentPlan", investmentPlanSchema);
export default InvestmentPlan;