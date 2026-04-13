// backend/src/controllers/botController.js
import Bot from "../models/BotModel.js";
import BotTrade from "../models/BotTradeModel.js";
import BotSubscription from "../models/BotSubscriptionModel.js";
import BotCopiedTrade from "../models/BotCopiedTradeModel.js";
import User from "../models/UserModel.js";
import Transaction from "../models/TransactionModel.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";
import { sendNotification } from "../utils/notificationHelper.js";
import { sendAdminNotification } from "../utils/adminNotificationHelper.js";

//  USER 

export const getAllBots = async (req, res) => {
  try {
    const bots = await Bot.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    // Check which bots user is subscribed to
    const botIds = bots.map((b) => b._id);
    const subscriptions = await BotSubscription.find({
      user: req.user._id,
      bot: { $in: botIds },
      status: "active",
    })
      .select("bot allocationAmount totalProfit totalInvested")
      .lean();

    const subMap = {};
    subscriptions.forEach((s) => {
      subMap[s.bot.toString()] = s;
    });

    const botsWithStatus = bots.map((bot) => ({
      ...bot,
      isSubscribed: !!subMap[bot._id.toString()],
      mySubscription: subMap[bot._id.toString()] || null,
    }));

    return successResponse(res, 200, "Bots fetched", { bots: botsWithStatus });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getBotStats = async (req, res) => {
  try {
    const subscriptions = await BotSubscription.find({
      user: req.user._id,
      status: "active",
    }).lean();

    const totalInvested = subscriptions.reduce(
      (s, sub) => s + (sub.totalInvested || 0),
      0,
    );
    const totalProfit = subscriptions.reduce(
      (s, sub) => s + (sub.totalProfit || 0),
      0,
    );

    const [totalTrades, winningTrades] = await Promise.all([
      BotCopiedTrade.countDocuments({ user: req.user._id }),
      BotCopiedTrade.countDocuments({ user: req.user._id, profit: { $gt: 0 } }),
    ]);

    return successResponse(res, 200, "Bot stats fetched", {
      totalInvested,
      totalProfit,
      activeBots: subscriptions.length,
      winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
      totalTrades,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const subscribeBot = async (req, res) => {
  try {
    const { botId, allocationAmount } = req.body;

    const bot = await Bot.findById(botId).lean();
    if (!bot) return errorResponse(res, 404, "Bot not found");
    if (!bot.isActive) return errorResponse(res, 400, "Bot is not active");

    if (allocationAmount < bot.minDeposit) {
      return errorResponse(res, 400, `Minimum allocation is $${bot.minDeposit}`);
    }

    const existing = await BotSubscription.findOne({
      user: req.user._id, bot: botId, status: "active",
    });
    if (existing) return errorResponse(res, 400, "Already subscribed to this bot");

    const user = await User.findById(req.user._id).select("wallet");
    const usdtBalance = user.wallet?.balances?.USDT ?? 0;
    const totalCost   = bot.monthlyFee + allocationAmount;

    if (usdtBalance < totalCost) {
      return errorResponse(res, 400,
        `Insufficient balance. Need $${totalCost} (allocation + $${bot.monthlyFee} fee)`
      );
    }

    const subscription = await BotSubscription.create({
      user:                req.user._id,
      bot:                 botId,
      allocationAmount,
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    //  Respond immediately
    successResponse(res, 201, "Successfully subscribed to bot", { subscription });

    //  Fire and forget all writes
    if (bot.monthlyFee > 0) {
      User.findByIdAndUpdate(req.user._id, {
        $inc: { "wallet.balances.USDT": -bot.monthlyFee }
      }).catch(err => console.error("[subscribeBot] fee deduct:", err.message));

      Transaction.create({
        user:        req.user._id,
        type:        "fee",
        status:      "completed",
        amount:      bot.monthlyFee,
        currency:    "USDT",
        note:        `Monthly fee for AI Bot: ${bot.name}`,
        processedAt: new Date(),
      }).catch(err => console.error("[subscribeBot] fee txn:", err.message));
    }

    Bot.findByIdAndUpdate(botId, { $inc: { "stats.totalSubscribers": 1 } })
      .catch(err => console.error("[subscribeBot] stats update:", err.message));

    sendNotification(
      req.user._id, "system", "Bot Activated",
      `You've subscribed to ${bot.name}. The bot will start copying trades to your account automatically.`,
      { botId, botName: bot.name, allocationAmount },
      "/bots"
    ).catch(() => {});

  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const unsubscribeBot = async (req, res) => {
  try {
    const { botId } = req.params;

    const subscription = await BotSubscription.findOne({
      user: req.user._id, bot: botId, status: "active",
    });
    if (!subscription) return errorResponse(res, 404, "Not subscribed to this bot");

    subscription.status = "cancelled";
    await subscription.save();

    //  Respond immediately
    successResponse(res, 200, "Unsubscribed from bot");

    // Fire and forget
    Bot.findByIdAndUpdate(botId, { $inc: { "stats.totalSubscribers": -1 } })
      .catch(err => console.error("[unsubscribeBot] stats:", err.message));

    sendNotification(
      req.user._id, "system", "Bot Deactivated",
      "You've unsubscribed from the bot. No new trades will be copied.",
      { botId },
      "/bots"
    ).catch(() => {});

  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getMyBotTrades = async (req, res) => {
  try {
    const trades = await BotCopiedTrade.find({ user: req.user._id })
      .populate("bot", "name strategy")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return successResponse(res, 200, "Bot trades fetched", { trades });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ADMIN 

export const adminGetAllBots = async (req, res) => {
  try {
    const bots = await Bot.find().sort({ createdAt: -1 }).lean();
    return successResponse(res, 200, "All bots fetched", { bots });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const adminCreateBot = async (req, res) => {
  try {
    const {
      name,
      description,
      strategy,
      riskLevel,
      minDeposit,
      monthlyFee,
      isActive,
      stats,
      features,
    } = req.body;

    const bot = await Bot.create({
      name,
      description,
      strategy,
      riskLevel,
      minDeposit: minDeposit || 100,
      monthlyFee: monthlyFee || 0,
      isActive: isActive !== undefined ? isActive : true,
      stats: stats || {},
      features: features || [],
    });

    return successResponse(res, 201, "Bot created", { bot });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const adminUpdateBot = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      strategy,
      riskLevel,
      minDeposit,
      monthlyFee,
      isActive,
      stats,
      features,
    } = req.body;

    const bot = await Bot.findById(id);
    if (!bot) return errorResponse(res, 404, "Bot not found");

    if (name !== undefined) bot.name = name;
    if (description !== undefined) bot.description = description;
    if (strategy !== undefined) bot.strategy = strategy;
    if (riskLevel !== undefined) bot.riskLevel = riskLevel;
    if (minDeposit !== undefined) bot.minDeposit = minDeposit;
    if (monthlyFee !== undefined) bot.monthlyFee = monthlyFee;
    if (isActive !== undefined) bot.isActive = isActive;
    if (features !== undefined) bot.features = features;
    if (stats) Object.assign(bot.stats, stats);

    await bot.save();
    return successResponse(res, 200, "Bot updated", { bot });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const adminDeleteBot = async (req, res) => {
  try {
    const { id } = req.params;
    const [bot, activeSubs] = await Promise.all([
      Bot.findById(id),
      BotSubscription.countDocuments({ bot: id, status: "active" }),
    ]);

    if (!bot) return errorResponse(res, 404, "Bot not found");
    if (activeSubs > 0)
      return errorResponse(
        res,
        400,
        `Cannot delete bot with ${activeSubs} active subscribers`,
      );

    await bot.deleteOne();
    return successResponse(res, 200, "Bot deleted");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const adminOpenBotTrade = async (req, res) => {
  try {
    const { botId, symbol, side, entryPrice, quantity, note } = req.body;

    const bot = await Bot.findById(botId);
    if (!bot) return errorResponse(res, 404, "Bot not found");

    const botTrade = await BotTrade.create({
      bot: botId,
      symbol,
      side,
      entryPrice,
      quantity,
      note: note || "",
      openedAt: new Date(),
    });

    // Find all active subscribers
    const subscriptions = await BotSubscription.find({
      bot: botId,
      status: "active",
    }).lean();

    if (subscriptions.length === 0) {
      return successResponse(res, 200, "Trade opened. No active subscribers.", {
        botTrade,
      });
    }

    const userIds = subscriptions.map((s) => s.user);
    const users = await User.find({ _id: { $in: userIds } }).select("wallet");
    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u;
    });

    const copiedTrades = [];
    const walletUpdates = [];
    const transactions = [];
    const subUpdates = [];
    const notifications = [];

    for (const sub of subscriptions) {
      const user = userMap[sub.user.toString()];
      const amount = sub.allocationAmount;
      const usdtBalance = user?.wallet?.balances?.USDT ?? 0;

      if (!user || usdtBalance < amount || amount <= 0) continue;

      copiedTrades.push({
        botTrade: botTrade._id,
        subscription: sub._id,
        user: sub.user,
        bot: botId,
        amountInvested: amount,
        symbol,
        side,
        entryPrice,
        status: "open",
        entryAt: new Date(),
      });

      walletUpdates.push({ userId: sub.user, deduct: amount });
      subUpdates.push({ id: sub._id, amount });
      transactions.push({
        user: sub.user,
        type: "fee",
        status: "completed",
        amount,
        currency: "USDT",
        note: `Bot trade opened: ${side.toUpperCase()} ${symbol} @ $${entryPrice} (${bot.name})`,
        processedAt: new Date(),
      });
      notifications.push(
        sendNotification(
          sub.user,
          "trading",
          "Bot Trade Opened",
          `${bot.name} opened a ${side.toUpperCase()} trade on ${symbol} at $${entryPrice}. $${amount.toFixed(2)} allocated.`,
          { botId, symbol, side, entryPrice, amount },
          "/bots",
        ),
      );
    }

    await Promise.all([
      BotCopiedTrade.insertMany(copiedTrades),
      // Deduct from wallet.balances.USDT
      ...walletUpdates.map(({ userId, deduct }) =>
        User.findByIdAndUpdate(userId, {
          $inc: { "wallet.balances.USDT": -deduct },
        }),
      ),
      // ✅ Use create() so pre-save hook runs and reference is auto-generated
      ...transactions.map((txn) => Transaction.create(txn)),
      ...subUpdates.map(({ id, amount }) =>
        BotSubscription.findByIdAndUpdate(id, {
          $inc: { totalInvested: amount },
        }),
      ),
      ...notifications,
    ]);

    return successResponse(
      res,
      200,
      `Trade opened and mirrored to ${copiedTrades.length} subscribers`,
      {
        botTrade,
        mirroredTo: copiedTrades.length,
      },
    );
  } catch (err) {
    console.error("[adminOpenBotTrade]", err);
    return errorResponse(res, 500, err.message);
  }
};

export const adminCloseBotTrade = async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { exitPrice } = req.body;

    const botTrade = await BotTrade.findById(tradeId);
    if (!botTrade) return errorResponse(res, 404, "Trade not found");
    if (botTrade.status === "closed")
      return errorResponse(res, 400, "Trade already closed");

    const profitPercent =
      botTrade.side === "buy"
        ? ((exitPrice - botTrade.entryPrice) / botTrade.entryPrice) * 100
        : ((botTrade.entryPrice - exitPrice) / botTrade.entryPrice) * 100;

    botTrade.exitPrice = exitPrice;
    botTrade.status = "closed";
    botTrade.closedAt = new Date();
    botTrade.profitPercent = profitPercent;
    await botTrade.save();

    const copiedTrades = await BotCopiedTrade.find({
      botTrade: tradeId,
      status: "open",
    }).lean();

    if (copiedTrades.length === 0) {
      return successResponse(
        res,
        200,
        "Trade closed. No copied trades to settle.",
        { botTrade },
      );
    }

    const transactions = [];
    const notifications = [];
    const subUpdates = [];

    for (const ct of copiedTrades) {
      const invested = ct.amountInvested || 0;
      const profit = invested * (profitPercent / 100);

      transactions.push({
        user: ct.user,
        type: profit >= 0 ? "profit" : "loss",
        status: "completed",
        amount: Math.abs(profit),
        currency: "USDT",
        note: `Bot trade closed: ${botTrade.side.toUpperCase()} ${botTrade.symbol} @ $${exitPrice}. P&L: ${profit >= 0 ? "+" : ""}$${profit.toFixed(2)}`,
        processedAt: new Date(),
      });

      subUpdates.push({ subId: ct.subscription, tradeId: ct._id, profit });

      notifications.push(
        sendNotification(
          ct.user,
          "trading",
          profit >= 0 ? "Bot Trade Profit 🎉" : "Bot Trade Closed",
          `${botTrade.symbol} trade closed at $${exitPrice}. You ${profit >= 0 ? "made" : "lost"} $${Math.abs(profit).toFixed(2)} (${profitPercent.toFixed(2)}%).`,
          { profit, profitPercent, symbol: botTrade.symbol },
          "/bots",
        ),
      );
    }

    await Promise.all([
      // Close + set individual profits
      ...copiedTrades.map((ct) => {
        const profit = (ct.amountInvested || 0) * (profitPercent / 100);
        return BotCopiedTrade.findByIdAndUpdate(ct._id, {
          $set: {
            status: "closed",
            exitAt: new Date(),
            exitPrice,
            profit,
            profitPercent,
          },
        });
      }),
      // Credit wallet.balances.USD with returned amount (invested + profit)
      ...copiedTrades.map((ct) => {
        const returned = (ct.amountInvested || 0) * (1 + profitPercent / 100);
        return User.findByIdAndUpdate(ct.user, {
          $inc: { "wallet.balances.USDT": returned },
        });
      }),
      // ✅ Use create() so pre-save hook runs and reference is auto-generated
      ...transactions.map((txn) => Transaction.create(txn)),
      // Update subscription totals
      ...subUpdates.map(({ subId, tradeId, profit }) =>
        BotSubscription.findByIdAndUpdate(subId, {
          $inc: { totalProfit: profit },
          $push: { profitHistory: { date: new Date(), profit, tradeId } },
        }),
      ),
      // Update bot stats
      Bot.findByIdAndUpdate(botTrade.bot, {
        $inc: {
          "stats.totalTrades": 1,
          "stats.winningTrades": profitPercent > 0 ? 1 : 0,
        },
        $push: {
          recentTrades: {
            $each: [
              {
                symbol: botTrade.symbol,
                side: botTrade.side,
                entryPrice: botTrade.entryPrice,
                exitPrice,
                profitPercent,
                closedAt: new Date(),
              },
            ],
            $slice: -10,
          },
        },
      }),
      ...notifications,
    ]);

    return successResponse(
      res,
      200,
      `Trade closed. Settled ${copiedTrades.length} positions.`,
      {
        botTrade,
        settled: copiedTrades.length,
        profitPercent: profitPercent.toFixed(2),
      },
    );
  } catch (err) {
    console.error("[adminCloseBotTrade]", err);
    return errorResponse(res, 500, err.message);
  }
};

export const adminGetBotTrades = async (req, res) => {
  try {
    const trades = await BotTrade.find({ bot: req.params.botId })
      .sort({ createdAt: -1 })
      .lean();
    return successResponse(res, 200, "Bot trades fetched", { trades });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};