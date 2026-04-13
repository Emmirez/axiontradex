// backend/src/models/BotTradeModel.js
import mongoose from "mongoose";

const botTradeSchema = new mongoose.Schema(
  {
    bot:        { type: mongoose.Schema.Types.ObjectId, ref: "Bot", required: true },
    symbol:     { type: String, required: true },
    side:       { type: String, enum: ["buy", "sell"], required: true },
    entryPrice: { type: Number, required: true },
    exitPrice:  { type: Number, default: null },
    quantity:   { type: Number, required: true },
    status:     { type: String, enum: ["open", "closed"], default: "open" },
    profitPercent: { type: Number, default: 0 },
    openedAt:   { type: Date, default: Date.now },
    closedAt:   { type: Date, default: null },
    note:       { type: String, default: "" },
  },
  { timestamps: true }
);

botTradeSchema.index({ bot: 1, status: 1 });

const BotTrade = mongoose.model("BotTrade", botTradeSchema);
export default BotTrade;