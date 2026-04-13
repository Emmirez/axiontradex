import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  TrendingUp,
  Copy,
  Shield,
  Star,
  ArrowRight,
  BarChart2,
  Zap,
  DollarSign,
} from "lucide-react";
import FeatureLayout from "./FeatureLayout";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function CopyTrading() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();

  const STATS = [
    { value: "50K+", label: t("expert_traders"), icon: Users },
    { value: "92%", label: t("win_rate_top"), icon: TrendingUp },
    { value: "$2.1B", label: t("copied_volume"), icon: Copy },
    { value: "180+", label: t("countries"), icon: Shield },
  ];

  const TOP_TRADERS = [
    {
      name: "Alex Morgan",
      roi: "+284%",
      winRate: "94%",
      followers: "12.4K",
      risk: t("low"),
      avatar: "A",
      color: "#f59e0b",
    },
    {
      name: "Sara Kim",
      roi: "+196%",
      winRate: "88%",
      followers: "9.1K",
      risk: t("medium"),
      avatar: "S",
      color: "#3b82f6",
    },
    {
      name: "James Okafor",
      roi: "+341%",
      winRate: "91%",
      followers: "18.2K",
      risk: t("low"),
      avatar: "J",
      color: "#10b981",
    },
    {
      name: "Priya Singh",
      roi: "+157%",
      winRate: "85%",
      followers: "6.7K",
      risk: t("low"),
      avatar: "P",
      color: "#8b5cf6",
    },
    {
      name: "Chris Tanner",
      roi: "+422%",
      winRate: "89%",
      followers: "21.3K",
      risk: t("high"),
      avatar: "C",
      color: "#ef4444",
    },
    {
      name: "Mei Zhao",
      roi: "+213%",
      winRate: "92%",
      followers: "14.8K",
      risk: t("medium"),
      avatar: "M",
      color: "#06b6d4",
    },
  ];

  const HOW_IT_WORKS = [
    {
      step: "01",
      icon: Users,
      title: t("browse_traders"),
      desc: t("browse_traders_desc"),
    },
    {
      step: "02",
      icon: Copy,
      title: t("select_copy"),
      desc: t("select_copy_desc"),
    },
    {
      step: "03",
      icon: Zap,
      title: t("auto_execute"),
      desc: t("auto_execute_desc"),
    },
    {
      step: "04",
      icon: DollarSign,
      title: t("earn_together"),
      desc: t("earn_together_desc"),
    },
  ];

  const FEATURES = [
    {
      icon: BarChart2,
      title: t("full_transparency"),
      desc: t("full_transparency_desc"),
    },
    {
      icon: Shield,
      title: t("risk_management_copy"),
      desc: t("risk_management_copy_desc"),
    },
    {
      icon: Zap,
      title: t("instant_execution_copy"),
      desc: t("instant_execution_copy_desc"),
    },
    {
      icon: Star,
      title: t("performance_ratings"),
      desc: t("performance_ratings_desc"),
    },
  ];

  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const cardBorder = darkMode
    ? "rgba(245,158,11,0.15)"
    : "rgba(245,158,11,0.2)";
  const headClr = darkMode ? "#f1f5f9" : "#0f172a";
  const subClr = darkMode ? "#64748b" : "#64748b";
  const labelClr = darkMode ? "#94a3b8" : "#475569";
  const divider = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <FeatureLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        {/*  Hero */}
        <div
          style={{
            textAlign: "center",
            padding: "60px 0 48px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: 999,
              padding: "6px 16px",
              marginBottom: 20,
            }}
          >
            <Copy style={{ width: 14, height: 14, color: "#f59e0b" }} />
            <span
              style={{ color: "#f59e0b", fontSize: "0.8rem", fontWeight: 600 }}
            >
              {t("copy_trading")}
            </span>
          </div>
          <h1
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 900,
              fontSize: "clamp(2rem,5vw,3.5rem)",
              color: headClr,
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            {t("copy_the_best")}
            <br />
            <span className="gold-text">{t("earn_like_the_best")}</span>
          </h1>
          <p
            style={{
              color: subClr,
              fontSize: "1rem",
              lineHeight: 1.7,
              maxWidth: 560,
              margin: "0 auto 32px",
            }}
          >
            {t("copy_trading_desc_copy")}
          </p>
          <Link
            to="/register"
            className="gold-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              borderRadius: 14,
              textDecoration: "none",
              fontSize: "0.95rem",
            }}
          >
            {t("start_copy_trading")}{" "}
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>

        {/*  Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 56,
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: 20,
                padding: "24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(245,158,11,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <s.icon style={{ width: 20, height: 20, color: "#f59e0b" }} />
              </div>
              <div
                style={{
                  fontFamily: '"Playfair Display",serif',
                  fontWeight: 700,
                  fontSize: "1.8rem",
                  color: "#f59e0b",
                }}
              >
                {s.value}
              </div>
              <div
                style={{ color: labelClr, fontSize: "0.8rem", marginTop: 4 }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/*  Top Traders */}
        <div style={{ marginBottom: 56 }}>
          <h2
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 700,
              fontSize: "1.8rem",
              color: headClr,
              marginBottom: 8,
            }}
          >
            {t("top_traders")}
          </h2>
          <p style={{ color: subClr, fontSize: "0.9rem", marginBottom: 24 }}>
            {t("browse_verified_experts")}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {TOP_TRADERS.map((trader) => (
              <div
                key={trader.name}
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 20,
                  padding: "20px",
                  transition: "transform 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: trader.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}
                  >
                    {trader.avatar}
                  </div>
                  <div>
                    <div
                      style={{
                        color: headClr,
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      {trader.name}
                    </div>
                    <div style={{ color: labelClr, fontSize: "0.75rem" }}>
                      {trader.followers} {t("followers")}
                    </div>
                  </div>
                  <div
                    style={{
                      marginLeft: "auto",
                      background: "rgba(16,185,129,0.12)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      borderRadius: 8,
                      padding: "4px 10px",
                      color: "#34d399",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                    }}
                  >
                    {trader.roi}
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    [t("win_rate"), trader.winRate],
                    [t("risk_level"), trader.risk],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        background: darkMode
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(0,0,0,0.04)",
                        borderRadius: 10,
                        padding: "8px 12px",
                      }}
                    >
                      <div style={{ color: labelClr, fontSize: "0.7rem" }}>
                        {k}
                      </div>
                      <div
                        style={{
                          color: headClr,
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          marginTop: 2,
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  style={{
                    width: "100%",
                    marginTop: 14,
                    padding: "9px",
                    borderRadius: 10,
                    border: "1px solid rgba(245,158,11,0.3)",
                    background: "transparent",
                    color: "#f59e0b",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t("copy_trader")}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* How it Works */}
        <div style={{ marginBottom: 56 }}>
          <h2
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 700,
              fontSize: "1.8rem",
              color: headClr,
              marginBottom: 8,
            }}
          >
            {t("how_it_works")}
          </h2>
          <p style={{ color: subClr, fontSize: "0.9rem", marginBottom: 24 }}>
            {t("get_started_under_2_min")}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.step}
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 20,
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    color: "#f59e0b",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    fontFamily: "monospace",
                    marginBottom: 12,
                    opacity: 0.7,
                  }}
                >
                  {step.step}
                </div>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "rgba(245,158,11,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <step.icon style={{ width: 18, height: 18, color: "#f59e0b" }} />
                </div>
                <div
                  style={{
                    color: headClr,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    marginBottom: 8,
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    color: subClr,
                    fontSize: "0.83rem",
                    lineHeight: 1.6,
                  }}
                >
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*Features*/}
        <div style={{ marginBottom: 56 }}>
          <h2
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 700,
              fontSize: "1.8rem",
              color: headClr,
              marginBottom: 24,
            }}
          >
            {t("why_axiontrade_copy_trading")}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 20,
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "rgba(245,158,11,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <feature.icon style={{ width: 18, height: 18, color: "#f59e0b" }} />
                </div>
                <div
                  style={{
                    color: headClr,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    marginBottom: 8,
                  }}
                >
                  {feature.title}
                </div>
                <div
                  style={{
                    color: subClr,
                    fontSize: "0.83rem",
                    lineHeight: 1.6,
                  }}
                >
                  {feature.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA  */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: 24,
            padding: "48px 32px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 300,
              height: 150,
              background: "rgba(245,158,11,0.08)",
              filter: "blur(60px)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
          <h2
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 700,
              fontSize: "1.8rem",
              color: headClr,
              marginBottom: 12,
              position: "relative",
            }}
          >
            {t("ready_to_start_copying")}
          </h2>
          <p
            style={{
              color: subClr,
              fontSize: "0.9rem",
              marginBottom: 28,
              position: "relative",
            }}
          >
            {t("ready_to_start_copying_desc")}
          </p>
          <Link
            to="/register"
            className="gold-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              borderRadius: 14,
              textDecoration: "none",
              fontSize: "0.95rem",
              position: "relative",
            }}
          >
            {t("create_free_account")}{" "}
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </div>
    </FeatureLayout>
  );
}