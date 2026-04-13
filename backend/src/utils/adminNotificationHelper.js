// backend/src/utils/adminNotificationHelper.js
import { createAdminNotification } from "../controllers/adminNotificationController.js";

const ICON_MAP = {
  deposit: { icon: "ArrowDownCircle", color: "#34d399" },
  withdrawal: { icon: "ArrowUpCircle", color: "#f87171" },
  user: { icon: "Users", color: "#60a5fa" },
  trade: { icon: "Activity", color: "#a78bfa" },
  kyc: { icon: "Star", color: "#f59e0b" },
  system: { icon: "Settings", color: "#94a3b8" },
  security: { icon: "Shield", color: "#f87171" },
};

export const sendAdminNotification = async (type, title, body, metadata = {}, actionUrl = null, targetId = null, targetModel = null) => {
  const iconConfig = ICON_MAP[type] || ICON_MAP.system;
  
  return await createAdminNotification({
    type,
    title,
    body,
    icon: iconConfig.icon,
    iconColor: iconConfig.color,
    metadata,
    actionUrl,
    targetId,
    targetModel,
  });
};

// Specific helpers for common admin notifications
export const notifyNewDeposit = async (transaction) => {
  return await sendAdminNotification(
    "deposit",
    "New Deposit Request",
    `User ${transaction.user?.firstName} ${transaction.user?.lastName} submitted a deposit of $${transaction.amount} ${transaction.currency}`,
    { amount: transaction.amount, currency: transaction.currency, transactionId: transaction._id },
    `/admin/deposits?pending=true`,
    transaction._id,
    "Transaction"
  );
};

export const notifyNewWithdrawal = async (transaction) => {
  return await sendAdminNotification(
    "withdrawal",
    "New Withdrawal Request",
    `User ${transaction.user?.firstName} ${transaction.user?.lastName} requested a withdrawal of $${transaction.amount} ${transaction.currency}`,
    { amount: transaction.amount, currency: transaction.currency, transactionId: transaction._id },
    `/admin/withdrawals?pending=true`,
    transaction._id,
    "Transaction"
  );
};

export const notifyNewUser = async (user) => {
  return await sendAdminNotification(
    "user",
    "New User Registered",
    `${user.firstName} ${user.lastName} (${user.email}) just signed up.`,
    { userId: user._id, email: user.email },
    `/admin/users/${user._id}`,
    user._id,
    "User"
  );
};

export const notifyKYCSubmission = async (user) => {
  return await sendAdminNotification(
    "kyc",
    "New KYC Submission",
    `${user.firstName} ${user.lastName} has submitted KYC documents for verification.`,
    { userId: user._id, email: user.email },
    `/admin/kyc?pending=true`,
    user._id,
    "User"
  );
};

export const notifyNewTrade = async (trade, user) => {
  return await sendAdminNotification(
    "trade",
    "New Trade Executed",
    `${user.firstName} ${user.lastName} executed a ${trade.side} trade for ${trade.quantity} ${trade.symbol}`,
    { tradeId: trade._id, symbol: trade.symbol, side: trade.side, quantity: trade.quantity },
    `/admin/trades`,
    trade._id,
    "Trade"
  );
};