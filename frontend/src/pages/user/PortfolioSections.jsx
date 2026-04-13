import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  WifiOff,
} from "lucide-react";
import marketService from "../../services/marketService";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const COIN_META = {
  bitcoin: {
    symbol: "BTC",
    labelKey: "bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    color: "#f7931a",
  },
  ethereum: {
    symbol: "ETH",
    labelKey: "ethereum",
    image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    color: "#627eea",
  },
  solana: {
    symbol: "SOL",
    labelKey: "solana",
    image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    color: "#9945ff",
  },
  tether: {
    symbol: "USDT",
    labelKey: "tether",
    image: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    color: "#26a17b",
  },
  binancecoin: {
    symbol: "BNB",
    labelKey: "binancecoin",
    image:
      "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    color: "#f0b90b",
  },
};

const COIN_IDS = Object.keys(COIN_META);

//  SVG Area Chart
function AreaChart({ data = [], color = "#34d399" }) {
  if (data.length < 2) return null;
  const W = 1000,
    H = 200;
  const min = Math.min(...data),
    max = Math.max(...data);
  const range = max - min || 1;
  const PAD = H * 0.08;
  const toX = (i) => (i / (data.length - 1)) * W;
  const toY = (v) => H - PAD - ((v - min) / range) * (H - PAD * 2);
  const pts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const area =
    `M${toX(0)},${H} ` +
    data.map((v, i) => `L${toX(i)},${toY(v)}`).join(" ") +
    ` L${toX(data.length - 1)},${H} Z`;
  const gid = `g_${color.replace("#", "")}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.38" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

//  Skeleton
function Skel({ w = "100%", h = 14, r = 6, darkMode }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
        animation: "skPulse 1.4s ease-in-out infinite",
      }}
    />
  );
}

//  Main Component
export default function PortfolioSections({ darkMode, userHoldings }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  const holdings = useMemo(
    () =>
      userHoldings || {
        bitcoin: user?.wallet?.balances?.BTC || 0,
        ethereum: user?.wallet?.balances?.ETH || 0,
        solana: user?.wallet?.balances?.SOL || 0,
        tether: user?.wallet?.balances?.USDT || 0, // USDT only — no USD mixed in
        binancecoin: user?.wallet?.balances?.BNB || 0,
      },
    [
      userHoldings,
      user?.wallet?.balances?.BTC,
      user?.wallet?.balances?.ETH,
      user?.wallet?.balances?.SOL,
      user?.wallet?.balances?.USDT,
      user?.wallet?.balances?.BNB,
    ],
  );

  // USD tracked separately as stablecoin (1:1 with USD)
  const usdBalance = user?.wallet?.balances?.USD || 0;

  const [prices, setPrices] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartLabels, setChartLabels] = useState([]);
  const [priceLoading, setPriceLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [priceError, setPriceError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef = useRef(null);

  // theme
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const gridClr = darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.035)";

  //  Fetch prices
  const fetchPrices = useCallback(async () => {
    try {
      const res = await marketService.getPrices();
      if (!res.data?.bitcoin?.usd) throw new Error("Bad response shape");
      setPrices(res.data);
      setLastUpdated(new Date());
      setPriceError(null);
    } catch (err) {
      console.error("[PortfolioSections] prices:", err.message);
      setPriceError("Live prices unavailable");
    } finally {
      setPriceLoading(false);
    }
  }, [t]);

  const generateMockChart = useCallback((currentValue) => {
    const baseValue = currentValue > 0 ? currentValue : 1000;
    const points = 30;
    const data = [];
    let val = baseValue * (0.82 + Math.random() * 0.1);

    for (let i = 0; i < points; i++) {
      const trend = 0.003;
      const noise = (Math.random() - 0.47) * 0.025;
      val = val * (1 + trend + noise);
      data.push(Math.max(val, baseValue * 0.5));
    }

    // Force last point to match current value exactly
    data[data.length - 1] = currentValue > 0 ? currentValue : baseValue;

    const labels = Array.from({ length: points }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (points - 1 - i));
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });

    setChartData(data);
    setChartLabels(labels);
    setChartLoading(false);
  }, []);

  const totalValue = useMemo(() => {
    const cryptoUSD = prices
      ? COIN_IDS.reduce(
          (s, id) => s + (prices[id]?.usd || 0) * (holdings[id] || 0),
          0,
        )
      : 0;
    return usdBalance + cryptoUSD;
  }, [prices, holdings, usdBalance]);

  const portfolio24hPct = useMemo(() => {
    if (!prices) return 0;
    let prev = 0,
      curr = 0;
    COIN_IDS.forEach((id) => {
      const p = prices[id]?.usd || 0;
      const chg = prices[id]?.usd_24h_change || 0;
      curr += p * (holdings[id] || 0);
      prev += (p / (1 + chg / 100)) * (holdings[id] || 0);
    });
    return prev > 0 ? ((curr - prev) / prev) * 100 : 0;
  }, [prices, holdings]);

  const isUp = portfolio24hPct >= 0;

  //  Effects
  useEffect(() => {
    fetchPrices();
    timerRef.current = setInterval(fetchPrices, 60_000);
    return () => clearInterval(timerRef.current);
  }, [fetchPrices]);

  useEffect(() => {
    if (!priceLoading) {
      generateMockChart(totalValue);
    }
  }, [priceLoading, totalValue, generateMockChart]);

  const handleRefresh = () => {
    setPriceLoading(true);
    setPriceError(null);
    fetchPrices();
  };

  //  Chart helpers
  const chartMin = chartData.length ? Math.min(...chartData) : 0;
  const chartMax = chartData.length ? Math.max(...chartData) : 0;
  const fmtY = (v) =>
    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`;

  const xLabels =
    chartLabels.length >= 2
      ? [
          chartLabels[0],
          chartLabels[Math.floor(chartLabels.length * 0.2)],
          chartLabels[Math.floor(chartLabels.length * 0.4)],
          chartLabels[Math.floor(chartLabels.length * 0.6)],
          chartLabels[Math.floor(chartLabels.length * 0.8)],
          chartLabels[chartLabels.length - 1],
        ]
      : Array.from({ length: 6 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - Math.round((5 - i) * 6));
          return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        });

  //  Render
  return (
    <div
      style={{
        marginBottom: 28,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <style>{`
        @keyframes skPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .refresh-btn:hover { opacity: 0.75; }
      `}</style>

      {/* SECTION 1: Portfolio Value Chart */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px 10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span
                style={{ color: textClr, fontWeight: 700, fontSize: "0.95rem" }}
              >
                 {t("portfolio_value")}
              </span>
              <button
                className="refresh-btn"
                onClick={handleRefresh}
                title={t("refresh")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: muted,
                  display: "flex",
                  padding: 2,
                  transition: "opacity 0.2s",
                }}
              >
                <RefreshCw style={{ width: 12, height: 12 }} />
              </button>
            </div>
            <div style={{ color: muted, fontSize: "0.7rem", marginTop: 3 }}>
              {t("last_30_days")}
              {lastUpdated && (
                <span style={{ marginLeft: 6 }}>
                  · {t("updated_at")}{" "}
                  {lastUpdated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            {priceLoading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 7,
                }}
              >
                <Skel w={160} h={30} r={8} darkMode={darkMode} />
                <Skel w={90} h={13} r={5} darkMode={darkMode} />
              </div>
            ) : priceError ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  color: "#f87171",
                  fontSize: "0.75rem",
                }}
              >
                <WifiOff style={{ width: 13, height: 13 }} /> {priceError}
              </div>
            ) : (
              <>
                <div
                  style={{
                    fontFamily: '"Playfair Display",serif',
                    fontWeight: 800,
                    fontSize: "clamp(1.5rem,4vw,2.1rem)",
                    color: textClr,
                    letterSpacing: "-0.5px",
                    lineHeight: 1,
                  }}
                >
                  $
                  {totalValue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    justifyContent: "flex-end",
                    marginTop: 5,
                  }}
                >
                  {isUp ? (
                    <TrendingUp
                      style={{ width: 12, height: 12, color: "#34d399" }}
                    />
                  ) : (
                    <TrendingDown
                      style={{ width: 12, height: 12, color: "#f87171" }}
                    />
                  )}
                  <span
                    style={{
                      color: isUp ? "#34d399" : "#f87171",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                    }}
                  >
                    {isUp ? "+" : ""}
                    {portfolio24hPct.toFixed(2)}%  {t("today")}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chart area */}
        <div style={{ display: "flex", padding: "4px 10px 0 0" }}>
          <div
            style={{
              width: 46,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "4px 4px 34px 12px",
            }}
          >
            {[
              chartMax,
              chartMax * 0.75 + chartMin * 0.25,
              (chartMax + chartMin) / 2,
              chartMax * 0.25 + chartMin * 0.75,
              chartMin,
            ].map((v, i) => (
              <span
                key={i}
                style={{
                  color: muted,
                  fontSize: "0.59rem",
                  textAlign: "right",
                  display: "block",
                }}
              >
                {chartLoading ? "–" : fmtY(v)}
              </span>
            ))}
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            {[0, 25, 50, 75, 100].map((p) => (
              <div
                key={p}
                style={{
                  position: "absolute",
                  top: `${p * 0.82}%`,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: gridClr,
                }}
              />
            ))}
            <div style={{ height: 148 }}>
              {chartLoading ? (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Skel w="92%" h={72} r={14} darkMode={darkMode} />
                </div>
              ) : chartData.length > 1 ? (
                <AreaChart data={chartData} color="#34d399" />
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: muted,
                    fontSize: "0.78rem",
                  }}
                >
                   {t("no_chart_data")}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "5px 0 14px",
              }}
            >
              {xLabels.map((l, i) => (
                <span key={i} style={{ color: muted, fontSize: "0.59rem" }}>
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: My Assets */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 24px 14px",
            borderBottom: `1px solid ${divLine}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{ color: textClr, fontWeight: 700, fontSize: "0.95rem" }}
          >
             {t("my_assets")}
          </span>
          {!priceLoading && !priceError && (
            <span style={{ color: muted, fontSize: "0.68rem" }}>
               {t("live_prices")}
            </span>
          )}
        </div>

        {/* USD row shown separately at top */}
        {usdBalance > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 24px",
              borderBottom: `1px solid ${divLine}`,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                flexShrink: 0,
                border: "1.5px solid rgba(52,211,153,0.4)",
                background: "rgba(52,211,153,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: "#34d399",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                }}
              >
                $
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{ color: textClr, fontWeight: 700, fontSize: "0.88rem" }}
              >
                USD
              </div>
              <div style={{ color: muted, fontSize: "0.7rem", marginTop: 1 }}>
                {usdBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}{" "}
                USD
              </div>
            </div>
            <div style={{ textAlign: "center", minWidth: 88 }}>
              <span
                style={{
                  color: muted,
                  fontSize: "0.71rem",
                  fontFamily: "monospace",
                }}
              >
                $1.00
              </span>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0, minWidth: 96 }}>
              <div
                style={{
                  color: textClr,
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  fontFamily: "monospace",
                }}
              >
                $
                {usdBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  justifyContent: "flex-end",
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    color: "#34d399",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  +0.00%
                </span>
              </div>
            </div>
          </div>
        )}

        {COIN_IDS.map((id, i) => {
          const meta = COIN_META[id];
          const price = prices?.[id]?.usd;
          const chg24h = prices?.[id]?.usd_24h_change ?? 0;
          const hold = holdings[id] || 0;
          const val = price != null ? price * hold : null;
          const coinUp = chg24h >= 0;

          return (
            <div
              key={id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 24px",
                borderBottom:
                  i < COIN_IDS.length - 1 ? `1px solid ${divLine}` : "none",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  flexShrink: 0,
                  border: `1.5px solid ${meta.color}50`,
                  background: `${meta.color}18`,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={meta.image}
                  alt={meta.symbol}
                  width={32}
                  height={32}
                  style={{
                    width: 32,
                    height: 32,
                    objectFit: "contain",
                    display: "block",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentNode.innerHTML = `<span style="color:${meta.color};font-weight:800;font-size:0.65rem;font-family:monospace">${meta.symbol.slice(0, 2)}</span>`;
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                <div
                  style={{
                    color: textClr,
                    fontWeight: 700,
                    fontSize: "0.88rem",
                  }}
                >
                  {meta.symbol}
                </div>
                <div
                  style={{
                    color: muted,
                    fontSize: "0.7rem",
                    marginTop: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {hold.toLocaleString("en-US", { maximumFractionDigits: 6 })}{" "}
                  {meta.symbol}
                </div>
              </div>

              <div style={{ textAlign: "center", minWidth: 66 }}>
                {priceLoading ? (
                  <Skel w={60} h={11} r={4} darkMode={darkMode} />
                ) : price != null ? (
                  <span
                    style={{
                      color: muted,
                      fontSize: "0.71rem",
                      fontFamily: "monospace",
                    }}
                  >
                    $
                    {price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: price < 1 ? 4 : price < 10 ? 3 : 2,
                    })}
                  </span>
                ) : (
                  <span style={{ color: "#f87171", fontSize: "0.68rem" }}>
                    —
                  </span>
                )}
              </div>

              <div
                style={{
                  textAlign: "right",
                  flexShrink: 0,
                  minWidth: 0,
                  maxWidth: 110,
                }}
              >
                {priceLoading ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 5,
                    }}
                  >
                    <Skel w={72} h={14} r={4} darkMode={darkMode} />
                    <Skel w={46} h={10} r={4} darkMode={darkMode} />
                  </div>
                ) : val != null ? (
                  <>
                    <div
                      style={{
                        color: textClr,
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        fontFamily: "monospace",
                      }}
                    >
                      $
                      {val.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        justifyContent: "flex-end",
                        marginTop: 2,
                      }}
                    >
                      {coinUp ? (
                        <TrendingUp
                          style={{ width: 10, height: 10, color: "#34d399" }}
                        />
                      ) : (
                        <TrendingDown
                          style={{ width: 10, height: 10, color: "#f87171" }}
                        />
                      )}
                      <span
                        style={{
                          color: coinUp ? "#34d399" : "#f87171",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                        }}
                      >
                        {coinUp ? "+" : ""}
                        {chg24h.toFixed(2)}%
                      </span>
                    </div>
                  </>
                ) : priceError ? (
                  <span style={{ color: "#f87171", fontSize: "0.68rem" }}>
                    {t("unavailable")}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}

        <div style={{ padding: "14px 24px 20px" }}>
          {priceError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.2)",
                marginBottom: 12,
              }}
            >
              <WifiOff
                style={{
                  width: 13,
                  height: 13,
                  color: "#f87171",
                  flexShrink: 0,
                }}
              />
              <span style={{ color: "#f87171", fontSize: "0.75rem" }}>
                {t("price_load_error")}
              </span>
              <button
                onClick={handleRefresh}
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#f87171",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textDecoration: "underline",
                  flexShrink: 0,
                }}
              >
                  {t("retry")}
              </button>
            </div>
          )}
          <Link
            to="/portfolio"
            style={{
              display: "block",
              width: "100%",
              padding: "12px",
              borderRadius: 14,
              border: `1px solid ${border}`,
              background: darkMode
                ? "rgba(245,158,11,0.06)"
                : "rgba(245,158,11,0.05)",
              color: textClr,
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.2s, border-color 0.2s",
              textDecoration: "none",
              textAlign: "center",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(245,158,11,0.14)";
              e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = darkMode
                ? "rgba(245,158,11,0.06)"
                : "rgba(245,158,11,0.05)";
              e.currentTarget.style.borderColor = border;
            }}
          >
           {t("view_portfolio")}
          </Link>
        </div>
      </div>
    </div>
  );
}
