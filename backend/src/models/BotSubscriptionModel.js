// backend/src/models/BotSubscriptionModel.js
import mongoose from "mongoose";

const botSubscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bot: { type: mongoose.Schema.Types.ObjectId, ref: "Bot", required: true },
    allocationAmount: { type: Number, required: true },
    status: { type: String, enum: ["active", "cancelled"], default: "active" },
    subscriptionEndDate: { type: Date },
    totalInvested: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
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

botSubscriptionSchema.index({ user: 1, bot: 1 });
botSubscriptionSchema.index({ status: 1 });

const BotSubscription = mongoose.model(
  "BotSubscription",
  botSubscriptionSchema,
);
export default BotSubscription;
