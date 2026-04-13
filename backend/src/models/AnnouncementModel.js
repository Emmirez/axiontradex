// backend/src/models/AnnouncementModel.js
import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "maintenance"],
      default: "info",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isGlobal: {
      type: Boolean,
      default: true,
    },
    targetUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    targetRoles: {
      type: [String],
      enum: ["user", "admin", "superadmin"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    dismissible: {
      type: Boolean,
      default: true,
    },
    dismissedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    actionUrl: {
      type: String,
    },
    actionText: {
      type: String,
      default: "Read more",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for active announcements
announcementSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
announcementSchema.index({ createdAt: -1 });

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;