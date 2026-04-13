// backend/src/models/NotificationModel.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "trade",  "trading", "security", "kyc", "settings", "referral", "system", "investment", "profit", "refund", "swap", 'wallet'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "Bell",
    },
    iconColor: {
      type: String,
      default: "#f59e0b",
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    actionUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });


const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;