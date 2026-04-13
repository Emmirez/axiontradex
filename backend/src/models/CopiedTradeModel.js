// backend/src/models/CopiedTradeModel.js
import mongoose from "mongoose";

const copiedTradeSchema = new mongoose.Schema(
  {
    copyTrade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CopyTrade",
      required: true,
    },
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
    traderTrade: {                              
      type: mongoose.Schema.Types.ObjectId,
      ref: "TraderTrade",
    },
    amountInvested: { type: Number, default: 0 }, 
    originalTrade: {
      symbol: String, side: String, entryPrice: Number, quantity: Number,
    },
    copiedTrade: {
      symbol: String, side: String, entryPrice: Number, quantity: Number,
    },
    status:        { type: String, enum: ["open", "closed"], default: "open" },
    entryAt:       Date,
    exitAt:        Date,
    profit:        { type: Number, default: 0 },
    profitPercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

copiedTradeSchema.index({ follower: 1, status: 1 });
copiedTradeSchema.index({ traderTrade: 1 });   
copiedTradeSchema.index({ copyTrade: 1 });

const CopiedTrade = mongoose.model("CopiedTrade", copiedTradeSchema);
export default CopiedTrade;