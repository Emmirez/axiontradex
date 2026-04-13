import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    side: { type: String, enum: ["buy", "sell"], required: true },
    type: { type: String, enum: ["market", "limit", "stop"], required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "filled",
        "cancelled",
        "failed",
        "closed",
        "liquidated",
      ],
      default: "pending",
    },
    quantity: { type: Number, required: true },
    price: { type: Number },
    filledPrice: { type: Number },
    filledAt: { type: Date },
    leverage: { type: Number, default: 1, min: 1, max: 100 },
    margin: { type: Number },
    total: { type: Number },
    liquidationPrice: { type: Number }, // price at which position gets liquidated
    stopLoss: { type: Number },
    takeProfit: { type: Number },
    fee: { type: Number, default: 0 },
    feeCurrency: { type: String, default: "USDT" },
    pnl: { type: Number, default: 0 },
    assetClass: {
      type: String,
      enum: ["crypto", "stock", "gold", "commodity", "forex"],
      default: "crypto",
    },
    exchange: { type: String, default: "AxionTrade" },
    notes: { type: String },
    signalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Signal",
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

tradeSchema.index({ user: 1, createdAt: -1 });
tradeSchema.index({ symbol: 1, status: 1 });
tradeSchema.index({ symbol: 1, status: 1, liquidationPrice: 1 });

const Trade = mongoose.model("Trade", tradeSchema);
export default Trade;
