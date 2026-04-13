import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader, TrendingUp } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import authService from "../../services/authService";
import { useTranslation } from "react-i18next";

export default function VerifyEmail() {
  const { darkMode } = useTheme();
  const { token } = useParams();
  const { t } = useTranslation();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    if (!token) {
      setStatus("error");
      setMessage(t("no_verification_token"));
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage(setMessage(t("email_verified_success")));
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.message || t("verification_link_invalid"),
        );
      });
  }, [token]);

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.97)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const subClr = darkMode ? "#64748b" : "#94a3b8";

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
          padding: "48px 40px",
          maxWidth: 440,
          width: "100%",
          textAlign: "center",
          boxShadow: darkMode
            ? "0 20px 60px rgba(0,0,0,0.3)"
            : "0 20px 60px rgba(0,0,0,0.08)",
        }}
      >
        {/* Loading */}
        {status === "loading" && (
          <>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(245,158,11,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <Loader
                style={{
                  width: 36,
                  height: 36,
                  color: "#f59e0b",
                  animation: "spin 1s linear infinite",
                }}
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
              {t("verifying_email")}
            </h2>
            <p style={{ color: subClr, fontSize: "0.9rem" }}>
              {t("please_wait_moment")}
            </p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
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
              {t("email_verified")}
            </h2>
            <p
              style={{
                color: subClr,
                fontSize: "0.9rem",
                lineHeight: 1.6,
                marginBottom: 32,
              }}
            >
              {message}
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
              {t("sign_in_now")} →
            </Link>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(239,68,68,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <XCircle style={{ width: 36, height: 36, color: "#f87171" }} />
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
              {t("verification_failed")}
            </h2>
            <p
              style={{
                color: subClr,
                fontSize: "0.9rem",
                lineHeight: 1.6,
                marginBottom: 32,
              }}
            >
              {message}
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 24px",
                  borderRadius: 14,
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  background: "transparent",
                  border: "1px solid rgba(245,158,11,0.3)",
                  color: "#f59e0b",
                }}
              >
                {t("go_to_login")}
              </Link>
              <Link
                to="/register"
                className="gold-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 24px",
                  borderRadius: 14,
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                }}
              >
                 {t("register_again")}
              </Link>
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
