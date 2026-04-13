// backend/src/models/SignalModel.js
import mongoose from "mongoose";

const signalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    market: {
      type: String,
      enum: ["stocks", "crypto", "forex", "commodities"],
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    signalType: {
      type: String,
      enum: ["buy", "sell", "hold"],
      required: true,
    },
    entryPrice: {
      type: Number,
      required: true,
    },
    targetPrice: {
      type: Number,
      required: true,
    },
    stopLoss: {
      type: Number,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 70,
    },
    expiryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "expired", "hit", "stopped"],
      default: "active",
    },
    isPremium: {
      type: Boolean,
      default: true,
    },
    subscribers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        subscribedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    performance: {
      reachedTarget: Boolean,
      hitStopLoss: Boolean,
      actualProfit: Number,
      closedAt: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

signalSchema.index({ market: 1, status: 1 });
signalSchema.index({ expiryDate: 1 });

const Signal = mongoose.model("Signal", signalSchema);
export default Signal;