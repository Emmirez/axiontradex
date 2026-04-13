import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../src/config/db.js";
import logger from "../src/config/logger.js";

const createSuperAdmin = async () => {
  await connectDB();

  const { Schema } = mongoose;

  const userSchema = new Schema(
    {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      username: { type: String, required: true, unique: true, lowercase: true },
      email: { type: String, required: true, unique: true, lowercase: true },
      password: { type: String, required: true },
      role: { type: String, default: "user" },
      status: { type: String, default: "pending" },
      isEmailVerified: { type: Boolean, default: false },
      country: { type: String },
      currency: { type: String, default: "USD" },
      phone: { type: String },
      homeAddress: { type: String },
      dateOfBirth: { type: Date },
      referralCode: { type: String },
      referredBy: { type: Schema.Types.ObjectId },
      avatar: { type: String, default: "" },
      twoFactorEnabled: { type: Boolean, default: false },
      twoFactorSecret: { type: String },
      kyc: {
        status: { type: String, default: "none" },
        documentType: { type: String },
        documentUrl: { type: String },
      },
      wallet: {
        balance: { type: Number, default: 0 },
        currency: { type: String, default: "USD" },
        locked: { type: Number, default: 0 },
      },
      refreshTokens: [String],
      lastLoginAt: { type: Date },
      lastLoginIp: { type: String },
    },
    { timestamps: true },
  );

  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
  });

  const User = mongoose.models.User || mongoose.model("User", userSchema);

  const email = process.env.ADMIN_EMAIL || "superadmin@axiontrade.com";
  const password = process.env.ADMIN_PASSWORD || "SuperAdmin@123456";
  const username = "superadmin";

  const existing = await User.findOne({ $or: [{ email }, { username }] });

  if (existing) {
    if (existing.role === "superadmin") {
      logger.info(`Superadmin already exists: ${existing.email}`);
    } else {
      existing.role = "superadmin";
      existing.status = "active";
      existing.isEmailVerified = true;
      await existing.save();
      logger.info(`User upgraded to superadmin: ${existing.email}`);
    }
    await mongoose.disconnect();
    process.exit(0);
  }

  logger.info("Creating new superadmin...");

  const superAdmin = new User({
    firstName: "Super",
    lastName: "Admin",
    username,
    email,
    password,
    role: "superadmin",
    status: "active",
    isEmailVerified: true,
    country: "GB",
    currency: "USD",
  });

  await superAdmin.save();

  logger.info("Superadmin created successfully");
  logger.info(`Email:    ${email}`);
  logger.info(`Username: ${username}`);
  logger.info(`Password: ${password}`);
  logger.info("Change your password after first login!");

  await mongoose.disconnect();
  process.exit(0);
};

createSuperAdmin().catch((err) => {
  logger.error("Failed to create superadmin:");
  logger.error(`Message: ${err.message}`);
  logger.error(`Code:    ${err.code}`);
  console.error(err);
  process.exit(1);
});
