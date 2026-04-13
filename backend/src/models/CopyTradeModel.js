import mongoose from "mongoose";

const copyTradeSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CopyTrader",
      required: true,
    },
    allocationType: {
      type: String,
      enum: ["fixed", "percentage"],
      default: "fixed",
    },
    allocationAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    allocationPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    maxAllocation: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active",
    },
    subscriptionActive: {
      type: Boolean,
      default: true,
    },
    subscriptionEndDate: {
      type: Date,
    },
    autoMirror: {
      type: Boolean,
      default: true,
    },
    maxPositionSize: {
      type: Number,
      default: 0,
    },
    stopLoss: {
      type: Number,
      default: 0,
    },
    totalInvested: {
      type: Number,
      default: 0,
    },
    totalProfit: {
      type: Number,
      default: 0,
    },

    lastKnownInvested: { type: Number, default: 0 },
    lastKnownProfit: { type: Number, default: 0 },

    profitHistory: [
      {
        date: Date,
        profit: Number,
        tradeId: String,
      },
    ],
  },
  { timestamps: true },
);

copyTradeSchema.index({ follower: 1, trader: 1 });
copyTradeSchema.index({ status: 1 });

const CopyTrade = mongoose.model("CopyTrade", copyTradeSchema);
export default CopyTrade;
