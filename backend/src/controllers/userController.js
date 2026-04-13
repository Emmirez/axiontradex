import User from "../models/UserModel.js";
import Trade from "../models/TradeModel.js";
import Transaction from "../models/TransactionModel.js";
import CopiedTrade from "../models/CopiedTradeModel.js";
import BotCopiedTrade from "../models/BotCopiedTradeModel.js";
import BotSubscription from "../models/BotSubscriptionModel.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../utils/responseUtils.js";
import { sendNotification } from "../utils/notificationHelper.js";
import { sendAdminNotification } from "../utils/adminNotificationHelper.js";
import { uploadBuffer } from "../utils/uploadCloudinary.js";

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-kyc.documentUrl -kyc.selfieUrl -kyc.backUrl"
    );
    // Use toObject() instead of toSafeObject() since select already handles exclusion
    const obj = user.toObject({ virtuals: true });
    delete obj.password;
    delete obj.refreshTokens;
    delete obj.emailVerifyToken;
    delete obj.emailVerifyExpires;
    delete obj.passwordResetToken;
    delete obj.passwordResetExpires;
    delete obj.twoFactorSecret;
    return successResponse(res, 200, "Profile fetched", { user: obj });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const allowed = [
      "firstName",
      "lastName",
      "phone",
      "homeAddress",
      "country",
      "currency",
      "avatar",
    ];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    await sendNotification(
      user._id,
      "settings",
      "Profile Updated",
      "Your profile information has been successfully updated.",
      { updatedFields: Object.keys(updates) },
      "/profile",
    );

    return successResponse(res, 200, "Profile updated", {
      user: user.toSafeObject(),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return errorResponse(res, 401, "Current password is incorrect");
    }
    user.password = req.body.newPassword;
    await user.save();

    await sendNotification(
      user._id,
      "security",
      "Password Changed",
      "Your account password was changed successfully. If you did not make this change, please contact support immediately.",
      {},
      "/security",
    );

    return successResponse(res, 200, "Password changed successfully");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      // Manual trades
      totalManualTrades,
      openManualPositions,
      winningManualTrades,
      manualPnlResult,

      // Copy trades
      totalCopyTrades,
      openCopyPositions,
      winningCopyTrades,
      copyPnlResult,

      // Bot trades
      totalBotTrades,
      openBotPositions,
      winningBotTrades,
      botPnlResult,
      activeBotSubs,

      // Shared
      transactions,
      user,
    ] = await Promise.all([
      //  Manual
      Trade.countDocuments({ user: userId, assetClass: { $ne: "gold" } }),
      Trade.countDocuments({
        user: userId,
        status: "filled",
        assetClass: { $ne: "gold" },
      }),
      Trade.countDocuments({
        user: userId,
        status: "filled",
        pnl: { $gt: 0 },
        assetClass: { $ne: "gold" },
      }),
      Trade.aggregate([
        {
          $match: {
            user: userId,
            status: "filled",
            pnl: { $exists: true },
            assetClass: { $ne: "gold" },
          },
        },
        { $group: { _id: null, totalPnl: { $sum: "$pnl" } } },
      ]),

      //  Copy
      CopiedTrade.countDocuments({ follower: userId }),
      CopiedTrade.countDocuments({ follower: userId, status: "open" }),
      CopiedTrade.countDocuments({
        follower: userId,
        status: "closed",
        profit: { $gt: 0 },
      }),
      CopiedTrade.aggregate([
        { $match: { follower: userId, status: "closed" } },
        { $group: { _id: null, totalPnl: { $sum: "$profit" } } },
      ]),

      //  Bot
      BotCopiedTrade.countDocuments({ user: userId }),
      BotCopiedTrade.countDocuments({ user: userId, status: "open" }),
      BotCopiedTrade.countDocuments({
        user: userId,
        status: "closed",
        profit: { $gt: 0 },
      }),
      BotCopiedTrade.aggregate([
        { $match: { user: userId, status: "closed" } },
        { $group: { _id: null, totalPnl: { $sum: "$profit" } } },
      ]),
      BotSubscription.countDocuments({ user: userId, status: "active" }),

      // Shared
      Transaction.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
      User.findById(userId).select(
        "-kyc.documentUrl -kyc.selfieUrl -kyc.backUrl",
      ),
    ]);

    // Combine P&L
    const manualPnl = manualPnlResult[0]?.totalPnl || 0;
    const copyPnl = copyPnlResult[0]?.totalPnl || 0;
    const botPnl = botPnlResult[0]?.totalPnl || 0;
    const totalPnl = manualPnl + copyPnl + botPnl;

    // Combine trade counts
    const totalTrades = totalManualTrades + totalCopyTrades + totalBotTrades;
    const totalWins =
      winningManualTrades + winningCopyTrades + winningBotTrades;
    const openPositions =
      openManualPositions + openCopyPositions + openBotPositions;
    const winRate =
      totalTrades > 0
        ? parseFloat(((totalWins / totalTrades) * 100).toFixed(1))
        : 0;

    return successResponse(res, 200, "Dashboard stats", {
      wallet: user.wallet,
      totalTrades,
      openTrades: openPositions,
      totalPnl,
      winRate,
      recentTransactions: transactions,
      // Breakdown per source (useful for dashboard widgets)
      breakdown: {
        manual: {
          total: totalManualTrades,
          open: openManualPositions,
          pnl: manualPnl,
          wins: winningManualTrades,
        },
        copy: {
          total: totalCopyTrades,
          open: openCopyPositions,
          pnl: copyPnl,
          wins: winningCopyTrades,
        },
        bot: {
          total: totalBotTrades,
          open: openBotPositions,
          pnl: botPnl,
          wins: winningBotTrades,
          activeSubs: activeBotSubs,
        },
      },
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getMyTrades = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = { user: req.user._id };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.symbol) filter.symbol = req.query.symbol;

    const [trades, total] = await Promise.all([
      Trade.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Trade.countDocuments(filter),
    ]);

    return paginatedResponse(res, "Trades fetched", trades, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getMyTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = { user: req.user._id };

    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(filter),
    ]);

    return paginatedResponse(res, "Transactions fetched", transactions, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const submitKYC = async (req, res) => {
  try {
    if (req.user.kyc?.status === "approved") {
      return errorResponse(res, 400, "KYC already approved");
    }

    const { documentType, documentNumber } = req.body;

    if (!documentType)
      return errorResponse(res, 400, "Document type is required");
    if (!documentNumber)
      return errorResponse(res, 400, "Document number is required");

    const frontFile = req.files?.["documentUrl"]?.[0];
    const selfieFile = req.files?.["selfieUrl"]?.[0];
    const backFile = req.files?.["backUrl"]?.[0];

    if (!frontFile)
      return errorResponse(res, 400, "Front document image is required");
    if (!selfieFile) return errorResponse(res, 400, "Selfie image is required");

    let personalInfo = {},
      addressInfo = {},
      employmentInfo = {};
    try {
      personalInfo = JSON.parse(req.body.personalInfo || "{}");
    } catch {}
    try {
      addressInfo = JSON.parse(req.body.addressInfo || "{}");
    } catch {}
    try {
      employmentInfo = JSON.parse(req.body.employmentInfo || "{}");
    } catch {}

    const [documentUrl, selfieUrl, backUrl] = await Promise.all([
      uploadBuffer(frontFile.buffer, frontFile.mimetype, "kyc/front"),
      uploadBuffer(selfieFile.buffer, selfieFile.mimetype, "kyc/selfie"),
      backFile
        ? uploadBuffer(backFile.buffer, backFile.mimetype, "kyc/back")
        : Promise.resolve(""),
    ]);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        "kyc.status": "pending",
        "kyc.documentType": documentType,
        "kyc.documentNumber": documentNumber,
        "kyc.documentUrl": documentUrl,
        "kyc.backUrl": backUrl,
        "kyc.selfieUrl": selfieUrl,
        "kyc.personalInfo": personalInfo,
        "kyc.addressInfo": addressInfo,
        "kyc.employmentInfo": employmentInfo,
        "kyc.submittedAt": new Date(),
      },
      { new: true },
    );

    await sendNotification(
      req.user._id,
      "kyc",
      "KYC Application Submitted",
      "Your KYC verification documents have been submitted. Our team will review them within 24 hours.",
      { documentType, submittedAt: new Date() },
      "/kyc",
    );

    await sendAdminNotification(
      "kyc",
      "New KYC Submission",
      `${req.user.firstName} ${req.user.lastName} (${req.user.email}) submitted KYC documents for verification.`,
      { userId: req.user._id, email: req.user.email, documentType },
      "/admin/kyc?pending=true",
      req.user._id,
      "User",
    );

    return successResponse(
      res,
      200,
      "KYC submitted successfully. Review takes up to 24 hours.",
      { kyc: updatedUser.kyc },
    );
  } catch (err) {
    console.error("KYC submission error:", err);
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};
