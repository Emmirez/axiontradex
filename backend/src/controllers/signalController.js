// backend/src/controllers/signalController.js
import Signal from "../models/SignalModel.js";
import SignalSubscription from "../models/SignalSubscriptionModel.js";
import User from "../models/UserModel.js";
import Transaction from "../models/TransactionModel.js";
import { sendNotification } from "../utils/notificationHelper.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../utils/responseUtils.js";

//  USER CONTROLLERS

// Get available signals (based on subscription)
export const getSignals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { market, type, riskLevel } = req.query;

    const filter = { status: "active" };
    if (market) filter.market = market;
    if (type) filter.signalType = type;
    if (riskLevel) filter.riskLevel = riskLevel;

    // Check user subscription
    const subscription = await SignalSubscription.findOne({
      user: req.user._id,
      isActive: true,
      endDate: { $gt: new Date() },
    });

    const signals = await Signal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "title description market symbol signalType entryPrice targetPrice stopLoss riskLevel confidence createdAt",
      );

    const total = await Signal.countDocuments(filter);

    return successResponse(res, 200, "Signals fetched", {
      signals,
      subscription: subscription
        ? {
            plan: subscription.plan,
            endDate: subscription.endDate,
            isActive: subscription.isActive,
          }
        : null,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Get signal details
export const getSignalById = async (req, res) => {
  try {
    const signal = await Signal.findById(req.params.id).populate(
      "user",
      "firstName lastName email",
    );
    if (!signal) {
      return errorResponse(res, 404, "Signal not found");
    }

    // Check subscription if it's a premium signal
    if (signal.isPremium) {
      const subscription = await SignalSubscription.findOne({
        user: req.user._id,
        isActive: true,
        endDate: { $gt: new Date() },
      });
      if (!subscription) {
        return errorResponse(
          res,
          403,
          "Premium subscription required to view this signal",
        );
      }
    }

    return successResponse(res, 200, "Signal fetched", { signal });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Subscribe to signals
export const subscribeToSignals = async (req, res) => {
  try {
    const { plan } = req.body;
    const plans = {
      basic: { price: 500, duration: 30 },
      pro: { price: 1200, duration: 30 },
      premium: { price: 2500, duration: 30 },
    };

    if (!plans[plan]) {
      return errorResponse(res, 400, "Invalid plan");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    // Check for existing subscription (active or inactive)
    let subscription = await SignalSubscription.findOne({
      user: req.user._id,
    });

    // If subscription exists, update it instead of creating new
    if (subscription) {
      const planData = plans[plan];
      const currency = "USDT";
      
      // Check if user has enough balance
      const userBalance = user.wallet?.balances?.[currency] || 0;
      if (userBalance < planData.price) {
        return errorResponse(res, 400, `Insufficient ${currency} balance for ${plan} plan ($${planData.price}). Available: $${userBalance}`);
      }

      // Deduct from wallet
      user.wallet.balances[currency] = parseFloat((user.wallet.balances[currency] - planData.price).toFixed(8));
      user.wallet.balance = parseFloat((user.wallet.balance - planData.price).toFixed(8));
      await user.save();

      // Create transaction
      await Transaction.create({
        user: req.user._id,
        type: "fee",
        status: "completed",
        amount: planData.price,
        currency: currency,
        note: `Signal subscription - ${plan} plan (renewal)`,
        processedAt: new Date(),
      });

      // Update existing subscription
      subscription.plan = plan;
      subscription.price = planData.price;
      subscription.startDate = new Date();
      subscription.endDate = new Date(Date.now() + planData.duration * 24 * 60 * 60 * 1000);
      subscription.isActive = true;
      await subscription.save();

      await sendNotification(
        req.user._id,
        "system",
        "Signal Subscription Renewed",
        `Your ${plan} plan subscription has been renewed. New expiry date: ${subscription.endDate.toLocaleDateString()}`,
        { plan, endDate: subscription.endDate },
        "/signals"
      );

      return successResponse(res, 200, `Subscription renewed to ${plan} plan`, { subscription });
    }

    // No existing subscription - create new one
    const planData = plans[plan];
    const currency = "USDT";
    
    const userBalance = user.wallet?.balances?.[currency] || 0;
    if (userBalance < planData.price) {
      return errorResponse(res, 400, `Insufficient ${currency} balance for ${plan} plan ($${planData.price}). Available: $${userBalance}`);
    }

    // Deduct from wallet
    user.wallet.balances[currency] = parseFloat((user.wallet.balances[currency] - planData.price).toFixed(8));
    user.wallet.balance = parseFloat((user.wallet.balance - planData.price).toFixed(8));
    await user.save();

    // Create transaction
    await Transaction.create({
      user: req.user._id,
      type: "fee",
      status: "completed",
      amount: planData.price,
      currency: currency,
      note: `Signal subscription - ${plan} plan`,
      processedAt: new Date(),
    });

    // Create new subscription
    subscription = await SignalSubscription.create({
      user: req.user._id,
      plan,
      price: planData.price,
      startDate: new Date(),
      endDate: new Date(Date.now() + planData.duration * 24 * 60 * 60 * 1000),
    });

    await sendNotification(
      req.user._id,
      "system",
      "Signal Subscription Activated",
      `You've subscribed to the ${plan} plan. Start receiving premium trading signals!`,
      { plan, endDate: subscription.endDate },
      "/signals"
    );

    return successResponse(res, 201, `Subscribed to ${plan} plan`, { subscription });
  } catch (err) {
    console.error("Error in subscribeToSignals:", err);
    return errorResponse(res, 500, err.message);
  }
};

// Get subscription status
export const getSubscriptionStatus = async (req, res) => {
  try {
    const subscription = await SignalSubscription.findOne({
      user: req.user._id,
      isActive: true,
    });

    if (!subscription) {
      return successResponse(res, 200, "No active subscription", {
        hasSubscription: false,
      });
    }

    const isExpired = new Date() > subscription.endDate;
    if (isExpired) {
      subscription.isActive = false;
      await subscription.save();
      return successResponse(res, 200, "Subscription expired", {
        hasSubscription: false,
      });
    }

    return successResponse(res, 200, "Subscription active", {
      hasSubscription: true,
      subscription: {
        plan: subscription.plan,
        endDate: subscription.endDate,
        daysLeft: Math.ceil(
          (subscription.endDate - new Date()) / (1000 * 60 * 60 * 24),
        ),
        signalsReceived: subscription.signalsReceived,
        signalsExecuted: subscription.signalsExecuted,
        totalProfit: subscription.totalProfit,
      },
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }

};

// Increment signal received counter for user (only once per signal)
export const incrementSignalReceived = async (req, res) => {
  try {
    const { signalId } = req.params;
    
    // Check if user already executed this signal
    const existingTrade = await Trade.findOne({
      user: req.user._id,
      signalId: signalId,
      status: { $in: ["filled", "pending"] }
    });
    
    if (existingTrade) {
      return successResponse(res, 200, "Signal already executed", { alreadyExecuted: true });
    }
    
    const subscription = await SignalSubscription.findOne({
      user: req.user._id,
      isActive: true,
      endDate: { $gt: new Date() },
    });
    
    if (subscription) {
      subscription.signalsReceived += 1;
      await subscription.save();
    }
    
    return successResponse(res, 200, "Signal marked as received");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Record profit/loss when user closes a trade from a signal
export const recordSignalProfit = async (req, res) => {
  try {
    const { signalId } = req.params;
    const { profit, tradeId } = req.body;
    
    const subscription = await SignalSubscription.findOne({
      user: req.user._id,
      isActive: true,
      endDate: { $gt: new Date() },
    });
    
    if (subscription) {
      subscription.signalsExecuted += 1;
      subscription.totalProfit += profit;
      await subscription.save();
      
      // Create transaction record for the profit/loss
      await Transaction.create({
        user: req.user._id,
        type: profit >= 0 ? "profit" : "loss",
        status: "completed",
        amount: Math.abs(profit),
        currency: "USDT",
        note: `${profit >= 0 ? "Profit" : "Loss"} from signal trade`,
        processedAt: new Date(),
        metadata: { signalId, tradeId, profit },
      });
      
      // Send notification
      await sendNotification(
        req.user._id,
        "trade",
        profit >= 0 ? "Trade Profit! 🎉" : "Trade Closed",
        `Your trade from signal generated ${profit >= 0 ? "profit" : "loss"} of $${Math.abs(profit).toFixed(2)}`,
        { profit, signalId, tradeId },
        "/signals"
      );
    }
    
    return successResponse(res, 200, "Signal profit recorded", { subscription });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Mark signal as executed with profit
export const executeSignal = async (req, res) => {
  try {
    const { signalId } = req.params;
    const { profit } = req.body;
    
    const signal = await Signal.findById(signalId);
    if (!signal) {
      return errorResponse(res, 404, "Signal not found");
    }
    
    const subscription = await SignalSubscription.findOne({
      user: req.user._id,
      isActive: true,
      endDate: { $gt: new Date() },
    });
    
    if (subscription) {
      subscription.signalsExecuted += 1;
      subscription.totalProfit += profit;
      await subscription.save();
      
      // Create transaction record for profit
      if (profit !== 0) {
        await Transaction.create({
          user: req.user._id,
          type: profit > 0 ? "profit" : "loss",
          status: "completed",
          amount: Math.abs(profit),
          currency: "USDT",
          note: `Profit from executing signal: ${signal.title}`,
          processedAt: new Date(),
        });
      }
    }
    
    return successResponse(res, 200, "Signal marked as executed", { subscription });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};



// Unsubscribe from signals
export const unsubscribeFromSignals = async (req, res) => {
  try {
    const subscription = await SignalSubscription.findOne({
      user: req.user._id,
      isActive: true,
    });

    if (!subscription) {
      return errorResponse(res, 404, "No active subscription found");
    }

    // Deactivate subscription
    subscription.isActive = false;
    await subscription.save();

    // Send notification to user
    await sendNotification(
      req.user._id,
      "system",
      "Signal Subscription Cancelled",
      `Your ${subscription.plan} plan subscription has been cancelled. You will no longer receive premium signals.`,
      { plan: subscription.plan },
      "/signals"
    );

    return successResponse(res, 200, "Successfully unsubscribed from signals", {
      subscription: {
        plan: subscription.plan,
        cancelledAt: new Date(),
      },
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

//  ADMIN CONTROLLERS

// Create signal (admin)
export const createSignal = async (req, res) => {
  try {
    const {
      title,
      description,
      market,
      symbol,
      signalType,
      entryPrice,
      targetPrice,
      stopLoss,
      riskLevel,
      confidence,
      expiryDate,
      isPremium,
    } = req.body;

    const signal = await Signal.create({
      user: req.user._id,
      title,
      description,
      market,
      symbol,
      signalType,
      entryPrice,
      targetPrice,
      stopLoss,
      riskLevel: riskLevel || "Medium",
      confidence: confidence || 70,
      expiryDate: expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isPremium: isPremium !== undefined ? isPremium : true,
    });

    // Notify premium subscribers if signal is premium
    if (signal.isPremium) {
      const subscribers = await SignalSubscription.find({
        isActive: true,
        endDate: { $gt: new Date() },
      }).populate("user", "_id");

      for (const sub of subscribers) {
        await sendNotification(
          sub.user._id,
          "signal",
          "New Premium Signal!",
          `${signal.symbol} ${signal.signalType.toUpperCase()} signal: Entry $${signal.entryPrice}, Target $${signal.targetPrice}`,
          { signalId: signal._id, symbol: signal.symbol },
          "/signals",
        );
      }
    }

    return successResponse(res, 201, "Signal created", { signal });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Get all signals (admin)
export const getAllSignals = async (req, res) => {
  try {
    const signals = await Signal.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });
    return successResponse(res, 200, "All signals fetched", { signals });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Update signal status (admin)
export const updateSignalStatus = async (req, res) => {
  try {
    const { status, performance } = req.body;
    const signal = await Signal.findById(req.params.id);
    if (!signal) {
      return errorResponse(res, 404, "Signal not found");
    }

    signal.status = status;
    if (performance) {
      signal.performance = performance;
    }
    await signal.save();

    // Notify users who subscribed to this signal
    for (const subscriber of signal.subscribers) {
      await sendNotification(
        subscriber.user,
        "signal",
        `Signal ${status.toUpperCase()}`,
        `${signal.symbol} signal has been ${status}`,
        { signalId: signal._id },
        "/signals",
      );
    }

    return successResponse(res, 200, "Signal updated", { signal });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const deleteSignal = async (req, res) => {
  try {
    const signal = await Signal.findById(req.params.id);
    if (!signal) {
      return errorResponse(res, 404, "Signal not found");
    }

    await Signal.findByIdAndDelete(req.params.id);

    return successResponse(res, 200, "Signal deleted successfully", {
      deletedId: req.params.id,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};
