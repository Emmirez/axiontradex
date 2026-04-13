import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import {
  Cpu,
  TrendingUp,
  Brain,
  Shield,
  ArrowRight,
  BarChart2,
  Zap,
  Eye,
  MessageSquare,
  Star,
} from "lucide-react";
import FeatureLayout from "./FeatureLayout";
import { useTheme } from "../../context/ThemeContext";

export default function AITrading() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();

  const STATS = [
    { value: "94%", label: t("signal_accuracy"), icon: Star },
    { value: "2.1M", label: t("trades_analysed"), icon: BarChart2 },
    { value: "<1s", label: t("signal_speed"), icon: Zap },
    { value: "50+", label: t("ai_models_active"), icon: Cpu },
  ];

  const AI_FEATURES = [
    {
      icon: Brain,
      color: "#8b5cf6",
      title: t("predictive_signals"),
      desc: t("predictive_signals_desc"),
    },
    {
      icon: MessageSquare,
      color: "#3b82f6",
      title: t("sentiment_analysis"),
      desc: t("sentiment_analysis_desc"),
    },
    {
      icon: Eye,
      color: "#10b981",
      title: t("pattern_recognition"),
      desc: t("pattern_recognition_desc"),
    },
    {
      icon: TrendingUp,
      color: "#f59e0b",
      title: t("trend_forecasting"),
      desc: t("trend_forecasting_desc"),
    },
    {
      icon: Shield,
      color: "#ef4444",
      title: t("risk_scoring"),
      desc: t("risk_scoring_desc"),
    },
    {
      icon: Zap,
      color: "#06b6d4",
      title: t("auto_execution"),
      desc: t("auto_execution_desc"),
    },
  ];

  const [signals, setSignals] = useState([
    {
      pair: "BTC/USDT",
      action: "BUY",
      confidence: 87,
      price: "$87,230",
      target: "$91,500",
      stop: "$85,100",
      time: t("just_now"),
    },
    {
      pair: "ETH/USDT",
      action: "SELL",
      confidence: 74,
      price: "$3,450",
      target: "$3,100",
      stop: "$3,580",
      time: t("2_min_ago"),
    },
    {
      pair: "SOL/USDT",
      action: "BUY",
      confidence: 91,
      price: "$177.81",
      target: "$195.00",
      stop: "$168.00",
      time: t("5_min_ago"),
    },
    {
      pair: "BNB/USDT",
      action: "BUY",
      confidence: 68,
      price: "$597.42",
      target: "$625.00",
      stop: "$578.00",
      time: t("9_min_ago"),
    },
    {
      pair: "ADA/USDT",
      action: "SELL",
      confidence: 79,
      price: "$0.458",
      target: "$0.410",
      stop: "$0.475",
      time: t("14_min_ago"),
    },
  ]);

  // Rotate and update signals every 8 seconds
  useEffect(() => {
    const newSignalPool = [
      {
        pair: "AVAX/USDT",
        action: "BUY",
        confidence: 83,
        price: "$39.04",
        target: "$43.50",
        stop: "$36.80",
      },
      {
        pair: "DOGE/USDT",
        action: "SELL",
        confidence: 71,
        price: "$0.182",
        target: "$0.155",
        stop: "$0.195",
      },
      {
        pair: "LINK/USDT",
        action: "BUY",
        confidence: 88,
        price: "$18.72",
        target: "$21.00",
        stop: "$17.50",
      },
      {
        pair: "MATIC/USDT",
        action: "BUY",
        confidence: 76,
        price: "$0.91",
        target: "$1.05",
        stop: "$0.84",
      },
      {
        pair: "DOT/USDT",
        action: "SELL",
        confidence: 65,
        price: "$8.40",
        target: "$7.20",
        stop: "$8.90",
      },
      {
        pair: "XRP/USDT",
        action: "BUY",
        confidence: 82,
        price: "$0.612",
        target: "$0.680",
        stop: "$0.575",
      },
    ];

    const times = [
      t("just_now"),
      t("1_min_ago"),
      t("2_min_ago"),
      t("4_min_ago"),
      t("7_min_ago"),
      t("11_min_ago"),
      t("16_min_ago"),
    ];

    const interval = setInterval(() => {
      setSignals((prev) => {
        const newSig = {
          ...newSignalPool[Math.floor(Math.random() * newSignalPool.length)],
          time: t("just_now"),
        };
        const aged = prev.map((s, i) => ({
          ...s,
          time: times[Math.min(i + 1, times.length - 1)],
        }));
        return [newSig, ...aged.slice(0, 4)];
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [t]);

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
            <Cpu style={{ width: 14, height: 14, color: "#f59e0b" }} />
            <span
              style={{ color: "#f59e0b", fontSize: "0.8rem", fontWeight: 600 }}
            >
              {t("ai_trading")}
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
            {t("trade_with_power")}
            <br />
            <span className="gold-text">{t("artificial_intelligence")}</span>
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
            {t("ai_engine_description")}
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
            {t("access_ai_signals")} <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>

        {/* ── Stats ── */}
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

        {/* Live Signals */}
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
            {t("live_ai_signals")}
          </h2>
          <p style={{ color: subClr, fontSize: "0.9rem", marginBottom: 24 }}>
            {t("live_ai_signals_desc")}
          </p>

          {/* Desktop table  */}
          <div
            className="hidden md:block"
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: 20,
              overflow: "auto",
            }}
          >
            <div style={{ minWidth: 600 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 80px 110px 100px 100px 100px",
                  gap: 12,
                  padding: "14px 20px",
                  borderBottom: `1px solid ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                  color: labelClr,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <div>{t("pair")}</div>
                <div>{t("signal")}</div>
                <div>{t("confidence")}</div>
                <div>{t("entry")}</div>
                <div>{t("target")}</div>
                <div>{t("stop_loss")}</div>
              </div>
              {signals.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 110px 100px 100px 100px",
                    gap: 12,
                    padding: "14px 20px",
                    borderBottom:
                      i < signals.length - 1
                        ? `1px solid ${darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`
                        : "none",
                    alignItems: "center",
                    transition: "background 0.3s",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: headClr,
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        fontFamily: "monospace",
                      }}
                    >
                      {s.pair}
                    </div>
                    <div
                      style={{
                        color: labelClr,
                        fontSize: "0.7rem",
                        marginTop: 2,
                      }}
                    >
                      {s.time}
                    </div>
                  </div>
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: 8,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background:
                          s.action === "BUY"
                            ? "rgba(16,185,129,0.15)"
                            : "rgba(239,68,68,0.15)",
                        color: s.action === "BUY" ? "#34d399" : "#f87171",
                        border: `1px solid ${s.action === "BUY" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                      }}
                    >
                      {s.action}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        background: darkMode
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(0,0,0,0.08)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${s.confidence}%`,
                          height: "100%",
                          background: "#f59e0b",
                          borderRadius: 2,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        color: "#f59e0b",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.confidence}%
                    </span>
                  </div>
                  <div
                    style={{
                      color: headClr,
                      fontSize: "0.82rem",
                      fontFamily: "monospace",
                      fontWeight: 600,
                    }}
                  >
                    {s.price}
                  </div>
                  <div
                    style={{
                      color: "#34d399",
                      fontSize: "0.82rem",
                      fontFamily: "monospace",
                    }}
                  >
                    {s.target}
                  </div>
                  <div
                    style={{
                      color: "#f87171",
                      fontSize: "0.82rem",
                      fontFamily: "monospace",
                    }}
                  >
                    {s.stop}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/*  Mobile cards  */}
          <div
            className="md:hidden"
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {signals.map((s, i) => (
              <div
                key={i}
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 16,
                  padding: "16px",
                  transition: "all 0.3s",
                }}
              >
                {/* Top row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: headClr,
                        fontWeight: 700,
                        fontSize: "1rem",
                        fontFamily: "monospace",
                      }}
                    >
                      {s.pair}
                    </div>
                    <div
                      style={{
                        color: labelClr,
                        fontSize: "0.7rem",
                        marginTop: 2,
                      }}
                    >
                      {s.time}
                    </div>
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 14px",
                      borderRadius: 8,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      background:
                        s.action === "BUY"
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(239,68,68,0.15)",
                      color: s.action === "BUY" ? "#34d399" : "#f87171",
                      border: `1px solid ${s.action === "BUY" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                    }}
                  >
                    {s.action}
                  </span>
                </div>

                {/* Confidence bar */}
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    }}
                  >
                    <span style={{ color: labelClr, fontSize: "0.72rem" }}>
                      {t("ai_confidence")}
                    </span>
                    <span
                      style={{
                        color: "#f59e0b",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                      }}
                    >
                      {s.confidence}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: darkMode
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${s.confidence}%`,
                        height: "100%",
                        background: "#f59e0b",
                        borderRadius: 3,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Price info */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    [t("entry"), s.price, headClr],
                    [t("target"), s.target, "#34d399"],
                    [t("stop_loss"), s.stop, "#f87171"],
                  ].map(([label, val, color]) => (
                    <div
                      key={label}
                      style={{
                        background: darkMode
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(0,0,0,0.03)",
                        borderRadius: 10,
                        padding: "8px 10px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          color: labelClr,
                          fontSize: "0.65rem",
                          marginBottom: 4,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          color,
                          fontFamily: "monospace",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                        }}
                      >
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Features */}
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
            {t("what_our_ai_does")}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {AI_FEATURES.map((f) => (
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
                    background: `${f.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <f.icon style={{ width: 18, height: 18, color: f.color }} />
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

        {/*  CTA  */}
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
            {t("let_ai_guide_trades")}
          </h2>
          <p
            style={{
              color: subClr,
              fontSize: "0.9rem",
              marginBottom: 28,
              position: "relative",
            }}
          >
            {t("get_ai_access_desc")}
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
            {t("get_ai_access")} <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </div>
    </FeatureLayout>
  );
}