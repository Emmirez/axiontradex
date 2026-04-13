// backend/src/models/AdminNotificationModel.js
import mongoose from "mongoose";

const adminNotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "user", "trade", "kyc", "system", "security"],
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
    readBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    actionUrl: {
      type: String,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "targetModel",
    },
    targetModel: {
      type: String,
      enum: ["User", "Transaction", "Trade", "KYC"],
    },
  },
  { timestamps: true }
);

adminNotificationSchema.index({ read: 1, createdAt: -1 });
adminNotificationSchema.index({ type: 1 });

const AdminNotification = mongoose.model("AdminNotification", adminNotificationSchema);
export default AdminNotification;