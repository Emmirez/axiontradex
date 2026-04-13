// backend/src/models/CopyTraderModel.js
import mongoose from "mongoose";

const copyTraderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    stats: {
      winRate: { type: Number, default: 0, min: 0, max: 100 },
      totalFollowers: { type: Number, default: 0 },
      monthlyProfit: { type: Number, default: 0 },
      totalReturn: { type: Number, default: 0 },
      totalTrades: { type: Number, default: 0 },
      winningTrades: { type: Number, default: 0 },
      avgProfit: { type: Number, default: 0 },
    },
    subscriptionFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    performanceHistory: [
      {
        date: Date,
        totalReturn: Number,
        monthlyProfit: Number,
      },
    ],
    recentTrades: [
      {
        symbol: String,
        side: String,
        entryPrice: Number,
        exitPrice: Number,
        profit: Number,
        profitPercent: Number,
        closedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

copyTraderSchema.index({ "stats.totalFollowers": -1 });
copyTraderSchema.index({ isActive: 1 });

const CopyTrader = mongoose.model("CopyTrader", copyTraderSchema);
export default CopyTrader;