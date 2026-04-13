// backend/src/controllers/goldController.js
import User from "../models/UserModel.js";
import GoldPosition from "../models/GoldPositionModel.js";
import Trade from "../models/TradeModel.js";
import Transaction from "../models/TransactionModel.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";
import { sendNotification } from "../utils/notificationHelper.js";
import { sendAdminNotification } from "../utils/adminNotificationHelper.js";

const genRef = () =>
  `GLD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

//  Rate cache
let _goldCache = null;
let _goldExpiry = 0;
const GOLD_TTL = 60_000;

async function getLiveGoldRate() {
  if (_goldCache && Date.now() < _goldExpiry) return _goldCache;

  try {
    // metals.live — free, no key needed
    const res = await fetch("https://metals.live/api/v1/spot/XAU", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`metals.live ${res.status}`);
    const data = await res.json();
    // Response: [{ metal: "XAU", price: 2350.42 }]
    const price = Array.isArray(data) ? data[0]?.price : data?.price;
    if (!price) throw new Error("Invalid metals.live response");

    // Convert troy oz to grams (1 troy oz = 31.1035 grams)
    const pricePerGram = parseFloat((price / 31.1035).toFixed(4));
    _goldCache = { pricePerOz: price, pricePerGram, source: "metals.live" };
    _goldExpiry = Date.now() + GOLD_TTL;
    return _goldCache;
  } catch (err) {
    console.warn("[gold/rates] metals.live failed:", err.message);
    // Fallback hardcoded rate so platform never goes down
    const fallback = {
      pricePerOz: 2350,
      pricePerGram: 75.55,
      source: "refresh",
    };
    _goldCache = fallback;
    _goldExpiry = Date.now() + 30_000; // shorter TTL for fallback
    return fallback;
  }
}

//  USER CONTROLLERS
// GET /api/gold/rates
export const getGoldRates = async (req, res) => {
  try {
    const rates = await getLiveGoldRate();
    return successResponse(res, 200, "Gold rates fetched", {
      ...rates,
      updatedAt: new Date(),
    });
  } catch (err) {
    return errorResponse(res, 502, "Failed to fetch gold rates");
  }
};

// GET /api/gold/portfolio
export const getMyGoldPortfolio = async (req, res) => {
  try {
    const [position, rates] = await Promise.all([
      GoldPosition.findOne({ user: req.user._id }).lean(),
      getLiveGoldRate(),
    ]);

    if (!position || position.gramsOwned <= 0) {
      return successResponse(res, 200, "Gold portfolio fetched", {
        gramsOwned: 0,
        avgBuyPrice: 0,
        totalInvested: 0,
        currentValue: 0,
        totalProfit: 0,
        profitPercent: 0,
        rates,
      });
    }

    const currentValue = parseFloat(
      (position.gramsOwned * rates.pricePerGram).toFixed(4),
    );
    const totalProfit = parseFloat(
      (currentValue - position.totalInvested).toFixed(4),
    );
    const profitPercent =
      position.totalInvested > 0
        ? parseFloat(((totalProfit / position.totalInvested) * 100).toFixed(2))
        : 0;

    return successResponse(res, 200, "Gold portfolio fetched", {
      gramsOwned: position.gramsOwned,
      avgBuyPrice: position.avgBuyPrice,
      totalInvested: position.totalInvested,
      currentValue,
      totalProfit,
      profitPercent,
      rates,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// GET /api/gold/history
export const getMyGoldHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [trades, total] = await Promise.all([
      Trade.find({ user: req.user._id, assetClass: "gold" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Trade.countDocuments({ user: req.user._id, assetClass: "gold" }),
    ]);

    return successResponse(res, 200, "Gold history fetched", {
      trades,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// POST /api/gold/buy
export const buyGold = async (req, res) => {
  try {
    const { usdtAmount } = req.body;
    const amount = parseFloat(usdtAmount);
    if (!amount || amount <= 0)
      return errorResponse(res, 400, "Valid USDT amount required");
    if (amount < 10)
      return errorResponse(res, 400, "Minimum purchase is $10 USDT");

    const user = await User.findById(req.user._id).select(
      "wallet firstName lastName",
    );
    if (!user) return errorResponse(res, 404, "User not found");

    const usdtBalance = user.wallet?.balances?.USDT ?? 0;
    if (usdtBalance < amount) {
      return errorResponse(
        res,
        400,
        `Insufficient USDT. Available: $${usdtBalance.toFixed(2)}`,
      );
    }

    const rates = await getLiveGoldRate();
    const fee = parseFloat((amount * 0.005).toFixed(4)); // 0.5% fee
    const netUsdt = amount - fee;
    const grams = parseFloat((netUsdt / rates.pricePerGram).toFixed(6));
    const ref = genRef();

    //  Respond immediately
    successResponse(res, 200, "Gold purchased successfully", {
      grams,
      usdtSpent: amount,
      feeUsdt: fee,
      pricePerGram: rates.pricePerGram,
      pricePerOz: rates.pricePerOz,
      reference: ref,
    });

    //  Fire and forget all writes
    // 1. Deduct USDT
    User.findByIdAndUpdate(req.user._id, {
      $inc: { "wallet.balances.USDT": -amount },
    }).catch((err) => console.error("[gold/buy] wallet deduct:", err.message));

    // 2. Update gold position
    GoldPosition.findOne({ user: req.user._id })
      .then(async (pos) => {
        if (!pos) {
          await GoldPosition.create({
            user: req.user._id,
            gramsOwned: grams,
            avgBuyPrice: rates.pricePerGram,
            totalInvested: netUsdt,
            lastUpdated: new Date(),
          });
        } else {
          const newGrams = pos.gramsOwned + grams;
          const newInvested = pos.totalInvested + netUsdt;
          const newAvgPrice = newInvested / newGrams;
          await GoldPosition.findByIdAndUpdate(pos._id, {
            $set: {
              gramsOwned: parseFloat(newGrams.toFixed(6)),
              avgBuyPrice: parseFloat(newAvgPrice.toFixed(4)),
              totalInvested: parseFloat(newInvested.toFixed(4)),
              lastUpdated: new Date(),
            },
          });
        }
      })
      .catch((err) =>
        console.error("[gold/buy] position update:", err.message),
      );

    // 3. Trade record
    Trade.create({
      user: req.user._id,
      symbol: "XAUUSD",
      side: "buy",
      type: "market",
      status: "filled",
      quantity: grams,
      filledPrice: rates.pricePerGram,
      filledAt: new Date(),
      fee,
      feeCurrency: "USDT",
      total: netUsdt,
      assetClass: "gold",
      notes: `Bought ${grams}g gold @ $${rates.pricePerGram}/g`,
    }).catch((err) => console.error("[gold/buy] trade record:", err.message));

    // 4. Transaction record
    Transaction.create({
      user: req.user._id,
      type: "trade",
      status: "completed",
      amount,
      currency: "USDT",
      reference: ref,
      note: `Bought ${grams}g XAU @ $${rates.pricePerGram}/g (fee: $${fee})`,
      processedAt: new Date(),
    }).catch((err) => console.error("[gold/buy] transaction:", err.message));

    // 5. Notification
    sendNotification(
      req.user._id,
      "trade",
      "Gold Purchased ✅",
      `You bought ${grams}g of gold for $${amount} USDT at $${rates.pricePerGram}/g.`,
      { grams, usdtSpent: amount, pricePerGram: rates.pricePerGram },
      "/gold",
    ).catch(() => {});
  } catch (err) {
    console.error("[gold/buy]", err);
    return errorResponse(res, 500, err.message);
  }
};

// POST /api/gold/sell
export const sellGold = async (req, res) => {
  try {
    const { grams: gramsToSell } = req.body;
    const grams = parseFloat(gramsToSell);
    if (!grams || grams <= 0)
      return errorResponse(res, 400, "Valid gram amount required");

    const position = await GoldPosition.findOne({ user: req.user._id });
    if (!position || position.gramsOwned < grams) {
      return errorResponse(
        res,
        400,
        `Insufficient gold. You own ${position?.gramsOwned?.toFixed(6) || 0}g`,
      );
    }

    const rates = await getLiveGoldRate();
    const grossUsdt = parseFloat((grams * rates.pricePerGram).toFixed(4));
    const fee = parseFloat((grossUsdt * 0.005).toFixed(4));
    const netUsdt = parseFloat((grossUsdt - fee).toFixed(4));
    const costBasis = parseFloat((grams * position.avgBuyPrice).toFixed(4));
    const pnl = parseFloat((netUsdt - costBasis).toFixed(4));
    const ref = genRef();

    //  Respond immediately
    successResponse(res, 200, "Gold sold successfully", {
      grams,
      usdtReceived: netUsdt,
      grossUsdt,
      feeUsdt: fee,
      pnl,
      pricePerGram: rates.pricePerGram,
      reference: ref,
    });

    //  Fire and forget
    // 1. Credit USDT
    User.findByIdAndUpdate(req.user._id, {
      $inc: { "wallet.balances.USDT": netUsdt },
    }).catch((err) => console.error("[gold/sell] wallet credit:", err.message));

    // 2. Update position
    const newGrams = parseFloat((position.gramsOwned - grams).toFixed(6));
    const newInvested = parseFloat(
      (position.totalInvested - costBasis).toFixed(4),
    );
    GoldPosition.findByIdAndUpdate(position._id, {
      $set: {
        gramsOwned: Math.max(0, newGrams),
        totalInvested: Math.max(0, newInvested),
        totalProfit: parseFloat((position.totalProfit + pnl).toFixed(4)),
        lastUpdated: new Date(),
      },
    }).catch((err) =>
      console.error("[gold/sell] position update:", err.message),
    );

    // 3. Trade record
    Trade.create({
      user: req.user._id,
      symbol: "XAUUSD",
      side: "sell",
      type: "market",
      status: "filled",
      quantity: grams,
      filledPrice: rates.pricePerGram,
      filledAt: new Date(),
      fee,
      feeCurrency: "USDT",
      total: grossUsdt,
      pnl,
      assetClass: "gold",
      notes: `Sold ${grams}g gold @ $${rates.pricePerGram}/g | P&L: ${pnl >= 0 ? "+" : ""}$${pnl}`,
    }).catch((err) => console.error("[gold/sell] trade record:", err.message));

    // 4. Transaction record
    Transaction.create({
      user: req.user._id,
      type: "trade",
      status: "completed",
      amount: netUsdt,
      currency: "USDT",
      reference: ref,
      note: `Sold ${grams}g XAU @ $${rates.pricePerGram}/g | P&L: ${pnl >= 0 ? "+" : ""}$${pnl}`,
      processedAt: new Date(),
    }).catch((err) => console.error("[gold/sell] transaction:", err.message));

    // 5. Notification
    sendNotification(
      req.user._id,
      "trade",
      pnl >= 0 ? "Gold Sold - Profit 🎉" : "Gold Sold",
      `You sold ${grams}g of gold for $${netUsdt} USDT. P&L: ${pnl >= 0 ? "+" : ""}$${pnl}.`,
      { grams, usdtReceived: netUsdt, pnl },
      "/gold",
    ).catch(() => {});
  } catch (err) {
    console.error("[gold/sell]", err);
    return errorResponse(res, 500, err.message);
  }
};

//  ADMIN CONTROLLERS
// GET /api/gold/admin/all-positions
export const adminGetAllPositions = async (req, res) => {
  try {
    const positions = await GoldPosition.find({ gramsOwned: { $gt: 0 } })
      .populate("user", "firstName lastName email wallet")
      .sort({ totalInvested: -1 })
      .lean();

    const rates = await getLiveGoldRate();

    const enriched = positions.map((p) => ({
      ...p,
      currentValue: parseFloat((p.gramsOwned * rates.pricePerGram).toFixed(4)),
      unrealisedPnl: parseFloat(
        (p.gramsOwned * rates.pricePerGram - p.totalInvested).toFixed(4),
      ),
    }));

    return successResponse(res, 200, "All gold positions fetched", {
      positions: enriched,
      rates,
      total: positions.length,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// GET /api/gold/admin/user-position/:userId
export const adminGetUserPosition = async (req, res) => {
  try {
    const { userId } = req.params;
    const [position, user, rates] = await Promise.all([
      GoldPosition.findOne({ user: userId }).lean(),
      User.findById(userId).select("firstName lastName email wallet").lean(),
      getLiveGoldRate(),
    ]);

    if (!user) return errorResponse(res, 404, "User not found");

    const currentValue = position
      ? parseFloat((position.gramsOwned * rates.pricePerGram).toFixed(4))
      : 0;
    const unrealisedPnl = position
      ? parseFloat((currentValue - position.totalInvested).toFixed(4))
      : 0;

    return successResponse(res, 200, "User gold position fetched", {
      user,
      position: position || { gramsOwned: 0, avgBuyPrice: 0, totalInvested: 0 },
      currentValue,
      unrealisedPnl,
      rates,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// POST /api/gold/admin/buy-for-user
export const adminBuyForUser = async (req, res) => {
  try {
    const { userId, usdtAmount, note } = req.body;
    const amount = parseFloat(usdtAmount);
    if (!userId || !amount || amount <= 0) {
      return errorResponse(res, 400, "userId and valid usdtAmount required");
    }

    const user = await User.findById(userId).select(
      "wallet firstName lastName email",
    );
    if (!user) return errorResponse(res, 404, "User not found");

    const usdtBalance = user.wallet?.balances?.USDT ?? 0;
    if (usdtBalance < amount) {
      return errorResponse(
        res,
        400,
        `User has insufficient USDT. Available: $${usdtBalance.toFixed(2)}`,
      );
    }

    const rates = await getLiveGoldRate();
    const fee = parseFloat((amount * 0.005).toFixed(4));
    const netUsdt = amount - fee;
    const grams = parseFloat((netUsdt / rates.pricePerGram).toFixed(6));
    const ref = genRef();

    //  Respond immediately
    successResponse(res, 200, "Gold purchased for user", {
      userId,
      grams,
      usdtSpent: amount,
      pricePerGram: rates.pricePerGram,
      reference: ref,
    });

    //  Fire and forget
    User.findByIdAndUpdate(userId, {
      $inc: { "wallet.balances.USDT": -amount },
    }).catch((err) => console.error("[gold/admin/buy] wallet:", err.message));

    GoldPosition.findOne({ user: userId })
      .then(async (pos) => {
        if (!pos) {
          await GoldPosition.create({
            user: userId,
            gramsOwned: grams,
            avgBuyPrice: rates.pricePerGram,
            totalInvested: netUsdt,
            lastUpdated: new Date(),
          });
        } else {
          const newGrams = pos.gramsOwned + grams;
          const newInvested = pos.totalInvested + netUsdt;
          await GoldPosition.findByIdAndUpdate(pos._id, {
            $set: {
              gramsOwned: parseFloat(newGrams.toFixed(6)),
              avgBuyPrice: parseFloat((newInvested / newGrams).toFixed(4)),
              totalInvested: parseFloat(newInvested.toFixed(4)),
              lastUpdated: new Date(),
            },
          });
        }
      })
      .catch((err) => console.error("[gold/admin/buy] position:", err.message));

    Trade.create({
      user: userId,
      symbol: "XAUUSD",
      side: "buy",
      type: "market",
      status: "filled",
      quantity: grams,
      filledPrice: rates.pricePerGram,
      filledAt: new Date(),
      fee,
      feeCurrency: "USDT",
      total: netUsdt,
      assetClass: "gold",
      notes:
        note || `Admin purchased ${grams}g gold @ $${rates.pricePerGram}/g`,
    }).catch(() => {});

    Transaction.create({
      user: userId,
      type: "trade",
      status: "completed",
      amount,
      currency: "USDT",
      reference: ref,
      note: note || `Admin: Bought ${grams}g XAU @ $${rates.pricePerGram}/g`,
      processedAt: new Date(),
    }).catch(() => {});

    sendNotification(
      userId,
      "trade",
      "Gold Purchased for You ✅",
      `${grams}g of gold was purchased on your behalf for $${amount} USDT at $${rates.pricePerGram}/g.`,
      { grams, usdtSpent: amount, pricePerGram: rates.pricePerGram },
      "/gold",
    ).catch(() => {});

    sendAdminNotification(
      "trade",
      "Admin Gold Purchase",
      `Admin purchased ${grams}g XAU for ${user.firstName} ${user.lastName} ($${amount} USDT)`,
      { userId, grams, amount, pricePerGram: rates.pricePerGram },
      "/admin",
    ).catch(() => {});
  } catch (err) {
    console.error("[gold/admin/buy]", err);
    return errorResponse(res, 500, err.message);
  }
};

// POST /api/gold/admin/sell-for-user
export const adminSellForUser = async (req, res) => {
  try {
    const { userId, grams: gramsToSell, note } = req.body;
    const grams = parseFloat(gramsToSell);
    if (!userId || !grams || grams <= 0) {
      return errorResponse(res, 400, "userId and valid grams required");
    }

    const [user, position] = await Promise.all([
      User.findById(userId).select("firstName lastName email wallet"),
      GoldPosition.findOne({ user: userId }),
    ]);

    if (!user) return errorResponse(res, 404, "User not found");
    if (!position || position.gramsOwned < grams) {
      return errorResponse(
        res,
        400,
        `User has insufficient gold. They own ${position?.gramsOwned?.toFixed(6) || 0}g`,
      );
    }

    const rates = await getLiveGoldRate();
    const grossUsdt = parseFloat((grams * rates.pricePerGram).toFixed(4));
    const fee = parseFloat((grossUsdt * 0.005).toFixed(4));
    const netUsdt = parseFloat((grossUsdt - fee).toFixed(4));
    const costBasis = parseFloat((grams * position.avgBuyPrice).toFixed(4));
    const pnl = parseFloat((netUsdt - costBasis).toFixed(4));
    const ref = genRef();

    //  Respond immediately
    successResponse(res, 200, "Gold sold for user", {
      userId,
      grams,
      usdtCredited: netUsdt,
      pnl,
      pricePerGram: rates.pricePerGram,
      reference: ref,
    });

    //  Fire and forget
    User.findByIdAndUpdate(userId, {
      $inc: { "wallet.balances.USDT": netUsdt },
    }).catch(() => {});

    const newGrams = Math.max(
      0,
      parseFloat((position.gramsOwned - grams).toFixed(6)),
    );
    const newInvested = Math.max(
      0,
      parseFloat((position.totalInvested - costBasis).toFixed(4)),
    );
    GoldPosition.findByIdAndUpdate(position._id, {
      $set: {
        gramsOwned: newGrams,
        totalInvested: newInvested,
        totalProfit: parseFloat((position.totalProfit + pnl).toFixed(4)),
        lastUpdated: new Date(),
      },
    }).catch(() => {});

    Trade.create({
      user: userId,
      symbol: "XAUUSD",
      side: "sell",
      type: "market",
      status: "filled",
      quantity: grams,
      filledPrice: rates.pricePerGram,
      filledAt: new Date(),
      fee,
      feeCurrency: "USDT",
      total: grossUsdt,
      pnl,
      assetClass: "gold",
      notes:
        note ||
        `Admin sold ${grams}g gold @ $${rates.pricePerGram}/g | P&L: ${pnl >= 0 ? "+" : ""}$${pnl}`,
    }).catch(() => {});

    Transaction.create({
      user: userId,
      type: "trade",
      status: "completed",
      amount: netUsdt,
      currency: "USDT",
      reference: ref,
      note:
        note ||
        `Admin: Sold ${grams}g XAU @ $${rates.pricePerGram}/g | P&L: ${pnl >= 0 ? "+" : ""}$${pnl}`,
      processedAt: new Date(),
    }).catch(() => {});

    sendNotification(
      userId,
      "trade",
      pnl >= 0 ? "Gold Sold - Profit 🎉" : "Gold Sold",
      `${grams}g of gold was sold on your behalf for $${netUsdt} USDT. P&L: ${pnl >= 0 ? "+" : ""}$${pnl}.`,
      { grams, usdtReceived: netUsdt, pnl },
      "/gold",
    ).catch(() => {});
  } catch (err) {
    console.error("[gold/admin/sell]", err);
    return errorResponse(res, 500, err.message);
  }
};

// GET /api/gold/admin/search-users
export const adminSearchUsers = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search || search.length < 2) {
      return errorResponse(
        res,
        400,
        "Search term must be at least 2 characters",
      );
    }
    const users = await User.find({
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ],
    })
      .select("firstName lastName email username wallet")
      .limit(10)
      .lean();

    return successResponse(res, 200, "Users found", { users });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};
