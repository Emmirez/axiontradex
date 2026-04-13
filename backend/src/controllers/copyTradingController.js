// backend/src/controllers/copyTradingController.js
import CopyTrader from "../models/CopyTraderModel.js";
import CopyTrade from "../models/CopyTradeModel.js";
import CopiedTrade from "../models/CopiedTradeModel.js";
import User from "../models/UserModel.js";
import Transaction from "../models/TransactionModel.js";
import TraderTrade from "../models/TraderTradeModel.js";
import { sendNotification } from "../utils/notificationHelper.js";
import { sendAdminNotification } from "../utils/adminNotificationHelper.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

//  USER CONTROLLERS

export const getTopTraders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "totalFollowers";

    const sortOptions = {
      winRate: { "stats.winRate": -1 },
      totalFollowers: { "stats.totalFollowers": -1 },
      monthlyProfit: { "stats.monthlyProfit": -1 },
      totalReturn: { "stats.totalReturn": -1 },
    };

    const userId = req.user._id;

    const [traders, total] = await Promise.all([
      CopyTrader.find({ isActive: true })
        .populate("user", "firstName lastName email")
        .sort(sortOptions[sortBy] || { "stats.totalFollowers": -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CopyTrader.countDocuments({ isActive: true }),
    ]);

    const traderIds = traders.map((t) => t._id);
    const activeFollows = await CopyTrade.find({
      follower: userId,
      trader: { $in: traderIds },
      status: "active",
    })
      .select("trader")
      .lean();

    const followingSet = new Set(activeFollows.map((f) => f.trader.toString()));

    const tradersWithFollowStatus = traders.map((trader) => ({
      ...trader,
      isFollowing: followingSet.has(trader._id.toString()),
      // Sort recentTrades newest-first so [0] is always the latest closed trade
      recentTrades: [...(trader.recentTrades || [])].sort(
        (a, b) => new Date(b.closedAt) - new Date(a.closedAt),
      ),
    }));

    return successResponse(res, 200, "Top traders fetched", {
      traders: tradersWithFollowStatus,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getTraderDetails = async (req, res) => {
  try {
    const trader = await CopyTrader.findOne({
      _id: req.params.id,
      isActive: true,
    })
      .populate("user", "firstName lastName email")
      .lean();

    if (!trader) return errorResponse(res, 404, "Trader not found");

    const [isFollowing, followerCount, recentCopiedTrades] = await Promise.all([
      CopyTrade.findOne({
        follower: req.user._id,
        trader: trader._id,
        status: "active",
      }).lean(),
      CopyTrade.countDocuments({ trader: trader._id, status: "active" }),
      CopiedTrade.find({ trader: trader._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("follower", "firstName lastName")
        .lean(),
    ]);

    // Sort recentTrades newest-first so [0] is always the latest closed trade
    const sortedRecentTrades = [...(trader.recentTrades || [])].sort(
      (a, b) => new Date(b.closedAt) - new Date(a.closedAt),
    );

    return successResponse(res, 200, "Trader details fetched", {
      trader: {
        ...trader,
        recentTrades: sortedRecentTrades,
        followerCount,
        isFollowing: !!isFollowing,
      },
      recentCopiedTrades,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

//  FOLLOW / UNFOLLOW
export const followTrader = async (req, res) => {
  try {
    const {
      traderId, allocationType, allocationAmount, allocationPercentage,
      maxAllocation, autoMirror, maxPositionSize, stopLoss,
    } = req.body;

    const trader = await CopyTrader.findById(traderId).lean();
    if (!trader) return errorResponse(res, 404, "Trader not found");

    const existingActiveFollow = await CopyTrade.findOne({
      follower: req.user._id, trader: traderId, status: "active",
    }).lean();
    if (existingActiveFollow) return errorResponse(res, 400, "You are already following this trader");

    // Check balance for subscription fee
    if (trader.subscriptionFee > 0) {
      const user = await User.findById(req.user._id).select("wallet");
      if ((user.wallet?.balances?.USDT ?? 0) < trader.subscriptionFee) {
        return errorResponse(res, 400, `Insufficient balance for subscription fee of $${trader.subscriptionFee}`);
      }
    }

    const previousFollow = await CopyTrade.findOne({
      follower: req.user._id, trader: traderId, status: "cancelled",
    }).sort({ updatedAt: -1 }).lean();

    const copyTrade = await CopyTrade.create({
      follower:            req.user._id,
      trader:              traderId,
      allocationType,
      allocationAmount:    allocationType === "fixed" ? allocationAmount : 0,
      allocationPercentage: allocationType === "percentage" ? allocationPercentage : 0,
      maxAllocation:       maxAllocation || 0,
      autoMirror:          autoMirror !== undefined ? autoMirror : true,
      maxPositionSize:     maxPositionSize || 0,
      stopLoss:            stopLoss || 0,
      subscriptionActive:  true,
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      totalInvested:       previousFollow?.lastKnownInvested ?? 0,
      totalProfit:         previousFollow?.lastKnownProfit   ?? 0,
    });

    //  Respond immediately
    successResponse(res, 201, "Successfully followed trader", { copyTrade });

    // Fire and forget
    if (trader.subscriptionFee > 0) {
      User.findByIdAndUpdate(req.user._id, {
        $inc: { "wallet.balances.USDT": -trader.subscriptionFee }
      }).catch(err => console.error("[followTrader] fee deduct:", err.message));

      Transaction.create({
        user:        req.user._id,
        type:        "fee",
        status:      "completed",
        amount:      trader.subscriptionFee,
        currency:    "USDT",
        note:        `Copy trading subscription fee for ${trader.username}`,
        processedAt: new Date(),
      }).catch(err => console.error("[followTrader] fee txn:", err.message));
    }

    CopyTrader.findByIdAndUpdate(traderId, {
      $inc: { "stats.totalFollowers": 1 }
    }).catch(err => console.error("[followTrader] stats:", err.message));

    sendNotification(
      req.user._id, "system", "Trader Followed",
      `You are now following ${trader.username}. Their trades will be automatically copied to your account.`,
      { traderId, traderName: trader.username },
      "/copy-trading"
    ).catch(() => {});

  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const unfollowTrader = async (req, res) => {
  try {
    const { traderId } = req.params;

    const copyTrade = await CopyTrade.findOne({
      follower: req.user._id, trader: traderId, status: "active",
    });
    if (!copyTrade) return errorResponse(res, 404, "You are not following this trader");

    copyTrade.status           = "cancelled";
    copyTrade.lastKnownInvested = copyTrade.totalInvested;
    copyTrade.lastKnownProfit   = copyTrade.totalProfit;
    await copyTrade.save();

    // Respond immediately
    successResponse(res, 200, "Successfully unfollowed trader");

    //  Fire and forget
    CopyTrader.findByIdAndUpdate(traderId, {
      $inc: { "stats.totalFollowers": -1 }
    }).catch(err => console.error("[unfollowTrader] stats:", err.message));

    sendNotification(
      req.user._id, "system", "Trader Unfollowed",
      "You have stopped following the trader. No new trades will be copied.",
      { traderId },
      "/copy-trading"
    ).catch(() => {});

  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const updateAllocation = async (req, res) => {
  try {
    const { copyTradeId } = req.params;
    const {
      allocationType,
      allocationAmount,
      allocationPercentage,
      maxAllocation,
    } = req.body;

    const copyTrade = await CopyTrade.findOne({
      _id: copyTradeId,
      follower: req.user._id,
      status: "active",
    });
    if (!copyTrade)
      return errorResponse(res, 404, "Active copy trade not found");

    // Update whichever fields were provided
    if (allocationType !== undefined) copyTrade.allocationType = allocationType;
    if (allocationAmount !== undefined)
      copyTrade.allocationAmount = allocationAmount;
    if (allocationPercentage !== undefined)
      copyTrade.allocationPercentage = allocationPercentage;
    if (maxAllocation !== undefined) copyTrade.maxAllocation = maxAllocation;

    await copyTrade.save();

    return successResponse(res, 200, "Allocation updated successfully", {
      copyTrade,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getCopyTradeHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status; // "open" | "closed" | undefined (all)

    const filter = { follower: req.user._id };
    if (status) filter.status = status;

    const [trades, total] = await Promise.all([
      CopiedTrade.find(filter)
        .populate("trader", "username stats")
        .populate(
          "traderTrade",
          "symbol side entryPrice exitPrice profitPercent",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CopiedTrade.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Copy trade history fetched", {
      trades,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getMyFollowedTraders = async (req, res) => {
  try {
    const follows = await CopyTrade.find({
      follower: req.user._id,
      status: "active",
    })
      .populate({
        path: "trader",
        populate: { path: "user", select: "firstName lastName email" },
      })
      .lean();

    const followedTraders = follows.map((follow) => ({
      copyTrade: follow,
      trader: follow.trader,
    }));

    return successResponse(res, 200, "Followed traders fetched", {
      followedTraders,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getCopyStats = async (req, res) => {
  try {
    const follows = await CopyTrade.find({
      follower: req.user._id,
      status: "active",
    }).lean();

    const totalInvested = follows.reduce(
      (sum, f) => sum + (f.totalInvested || 0),
      0,
    );
    const totalProfit = follows.reduce(
      (sum, f) => sum + (f.totalProfit || 0),
      0,
    );

    const [totalCopiedTrades, winningCopiedTrades] = await Promise.all([
      CopiedTrade.countDocuments({ follower: req.user._id }),
      CopiedTrade.countDocuments({
        follower: req.user._id,
        profit: { $gt: 0 },
      }),
    ]);

    const winRate =
      totalCopiedTrades > 0
        ? (winningCopiedTrades / totalCopiedTrades) * 100
        : 0;

    return successResponse(res, 200, "Copy stats fetched", {
      totalInvested,
      totalProfit,
      totalCopiedTrades,
      winRate,
      activeFollows: follows.length,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const updateCopySettings = async (req, res) => {
  try {
    const { copyTradeId } = req.params;
    const { autoMirror, maxPositionSize, stopLoss } = req.body;

    const copyTrade = await CopyTrade.findOne({
      _id: copyTradeId,
      follower: req.user._id,
    });
    if (!copyTrade) return errorResponse(res, 404, "Copy trade not found");

    if (autoMirror !== undefined) copyTrade.autoMirror = autoMirror;
    if (maxPositionSize !== undefined)
      copyTrade.maxPositionSize = maxPositionSize;
    if (stopLoss !== undefined) copyTrade.stopLoss = stopLoss;

    await copyTrade.save();
    return successResponse(res, 200, "Copy settings updated", { copyTrade });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

//  ADMIN CONTROLLERS

export const getAllTraders = async (req, res) => {
  try {
    const traders = await CopyTrader.find()
      .populate("user", "firstName lastName email")
      .sort({ "stats.totalFollowers": -1 })
      .lean();
    return successResponse(res, 200, "All traders fetched", { traders });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const manageTrader = async (req, res) => {
  try {
    const {
      userId,
      username,
      bio,
      subscriptionFee,
      isActive,
      isVerified,
      stats,
    } = req.body;

    const user = await User.findById(userId).lean();
    if (!user) return errorResponse(res, 404, "User not found");

    let trader = await CopyTrader.findOne({ user: userId });
    const isNew = !trader;

    if (trader) {
      if (username !== undefined) trader.username = username;
      if (bio !== undefined) trader.bio = bio;
      if (subscriptionFee !== undefined)
        trader.subscriptionFee = subscriptionFee;
      if (isActive !== undefined) trader.isActive = isActive;
      if (isVerified !== undefined) trader.isVerified = isVerified;
      if (stats) Object.assign(trader.stats, stats);
      await trader.save();
    } else {
      trader = await CopyTrader.create({
        user: userId,
        username: username || `${user.firstName} ${user.lastName}`,
        bio: bio || "",
        subscriptionFee: subscriptionFee || 0,
        isActive: isActive !== undefined ? isActive : true,
        isVerified: isVerified || false,
        stats: stats || {},
      });
    }

    await sendAdminNotification(
      "user",
      isNew ? "New Trader Created" : "Trader Updated",
      `${user.firstName} ${user.lastName} ${isNew ? "became a trader" : "trader profile was updated"}`,
      { userId, traderId: trader._id },
      "/admin/copy-trading",
      trader._id,
      "CopyTrader",
    );

    return successResponse(
      res,
      200,
      `Trader ${isNew ? "created" : "updated"}`,
      { trader },
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const updateTrader = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, bio, subscriptionFee, isActive, isVerified, stats } =
      req.body;

    const trader = await CopyTrader.findById(id);
    if (!trader) return errorResponse(res, 404, "Trader not found");

    if (username !== undefined) trader.username = username;
    if (bio !== undefined) trader.bio = bio;
    if (subscriptionFee !== undefined) trader.subscriptionFee = subscriptionFee;
    if (isActive !== undefined) trader.isActive = isActive;
    if (isVerified !== undefined) trader.isVerified = isVerified;
    if (stats) Object.assign(trader.stats, stats);

    await trader.save();

    await sendAdminNotification(
      "user",
      "Trader Updated",
      `${trader.username}'s profile was updated`,
      { traderId: trader._id },
      "/admin/copy-trading",
      trader._id,
      "CopyTrader",
    );

    return successResponse(res, 200, "Trader updated successfully", { trader });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const deleteTrader = async (req, res) => {
  try {
    const { id } = req.params;

    const [trader, activeFollows] = await Promise.all([
      CopyTrader.findById(id),
      CopyTrade.countDocuments({ trader: id, status: "active" }),
    ]);

    if (!trader) return errorResponse(res, 404, "Trader not found");

    if (activeFollows > 0) {
      return errorResponse(
        res,
        400,
        `Cannot delete trader with ${activeFollows} active followers. Deactivate the trader first.`,
      );
    }

    await Promise.all([
      trader.deleteOne(),
      sendAdminNotification(
        "user",
        "Trader Deleted",
        `${trader.username} was removed as a trader`,
        { traderId: trader._id },
        "/admin/copy-trading",
      ),
    ]);

    return successResponse(res, 200, "Trader deleted successfully");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

//  TRADE MIRRORING

// Admin: Open a trade — mirrors investment to all active followers
export const openTraderTrade = async (req, res) => {
  try {
    const { traderId, symbol, side, entryPrice, quantity, note } = req.body;

    const trader = await CopyTrader.findById(traderId);
    if (!trader) return errorResponse(res, 404, "Trader not found");

    const traderTrade = await TraderTrade.create({
      trader: traderId,
      symbol,
      side,
      entryPrice,
      quantity,
      note: note || "",
      openedAt: new Date(),
    });

    const followers = await CopyTrade.find({
      trader: traderId,
      status: "active",
      autoMirror: true,
    }).lean();

    if (followers.length === 0) {
      return successResponse(
        res,
        200,
        "Trade opened. No active followers to mirror to.",
        { traderTrade },
      );
    }

    const followerIds = followers.map((f) => f.follower);
    const users = await User.find({ _id: { $in: followerIds } }).select(
      "wallet firstName lastName",
    );
    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u;
    });

    const copiedTrades = [];
    const walletUpdates = [];
    const notifications = [];
    const transactionDocs = [];
    const copyTradeIncrements = [];

    for (const follow of followers) {
      const user = userMap[follow.follower.toString()];
      if (!user) continue;

      // Calculate allocation
      let amount = 0;
      if (follow.allocationType === "fixed") {
        amount = follow.allocationAmount;
      } else {
        amount =
          ((user.wallet.balances?.USDT ?? 0) * follow.allocationPercentage) /
          100;
      }
      if (follow.maxAllocation > 0 && amount > follow.maxAllocation) {
        amount = follow.maxAllocation;
      }

      const availableBalance = user.wallet.balances?.USDT ?? 0;
      if (availableBalance < amount || amount <= 0) continue;

      const followerQuantity = amount / entryPrice;

      copiedTrades.push({
        copyTrade: follow._id,
        follower: follow.follower,
        trader: traderId,
        traderTrade: traderTrade._id,
        originalTrade: { symbol, side, entryPrice, quantity },
        copiedTrade: { symbol, side, entryPrice, quantity: followerQuantity },
        status: "open",
        entryAt: new Date(),
        amountInvested: amount,
      });

      walletUpdates.push({ userId: follow.follower, deduct: amount });

      transactionDocs.push({
        user: follow.follower,
        type: "trade",
        status: "completed",
        amount,
        currency: "USDT",
        note: `Copy trade opened: ${side.toUpperCase()} ${symbol} @ $${entryPrice} — $${amount.toFixed(2)} invested (following ${trader.username})`,
        processedAt: new Date(),
        reference: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      });

      copyTradeIncrements.push({ id: follow._id, amount });

      notifications.push(
        sendNotification(
          follow.follower,
          "trading",
          "Trade Copied",
          `${trader.username} opened a ${side.toUpperCase()} on ${symbol} @ $${entryPrice}. $${amount.toFixed(2)} allocated.`,
          { traderId, symbol, side, entryPrice, amount },
          "/copy-trading",
        ),
      );
    }

    await Promise.all([
      CopiedTrade.insertMany(copiedTrades),
      ...walletUpdates.map(({ userId, deduct }) =>
        User.findByIdAndUpdate(userId, {
          $inc: { "wallet.balances.USDT": -deduct },
        }),
      ),
      Transaction.insertMany(transactionDocs),
      ...copyTradeIncrements.map(({ id, amount }) =>
        CopyTrade.findByIdAndUpdate(id, { $inc: { totalInvested: amount } }),
      ),
      ...notifications,
    ]);

    return successResponse(
      res,
      200,
      `Trade opened and mirrored to ${copiedTrades.length} followers`,
      {
        traderTrade,
        mirroredTo: copiedTrades.length,
      },
    );
  } catch (err) {
    console.error("[openTraderTrade]", err);
    return errorResponse(res, 500, err.message);
  }
};

// Admin: Close a trade — distributes P&L to all follower wallets + records history
export const closeTraderTrade = async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { exitPrice } = req.body;

    const traderTrade = await TraderTrade.findById(tradeId);
    if (!traderTrade) return errorResponse(res, 404, "Trade not found");
    if (traderTrade.status === "closed")
      return errorResponse(res, 400, "Trade already closed");

    const profitPercent =
      traderTrade.side === "buy"
        ? ((exitPrice - traderTrade.entryPrice) / traderTrade.entryPrice) * 100
        : ((traderTrade.entryPrice - exitPrice) / traderTrade.entryPrice) * 100;

    traderTrade.exitPrice = exitPrice;
    traderTrade.status = "closed";
    traderTrade.closedAt = new Date();
    traderTrade.profitPercent = profitPercent;
    await traderTrade.save();

    const openCopiedTrades = await CopiedTrade.find({
      traderTrade: tradeId,
      status: "open",
    }).lean();

    if (openCopiedTrades.length === 0) {
      return successResponse(
        res,
        200,
        "Trade closed. No copied trades to settle.",
        { traderTrade },
      );
    }

    const walletUpdates = [];
    const notifications = [];
    const transactionDocs = [];
    const copyTradeUpdates = [];
    const copiedTradeUpdates = [];

    for (const ct of openCopiedTrades) {
      const invested = ct.amountInvested || 0;
      const profit = invested * (profitPercent / 100);
      const returned = invested + profit; // less than invested on a loss

      walletUpdates.push({ userId: ct.follower, credit: returned });

      transactionDocs.push({
        user: ct.follower,
        type: profit >= 0 ? "profit" : "loss",
        status: "completed",
        amount: Math.abs(profit),
        currency: "USDT",
        note: `Copy trade closed: ${traderTrade.side.toUpperCase()} ${traderTrade.symbol} @ $${exitPrice} | P&L: ${profit >= 0 ? "+" : ""}$${profit.toFixed(2)} (${profitPercent.toFixed(2)}%)`,
        processedAt: new Date(),
        reference: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      });

      copiedTradeUpdates.push({ id: ct._id, profit, profitPercent });

      copyTradeUpdates.push({ id: ct.copyTrade, profit, tradeId: ct._id });

      notifications.push(
        sendNotification(
          ct.follower,
          "trading",
          profit >= 0 ? "Trade Profit 🎉" : "Trade Closed",
          `${traderTrade.symbol} ${traderTrade.side.toUpperCase()} closed @ $${exitPrice}. You ${profit >= 0 ? "earned" : "lost"} $${Math.abs(profit).toFixed(2)} (${profitPercent.toFixed(2)}%).`,
          { profit, profitPercent, symbol: traderTrade.symbol },
          "/copy-trading",
        ),
      );
    }

    await Promise.all([
      // 1. Close each copied trade + set profit
      ...copiedTradeUpdates.map(({ id, profit, profitPercent }) =>
        CopiedTrade.findByIdAndUpdate(id, {
          $set: { status: "closed", exitAt: new Date(), profit, profitPercent },
        }),
      ),

      // 2. Credit wallets — returned = principal + profit (or principal - loss)
      ...walletUpdates.map(({ userId, credit }) =>
        User.findByIdAndUpdate(userId, {
          $inc: { "wallet.balances.USDT": credit },
        }),
      ),

      // 3. Insert profit/loss transactions
      Transaction.insertMany(transactionDocs),

      // 4. Update CopyTrade totalProfit + profitHistory
      ...copyTradeUpdates.map(({ id, profit, tradeId }) =>
        CopyTrade.findByIdAndUpdate(id, {
          $inc: { totalProfit: profit },
          $push: { profitHistory: { date: new Date(), profit, tradeId } },
        }),
      ),

      // 5. Update trader stats + recentTrades
      CopyTrader.findByIdAndUpdate(traderTrade.trader, {
        $inc: {
          "stats.totalTrades": 1,
          "stats.winningTrades": profitPercent > 0 ? 1 : 0,
        },
        $push: {
          recentTrades: {
            $each: [
              {
                symbol: traderTrade.symbol,
                side: traderTrade.side,
                entryPrice: traderTrade.entryPrice,
                exitPrice,
                profit: profitPercent,
                profitPercent,
                closedAt: new Date(),
              },
            ],
            $position: 0,
            $slice: 10,
          },
        },
      }),

      ...notifications,
    ]);

    // 6. Recalculate winRate after stats increment
    const updatedTrader = await CopyTrader.findById(traderTrade.trader);
    const { totalTrades, winningTrades } = updatedTrader.stats;
    await CopyTrader.findByIdAndUpdate(traderTrade.trader, {
      $set: {
        "stats.winRate":
          totalTrades > 0
            ? parseFloat(((winningTrades / totalTrades) * 100).toFixed(1))
            : 0,
      },
    });

    return successResponse(
      res,
      200,
      `Trade closed. Settled ${openCopiedTrades.length} follower positions.`,
      {
        traderTrade,
        settled: openCopiedTrades.length,
        profitPercent: profitPercent.toFixed(2),
      },
    );
  } catch (err) {
    console.error("[closeTraderTrade]", err);
    return errorResponse(res, 500, err.message);
  }
};

export const getTraderTrades = async (req, res) => {
  try {
    const { traderId } = req.params;
    const trades = await TraderTrade.find({ trader: traderId })
      .sort({ createdAt: -1 })
      .lean();
    return successResponse(res, 200, "Trader trades fetched", { trades });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};
