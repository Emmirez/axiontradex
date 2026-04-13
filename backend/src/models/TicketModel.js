// backend/src/models/TicketModel.js
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticketId: {
      type: String,
      unique: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "account",
        "kyc",
        "deposit",
        "withdrawal",
        "trading",
        "technical",
        "security",
        "other",
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    messages: [
      {
        sender: {
          type: String,
          enum: ["user", "admin"],
          required: true,
        },
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: {
          type: String,
          required: true,
        },
        attachments: [
          {
            filename: String,
            url: String,
            size: Number,
          },
        ],
        readAt: Date,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: Date,
    closedAt: Date,
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      createdAt: Date,
    },
  },
  { 
    timestamps: true,
    validateBeforeSave: true 
  }
);


ticketSchema.pre("validate", async function() {
  if (!this.ticketId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.ticketId = `TKT-${year}${month}-${random}`;
  }
  
});

ticketSchema.index({ user: 1, status: 1 });
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ lastActivityAt: -1 });

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;