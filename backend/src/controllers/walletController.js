import User from "../models/UserModel.js";
import Transaction from "../models/TransactionModel.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../utils/responseUtils.js";
import { sendNotification } from "../utils/notificationHelper.js";
import { sendAdminNotification } from "../utils/adminNotificationHelper.js";
import { sendWithdrawalOtpEmail } from "../utils/emailUtils.js";

// Withdrawal OTP store (in-memory, per user)
const withdrawalOtps = new Map(); // userId => { code, expiresAt, amount, currency, network, address }
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("wallet currency");
    return successResponse(res, 200, "Wallet fetched", { wallet: user.wallet });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const requestDeposit = async (req, res) => {
  try {
    const { amount, currency, method, network, txHash, address, reference } =
      req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return errorResponse(res, 400, "Amount must be greater than 0");
    }
    if (!currency) {
      return errorResponse(res, 400, "Currency is required");
    }

    // Build note based on method
    const isBank = method === "bank" || network === "bank_transfer";
    const note = isBank
      ? `Bank transfer deposit — Sender: ${address || "N/A"} | Ref: ${reference || "N/A"}`
      : `Crypto deposit — Network: ${network || "N/A"} | From: ${address || "N/A"}`;

    const txn = await Transaction.create({
      user: req.user._id,
      type: "deposit",
      status: "pending",
      amount: parseFloat(amount),
      currency: currency || "USDT",
      txHash: txHash || reference || undefined,
      network: network || undefined,
      address: address || undefined,
      note,
      // Store receipt file path if uploaded
      ...(req.file ? { receipt: req.file.path } : {}),
    });

    return successResponse(
      res,
      201,
      "Deposit request submitted. Awaiting admin confirmation.",
      {
        transaction: txn,
        depositAddress: isBank ? null : "Address shown on deposit page",
      },
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const sendWithdrawalOtp = async (req, res) => {
  try {
    const { amount, currency, network, address } = req.body;

    if (!amount || parseFloat(amount) <= 0)
      return errorResponse(res, 400, "Amount must be greater than 0");
    if (!address?.trim())
      return errorResponse(res, 400, "Withdrawal address is required");

    const user = await User.findById(req.user._id).select(
      "email firstName kyc wallet",
    );

    if (user.kyc.status !== "approved")
      return errorResponse(
        res,
        403,
        "KYC verification required for withdrawals",
      );

    const txnCurrency = currency || "USDT";
    const coinBalance = user.wallet?.balances?.[txnCurrency] ?? 0;

    if (coinBalance < parseFloat(amount))
      return errorResponse(res, 400, `Insufficient ${txnCurrency} balance`);

    const code = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    withdrawalOtps.set(req.user._id.toString(), {
      code,
      expiresAt,
      amount: parseFloat(amount),
      currency: txnCurrency,
      network,
      address: address.trim(),
    });

    // Respond immediately — OTP is saved, user can't tell email is still sending
    successResponse(res, 200, "Verification code sent to your email");

    // Fire and forget — email sends in background
    sendWithdrawalOtpEmail(user, { amount, currency: txnCurrency, code }).catch(
      (err) => console.error("[sendWithdrawalOtp] email failed:", err.message),
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, currency, address, network, bankName, accountNo, otp } =
      req.body;

    //  OTP verification
    const otpRecord = withdrawalOtps.get(req.user._id.toString());
    if (!otpRecord)
      return errorResponse(
        res,
        400,
        "No pending verification. Please request a code first.",
      );
    if (Date.now() > otpRecord.expiresAt) {
      withdrawalOtps.delete(req.user._id.toString());
      return errorResponse(
        res,
        400,
        "Verification code expired. Please request a new one.",
      );
    }
    if (otpRecord.code !== otp?.toString().trim())
      return errorResponse(res, 400, "Invalid verification code.");

    // Clear OTP after successful verification
    withdrawalOtps.delete(req.user._id.toString());

    if (amount <= 0)
      return errorResponse(res, 400, "Amount must be greater than 0");

    // Get user with wallet
    const user = await User.findById(req.user._id).select(
      "wallet kyc.status firstName lastName email",
    );

    const txnCurrency = currency || "USDT";

    if (user.kyc.status !== "approved") {
      return errorResponse(
        res,
        403,
        "KYC verification required for withdrawals",
      );
    }

    // Get the actual coin balance
    const coinBalance = user.wallet?.balances?.[txnCurrency] ?? 0;

    if (coinBalance <= 0) {
      return errorResponse(
        res,
        400,
        `Insufficient ${txnCurrency} balance. You have ${coinBalance} ${txnCurrency}`,
      );
    }

    if (coinBalance < amount) {
      return errorResponse(
        res,
        400,
        `Insufficient ${txnCurrency} balance. Available: ${coinBalance} ${txnCurrency}, Requested: ${amount} ${txnCurrency}`,
      );
    }

    // Fire and forget - deduct wallet (no await for speed)
    User.findByIdAndUpdate(req.user._id, {
      $set: {
        [`wallet.balances.${txnCurrency}`]: parseFloat(
          (coinBalance - amount).toFixed(8),
        ),
      },
    }).catch((err) =>
      console.error("[requestWithdrawal] wallet deduct:", err.message),
    );

    const txn = await Transaction.create({
      user: req.user._id,
      type: "withdrawal",
      status: "pending",
      amount: parseFloat(amount),
      currency: txnCurrency,
      address,
      network,
      bankName,
      accountNo,
    });

    // Send user notification (fire and forget)
    sendNotification(
      req.user._id,
      "wallet",
      "Withdrawal Request Submitted",
      `Your withdrawal request for ${amount} ${txnCurrency} has been submitted and is pending approval.`,
      {
        amount,
        currency: txnCurrency,
        transactionId: txn._id,
        status: "pending",
      },
      "/wallet",
    ).catch(() => {});

    // Send admin notification (fire and forget)
    sendAdminNotification(
      "withdrawal",
      "Withdrawal Request",
      `${user.firstName} ${user.lastName} requested withdrawal of ${amount} ${txnCurrency}`,
      {
        userId: req.user._id,
        amount,
        currency: txnCurrency,
        transactionId: txn._id,
        address,
        network,
        bankName,
        accountNo,
      },
      "/admin/transactions",
      req.user._id,
      "User",
    ).catch(() => {});

    return successResponse(
      res,
      201,
      "Withdrawal request submitted. Processing within 24 hours.",
      { transaction: txn },
    );
  } catch (err) {
    console.error("[requestWithdrawal] Error:", err);
    return errorResponse(res, 500, err.message);
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = { user: req.user._id };

    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
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
