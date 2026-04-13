import React, { useState, useEffect } from "react";
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Globe,
  Shield,
  Zap,
  DollarSign,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FeaturePage,
  FeatureHero,
  StatCard,
  FeatureCard,
  CTABanner,
} from "../features/FeatureLayout.jsx";

const STOCKS = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 189.3,
    change: 1.24,
    pct: 0.66,
    up: true,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 248.5,
    change: -3.1,
    pct: -1.23,
    up: false,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 875.2,
    change: 14.8,
    pct: 1.72,
    up: true,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 415.6,
    change: 2.3,
    pct: 0.56,
    up: true,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 185.4,
    change: -0.9,
    pct: -0.48,
    up: false,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 172.3,
    change: 1.8,
    pct: 1.06,
    up: true,
  },
];

const ETFS = [
  {
    symbol: "SPY",
    name: "S&P 500 ETF",
    price: 512.4,
    change: 3.2,
    pct: 0.63,
    up: true,
  },
  {
    symbol: "QQQ",
    name: "Nasdaq-100 ETF",
    price: 438.8,
    change: 5.6,
    pct: 1.29,
    up: true,
  },
  {
    symbol: "VTI",
    name: "Total Market ETF",
    price: 248.9,
    change: 1.4,
    pct: 0.57,
    up: true,
  },
  {
    symbol: "GLD",
    name: "Gold ETF",
    price: 214.7,
    change: 0.9,
    pct: 0.42,
    up: true,
  },
];

const HISTORY = [
  { period: "1 Week", return: "+2.1%", up: true },
  { period: "1 Month", return: "+5.8%", up: true },
  { period: "3 Months", return: "+12.4%", up: true },
  { period: "6 Months", return: "+18.7%", up: true },
  { period: "1 Year", return: "+28.3%", up: true },
  { period: "3 Years", return: "+72.1%", up: true },
  { period: "5 Years", return: "+142%", up: true },
  { period: "YTD", return: "+9.4%", up: true },
];

const FAQS = [
  {
    q: "Can I buy fractional shares?",
    a: "Yes. You can buy fractional shares starting from just $1. Own a piece of any stock regardless of its price per share.",
  },
  {
    q: "Are dividends paid out?",
    a: "Yes. All dividends are automatically credited to your account on the ex-dividend date. You can reinvest them automatically.",
  },
  {
    q: "What markets do you cover?",
    a: "We cover US (NYSE, NASDAQ), UK (LSE), EU (Euronext), and select Asian markets. More exchanges are added regularly.",
  },
  {
    q: "What are the trading fees?",
    a: "Stock trading starts at 0.1% commission with zero platform fees. ETFs are free to trade with no commission.",
  },
  {
    q: "Can I trade outside market hours?",
    a: "Pre-market and after-hours trading are available for US stocks from 4am–8pm EST.",
  },
];

const FEATURES = [
  {
    icon: BarChart2,
    title: "Global Markets",
    desc: "Access stocks from NYSE, NASDAQ, LSE, Euronext and Asian exchanges from a single account.",
  },
  {
    icon: DollarSign,
    title: "Fractional Shares",
    desc: "Invest in any company with as little as $1. Own fractions of high-priced stocks like NVDA and AMZN.",
  },
  {
    icon: TrendingUp,
    title: "Dividend Reinvestment",
    desc: "Automatically reinvest dividends to compound your returns without any manual intervention.",
  },
  {
    icon: Shield,
    title: "SIPC Protected",
    desc: "Your stock holdings are protected up to $500,000 by SIPC insurance — industry-standard protection.",
  },
  {
    icon: Zap,
    title: "Commission-Free ETFs",
    desc: "Trade any ETF on our platform with zero commission. Build a diversified portfolio at zero cost.",
  },
  {
    icon: Globe,
    title: "Extended Hours",
    desc: "Pre-market and after-hours trading available. Trade US stocks from 4am to 8pm EST.",
  },
];

export default function StocksFunds() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const STOCKS = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 189.3,
      change: 1.24,
      pct: 0.66,
      up: true,
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: 248.5,
      change: -3.1,
      pct: -1.23,
      up: false,
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      price: 875.2,
      change: 14.8,
      pct: 1.72,
      up: true,
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      price: 415.6,
      change: 2.3,
      pct: 0.56,
      up: true,
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      price: 185.4,
      change: -0.9,
      pct: -0.48,
      up: false,
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 172.3,
      change: 1.8,
      pct: 1.06,
      up: true,
    },
  ];

  const ETFS = [
    {
      symbol: "SPY",
      name: "S&P 500 ETF",
      price: 512.4,
      change: 3.2,
      pct: 0.63,
      up: true,
    },
    {
      symbol: "QQQ",
      name: "Nasdaq-100 ETF",
      price: 438.8,
      change: 5.6,
      pct: 1.29,
      up: true,
    },
    {
      symbol: "VTI",
      name: "Total Market ETF",
      price: 248.9,
      change: 1.4,
      pct: 0.57,
      up: true,
    },
    {
      symbol: "GLD",
      name: "Gold ETF",
      price: 214.7,
      change: 0.9,
      pct: 0.42,
      up: true,
    },
  ];

  const [stocks, setStocks] = useState(STOCKS);
  const [etfs, setEtfs] = useState(ETFS);
  const [tab, setTab] = useState("stocks");
  const [side, setSide] = useState("buy");
  const [symbol, setSymbol] = useState("AAPL");
  const [amount, setAmount] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Live price updates
  useEffect(() => {
    const iv = setInterval(() => {
      setStocks((prev) =>
        prev.map((s) => {
          const delta = (Math.random() - 0.49) * s.price * 0.003;
          const next = parseFloat((s.price + delta).toFixed(2));
          const diff = parseFloat((next - s.price + s.change).toFixed(2));
          return {
            ...s,
            price: next,
            change: diff,
            pct: parseFloat(((diff / next) * 100).toFixed(2)),
            up: diff >= 0,
          };
        }),
      );
      setEtfs((prev) =>
        prev.map((e) => {
          const delta = (Math.random() - 0.49) * e.price * 0.002;
          const next = parseFloat((e.price + delta).toFixed(2));
          const diff = parseFloat((next - e.price + e.change).toFixed(2));
          return {
            ...e,
            price: next,
            change: diff,
            pct: parseFloat(((diff / next) * 100).toFixed(2)),
            up: diff >= 0,
          };
        }),
      );
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  // Translated data arrays
  const HISTORY = [
    { period: t("one_week"), return: "+2.1%", up: true },
    { period: t("one_month"), return: "+5.8%", up: true },
    { period: t("three_months"), return: "+12.4%", up: true },
    { period: t("six_months"), return: "+18.7%", up: true },
    { period: t("one_year_short"), return: "+28.3%", up: true },
    { period: t("three_years_short"), return: "+72.1%", up: true },
    { period: t("five_years_short"), return: "+142%", up: true },
    { period: t("ytd"), return: "+9.4%", up: true },
  ];

  const FAQS = [
    { q: t("stocks_fractional_shares_q"), a: t("stocks_fractional_shares_a") },
    { q: t("stocks_dividends_q"), a: t("stocks_dividends_a") },
    { q: t("stocks_markets_cover_q"), a: t("stocks_markets_cover_a") },
    { q: t("stocks_trading_fees_q"), a: t("stocks_trading_fees_a") },
    { q: t("stocks_after_hours_q"), a: t("stocks_after_hours_a") },
  ];

  const FEATURES = [
    {
      icon: BarChart2,
      title: t("stocks_feature_global_markets"),
      desc: t("stocks_feature_global_markets_desc"),
    },
    {
      icon: DollarSign,
      title: t("stocks_feature_fractional_shares"),
      desc: t("stocks_feature_fractional_shares_desc"),
    },
    {
      icon: TrendingUp,
      title: t("stocks_feature_dividend_reinvestment"),
      desc: t("stocks_feature_dividend_reinvestment_desc"),
    },
    {
      icon: Shield,
      title: t("stocks_feature_sipc_protected"),
      desc: t("stocks_feature_sipc_protected_desc"),
    },
    {
      icon: Zap,
      title: t("stocks_feature_commission_free_etfs"),
      desc: t("stocks_feature_commission_free_etfs_desc"),
    },
    {
      icon: Globe,
      title: t("stocks_feature_extended_hours"),
      desc: t("stocks_feature_extended_hours_desc"),
    },
  ];

  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const inputBg = darkMode ? "rgba(15,23,42,0.6)" : "rgba(248,250,252,0.9)";
  const border = "rgba(96,165,250,0.18)";
  const activeData = tab === "stocks" ? stocks : etfs;

  const selectedStock =
    [...stocks, ...etfs].find((s) => s.symbol === symbol) || stocks[0];
  const shares =
    amount && selectedStock
      ? (parseFloat(amount) / selectedStock.price).toFixed(6)
      : "";

  const STATS = [
    {
      value: "5,000+",
      label: t("stocks_stats_stocks_etfs"),
      icon: BarChart2,
      color: "#60a5fa",
    },
    {
      value: "12+",
      label: t("stocks_stats_global_exchanges"),
      icon: Globe,
      color: "#f59e0b",
    },
    {
      value: "+28%",
      label: t("stocks_stats_avg_return"),
      icon: TrendingUp,
      color: "#34d399",
    },
    {
      value: "$1",
      label: t("stocks_stats_min_investment"),
      icon: DollarSign,
      color: "#a78bfa",
    },
  ];

  return (
    <FeaturePage>
      {/* Auth Modal */}
      {showAuthModal && (
        <div
          onClick={() => setShowAuthModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: darkMode ? "#0f172a" : "#ffffff",
              border: `1px solid rgba(96,165,250,0.25)`,
              borderRadius: 24,
              padding: "40px 32px",
              maxWidth: 400,
              width: "100%",
              textAlign: "center",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: mutedClr,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 4,
              }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>

            {/* Icon */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(96,165,250,0.12)",
                border: "1px solid rgba(96,165,250,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <BarChart2 style={{ width: 24, height: 24, color: "#60a5fa" }} />
            </div>

            <h3
              style={{
                fontFamily: '"Playfair Display",serif',
                fontWeight: 700,
                fontSize: "1.4rem",
                color: textClr,
                marginBottom: 8,
              }}
            >
              {t("stocks_ready_to_trade")}{" "}
              <span style={{ color: "#60a5fa", fontFamily: "monospace" }}>
                {symbol}
              </span>
              ?
            </h3>
            <p
              style={{
                color: mutedClr,
                fontSize: "0.875rem",
                lineHeight: 1.6,
                marginBottom: 28,
              }}
            >
              {t("stocks_auth_modal_desc")}{" "}
              {side === "buy" ? t("buying") : t("selling")}{" "}
              {t("stocks_and_etfs")} {t("in_seconds")}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => navigate("/login")}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 14,
                  border: "none",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: "linear-gradient(135deg,#3b82f6,#60a5fa)",
                  color: "#fff",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(96,165,250,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {t("stocks_log_in_to_trade")}
              </button>
              <button
                onClick={() => navigate("/register")}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 14,
                  border: `1px solid rgba(96,165,250,0.3)`,
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "transparent",
                  color: "#60a5fa",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(96,165,250,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {t("stocks_create_free_account")}
              </button>
            </div>

            <p
              style={{
                color: mutedClr,
                fontSize: "0.72rem",
                marginTop: 16,
              }}
            >
              {t("stocks_free_to_join")}
            </p>
          </div>
        </div>
      )}

      <FeatureHero
        badge={t("stocks_funds")}
        title={t("stocks_invest_title")}
        highlight={t("stocks_invest_highlight")}
        subtitle={t("stocks_subtitle_desc")}
        icon={BarChart2}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Market table + Buy form */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            marginBottom: 48,
          }}
        >
          {/* Market table */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            {/* Tabs */}
            <div
              style={{
                display: "flex",
                borderBottom: `1px solid ${darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
              }}
            >
              {["stocks", "etfs"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background:
                      tab === t ? "rgba(96,165,250,0.1)" : "transparent",
                    border: "none",
                    borderBottom:
                      tab === t ? "2px solid #60a5fa" : "2px solid transparent",
                    color: tab === t ? "#60a5fa" : mutedClr,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.2s",
                  }}
                >
                  {t === "stocks" ? "Stocks" : "ETFs & Funds"}
                </button>
              ))}
            </div>

            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 90px 100px",
                gap: 8,
                padding: "12px 16px",
                color: mutedClr,
                fontSize: "0.7rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                borderBottom: `1px solid ${darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
              }}
            >
              <div>{t("stocks_symbol")}</div>
              <div style={{ textAlign: "right" }}>{t("price")}</div>
              <div style={{ textAlign: "right" }}>{t("change")}</div>
            </div>

            {activeData.map((s, i) => (
              <div
                key={s.symbol}
                onClick={() => setSymbol(s.symbol)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 90px 100px",
                  gap: 8,
                  padding: "12px 16px",
                  borderBottom:
                    i < activeData.length - 1
                      ? `1px solid ${darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`
                      : "none",
                  alignItems: "center",
                  cursor: "pointer",
                  background:
                    symbol === s.symbol
                      ? "rgba(96,165,250,0.07)"
                      : "transparent",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (symbol !== s.symbol)
                    e.currentTarget.style.background = "rgba(96,165,250,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (symbol !== s.symbol)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <div>
                  <div
                    style={{
                      color: textClr,
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      fontFamily: "monospace",
                    }}
                  >
                    {s.symbol}
                  </div>
                  <div
                    style={{
                      color: mutedClr,
                      fontSize: "0.7rem",
                      marginTop: 1,
                    }}
                  >
                    {s.name}
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    color: textClr,
                    fontFamily: "monospace",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  ${s.price.toFixed(2)}
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                      fontSize: "0.78rem",
                      fontFamily: "monospace",
                      fontWeight: 600,
                      color: s.up ? "#34d399" : "#f87171",
                    }}
                  >
                    {s.up ? (
                      <TrendingUp style={{ width: 11, height: 11 }} />
                    ) : (
                      <TrendingDown style={{ width: 11, height: 11 }} />
                    )}
                    {s.up ? "+" : ""}
                    {s.pct.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Buy/Sell form */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "24px",
            }}
          >
            <h3
              style={{
                color: textClr,
                fontWeight: 700,
                fontSize: "1.05rem",
                marginBottom: 6,
                fontFamily: '"Playfair Display",serif',
              }}
            >
              {t("stocks_trade_stocks")}
            </h3>
            <div
              style={{ color: mutedClr, fontSize: "0.8rem", marginBottom: 18 }}
            >
              {t("stocks_selected")}:{" "}
              <span
                style={{
                  color: "#60a5fa",
                  fontWeight: 600,
                  fontFamily: "monospace",
                }}
              >
                {symbol}
              </span>{" "}
              · ${selectedStock.price.toFixed(2)}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 18,
              }}
            >
              {["buy", "sell"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  style={{
                    padding: "10px",
                    borderRadius: 12,
                    border: `1px solid ${side === s ? (s === "buy" ? "rgba(52,211,153,0.5)" : "rgba(239,68,68,0.5)") : border}`,
                    background:
                      side === s
                        ? s === "buy"
                          ? "rgba(52,211,153,0.15)"
                          : "rgba(239,68,68,0.15)"
                        : "transparent",
                    color:
                      side === s
                        ? s === "buy"
                          ? "#34d399"
                          : "#f87171"
                        : mutedClr,
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {s === "buy" ? "↑ Buy" : "↓ Sell"}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  color: mutedClr,
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {t("amount_usd")}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width: "100%",
                  background: inputBg,
                  border: `1px solid ${border}`,
                  borderRadius: 12,
                  padding: "11px 14px",
                  color: textClr,
                  fontSize: "0.95rem",
                  outline: "none",
                  fontFamily: "monospace",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#60a5fa";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = border;
                }}
              />
            </div>

            {shares && (
              <div
                style={{
                  background: "rgba(96,165,250,0.07)",
                  border: "1px solid rgba(96,165,250,0.2)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  marginBottom: 14,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ color: mutedClr, fontSize: "0.8rem" }}>
                  {t("you_receive")}
                </span>
                <span
                  style={{
                    color: "#60a5fa",
                    fontWeight: 700,
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                  }}
                >
                  {shares} {symbol} shares
                </span>
              </div>
            )}

            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 14,
                border: "none",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
                background: "linear-gradient(135deg,#3b82f6,#60a5fa)",
                color: "#fff",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(96,165,250,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {side === "buy" ? `↑ Buy ${symbol}` : `↓ Sell ${symbol}`}
            </button>
            <p
              style={{
                color: mutedClr,
                fontSize: "0.72rem",
                textAlign: "center",
                marginTop: 10,
              }}
            >
              {t("stocks_commission_footer")}
            </p>
          </div>
        </div>

        {/* Historical returns */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 6,
          }}
        >
          {t("stocks_sp500_historical")}{" "}
          <span className="gold-text">{t("returns")}</span>
        </h2>
        <p style={{ color: mutedClr, fontSize: "0.875rem", marginBottom: 20 }}>
          {t("stocks_sp500_desc")}
        </p>
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            overflow: "auto",
            marginBottom: 48,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              minWidth: 600,
            }}
          >
            {HISTORY.map((h, i) => (
              <div
                key={h.period}
                style={{
                  padding: "20px 12px",
                  textAlign: "center",
                  borderRight:
                    i < HISTORY.length - 1
                      ? `1px solid ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`
                      : "none",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(96,165,250,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  style={{
                    color: mutedClr,
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {h.period}
                </div>
                <div
                  style={{
                    color: h.up ? "#34d399" : "#f87171",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                  }}
                >
                  {h.return}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 20,
          }}
        >
          {t("stocks_why_stocks_on")}{" "}
          <span className="gold-text">AxionTrade</span>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>

        {/* FAQ */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 20,
          }}
        >
          {t("frequently_asked_questions")}{" "}
          <span className="gold-text">{t("questions")}</span>
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 60,
          }}
        >
          {FAQS.map((f, i) => (
            <div
              key={i}
              style={{
                background: cardBg,
                border: `1px solid ${openFaq === i ? "rgba(96,165,250,0.35)" : border}`,
                borderRadius: 16,
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 20px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    color: textClr,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {f.q}
                </span>
                {openFaq === i ? (
                  <ChevronUp
                    style={{
                      width: 16,
                      height: 16,
                      color: "#60a5fa",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <ChevronDown
                    style={{
                      width: 16,
                      height: 16,
                      color: mutedClr,
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
              {openFaq === i && (
                <div
                  style={{
                    padding: "0 20px 18px",
                    color: mutedClr,
                    fontSize: "0.875rem",
                    lineHeight: 1.7,
                  }}
                >
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <CTABanner
        title={t("stocks_start_investing_today")}
        subtitle={t("stocks_start_investing_subtitle")}
      />
    </FeaturePage>
  );
}
