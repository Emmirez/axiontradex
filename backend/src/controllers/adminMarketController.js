import Trade from "../models/TradeModel.js";
import Transaction from "../models/TransactionModel.js";
import User from "../models/UserModel.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../utils/responseUtils.js";
import { applyReferralCommission } from "../controllers/referralController.js";
import { sendNotification } from "../utils/notificationHelper.js";
import { sendAdminNotification } from "../utils/adminNotificationHelper.js";
import {
  deductBalance,
  creditBalance,
  updateLockedFunds,
  getUserBalanceInfo,
} from "../utils/balanceHelpers.js";

// Get all transactions (admin) — filterable by type/status/user
export const getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.userId) filter.user = req.query.userId;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "firstName lastName email wallet"),
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

// Approve deposit → credit user balance
export const approveDeposit = async (req, res) => {
  try {
    const { note } = req.body;
    const txn = await Transaction.findById(req.params.id).populate("user");

    if (!txn) return errorResponse(res, 404, "Transaction not found");
    if (txn.type !== "deposit")
      return errorResponse(res, 400, "Not a deposit transaction");
    if (txn.status !== "pending")
      return errorResponse(res, 400, "Transaction already processed");

    const currency = txn.currency || "USDT";
    const userId = txn.user._id || txn.user;

    const user = await User.findById(userId).select(
      "wallet firstName lastName",
    );
    if (!user) return errorResponse(res, 404, "User not found");

    const coinBalance = user.wallet?.balances?.[currency] || 0;

    txn.status = "completed";
    txn.processedAt = new Date();
    if (note) txn.note = note;
    await txn.save();

    // Respond immediately
    successResponse(
      res,
      200,
      `Deposit of $${txn.amount} approved. Balance updated.`,
      { transaction: txn },
    );

    // Fire and forget
    (async () => {
      try {
        let updatedBalance = coinBalance + txn.amount;

        // 🔥 CHECK IF FIRST DEPOSIT → UNLOCK BONUS
        const previousDeposits = await Transaction.countDocuments({
          user: userId,
          type: "deposit",
          status: "completed",
        });

        if (previousDeposits <= 1 && user.wallet.bonusLocked > 0) {
          updatedBalance += user.wallet.bonusLocked;

          console.log(
            `[bonus] Unlocking $${user.wallet.bonusLocked} for user ${userId}`,
          );

          user.wallet.bonusLocked = 0;
        }

        // Update wallet
        user.wallet.balances[currency] = parseFloat(updatedBalance.toFixed(8));
        user.wallet.hasDeposited = true;

        await user.save({ validateBeforeSave: false });
      } catch (err) {
        console.error("[approveDeposit] wallet:", err.message);
      }
    })();

    sendNotification(
      userId,
      "deposit",
      "Deposit Approved",
      `Your deposit of $${txn.amount.toFixed(
        2,
      )} ${currency} has been approved and credited to your wallet.`,
      { amount: txn.amount, currency, transactionId: txn._id },
      "/portfolio",
    ).catch(() => {});

    sendAdminNotification(
      "deposit",
      "Deposit Approved",
      `Deposit of $${txn.amount.toFixed(2)} ${currency} from ${user.firstName} ${user.lastName} has been approved.`,
      { amount: txn.amount, currency, userId, transactionId: txn._id },
      "/admin/deposits",
      txn._id,
      "Transaction",
    ).catch(() => {});

    applyReferralCommission(userId, txn.amount).catch((err) =>
      console.error("[approveDeposit] referral:", err.message),
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};
// Approve deposit → credit user balance
// export const approveDeposit = async (req, res) => {
//   try {
//     const { note } = req.body;
//     const txn = await Transaction.findById(req.params.id).populate("user");

//     if (!txn) return errorResponse(res, 404, "Transaction not found");
//     if (txn.type !== "deposit")
//       return errorResponse(res, 400, "Not a deposit transaction");
//     if (txn.status !== "pending")
//       return errorResponse(res, 400, "Transaction already processed");

//     const currency = txn.currency || "USDT";
//     const userId = txn.user._id || txn.user;
//     const user = await User.findById(userId).select(
//       "wallet firstName lastName",
//     );
//     if (!user) return errorResponse(res, 404, "User not found");

//     const coinBalance = user.wallet?.balances?.[currency] || 0;

//     txn.status = "completed";
//     txn.processedAt = new Date();
//     if (note) txn.note = note;
//     await txn.save();

//     // Respond immediately
//     successResponse(
//       res,
//       200,
//       `Deposit of $${txn.amount} approved. Balance updated.`,
//       { transaction: txn },
//     );

//     // Fire and forget
//     User.findByIdAndUpdate(userId, {
//       $set: {
//         [`wallet.balances.${currency}`]: parseFloat(
//           (coinBalance + txn.amount).toFixed(8),
//         ),
//         "wallet.hasDeposited": true,
//       },
//     }).catch((err) => console.error("[approveDeposit] wallet:", err.message));

//     sendNotification(
//       userId,
//       "deposit",
//       "Deposit Approved",
//       `Your deposit of $${txn.amount.toFixed(2)} ${currency} has been approved and credited to your wallet.`,
//       { amount: txn.amount, currency, transactionId: txn._id },
//       "/portfolio",
//     ).catch(() => {});

//     sendAdminNotification(
//       "deposit",
//       "Deposit Approved",
//       `Deposit of $${txn.amount.toFixed(2)} ${currency} from ${user.firstName} ${user.lastName} has been approved.`,
//       { amount: txn.amount, currency, userId, transactionId: txn._id },
//       "/admin/deposits",
//       txn._id,
//       "Transaction",
//     ).catch(() => {});

//     applyReferralCommission(userId, txn.amount).catch((err) =>
//       console.error("[approveDeposit] referral:", err.message),
//     );
//   } catch (err) {
//     return errorResponse(res, 500, err.message);
//   }
// };

export const rejectDeposit = async (req, res) => {
  try {
    const { note } = req.body;
    const txn = await Transaction.findById(req.params.id);

    if (!txn) return errorResponse(res, 404, "Transaction not found");
    if (txn.status !== "pending")
      return errorResponse(res, 400, "Transaction already processed");

    txn.status = "failed";
    txn.processedAt = new Date();
    if (note) txn.note = note;
    await txn.save();

    //  Respond immediately
    successResponse(res, 200, "Transaction rejected", { transaction: txn });

    // Fire and forget
    sendNotification(
      txn.user._id || txn.user,
      "deposit",
      "Deposit Rejected",
      `Your deposit of $${txn.amount.toFixed(2)} ${txn.currency || "USDT"} was rejected. ${note || "Please contact support for more information."}`,
      { amount: txn.amount, currency: txn.currency, transactionId: txn._id },
      "/deposit",
    ).catch(() => {});

    sendAdminNotification(
      "deposit",
      "Deposit Rejected",
      `Deposit of $${txn.amount.toFixed(2)} ${txn.currency || "USDT"} was rejected.`,
      { amount: txn.amount, currency: txn.currency, transactionId: txn._id },
      "/admin/deposits",
      txn._id,
      "Transaction",
    ).catch(() => {});
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const approveWithdrawal = async (req, res) => {
  try {
    const { txHash, note } = req.body;
    const txn = await Transaction.findById(req.params.id);

    if (!txn) return errorResponse(res, 404, "Transaction not found");
    if (txn.type !== "withdrawal")
      return errorResponse(res, 400, "Not a withdrawal");
    if (txn.status !== "pending")
      return errorResponse(res, 400, "Already processed");

    // Need user for notification name — select only what we need
    const user = await User.findById(txn.user).select(
      "wallet firstName lastName",
    );
    if (!user) return errorResponse(res, 404, "User not found");

    txn.status = "completed";
    txn.txHash = txHash;
    txn.processedAt = new Date();
    if (note) txn.note = note;
    await txn.save();

    //  Respond immediately
    successResponse(res, 200, "Withdrawal approved and processed", {
      transaction: txn,
    });

    //  Fire and forget — release locked funds
    // const currentLocked = user.wallet?.locked || 0;
    // User.findByIdAndUpdate(txn.user, {
    //   $set: {
    //     'wallet.locked': Math.max(0, parseFloat((currentLocked - txn.amount).toFixed(8)))
    //   }
    // }).catch(err => console.error('[approveWithdrawal] locked release:', err.message));

    sendNotification(
      user._id,
      "withdrawal",
      "Withdrawal Processed",
      `Your withdrawal of $${txn.amount.toFixed(2)} ${txn.currency || "USDT"} has been processed. ${txHash ? `Tx: ${txHash}` : "Pending blockchain confirmation"}`,
      {
        amount: txn.amount,
        currency: txn.currency,
        transactionId: txn._id,
        txHash,
      },
      "/portfolio",
    ).catch(() => {});

    sendAdminNotification(
      "withdrawal",
      "Withdrawal Processed",
      `Withdrawal of $${txn.amount.toFixed(2)} ${txn.currency || "USDT"} for ${user.firstName} ${user.lastName} has been processed.`,
      {
        amount: txn.amount,
        currency: txn.currency,
        userId: user._id,
        transactionId: txn._id,
      },
      "/admin/withdrawals",
      txn._id,
      "Transaction",
    ).catch(() => {});
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const rejectWithdrawal = async (req, res) => {
  try {
    const { note } = req.body;
    const txn = await Transaction.findById(req.params.id);

    if (!txn) return errorResponse(res, 404, "Transaction not found");
    if (txn.status !== "pending")
      return errorResponse(res, 400, "Already processed");

    const user = await User.findById(txn.user).select(
      "wallet firstName lastName",
    );
    if (!user) return errorResponse(res, 404, "User not found");

    const currency = txn.currency || "USDT";
    const coinBalance = user.wallet?.balances?.[currency] || 0;
    const currentLocked = user.wallet?.locked || 0;

    txn.status = "failed";
    txn.processedAt = new Date();
    txn.note = note || "Rejected by admin — funds returned to balance";
    await txn.save();

    //  Respond immediately
    successResponse(
      res,
      200,
      "Withdrawal rejected, funds returned to user balance",
      { transaction: txn },
    );

    //  Fire and forget — refund balance + release locked in one atomic update
    User.findByIdAndUpdate(txn.user, {
      $set: {
        [`wallet.balances.${currency}`]: parseFloat(
          (coinBalance + txn.amount).toFixed(8),
        ),
        // "wallet.locked": Math.max(
        //   0,
        //   parseFloat((currentLocked - txn.amount).toFixed(8)),
        // ),
      },
    }).catch((err) =>
      console.error("[rejectWithdrawal] wallet refund:", err.message),
    );

    sendNotification(
      user._id,
      "withdrawal",
      "Withdrawal Rejected",
      `Your withdrawal of $${txn.amount.toFixed(2)} ${currency} was rejected. Funds have been returned to your balance. ${note || ""}`,
      { amount: txn.amount, currency, transactionId: txn._id },
      "/withdraw",
    ).catch(() => {});

    sendAdminNotification(
      "withdrawal",
      "Withdrawal Rejected",
      `Withdrawal of $${txn.amount.toFixed(2)} ${currency} for ${user.firstName} ${user.lastName} was rejected.`,
      {
        amount: txn.amount,
        currency,
        userId: user._id,
        transactionId: txn._id,
      },
      "/admin/withdrawals",
      txn._id,
      "Transaction",
    ).catch(() => {});
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Edit any transaction field (admin)
export const editTransaction = async (req, res) => {
  try {
    const {
      status,
      amount,
      note,
      txHash,
      type,
      currency,
      network,
      address,
      reference,
    } = req.body;

    const txn = await Transaction.findById(req.params.id).populate(
      "user",
      "firstName lastName email wallet",
    );
    if (!txn) return errorResponse(res, 404, "Transaction not found");

    const wasCompleted = txn.status === "completed";
    const nowCompleted = status === "completed";
    const nowFailed = status === "failed" || status === "cancelled";
    const txnCurrency = currency || txn.currency || "USDT";

    // Balance logic for deposits
    if (txn.type === "deposit") {
      const user = await User.findById(txn.user._id || txn.user);

      // pending/failed → completed: credit balance with new amount (or existing)
      if (!wasCompleted && nowCompleted) {
        const creditAmt = parseFloat(amount ?? txn.amount);
        creditBalance(user, creditAmt, txnCurrency);
        await user.save({ validateBeforeSave: false });
      }

      // completed → failed/cancelled: reverse the credit
      if (wasCompleted && nowFailed) {
        deductBalance(user, txn.amount, txnCurrency);
        await user.save({ validateBeforeSave: false });
      }

      // completed → completed but amount changed: adjust the difference
      if (
        wasCompleted &&
        nowCompleted &&
        amount !== undefined &&
        parseFloat(amount) !== txn.amount
      ) {
        const diff = parseFloat(amount) - txn.amount;
        if (diff > 0) {
          creditBalance(user, diff, txnCurrency);
        } else {
          deductBalance(user, Math.abs(diff), txnCurrency);
        }
        await user.save({ validateBeforeSave: false });
      }
    }

    // Apply all editable fields
    if (status !== undefined) txn.status = status;
    if (amount !== undefined) txn.amount = parseFloat(amount);
    if (note !== undefined) txn.note = note;
    if (txHash !== undefined) txn.txHash = txHash;
    if (type !== undefined) txn.type = type;
    if (currency !== undefined) txn.currency = currency;
    if (network !== undefined) txn.network = network;
    if (address !== undefined) txn.address = address;
    if (reference !== undefined) txn.reference = reference;

    txn.processedAt = new Date();
    await txn.save();

    const updated = await Transaction.findById(txn._id).populate(
      "user",
      "firstName lastName email",
    );
    return successResponse(res, 200, "Transaction updated", {
      transaction: updated,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Add bonus / manual adjustment
export const addAdjustment = async (req, res) => {
  try {
    const {
      userId,
      amount,
      type = "bonus",
      currency = "USDT",
      note,
    } = req.body;

    if (!userId || !amount || amount <= 0) {
      return errorResponse(res, 400, "userId and positive amount are required");
    }

    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 404, "User not found");

    creditBalance(user, parseFloat(amount), currency);
    await user.save({ validateBeforeSave: false });

    const txn = await Transaction.create({
      user: userId,
      type,
      status: "completed",
      amount: parseFloat(amount),
      currency,
      note: note || `Admin ${type}: $${amount} ${currency}`,
      processedAt: new Date(),
    });

    return successResponse(res, 201, "Adjustment applied and balance updated", {
      transaction: txn,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Admin open trade on behalf of user
export const adminOpenTrade = async (req, res) => {
  try {
    const {
      userId,
      symbol,
      side,
      type = "market",
      quantity,
      price,
      stopLoss,
      takeProfit,
      assetClass = "crypto",
      note,
    } = req.body;

    // Validation
    if (!userId || !symbol || !side || !quantity || !price) {
      return errorResponse(
        res,
        400,
        "userId, symbol, side, quantity and price are required",
      );
    }

    if (quantity <= 0 || price <= 0) {
      return errorResponse(
        res,
        400,
        "Quantity and price must be greater than 0",
      );
    }

    // Get user with current balance
    const user = await User.findById(userId).select(
      "wallet firstName lastName email",
    );
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const totalUsdt = user.wallet?.balances?.USDT || 0;
    const locked = user.wallet?.locked || 0;
    const available = totalUsdt - locked;

    const total = parseFloat((quantity * price).toFixed(8));
    const fee = parseFloat((total * 0.001).toFixed(8));
    const cost = total + fee;

    // BALANCE CHECK BASED ON SIDE
    if (side === "buy") {
      if (available < cost) {
        return errorResponse(
          res,
          400,
          `Insufficient available balance. Required: $${cost.toFixed(2)}, Available: $${available.toFixed(2)} (Total: $${totalUsdt.toFixed(2)}, Locked: $${locked.toFixed(2)})`,
        );
      }
    } else if (side === "sell") {
      if (available < total) {
        return errorResponse(
          res,
          400,
          `Insufficient margin for short position. Required: $${total.toFixed(2)}, Available: $${available.toFixed(2)} (Total: $${totalUsdt.toFixed(2)}, Locked: $${locked.toFixed(2)})`,
        );
      }
    }

    // Create trade record
    const status = type === "market" ? "filled" : "pending";

    const trade = await Trade.create({
      user: userId,
      symbol,
      side,
      type,
      quantity: parseFloat(quantity),
      filledPrice: parseFloat(price),
      filledAt: new Date(),
      status: status,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      fee,
      feeCurrency: "USDT",
      total,
      assetClass,
      notes: note ? `[Admin] ${note}` : "[Admin trade]",
    });

    // FIRE AND FORGET - No await, update balances
    if (side === "buy") {
      User.findByIdAndUpdate(userId, {
        $inc: {
          "wallet.balances.USDT": -cost,
          "wallet.locked": total,
        },
      }).catch((err) =>
        console.error("[adminOpenTrade] buy balance error:", err.message),
      );
    } else if (side === "sell") {
      User.findByIdAndUpdate(userId, {
        $inc: {
          "wallet.balances.USDT": -total, // Deduct margin
          "wallet.locked": total, // Lock margin
        },
      }).catch((err) =>
        console.error("[adminOpenTrade] sell balance error:", err.message),
      );
    }

    // FIRE AND FORGET - Transactions
    if (side === "buy") {
      Transaction.create({
        user: userId,
        type: "trade",
        status: "completed",
        amount: total,
        currency: "USDT",
        reference: trade._id.toString(),
        note: `[Admin] Bought ${quantity} ${symbol} at $${price} (Fee: $${fee})`,
        processedAt: new Date(),
      }).catch((err) =>
        console.error("[adminTrade] transaction error:", err.message),
      );
    } else {
      Transaction.create({
        user: userId,
        type: "trade",
        status: "completed",
        amount: total,
        currency: "USDT",
        reference: trade._id.toString(),
        note: `[Admin] Sold (Short) ${quantity} ${symbol} at $${price} - Margin locked: $${total}`,
        processedAt: new Date(),
      }).catch((err) =>
        console.error("[adminTrade] transaction error:", err.message),
      );
    }

    Transaction.create({
      user: userId,
      type: "fee",
      status: "completed",
      amount: fee,
      currency: "USDT",
      reference: trade._id.toString(),
      note: `[Admin] Fee for ${symbol} trade`,
      processedAt: new Date(),
    }).catch((err) => console.error("[adminTrade] fee error:", err.message));

    // FIRE AND FORGET - Notifications
    sendNotification(
      userId,
      "trade",
      `Trade Opened: ${symbol}`,
      `Admin opened a ${side.toUpperCase()} trade for ${quantity} ${symbol} at $${price}. ${side === "buy" ? `Cost: $${cost.toFixed(2)}` : `Margin locked: $${total.toFixed(2)}`}`,
      { symbol, side, quantity, price, total, tradeId: trade._id },
      "/trades",
    ).catch(() => {});

    sendAdminNotification(
      "trade",
      "Admin Opened Trade",
      `Admin opened a ${side.toUpperCase()} trade for ${user.firstName} ${user.lastName}: ${quantity} ${symbol} at $${price}`,
      { symbol, side, quantity, price, userId, tradeId: trade._id },
      "/admin/trades",
      trade._id,
      "Trade",
    ).catch(() => {});

    return successResponse(res, 201, "Trade opened for user", {
      trade,
      balanceInfo: {
        side,
        total,
        fee,
        totalCost: side === "buy" ? cost : total,
        marginLocked: side === "sell" ? total : 0,
      },
    });
  } catch (err) {
    console.error("[adminOpenTrade] error:", err);
    return errorResponse(res, 500, err.message);
  }
};

// Admin close any trade
export const adminCloseTrade = async (req, res) => {
  try {
    const { closePrice, note } = req.body;
    const tradeId = req.params.id;

    if (!closePrice || closePrice <= 0) {
      return errorResponse(res, 400, "Valid close price is required");
    }

    const trade = await Trade.findOne({ _id: tradeId, status: "filled" });
    if (!trade) {
      return errorResponse(res, 404, "Open trade not found or already closed");
    }

    const user = await User.findById(trade.user).select(
      "wallet firstName lastName",
    );
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const entryVal = trade.total || trade.quantity * trade.filledPrice;
    const closeVal = parseFloat((trade.quantity * closePrice).toFixed(8));
    const closeFee = parseFloat((closeVal * 0.001).toFixed(8));

    let pnl;
    let refundAmount;

    if (trade.side === "buy") {
      pnl = parseFloat((closeVal - entryVal - closeFee).toFixed(8));
      refundAmount = parseFloat((closeVal - closeFee).toFixed(8));
    } else {
      pnl = parseFloat((entryVal - closeVal - closeFee).toFixed(8));
      refundAmount = parseFloat((entryVal + pnl).toFixed(8)); // total refund
    }

    // Update trade
    trade.pnl = pnl;
    trade.closePrice = parseFloat(closePrice);
    trade.closedAt = new Date();
    trade.status = "closed";
    trade.notes = `[Admin closed] at $${closePrice} | P&L: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}${note ? " | " + note : ""}`;
    await trade.save();

    // FIRE AND FORGET - Update balances
    if (trade.side === "buy") {
      User.findByIdAndUpdate(trade.user, {
        $inc: {
          "wallet.balances.USDT": refundAmount,
          "wallet.locked": -entryVal,
        },
      }).catch((err) =>
        console.error("[adminCloseTrade] buy close error:", err.message),
      );
    } else if (trade.side === "sell") {
      User.findByIdAndUpdate(trade.user, {
        $inc: {
          "wallet.balances.USDT": refundAmount,
          "wallet.locked": -entryVal,
        },
      }).catch((err) =>
        console.error("[adminCloseTrade] sell close error:", err.message),
      );
    }

    // FIRE AND FORGET - Transactions
    Transaction.create({
      user: trade.user,
      type: "trade",
      status: "completed",
      amount: Math.abs(pnl),
      currency: "USDT",
      reference: trade._id.toString(),
      note: `[Admin] Closed ${trade.symbol} — P&L: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`,
      processedAt: new Date(),
    }).catch((err) =>
      console.error("[adminClose] transaction error:", err.message),
    );

    const pnlText =
      pnl >= 0
        ? `profit of $${pnl.toFixed(2)}`
        : `loss of $${Math.abs(pnl).toFixed(2)}`;

    sendNotification(
      trade.user,
      "trade",
      `Trade Closed: ${trade.symbol}`,
      `Your ${trade.symbol} ${trade.side.toUpperCase()} trade has been closed with ${pnlText}.`,
      {
        symbol: trade.symbol,
        side: trade.side,
        pnl,
        refund: refundAmount,
        tradeId: trade._id,
      },
      "/trades",
    ).catch(() => {});

    sendAdminNotification(
      "trade",
      "Admin Closed Trade",
      `Admin closed a ${trade.side.toUpperCase()} trade for ${user.firstName} ${user.lastName}: ${trade.quantity} ${trade.symbol} with ${pnlText}`,
      {
        symbol: trade.symbol,
        side: trade.side,
        pnl,
        userId: trade.user,
        tradeId: trade._id,
      },
      "/admin/trades",
      trade._id,
      "Trade",
    ).catch(() => {});

    return successResponse(res, 200, "Trade closed by admin", {
      trade,
      pnl,
      closePrice,
      refunded: refundAmount,
    });
  } catch (err) {
    console.error("[adminCloseTrade] error:", err);
    return errorResponse(res, 500, err.message);
  }
};

// Get user balance info for admin preview
export const adminGetUserBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const balanceInfo = await getUserBalanceInfo(userId);

    return successResponse(res, 200, "User balance info", {
      userId: balanceInfo.user._id,
      name: `${balanceInfo.user.firstName} ${balanceInfo.user.lastName}`,
      email: balanceInfo.user.email,
      balances: {
        USDT: balanceInfo.totalUsdt,
        locked: balanceInfo.locked,
        available: balanceInfo.available,
      },
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Get all trades (admin)
export const getAllTrades = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.userId) filter.user = req.query.userId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.symbol) filter.symbol = req.query.symbol?.toUpperCase();

    const [trades, total] = await Promise.all([
      Trade.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "firstName lastName email"),
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
