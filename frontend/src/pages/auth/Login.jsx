import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  TrendingUp,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { AuthHeader, AuthFooter } from "../../components/AuthLayout";
import authService from "../../services/authService";

export default function Login() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { darkMode, setDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [error, setError] = useState("");

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.75)" : "rgba(255,255,255,0.97)";
  const headClr = darkMode ? "#f1f5f9" : "#0f172a";
  const subClr = darkMode ? "#475569" : "#64748b";
  const inputBg = darkMode ? "rgba(15,23,42,0.6)" : "rgba(248,250,252,0.9)";
  const border = "rgba(245,158,11,0.25)";
  const leftBg = darkMode
    ? "radial-gradient(ellipse at 30% 50%, #1a0e00 0%, #020617 65%)"
    : "linear-gradient(135deg, #fffbeb 0%, #f1f5f9 100%)";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password, needs2FA ? totp : null);
      if (res?.requires2FA) {
        setNeeds2FA(true);
        setLoading(false);
        return;
      }
      const role = res?.user?.role;
      if (role === "superadmin" || role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || t("invalid_credentials"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await authService.resendVerification(email);
      setError(t("verification_email_resent"));
    } catch (err) {
      setError(err.response?.data?.message || t("could_not_resend_email"));
    }
  };

  const inputStyle = (hasError = false) => ({
    width: "100%",
    background: inputBg,
    border: `1px solid ${hasError ? "#ef4444" : border}`,
    borderRadius: 12,
    padding: "10px 13px 10px 38px",
    color: darkMode ? "#f1f5f9" : "#0f172a",
    fontSize: "0.875rem",
    outline: "none",
  });

  const iconStyle = {
    position: "absolute",
    left: 13,
    top: "50%",
    transform: "translateY(-50%)",
    width: 15,
    height: 15,
    color: "#94a3b8",
    pointerEvents: "none",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBg,
        display: "flex",
        flexDirection: "column",
        transition: "background 0.3s",
      }}
    >
      <AuthHeader />

      <div style={{ flex: 1, display: "flex", paddingTop: 64 }}>
        {/* Left branding */}
        <div
          className="hidden lg:flex"
          style={{
            width: "45%",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px",
            background: leftBg,
            position: "relative",
            overflow: "hidden",
            transition: "background 0.3s",
          }}
        >
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "30%",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "rgba(245,158,11,0.07)",
              filter: "blur(70px)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              className="gold-btn"
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <TrendingUp style={{ width: 28, height: 28, color: "#020617" }} />
            </div>
            <h2
              style={{
                fontFamily: '"Playfair Display",serif',
                fontWeight: 900,
                fontSize: "clamp(2rem,3.5vw,2.8rem)",
                color: headClr,
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
              {t("welcome_back_to")}
              <br />
              <span className="gold-text">AxionTradeX.</span>
            </h2>
            <p
              style={{
                color: darkMode ? "#64748b" : "#64748b",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                maxWidth: 320,
                marginBottom: 40,
              }}
            >
              {t("login_description")}
            </p>
            {[
              t("real_time_market_data"),
              t("ai_powered_signals"),
              t("secure_2fa"),
              t("instant_deposits_withdrawals"),
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#f59e0b",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    color: darkMode ? "#94a3b8" : "#64748b",
                    fontSize: "0.875rem",
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 24px",
          }}
        >
          <div style={{ width: "100%", maxWidth: 420 }}>
            <div
              style={{
                background: cardBg,
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 24,
                padding: "32px 28px",
                backdropFilter: "blur(20px)",
                boxShadow: darkMode
                  ? "0 20px 60px rgba(0,0,0,0.3)"
                  : "0 20px 60px rgba(0,0,0,0.08)",
                transition: "background 0.3s",
              }}
            >
              <h3
                style={{
                  fontFamily: '"Playfair Display",serif',
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: headClr,
                  marginBottom: 4,
                }}
              >
                {needs2FA ? t("two_factor_auth") : t("sign_in")}
              </h3>
              <p
                style={{ color: subClr, fontSize: "0.82rem", marginBottom: 24 }}
              >
                {needs2FA ? t("enter_2fa_code") : t("enter_credentials")}
              </p>

              {error && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: 12,
                    padding: "12px 16px",
                    marginBottom: 18,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        color: "#f87171",
                        fontSize: "0.85rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {error}
                    </p>
                    {error.includes("verify your email") && (
                      <button
                        onClick={handleResendVerification}
                        style={{
                          color: "#f59e0b",
                          background: "none",
                          border: "none",
                          fontSize: "0.78rem",
                          cursor: "pointer",
                          marginTop: 6,
                          padding: 0,
                          textDecoration: "underline",
                        }}
                      >
                        {t("resend_verification_email")}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setError("")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#f87171",
                      padding: 0,
                      flexShrink: 0,
                      fontSize: "1rem",
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {!needs2FA ? (
                  <>
                    {/* Email */}
                    <div>
                      <label
                        style={{
                          color: darkMode ? "#94a3b8" : "#475569",
                          fontSize: "0.78rem",
                          fontWeight: 500,
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        {t("email_address")}
                      </label>
                      <div style={{ position: "relative" }}>
                        <Mail style={iconStyle} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          required
                          style={inputStyle()}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#f59e0b";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = border;
                          }}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <label
                          style={{
                            color: darkMode ? "#94a3b8" : "#475569",
                            fontSize: "0.78rem",
                            fontWeight: 500,
                          }}
                        >
                          {t("password")}
                        </label>
                        <Link
                          to="/forgot-password"
                          style={{
                            color: "#f59e0b",
                            fontSize: "0.75rem",
                            textDecoration: "none",
                          }}
                        >
                          {t("forgot_password_link")}
                        </Link>
                      </div>
                      <div style={{ position: "relative" }}>
                        <Lock style={iconStyle} />
                        <input
                          type={showPass ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Your password"
                          required
                          style={{ ...inputStyle(), paddingRight: 42 }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#f59e0b";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = border;
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass((s) => !s)}
                          style={{
                            position: "absolute",
                            right: 13,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#94a3b8",
                            padding: 0,
                          }}
                        >
                          {showPass ? (
                            <EyeOff style={{ width: 15, height: 15 }} />
                          ) : (
                            <Eye style={{ width: 15, height: 15 }} />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* 2FA code input */
                  <div>
                    <label
                      style={{
                        color: darkMode ? "#94a3b8" : "#475569",
                        fontSize: "0.78rem",
                        fontWeight: 500,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      {t("authenticator_code")}
                    </label>
                    <input
                      type="text"
                      value={totp}
                      onChange={(e) =>
                        setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="000000"
                      maxLength={6}
                      style={{
                        width: "100%",
                        background: inputBg,
                        border: `1px solid ${border}`,
                        borderRadius: 12,
                        padding: "12px",
                        color: darkMode ? "#f1f5f9" : "#0f172a",
                        fontSize: "1.4rem",
                        fontFamily: "monospace",
                        textAlign: "center",
                        outline: "none",
                        letterSpacing: 8,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#f59e0b";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = border;
                      }}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="gold-btn"
                  style={{
                    padding: "13px",
                    borderRadius: 14,
                    border: "none",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    opacity: loading ? 0.8 : 1,
                    marginTop: 4,
                  }}
                >
                  {loading ? (
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        border: "2px solid #020617",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                  ) : (
                    <>
                      {needs2FA ? t("verify_code") : t("sign_in")}{" "}
                      <ArrowRight style={{ width: 16, height: 16 }} />
                    </>
                  )}
                </button>

                {needs2FA && (
                  <button
                    type="button"
                    onClick={() => {
                      setNeeds2FA(false);
                      setTotp("");
                      setError("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: subClr,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    ← {t("back_to_login")}
                  </button>
                )}
              </form>

              <p
                style={{
                  textAlign: "center",
                  marginTop: 20,
                  color: subClr,
                  fontSize: "0.82rem",
                }}
              >
                {t("no_account")}{" "}
                <Link
                  to="/register"
                  style={{
                    color: "#f59e0b",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  {t("create_one_free")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <AuthFooter />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
