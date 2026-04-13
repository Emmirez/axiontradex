import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ArrowUpCircle,
  Shield,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import DashboardNav from "./DashboardNav";
import { useTranslation } from "react-i18next";
import BottomNav from "./BottomNav";
import api from "../../services/apiService";

//  Coin config
const COINS = [
  {
    id: "USDT",
    labelKey: "tether_usdt",
    color: "#26a17b",
    image: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    networks: [
      { id: "TRC20", label: "TRC20 (Tron)", fee: 1, minWithdraw: 10 },
      { id: "ERC20", label: "ERC20 (Ethereum)", fee: 5, minWithdraw: 20 },
      { id: "BEP20", label: "BEP20 (BSC)", fee: 0.5, minWithdraw: 10 },
    ],
  },
  {
    id: "BTC",
    labelKey: "bitcoin_btc",
    color: "#f7931a",
    image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    networks: [
      { id: "BTC", label: "Bitcoin Network", fee: 0.0001, minWithdraw: 0.001 },
    ],
  },
  {
    id: "ETH",
    labelKey: "ethereum_eth",
    color: "#627eea",
    image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    networks: [
      { id: "ERC20", label: "ERC20 (Ethereum)", fee: 0.002, minWithdraw: 0.01 },
      { id: "BEP20", label: "BEP20 (BSC)", fee: 0.0005, minWithdraw: 0.005 },
    ],
  },
  {
    id: "BNB",
    labelKey: "bnb",
    color: "#f0b90b",
    image:
      "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    networks: [
      { id: "BEP20", label: "BEP20 (BSC)", fee: 0.001, minWithdraw: 0.01 },
    ],
  },
  {
    id: "SOL",
    labelKey: "solana_sol",
    color: "#9945ff",
    image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    networks: [
      { id: "SOL", label: "Solana Network", fee: 0.01, minWithdraw: 0.1 },
    ],
  },
];

export default function WithdrawPage() {
  const { darkMode } = useTheme();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1); // 1=form, 2=confirm, 3=success
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const [selectedNetwork, setSelectedNetwork] = useState(COINS[0].networks[0]);
  const [coinDropdown, setCoinDropdown] = useState(false);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");

  // theme
  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";

  const balances = {
    USD: user?.wallet?.balances?.USD || 0,
    USDT:
      (user?.wallet?.balances?.USDT || 0) + (user?.wallet?.balances?.USD || 0),
    BTC: user?.wallet?.balances?.BTC || 0,
    ETH: user?.wallet?.balances?.ETH || 0,
    BNB: user?.wallet?.balances?.BNB || 0,
    SOL: user?.wallet?.balances?.SOL || 0,
  };
  const availBalance =
    selectedCoin.id === "USDT"
      ? balances.USDT || 0
      : balances[selectedCoin.id] || 0;
  const fee = selectedNetwork.fee;
  const amt = parseFloat(amount) || 0;
  const youReceive = Math.max(0, amt - fee);

  // KYC check
  const kycApproved = user?.kyc?.status === "approved";

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
    setSelectedNetwork(coin.networks[0]);
    setCoinDropdown(false);
    setAmount("");
    setError("");
    setOtp("");
    setOtpSent(false);
    setOtpError("");
  };

  const setMaxAmount = () => {
    const max = Math.max(0, availBalance - fee);
    setAmount(max.toFixed(selectedCoin.id === "USDT" ? 2 : 6));
  };

  const validateForm = () => {
    if (!kycApproved) {
      setError(t("kyc_required_to_withdraw"));
      return false;
    }
    if (!amt || amt <= 0) {
      setError(t("enter_valid_amount"));
      return false;
    }
    if (amt < selectedNetwork.minWithdraw) {
      setError(
        t("min_withdrawal_error", {
          amount: selectedNetwork.minWithdraw,
          coin: selectedCoin.id,
        }),
      );
      return false;
    }
    if (amt > availBalance) {
      setError(
        t("insufficient_balance_error", {
          coin: selectedCoin.id,
          balance: availBalance,
        }),
      );
      return false;
    }
    if (!address.trim()) {
      setError(t("address_required"));
      return false;
    }
    if (address.trim().length < 20) {
      setError(t("valid_address_required"));
      return false;
    }
    setError("");
    return true;
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (validateForm()) setStep(2);
  };

  const handleSendOtp = async () => {
    setOtpSending(true);
    setOtpError("");
    try {
      await api.post("/wallet/withdraw/send-otp", {
        amount: amt,
        currency: selectedCoin.id,
        network: selectedNetwork.id,
        address: address.trim(),
      });
      setOtpSent(true);
    } catch (err) {
      setOtpError(
        err.response?.data?.message || "Failed to send code. Try again.",
      );
    } finally {
      setOtpSending(false);
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/wallet/withdraw", {
        amount: amt,
        currency: selectedCoin.id,
        network: selectedNetwork.id,
        address: address.trim(),
        otp,
      });

      // Optimistically deduct from the correct coin balance
      if (updateUser) {
        const newBalances = {
          ...user.wallet.balances,
          [selectedCoin.id]: Math.max(0, availBalance - amt),
        };
        updateUser({ wallet: { ...user.wallet, balances: newBalances } });
      }

      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          t("withdrawal_failed_withdraw"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Success
  if (step === 3) {
    return (
      <div style={{ minHeight: "100vh", background: pageBg }}>
        <DashboardNav />
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            padding: "100px 20px 120px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(52,211,153,0.15)",
              border: "2px solid #34d399",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <CheckCircle style={{ width: 32, height: 32, color: "#34d399" }} />
          </div>
          <h2
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 800,
              fontSize: "1.6rem",
              color: textClr,
              marginBottom: 10,
            }}
          >
            {t("withdrawal_submitted")}
          </h2>
          <p
            style={{
              color: muted,
              fontSize: "0.9rem",
              lineHeight: 1.6,
              marginBottom: 28,
            }}
          >
            {t("withdrawal_submitted_message", {
              amount,
              coin: selectedCoin.id,
            })}
          </p>
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 14,
              padding: "16px 20px",
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            {[
              { label: t("amount"), value: `${amount} ${selectedCoin.id}` },
              { label: t("network_fee"), value: `${fee} ${selectedCoin.id}` },
              {
                label: t("you_receive"),
                value: `${youReceive.toFixed(6)} ${selectedCoin.id}`,
              },
              { label: t("network"), value: selectedNetwork.label },
              {
                label: t("to_address"),
                value: `${address.slice(0, 12)}...${address.slice(-8)}`,
              },
              {
                label: t("status"),
                value: t("pending_processing"),
                color: "#f59e0b",
              },
            ].map((r) => (
              <div
                key={r.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: `1px solid ${divLine}`,
                }}
              >
                <span style={{ color: muted, fontSize: "0.82rem" }}>
                  {r.label}
                </span>
                <span
                  style={{
                    color: r.color || textClr,
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    fontFamily:
                      r.label.includes(t("to_address")) ||
                      r.label.includes(t("amount"))
                        ? "monospace"
                        : "inherit",
                  }}
                >
                  {r.value}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => {
                setStep(1);
                setAmount("");
                setAddress("");
                setOtp("");
                setOtpSent(false);
                setOtpError("");
              }}
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                border: `1px solid ${border}`,
                background: "transparent",
                color: textClr,
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("new_withdrawal")}
            </button>
            <Link
              to="/dashboard"
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                background: "linear-gradient(135deg,#d97706,#f59e0b)",
                color: "#020617",
                fontSize: "0.85rem",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              {t("back_to_dashboard")}
            </Link>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  //  Confirm step
  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", background: pageBg }}>
        <DashboardNav />
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            padding: "80px 20px 120px",
            textAlign: "center",
          }}
        >
          <button
            onClick={() => {
              setStep(1);
              setOtp("");
              setOtpSent(false);
              setOtpError("");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              color: muted,
              cursor: "pointer",
              fontSize: "0.82rem",
              marginBottom: 20,
            }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} /> {t("back_to_edit")}
          </button>

          <h1
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 800,
              fontSize: "1.8rem",
              color: textClr,
              marginBottom: 6,
            }}
          >
            {t("confirm_withdrawal")}
          </h1>
          <p style={{ color: muted, fontSize: "0.875rem", marginBottom: 24 }}>
            {t("confirm_withdrawal_subtitle")}
          </p>

          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "22px",
              marginBottom: 16,
            }}
          >
            {[
              {
                label: t("asset"),
                value: t(selectedCoin.labelKey),
                icon: (
                  <img
                    src={selectedCoin.image}
                    width={20}
                    height={20}
                    style={{ borderRadius: "50%" }}
                    alt=""
                  />
                ),
              },
              { label: t("network"), value: selectedNetwork.label },
              {
                label: t("amount"),
                value: `${amount} ${selectedCoin.id}`,
                mono: true,
              },
              {
                label: t("network_fee"),
                value: `- ${fee} ${selectedCoin.id}`,
                color: "#f87171",
                mono: true,
              },
              {
                label: t("you_receive"),
                value: `${youReceive.toFixed(6)} ${selectedCoin.id}`,
                color: "#34d399",
                mono: true,
                bold: true,
              },
              {
                label: t("to_address"),
                value: address,
                mono: true,
                wrap: true,
              },
            ].map((r, i) => (
              <div
                key={r.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "12px 0",
                  borderBottom: i < 5 ? `1px solid ${divLine}` : "none",
                  gap: 12,
                }}
              >
                <span
                  style={{ color: muted, fontSize: "0.82rem", flexShrink: 0 }}
                >
                  {r.label}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    textAlign: "right",
                  }}
                >
                  {r.icon}
                  <span
                    style={{
                      color: r.color || textClr,
                      fontWeight: r.bold ? 800 : 600,
                      fontSize: "0.85rem",
                      fontFamily: r.mono ? "monospace" : "inherit",
                      wordBreak: r.wrap ? "break-all" : "normal",
                    }}
                  >
                    {r.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Warning */}
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(248,113,113,0.07)",
              border: "1px solid rgba(248,113,113,0.2)",
              marginBottom: 20,
            }}
          >
            <AlertTriangle
              style={{
                width: 16,
                height: 16,
                color: "#f87171",
                flexShrink: 0,
                marginTop: 1,
              }}
            />
            <p
              style={{
                color: "#f87171",
                fontSize: "0.78rem",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {t("double_check_warning")}{" "}
              <strong>{t("incorrect_address_warning")}</strong>{" "}
              {t("cannot_be_reversed")}
            </p>
          </div>

          {error && (
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.2)",
                marginBottom: 14,
              }}
            >
              <AlertCircle
                style={{
                  width: 14,
                  height: 14,
                  color: "#f87171",
                  flexShrink: 0,
                }}
              />
              <span style={{ color: "#f87171", fontSize: "0.78rem" }}>
                {error}
              </span>
            </div>
          )}

          {/* OTP Section */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 16,
              padding: "18px 20px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div>
                <div
                  style={{
                    color: textClr,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  {t("email_verification")}
                </div>
                <div
                  style={{ color: muted, fontSize: "0.72rem", marginTop: 2 }}
                >
                  {otpSent
                    ? t("code_sent_to", {
                        email: user?.email?.replace(/(.{2}).+(@.+)/, "$1***$2"),
                      })
                    : t("code_will_be_sent")}
                </div>
              </div>
              <button
                onClick={handleSendOtp}
                disabled={otpSending || (otpSent && !otpError)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    otpSent && !otpError
                      ? "rgba(52,211,153,0.12)"
                      : "linear-gradient(135deg,#d97706,#f59e0b)",
                  color: otpSent && !otpError ? "#34d399" : "#020617",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  cursor:
                    otpSending || (otpSent && !otpError)
                      ? "not-allowed"
                      : "pointer",
                  opacity: otpSending ? 0.7 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {otpSending
                  ? t("sending")
                  : otpSent && !otpError
                    ? t("sent_with_check")
                    : t("send_code")}
              </button>
            </div>

            {otpSent && (
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={t("enter_6_digit_code_email")}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: 10,
                    border: `1px solid ${otp.length === 6 ? "rgba(52,211,153,0.4)" : border}`,
                    background: inputBg,
                    color: textClr,
                    fontSize: "1.1rem",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    letterSpacing: "0.3em",
                    textAlign: "center",
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 6,
                  }}
                >
                  <span style={{ color: muted, fontSize: "0.68rem" }}>
                    {t("code_expires_in")}
                  </span>
                  <button
                    onClick={handleSendOtp}
                    disabled={otpSending}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#f59e0b",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {t("resend")}
                  </button>
                </div>
              </div>
            )}

            {otpError && (
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.2)",
                }}
              >
                <AlertCircle
                  size={13}
                  style={{ color: "#f87171", flexShrink: 0, marginTop: 1 }}
                />
                <span style={{ color: "#f87171", fontSize: "0.75rem" }}>
                  {otpError}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleConfirm}
            disabled={submitting || otp.length !== 6 || !otpSent}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              border: "none",
              background:
                otp.length === 6 && otpSent
                  ? "linear-gradient(135deg,#b91c1c,#ef4444)"
                  : "rgba(255,255,255,0.06)",
              color: otp.length === 6 && otpSent ? "#fff" : muted,
              fontSize: "0.9rem",
              fontWeight: 800,
              cursor:
                submitting || otp.length !== 6 || !otpSent
                  ? "not-allowed"
                  : "pointer",
              opacity: submitting ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
          >
            <ArrowUpCircle style={{ width: 16, height: 16 }} />
            {submitting ? t("processing") : t("confirm_withdrawal_btn")}
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  //  Form step
  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <style>{`
        .wd-input:focus { outline: none; border-color: rgba(245,158,11,0.5) !important; }
        .wd-input { transition: border-color 0.2s; }
        .coin-option:hover { background: rgba(245,158,11,0.08) !important; }
        .net-btn:hover { border-color: rgba(245,158,11,0.5) !important; }
      `}</style>

      <DashboardNav />

      <div
        style={{ maxWidth: 560, margin: "0 auto", padding: "80px 20px 120px" }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            color: muted,
            cursor: "pointer",
            fontSize: "0.82rem",
            marginBottom: 20,
          }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> {t("back")}
        </button>

        <h1
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 800,
            fontSize: "clamp(1.5rem,4vw,2rem)",
            color: textClr,
            marginBottom: 4,
          }}
        >
          {t("withdraw_funds")}
        </h1>
        <p style={{ color: muted, fontSize: "0.875rem", marginBottom: 28 }}>
          {t("withdraw_subtitle")}
        </p>

        {/* KYC Warning */}
        {!kycApproved && (
          <div
            style={{
              display: "flex",
              gap: 10,
              padding: "14px 16px",
              borderRadius: 14,
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.25)",
              marginBottom: 20,
            }}
          >
            <AlertTriangle
              style={{
                width: 18,
                height: 18,
                color: "#f59e0b",
                flexShrink: 0,
                marginTop: 1,
              }}
            />
            <div>
              <div
                style={{
                  color: "#f59e0b",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  marginBottom: 2,
                }}
              >
                {t("kyc_required_title")}
              </div>
              <div style={{ color: muted, fontSize: "0.78rem" }}>
                {t("kyc_required_message")}{" "}
                <Link to="/kyc" style={{ color: "#f59e0b", fontWeight: 600 }}>
                  {t("verify_now")} →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Balance card */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.02))",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: 20,
            padding: "0",
            marginBottom: 24,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Background Image */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "140px",
              height: "100%",
              opacity: 0.15,
              backgroundSize: "cover",
              backgroundPosition: "center",
              pointerEvents: "none",
            }}
          />

          <div
            style={{ padding: "20px 24px", position: "relative", zIndex: 1 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    color: "#f59e0b",
                    fontSize: "0.7rem",
                    letterSpacing: "0.5px",
                    marginBottom: 4,
                    fontWeight: 600,
                  }}
                >
                  {t("available_balance")}
                </div>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
                }}
              >
                <Shield style={{ width: 24, height: 24, color: "#fff" }} />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 8,
              }}
            >
              {Object.entries(balances)
                .filter(([key, v]) => v > 0 && key !== "USD") // Hide USD from chips since it's converted
                .map(([key, val]) => {
                  const coin = COINS.find((c) => c.id === key);
                  return (
                    <div
                      key={key}
                      onClick={() => {
                        if (coin) handleCoinSelect(coin);
                      }}
                      style={{
                        cursor: "pointer",
                        padding: "6px 14px",
                        borderRadius: 30,
                        background:
                          selectedCoin.id === key
                            ? "rgba(245,158,11,0.2)"
                            : darkMode
                              ? "rgba(255,255,255,0.05)"
                              : "rgba(0,0,0,0.04)",
                        border: `1px solid ${selectedCoin.id === key ? "rgba(245,158,11,0.5)" : "rgba(245,158,11,0.15)"}`,
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.2s",
                      }}
                    >
                      {coin && (
                        <img
                          src={coin.image}
                          alt={key}
                          width={18}
                          height={18}
                          style={{ borderRadius: "50%" }}
                        />
                      )}
                      <div>
                        <div
                          style={{
                            color: muted,
                            fontSize: "0.6rem",
                            lineHeight: 1,
                          }}
                        >
                          {key === "USDT" && balances.USD > 0
                            ? "USDT (incl. USD)"
                            : key}
                        </div>
                        <div
                          style={{
                            color:
                              selectedCoin.id === key ? "#f59e0b" : textClr,
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            fontFamily: "monospace",
                          }}
                        >
                          {key === "BTC"
                            ? val.toFixed(4)
                            : key === "ETH"
                              ? val.toFixed(4)
                              : key === "SOL"
                                ? val.toFixed(2)
                                : key === "BNB"
                                  ? val.toFixed(4)
                                  : val.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {Object.values(balances).every((v) => !v) && (
              <div
                style={{ color: muted, fontSize: "0.82rem", padding: "12px 0" }}
              >
                {t("no_balance_available")}
              </div>
            )}
          </div>
        </div>

        {/* USD to USDT Banner */}
        <div
          style={{
            background: darkMode
              ? "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.03))"
              : "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))",
            border: `1px solid rgba(245,158,11,0.25)`,
            borderRadius: 14,
            padding: "14px 18px",
            marginBottom: 20,
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <AlertCircle
            style={{
              width: 18,
              height: 18,
              color: "#f59e0b",
              flexShrink: 0,
              marginTop: 1,
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: "#f59e0b",
                fontWeight: 700,
                fontSize: "0.8rem",
                marginBottom: 4,
              }}
            >
              {t("usd_conversion_title")}
            </div>
            <div style={{ color: muted, fontSize: "0.75rem", lineHeight: 1.5 }}>
              {t("usd_conversion_message")}
              {balances.USD > 0 && (
                <span
                  style={{
                    display: "block",
                    marginTop: 6,
                    color: "#34d399",
                    fontWeight: 500,
                  }}
                >
                  💰 {t("usd_available", { amount: balances.USD.toFixed(2) })}
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleReview}>
          {/* Coin select */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "20px 22px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                color: textClr,
                fontWeight: 700,
                fontSize: "0.875rem",
                marginBottom: 14,
              }}
            >
              {t("select_asset_network")}
            </div>

            <div style={{ position: "relative", marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => setCoinDropdown((o) => !o)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1px solid ${border}`,
                  background: inputBg,
                  cursor: "pointer",
                }}
              >
                <img
                  src={selectedCoin.image}
                  alt={selectedCoin.id}
                  width={28}
                  height={28}
                  style={{ borderRadius: "50%" }}
                />
                <span
                  style={{
                    color: textClr,
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    flex: 1,
                    textAlign: "left",
                  }}
                >
                  {t(selectedCoin.labelKey)}
                </span>
                <ChevronDown
                  style={{
                    width: 14,
                    height: 14,
                    color: muted,
                    transition: "transform 0.2s",
                    transform: coinDropdown ? "rotate(180deg)" : "none",
                  }}
                />
              </button>
              {coinDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    background: darkMode ? "rgba(10,16,35,0.99)" : "#fff",
                    border: `1px solid ${border}`,
                    borderRadius: 14,
                    padding: 6,
                    boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
                  }}
                >
                  {COINS.map((coin) => (
                    <button
                      type="button"
                      key={coin.id}
                      className="coin-option"
                      onClick={() => handleCoinSelect(coin)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "none",
                        background:
                          selectedCoin.id === coin.id
                            ? "rgba(245,158,11,0.1)"
                            : "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src={coin.image}
                        alt={coin.id}
                        width={26}
                        height={26}
                        style={{ borderRadius: "50%" }}
                      />
                      <span
                        style={{
                          color:
                            selectedCoin.id === coin.id ? "#f59e0b" : textClr,
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        {t(coin.labelKey)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCoin.networks.length > 1 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {selectedCoin.networks.map((net) => (
                  <button
                    type="button"
                    key={net.id}
                    className="net-btn"
                    onClick={() => {
                      setSelectedNetwork(net);
                      setOtp("");
                      setOtpSent(false);
                      setOtpError("");
                    }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      border: `1px solid ${selectedNetwork.id === net.id ? selectedCoin.color : border}`,
                      background:
                        selectedNetwork.id === net.id
                          ? `${selectedCoin.color}15`
                          : "transparent",
                      color:
                        selectedNetwork.id === net.id
                          ? selectedCoin.color
                          : muted,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {net.id}
                    <span
                      style={{
                        opacity: 0.7,
                        fontSize: "0.65rem",
                        marginLeft: 4,
                      }}
                    >
                      {t("fee_label")}: {net.fee} {selectedCoin.id}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount + address */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "20px 22px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                color: textClr,
                fontWeight: 700,
                fontSize: "0.875rem",
                marginBottom: 14,
              }}
            >
              {t("withdrawal_details")}
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <label
                  style={{ color: muted, fontSize: "0.75rem", fontWeight: 500 }}
                >
                  {t("amount_label_withdraw", { coin: selectedCoin.id })}
                </label>
                <button
                  type="button"
                  onClick={setMaxAmount}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#f59e0b",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {t("max")}
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  className="wd-input"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 70px 11px 14px",
                    borderRadius: 10,
                    border: `1px solid ${border}`,
                    background: inputBg,
                    color: textClr,
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                    fontFamily: "monospace",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: selectedCoin.color,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                  }}
                >
                  {selectedCoin.id}
                </span>
              </div>
              {/* Fee breakdown */}
              {amt > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 8,
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: inputBg,
                  }}
                >
                  <span style={{ color: muted, fontSize: "0.72rem" }}>
                    {t("network_fee")}: -{fee} {selectedCoin.id}
                  </span>
                  <span
                    style={{
                      color: "#34d399",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                    }}
                  >
                    {t("you_receive")}:{" "}
                    {youReceive > 0 ? youReceive.toFixed(6) : "—"}{" "}
                    {selectedCoin.id}
                  </span>
                </div>
              )}
              <div style={{ color: muted, fontSize: "0.7rem", marginTop: 4 }}>
                {t("min_withdrawal", {
                  amount: selectedNetwork.minWithdraw,
                  coin: selectedCoin.id,
                })}
              </div>
            </div>

            {/* Destination address */}
            <div>
              <label
                style={{
                  color: muted,
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {t("destination_address")}
              </label>
              <input
                className="wd-input"
                type="text"
                placeholder={t("address_placeholder", {
                  coin: selectedCoin.id,
                  network: selectedNetwork.id,
                })}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: `1px solid ${border}`,
                  background: inputBg,
                  color: textClr,
                  fontSize: "0.82rem",
                  boxSizing: "border-box",
                  fontFamily: "monospace",
                }}
              />
              <div style={{ color: muted, fontSize: "0.7rem", marginTop: 4 }}>
                {t("address_network_warning", {
                  network: selectedNetwork.label,
                })}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.2)",
                marginBottom: 14,
              }}
            >
              <AlertCircle
                style={{
                  width: 14,
                  height: 14,
                  color: "#f87171",
                  flexShrink: 0,
                }}
              />
              <span style={{ color: "#f87171", fontSize: "0.78rem" }}>
                {error}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={!kycApproved}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 12,
              border: "none",
              background: kycApproved
                ? "linear-gradient(135deg,#b91c1c,#ef4444)"
                : "rgba(255,255,255,0.1)",
              color: kycApproved ? "#fff" : muted,
              fontSize: "0.9rem",
              fontWeight: 800,
              cursor: kycApproved ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <ArrowUpCircle style={{ width: 15, height: 15 }} />
            {t("review_withdrawal")}
          </button>
        </form>

        {/* Info cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 16,
          }}
        >
          {[
            {
              icon: Clock,
              color: "#f59e0b",
              titleKey: "processing_time",
              textKey: "processing_time_text",
            },
            {
              icon: Shield,
              color: "#34d399",
              titleKey: "kyc_required_short",
              textKey: "kyc_required_text",
            },
          ].map(({ icon: Icon, color, titleKey, textKey }) => (
            <div
              key={titleKey}
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `${color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Icon style={{ width: 15, height: 15, color }} />
              </div>
              <div
                style={{
                  color: textClr,
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  marginBottom: 4,
                }}
              >
                {t(titleKey)}
              </div>
              <div
                style={{ color: muted, fontSize: "0.72rem", lineHeight: 1.5 }}
              >
                {t(textKey)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
