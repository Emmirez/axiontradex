// backend/src/utils/balanceHelpers.js

import User from "../models/UserModel.js";

// DEDUCT balance - FIRE AND FORGET with database save
export const deductBalance = async (userId, amount, currency = 'USDT') => {
  if (!amount || amount <= 0) return;
  
  return User.findByIdAndUpdate(
    userId,
    { $inc: { [`wallet.balances.${currency}`]: -amount } },
    { new: true }
  ).catch(err => console.error(`[deductBalance] error for user ${userId}:`, err.message));
};

// CREDIT balance - FIRE AND FORGET with database save
export const creditBalance = async (userId, amount, currency = 'USDT') => {
  if (!amount || amount <= 0) return;
  
  return User.findByIdAndUpdate(
    userId,
    { $inc: { [`wallet.balances.${currency}`]: amount } },
    { new: true }
  ).catch(err => console.error(`[creditBalance] error for user ${userId}:`, err.message));
};

// UPDATE LOCKED funds - FIRE AND FORGET with database save
export const updateLockedFunds = async (userId, amount, operation = 'add') => {
  if (!amount || amount <= 0) return;
  
  const incValue = operation === 'add' ? amount : -amount;
  
  return User.findByIdAndUpdate(
    userId,
    { $inc: { "wallet.locked": incValue } },
    { new: true }
  ).catch(err => console.error(`[updateLockedFunds] error for user ${userId}:`, err.message));
};

// GET user with calculated available balance
export const getUserBalanceInfo = async (userId) => {
  const user = await User.findById(userId).select("wallet firstName lastName email");
  if (!user) throw new Error("User not found");
  
  const totalUsdt = user.wallet?.balances?.USDT || 0;
  const locked = user.wallet?.locked || 0;
  const available = Math.max(0, totalUsdt - locked);
  
  return {
    user,
    totalUsdt,
    locked,
    available
  };
};