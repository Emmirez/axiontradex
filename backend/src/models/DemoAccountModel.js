// backend/src/models/DemoAccountModel.js
import mongoose from "mongoose";

const demoTradeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    balance: {
      type: Number,
      default: 100000, // $100,000 starting balance
    },
    initialBalance: {
      type: Number,
      default: 100000,
    },
    profit: {
      type: Number,
      default: 0,
    },
    totalTrades: {
      type: Number,
      default: 0,
    },
    winningTrades: {
      type: Number,
      default: 0,
    },
    losingTrades: {
      type: Number,
      default: 0,
    },
    bestTrade: {
      type: Number,
      default: 0,
    },
    worstTrade: {
      type: Number,
      default: 0,
    },
    openPositions: [
      {
        tradeId: String,
        symbol: String,
        side: String,
        quantity: Number,
        entryPrice: Number,
        stopLoss: Number,
        takeProfit: Number,
        leverage: { type: Number, default: 1 },
        margin: { type: Number },
        liquidationPrice: { type: Number },
        openedAt: Date,
      },
    ],
    tradeHistory: [
      {
        tradeId: String,
        symbol: String,
        side: String,
        quantity: Number,
        entryPrice: Number,
        exitPrice: Number,
        profit: Number,
        profitPercent: Number,
        openedAt: Date,
        closedAt: Date,
      },
    ],
    lastActive: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

demoTradeSchema.index({ user: 1 }, { unique: true });
demoTradeSchema.index({ "stats.totalProfit": -1 });

const DemoAccount = mongoose.model("DemoAccount", demoTradeSchema);
export default DemoAccount;
