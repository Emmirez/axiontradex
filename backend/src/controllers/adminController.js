import User from "../models/UserModel.js";
import Trade from "../models/TradeModel.js";
import Transaction from "../models/TransactionModel.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../utils/responseUtils.js";
import { sendAdminNotification } from "../utils/adminNotificationHelper.js";
import { sendNotification } from "../utils/notificationHelper.js";
import { MARKET_DATA } from "./marketController.js";
import { getCachedPrices } from "../utils/rateCache.js";
// backend/src/controllers/adminController.js

// Get live prices for cryptocurrencies
const getLivePrices = () => {
  const rates = getCachedPrices() || {};
  return {
    BTC: rates.BTC || 65000,
    ETH: rates.ETH || 3500,
    SOL: rates.SOL || 180,
    BNB: rates.BNB || 600,
    MATIC: rates.MATIC || 0.8,
    XRP: rates.XRP || 0.5,
  };
};

// Calculate total USD with live prices
const calculateTotalUSD = (balances) => {
  try {
    const prices = getLivePrices();

    let total = 0;
    total += balances.USD || 0;
    total += balances.USDT || 0;
    total += (balances.BTC || 0) * prices.BTC;
    total += (balances.ETH || 0) * prices.ETH;
    total += (balances.SOL || 0) * prices.SOL;
    total += (balances.BNB || 0) * prices.BNB;

    return parseFloat(total.toFixed(2));
  } catch (err) {
    console.error("[calculateTotalUSD] Error:", err);
    // Fallback calculation
    let total = 0;
    total += balances.USD || 0;
    total += balances.USDT || 0;
    total += (balances.BTC || 0) * 65000;
    total += (balances.ETH || 0) * 3500;
    total += (balances.SOL || 0) * 180;
    total += (balances.BNB || 0) * 600;
    return parseFloat(total.toFixed(2));
  }
};

const getUserBalanceSummary = async (user) => {
  if (!user.wallet) {
    return {
      total: 0,
      totalUSD: 0,
      currencies: {
        USD: 0,
        USDT: 0,
        BTC: 0,
        ETH: 0,
        SOL: 0,
        BNB: 0,
      },
      locked: 0,
      bonusLocked: 0,
      hasDeposited: false,
    };
  }

  const currencies = user.wallet.balances || {
    USD: user.wallet.balance || 0,
    USDT: 0,
    BTC: 0,
    ETH: 0,
    SOL: 0,
    BNB: 0,
  };

  // Calculate total USD using live prices from MARKET_DATA
  const totalUSD = calculateTotalUSD(currencies);

  // Calculate raw total (sum of all currency amounts)
  let rawTotal = 0;
  Object.values(currencies).forEach((val) => {
    rawTotal += val;
  });

  return {
    total: parseFloat(rawTotal.toFixed(8)),
    totalUSD: parseFloat(totalUSD.toFixed(2)),
    currencies,
    locked: user.wallet.locked || 0,
    bonusLocked: user.wallet.bonusLocked || 0,
    hasDeposited: user.wallet.hasDeposited || false,
  };
};

export const getDashboardOverview = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get all users and calculate total platform balance
    const allUsers = await User.find().select("wallet");
    let totalPlatformBalance = 0;
    let totalPlatformValueUSD = 0;
    const totalBalancesByCurrency = {
      USD: 0,
      USDT: 0,
      BTC: 0,
      ETH: 0,
      SOL: 0,
      BNB: 0,
    };

    const prices = getLivePrices();

    allUsers.forEach((user) => {
      if (user.wallet?.balances) {
        Object.entries(user.wallet.balances).forEach(([currency, amount]) => {
          if (totalBalancesByCurrency[currency] !== undefined) {
            totalBalancesByCurrency[currency] += amount;
          }
          totalPlatformBalance += amount;

          if (currency === "USD" || currency === "USDT") {
            totalPlatformValueUSD += amount;
          } else if (currency === "BTC") {
            totalPlatformValueUSD += amount * prices.BTC;
          } else if (currency === "ETH") {
            totalPlatformValueUSD += amount * prices.ETH;
          } else if (currency === "SOL") {
            totalPlatformValueUSD += amount * prices.SOL;
          } else if (currency === "BNB") {
            totalPlatformValueUSD += amount * prices.BNB;
          }
        });
      } else if (user.wallet?.balance) {
        totalPlatformBalance += user.wallet.balance;
        totalBalancesByCurrency.USD += user.wallet.balance;
        totalPlatformValueUSD += user.wallet.balance;
      }
    });

    // Get ALL completed deposits (not grouped by currency yet)
    const allDeposits = await Transaction.find({
      type: "deposit",
      status: "completed",
    }).select("amount currency");

    // Calculate total deposits in USD using live rates
    let totalDepositsUSD = 0;
    const depositsByCurrency = {
      USD: 0,
      USDT: 0,
      BTC: 0,
      ETH: 0,
      SOL: 0,
      BNB: 0,
    };

    allDeposits.forEach((deposit) => {
      const currency = deposit.currency || "USD";
      const amount = deposit.amount;

      // Track raw amounts by currency
      if (depositsByCurrency[currency] !== undefined) {
        depositsByCurrency[currency] += amount;
      }

      // Convert to USD value
      if (currency === "USD" || currency === "USDT") {
        totalDepositsUSD += amount;
      } else if (currency === "BTC") {
        totalDepositsUSD += amount * prices.BTC;
      } else if (currency === "ETH") {
        totalDepositsUSD += amount * prices.ETH;
      } else if (currency === "SOL") {
        totalDepositsUSD += amount * prices.SOL;
      } else if (currency === "BNB") {
        totalDepositsUSD += amount * prices.BNB;
      } else {
        // Default treat as USD if currency not recognized
        totalDepositsUSD += amount;
      }
    });

    // Get ALL completed withdrawals
    const allWithdrawals = await Transaction.find({
      type: "withdrawal",
      status: "completed",
    }).select("amount currency");

    // Calculate total withdrawals in USD using live rates
    let totalWithdrawalsUSD = 0;
    const withdrawalsByCurrency = {
      USD: 0,
      USDT: 0,
      BTC: 0,
      ETH: 0,
      SOL: 0,
      BNB: 0,
    };

    allWithdrawals.forEach((withdrawal) => {
      const currency = withdrawal.currency || "USD";
      const amount = withdrawal.amount;

      // Track raw amounts by currency
      if (withdrawalsByCurrency[currency] !== undefined) {
        withdrawalsByCurrency[currency] += amount;
      }

      // Convert to USD value
      if (currency === "USD" || currency === "USDT") {
        totalWithdrawalsUSD += amount;
      } else if (currency === "BTC") {
        totalWithdrawalsUSD += amount * prices.BTC;
      } else if (currency === "ETH") {
        totalWithdrawalsUSD += amount * prices.ETH;
      } else if (currency === "SOL") {
        totalWithdrawalsUSD += amount * prices.SOL;
      } else if (currency === "BNB") {
        totalWithdrawalsUSD += amount * prices.BNB;
      } else {
        totalWithdrawalsUSD += amount;
      }
    });

    const [
      totalUsers,
      activeUsers,
      pendingKYC,
      totalTrades,
      recentUsers,
      newUsers30d,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ "kyc.status": "pending" }),
      Trade.countDocuments(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("firstName lastName email role status createdAt wallet"),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    // Format recent users with balances
    const formattedRecentUsers = await Promise.all(
      recentUsers.map(async (user) => {
        const userObj = user.toObject();
        const balanceSummary = await getUserBalanceSummary(user);
        return {
          ...userObj,
          wallet: {
            balance: balanceSummary.total,
            totalUSD: balanceSummary.totalUSD,
            balances: balanceSummary.currencies,
            locked: balanceSummary.locked,
          },
        };
      }),
    );

    return successResponse(res, 200, "Admin dashboard overview", {
      stats: {
        totalUsers,
        activeUsers,
        pendingKYC,
        totalTrades,
        newUsers30d,
        totalDeposits: parseFloat(totalDepositsUSD.toFixed(2)),
        totalWithdrawals: parseFloat(totalWithdrawalsUSD.toFixed(2)),
        totalPlatformBalance: parseFloat(totalPlatformBalance.toFixed(8)),
        totalPlatformValueUSD: parseFloat(totalPlatformValueUSD.toFixed(2)),
        balancesByCurrency: totalBalancesByCurrency,
        currentPrices: prices,
        depositsBreakdown: depositsByCurrency,
        withdrawalsBreakdown: withdrawalsByCurrency,
      },
      recentUsers: formattedRecentUsers,
    });
  } catch (err) {
    console.error("[getDashboardOverview] Error:", err);
    return errorResponse(res, 500, err.message);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const filter = {};

    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.kyc) filter["kyc.status"] = req.query.kyc;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select(
          "-password -refreshTokens -emailVerifyToken -passwordResetToken -twoFactorSecret -kyc.documentUrl -kyc.backUrl -kyc.selfieUrl",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Format users with proper balance summary
    const formattedUsers = await Promise.all(
      users.map(async (user) => {
        const balanceSummary = await getUserBalanceSummary(user);

        return {
          ...user,
          wallet: {
            balance: balanceSummary.totalUSD,
            totalUSD: balanceSummary.totalUSD,
            locked: balanceSummary.locked,
            balances: balanceSummary.currencies,
          },
        };
      }),
    );

    return paginatedResponse(res, "Users fetched", formattedUsers, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -refreshTokens -twoFactorSecret",
    );
    if (!user) return errorResponse(res, 404, "User not found");

    const [trades, transactions] = await Promise.all([
      Trade.find({ user: user._id }).sort({ createdAt: -1 }).limit(10).lean(),
      Transaction.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const userObj = user.toSafeObject ? user.toSafeObject() : user.toObject();
    const balanceSummary = await getUserBalanceSummary(user); // Note: added await

    const formattedUser = {
      ...userObj,
      wallet: {
        balance: balanceSummary.totalUSD,
        rawBalance: balanceSummary.total,
        locked: balanceSummary.locked,
        balances: balanceSummary.currencies,
        totalUSD: balanceSummary.totalUSD,
        bonusLocked: balanceSummary.bonusLocked,
        hasDeposited: balanceSummary.hasDeposited,
      },
    };

    return successResponse(res, 200, "User fetched", {
      user: formattedUser,
      trades,
      transactions,
    });
  } catch (err) {
    console.error("[getUserById] error:", err);
    return errorResponse(res, 500, err.message);
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "suspended", "banned", "pending"].includes(status))
      return errorResponse(res, 400, "Invalid status value");

    const target = await User.findById(req.params.id);
    if (!target) return errorResponse(res, 404, "User not found");
    if (target.role === "superadmin")
      return errorResponse(res, 403, "Cannot modify superadmin");

    target.status = status;
    await target.save({ validateBeforeSave: false });

    // Send user notification
    let notificationTitle, notificationBody;
    switch (status) {
      case "suspended":
        notificationTitle = "Account Suspended";
        notificationBody =
          "Your account has been suspended. Please contact support for more information.";
        break;
      case "banned":
        notificationTitle = "Account Banned";
        notificationBody = "Your account has been permanently banned.";
        break;
      case "active":
        notificationTitle = "Account Activated";
        notificationBody =
          "Your account has been reactivated. You can now log in and trade.";
        break;
      default:
        notificationTitle = "Account Status Updated";
        notificationBody = `Your account status has been updated to ${status}.`;
    }

    await sendNotification(
      target._id,
      "security",
      notificationTitle,
      notificationBody,
      { status },
      "/profile",
    );

    // Send admin notification
    await sendAdminNotification(
      "user",
      `User ${status.toUpperCase()}`,
      `${target.firstName} ${target.lastName} (${target.email}) was ${status} by ${req.user.firstName} ${req.user.lastName}.`,
      {
        userId: target._id,
        email: target.email,
        status,
        updatedBy: req.user._id,
      },
      "/admin/users/" + target._id,
      target._id,
      "User",
    );

    return successResponse(res, 200, `User ${status}`, {
      user: target.toSafeObject(),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (role === "superadmin")
      return errorResponse(res, 403, "Cannot assign superadmin role");
    if (!["user", "admin"].includes(role))
      return errorResponse(res, 400, "Invalid role");

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    );
    if (!user) return errorResponse(res, 404, "User not found");

    return successResponse(res, 200, "User role updated", {
      user: user.toSafeObject(),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const reviewKYC = async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!["approved", "rejected"].includes(status))
      return errorResponse(res, 400, "Status must be approved or rejected");

    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, "User not found");

    // Allow reviewing any status except unverified (nothing submitted yet)
    if (!user.kyc?.status || user.kyc.status === "unverified")
      return errorResponse(res, 400, "No KYC submission to review");

    user.kyc.status = status;
    user.kyc.reviewedAt = new Date();
    user.kyc.reviewNote = note;
    await user.save({ validateBeforeSave: false });

    // Send notification for KYC review result
    if (status === "approved") {
      await sendNotification(
        user._id,
        "kyc",
        "KYC Approved!",
        "Congratulations! Your identity has been verified. You now have full access to all platform features.",
        { reviewedAt: new Date(), note },
        "/kyc",
      );
    } else if (status === "rejected") {
      await sendNotification(
        user._id,
        "kyc",
        "KYC Application Update",
        `Your KYC verification was not approved. ${note || "Please submit new documents for review."}`,
        { reviewedAt: new Date(), note, reason: note },
        "/kyc",
      );
    }

    // Send admin notification
    await sendAdminNotification(
      "kyc",
      `KYC ${status.toUpperCase()}`,
      `${user.firstName} ${user.lastName}'s KYC application was ${status}. ${note || ""}`,
      { userId: user._id, email: user.email, status, note },
      "/admin/kyc",
      user._id,
      "User",
    );

    return successResponse(res, 200, `KYC ${status}`, {
      user: user.toSafeObject(),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("user", "firstName lastName email username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
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

export const processTransaction = async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!["completed", "failed", "cancelled"].includes(status))
      return errorResponse(res, 400, "Invalid status");

    const txn = await Transaction.findById(req.params.id);
    if (!txn) return errorResponse(res, 404, "Transaction not found");
    if (txn.status !== "pending")
      return errorResponse(res, 400, "Transaction is not pending");

    txn.status = status;
    txn.note = note;
    txn.processedAt = new Date();
    await txn.save();

    return successResponse(res, 200, `Transaction ${status}`, {
      transaction: txn,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const adjustWallet = async (req, res) => {
  try {
    const { amount, currency = "USD", note, type } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, "User not found");

    // Initialize wallet if needed
    if (!user.wallet) {
      user.wallet = {
        balance: 0,
        balances: {
          USD: 0,
          USDT: 0,
          BTC: 0,
          ETH: 0,
          SOL: 0,
          BNB: 0,
        },
        locked: 0,
        bonusLocked: 0,
        hasDeposited: false,
      };
    }

    if (!user.wallet.balances) {
      user.wallet.balances = {
        USD: 0,
        USDT: 0,
        BTC: 0,
        ETH: 0,
        SOL: 0,
        BNB: 0,
      };
    }

    // Get current balance for the specific currency
    const currentBalance = user.wallet.balances[currency] || 0;
    const newBalance = parseFloat((currentBalance + amount).toFixed(8));

    // Update per-currency balance
    user.wallet.balances[currency] = newBalance;

    // Calculate total balance across all currencies
    let totalBalance = 0;
    Object.values(user.wallet.balances).forEach((val) => {
      totalBalance += val;
    });
    user.wallet.balance = parseFloat(totalBalance.toFixed(8));

    if (user.wallet.balance < 0) user.wallet.balance = 0;

    await user.save({ validateBeforeSave: false });

    // Create transaction record
    await Transaction.create({
      user: user._id,
      type: type || "bonus",
      status: "completed",
      amount: Math.abs(amount),
      currency,
      note: note || "Manual admin adjustment",
      processedAt: new Date(),
    });

    return successResponse(res, 200, "Wallet adjusted", {
      currency,
      newBalance: user.wallet.balances[currency],
      totalBalance: user.wallet.balance,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Superadmin only — promote a user to admin
export const promoteToAdmin = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return errorResponse(res, 404, "User not found");

    if (target.role === "superadmin") {
      return errorResponse(res, 400, "User is already a superadmin");
    }
    if (target.role === "admin") {
      return errorResponse(res, 400, `${target.firstName} is already an admin`);
    }
    if (target.status !== "active") {
      return errorResponse(
        res,
        400,
        "Cannot promote a suspended or banned user. Activate their account first.",
      );
    }
    if (!target.isEmailVerified) {
      return errorResponse(
        res,
        400,
        "Cannot promote a user with an unverified email address",
      );
    }

    target.role = "admin";
    await target.save({ validateBeforeSave: false });

    // Send user notification
    await sendNotification(
      target._id,
      "system",
      "Admin Role Granted",
      `You have been promoted to Admin. You now have access to the admin dashboard.`,
      { role: "admin" },
      "/admin",
    );

    // Send admin notification
    await sendAdminNotification(
      "user",
      "User Promoted to Admin",
      `${target.firstName} ${target.lastName} (${target.email}) was promoted to Admin by ${req.user.firstName} ${req.user.lastName}.`,
      { userId: target._id, email: target.email, promotedBy: req.user._id },
      "/admin/users/" + target._id,
      target._id,
      "User",
    );

    return successResponse(
      res,
      200,
      `${target.firstName} ${target.lastName} has been promoted to admin`,
      {
        user: target.toSafeObject(),
      },
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Superadmin only — demote an admin back to regular user
export const demoteToUser = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return errorResponse(res, 404, "User not found");

    if (target.role === "superadmin") {
      return errorResponse(res, 403, "Cannot demote a superadmin account");
    }
    if (target.role === "user") {
      return errorResponse(
        res,
        400,
        `${target.firstName} is already a regular user`,
      );
    }

    // Prevent demoting yourself
    if (target._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 403, "You cannot demote your own account");
    }

    target.role = "user";
    await target.save({ validateBeforeSave: false });

    // Send user notification
    await sendNotification(
      target._id,
      "system",
      "Admin Role Removed",
      `Your admin privileges have been removed. You are now a regular user.`,
      { role: "user" },
      "/dashboard",
    );

    // Send admin notification
    await sendAdminNotification(
      "user",
      "Admin Demoted to User",
      `${target.firstName} ${target.lastName} (${target.email}) was demoted to User by ${req.user.firstName} ${req.user.lastName}.`,
      { userId: target._id, email: target.email, demotedBy: req.user._id },
      "/admin/users/" + target._id,
      target._id,
      "User",
    );

    return successResponse(
      res,
      200,
      `${target.firstName} ${target.lastName} has been demoted to user`,
      {
        user: target.toSafeObject(),
      },
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// GET /api/admin/users/search - Search users by name or email
export const searchUsers = async (req, res) => {
  try {
    const { search, limit = 10 } = req.query;

    if (!search || search.length < 2) {
      return res.status(200).json({
        success: true,
        message: "Search term too short",
        data: [],
      });
    }

    // Decode the search term
    const decodedSearch = decodeURIComponent(search);

    const users = await User.find({
      $or: [
        { firstName: { $regex: decodedSearch, $options: "i" } },
        { lastName: { $regex: decodedSearch, $options: "i" } },
        { email: { $regex: decodedSearch, $options: "i" } },
      ],
    })
      .select("_id firstName lastName email wallet")
      .limit(parseInt(limit))
      .lean();

    return res.status(200).json({
      success: true,
      message: "Users found",
      data: users,
    });
  } catch (err) {
    console.error("[searchUsers] error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getUserBalance = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "wallet firstName lastName email",
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const balances = user.wallet?.balances || {
      USD: 0,
      USDT: 0,
      BTC: 0,
      ETH: 0,
      SOL: 0,
      BNB: 0,
    };
    const locked = user.wallet?.locked || 0;
    const totalUSD = calculateTotalUSD(balances);
    const prices = getLivePrices();

    // Available = totalUSD - locked (locked is always in USDT equivalent)
    const available = Math.max(0, parseFloat(totalUSD.toFixed(2)));

    return res.status(200).json({
      success: true,
      message: "User balance fetched",
      data: {
        userId: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        //  Nest everything inside balances so frontend reads userBalance.balances.X
        balances: {
          ...balances, 
          totalUSD, 
          locked,
          available, 
        },
        prices,
      },
    });
  } catch (err) {
    console.error("[getUserBalance] error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
