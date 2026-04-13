import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Zap,
  BarChart3,
  Shield,
  Globe,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  FeaturePage,
  FeatureHero,
  StatCard,
  FeatureCard,
  CTABanner,
} from "../features/FeatureLayout";
import api from "../../services/apiService";

// ─── Same cgId map as TradePage / SpotTrading ────────────────────────────────
const EXCHANGE_PAIRS = [
  { symbol: "BTCUSDT", label: "BTC/USDT", cgId: "bitcoin", base: "BTC" },
  { symbol: "ETHUSDT", label: "ETH/USDT", cgId: "ethereum", base: "ETH" },
  { symbol: "SOLUSDT", label: "SOL/USDT", cgId: "solana", base: "SOL" },
  { symbol: "BNBUSDT", label: "BNB/USDT", cgId: "binancecoin", base: "BNB" },
  { symbol: "AVAXUSDT", label: "AVAX/USDT", cgId: "avalanche-2", base: "AVAX" },
  { symbol: "DOGEUSDT", label: "DOGE/USDT", cgId: "dogecoin", base: "DOGE" },
  { symbol: "XRPUSDT", label: "XRP/USDT", cgId: "ripple", base: "XRP" },
  { symbol: "ADAUSDT", label: "ADA/USDT", cgId: "cardano", base: "ADA" },
];

// Same image map as TradePage / SpotTrading
const COIN_IMAGES = {
  BTCUSDT: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETHUSDT: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOLUSDT: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  BNBUSDT:
    "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  AVAXUSDT:
    "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  DOGEUSDT: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  XRPUSDT:
    "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  ADAUSDT: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
};

// Static volume labels (volume isn't in /prices endpoint)
const VOL_LABELS = {
  BTCUSDT: "$38.4B",
  ETHUSDT: "$18.2B",
  SOLUSDT: "$4.8B",
  BNBUSDT: "$2.1B",
  AVAXUSDT: "$890M",
  DOGEUSDT: "$1.2B",
  XRPUSDT: "$3.1B",
  ADAUSDT: "$720M",
};

const FEATURES = [
  {
    icon: Zap,
    title: "Ultra-Low Latency",
    desc: "Sub-10ms order matching engine co-located near major exchanges for the fastest possible execution.",
  },
  {
    icon: BarChart3,
    title: "Deep Liquidity",
    desc: "Access deep order books with tight spreads across 200+ trading pairs, 24 hours a day.",
  },
  {
    icon: Shield,
    title: "Secure Trading",
    desc: "Every trade is protected by multi-layer security, 2FA verification, and real-time fraud monitoring.",
  },
  {
    icon: Globe,
    title: "200+ Markets",
    desc: "Trade crypto, tokenised stocks, gold, and more from a single unified exchange interface.",
  },
];

const STATS = [
  { value: "$5B+", label: "Daily Volume", icon: TrendingUp, color: "#f59e0b" },
  {
    value: "200+",
    label: "Trading Pairs",
    icon: ArrowLeftRight,
    color: "#34d399",
  },
  { value: "<10ms", label: "Execution Speed", icon: Zap, color: "#60a5fa" },
  { value: "99.9%", label: "Uptime", icon: Shield, color: "#a78bfa" },
];

function fmtPrice(p) {
  if (!p) return "—";
  if (p >= 1000)
    return p.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (p >= 1) return p.toFixed(4);
  return p.toFixed(6);
}

export default function Exchange() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  // prices shape: { bitcoin: { usd, usd_24h_change }, ... }
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpd, setLastUpd] = useState(null);
  const timerRef = useRef(null);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await api.get("/markets/prices");
      const data = res.data?.data || res.data || {};
      setPrices(data);
      setLastUpd(new Date());
      setError(null);
    } catch (err) {
      console.error("[Exchange] fetchPrices:", err.message);
      setError("Live data unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    timerRef.current = setInterval(fetchPrices, 30_000);
    return () => clearInterval(timerRef.current);
  }, [fetchPrices]);

  // Build rows from live prices
  const rows = EXCHANGE_PAIRS.map((p) => {
    const d = prices[p.cgId] || {};
    const chg = d.usd_24h_change || 0;
    return {
      ...p,
      price: d.usd || 0,
      change: chg,
      up: chg >= 0,
      vol: VOL_LABELS[p.symbol] || "—",
    };
  });

  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const border = "rgba(245,158,11,0.18)";
  const divLine = darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

  const skeletonStyle = {
    borderRadius: 4,
    background: darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    animation: "exPulse 1.4s ease-in-out infinite",
  };

  return (
    <FeaturePage>
      <style>{`@keyframes exPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      <FeatureHero
        badge={t("exchange")}
        title={t("trade_on_the")}
        highlight={t("axiontrade_exchange")}
        subtitle={t("exchange_subtitle")}
        icon={ArrowLeftRight}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
        {/* Stats */}
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

        {/* Section heading + live status */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <h2
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 700,
              fontSize: "1.5rem",
              color: textClr,
              margin: 0,
            }}
          >
            {t("live")} <span className="gold-text">{t("markets")}</span>
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {error ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: "#f87171",
                  fontSize: "0.72rem",
                }}
              >
                <AlertCircle style={{ width: 12, height: 12 }} /> {error}
              </span>
            ) : loading ? (
              <span style={{ color: mutedClr, fontSize: "0.72rem" }}>
                Loading…
              </span>
            ) : (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  color: "#34d399",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#34d399",
                    display: "inline-block",
                  }}
                />
                LIVE
                {lastUpd &&
                  ` · ${lastUpd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
              </span>
            )}
            <button
              onClick={fetchPrices}
              title="Refresh"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: mutedClr,
                display: "flex",
                padding: 2,
              }}
            >
              <RefreshCw style={{ width: 12, height: 12 }} />
            </button>
          </div>
        </div>

        <p style={{ color: mutedClr, fontSize: "0.875rem", marginBottom: 20 }}>
          {t("top_trading_pairs")}
        </p>

        {/* Live market table */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            overflow: "auto",
            marginBottom: 48,
          }}
        >
          <div style={{ minWidth: 500 }}>
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 120px 100px 100px 110px",
                gap: 12,
                padding: "13px 20px",
                borderBottom: `1px solid ${divLine}`,
                color: mutedClr,
                fontSize: "0.72rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <div>{t("pair")}</div>
              <div style={{ textAlign: "right" }}>{t("price")}</div>
              <div style={{ textAlign: "right" }}>{t("twenty_four_h")}</div>
              <div style={{ textAlign: "right" }}>{t("volume")}</div>
              <div style={{ textAlign: "right" }}>{t("action")}</div>
            </div>

            {/* Skeleton rows while loading */}
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.4fr 120px 100px 100px 110px",
                      gap: 12,
                      padding: "15px 20px",
                      borderBottom: `1px solid ${divLine}`,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          flexShrink: 0,
                          ...skeletonStyle,
                        }}
                      />
                      <div
                        style={{ height: 14, width: 80, ...skeletonStyle }}
                      />
                    </div>
                    <div
                      style={{
                        height: 14,
                        width: 80,
                        marginLeft: "auto",
                        ...skeletonStyle,
                      }}
                    />
                    <div
                      style={{
                        height: 14,
                        width: 60,
                        marginLeft: "auto",
                        ...skeletonStyle,
                      }}
                    />
                    <div
                      style={{
                        height: 14,
                        width: 50,
                        marginLeft: "auto",
                        ...skeletonStyle,
                      }}
                    />
                    <div
                      style={{
                        height: 28,
                        width: 70,
                        marginLeft: "auto",
                        borderRadius: 8,
                        ...skeletonStyle,
                      }}
                    />
                  </div>
                ))
              : rows.map((p, i) => (
                  <div
                    key={p.symbol}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.4fr 120px 100px 100px 110px",
                      gap: 12,
                      padding: "13px 20px",
                      borderBottom:
                        i < rows.length - 1 ? `1px solid ${divLine}` : "none",
                      alignItems: "center",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(245,158,11,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Pair — with coin image */}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          flexShrink: 0,
                          overflow: "hidden",
                          background: darkMode
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(0,0,0,0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {COIN_IMAGES[p.symbol] ? (
                          <img
                            src={COIN_IMAGES[p.symbol]}
                            alt={p.base}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentNode.innerHTML = `<span style="font-size:0.6rem;font-weight:800;color:${mutedClr};font-family:monospace">${p.base.slice(0, 3)}</span>`;
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: "0.6rem",
                              fontWeight: 800,
                              color: mutedClr,
                              fontFamily: "monospace",
                            }}
                          >
                            {p.base.slice(0, 3)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div
                          style={{
                            color: textClr,
                            fontWeight: 700,
                            fontFamily: "monospace",
                            fontSize: "0.875rem",
                          }}
                        >
                          {p.label}
                        </div>
                        <div
                          style={{
                            color: mutedClr,
                            fontSize: "0.65rem",
                            marginTop: 1,
                          }}
                        >
                          {p.base}
                        </div>
                      </div>
                    </div>

                    {/* Price — live from API */}
                    <div
                      style={{
                        textAlign: "right",
                        color: textClr,
                        fontFamily: "monospace",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                      }}
                    >
                      {p.price ? `$${fmtPrice(p.price)}` : "—"}
                    </div>

                    {/* 24h change — live from API */}
                    <div style={{ textAlign: "right" }}>
                      {p.price ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                            fontSize: "0.78rem",
                            fontFamily: "monospace",
                            fontWeight: 600,
                            color: p.up ? "#34d399" : "#f87171",
                          }}
                        >
                          {p.up ? (
                            <TrendingUp style={{ width: 11, height: 11 }} />
                          ) : (
                            <TrendingDown style={{ width: 11, height: 11 }} />
                          )}
                          {p.up ? "+" : ""}
                          {p.change.toFixed(2)}%
                        </span>
                      ) : (
                        <span style={{ color: mutedClr, fontSize: "0.78rem" }}>
                          —
                        </span>
                      )}
                    </div>

                    {/* Volume (static label) */}
                    <div
                      style={{
                        textAlign: "right",
                        color: mutedClr,
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                      }}
                    >
                      {p.vol}
                    </div>

                    {/* Trade button */}
                    <div style={{ textAlign: "right" }}>
                      <button
                        className="gold-btn"
                        onClick={() => navigate(`/trade/${p.symbol}`)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          border: "none",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        {t("trade")}
                      </button>
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
          {t("exchange")} <span className="gold-text">{t("features")}</span>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
        title={t("start_trading_exchange")}
        subtitle={t("start_trading_exchange_subtitle")}
      />
    </FeaturePage>
  );
}
