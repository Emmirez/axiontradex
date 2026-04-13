import React from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import {
  Cpu,
  Zap,
  BarChart2,
  Shield,
  ArrowRight,
  Settings,
  RefreshCw,
  Clock,
  TrendingUp,
  Code,
  Globe,
} from "lucide-react";
import FeatureLayout from "./FeatureLayout";
import { useTheme } from "../../context/ThemeContext";

export default function AutomatedTrading() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();

  const STATS = [
    { value: "<10ms", label: t("order_execution"), icon: Zap },
    { value: "500+", label: t("api_endpoints"), icon: Code },
    { value: "99.9%", label: t("system_uptime"), icon: Shield },
    { value: "24/7", label: t("auto_trading"), icon: Clock },
  ];

  const TOOLS = [
    {
      icon: Code,
      color: "#3b82f6",
      title: t("rest_websocket_api"),
      desc: t("rest_websocket_api_desc"),
    },
    {
      icon: Settings,
      color: "#f59e0b",
      title: t("strategy_builder"),
      desc: t("strategy_builder_desc"),
    },
    {
      icon: BarChart2,
      color: "#10b981",
      title: t("backtesting_engine"),
      desc: t("backtesting_engine_desc"),
    },
    {
      icon: RefreshCw,
      color: "#8b5cf6",
      title: t("auto_rebalancing"),
      desc: t("auto_rebalancing_desc"),
    },
    {
      icon: Globe,
      color: "#ef4444",
      title: t("multi_exchange"),
      desc: t("multi_exchange_desc"),
    },
    {
      icon: Shield,
      color: "#06b6d4",
      title: t("risk_engine"),
      desc: t("risk_engine_desc"),
    },
  ];

  const WORKFLOW = [
    {
      step: "01",
      title: t("connect_account"),
      desc: t("connect_account_desc"),
    },
    {
      step: "02",
      title: t("build_strategy"),
      desc: t("build_strategy_desc"),
    },
    {
      step: "03",
      title: t("backtest_optimise"),
      desc: t("backtest_optimise_desc"),
    },
    {
      step: "04",
      title: t("deploy_monitor"),
      desc: t("deploy_monitor_desc"),
    },
  ];

  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const cardBorder = darkMode
    ? "rgba(245,158,11,0.15)"
    : "rgba(245,158,11,0.2)";
  const headClr = darkMode ? "#f1f5f9" : "#0f172a";
  const subClr = darkMode ? "#64748b" : "#64748b";
  const labelClr = darkMode ? "#94a3b8" : "#475569";
  const codeBg = darkMode ? "rgba(0,0,0,0.4)" : "rgba(15,23,42,0.06)";

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
              {t("automated_trading")}
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
            {t("automate_everything")}
            <br />
            <span className="gold-text">{t("trade_on_autopilot")}</span>
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
            {t("automated_trading_desc")}
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
            {t("start_automating")} <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>

        {/*  Stats  */}
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

        {/*  Code preview + workflow */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginBottom: 56,
            flexWrap: "wrap",
          }}
        >
          {/* Code snippet */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: 20,
              padding: "28px",
              minWidth: 0,
            }}
          >
            <h3
              style={{
                color: headClr,
                fontWeight: 600,
                fontSize: "1rem",
                marginBottom: 16,
              }}
            >
              {t("sample_strategy_python")}
            </h3>
            <div
              style={{
                background: codeBg,
                borderRadius: 12,
                padding: "16px",
                fontFamily: "monospace",
                fontSize: "0.78rem",
                lineHeight: 1.8,
                overflowX: "auto",
              }}
            >
              <div style={{ color: "#94a3b8" }}>
                # AxionTrade {t("automated_strategy")}
              </div>
              <div style={{ color: "#60a5fa" }}>
                from <span style={{ color: "#f1f5f9" }}>axiontrade</span> import
                Strategy
              </div>
              <br />
              <div style={{ color: "#60a5fa" }}>
                class <span style={{ color: "#34d399" }}>MACDStrategy</span>
                (Strategy):
              </div>
              <div style={{ paddingLeft: 16, color: "#60a5fa" }}>
                def <span style={{ color: "#fbbf24" }}>on_tick</span>(self,
                data):
              </div>
              <div style={{ paddingLeft: 32, color: "#94a3b8" }}>
                # Calculate MACD
              </div>
              <div style={{ paddingLeft: 32, color: "#f1f5f9" }}>
                macd = self.macd(data,{" "}
                <span style={{ color: "#f59e0b" }}>12</span>,{" "}
                <span style={{ color: "#f59e0b" }}>26</span>,{" "}
                <span style={{ color: "#f59e0b" }}>9</span>)
              </div>
              <div style={{ paddingLeft: 32, color: "#60a5fa" }}>
                if <span style={{ color: "#f1f5f9" }}>macd.crossover():</span>
              </div>
              <div style={{ paddingLeft: 48, color: "#f1f5f9" }}>
                self.buy(<span style={{ color: "#f59e0b" }}>size=0.1</span>)
              </div>
              <div style={{ paddingLeft: 32, color: "#60a5fa" }}>
                elif{" "}
                <span style={{ color: "#f1f5f9" }}>macd.crossunder():</span>
              </div>
              <div style={{ paddingLeft: 48, color: "#f1f5f9" }}>
                self.sell(<span style={{ color: "#f59e0b" }}>size=0.1</span>)
              </div>
            </div>
          </div>

          {/* Workflow */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {WORKFLOW.map((w, i) => (
              <div
                key={w.step}
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 16,
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(245,158,11,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      color: "#f59e0b",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      fontFamily: "monospace",
                    }}
                  >
                    {w.step}
                  </span>
                </div>
                <div>
                  <div
                    style={{
                      color: headClr,
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      marginBottom: 4,
                    }}
                  >
                    {w.title}
                  </div>
                  <div
                    style={{
                      color: subClr,
                      fontSize: "0.8rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {w.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*  Tools  */}
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
            {t("everything_you_need_to_automate")}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {TOOLS.map((t) => (
              <div
                key={t.title}
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
                    background: `${t.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <t.icon style={{ width: 18, height: 18, color: t.color }} />
                </div>
                <div
                  style={{
                    color: headClr,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    marginBottom: 8,
                  }}
                >
                  {t.title}
                </div>
                <div
                  style={{
                    color: subClr,
                    fontSize: "0.83rem",
                    lineHeight: 1.6,
                  }}
                >
                  {t.desc}
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
            {t("ready_to_automate")}
          </h2>
          <p
            style={{
              color: subClr,
              fontSize: "0.9rem",
              marginBottom: 28,
              position: "relative",
            }}
          >
            {t("ready_to_automate_desc")}
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
            {t("create_free_account")} <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </div>
    </FeatureLayout>
  );
}