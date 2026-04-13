// backend/src/models/BotModel.js
import mongoose from "mongoose";

const botSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    strategy: {
      type: String,
      enum: ["grid", "dca", "trend_follow", "scalping"],
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    minDeposit: { type: Number, default: 100 },
    monthlyFee: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    stats: {
      winRate: { type: Number, default: 0 },
      totalReturn: { type: Number, default: 0 },
      monthlyProfit: { type: Number, default: 0 },
      totalTrades: { type: Number, default: 0 },
      winningTrades: { type: Number, default: 0 },
      totalSubscribers: { type: Number, default: 0 },
      avgProfit: { type: Number, default: 0 },
    },
    features: [{ type: String }],
    recentTrades: [
      {
        symbol: String,
        side: String,
        entryPrice: Number,
        exitPrice: Number,
        profitPercent: Number,
        closedAt: Date,
      },
    ],
  },
  { timestamps: true },
);

botSchema.index({ isActive: 1 });
botSchema.index({ strategy: 1 });

const Bot = mongoose.model("Bot", botSchema);
export default Bot;
