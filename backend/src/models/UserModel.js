import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    dateOfBirth: { type: Date },
    phone: { type: String, trim: true },
    homeAddress: { type: String, trim: true },
    country: { type: String, trim: true },
    currency: { type: String, default: "USD" },
    referralCode: { type: String },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    referralCount: { type: Number, default: 0 },
    totalCommissionEarned: { type: Number, default: 0 },
    avatar: { type: String, default: "" },

    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "banned", "pending"],
      default: "pending",
    },

    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, select: false },
    emailVerifyExpires: { type: Date, select: false },

    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },

    kyc: {
      status: {
        type: String,
        enum: ["unverified", "pending", "approved", "rejected"],
        default: "unverified",
      },
      documentType: { type: String },
      documentNumber: { type: String },
      documentUrl: { type: String },
      backUrl: { type: String },
      selfieUrl: { type: String },
      personalInfo: {
        firstName: { type: String },
        lastName: { type: String },
        dob: { type: String },
        gender: { type: String },
      },
      addressInfo: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        zip: { type: String },
      },
      employmentInfo: {
        status: { type: String },
        employer: { type: String },
        income: { type: String },
      },
      submittedAt: { type: Date },
      reviewedAt: { type: Date },
      reviewNote: { type: String },
    },

    wallet: {
      balance: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      balances: {
        USD: { type: Number, default: 0 },
        USDT: { type: Number, default: 0 },
        BTC: { type: Number, default: 0 },
        ETH: { type: Number, default: 0 },
        SOL: { type: Number, default: 0 },
        BNB: { type: Number, default: 0 },
      },
      locked: { type: Number, default: 0 },
      bonusLocked: { type: Number, default: 0 },
      bonusUnlocked: { type: Boolean, default: false },
      hasDeposited: { type: Boolean, default: false },
    },

    refreshTokens: [{ type: String, select: false }],

    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
  },
  { timestamps: true },
);

// Indexes
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ referralCode: 1 }, { unique: true, sparse: true });
userSchema.index({ referredBy: 1 });

// Single merged pre-save hook — prevents double hashing
userSchema.pre("save", async function () {
  // Auto-generate referral code on first save
  if (!this.referralCode) {
    this.referralCode =
      this.firstName.slice(0, 3).toUpperCase() +
      Math.random().toString(36).substring(2, 7).toUpperCase();
  }

  // Only hash password if it was modified
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.emailVerifyToken;
  delete obj.emailVerifyExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.twoFactorSecret;

  // if (obj.kyc) {
  //   delete obj.kyc.documentUrl;
  //   delete obj.kyc.selfieUrl;
  //   delete obj.kyc.backUrl;
  // }
  return obj;
};

const User = mongoose.model("User", userSchema);
export default User;
