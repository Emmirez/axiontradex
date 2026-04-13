// backend/src/controllers/swapController.js
import User from "../models/UserModel.js";
import Transaction from "../models/TransactionModel.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";
import { getLiveRates } from "../utils/rateCache.js";
import { sendNotification } from "../utils/notificationHelper.js";

// Matches the symbols already in your COIN_MAP / MOVER_MAP in marketRoutes.js
const SUPPORTED = ["USD", "USDT", "BTC", "ETH", "SOL", "BNB"];

//  Binance symbol map (same as your marketRoutes COIN_MAP)

//  GET /api/swap/rates
export const getRates = async (req, res) => {
  try {
    const rates = await getLiveRates();
    return successResponse(res, 200, "Rates fetched", {
      rates,
      updatedAt: new Date(),
    });
  } catch (err) {
    console.error("[swap/getRates]", err.message);
    return errorResponse(
      res,
      502,
      "Failed to fetch live rates. Please try again.",
    );
  }
};

// POST /api/swap/quote
export const getSwapQuote = async (req, res) => {
  try {
    const { fromCurrency, toCurrency, fromAmount } = req.body;

    if (!SUPPORTED.includes(fromCurrency))
      return errorResponse(res, 400, `Unsupported currency: ${fromCurrency}`);
    if (!SUPPORTED.includes(toCurrency))
      return errorResponse(res, 400, `Unsupported currency: ${toCurrency}`);
    if (fromCurrency === toCurrency)
      return errorResponse(res, 400, "Cannot swap a currency for itself");

    const amount = parseFloat(fromAmount);
    if (!amount || amount <= 0)
      return errorResponse(res, 400, "Amount must be greater than 0");

    const rates = await getLiveRates();

    // Guard against null rates
    if (!rates)
      return errorResponse(
        res,
        503,
        "Market rates temporarily unavailable. Please try again in a moment.",
      );

    const fromUSD = amount * (rates[fromCurrency] || 1);
    const FEE_RATE = 0.005;
    const feeUSD = fromUSD * FEE_RATE;
    const netUSD = fromUSD - feeUSD;
    const toAmount = netUSD / (rates[toCurrency] || 1);
    const rate = (rates[fromCurrency] || 1) / (rates[toCurrency] || 1);

    return successResponse(res, 200, "Quote ready", {
      fromCurrency,
      toCurrency,
      fromAmount: amount,
      toAmount: parseFloat(toAmount.toFixed(8)),
      rate: parseFloat(rate.toFixed(8)),
      feeUSD: parseFloat(feeUSD.toFixed(4)),
      feeRate: FEE_RATE,
      fromUSD: parseFloat(fromUSD.toFixed(4)),
      rates,
    });
  } catch (err) {
    console.error("[swap/getQuote]", err.message);
    return errorResponse(res, 500, err.message);
  }
};

export const executeSwap = async (req, res) => {
  try {
    const {
      fromCurrency,
      toCurrency,
      fromAmount,
      expectedToAmount,
      slippageTolerance = 0.02,
    } = req.body;

    if (!SUPPORTED.includes(fromCurrency))
      return errorResponse(res, 400, `Unsupported currency: ${fromCurrency}`);
    if (!SUPPORTED.includes(toCurrency))
      return errorResponse(res, 400, `Unsupported currency: ${toCurrency}`);
    if (fromCurrency === toCurrency)
      return errorResponse(res, 400, "Cannot swap a currency for itself");

    const amount = parseFloat(fromAmount);
    if (!amount || amount <= 0)
      return errorResponse(res, 400, "Amount must be greater than 0");

    const rates = await getLiveRates();
    if (!rates)
      return errorResponse(
        res,
        503,
        "Market rates temporarily unavailable. Please try again.",
      );

    const fromUSD = amount * (rates[fromCurrency] || 1);
    const FEE_RATE = 0.005;
    const feeUSD = fromUSD * FEE_RATE;
    const netUSD = fromUSD - feeUSD;
    const toAmount = parseFloat((netUSD / (rates[toCurrency] || 1)).toFixed(8));

    if (expectedToAmount) {
      const slippage = Math.abs(toAmount - expectedToAmount) / expectedToAmount;
      if (slippage > slippageTolerance) {
        return errorResponse(
          res,
          400,
          `Price moved ${(slippage * 100).toFixed(2)}% since your quote. Please refresh and try again.`,
        );
      }
    }

    const user = await User.findById(req.user._id).select("wallet");
    if (!user) return errorResponse(res, 404, "User not found");

    const fromBalance =
      fromCurrency === "USD"
        ? (user.wallet?.balance ?? 0)
        : (user.wallet?.balances?.[fromCurrency] ?? 0);

    if (fromBalance < amount) {
      return errorResponse(
        res,
        400,
        `Insufficient ${fromCurrency} balance. Available: ${fromBalance.toFixed(8)}`,
      );
    }

    //  Build $inc update
    const inc = {};
    if (fromCurrency === "USD") {
      inc["wallet.balance"] = -amount;
    } else {
      inc[`wallet.balances.${fromCurrency}`] = -amount;
    }
    if (toCurrency === "USD") {
      inc["wallet.balance"] = (inc["wallet.balance"] || 0) + toAmount;
    } else {
      inc[`wallet.balances.${toCurrency}`] =
        (inc[`wallet.balances.${toCurrency}`] || 0) + toAmount;
    }

    const ref = `SWP-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    //  Calculate updated wallet locally — no second DB fetch needed
    const updatedWallet = JSON.parse(JSON.stringify(user.wallet));
    if (fromCurrency === "USD") {
      updatedWallet.balance = (updatedWallet.balance || 0) - amount;
    } else {
      updatedWallet.balances[fromCurrency] =
        (updatedWallet.balances?.[fromCurrency] || 0) - amount;
    }
    if (toCurrency === "USD") {
      updatedWallet.balance = (updatedWallet.balance || 0) + toAmount;
    } else {
      updatedWallet.balances[toCurrency] =
        (updatedWallet.balances?.[toCurrency] || 0) + toAmount;
    }

    //  Fire and forget — same fix as login/logout
    User.findByIdAndUpdate(req.user._id, { $inc: inc }).catch((err) =>
      console.error("[swap] Wallet update failed:", err.message),
    );

    Transaction.create({
      user: req.user._id,
      type: "swap",
      status: "completed",
      amount: parseFloat(fromUSD.toFixed(4)),
      currency: "USD",
      note: `Swapped ${amount} ${fromCurrency} → ${toAmount} ${toCurrency} @ $${(rates[fromCurrency] || 1).toLocaleString()}/${fromCurrency} (fee: $${feeUSD.toFixed(4)})`,
      reference: ref,
      processedAt: new Date(),
    }).catch((err) =>
      console.error("[swap] Transaction log failed:", err.message),
    );

    // Send notification to user for successful swap
    await sendNotification(
      req.user._id,
      "swap",
      "Currency Swap Completed",
      `Successfully swapped ${amount} ${fromCurrency} to ${toAmount} ${toCurrency}. Fee: $${feeUSD.toFixed(4)}`,
      {
        fromCurrency,
        toCurrency,
        fromAmount: amount,
        toAmount,
        feeUSD,
        rate: parseFloat(((rates[fromCurrency] || 1) / (rates[toCurrency] || 1)).toFixed(8)),
        reference: ref,
      },
      "/swap"
    ).catch(err => console.error('[swap] Notification failed:', err.message));

    //  Return immediately — don't wait for DB
    return successResponse(res, 200, "Swap executed successfully", {
      fromCurrency,
      toCurrency,
      fromAmount: amount,
      toAmount,
      feeUSD: parseFloat(feeUSD.toFixed(4)),
      rate: parseFloat(
        ((rates[fromCurrency] || 1) / (rates[toCurrency] || 1)).toFixed(8),
      ),
      reference: ref,
      wallet: updatedWallet, // calculated locally — instant
    });
  } catch (err) {
    console.error("[swap/execute]", err);
    return errorResponse(res, 500, err.message);
  }
};

//  GET /api/swap/history
export const getSwapHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [swaps, total] = await Promise.all([
      Transaction.find({ user: req.user._id, type: "swap" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments({ user: req.user._id, type: "swap" }),
    ]);

    return successResponse(res, 200, "Swap history fetched", {
      swaps,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};
