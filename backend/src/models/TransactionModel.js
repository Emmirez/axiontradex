import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "deposit",
        "withdrawal",
        "trade",
        "fee",
        "bonus",
        "referral",
        "investment",
        "profit",
        "loss",
        "refund",
        "swap",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled", "closed"],
      default: "pending",
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    fee: { type: Number, default: 0 },
    txHash: { type: String },
    network: { type: String },
    address: { type: String },
    receipt: { type: String },
    bankName: { type: String },
    accountNo: { type: String },
    reference: { type: String, unique: true },
    note: { type: String },
    processedAt: { type: Date },
    subType: {
      type: String,
      enum: ["commission", "welcome", "referral", null],
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });

transactionSchema.pre("save", function () {
  if (!this.reference) {
    this.reference = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  }
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
