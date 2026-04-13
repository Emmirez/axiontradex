import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  RefreshCw,
  DollarSign,
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

// Same MAP as TradePage
// Pairs shown in the selector
const SPOT_PAIRS = [
  {
    symbol: "BTCUSDT",
    label: "BTC/USDT",
    base: "BTC",
    name: "Bitcoin",
    cgId: "bitcoin",
  },
  {
    symbol: "ETHUSDT",
    label: "ETH/USDT",
    base: "ETH",
    name: "Ethereum",
    cgId: "ethereum",
  },
  {
    symbol: "SOLUSDT",
    label: "SOL/USDT",
    base: "SOL",
    name: "Solana",
    cgId: "solana",
  },
  {
    symbol: "BNBUSDT",
    label: "BNB/USDT",
    base: "BNB",
    name: "BNB",
    cgId: "binancecoin",
  },
  {
    symbol: "XRPUSDT",
    label: "XRP/USDT",
    base: "XRP",
    name: "XRP",
    cgId: "ripple",
  },
  {
    symbol: "ADAUSDT",
    label: "ADA/USDT",
    base: "ADA",
    name: "Cardano",
    cgId: "cardano",
  },
  {
    symbol: "AVAXUSDT",
    label: "AVAX/USDT",
    base: "AVAX",
    name: "Avalanche",
    cgId: "avalanche-2",
  },
  {
    symbol: "DOTUSDT",
    label: "DOT/USDT",
    base: "DOT",
    name: "Polkadot",
    cgId: "polkadot",
  },
  {
    symbol: "LINKUSDT",
    label: "LINK/USDT",
    base: "LINK",
    name: "Chainlink",
    cgId: "chainlink",
  },
  {
    symbol: "DOGEUSDT",
    label: "DOGE/USDT",
    base: "DOGE",
    name: "Dogecoin",
    cgId: "dogecoin",
  },
];

const COIN_IMAGES = {
  BTCUSDT: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETHUSDT: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOLUSDT: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  BNBUSDT:
    "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  XRPUSDT:
    "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  ADAUSDT: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  AVAXUSDT:
    "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  DOTUSDT: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  LINKUSDT:
    "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  DOGEUSDT: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
};

//  Static content
const FEATURES = [
  {
    icon: Zap,
    titleKey: "instant_settlement",
    descKey: "instant_settlement_desc",
  },
  {
    icon: Shield,
    titleKey: "no_hidden_fees",
    descKey: "no_hidden_fees_desc",
  },
  {
    icon: BarChart3,
    titleKey: "advanced_order_types",
    descKey: "advanced_order_types_desc",
  },
  {
    icon: RefreshCw,
    titleKey: "deep_liquidity",
    descKey: "deep_liquidity_desc",
  },
  {
    icon: DollarSign,
    titleKey: "fiat_on_ramp",
    descKey: "fiat_on_ramp_desc",
  },
  {
    icon: TrendingUp,
    titleKey: "two_hundred_plus_pairs",
    descKey: "two_hundred_plus_pairs_desc",
  },
];

const STATS = [
  { value: "200+", label: "Spot Pairs", icon: BarChart3, color: "#f59e0b" },
  { value: "0.08%", label: "Maker Fee", icon: DollarSign, color: "#34d399" },
  { value: "<10ms", label: "Execution", icon: Zap, color: "#60a5fa" },
  { value: "24/7", label: "Market Hours", icon: RefreshCw, color: "#a78bfa" },
];

//  Helpers
function fmtPrice(p) {
  if (p == null || p === 0) return "—";
  if (p >= 1000)
    return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (p >= 1) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(6)}`;
}

// Build a live-feeling order book around the real mid price
function buildOrderBook(mid, rows = 5) {
  if (!mid) return { asks: [], bids: [] };
  const spread = mid * 0.0002;
  const asks = Array.from({ length: rows }, (_, i) => {
    const p = mid + spread * (i + 1) + mid * (Math.random() * 0.0001);
    const size = parseFloat((Math.random() * 2 + 0.05).toFixed(4));
    return {
      price: p.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      rawPrice: p,
      size: size.toFixed(4),
      total: Math.round(p * size).toLocaleString(),
    };
  }).reverse();
  const bids = Array.from({ length: rows }, (_, i) => {
    const p = mid - spread * (i + 1) - mid * (Math.random() * 0.0001);
    const size = parseFloat((Math.random() * 2 + 0.05).toFixed(4));
    return {
      price: p.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      rawPrice: p,
      size: size.toFixed(4),
      total: Math.round(p * size).toLocaleString(),
    };
  });
  return { asks, bids };
}

//  Main Component
export default function SpotTrading() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  // Live market state
  // Shape from /markets/prices: { bitcoin: { usd, usd_24h_change }, ... }
  const [prices, setPrices] = useState({});
  const [loadingMkt, setLoadingMkt] = useState(true);
  const [mktError, setMktError] = useState(null);
  const [lastUpd, setLastUpd] = useState(null);
  const [orderBook, setOrderBook] = useState({ asks: [], bids: [] });

  //  Selected pair (defaults to BTC)
  const [selectedPair, setSelectedPair] = useState(SPOT_PAIRS[0]);

  //  Order form
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [orderType, setOrderType] = useState("market");
  const [limitPrice, setLimitPrice] = useState("");

  const timerRef = useRef(null);
  const obTimer = useRef(null);
  const isLoggedIn = !!localStorage.getItem("token");

  //  Fetch prices identical pattern to TradePage.fetchPrice
  // Uses api.get("/markets/prices") → res.data.data → keyed by cgId
  const fetchPrices = useCallback(async () => {
    try {
      const res = await api.get("/markets/prices");
      // Handles both { data: { bitcoin: ... } } and { bitcoin: ... }
      const data = res.data?.data || res.data || {};
      setPrices(data);
      setLastUpd(new Date());
      setMktError(null);
    } catch (err) {
      console.error("[SpotTrading] fetchPrices:", err.message);
      setMktError(t("live_data_unavailable") || "Live data unavailable");
    } finally {
      setLoadingMkt(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPrices();
    timerRef.current = setInterval(fetchPrices, 30_000);
    return () => clearInterval(timerRef.current);
  }, [fetchPrices]);

  //  Derive current pair live data from prices state 
  const coinData = prices[selectedPair.cgId] || {};
  const currentPrice = coinData.usd || 0;
  const change24h = coinData.usd_24h_change || 0;
  const priceUp = change24h >= 0;

  // ── Refresh order book whenever live price updates ──
  const refreshOB = useCallback(() => {
    if (currentPrice) setOrderBook(buildOrderBook(currentPrice));
  }, [currentPrice]);

  useEffect(() => {
    refreshOB();
    obTimer.current = setInterval(refreshOB, 4_000);
    return () => clearInterval(obTimer.current);
  }, [refreshOB]);

  //  Computed order totals
  const execPrice =
    orderType === "limit" && limitPrice ? parseFloat(limitPrice) : currentPrice;
  const quantity = parseFloat(amount) || 0;
  const total = quantity * execPrice;
  const fee = total * 0.001;
  const totalCost = total + fee;

  const handleTrade = () => {
    if (!isLoggedIn) {
      localStorage.setItem("redirectAfterLogin", "/spot-trading");
      localStorage.setItem(
        "intendedTrade",
        JSON.stringify({
          side,
          amount,
          orderType,
          limitPrice: orderType === "limit" ? limitPrice : null,
        }),
      );
      navigate("/login");
    } else {
      // Logged in — go straight to the full trade page for this pair
      navigate(`/trade/${selectedPair.symbol}`);
    }
  };

  //  Theme tokens
  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const inputBg = darkMode ? "rgba(15,23,42,0.6)" : "rgba(248,250,252,0.9)";
  const border = "rgba(245,158,11,0.18)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  const iStyle = {
    width: "100%",
    background: inputBg,
    border: `1px solid ${border}`,
    borderRadius: 12,
    padding: "10px 14px",
    color: textClr,
    fontSize: "0.875rem",
    outline: "none",
    fontFamily: "monospace",
    boxSizing: "border-box",
  };

  const skeletonStyle = {
    borderRadius: 4,
    background: darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    animation: "spotPulse 1.4s ease-in-out infinite",
  };

  return (
    <FeaturePage>
      <style>{`
        @keyframes spotPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .spot-input:focus      { border-color: #f59e0b !important; }
        .spot-pair-pill:hover  { border-color: rgba(245,158,11,0.5) !important; color: #f59e0b !important; }
        .ob-row-ask:hover      { background: rgba(248,113,113,0.06) !important; cursor: pointer; }
        .ob-row-bid:hover      { background: rgba(52,211,153,0.06)  !important; cursor: pointer; }
        .mkt-row:hover         { background: rgba(245,158,11,0.06)  !important; cursor: pointer; }
        .spot-side-btn:hover   { opacity: 0.85; }
      `}</style>

      <FeatureHero
        badge={t("spot_trading")}
        title={t("spot_trading_title")}
        highlight={t("simplified")}
        subtitle={t("spot_trading_subtitle")}
        icon={BarChart3}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 36,
          }}
        >
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Live status bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {mktError ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: "#f87171",
                fontSize: "0.75rem",
              }}
            >
              <AlertCircle style={{ width: 13, height: 13 }} /> {mktError}
            </span>
          ) : loadingMkt ? (
            <span
              style={{
                color: mutedClr,
                fontSize: "0.72rem",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  display: "inline-block",
                  ...skeletonStyle,
                }}
              />
              Loading live prices…
            </span>
          ) : (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
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

        {/* Pair selector pills */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {SPOT_PAIRS.map((pair) => {
            const pd = prices[pair.cgId];
            const chg = pd?.usd_24h_change || 0;
            const active = pair.symbol === selectedPair.symbol;
            return (
              <button
                key={pair.symbol}
                className="spot-pair-pill"
                onClick={() => setSelectedPair(pair)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: `1px solid ${active ? "#f59e0b" : border}`,
                  background: active ? "rgba(245,158,11,0.12)" : "transparent",
                  color: active ? "#f59e0b" : mutedClr,
                  fontSize: "0.74rem",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  fontFamily: "monospace",
                  whiteSpace: "nowrap",
                }}
              >
                {COIN_IMAGES[pair.symbol] && (
                  <img
                    src={COIN_IMAGES[pair.symbol]}
                    alt={pair.base}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                {pair.label}
                {pd?.usd && (
                  <span
                    style={{
                      color: chg >= 0 ? "#34d399" : "#f87171",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                    }}
                  >
                    {chg >= 0 ? "+" : ""}
                    {chg.toFixed(1)}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main 2-col panel  */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
            marginBottom: 48,
          }}
        >
          {/* LEFT — Order Book */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            {/* Header with live price */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${divLine}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <h3
                  style={{
                    color: textClr,
                    fontWeight: 700,
                    fontSize: "1rem",
                    fontFamily: '"Playfair Display",serif',
                    margin: 0,
                  }}
                >
                  {t("order_book")}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {COIN_IMAGES[selectedPair.symbol] && (
                    <img
                      src={COIN_IMAGES[selectedPair.symbol]}
                      alt={selectedPair.base}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <span
                    style={{
                      color: "#f59e0b",
                      fontFamily: "monospace",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    {selectedPair.label}
                  </span>
                </div>
              </div>
              {/* Live price + 24h change */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                {loadingMkt ? (
                  <div
                    style={{
                      height: 28,
                      width: 150,
                      borderRadius: 6,
                      ...skeletonStyle,
                    }}
                  />
                ) : (
                  <>
                    <span
                      style={{
                        color: priceUp ? "#34d399" : "#f87171",
                        fontFamily: "monospace",
                        fontWeight: 800,
                        fontSize: "1.3rem",
                      }}
                    >
                      {fmtPrice(currentPrice)}
                    </span>
                    <span
                      style={{
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        fontFamily: "monospace",
                        color: priceUp ? "#34d399" : "#f87171",
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: priceUp
                          ? "rgba(52,211,153,0.1)"
                          : "rgba(248,113,113,0.1)",
                      }}
                    >
                      {priceUp ? "+" : ""}
                      {change24h.toFixed(2)}%
                    </span>
                    {priceUp ? (
                      <TrendingUp
                        style={{ width: 14, height: 14, color: "#34d399" }}
                      />
                    ) : (
                      <TrendingDown
                        style={{ width: 14, height: 14, color: "#f87171" }}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Table */}
            <div style={{ padding: "0 20px" }}>
              {/* Column headers */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                  padding: "10px 0 6px",
                  color: mutedClr,
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                <div>{t("price")}</div>
                <div style={{ textAlign: "right" }}>{t("size")}</div>
                <div style={{ textAlign: "right" }}>{t("total")}</div>
              </div>

              {/* Asks */}
              {loadingMkt
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 8,
                        padding: "5px 0",
                      }}
                    >
                      {[0, 1, 2].map((j) => (
                        <div key={j} style={{ height: 12, ...skeletonStyle }} />
                      ))}
                    </div>
                  ))
                : orderBook.asks.map((a, i) => (
                    <div
                      key={i}
                      className="ob-row-ask"
                      onClick={() => {
                        setOrderType("limit");
                        setLimitPrice(a.rawPrice.toFixed(2));
                      }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 8,
                        padding: "4px 0",
                        fontSize: "0.78rem",
                        fontFamily: "monospace",
                        borderRadius: 4,
                        transition: "background 0.1s",
                      }}
                    >
                      <div style={{ color: "#f87171" }}>{a.price}</div>
                      <div style={{ textAlign: "right", color: mutedClr }}>
                        {a.size}
                      </div>
                      <div style={{ textAlign: "right", color: mutedClr }}>
                        {a.total}
                      </div>
                    </div>
                  ))}

              {/* Spread / mid */}
              <div
                style={{
                  borderTop: `1px solid ${divLine}`,
                  borderBottom: `1px solid ${divLine}`,
                  padding: "10px 0",
                  margin: "6px 0",
                  textAlign: "center",
                }}
              >
                {currentPrice ? (
                  <span
                    style={{
                      color: priceUp ? "#34d399" : "#f87171",
                      fontFamily: "monospace",
                      fontWeight: 800,
                      fontSize: "1.05rem",
                    }}
                  >
                    {fmtPrice(currentPrice)}
                  </span>
                ) : (
                  <div
                    style={{
                      height: 20,
                      width: 120,
                      margin: "0 auto",
                      borderRadius: 4,
                      ...skeletonStyle,
                    }}
                  />
                )}
              </div>

              {/* Bids */}
              {loadingMkt
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 8,
                        padding: "5px 0",
                      }}
                    >
                      {[0, 1, 2].map((j) => (
                        <div key={j} style={{ height: 12, ...skeletonStyle }} />
                      ))}
                    </div>
                  ))
                : orderBook.bids.map((b, i) => (
                    <div
                      key={i}
                      className="ob-row-bid"
                      onClick={() => {
                        setOrderType("limit");
                        setLimitPrice(b.rawPrice.toFixed(2));
                      }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 8,
                        padding: "4px 0",
                        fontSize: "0.78rem",
                        fontFamily: "monospace",
                        borderRadius: 4,
                        transition: "background 0.1s",
                      }}
                    >
                      <div style={{ color: "#34d399" }}>{b.price}</div>
                      <div style={{ textAlign: "right", color: mutedClr }}>
                        {b.size}
                      </div>
                      <div style={{ textAlign: "right", color: mutedClr }}>
                        {b.total}
                      </div>
                    </div>
                  ))}
            </div>

            {/* Quick mover strip */}
            <div
              style={{
                padding: "12px 20px",
                borderTop: `1px solid ${divLine}`,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  color: mutedClr,
                  fontSize: "0.62rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 8,
                }}
              >
                Top Movers
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SPOT_PAIRS.slice(0, 5).map((pair) => {
                  const pd = prices[pair.cgId];
                  if (!pd?.usd) return null;
                  const chg = pd.usd_24h_change || 0;
                  return (
                    <div
                      key={pair.symbol}
                      onClick={() => setSelectedPair(pair)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                        padding: "4px 8px",
                        borderRadius: 8,
                        background:
                          pair.symbol === selectedPair.symbol
                            ? "rgba(245,158,11,0.08)"
                            : "transparent",
                        transition: "background 0.15s",
                      }}
                    >
                      <span
                        style={{
                          color: textClr,
                          fontFamily: "monospace",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                        }}
                      >
                        {pair.base}
                      </span>
                      <span
                        style={{
                          color: chg >= 0 ? "#34d399" : "#f87171",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          fontFamily: "monospace",
                        }}
                      >
                        {chg >= 0 ? "+" : ""}
                        {chg.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT — Order Form */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "22px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <h3
                style={{
                  color: textClr,
                  fontWeight: 700,
                  fontSize: "1rem",
                  fontFamily: '"Playfair Display",serif',
                  margin: 0,
                }}
              >
                {t("place_order")}
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {COIN_IMAGES[selectedPair.symbol] && (
                  <img
                    src={COIN_IMAGES[selectedPair.symbol]}
                    alt={selectedPair.base}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                <div>
                  <div
                    style={{
                      color: textClr,
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      fontFamily: "monospace",
                    }}
                  >
                    {selectedPair.label}
                  </div>
                  <div style={{ color: mutedClr, fontSize: "0.62rem" }}>
                    {selectedPair.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Buy / Sell toggle */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {["buy", "sell"].map((s) => (
                <button
                  key={s}
                  className="spot-side-btn"
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
                    textTransform: "capitalize",
                  }}
                >
                  {s === "buy" ? t("buy") : t("sell")}
                </button>
              ))}
            </div>

            {/* Order type */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {["market", "limit"].map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  style={{
                    flex: 1,
                    padding: "7px",
                    borderRadius: 10,
                    border: `1px solid ${orderType === type ? "rgba(245,158,11,0.5)" : border}`,
                    background:
                      orderType === type
                        ? "rgba(245,158,11,0.1)"
                        : "transparent",
                    color: orderType === type ? "#f59e0b" : mutedClr,
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {type === "market" ? t("market") : t("limit")}
                </button>
              ))}
            </div>

            {/* Limit price — only when limit is selected */}
            {orderType === "limit" && (
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
                  {t("limit_price_usdt")}
                </label>
                <input
                  className="spot-input"
                  type="number"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder={currentPrice ? currentPrice.toFixed(2) : "0.00"}
                  style={iStyle}
                />
              </div>
            )}

            {/* Amount */}
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <label
                  style={{
                    color: mutedClr,
                    fontSize: "0.78rem",
                    fontWeight: 500,
                  }}
                >
                  {t("amount_usdt")}
                </label>
                {currentPrice > 0 && (
                  <span style={{ color: mutedClr, fontSize: "0.7rem" }}>
                    1 {selectedPair.base} ≈ {fmtPrice(currentPrice)}
                  </span>
                )}
              </div>
              <input
                className="spot-input"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                style={iStyle}
              />
            </div>

            {/* Live trade preview box */}
            {quantity > 0 && execPrice > 0 && (
              <div
                style={{
                  background:
                    side === "buy"
                      ? "rgba(52,211,153,0.06)"
                      : "rgba(239,68,68,0.06)",
                  border: `1px solid ${side === "buy" ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)"}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  marginBottom: 14,
                }}
              >
                {[
                  {
                    label: t("you_receive"),
                    value: `≈ ${(total / execPrice).toFixed(6)} ${selectedPair.base}`,
                  },
                  { label: "Fee (0.1%)", value: `$${fee.toFixed(2)}` },
                  {
                    label: "Total cost",
                    value: `$${totalCost.toFixed(2)} USDT`,
                    bold: true,
                  },
                ].map(({ label, value, bold }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ color: mutedClr, fontSize: "0.75rem" }}>
                      {label}
                    </span>
                    <span
                      style={{
                        color: bold
                          ? side === "buy"
                            ? "#34d399"
                            : "#f87171"
                          : textClr,
                        fontWeight: bold ? 800 : 600,
                        fontFamily: "monospace",
                        fontSize: "0.78rem",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA button */}
            <button
              onClick={handleTrade}
              className="spot-side-btn"
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 14,
                border: "none",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
                background:
                  side === "buy"
                    ? "linear-gradient(135deg,#16a34a,#22c55e)"
                    : "linear-gradient(135deg,#b91c1c,#ef4444)",
                color: "#fff",
                boxShadow:
                  side === "buy"
                    ? "0 4px 20px rgba(34,197,94,0.3)"
                    : "0 4px 20px rgba(239,68,68,0.3)",
              }}
            >
              {!isLoggedIn
                ? side === "buy"
                  ? t("login_to_buy_btc")
                  : t("login_to_sell_btc")
                : side === "buy"
                  ? `Buy ${selectedPair.base}`
                  : `Sell ${selectedPair.base}`}
            </button>

            <p
              style={{
                color: mutedClr,
                fontSize: "0.7rem",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              {!isLoggedIn
                ? t("login_to_place_trades")
                : t("fee_info") || "Maker: 0.08% · Taker: 0.1%"}
            </p>

            {/* Market prices list — live from API */}
            <div
              style={{
                marginTop: 16,
                borderTop: `1px solid ${divLine}`,
                paddingTop: 14,
              }}
            >
              <div
                style={{
                  color: mutedClr,
                  fontSize: "0.62rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 8,
                }}
              >
                Market Prices
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {SPOT_PAIRS.slice(0, 6).map((pair) => {
                  const pd = prices[pair.cgId];
                  if (!pd?.usd) return null;
                  const chg = pd.usd_24h_change || 0;
                  const active = pair.symbol === selectedPair.symbol;
                  return (
                    <div
                      key={pair.symbol}
                      className="mkt-row"
                      onClick={() => setSelectedPair(pair)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 8px",
                        borderRadius: 8,
                        background: active
                          ? "rgba(245,158,11,0.06)"
                          : "transparent",
                        transition: "background 0.15s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {COIN_IMAGES[pair.symbol] && (
                          <img
                            src={COIN_IMAGES[pair.symbol]}
                            alt={pair.base}
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <span
                          style={{
                            color: active ? "#f59e0b" : textClr,
                            fontWeight: 600,
                            fontSize: "0.78rem",
                            fontFamily: "monospace",
                          }}
                        >
                          {pair.label}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            color: textClr,
                            fontFamily: "monospace",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                          }}
                        >
                          {fmtPrice(pd.usd)}
                        </div>
                        <div
                          style={{
                            color: chg >= 0 ? "#34d399" : "#f87171",
                            fontSize: "0.65rem",
                            fontFamily: "monospace",
                          }}
                        >
                          {chg >= 0 ? "+" : ""}
                          {chg.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
          {t("why_spot_trade_on")} <span className="gold-text">AxionTrade</span>
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
            <FeatureCard
              key={f.titleKey}
              icon={f.icon}
              title={t(f.titleKey)}
              desc={t(f.descKey)}
            />
          ))}
        </div>
      </div>

      <CTABanner
        title={t("start_spot_trading_today")}
        subtitle={t("start_spot_trading_subtitle")}
      />
    </FeaturePage>
  );
}
