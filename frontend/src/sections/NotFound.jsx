import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, ArrowLeft, Search, TrendingUp } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function NotFound() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [count, setCount] = useState(10);

  const QUICK_LINKS = [
    { label: t("nav_home"), to: "/" },
    { label: t("live_markets"), to: "/#markets" },
    { label: t("copy_trading"), to: "/copy-trading" },
    { label: t("ai_trading"), to: "/ai-trading" },
    { label: t("get_funded"), to: "/funded" },
    { label: t("gold"), to: "/gold" },
    { label: t("stocks_funds"), to: "/stocks" },
    { label: t("contact_us"), to: "/contact" },
  ];

  // Auto-redirect countdown
  useEffect(() => {
    const iv = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(iv);
          navigate("/");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [navigate]);

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const border = "rgba(245,158,11,0.18)";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        transition: "background 0.3s",
      }}
    >
      {/* Background effects */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 300,
          borderRadius: "50%",
          background: "rgba(245,158,11,0.05)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          marginBottom: 48,
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

      {/* Main card */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 28,
          padding: "48px 40px",
          maxWidth: 560,
          width: "100%",
          textAlign: "center",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          position: "relative",
        }}
      >
        {/* 404 number */}
        <div
          style={{
            fontFamily: '"Playfair Display",serif',
            fontSize: "clamp(6rem,20vw,10rem)",
            fontWeight: 900,
            lineHeight: 1,
            marginBottom: 8,
            background: "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            userSelect: "none",
          }}
        >
          404
        </div>

        <h1
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "clamp(1.4rem,4vw,2rem)",
            color: textClr,
            marginBottom: 12,
          }}
        >
          {t('page_not_found')}
        </h1>
        <p
          style={{
            color: mutedClr,
            fontSize: "0.95rem",
            lineHeight: 1.7,
            marginBottom: 32,
          }}
        >
          {t('page_not_found_desc')}
        </p>

        {/* Countdown */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 999,
            padding: "6px 16px",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#f59e0b",
              animation: "pulse 1s infinite",
            }}
          />
          <span
            style={{ color: "#f59e0b", fontSize: "0.8rem", fontWeight: 600 }}
          >
            Redirecting to home in {count}s
          </span>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 32,
          }}
        >
          <Link
            to="/"
            className="gold-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 24px",
              borderRadius: 14,
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            <Home style={{ width: 15, height: 15 }} /> Go Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 24px",
              borderRadius: 14,
              background: "transparent",
              border: `1px solid ${border}`,
              color: mutedClr,
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)";
              e.currentTarget.style.color = "#f59e0b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = border;
              e.currentTarget.style.color = mutedClr;
            }}
          >
            <ArrowLeft style={{ width: 15, height: 15 }} /> Go Back
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            borderTop: `1px solid ${darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
            paddingTop: 24,
          }}
        >
          <p
            style={{
              color: mutedClr,
              fontSize: "0.78rem",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Search style={{ width: 13, height: 13 }} /> Quick links
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
            }}
          >
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                style={{
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: darkMode
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.04)",
                  border: `1px solid ${border}`,
                  color: mutedClr,
                  fontSize: "0.75rem",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#f59e0b";
                  e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = mutedClr;
                  e.currentTarget.style.borderColor = border;
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <p
        style={{
          color: darkMode ? "#1e293b" : "#cbd5e1",
          fontSize: "0.75rem",
          marginTop: 24,
        }}
      >
        © 2025 AxionTrade Ltd. {t('all_rights_reserved')}
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
