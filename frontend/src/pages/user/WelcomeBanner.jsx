import React, { useEffect, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../services/apiService";

//  Crypto config
const ASSETS = [
  {
    key: "USD",
    labelKey: "us_dollar",
    symbol: "$",
    color: "#34d399",
    coingecko: null, // USD is the base — always $1
    icon: () => (
      <svg viewBox="0 0 32 32" width="22" height="22">
        <circle cx="16" cy="16" r="16" fill="#34d399" opacity="0.15" />
        <text
          x="16"
          y="21"
          textAnchor="middle"
          fontSize="14"
          fontWeight="800"
          fill="#34d399"
        >
          $
        </text>
      </svg>
    ),
  },
  {
    key: "USDT",
    labelKey: "tether",
    symbol: "₮",
    color: "#26a17b",
    coingecko: null,
    icon: () => (
      <svg viewBox="0 0 32 32" width="22" height="22">
        <circle cx="16" cy="16" r="16" fill="#26a17b" opacity="0.18" />
        <text
          x="16"
          y="21"
          textAnchor="middle"
          fontSize="13"
          fontWeight="800"
          fill="#26a17b"
        >
          ₮
        </text>
      </svg>
    ),
  },
  {
    key: "BTC",
    labelKey: "bitcoin",
    symbol: "₿",
    color: "#f7931a",
    coingecko: "bitcoin",
    icon: () => (
      <svg viewBox="0 0 32 32" width="22" height="22">
        <circle cx="16" cy="16" r="16" fill="#f7931a" opacity="0.18" />
        <text
          x="16"
          y="21"
          textAnchor="middle"
          fontSize="14"
          fontWeight="800"
          fill="#f7931a"
        >
          ₿
        </text>
      </svg>
    ),
  },
  {
    key: "ETH",
    labelKey: "ethereum",
    symbol: "Ξ",
    color: "#627eea",
    coingecko: "ethereum",
    icon: () => (
      <svg viewBox="0 0 32 32" width="22" height="22">
        <circle cx="16" cy="16" r="16" fill="#627eea" opacity="0.18" />
        <path
          d="M16 6l-6.5 10.5L16 20l6.5-3.5L16 6z"
          fill="#627eea"
          opacity="0.6"
        />
        <path d="M9.5 16.5L16 26l6.5-9.5L16 20l-6.5-3.5z" fill="#627eea" />
      </svg>
    ),
  },
  {
    key: "SOL",
    labelKey: "solana",
    symbol: "S",
    color: "#9945ff",
    coingecko: "solana",
    icon: () => (
      <svg viewBox="0 0 32 32" width="22" height="22">
        <circle cx="16" cy="16" r="16" fill="#9945ff" opacity="0.18" />
        <rect
          x="8"
          y="10"
          width="16"
          height="3"
          rx="1.5"
          fill="#9945ff"
          opacity="0.6"
        />
        <rect x="8" y="14.5" width="16" height="3" rx="1.5" fill="#9945ff" />
        <rect
          x="8"
          y="19"
          width="16"
          height="3"
          rx="1.5"
          fill="#9945ff"
          opacity="0.6"
        />
      </svg>
    ),
  },
  {
    key: "BNB",
    labelKey: "bnb",
    symbol: "B",
    color: "#F3BA2F",
    coingecko: "binancecoin",
    icon: () => (
      <svg viewBox="0 0 32 32" width="22" height="22">
        <circle cx="16" cy="16" r="16" fill="#F3BA2F" opacity="0.18" />
        <text
          x="16"
          y="21"
          textAnchor="middle"
          fontSize="9"
          fontWeight="800"
          fill="#F3BA2F"
        >
          BNB
        </text>
      </svg>
    ),
  },
];

const kycDisplay = (status, t) => {
  switch (status) {
    case "approved":
      return { labelKey: "verified", color: "#34d399" };
    case "pending":
      return { labelKey: "pending", color: "#f59e0b" };
    case "rejected":
      return { labelKey: "rejected", color: "#f87171" };
    default:
      return { labelKey: "unverified", color: "#f87171" };
  }
};

function fmt(n, decimals = 2) {
  if (n === undefined || n === null) return "0.00";
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtCrypto(n, key) {
  if (!n) return "0";
  if (key === "BTC") return Number(n).toFixed(6);
  if (key === "ETH" || key === "SOL" || key === "BNB")
    return Number(n).toFixed(4);
  return Number(n).toFixed(2);
}

// Component
export default function WelcomeBanner() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [prices, setPrices] = useState({});
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceChange, setPriceChange] = useState({});
  const [activeAsset, setActiveAsset] = useState("USD");

  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.95)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  const kyc = kycDisplay(user?.kyc?.status, t);
  const balances = React.useMemo(
    () => ({
      USD: user?.wallet?.balances?.USD || 0,
      USDT: user?.wallet?.balances?.USDT || 0,
      BTC: user?.wallet?.balances?.BTC || 0,
      ETH: user?.wallet?.balances?.ETH || 0,
      SOL: user?.wallet?.balances?.SOL || 0,
      BNB: user?.wallet?.balances?.BNB || 0,
    }),
    [user],
  );

  const fetchPrices = async () => {
    setPriceLoading(true);
    try {
      const res = await api.get("/markets/prices");
      const data = res.data?.data || res.data;

      const p = {},
        c = {};
      ASSETS.forEach((a) => {
        if (a.coingecko && data[a.coingecko]) {
          p[a.key] = data[a.coingecko].usd;
          c[a.key] = data[a.coingecko].usd_24h_change;
        }
      });
      setPrices(p);
      setPriceChange(c);
    } catch {
      // silently fail
    } finally {
      setPriceLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  // Convert any asset balance to USD
  const toUSD = (key, amount) => {
    if (!amount) return 0;
    if (key === "USD" || key === "USDT") return amount;
    const rate = prices[key];
    return rate ? amount * rate : null;
  };

  // Total portfolio in USD
  const totalUSD = ASSETS.reduce((sum, a) => {
    const val = toUSD(a.key, balances[a.key] || 0);
    return sum + (val || 0);
  }, 0);

  const updatedAt = user?.updatedAt ? new Date(user.updatedAt) : null;
  const lastUpdatedStr = updatedAt
    ? updatedAt.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const active = ASSETS.find((a) => a.key === activeAsset) || ASSETS[0];
  const activeBalance = balances[activeAsset] || 0;
  const activeUSD = toUSD(activeAsset, activeBalance);
  const activeChange = priceChange[activeAsset];

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))",
        border: "1px solid rgba(245,158,11,0.18)",
        borderRadius: 22,
        padding: "24px",
        marginBottom: 28,
      }}
    >
      {/* Thin scroll */}
      <style>{`
      .asset-tabs::-webkit-scrollbar { height: 3px; }
      .asset-tabs::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.25); border-radius: 99px; }
      .asset-tabs { scrollbar-width: thin; scrollbar-color: rgba(245,158,11,0.25) transparent; }
    `}</style>

      {/* Top row: greeting + total */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 22,
        }}
      >
        {/* Left: greeting */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{ color: "#f59e0b", fontSize: "0.78rem", fontWeight: 600 }}
            >
              {t("welcome_back")} 👋
            </span>
            {lastUpdatedStr && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: darkMode
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.04)",
                  fontSize: "0.62rem",
                  color: mutedClr,
                }}
              >
                <Clock style={{ width: 9, height: 9 }} />
                {lastUpdatedStr}
              </span>
            )}
          </div>
          <h1
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 800,
              fontSize: "clamp(1.3rem,3vw,1.8rem)",
              color: textClr,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {user?.firstName} {user?.lastName}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 6,
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: mutedClr, fontSize: "0.78rem" }}>
              {user?.email}
            </span>
            <span
              style={{
                padding: "2px 9px",
                borderRadius: 99,
                background: `${kyc.color}18`,
                color: kyc.color,
                fontSize: "0.68rem",
                fontWeight: 700,
              }}
            >
              KYC: {t(kyc.labelKey)}
            </span>
          </div>
        </div>

        {/* Right: total portfolio */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 16,
            padding: "14px 20px",
            minWidth: 190,
          }}
        >
          <div
            style={{
              color: mutedClr,
              fontSize: "0.65rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 4,
            }}
          >
            {t("total_portfolio")}
          </div>
          <div
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 800,
              fontSize: "1.4rem",
              color: "#f59e0b",
              letterSpacing: "-0.5px",
            }}
          >
            ${fmt(totalUSD)}
          </div>
          <div style={{ color: mutedClr, fontSize: "0.68rem", marginTop: 2 }}>
            {t("across_assets", {
              count:
                ASSETS.filter((a) => (balances[a.key] || 0) > 0).length || 1,
            })}
          </div>
        </div>
      </div>

      {/* Asset tabs */}
      <div
        className="asset-tabs"
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          overflowX: "auto",
          paddingBottom: 2,
        }}
      >
        {ASSETS.map((a) => {
          const bal = balances[a.key] || 0;
          const active = activeAsset === a.key;
          return (
            <button
              key={a.key}
              onClick={() => setActiveAsset(a.key)}
              style={{
                flexShrink: 0,
                padding: "7px 14px",
                borderRadius: 10,
                border: `1px solid ${active ? a.color : border}`,
                background: active ? `${a.color}15` : "transparent",
                color: active ? a.color : mutedClr,
                fontWeight: active ? 700 : 500,
                fontSize: "0.78rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s",
              }}
            >
              <a.icon />
              {a.key}
              {bal > 0 && (
                <span
                  style={{
                    padding: "1px 5px",
                    borderRadius: 5,
                    background: active
                      ? `${a.color}25`
                      : darkMode
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.05)",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                  }}
                >
                  {fmtCrypto(bal, a.key)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/*  Selected asset detail card */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 16,
          padding: "16px 20px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {/* Icon + balance */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${active.color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <active.icon />
            </div>
            <div>
              <div
                style={{
                  color: mutedClr,
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  marginBottom: 2,
                }}
              >
                {t(active.labelKey)} {t("balance")}
              </div>
              <div
                style={{
                  fontFamily: '"Playfair Display",serif',
                  fontWeight: 800,
                  fontSize: "1.3rem",
                  color: active.color,
                  letterSpacing: "-0.3px",
                }}
              >
                {active.symbol}
                {fmtCrypto(activeBalance, activeAsset)}
              </div>
              {/* USD equivalent */}
              {activeUSD !== null &&
                activeAsset !== "USD" &&
                activeAsset !== "USDT" && (
                  <div
                    style={{
                      color: mutedClr,
                      fontSize: "0.72rem",
                      marginTop: 1,
                    }}
                  >
                    ≈ ${fmt(activeUSD)} USD
                  </div>
                )}
            </div>
          </div>

          {/* Price + 24h change (for crypto, not USD/USDT) */}
          {prices[activeAsset] && (
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  color: mutedClr,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  marginBottom: 2,
                }}
              >
                {t("market_price")}
              </div>
              <div
                style={{ color: textClr, fontWeight: 700, fontSize: "0.95rem" }}
              >
                ${fmt(prices[activeAsset])}
              </div>
              {activeChange !== undefined && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    justifyContent: "flex-end",
                    marginTop: 2,
                  }}
                >
                  {activeChange >= 0 ? (
                    <TrendingUp
                      style={{ width: 11, height: 11, color: "#34d399" }}
                    />
                  ) : (
                    <TrendingDown
                      style={{ width: 11, height: 11, color: "#f87171" }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: activeChange >= 0 ? "#34d399" : "#f87171",
                    }}
                  >
                    {activeChange >= 0 ? "+" : ""}
                    {fmt(activeChange, 2)}% (24h)
                  </span>
                </div>
              )}
              <button
                onClick={fetchPrices}
                style={{
                  marginTop: 4,
                  background: "none",
                  border: "none",
                  color: mutedClr,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: "0.62rem",
                  padding: 0,
                  marginLeft: "auto",
                }}
              >
                <RefreshCw
                  style={{
                    width: 9,
                    height: 9,
                    animation: priceLoading
                      ? "spin 1s linear infinite"
                      : "none",
                  }}
                />
                {t("refresh")}
              </button>
            </div>
          )}
        </div>

        {/* Mini breakdown of other balances */}
        {ASSETS.filter(
          (a) => a.key !== activeAsset && (balances[a.key] || 0) > 0,
        ).length > 0 && (
          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: `1px solid ${divLine}`,
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {ASSETS.filter(
              (a) => a.key !== activeAsset && (balances[a.key] || 0) > 0,
            ).map((a) => (
              <div
                key={a.key}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <a.icon />
                <div>
                  <div style={{ color: mutedClr, fontSize: "0.62rem" }}>
                    {a.key}
                  </div>
                  <div
                    style={{
                      color: a.color,
                      fontWeight: 700,
                      fontSize: "0.75rem",
                    }}
                  >
                    {fmtCrypto(balances[a.key], a.key)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons  */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => navigate("/deposit")}
          className="gold-btn"
          style={{
            padding: "10px 22px",
            borderRadius: 12,
            border: "none",
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ArrowDownCircle style={{ width: 15, height: 15 }} /> {t("deposit")}
        </button>
        <button
          onClick={() => navigate("/withdraw")}
          style={{
            padding: "10px 22px",
            borderRadius: 12,
            border: `1px solid ${border}`,
            background: "transparent",
            color: textClr,
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ArrowUpCircle style={{ width: 15, height: 15 }} /> {t("withdraw")}
        </button>
      </div>
    </div>
  );
}
