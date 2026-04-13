// backend/src/models/InvestmentModel.js
import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    market: {
      type: String,
      enum: ["stocks", "crypto", "realestate"],
      required: true,
    },
    planType: {
      type: String,
      enum: ["fixed", "custom"],
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvestmentPlan",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USDT",
    },
    expectedROI: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    maturityDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "matured", "cancelled"],
      default: "active",
    },
    returns: {
      type: Number,
      default: 0,
    },
    paidAt: Date,
    notes: String,
  },
  { timestamps: true }
);

investmentSchema.index({ user: 1, status: 1 });
investmentSchema.index({ maturityDate: 1 });

investmentSchema.virtual("effectiveStatus").get(function () {
  if (this.status !== "active") return this.status;
  if (new Date() >= this.maturityDate) return "ready_to_withdraw";
  return "active";
});

investmentSchema.virtual("canWithdraw").get(function () {
  return this.status === "active" && new Date() >= this.maturityDate;
});

// Make virtuals appear in JSON responses
investmentSchema.set("toJSON", { virtuals: true });
investmentSchema.set("toObject", { virtuals: true });

const Investment = mongoose.model("Investment", investmentSchema);
export default Investment;