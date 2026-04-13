// backend/src/models/TraderTradeModel.js
import mongoose from "mongoose";

const traderTradeSchema = new mongoose.Schema(
  {
    trader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CopyTrader",
      required: true,
    },
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

traderTradeSchema.index({ trader: 1, status: 1 });

const TraderTrade = mongoose.model("TraderTrade", traderTradeSchema);
export default TraderTrade;