import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  RefreshCw,
  DollarSign,
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
    title: "Up to 125x Leverage",
    desc: "Amplify your trading power with flexible leverage options up to 125x on major pairs.",
  },
  {
    icon: Shield,
    title: "Socialized Insurance",
    desc: "Protected by our insurance fund that covers socialized losses during extreme volatility.",
  },
  {
    icon: Activity,
    title: "Perpetual Swaps",
    desc: "Trade perpetual contracts with no expiry date. Settle in USDT or coin-margined.",
  },
  {
    icon: Target,
    title: "Advanced Risk Tools",
    desc: "Set stop-loss, take-profit, and trailing stops to manage risk effectively.",
  },
  {
    icon: DollarSign,
    title: "Cross & Isolated Margin",
    desc: "Choose between cross margin for shared collateral or isolated for risk separation.",
  },
  {
    icon: RefreshCw,
    title: "Real-time Settlement",
    desc: "Mark-to-market settlement every 8 hours with auto-deleveraging prevention.",
  },
];

const STATS = [
  { value: "125x", label: "Max Leverage", icon: Zap, color: "#f59e0b" },
  { value: "0.02%", label: "Maker Fee", icon: DollarSign, color: "#34d399" },
  { value: "100M+", label: "Daily Volume", icon: Activity, color: "#60a5fa" },
  { value: "24/7", label: "Trading Hours", icon: RefreshCw, color: "#a78bfa" },
];

export default function Futures() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const [price, setPrice] = useState(87991);
  const [leverage, setLeverage] = useState(10);
  const [side, setSide] = useState("long");
  const [amount, setAmount] = useState("");
  const [marginType, setMarginType] = useState("cross");

  useEffect(() => {
    const iv = setInterval(() => {
      setPrice((p) => parseFloat((p + (Math.random() - 0.48) * 12).toFixed(2)));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const border = "rgba(245,158,11,0.18)";

  const formatPrice = (p) =>
    `$${p.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <FeaturePage>
      <FeatureHero
        badge={t("futures_trading")}
        title={t("futures")}
        highlight={t("amplified")}
        subtitle={t("futures_subtitle")}
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

        {/* Futures Calculator */}
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
            {t("futures_calculator")}
          </h3>

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
                {t("btc_price")}
              </label>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#f59e0b",
                }}
              >
                {formatPrice(price)}
              </div>
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
                {t("leverage_x")}
              </label>
              <input
                type="range"
                min="1"
                max="125"
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                style={{ width: "100%" }}
              />
              <div
                style={{
                  textAlign: "center",
                  marginTop: 4,
                  color: "#f59e0b",
                  fontWeight: 600,
                }}
              >
                {leverage}x
              </div>
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
                {t("position_size_usdt")}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
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
                {t("margin_type")}
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setMarginType("cross")}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: 8,
                    border: `1px solid ${marginType === "cross" ? "#f59e0b" : border}`,
                    background:
                      marginType === "cross"
                        ? "rgba(245,158,11,0.1)"
                        : "transparent",
                    color: marginType === "cross" ? "#f59e0b" : mutedClr,
                  }}
                >
                  {t("cross")}
                </button>
                <button
                  onClick={() => setMarginType("isolated")}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: 8,
                    border: `1px solid ${marginType === "isolated" ? "#f59e0b" : border}`,
                    background:
                      marginType === "isolated"
                        ? "rgba(245,158,11,0.1)"
                        : "transparent",
                    color: marginType === "isolated" ? "#f59e0b" : mutedClr,
                  }}
                >
                  {t("isolated")}
                </button>
              </div>
            </div>
          </div>

          {amount && (
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
                <span style={{ color: mutedClr }}>{t("position_size")}</span>
                <span style={{ color: textClr, fontWeight: 600 }}>
                  {parseFloat(amount).toFixed(2)} USDT
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ color: mutedClr }}>{t("margin_required")}</span>
                <span style={{ color: textClr, fontWeight: 600 }}>
                  {(parseFloat(amount) / leverage).toFixed(2)} USDT
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: mutedClr }}>{t("liquidation_price")}</span>
                <span style={{ color: "#f87171", fontWeight: 600 }}>
                  ≈ {formatPrice(price * (1 - 1 / leverage))}
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
          {t("why_trade_futures_on")} <span className="gold-text">AxionTrade</span>
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
        title={t("start_futures_trading")}
        subtitle={t("start_futures_trading_subtitle")}
      />
    </FeaturePage>
  );
}