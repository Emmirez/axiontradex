// backend/src/models/BotCopiedTradeModel.js
import mongoose from "mongoose";

const botCopiedTradeSchema = new mongoose.Schema(
  {
    botTrade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BotTrade",
      required: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BotSubscription",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bot: { type: mongoose.Schema.Types.ObjectId, ref: "Bot", required: true },
    amountInvested: { type: Number, default: 0 },
    symbol: { type: String },
    side: { type: String },
    entryPrice: { type: Number },
    exitPrice: { type: Number, default: null },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    profit: { type: Number, default: 0 },
    profitPercent: { type: Number, default: 0 },
    entryAt: { type: Date, default: Date.now },
    exitAt: { type: Date, default: null },
  },
  { timestamps: true },
);

botCopiedTradeSchema.index({ user: 1, status: 1 });
botCopiedTradeSchema.index({ botTrade: 1 });

const BotCopiedTrade = mongoose.model("BotCopiedTrade", botCopiedTradeSchema);
export default BotCopiedTrade;
