import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import authService from "../../services/authService";

export default function ResetPassword() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.97)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const subClr = darkMode ? "#64748b" : "#94a3b8";
  const inputBg = darkMode ? "rgba(15,23,42,0.6)" : "rgba(248,250,252,0.9)";
  const border = "rgba(245,158,11,0.25)";

  const inputStyle = {
    width: "100%",
    background: inputBg,
    border: `1px solid ${border}`,
    borderRadius: 12,
    padding: "10px 42px 10px 38px",
    color: darkMode ? "#f1f5f9" : "#0f172a",
    fontSize: "0.875rem",
    outline: "none",
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(t("invalid_reset_link"));
      return;
    }
    if (password.length < 8) {
      setError(t("password_min_8_characters"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("passwords_do_not_match"));
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || t("reset_link_invalid_expired"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        transition: "background 0.3s",
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          marginBottom: 40,
        }}
      >
        <div
          className="gold-btn"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrendingUp style={{ width: 20, height: 20, color: "#020617" }} />
        </div>
        <span
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.2rem",
            color: textClr,
          }}
        >
          Axion<span className="gold-text">Trade</span>
        </span>
      </Link>

      {/* Card */}
      <div
        style={{
          background: cardBg,
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 24,
          padding: "40px 36px",
          maxWidth: 440,
          width: "100%",
          boxShadow: darkMode
            ? "0 20px 60px rgba(0,0,0,0.3)"
            : "0 20px 60px rgba(0,0,0,0.08)",
        }}
      >
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(52,211,153,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <CheckCircle
                style={{ width: 36, height: 36, color: "#34d399" }}
              />
            </div>
            <h2
              style={{
                fontFamily: '"Playfair Display",serif',
                fontWeight: 700,
                fontSize: "1.6rem",
                color: textClr,
                marginBottom: 10,
              }}
            >
              {t("password_reset")}
            </h2>
            <p
              style={{
                color: subClr,
                fontSize: "0.9rem",
                lineHeight: 1.6,
                marginBottom: 32,
              }}
            >
              {t("password_reset_success")}
            </p>
            <Link
              to="/login"
              className="gold-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 32px",
                borderRadius: 14,
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: 700,
              }}
            >
              {t("sign_in_now")}{" "}
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        ) : (
          <>
            <h2
              style={{
                fontFamily: '"Playfair Display",serif',
                fontWeight: 700,
                fontSize: "1.6rem",
                color: textClr,
                marginBottom: 6,
              }}
            >
              {t("reset_password")}
            </h2>
            <p
              style={{ color: subClr, fontSize: "0.875rem", marginBottom: 28 }}
            >
              {t("enter_new_password_below")}
            </p>

            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <p
                  style={{
                    color: "#f87171",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </p>
                <button
                  onClick={() => setError("")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#f87171",
                    padding: 0,
                    flexShrink: 0,
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
              {/* New password */}
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
                  {t("new_password")}
                </label>
                <div style={{ position: "relative" }}>
                  <Lock style={iconStyle} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    style={inputStyle}
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

              {/* Confirm password */}
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
                  {t("confirm_new_password")}
                </label>
                <div style={{ position: "relative" }}>
                  <Lock style={iconStyle} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("repeat_new_password")}
                    required
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#f59e0b";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = border;
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
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
                    {showConfirm ? (
                      <EyeOff style={{ width: 15, height: 15 }} />
                    ) : (
                      <Eye style={{ width: 15, height: 15 }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Password strength hint */}
              <ul
                style={{
                  padding: "0 0 0 4px",
                  margin: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {[
                  {
                    label: t("at_least_8_characters"),
                    met: password.length >= 8,
                  },
                  { label: t("contains_number"), met: /\d/.test(password) },
                  {
                    label: t("contains_letter"),
                    met: /[a-zA-Z]/.test(password),
                  },
                ].map((rule) => (
                  <li
                    key={rule.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "0.75rem",
                      color: rule.met ? "#34d399" : subClr,
                    }}
                  >
                    <span style={{ fontSize: "0.65rem" }}>
                      {rule.met ? "✓" : "○"}
                    </span>
                    {rule.label}
                  </li>
                ))}
              </ul>

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
                    {t("reset_password_btn")}{" "}
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>
            </form>

            <p
              style={{
                textAlign: "center",
                marginTop: 20,
                color: subClr,
                fontSize: "0.82rem",
              }}
            >
              {t("remember_password")}{" "}
              <Link
                to="/login"
                style={{
                  color: "#f59e0b",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {t("sign_in")}
              </Link>
            </p>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
