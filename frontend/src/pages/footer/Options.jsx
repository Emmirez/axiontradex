import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  DollarSign,
  Calendar,
  Activity,
  Target,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  FeaturePage,
  FeatureHero,
  StatCard,
  FeatureCard,
  CTABanner,
} from "../features/FeatureLayout";

const FEATURES = [
  {
    icon: Zap,
    title: "Call & Put Options",
    desc: "Trade both call and put options on major cryptocurrencies with flexible expiry dates.",
  },
  {
    icon: Shield,
    title: "European Style Options",
    desc: "Exercise only at expiration for predictable settlement and reduced risk.",
  },
  {
    icon: Calendar,
    title: "Multiple Expiries",
    desc: "Choose from weekly, monthly, and quarterly expiries to match your strategy.",
  },
  {
    icon: Target,
    title: "Cash Settled",
    desc: "All options are cash-settled in USDT with no physical delivery requirements.",
  },
  {
    icon: DollarSign,
    title: "Competitive Premiums",
    desc: "Benefit from deep liquidity and tight bid-ask spreads on all options contracts.",
  },
  {
    icon: Activity,
    title: "Advanced Greeks",
    desc: "Access real-time Delta, Gamma, Theta, and Vega data for informed decisions.",
  },
];

const STATS = [
  { value: "24/7", label: "Trading Hours", icon: Activity, color: "#f59e0b" },
  { value: "1H-3M", label: "Expiries", icon: Calendar, color: "#34d399" },
  { value: "0.05%", label: "Options Fee", icon: DollarSign, color: "#60a5fa" },
  { value: "50+", label: "Pairs", icon: TrendingUp, color: "#a78bfa" },
];

export default function Options() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const [optionType, setOptionType] = useState("call");
  const [strike, setStrike] = useState("");
  const [expiry, setExpiry] = useState("weekly");
  const [premium, setPremium] = useState("");

  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const border = "rgba(245,158,11,0.18)";

  return (
    <FeaturePage>
      <FeatureHero
        badge={t("options_trading")}
        title={t("options_trading_title")}
        highlight={t("strategic")}
        subtitle={t("options_subtitle")}
        icon={Activity}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Options Builder */}
        <div
          style={{
            background: darkMode
              ? "rgba(15,23,42,0.8)"
              : "rgba(255,255,255,0.95)",
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: "24px",
            marginBottom: 48,
          }}
        >
          <h3
            style={{
              color: textClr,
              fontWeight: 700,
              fontSize: "1.2rem",
              marginBottom: 20,
              fontFamily: '"Playfair Display",serif',
            }}
          >
            {t("options_strategy_builder")}
          </h3>

          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => setOptionType("call")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 12,
                border: `1px solid ${optionType === "call" ? "#f59e0b" : border}`,
                background:
                  optionType === "call"
                    ? "rgba(245,158,11,0.15)"
                    : "transparent",
                color: optionType === "call" ? "#34d399" : mutedClr,
                fontWeight: 700,
              }}
            >
              📈 {t("call_option")}
            </button>
            <button
              onClick={() => setOptionType("put")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 12,
                border: `1px solid ${optionType === "put" ? "#f59e0b" : border}`,
                background:
                  optionType === "put"
                    ? "rgba(245,158,11,0.15)"
                    : "transparent",
                color: optionType === "put" ? "#f87171" : mutedClr,
                fontWeight: 700,
              }}
            >
              📉 {t("put_option")}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
            }}
          >
            <div>
              <label
                style={{
                  color: mutedClr,
                  fontSize: "0.78rem",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {t("strike_price_usdt")}
              </label>
              <input
                type="number"
                value={strike}
                onChange={(e) => setStrike(e.target.value)}
                placeholder="e.g., 90000"
                style={{
                  width: "100%",
                  background: darkMode
                    ? "rgba(15,23,42,0.6)"
                    : "rgba(248,250,252,0.9)",
                  border: `1px solid ${border}`,
                  borderRadius: 12,
                  padding: "10px",
                  color: textClr,
                }}
              />
            </div>
            <div>
              <label
                style={{
                  color: mutedClr,
                  fontSize: "0.78rem",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {t("expiry")}
              </label>
              <select
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                style={{
                  width: "100%",
                  background: darkMode
                    ? "rgba(15,23,42,0.6)"
                    : "rgba(248,250,252,0.9)",
                  border: `1px solid ${border}`,
                  borderRadius: 12,
                  padding: "10px",
                  color: textClr,
                }}
              >
                <option value="weekly">{t("weekly_7_days")}</option>
                <option value="monthly">{t("monthly_30_days")}</option>
                <option value="quarterly">{t("quarterly_90_days")}</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  color: mutedClr,
                  fontSize: "0.78rem",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {t("premium_usdt")}
              </label>
              <input
                type="number"
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
                placeholder={t("option_price")}
                style={{
                  width: "100%",
                  background: darkMode
                    ? "rgba(15,23,42,0.6)"
                    : "rgba(248,250,252,0.9)",
                  border: `1px solid ${border}`,
                  borderRadius: 12,
                  padding: "10px",
                  color: textClr,
                }}
              />
            </div>
          </div>

          {strike && premium && (
            <div
              style={{
                marginTop: 24,
                padding: "16px",
                background: "rgba(245,158,11,0.06)",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ color: mutedClr }}>{t("breakeven_price")}</span>
                <span style={{ color: "#f59e0b", fontWeight: 600 }}>
                  $
                  {(
                    parseFloat(strike) +
                    (optionType === "call"
                      ? parseFloat(premium)
                      : -parseFloat(premium))
                  ).toFixed(2)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: mutedClr }}>{t("max_loss")}</span>
                <span style={{ color: "#f87171", fontWeight: 600 }}>
                  ${premium} ({t("premium_paid")})
                </span>
              </div>
            </div>
          )}
        </div>

        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 20,
          }}
        >
          {t("why_trade_options_on")} <span className="gold-text">AxionTrade</span>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 60,
          }}
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
      <CTABanner
        title={t("start_options_trading")}
        subtitle={t("start_options_trading_subtitle")}
      />
    </FeaturePage>
  );
}