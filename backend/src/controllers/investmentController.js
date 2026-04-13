import Investment from "../models/InvestmentModel.js";
import InvestmentPlan from "../models/InvestmentPlanModel.js";
import User from "../models/UserModel.js";
import Transaction from "../models/TransactionModel.js";
import { sendNotification } from "../utils/notificationHelper.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../utils/responseUtils.js";

// USER CONTROLLERS
// Get available investment plans
export const getInvestmentPlans = async (req, res) => {
  try {
    const { market } = req.query;
    const filter = { isActive: true };
    if (market) filter.market = market;

    const plans = await InvestmentPlan.find(filter).sort({ roi: -1 });
    return successResponse(res, 200, "Investment plans fetched", { plans });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Get user's investments
export const getUserInvestments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = { user: req.user._id };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.market) filter.market = req.query.market;

    const [investments, total] = await Promise.all([
      Investment.find(filter)
        .populate("planId", "name riskLevel")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Investment.countDocuments(filter),
    ]);

    return paginatedResponse(res, "Investments fetched", investments, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Get investment summary/stats
export const getInvestmentSummary = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id });

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const activeInvestments = investments.filter(
      (inv) => inv.status === "active",
    ).length;
    const maturedInvestments = investments.filter(
      (inv) => inv.status === "matured",
    ).length;
    const totalReturns = investments.reduce(
      (sum, inv) => sum + (inv.returns || 0),
      0,
    );

    const byMarket = {
      stocks: investments.filter((inv) => inv.market === "stocks").length,
      crypto: investments.filter((inv) => inv.market === "crypto").length,
      realestate: investments.filter((inv) => inv.market === "realestate")
        .length,
    };

    return successResponse(res, 200, "Investment summary fetched", {
      totalInvested,
      activeInvestments,
      maturedInvestments,
      totalReturns,
      byMarket,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Create investment
export const createInvestment = async (req, res) => {
  try {
    const { market, planType, planId, amount, customROI, customDuration, notes } = req.body;

    if (!market || !amount || amount <= 0) {
      return errorResponse(res, 400, "Market and valid amount are required");
    }

    const user = await User.findById(req.user._id).select("wallet");
    if (!user) return errorResponse(res, 404, "User not found");

    const currency    = "USDT";
    const userBalance = user.wallet?.balances?.[currency] || 0;
    if (userBalance < amount) {
      return errorResponse(res, 400, `Insufficient balance. Required: ${amount} ${currency}`);
    }

    let expectedROI, duration, planDetails = null;

    if (planType === "fixed" && planId) {
      const plan = await InvestmentPlan.findById(planId);
      if (!plan)            return errorResponse(res, 404, "Investment plan not found");
      if (!plan.isActive)   return errorResponse(res, 400, "This plan is no longer available");
      if (amount < plan.minAmount) return errorResponse(res, 400, `Minimum investment is $${plan.minAmount}`);
      if (plan.maxAmount && amount > plan.maxAmount) return errorResponse(res, 400, `Maximum investment is $${plan.maxAmount}`);
      expectedROI  = plan.roi;
      duration     = plan.duration;
      planDetails  = plan;
    } else if (planType === "custom") {
      if (!customROI || !customDuration) return errorResponse(res, 400, "Custom ROI and duration are required");
      expectedROI = customROI;
      duration    = customDuration;
    } else {
      return errorResponse(res, 400, "Invalid plan type");
    }

    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() + duration);

    const investment = await Investment.create({
      user:         req.user._id,
      market,
      planType,
      planId:       planId || null,
      amount,
      currency,
      expectedROI,
      duration,
      maturityDate,
      notes,
    });

    //  Respond immediately
    successResponse(res, 201, "Investment created successfully", { investment });

    //  Fire and forget
    User.findByIdAndUpdate(req.user._id, {
      $inc: {
        [`wallet.balances.${currency}`]: -amount,
        "wallet.balance":                -amount,
      }
    }).catch(err => console.error("[createInvestment] wallet deduct:", err.message));

    Transaction.create({
      user:        req.user._id,
      type:        "investment",
      status:      "completed",
      amount,
      currency,
      note:        `Investment in ${market}${planDetails ? ` - ${planDetails.name}` : ""}`,
      processedAt: new Date(),
    }).catch(err => console.error("[createInvestment] txn:", err.message));

    sendNotification(
      req.user._id, "investment", "Investment Created",
      `Your investment of $${amount} in ${market} has been successfully created. Expected return: ${expectedROI}%`,
      { amount, market, expectedROI, duration },
      "/investments"
    ).catch(() => {});

  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Get investment details
export const getInvestmentById = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("planId", "name riskLevel description features");

    if (!investment) return errorResponse(res, 404, "Investment not found");

    return successResponse(res, 200, "Investment fetched", { investment });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Cancel investment (only if not matured)
export const cancelInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id:    req.params.id,
      user:   req.user._id,
      status: "active",
    });

    if (!investment) return errorResponse(res, 404, "Active investment not found");

    if (new Date() >= investment.maturityDate) {
      return errorResponse(res, 400, "Investment has already matured. Please withdraw returns.");
    }

    const penalty      = investment.amount * 0.1;
    const refundAmount = investment.amount - penalty;
    const currency     = investment.currency;

    investment.status = "cancelled";
    investment.notes  = `${investment.notes || ""} Cancelled early with ${penalty} penalty`.trim();
    await investment.save();

    // Respond immediately
    successResponse(res, 200, "Investment cancelled", { investment, refundAmount, penalty });

    //  Fire and forget
    User.findByIdAndUpdate(req.user._id, {
      $inc: {
        [`wallet.balances.${currency}`]: refundAmount,
        "wallet.balance":                refundAmount,
      }
    }).catch(err => console.error("[cancelInvestment] wallet credit:", err.message));

    Transaction.create({
      user:        req.user._id,
      type:        "refund",
      status:      "completed",
      amount:      refundAmount,
      currency,
      note:        `Early withdrawal from investment - penalty: $${penalty}`,
      processedAt: new Date(),
    }).catch(err => console.error("[cancelInvestment] txn:", err.message));

    sendNotification(
      req.user._id, "investment", "Investment Cancelled",
      `Your investment of $${investment.amount} has been cancelled. Refund of $${refundAmount} has been returned to your wallet (${penalty} early withdrawal penalty).`,
      { amount: investment.amount, refundAmount, penalty },
      "/investments"
    ).catch(() => {});

  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Mature investment (admin can trigger or cron job)
export const matureInvestment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) return errorResponse(res, 404, "Investment not found");
    if (investment.status !== "active")
      return errorResponse(res, 400, "Investment is not active");

    if (new Date() < investment.maturityDate) {
      return errorResponse(res, 400, "Investment has not matured yet");
    }

    const returns = investment.amount * (investment.expectedROI / 100);
    investment.returns = returns;
    investment.status = "matured";
    investment.paidAt = new Date();
    await investment.save();

    const user = await User.findById(investment.user);
    const currency = investment.currency;

    user.wallet.balances[currency] = parseFloat(
      (user.wallet.balances[currency] + investment.amount + returns).toFixed(8),
    );
    user.wallet.balance = parseFloat(
      (user.wallet.balance + investment.amount + returns).toFixed(8),
    );
    await user.save({ validateBeforeSave: false });

    await Transaction.create({
      user: investment.user,
      type: "profit",
      status: "completed",
      amount: returns,
      currency,
      note: `Investment returns: ${returns} from ${investment.market}`,
      processedAt: new Date(),
    });

    await sendNotification(
      investment.user,
      "investment",
      "Investment Matured",
      `Your investment of $${investment.amount} has matured! You've earned $${returns} in returns. Total $${investment.amount + returns} has been credited to your wallet.`,
      {
        amount: investment.amount,
        returns,
        total: investment.amount + returns,
      },
      "/investments",
    );

    return successResponse(res, 200, "Investment matured", {
      investment,
      returns,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Add this function - User can only delete cancelled investments
export const deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "cancelled", // Only allow deletion of cancelled investments
    });

    if (!investment) {
      return errorResponse(
        res,
        404,
        "Investment not found or cannot be deleted",
      );
    }

    await investment.deleteOne();

    return successResponse(res, 200, "Investment deleted successfully");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ADMIN CONTROLLERS

// Create investment plan (admin)
export const createInvestmentPlan = async (req, res) => {
  try {
    const {
      market,
      name,
      description,
      minAmount,
      maxAmount,
      roi,
      duration,
      riskLevel,
      features,
      color,
      icon,
    } = req.body;

    if (!market || !name || !minAmount || !roi || !duration || !riskLevel) {
      return errorResponse(res, 400, "Missing required fields");
    }

    const plan = await InvestmentPlan.create({
      market,
      name,
      description,
      minAmount,
      maxAmount,
      roi,
      duration,
      riskLevel,
      features: features || [],
      color: color || "#f59e0b",
      icon: icon || "TrendingUp",
    });

    return successResponse(res, 201, "Investment plan created", { plan });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Get all investment plans (admin)
export const getAllInvestmentPlans = async (req, res) => {
  try {
    const plans = await InvestmentPlan.find().sort({ market: 1, roi: -1 });
    return successResponse(res, 200, "Investment plans fetched", { plans });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Update investment plan (admin)
export const updateInvestmentPlan = async (req, res) => {
  try {
    const plan = await InvestmentPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!plan) return errorResponse(res, 404, "Plan not found");
    return successResponse(res, 200, "Investment plan updated", { plan });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Delete investment plan (admin)
export const deleteInvestmentPlan = async (req, res) => {
  try {
    const plan = await InvestmentPlan.findByIdAndDelete(req.params.id);
    if (!plan) return errorResponse(res, 404, "Plan not found");
    return successResponse(res, 200, "Investment plan deleted");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Get all user investments (admin)
export const getAllInvestments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.market) filter.market = req.query.market;
    if (req.query.userId) filter.user = req.query.userId;

    const [investments, total] = await Promise.all([
      Investment.find(filter)
        .populate("user", "firstName lastName email")
        .populate("planId", "name riskLevel")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Investment.countDocuments(filter),
    ]);

    return paginatedResponse(res, "Investments fetched", investments, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// User withdraws a matured investment
export const withdrawInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id:    req.params.id,
      user:   req.user._id,
      status: "active",
    });

    if (!investment) return errorResponse(res, 404, "Active investment not found");

    if (new Date() < investment.maturityDate) {
      return errorResponse(res, 400, "Investment has not matured yet. Use cancel for early withdrawal.");
    }

    const returns      = investment.amount * (investment.expectedROI / 100);
    const total        = investment.amount + returns;
    const currency     = investment.currency;

    investment.returns = returns;
    investment.status  = "matured";
    investment.paidAt  = new Date();
    await investment.save();

    successResponse(res, 200, "Investment withdrawn successfully", { investment, returns, total });

    User.findByIdAndUpdate(req.user._id, {
      $inc: {
        [`wallet.balances.${currency}`]: total,
        "wallet.balance":                total,
      },
    }).catch(err => console.error("[withdrawInvestment] wallet:", err.message));

    Transaction.create({
      user:        req.user._id,
      type:        "profit",
      status:      "completed",
      amount:      returns,
      currency,
      note:        `Matured investment returns from ${investment.market}`,
      processedAt: new Date(),
    }).catch(err => console.error("[withdrawInvestment] txn:", err.message));

    sendNotification(
      req.user._id, "investment", "Investment Withdrawn",
      `Your $${investment.amount} investment has matured! $${returns.toFixed(2)} profit + principal returned. Total: $${total.toFixed(2)}.`,
      { amount: investment.amount, returns, total },
      "/investments"
    ).catch(() => {});

  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};
