import User from "../models/UserModel.js";
import Transaction from "../models/TransactionModel.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";
import { sendNotification } from "../utils/notificationHelper.js";

const REFERRAL_CONFIG = {
  newUserBonus: 20,
  referrerBonus: 50,
  commissionRate: 0.09,
  currency: "USDT",
};

const creditBalance = (user, amount, currency = "USDT") => {
  if (!user.wallet.balances) user.wallet.balances = {};

  if (user.wallet.balances[currency] === undefined) {
    user.wallet.balances[currency] = 0;
  }

  user.wallet.balances[currency] = parseFloat(
    (user.wallet.balances[currency] + amount).toFixed(8),
  );
};

export const applyReferralOnSignup = async (
  newUserId,
  referralCode,
  referrerId = null,
) => {
  if (!referralCode && !referrerId) return;
  try {
    const referrer = referrerId
      ? await User.findById(referrerId)
      : await User.findOne({ referralCode: referralCode.toUpperCase() });

    if (!referrer) return;
    if (referrer._id.toString() === newUserId.toString()) return;

    const newUser = await User.findById(newUserId);
    if (!newUser || newUser.referredBy) return;

    if (newUser.referralCode?.toUpperCase() === referralCode?.toUpperCase())
      return;

    newUser.referredBy = referrer._id;
    // creditBalance(
    //   newUser,
    //   REFERRAL_CONFIG.newUserBonus,
    //   REFERRAL_CONFIG.currency,
    // );
    newUser.wallet.bonusLocked = parseFloat(
      (
        (newUser.wallet.bonusLocked || 0) + REFERRAL_CONFIG.newUserBonus
      ).toFixed(8),
    );
    await newUser.save({ validateBeforeSave: false });

    // creditBalance(
    //   referrer,
    //   REFERRAL_CONFIG.referrerBonus,
    //   REFERRAL_CONFIG.currency,
    // );
    referrer.wallet.bonusLocked = parseFloat(
      (
        (referrer.wallet.bonusLocked || 0) + REFERRAL_CONFIG.referrerBonus
      ).toFixed(8),
    );
    referrer.referralCount = (referrer.referralCount || 0) + 1;
    await referrer.save({ validateBeforeSave: false });

    await Promise.all([
      Transaction.create({
        user: newUserId,
        type: "bonus",
        status: "completed",
        amount: REFERRAL_CONFIG.newUserBonus,
        currency: REFERRAL_CONFIG.currency,
        note: `Welcome bonus — referred by ${referrer.firstName} ${referrer.lastName}.`,
        processedAt: new Date(),
      }),
      Transaction.create({
        user: referrer._id,
        type: "bonus",
        status: "completed",
        amount: REFERRAL_CONFIG.referrerBonus,
        currency: REFERRAL_CONFIG.currency,
        note: `Referral bonus — ${newUser.firstName} ${newUser.lastName} signed up with your link.`,
        processedAt: new Date(),
      }),
      sendNotification(
        newUserId,
        "referral",
        "Welcome Bonus Received!",
        `You've received $${REFERRAL_CONFIG.newUserBonus} welcome bonus. Make your first deposit to unlock it!`,
        { amount: REFERRAL_CONFIG.newUserBonus },
        "/portfolio",
      ),
      sendNotification(
        referrer._id,
        "referral",
        "New Referral Signup!",
        `${newUser.firstName} ${newUser.lastName} signed up using your referral link! You've earned $${REFERRAL_CONFIG.referrerBonus} bonus.`,
        {
          bonus: REFERRAL_CONFIG.referrerBonus,
          referralCount: referrer.referralCount,
        },
        "/referral",
      ),
    ]);

    console.log(
      `[referral] Bonuses applied — referrer=${referrer._id} newUser=${newUserId}`,
    );
  } catch (err) {
    console.error("[referral] applyReferralOnSignup error:", err.message);
  }
};

export const applyReferralCommission = async (userId, depositAmount) => {
  try {
    const user = await User.findById(userId);
    if (!user?.referredBy) return;

    const previousDeposits = await Transaction.countDocuments({
      user: userId,
      type: "deposit",
      status: "completed",
    });
    if (previousDeposits > 1) return;

    const referrer = await User.findById(user.referredBy);
    if (!referrer) return;

    const commission = parseFloat(
      (depositAmount * REFERRAL_CONFIG.commissionRate).toFixed(8),
    );
    if (commission <= 0) return;

    creditBalance(referrer, commission, REFERRAL_CONFIG.currency);
    //  Unlock referrer bonus when referred user deposits
    if (referrer.wallet.bonusLocked > 0) {
      creditBalance(referrer, referrer.wallet.bonusLocked, "USDT");
      referrer.wallet.bonusLocked = 0;
      referrer.wallet.bonusUnlocked = true;
      console.log(
        `[bonus] Referrer bonus $${referrer.wallet.bonusLocked} unlocked for ${referrer._id}`,
      );

      referrer.wallet.bonusLocked = 0;
    }
    user.wallet.hasDeposited = true;

    await Promise.all([
      referrer.save({ validateBeforeSave: false }),
      user.save({ validateBeforeSave: false }),
      Transaction.create({
        user: referrer._id,
        type: "bonus",
        status: "completed",
        amount: commission,
        currency: REFERRAL_CONFIG.currency,

        subType: "commission",
        note: `9% referral commission on ${user.firstName} ${user.lastName}'s first deposit of $${depositAmount}`,
        processedAt: new Date(),
      }),
      sendNotification(
        referrer._id,
        "referral",
        "Referral Commission Earned!",
        `You've earned $${commission.toFixed(2)} commission from ${user.firstName} ${user.lastName}'s first deposit of $${depositAmount}.`,
        { commission: commission.toFixed(2), depositAmount },
        "/referral",
      ),
      sendNotification(
        userId,
        "referral",
        "Welcome Bonus Unlocked!",
        `Your $${REFERRAL_CONFIG.newUserBonus} welcome bonus has been unlocked!`,
        { amount: REFERRAL_CONFIG.newUserBonus },
        "/portfolio",
      ),
    ]);

    console.log(
      `[referral] Commission $${commission} credited to referrer=${referrer._id}`,
    );
  } catch (err) {
    console.error("[referral] applyReferralCommission error:", err.message);
  }
};

//  GET /api/referral
export const getReferralData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-kyc.documentUrl -kyc.selfieUrl -kyc.backUrl",
    );
    if (!user) return errorResponse(res, 404, "User not found");

    const referrals = await User.find({ referredBy: user._id })
      .select("firstName lastName email createdAt wallet")
      .sort({ createdAt: -1 })
      .lean();

    const referralIds = referrals.map((r) => r._id);

    const [bonusTxns, firstDeposits] = await Promise.all([
      Transaction.find({ user: user._id, type: "bonus" })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      Transaction.aggregate([
        {
          $match: {
            user: { $in: referralIds },
            type: "deposit",
            status: "completed",
          },
        },
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: "$user",
            amount: { $first: "$amount" },
          },
        },
      ]),
    ]);

    // Build a map for O(1) lookup
    const depositMap = {};
    firstDeposits.forEach((d) => {
      depositMap[d._id.toString()] = d.amount;
    });

    const totalEarned = bonusTxns.reduce((sum, t) => sum + (t.amount || 0), 0);

    const referralDetails = referrals.map((r) => {
      const firstDepositAmount = depositMap[r._id.toString()] || 0;
      return {
        _id: r._id,
        name: `${r.firstName} ${r.lastName}`,
        email: r.email,
        joinedAt: r.createdAt,
        hasDeposited: !!firstDepositAmount,
        firstDeposit: firstDepositAmount,
        commission: parseFloat(
          (firstDepositAmount * REFERRAL_CONFIG.commissionRate).toFixed(2),
        ),
      };
    });

    return successResponse(res, 200, "Referral data fetched", {
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`,
      referralCount: referrals.length,
      totalEarned: parseFloat(totalEarned.toFixed(2)),
      bonusLocked: user.wallet.bonusLocked || 0,
      commissionRate: `${REFERRAL_CONFIG.commissionRate * 100}%`,
      newUserBonus: REFERRAL_CONFIG.newUserBonus,
      referrerBonus: REFERRAL_CONFIG.referrerBonus,
      referrals: referralDetails,
      recentBonuses: bonusTxns,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

//  GET /api/referral/stats
export const getReferralStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-kyc.documentUrl -kyc.selfieUrl -kyc.backUrl",
    );
    if (!user) return errorResponse(res, 404, "User not found");

    const referrals = await User.find({ referredBy: user._id })
      .select("firstName lastName email createdAt wallet")
      .sort({ createdAt: -1 })
      .lean();

    console.log(
      "[referral/stats] userId:",
      user._id,
      "referrals found:",
      referrals.length,
    );

    const activeReferrals = referrals.filter(
      (r) => r.wallet?.hasDeposited === true,
    );
    const pendingReferrals = referrals.filter((r) => !r.wallet?.hasDeposited);

    const [commissionTxns, recentCommissions] = await Promise.all([
      Transaction.find({
        user: user._id,
        type: "bonus",
        subType: "commission",
      }).lean(),
      Transaction.find({ user: user._id, type: "bonus", subType: "commission" })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const totalCommissionEarned = commissionTxns.reduce(
      (sum, t) => sum + (t.amount || 0),
      0,
    );

    const referredUsers = referrals.map((r) => ({
      _id: r._id,
      name: `${r.firstName} ${r.lastName}`,
      email: r.email,
      joinedAt: r.createdAt,
      hasDeposited: r.wallet?.hasDeposited || false,
    }));

    return successResponse(res, 200, "Referral stats fetched", {
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL || "https://axiontrade.com/"}/register?ref=${user.referralCode}`,
      totalReferrals: referrals.length,
      activeReferrals: activeReferrals.length,
      pendingReferrals: pendingReferrals.length,
      totalCommissionEarned: parseFloat(totalCommissionEarned.toFixed(2)),
      newUserBonus: REFERRAL_CONFIG.newUserBonus,
      referrerBonus: REFERRAL_CONFIG.referrerBonus,
      commissionRate: REFERRAL_CONFIG.commissionRate * 100,
      referredUsers,
      recentCommissions,
    });
  } catch (err) {
    console.error("[referral] getReferralStats error:", err.message);
    return errorResponse(res, 500, err.message);
  }
};
