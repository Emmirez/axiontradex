// backend/src/models/SignalSubscriptionModel.js
import mongoose from "mongoose";

const signalSubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ["basic", "pro", "premium"],
      default: "basic",
    },
    price: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    signalsReceived: {
      type: Number,
      default: 0,
    },
    signalsExecuted: {
      type: Number,
      default: 0,
    },
    totalProfit: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const SignalSubscription = mongoose.model("SignalSubscription", signalSubscriptionSchema);
export default SignalSubscription;