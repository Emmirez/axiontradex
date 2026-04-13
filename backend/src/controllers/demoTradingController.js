// backend/src/controllers/demoTradingController.js
import DemoAccount from "../models/DemoAccountModel.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

const FEE_RATE = 0.001;
const MAINTENANCE_MARGIN_RATE = 0.005;

function calcLiqPrice(side, entryPrice, leverage) {
  if (leverage <= 1) return null;
  if (side === "buy")
    return parseFloat(
      (entryPrice * (1 - 1 / leverage + MAINTENANCE_MARGIN_RATE)).toFixed(8),
    );
  return parseFloat(
    (entryPrice * (1 + 1 / leverage - MAINTENANCE_MARGIN_RATE)).toFixed(8),
  );
}

// Get or create demo account
export const getDemoAccount = async (req, res) => {
  try {
    let account = await DemoAccount.findOne({ user: req.user._id });

    if (!account) {
      account = await DemoAccount.create({
        user: req.user._id,
        balance: 100000,
        initialBalance: 100000,
      });
    }

    return successResponse(res, 200, "Demo account fetched", { account });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Open demo trade
export const openDemoTrade = async (req, res) => {
  try {
    const {
      symbol,
      side,
      quantity,
      entryPrice,
      stopLoss,
      takeProfit,
      leverage = 1,
    } = req.body;

    const account = await DemoAccount.findOne({ user: req.user._id });
    if (!account) return errorResponse(res, 404, "Demo account not found");

    const lev = Math.max(1, Math.min(100, parseInt(leverage) || 1));
    const notional = parseFloat((quantity * entryPrice).toFixed(8));
    const margin = parseFloat((notional / lev).toFixed(8));
    const openFee = parseFloat((notional * FEE_RATE).toFixed(8));
    const cost = parseFloat((margin + openFee).toFixed(8));

    if (cost > account.balance) {
      return errorResponse(
        res,
        400,
        `Insufficient demo balance. Required: $${cost.toFixed(2)} (margin $${margin.toFixed(2)} + fee $${openFee.toFixed(2)}), Available: $${account.balance.toFixed(2)}`,
      );
    }

    // Position too large (90% rule)
    if (margin > account.balance * 0.9) {
      return errorResponse(
        res,
        400,
        "Position too large — max 90% of balance as margin",
      );
    }

    const liqPrice = calcLiqPrice(side, entryPrice, lev);

    account.balance -= cost;

    const tradeId = `DEMO_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    account.openPositions.push({
      tradeId,
      symbol,
      side,
      quantity,
      entryPrice,
      stopLoss,
      takeProfit,
      leverage: lev,
      margin,
      liquidationPrice: liqPrice,
      openedAt: new Date(),
    });

    account.lastActive = new Date();
    await account.save();

    return successResponse(res, 201, "Demo trade opened", {
      trade: {
        tradeId,
        symbol,
        side,
        quantity,
        entryPrice,
        leverage: lev,
        margin,
        liquidationPrice: liqPrice,
      },
      newBalance: account.balance,
      summary: {
        notional: `$${notional.toFixed(2)}`,
        margin: `$${margin.toFixed(2)}`,
        fee: `$${openFee.toFixed(2)}`,
        cost: `$${cost.toFixed(2)}`,
        leverage: `${lev}×`,
        liqPrice: liqPrice ? `$${liqPrice.toFixed(2)}` : "N/A",
      },
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Close demo trade
export const closeDemoTrade = async (req, res) => {
  try {
    const { tradeId, exitPrice } = req.body;

    const account = await DemoAccount.findOne({ user: req.user._id });
    if (!account) return errorResponse(res, 404, "Demo account not found");

    const position = account.openPositions.find((p) => p.tradeId === tradeId);
    if (!position) return errorResponse(res, 404, "Position not found");

    // Binance-style P&L — same as real tradeController
    const closeFee = parseFloat(
      (position.quantity * exitPrice * FEE_RATE).toFixed(8),
    );
    const grossPnl =
      position.side === "buy"
        ? (exitPrice - position.entryPrice) * position.quantity
        : (position.entryPrice - exitPrice) * position.quantity;
    const profit = parseFloat((grossPnl - closeFee).toFixed(8));
    const margin = position.margin || position.quantity * position.entryPrice; // fallback for old positions
    const profitPercent = parseFloat(((profit / margin) * 100).toFixed(2)); // ROE%

    // Refund = margin + leveraged P&L
    account.balance += parseFloat((margin + profit).toFixed(8));

    // Update stats
    account.totalTrades += 1;
    account.profit += profit;
    if (profit > 0) {
      account.winningTrades += 1;
      if (profit > account.bestTrade) account.bestTrade = profit;
    } else if (profit < 0) {
      account.losingTrades += 1;
      if (profit < account.worstTrade) account.worstTrade = profit;
    }

    account.tradeHistory.push({
      tradeId: position.tradeId,
      symbol: position.symbol,
      side: position.side,
      quantity: position.quantity,
      entryPrice: position.entryPrice,
      exitPrice,
      leverage: position.leverage || 1,
      margin,
      profit,
      profitPercent,
      openedAt: position.openedAt,
      closedAt: new Date(),
    });

    account.openPositions = account.openPositions.filter(
      (p) => p.tradeId !== tradeId,
    );
    account.lastActive = new Date();
    await account.save();

    return successResponse(res, 200, "Demo trade closed", {
      profit,
      profitPercent,
      leverage: position.leverage || 1,
      margin,
      newBalance: account.balance,
      totalProfit: account.profit,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Reset demo account
export const resetDemoAccount = async (req, res) => {
  try {
    const account = await DemoAccount.findOne({ user: req.user._id });
    if (!account) {
      return errorResponse(res, 404, "Demo account not found");
    }

    account.balance = 100000;
    account.profit = 0;
    account.totalTrades = 0;
    account.winningTrades = 0;
    account.losingTrades = 0;
    account.bestTrade = 0;
    account.worstTrade = 0;
    account.openPositions = [];
    account.tradeHistory = [];
    account.resetCount += 1;
    account.lastActive = new Date();
    await account.save();

    return successResponse(res, 200, "Demo account reset", { account });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Get demo stats
// Get demo stats
export const getDemoStats = async (req, res) => {
  try {
    let account = await DemoAccount.findOne({ user: req.user._id });

    // If no account exists, CREATE ONE automatically
    if (!account) {
      console.log(`Creating demo account for user: ${req.user.email}`);
      account = await DemoAccount.create({
        user: req.user._id,
        balance: 100000,
        initialBalance: 100000,
      });
      console.log(`Demo account created with $100,000 balance`);
    }

    const winRate =
      account.totalTrades > 0
        ? (account.winningTrades / account.totalTrades) * 100
        : 0;

    return successResponse(res, 200, "Demo stats fetched", {
      hasAccount: true,
      stats: {
        balance: account.balance,
        profit: account.profit,
        totalTrades: account.totalTrades,
        winningTrades: account.winningTrades,
        losingTrades: account.losingTrades,
        winRate: winRate.toFixed(1),
        bestTrade: account.bestTrade,
        worstTrade: account.worstTrade,
        resetCount: account.resetCount,
      },
      openPositions: account.openPositions,
      recentTrades: account.tradeHistory.slice(-10).reverse(),
    });
  } catch (err) {
    console.error("getDemoStats error:", err);
    return errorResponse(res, 500, err.message);
  }
};

// Get leaderboard (top demo traders)
export const getDemoLeaderboard = async (req, res) => {
  try {
    const leaders = await DemoAccount.find({ isActive: true })
      .populate("user", "firstName lastName username")
      .sort({ profit: -1 })
      .limit(20);

    const leaderboard = leaders.map((leader, index) => ({
      rank: index + 1,
      name:
        leader.user?.firstName + " " + leader.user?.lastName ||
        leader.user?.username,
      profit: leader.profit,
      totalTrades: leader.totalTrades,
      winRate:
        leader.totalTrades > 0
          ? ((leader.winningTrades / leader.totalTrades) * 100).toFixed(1)
          : 0,
      balance: leader.balance,
    }));

    return successResponse(res, 200, "Leaderboard fetched", { leaderboard });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};
