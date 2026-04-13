// backend/src/models/GoldPositionModel.js
import mongoose from "mongoose";

const goldPositionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    gramsOwned: { type: Number, default: 0 },
    avgBuyPrice: { type: Number, default: 0 }, // USD per gram
    totalInvested: { type: Number, default: 0 }, // USDT
    totalProfit: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// goldPositionSchema.index({ user: 1 });

const GoldPosition = mongoose.model("GoldPosition", goldPositionSchema);
export default GoldPosition;
