// frontend/src/pages/user/TwoFactorPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  ShieldOff,
  Copy,
  Eye,
  EyeOff,
  CheckCircle,
  Loader,
  Smartphone,
  Key,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import api from "../../services/apiService";
import { useTranslation } from "react-i18next";

export default function TwoFactorPage() {
  const { darkMode } = useTheme();
  const { user, setUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 2FA state
  const [twoFAStep, setTwoFAStep] = useState("idle"); // idle | setup | verify | disable
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [disablePw, setDisablePw] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAMsg, setTwoFAMsg] = useState(null);
  const [twoFAEnabled, setTwoFAEnabled] = useState(
    user?.twoFactorEnabled || false,
  );

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  const iStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${border}`,
    background: inputBg,
    color: textClr,
    fontSize: "0.88rem",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const labelStyle = {
    color: muted,
    fontSize: "0.7rem",
    fontWeight: 700,
    display: "block",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const handle2FASetup = async () => {
    setTwoFALoading(true);
    setTwoFAMsg(null);
    setTwoFAStep("setup");
    try {
      const res = await api.post("/auth/2fa/setup");
      setQrCode(res.data?.data?.qrCode);
      setSecret(res.data?.data?.secret);
      setTwoFAStep("verify");
    } catch (err) {
      setTwoFAMsg({
        text: err.response?.data?.message || t("setup_failed"),
        type: "error",
      });
      setTwoFAStep("idle");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handle2FAEnable = async () => {
    if (!totpToken || totpToken.length < 6) {
      setTwoFAMsg({
        text: t("enter_6_digit_code"),
        type: "error",
      });
      return;
    }
    setTwoFALoading(true);
    setTwoFAMsg(null);
    try {
      await api.post("/auth/2fa/enable", { token: totpToken });
      setTwoFAEnabled(true);
      setTwoFAStep("idle");
      setTotpToken("");
      setQrCode("");
      setSecret("");
      setTwoFAMsg({
        text: t("2fa_enabled_success"),
        type: "success",
      });
      // Update user context
      if (setUser) {
        setUser({ ...user, twoFactorEnabled: true });
      }
    } catch (err) {
      setTwoFAMsg({
        text: err.response?.data?.message || t("invalid_code_try_again"),
        type: "error",
      });
    } finally {
      setTwoFALoading(false);
    }
  };

  const handle2FADisable = async () => {
    if (!disablePw) {
      setTwoFAMsg({
        text: t("enter_password_to_disable"),
        type: "error",
      });
      return;
    }
    setTwoFALoading(true);
    setTwoFAMsg(null);
    try {
      await api.post("/auth/2fa/disable", { password: disablePw });
      setTwoFAEnabled(false);
      setTwoFAStep("idle");
      setDisablePw("");
      setTwoFAMsg({
        text: t("2fa_disabled_success"),
        type: "success",
      });
      // Update user context
      if (setUser) {
        setUser({ ...user, twoFactorEnabled: false });
      }
    } catch (err) {
      setTwoFAMsg({
        text: err.response?.data?.message || t("incorrect_password"),
        type: "error",
      });
    } finally {
      setTwoFALoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setTwoFAMsg({ text: t("secret_copied"), type: "success" });
    setTimeout(() => setTwoFAMsg(null), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <DashboardNav />

      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "80px 16px 120px",
          animation: "fadeUp 0.3s ease",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
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
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 6,
            }}
          >
            {twoFAEnabled ? (
              <ShieldCheck
                style={{ width: 28, height: 28, color: "#34d399" }}
              />
            ) : (
              <Shield style={{ width: 28, height: 28, color: muted }} />
            )}
            <h1
              style={{
                fontFamily: '"Playfair Display",serif',
                fontWeight: 800,
                fontSize: "clamp(1.3rem,4vw,1.8rem)",
                color: textClr,
                margin: 0,
              }}
            >
              {t("two_factor_authentication")}
            </h1>
          </div>
          <p style={{ color: muted, fontSize: "0.875rem", margin: 0 }}>
            {twoFAEnabled
              ? t("2fa_active_description")
              : t("2fa_inactive_description")}
          </p>
        </div>

        {/* 2FA Status Card */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${twoFAEnabled ? "rgba(52,211,153,0.3)" : border}`,
            borderRadius: 20,
            padding: "24px",
            marginBottom: 16,
          }}
        >
          {/* Feedback message */}
          {twoFAMsg && (
            <div
              style={{
                marginBottom: 16,
                padding: "10px 14px",
                borderRadius: 9,
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                gap: 7,
                background:
                  twoFAMsg.type === "error"
                    ? "rgba(248,113,113,0.1)"
                    : "rgba(52,211,153,0.1)",
                border:
                  twoFAMsg.type === "error"
                    ? "1px solid rgba(248,113,113,0.25)"
                    : "1px solid rgba(52,211,153,0.25)",
                color: twoFAMsg.type === "error" ? "#f87171" : "#34d399",
              }}
            >
              <CheckCircle style={{ width: 14, height: 14 }} />
              {twoFAMsg.text}
            </div>
          )}

          {/* IDLE state — not enabled */}
          {twoFAStep === "idle" && !twoFAEnabled && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: "rgba(245,158,11,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Smartphone
                      style={{ width: 20, height: 20, color: "#f59e0b" }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        color: textClr,
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      {t("how_it_works")}
                    </div>
                    <div
                      style={{
                        color: muted,
                        fontSize: "0.8rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {t("2fa_how_it_works")}{" "}
                      <strong style={{ color: textClr }}>
                        {t("google_authenticator")}
                      </strong>{" "}
                      {t("or")}{" "}
                      <strong style={{ color: textClr }}>{t("authy")}</strong>{" "}
                      {t("to_generate_codes")}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    color: muted,
                    fontSize: "0.75rem",
                    marginBottom: 20,
                  }}
                >
                  {t("2fa_benefit_description")}
                </div>
              </div>
              <button
                onClick={handle2FASetup}
                disabled={twoFALoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg,#d97706,#f59e0b)",
                  color: "#020617",
                  fontWeight: 800,
                  cursor: twoFALoading ? "not-allowed" : "pointer",
                  opacity: twoFALoading ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {twoFALoading ? (
                  <>
                    <Loader
                      style={{
                        width: 15,
                        height: 15,
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    {t("setting_up_dots")}
                  </>
                ) : (
                  <>
                    <Shield style={{ width: 15, height: 15 }} />
                    {t("enable_two_factor")}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Loading UI */}
          {twoFAStep === "setup" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "40px 0",
                gap: 16,
              }}
            >
              <Loader
                style={{
                  width: 32,
                  height: 32,
                  color: "#f59e0b",
                  animation: "spin 1s linear infinite",
                }}
              />
              <div style={{ color: muted, fontSize: "0.85rem" }}>
                {t("generating_qr_code")}
              </div>
            </div>
          )}

          {/* VERIFY state — show QR + enter code */}
          {twoFAStep === "verify" && (
            <div>
              <p
                style={{ color: muted, fontSize: "0.82rem", marginBottom: 16 }}
              >
                {t("scan_qr_instructions")}
              </p>

              {/* QR Code */}
              {qrCode && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      padding: 16,
                      background: "#ffffff",
                      borderRadius: 16,
                      display: "inline-block",
                    }}
                  >
                    <img
                      src={qrCode}
                      alt="2FA QR Code"
                      style={{ width: 180, height: 180, display: "block" }}
                    />
                  </div>
                </div>
              )}

              {/* Manual secret */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>{t("manual_entry_key")}</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1px solid ${border}`,
                      background: inputBg,
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      color: textClr,
                      letterSpacing: "0.08em",
                      wordBreak: "break-all",
                    }}
                  >
                    {showSecret ? secret : secret.replace(/./g, "•")}
                  </div>
                  <button
                    onClick={() => setShowSecret((s) => !s)}
                    style={{
                      padding: "10px",
                      borderRadius: 10,
                      border: `1px solid ${border}`,
                      background: "transparent",
                      cursor: "pointer",
                      color: muted,
                      display: "flex",
                    }}
                  >
                    {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={copySecret}
                    style={{
                      padding: "10px",
                      borderRadius: 10,
                      border: `1px solid ${border}`,
                      background: "transparent",
                      cursor: "pointer",
                      color: muted,
                      display: "flex",
                    }}
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <div
                  style={{ color: muted, fontSize: "0.68rem", marginTop: 4 }}
                >
                  {t("manual_entry_hint")}
                </div>
              </div>

              {/* TOTP input */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>{t("verification_code")}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={totpToken}
                  onChange={(e) =>
                    setTotpToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  style={{
                    ...iStyle,
                    textAlign: "center",
                    letterSpacing: "0.3em",
                    fontSize: "1.4rem",
                    fontFamily: "monospace",
                    fontWeight: 700,
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgba(245,158,11,0.5)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = border)}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <button
                  onClick={() => {
                    setTwoFAStep("idle");
                    setTotpToken("");
                    setQrCode("");
                    setSecret("");
                    setTwoFAMsg(null);
                  }}
                  style={{
                    padding: "11px",
                    borderRadius: 12,
                    border: `1px solid ${border}`,
                    background: "transparent",
                    color: textClr,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handle2FAEnable}
                  disabled={twoFALoading || totpToken.length < 6}
                  style={{
                    padding: "11px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg,#d97706,#f59e0b)",
                    color: "#020617",
                    fontWeight: 700,
                    cursor:
                      twoFALoading || totpToken.length < 6
                        ? "not-allowed"
                        : "pointer",
                    opacity: twoFALoading || totpToken.length < 6 ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {twoFALoading ? (
                    <>
                      <Loader
                        style={{
                          width: 14,
                          height: 14,
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      {t("verifying_dots")}
                    </>
                  ) : (
                    <>
                      <ShieldCheck style={{ width: 14, height: 14 }} />
                      {t("confirm_and_enable")}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ENABLED state */}
          {twoFAStep === "idle" && twoFAEnabled && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "rgba(52,211,153,0.06)",
                  border: "1px solid rgba(52,211,153,0.15)",
                  marginBottom: 16,
                }}
              >
                <ShieldCheck
                  style={{
                    width: 20,
                    height: 20,
                    color: "#34d399",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{
                      color: "#34d399",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    {t("2fa_is_active")}
                  </div>
                  <div style={{ color: muted, fontSize: "0.72rem" }}>
                    {t("2fa_active_description")}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setTwoFAStep("disable");
                  setTwoFAMsg(null);
                }}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: 12,
                  border: "1px solid rgba(248,113,113,0.3)",
                  background: "rgba(248,113,113,0.06)",
                  color: "#f87171",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <ShieldOff style={{ width: 14, height: 14 }} />
                {t("disable_two_factor")}
              </button>
            </div>
          )}

          {/* DISABLE confirm */}
          {twoFAStep === "disable" && (
            <div>
              <p
                style={{ color: muted, fontSize: "0.82rem", marginBottom: 14 }}
              >
                {t("disable_2fa_warning")}
              </p>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>{t("your_password")}</label>
                <input
                  type="password"
                  value={disablePw}
                  onChange={(e) => setDisablePw(e.target.value)}
                  placeholder={t("enter_current_password")}
                  style={iStyle}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgba(248,113,113,0.5)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = border)}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <button
                  onClick={() => {
                    setTwoFAStep("idle");
                    setDisablePw("");
                    setTwoFAMsg(null);
                  }}
                  style={{
                    padding: "11px",
                    borderRadius: 12,
                    border: `1px solid ${border}`,
                    background: "transparent",
                    color: textClr,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handle2FADisable}
                  disabled={twoFALoading || !disablePw}
                  style={{
                    padding: "11px",
                    borderRadius: 12,
                    background: "rgba(248,113,113,0.15)",
                    color: "#f87171",
                    fontWeight: 700,
                    cursor:
                      twoFALoading || !disablePw ? "not-allowed" : "pointer",
                    opacity: twoFALoading || !disablePw ? 0.6 : 1,
                    border: "1px solid rgba(248,113,113,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {twoFALoading ? (
                    <>
                      <Loader
                        style={{
                          width: 14,
                          height: 14,
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      {t("disabling_dots")}
                    </>
                  ) : (
                    <>
                      <ShieldOff style={{ width: 14, height: 14 }} />
                      {t("disable_2fa")}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
