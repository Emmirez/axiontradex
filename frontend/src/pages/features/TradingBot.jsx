import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  Bot,
  Zap,
  BarChart2,
  Shield,
  ArrowRight,
  Play,
  Pause,
  Settings,
  TrendingUp,
  RefreshCw,
  Clock,
} from "lucide-react";
import FeatureLayout from "./FeatureLayout";
import { useTheme } from "../../context/ThemeContext";

export default function TradingBot() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const [activeBot, setActiveBot] = useState(null);
  const navigate = useNavigate();

  const STATS = [
    { value: "24/7", label: t("always_running"), icon: Clock },
    { value: "50ms", label: t("execution_speed"), icon: Zap },
    { value: "12+", label: t("bot_strategies"), icon: Bot },
    { value: "99.9%", label: t("uptime"), icon: Shield },
  ];

  const BOT_TYPES = [
    {
      name: t("grid_bot"),
      desc: t("grid_bot_desc"),
      roi: "+18-45%",
      risk: t("low"),
      color: "#10b981",
      icon: BarChart2,
    },
    {
      name: t("dca_bot"),
      desc: t("dca_bot_desc"),
      roi: "+12-30%",
      risk: t("low"),
      color: "#3b82f6",
      icon: RefreshCw,
    },
    {
      name: t("arbitrage_bot"),
      desc: t("arbitrage_bot_desc"),
      roi: "+8-20%",
      risk: t("low"),
      color: "#f59e0b",
      icon: TrendingUp,
    },
    {
      name: t("momentum_bot"),
      desc: t("momentum_bot_desc"),
      roi: "+25-80%",
      risk: t("medium"),
      color: "#8b5cf6",
      icon: Zap,
    },
    {
      name: t("scalping_bot"),
      desc: t("scalping_bot_desc"),
      roi: "+15-40%",
      risk: t("medium"),
      color: "#ef4444",
      icon: Zap,
    },
    {
      name: t("macd_bot"),
      desc: t("macd_bot_desc"),
      roi: "+20-55%",
      risk: t("medium"),
      color: "#06b6d4",
      icon: BarChart2,
    },
  ];

  const FEATURES = [
    {
      icon: Settings,
      title: t("easy_setup"),
      desc: t("easy_setup_desc"),
    },
    {
      icon: BarChart2,
      title: t("backtesting"),
      desc: t("backtesting_desc"),
    },
    {
      icon: Shield,
      title: t("risk_controls"),
      desc: t("risk_controls_desc"),
    },
    {
      icon: RefreshCw,
      title: t("auto_rebalancing_bot"),
      desc: t("auto_rebalancing_bot_desc"),
    },
  ];

  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const cardBorder = darkMode
    ? "rgba(245,158,11,0.15)"
    : "rgba(245,158,11,0.2)";
  const headClr = darkMode ? "#f1f5f9" : "#0f172a";
  const subClr = darkMode ? "#64748b" : "#64748b";
  const labelClr = darkMode ? "#94a3b8" : "#475569";

  return (
    <FeatureLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* ── Hero ── */}
        <div style={{ textAlign: "center", padding: "60px 0 48px" }}>
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
            <Bot style={{ width: 14, height: 14, color: "#f59e0b" }} />
            <span
              style={{ color: "#f59e0b", fontSize: "0.8rem", fontWeight: 600 }}
            >
              {t("trading_bots")}
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
            {t("trade_smarter")}
            <br />
            <span className="gold-text">{t("never_miss_a_move")}</span>
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
            {t("trading_bots_desc_bots")}
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
            {t("launch_your_bot")}{" "}
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>

        {/* Stats  */}
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

        {/*  Bot Types  */}
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
            {t("available_bot_strategies")}
          </h2>
          <p style={{ color: subClr, fontSize: "0.9rem", marginBottom: 24 }}>
            {t("choose_strategy")}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {BOT_TYPES.map((bot) => (
              <div
                key={bot.name}
                style={{
                  background: cardBg,
                  border: `1px solid ${activeBot === bot.name ? bot.color : cardBorder}`,
                  borderRadius: 20,
                  padding: "24px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() =>
                  setActiveBot(activeBot === bot.name ? null : bot.name)
                }
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
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: `${bot.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <bot.icon
                        style={{ width: 18, height: 18, color: bot.color }}
                      />
                    </div>
                    <span
                      style={{
                        color: headClr,
                        fontWeight: 600,
                        fontSize: "0.95rem",
                      }}
                    >
                      {bot.name}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#10b981",
                      }}
                    />
                    <span
                      style={{
                        color: "#34d399",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                      }}
                    >
                      {t("active")}
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    color: subClr,
                    fontSize: "0.82rem",
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}
                >
                  {bot.desc}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  {[
                    [t("est_roi"), bot.roi],
                    [t("risk_level"), bot.risk],
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
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/login");
                  }}
                  style={{
                    width: "100%",
                    padding: "9px",
                    borderRadius: 10,
                    border: "none",
                    background: bot.color,
                    color: "#fff",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Play style={{ width: 13, height: 13 }} /> {t("deploy_bot")}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/*  Features  */}
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
            {t("built_for_serious_traders")}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
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
                  <f.icon style={{ width: 18, height: 18, color: "#f59e0b" }} />
                </div>
                <div
                  style={{
                    color: headClr,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    marginBottom: 8,
                  }}
                >
                  {f.title}
                </div>
                <div
                  style={{
                    color: subClr,
                    fontSize: "0.83rem",
                    lineHeight: 1.6,
                  }}
                >
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
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
            {t("let_your_bots_work")}
          </h2>
          <p
            style={{
              color: subClr,
              fontSize: "0.9rem",
              marginBottom: 28,
              position: "relative",
            }}
          >
            {t("let_your_bots_desc")}
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
            {t("get_started_free")}{" "}
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </div>
    </FeatureLayout>
  );
}
