import crypto from "crypto";
import User from "../models/UserModel.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/jwtUtils.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendLoginAlertEmail,
} from "../utils/emailUtils.js";
import {
  generateTOTPSecret,
  verifyTOTPToken,
  generateQRCode,
} from "../utils/totpUtils.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";
import { applyReferralOnSignup } from "./referralController.js";
import { sendAdminNotification } from "../utils/adminNotificationHelper.js";
import { sendNotification } from "../utils/notificationHelper.js";

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      phone,
      country,
      homeAddress,
      dateOfBirth,
      currency,
      referral,
    } = req.body;

    const referralCode = `${firstName.toUpperCase().slice(0, 3)}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password,
      phone,
      country,
      homeAddress,
      dateOfBirth,
      currency,
      referralCode,
    });

    // Generate verify token and save — this must complete before sending email
    const verifyToken = crypto.randomBytes(32).toString("hex");
    user.emailVerifyToken = crypto
      .createHash("sha256")
      .update(verifyToken)
      .digest("hex");
    user.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    //  Respond immediately — user is created and token is saved
    successResponse(
      res,
      201,
      "Account created. Please check your email to verify your account.",
      {
        user: user.toSafeObject(),
      },
    );

    // Fire and forget — none of these affect the response
    sendVerificationEmail(user, verifyToken).catch((err) =>
      console.error("[register] verification email failed:", err.message),
    );

    if (referral) {
      applyReferralOnSignup(user._id, referral).catch((err) =>
        console.error("[register] referral failed:", err.message),
      );
    }

    sendAdminNotification(
      "user",
      "New User Registered",
      `${user.firstName} ${user.lastName} (${user.email}) just signed up.`,
      {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        referralCode: user.referralCode,
        referredBy: referral ? "Yes" : "No",
      },
      "/admin/users/" + user._id,
      user._id,
      "User",
    ).catch(() => {});
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const message =
        field === "email"
          ? "An account with this email already exists."
          : field === "username"
            ? "This username is already taken."
            : "Email or username already exists.";
      return errorResponse(res, 409, message);
    }
    return errorResponse(res, 500, err.message);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      emailVerifyToken: hashedToken,
      emailVerifyExpires: { $gt: Date.now() },
    }).select("+emailVerifyToken +emailVerifyExpires");

    if (!user)
      return errorResponse(res, 400, "Invalid or expired verification token");

    user.isEmailVerified = true;
    user.status = "active";
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save({ validateBeforeSave: false });

    await sendWelcomeEmail(user);

    await sendNotification(
      user._id,
      "security",
      "Email Verified",
      "Your email has been successfully verified. You can now access all platform features.",
      { userId: user._id },
      "/dashboard",
    );

    // Send admin notification for email verification
    await sendAdminNotification(
      "user",
      "Email Verified",
      `${user.firstName} ${user.lastName} (${user.email}) has verified their email address.`,
      { userId: user._id, email: user.email },
      "/admin/users/" + user._id,
      user._id,
      "User",
    );
    return successResponse(
      res,
      200,
      "Email verified successfully. You can now log in.",
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, totpToken } = req.body;

    const user = await User.findOne({ email }).select(
      "+password +refreshTokens +twoFactorSecret -kyc.documentUrl -kyc.selfieUrl -kyc.backUrl",
    );

    if (!user)
      return errorResponse(
        res,
        401,
        "No account found with that email address",
      );

    if (!(await user.comparePassword(password)))
      return errorResponse(res, 401, "Incorrect password. Please try again.");

    if (!user.isEmailVerified)
      return errorResponse(
        res,
        401,
        "Please verify your email before logging in. Check your inbox for the verification link.",
      );

    if (user.status === "suspended")
      return errorResponse(
        res,
        403,
        "Your account has been suspended. Please contact support.",
      );

    if (user.status === "banned")
      return errorResponse(
        res,
        403,
        "Your account has been permanently banned.",
      );

    if (user.status === "pending")
      return errorResponse(
        res,
        403,
        "Your account is pending activation. Please verify your email first.",
      );

    if (user.twoFactorEnabled) {
      if (!totpToken)
        return successResponse(res, 200, "2FA_REQUIRED", { requires2FA: true });
      const valid = verifyTOTPToken(user.twoFactorSecret, totpToken);
      if (!valid) return errorResponse(res, 401, "Invalid 2FA code");
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    const recentTokens = [
      ...(user.refreshTokens || []).slice(-4),
      refreshToken,
    ];
    User.findByIdAndUpdate(user._id, {
      $set: {
        refreshTokens: recentTokens,
        lastLoginAt: new Date(),
        lastLoginIp: req.ip,
      },
    }).catch((err) =>
      console.error("[login] Failed to update tokens:", err.message),
    );

    setRefreshTokenCookie(res, refreshToken);

    await sendNotification(
      user._id,
      "security",
      "New Login Detected",
      `A new login was detected from IP: ${req.ip || "Unknown location"}. If this wasn't you, please secure your account immediately.`,
      { ip: req.ip, loginTime: new Date() },
      "/security",
    );

    sendLoginAlertEmail(user, req.ip).catch(() => {});

    return successResponse(res, 200, "Login successful", {
      accessToken,
      user: user.toSafeObject(),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return errorResponse(res, 401, "No refresh token");

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select(
      "+refreshTokens -kyc.documentUrl -kyc.selfieUrl -kyc.backUrl",
    );

    if (!user || !user.refreshTokens.includes(token))
      return errorResponse(res, 401, "Invalid refresh token");

    const newRefresh = generateRefreshToken(user._id);
    const updatedTokens = user.refreshTokens
      .filter((t) => t !== token)
      .concat(newRefresh);

    //  Fire and forget
    User.findByIdAndUpdate(user._id, {
      $set: { refreshTokens: updatedTokens },
    }).catch((err) =>
      console.error("[refreshToken] Failed to update tokens:", err.message),
    );

    setRefreshTokenCookie(res, newRefresh);
    const accessToken = generateAccessToken(user._id, user.role);
    return successResponse(res, 200, "Token refreshed", { accessToken });
  } catch (err) {
    clearRefreshTokenCookie(res);
    return errorResponse(res, 401, "Invalid or expired refresh token");
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      // Fire and forget
      User.findById(req.user._id)
        .select("+refreshTokens")
        .then((user) => {
          if (user) {
            user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
            return user.save({ validateBeforeSave: false });
          }
        })
        .catch((err) =>
          console.error("[logout] Failed to clear token:", err.message),
        );
    }

    clearRefreshTokenCookie(res);
    return successResponse(res, 200, "Logged out successfully");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return successResponse(
        res,
        200,
        "If that email exists, a reset link has been sent.",
      );

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user, resetToken);

    await sendNotification(
      user._id,
      "security",
      "Password Reset Requested",
      "You requested a password reset. If this wasn't you, please contact support immediately.",
      { userId: user._id },
      "/forgot-password",
    );

    // Send admin notification for password reset request
    await sendAdminNotification(
      "security",
      "Password Reset Request",
      `${user.firstName} ${user.lastName} (${user.email}) requested a password reset.`,
      { userId: user._id, email: user.email },
      "/admin/users/" + user._id,
      user._id,
      "User",
    );
    return successResponse(
      res,
      200,
      "If that email exists, a reset link has been sent.",
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires +refreshTokens");

    if (!user) return errorResponse(res, 400, "Invalid or expired reset token");

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = [];
    await user.save();

    clearRefreshTokenCookie(res);

    await sendNotification(
      user._id,
      "security",
      "Password Reset Successful",
      "Your password has been successfully reset. Please log in with your new password.",
      { userId: user._id },
      "/login",
    );

    await sendAdminNotification(
      "security",
      "Password Reset Completed",
      `${user.firstName} ${user.lastName} (${user.email}) successfully reset their password.`,
      { userId: user._id, email: user.email },
      "/admin/users/" + user._id,
      user._id,
      "User",
    );
    return successResponse(
      res,
      200,
      "Password reset successfully. Please log in.",
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const setup2FA = async (req, res) => {
  try {
    const totp = generateTOTPSecret(req.user);
    const secret = totp.secret.base32;
    const qr = await generateQRCode(totp.toString());
    await User.findByIdAndUpdate(req.user._id, { twoFactorSecret: secret });
    return successResponse(res, 200, "2FA setup initiated", {
      secret,
      qrCode: qr,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const enable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+twoFactorSecret");
    if (!user.twoFactorSecret)
      return errorResponse(res, 400, "Please set up 2FA first");

    const valid = verifyTOTPToken(user.twoFactorSecret, req.body.token);
    if (!valid) return errorResponse(res, 400, "Invalid verification code");

    user.twoFactorEnabled = true;
    await user.save({ validateBeforeSave: false });

    // Respond immediately
    successResponse(res, 200, "2FA enabled successfully");

    // Fire and forget
    sendNotification(
      user._id,
      "security",
      "2FA Enabled",
      "Two-Factor Authentication has been enabled on your account for added security.",
      { userId: user._id },
      "/profile/security",
    ).catch(() => {});

    sendAdminNotification(
      "security",
      "2FA Enabled",
      `${user.firstName} ${user.lastName} (${user.email}) enabled Two-Factor Authentication.`,
      { userId: user._id, email: user.email },
      "/admin/users/" + user._id,
      user._id,
      "User",
    ).catch(() => {});
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+twoFactorSecret +password");
    if (!(await user.comparePassword(req.body.password)))
      return errorResponse(res, 401, "Incorrect password");

    user.twoFactorEnabled = false;
    user.twoFactorSecret  = undefined;
    await user.save({ validateBeforeSave: false });

    // Respond immediately
    successResponse(res, 200, "2FA disabled successfully");

    // Fire and forget
    sendNotification(user._id, "security", "2FA Disabled",
      "Two-Factor Authentication has been disabled on your account.",
      { userId: user._id }, "/profile/security"
    ).catch(() => {});

    sendAdminNotification("security", "2FA Disabled",
      `${user.firstName} ${user.lastName} (${user.email}) disabled Two-Factor Authentication.`,
      { userId: user._id, email: user.email },
      "/admin/users/" + user._id, user._id, "User"
    ).catch(() => {});

  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const resendVerification = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return successResponse(
        res,
        200,
        "If that email exists, a verification link has been sent.",
      );
    if (user.isEmailVerified)
      return errorResponse(
        res,
        400,
        "This email is already verified. Please log in.",
      );

    const verifyToken = crypto.randomBytes(32).toString("hex");
    user.emailVerifyToken = crypto
      .createHash("sha256")
      .update(verifyToken)
      .digest("hex");
    user.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user, verifyToken);

    await sendNotification(
      user._id,
      "security",
      "Verification Email Sent",
      "A new verification email has been sent to your inbox. Please check your email.",
      { userId: user._id },
      "/verify-email",
    );

    // Send admin notification for resend verification
    await sendAdminNotification(
      "user",
      "Verification Email Resent",
      `${user.firstName} ${user.lastName} (${user.email}) requested a new verification email.`,
      { userId: user._id, email: user.email },
      "/admin/users/" + user._id,
      user._id,
      "User",
    );

    return successResponse(
      res,
      200,
      "Verification email sent. Check your inbox.",
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};
