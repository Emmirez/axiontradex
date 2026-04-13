import Trade from "../models/TradeModel.js";
import CopiedTrade from "../models/CopiedTradeModel.js";
import BotCopiedTrade from "../models/BotCopiedTradeModel.js";
import Transaction from "../models/TransactionModel.js";
import User from "../models/UserModel.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../utils/responseUtils.js";
import { sendNotification } from "../utils/notificationHelper.js";
import { sendAdminNotification } from "../utils/adminNotificationHelper.js";
import SignalSubscription from "../models/SignalSubscriptionModel.js";

const genRef = () =>
  `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

// Leverage helpers (Binance-style isolated margin)
const MAINTENANCE_MARGIN_RATE = 0.005; // 0.5% — same as Binance for most assets
const FEE_RATE = 0.001; // 0.10% taker fee

function calcLiquidationPrice(side, entryPrice, leverage) {
  const mmr = MAINTENANCE_MARGIN_RATE;
  if (side === "buy")
    return parseFloat((entryPrice * (1 - 1 / leverage + mmr)).toFixed(8));
  else return parseFloat((entryPrice * (1 + 1 / leverage - mmr)).toFixed(8));
}

//  placeTrade
export const placeTrade = async (req, res) => {
  try {
    const {
      symbol,
      side,
      type,
      quantity,
      price,
      stopLoss,
      takeProfit,
      assetClass,
      signalId,
      leverage = 1,
    } = req.body;

    //  Validate leverage
    const lev = Math.max(1, Math.min(100, parseInt(leverage) || 1));

    const user = await User.findById(req.user._id).select(
      "wallet firstName lastName",
    );

    const marketPrice = price || Math.random() * 90000 + 1000; // fallback for dev
    const notional = parseFloat((quantity * marketPrice).toFixed(8));
    const margin = parseFloat((notional / lev).toFixed(8));
    const openFee = parseFloat((notional * FEE_RATE).toFixed(8));
    const cost = parseFloat((margin + openFee).toFixed(8));

    const usdtBalance = user.wallet?.balances?.USDT ?? 0;
    if (usdtBalance < cost) {
      return errorResponse(
        res,
        400,
        `Insufficient balance. Required: $${cost.toFixed(2)} (margin $${margin.toFixed(2)} + fee $${openFee.toFixed(2)}), Available: $${usdtBalance.toFixed(2)}`,
      );
    }

    //  Basic validation
    if (!symbol || !side || !quantity || quantity <= 0) {
      return errorResponse(res, 400, "Invalid trade parameters");
    }

    //  Leverage restrictions by asset class 
    const MAX_LEVERAGE = {
      crypto: 100,
      stock: 10,
      forex: 30,
      commodity: 20,
      gold: 20,
    };
    const maxLev = MAX_LEVERAGE[assetClass] || 10;
    if (lev > maxLev) {
      return errorResponse(
        res,
        400,
        `Max leverage for ${assetClass} is ${maxLev}×`,
      );
    }

    //  Position size protection (prevent account wipe) 
    if (margin > usdtBalance * 0.9) {
      return errorResponse(
        res,
        400,
        `Position too large. Max margin is 90% of balance ($${(usdtBalance * 0.9).toFixed(2)})`,
      );
    }

    //  Minimum trade size 
    if (notional < 1) {
      return errorResponse(res, 400, "Minimum trade size is $1");
    }

    //  Liquidation price
    const liqPrice =
      lev > 1 ? calcLiquidationPrice(side, marketPrice, lev) : null;

    const trade = await Trade.create({
      user: req.user._id,
      symbol,
      side,
      type,
      quantity,
      price: type === "limit" ? price : null,
      filledPrice: type === "market" ? marketPrice : null,
      filledAt: type === "market" ? new Date() : null,
      status: type === "market" ? "filled" : "pending",
      stopLoss,
      takeProfit,
      fee: openFee,
      feeCurrency: "USDT",
      total: notional, // full position notional
      margin, // capital deposited
      leverage: lev,
      liquidationPrice: liqPrice,
      assetClass: assetClass || "crypto",
      signalId: signalId || null,
    });

    //  Respond immediately
    successResponse(res, 201, "Trade placed successfully", {
      trade,
      summary: {
        notional: `$${notional.toFixed(2)}`,
        margin: `$${margin.toFixed(2)}`,
        fee: `$${openFee.toFixed(2)}`,
        cost: `$${cost.toFixed(2)}`,
        leverage: `${lev}x`,
        liquidationPrice: liqPrice ? `$${liqPrice.toFixed(2)}` : "N/A",
      },
    });

    //  Fire and forget — deduct margin + fee, lock margin
    User.findByIdAndUpdate(req.user._id, {
      $inc: {
        "wallet.balances.USDT": -cost,
        "wallet.locked": margin,
      },
    }).catch((err) => console.error("[placeTrade] wallet:", err.message));

    if (type === "market") {
      Transaction.create({
        user: req.user._id,
        type: "fee",
        status: "completed",
        amount: openFee,
        currency: "USDT",
        reference: genRef(),
        note: `Open fee ${side.toUpperCase()} ${lev}x ${symbol} — notional $${notional.toFixed(2)}`,
        processedAt: new Date(),
      }).catch(() => {});
    }

    sendNotification(
      req.user._id,
      "trade",
      `Trade Placed: ${symbol}`,
      `${lev > 1 ? `${lev}x ` : ""}${side.toUpperCase()} ${quantity} ${symbol} @ $${marketPrice.toFixed(2)} | Margin: $${margin.toFixed(2)}${liqPrice ? ` | Liq: $${liqPrice.toFixed(2)}` : ""}`,
      {
        tradeId: trade._id,
        symbol,
        side,
        quantity,
        leverage: lev,
        margin,
        liquidationPrice: liqPrice,
      },
      "/trades",
    ).catch(() => {});

    if (notional > 10000) {
      sendAdminNotification(
        "trade",
        "Large Trade Executed",
        `${user.firstName} ${user.lastName} placed ${lev}x ${side.toUpperCase()} on ${symbol} — notional $${notional.toFixed(2)}, margin $${margin.toFixed(2)}`,
        {
          userId: req.user._id,
          symbol,
          side,
          quantity,
          notional,
          leverage: lev,
          tradeId: trade._id,
        },
        "/admin/trades",
      ).catch(() => {});
    }

    if (signalId) {
      SignalSubscription.findOneAndUpdate(
        { user: req.user._id, isActive: true, endDate: { $gt: new Date() } },
        { $inc: { signalsReceived: 1 } },
      ).catch((err) =>
        console.error("[placeTrade] signal tracking:", err.message),
      );
    }
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// closeTrade
export const closeTrade = async (req, res) => {
  try {
    const { closePrice } = req.body;
    if (!closePrice || closePrice <= 0)
      return errorResponse(res, 400, "Valid close price is required");

    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "filled",
    });
    if (!trade) return errorResponse(res, 404, "Open trade not found");

    const ep = trade.filledPrice;
    const closeVal = parseFloat((trade.quantity * closePrice).toFixed(8));
    const closeFee = parseFloat((closeVal * FEE_RATE).toFixed(8));
    const grossPnl =
      trade.side === "buy"
        ? (closePrice - ep) * trade.quantity
        : (ep - closePrice) * trade.quantity;
    const pnl = parseFloat((grossPnl - closeFee).toFixed(8));

    // ROE% — based on margin (leveraged return), not notional
    const margin = trade.margin || trade.total; // fallback for old trades without margin
    const pnlPct = parseFloat(((pnl / margin) * 100).toFixed(2));

    // Refund = margin + leveraged P&L
    const refund = parseFloat((margin + pnl).toFixed(8));

    //  Save trade
    trade.status = "closed";
    trade.pnl = pnl;
    trade.notes = `Closed @ $${closePrice} | P&L: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)} (ROE ${pnlPct >= 0 ? "+" : ""}${pnlPct}%) | ${trade.leverage}x leverage`;
    await trade.save();

    //  Respond immediately
    successResponse(res, 200, "Trade closed successfully", {
      trade,
      pnl,
      pnlPct,
      closePrice: parseFloat(closePrice),
      refunded: refund,
      leverage: trade.leverage,
      margin,
    });

    //  Fire and forget — credit refund, release locked margin
    User.findByIdAndUpdate(req.user._id, {
      $inc: {
        "wallet.balances.USDT": refund, // return margin ± pnl
        "wallet.locked": -margin, // release only what was locked (margin)
      },
    }).catch((err) => console.error("[closeTrade] wallet:", err.message));

    const txns = [];
    if (grossPnl !== 0) {
      txns.push({
        user: req.user._id,
        type: grossPnl > 0 ? "profit" : "loss",
        status: "completed",
        amount: Math.abs(grossPnl),
        currency: "USDT",
        reference: genRef(),
        note: `${grossPnl > 0 ? "PROFIT" : "LOSS"} from ${trade.symbol} ${trade.leverage}x ${trade.side.toUpperCase()} — ${grossPnl >= 0 ? "+" : ""}$${grossPnl.toFixed(2)}`,
        processedAt: new Date(),
      });
    }
    txns.push({
      user: req.user._id,
      type: "fee",
      status: "completed",
      amount: closeFee,
      currency: "USDT",
      reference: genRef(),
      note: `Close fee ${trade.symbol} ${trade.leverage}x`,
      processedAt: new Date(),
    });
    Promise.all(txns.map((t) => Transaction.create(t))).catch((err) =>
      console.error("[closeTrade] txn:", err.message),
    );

    const pnlText =
      pnl >= 0
        ? `profit of $${pnl.toFixed(2)} (+${pnlPct}% ROE)`
        : `loss of $${Math.abs(pnl).toFixed(2)} (${pnlPct}% ROE)`;

    sendNotification(
      req.user._id,
      "trade",
      pnl >= 0 ? "Trade Closed - Profit 🎉" : "Trade Closed - Loss",
      `Your ${trade.leverage}x ${trade.symbol} ${trade.side.toUpperCase()} closed with ${pnlText}.`,
      {
        tradeId: trade._id,
        symbol: trade.symbol,
        side: trade.side,
        pnl,
        pnlPercent: pnlPct,
        exitPrice: closePrice,
        leverage: trade.leverage,
      },
      "/trades",
    ).catch(() => {});

    if (trade.signalId) {
      SignalSubscription.findOneAndUpdate(
        { user: req.user._id, isActive: true, endDate: { $gt: new Date() } },
        { $inc: { signalsExecuted: 1, totalProfit: pnl } },
      ).catch((err) =>
        console.error("[closeTrade] signal tracking:", err.message),
      );
    }
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getTrade = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!trade) return errorResponse(res, 404, "Trade not found");
    return successResponse(res, 200, "Trade fetched", { trade });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// cancelTrade
export const cancelTrade = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!trade) return errorResponse(res, 404, "Trade not found");
    if (trade.status !== "pending")
      return errorResponse(res, 400, "Only pending trades can be cancelled");

    trade.status = "cancelled";
    trade.cancelledAt = new Date();
    trade.notes = "[User cancelled]";
    await trade.save();

    successResponse(res, 200, "Trade cancelled", { trade });

    // Refund margin + fee (cost that was deducted on open)
    const margin = trade.margin || trade.total;
    const fee = trade.fee || 0;
    const refund = margin + fee;

    if (refund > 0) {
      User.findByIdAndUpdate(req.user._id, {
        $inc: {
          "wallet.balances.USDT": refund,
          "wallet.locked": -margin,
        },
      }).catch((err) => console.error("[cancelTrade] refund:", err.message));

      Transaction.create({
        user: req.user._id,
        type: "refund",
        status: "completed",
        amount: refund,
        currency: "USDT",
        reference: genRef(),
        note: `Cancelled ${trade.leverage}x ${trade.side.toUpperCase()} ${trade.symbol} — margin + fee returned`,
        processedAt: new Date(),
      }).catch(() => {});
    }

    sendNotification(
      req.user._id,
      "trade",
      "Trade Cancelled",
      `Your ${trade.leverage}x ${trade.side.toUpperCase()} order for ${trade.quantity} ${trade.symbol} was cancelled. Margin returned.`,
      { tradeId: trade._id, symbol: trade.symbol, side: trade.side },
      "/trades",
    ).catch(() => {});
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

//  getOpenPositions
export const getOpenPositions = async (req, res) => {
  try {
    const positions = await Trade.find({
      user: req.user._id,
      status: { $in: ["filled", "pending"] },
      assetClass: { $ne: "gold" },
    }).sort({ createdAt: -1 });

    return successResponse(res, 200, "Open positions", {
      positions,
      count: positions.length,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

//  getTradeHistory
export const getTradeHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {
      user: req.user._id,
      status: { $in: ["filled", "cancelled", "failed", "closed", "pending"] },
    };
    if (req.query.symbol) filter.symbol = req.query.symbol.toUpperCase();

    const [trades, total] = await Promise.all([
      Trade.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Trade.countDocuments(filter),
    ]);

    return paginatedResponse(res, "Trade history", trades, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

//  getPnLSummary
export const getPnLSummary = async (req, res) => {
  try {
    const result = await Trade.aggregate([
      {
        $match: {
          user: req.user._id,
          status: { $in: ["filled", "closed"] },
          pnl: { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          totalPnl: { $sum: "$pnl" },
          totalFees: { $sum: "$fee" },
          totalTrades: { $sum: 1 },
          wins: { $sum: { $cond: [{ $gt: ["$pnl", 0] }, 1, 0] } },
          losses: { $sum: { $cond: [{ $lt: ["$pnl", 0] }, 1, 0] } },
        },
      },
    ]);

    const stats = result[0] || {
      totalPnl: 0,
      totalFees: 0,
      totalTrades: 0,
      wins: 0,
      losses: 0,
    };
    stats.winRate =
      stats.totalTrades > 0
        ? parseFloat(((stats.wins / stats.totalTrades) * 100).toFixed(1))
        : 0;

    return successResponse(res, 200, "P&L summary", stats);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// checkSignalTrade
export const checkSignalTrade = async (req, res) => {
  try {
    const { signalId } = req.query;
    if (!signalId)
      return successResponse(res, 200, "No signal ID", { exists: false });

    const trade = await Trade.findOne({
      user: req.user._id,
      signalId,
      status: { $in: ["filled", "pending", "closed"] },
    });
    return successResponse(res, 200, "Trade check completed", {
      exists: !!trade,
      tradeId: trade?._id,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

//  getAllTradeHistory
export const getAllTradeHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const typeFilter = req.query.type;
    const symbol = req.query.symbol?.toUpperCase();

    const [manualTrades, copiedTrades, botTrades] = await Promise.all([
      typeFilter === "copy" || typeFilter === "bot"
        ? []
        : Trade.find({
            user: req.user._id,
            status: {
              $in: ["filled", "cancelled", "failed", "closed", "pending"],
            },
            assetClass: { $ne: "gold" },
            ...(symbol && { symbol }),
          })
            .sort({ createdAt: -1 })
            .lean(),

      typeFilter === "manual" || typeFilter === "bot"
        ? []
        : CopiedTrade.find({
            follower: req.user._id,
            ...(symbol && { "originalTrade.symbol": symbol }),
          })
            .populate("trader", "username")
            .populate(
              "traderTrade",
              "symbol side entryPrice exitPrice profitPercent status",
            )
            .sort({ createdAt: -1 })
            .lean(),

      typeFilter === "manual" || typeFilter === "copy"
        ? []
        : BotCopiedTrade.find({ user: req.user._id, ...(symbol && { symbol }) })
            .populate("bot", "name strategy")
            .sort({ createdAt: -1 })
            .lean(),
    ]);

    const normalised = [
      ...manualTrades.map((t) => ({
        _id: t._id,
        source: "manual",
        symbol: t.symbol,
        side: t.side,
        status: t.status,
        entryPrice: t.filledPrice || t.price || 0,
        exitPrice: null,
        quantity: t.quantity,
        amountInvested: t.margin || t.total || 0, // show margin, not notional
        notional: t.total || 0,
        profit: t.pnl || 0,
        profitPercent: t.margin
          ? parseFloat(((t.pnl / t.margin) * 100).toFixed(2))
          : 0, // ROE%
        fee: t.fee || 0,
        leverage: t.leverage || 1,
        liquidationPrice: t.liquidationPrice || null,
        openedAt: t.filledAt || t.createdAt,
        closedAt: null,
        notes: t.notes || null,
        traderName: null,
        botName: null,
        createdAt: t.createdAt,
      })),

      ...copiedTrades.map((ct) => ({
        _id: ct._id,
        source: "copy",
        symbol: ct.originalTrade?.symbol || ct.traderTrade?.symbol || "—",
        side: ct.originalTrade?.side || ct.traderTrade?.side || "—",
        status: ct.status,
        entryPrice:
          ct.originalTrade?.entryPrice || ct.traderTrade?.entryPrice || 0,
        exitPrice: ct.traderTrade?.exitPrice || null,
        quantity: ct.copiedTrade?.quantity || 0,
        amountInvested: ct.amountInvested || 0,
        notional: ct.amountInvested || 0,
        profit: ct.profit || 0,
        profitPercent: ct.profitPercent || ct.traderTrade?.profitPercent || 0,
        fee: 0,
        leverage: 1,
        liquidationPrice: null,
        openedAt: ct.entryAt || ct.createdAt,
        closedAt: ct.exitAt || null,
        notes: null,
        traderName: ct.trader?.username || null,
        botName: null,
        createdAt: ct.createdAt,
      })),

      ...botTrades.map((bt) => ({
        _id: bt._id,
        source: "bot",
        symbol: bt.symbol || "—",
        side: bt.side || "—",
        status: bt.status,
        entryPrice: bt.entryPrice || 0,
        exitPrice: bt.exitPrice || null,
        quantity: 0,
        amountInvested: bt.amountInvested || 0,
        notional: bt.amountInvested || 0,
        profit: bt.profit || 0,
        profitPercent: bt.profitPercent || 0,
        fee: 0,
        leverage: 1,
        liquidationPrice: null,
        openedAt: bt.entryAt || bt.createdAt,
        closedAt: bt.exitAt || null,
        notes: null,
        traderName: null,
        botName: bt.bot?.name || null,
        createdAt: bt.createdAt,
      })),
    ];

    normalised.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = normalised.length;
    const paginated = normalised.slice((page - 1) * limit, page * limit);

    return successResponse(res, 200, "All trade history fetched", {
      trades: paginated,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const checkLiquidations = async (symbol, currentPrice) => {
  try {
    const trades = await Trade.find({
      symbol,
      status: "filled",
      liquidationPrice: { $ne: null },
    }).lean();

    if (!trades.length) return;

    const toLiquidate = trades.filter(t =>
      (t.side === "buy"  && currentPrice <= t.liquidationPrice) ||
      (t.side === "sell" && currentPrice >= t.liquidationPrice)
    );

    if (!toLiquidate.length) return;

    // Process in parallel — fire and forget per trade
    toLiquidate.forEach(trade => {
      Trade.findByIdAndUpdate(trade._id, {
        $set: {
          status: "liquidated",
          pnl:    -trade.margin,    // full margin lost
          notes:  `Liquidated @ $${currentPrice.toFixed(2)} | Lost $${trade.margin.toFixed(2)}`,
        },
      }).catch(err => console.error("[liquidation] trade update:", err.message));

      // Release locked margin — user loses it all
      User.findByIdAndUpdate(trade.user, {
        $inc: { "wallet.locked": -trade.margin },
        // No credit back — margin is gone
      }).catch(err => console.error("[liquidation] wallet:", err.message));

      sendNotification(
        trade.user, "trade",
        "⚠ Position Liquidated",
        `Your ${trade.leverage}x ${trade.side.toUpperCase()} on ${symbol} was liquidated at $${currentPrice.toFixed(2)}. Margin of $${trade.margin.toFixed(2)} lost.`,
        { tradeId: trade._id, symbol, side: trade.side, leverage: trade.leverage, liqPrice: trade.liquidationPrice },
        "/trades"
      ).catch(() => {});

      console.log(`[liquidation] Trade ${trade._id} liquidated — user ${trade.user}, loss $${trade.margin.toFixed(2)}`);
    });

  } catch (err) {
    console.error("[checkLiquidations] error:", err.message);
  }
};
