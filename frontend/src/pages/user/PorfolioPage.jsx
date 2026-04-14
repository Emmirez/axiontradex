import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  Bot,
  Copy,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import marketService from "../../services/marketService";
import api from "../../services/apiService";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";

// Coin meta
const COIN_META = {
  bitcoin: {
    symbol: "BTC",
    labelKey: "bitcoin",
    color: "#f7931a",
    image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  },
  ethereum: {
    symbol: "ETH",
    labelKey: "ethereum",
    color: "#627eea",
    image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  },
  solana: {
    symbol: "SOL",
    labelKey: "solana",
    color: "#9945ff",
    image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  },
  tether: {
    symbol: "USDT",
    labelKey: "tether",
    color: "#26a17b",
    image: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  },
  binancecoin: {
    symbol: "BNB",
    labelKey: "binancecoin",
    color: "#f0b90b",
    image:
      "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  },
};
const COIN_IDS = Object.keys(COIN_META);

// Transaction type config — covers all types your backend saves
const TX_CONFIG = {
  deposit: {
    labelKey: "deposit",
    icon: ArrowDownCircle,
    bg: "rgba(96,165,250,0.15)",
    color: "#60a5fa",
  },
  withdrawal: {
    labelKey: "withdraw",
    icon: ArrowUpCircle,
    bg: "rgba(167,139,250,0.15)",
    color: "#a78bfa",
  },
  bonus: {
    labelKey: "bonus",
    icon: ArrowDownCircle,
    bg: "rgba(245,158,11,0.15)",
    color: "#f59e0b",
  },
  profit: {
    labelKey: "profit",
    icon: TrendingUp,
    bg: "rgba(52,211,153,0.15)",
    color: "#34d399",
  },
  loss: {
    labelKey: "loss",
    icon: TrendingDown,
    bg: "rgba(248,113,113,0.15)",
    color: "#f87171",
  },
  fee: {
    labelKey: "fee",
    icon: ArrowUpCircle,
    bg: "rgba(100,116,139,0.15)",
    color: "#64748b",
  },
  trade: {
    labelKey: "trade",
    icon: Activity,
    bg: "rgba(52,211,153,0.15)",
    color: "#34d399",
  },
  investment: {
    labelKey: "investment",
    icon: ArrowDownCircle,
    bg: "rgba(245,158,11,0.15)",
    color: "#f59e0b",
  },
  referral: {
    labelKey: "referral",
    icon: ArrowDownCircle,
    bg: "rgba(96,165,250,0.15)",
    color: "#60a5fa",
  },
  refund: {
    labelKey: "refund",
    icon: ArrowDownCircle,
    bg: "rgba(52,211,153,0.15)",
    color: "#34d399",
  },
};

// Source badge config for trade history
const SOURCE_CONFIG = {
  manual: { labelKey: "manual", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  copy: { labelKey: "copy", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  bot: { labelKey: "bot", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
};

// Donut Chart
function DonutChart({ slices }) {
  const R = 80,
    CX = 110,
    CY = 110,
    stroke = 32;
  const circ = 2 * Math.PI * R;
  let offset = 0;
  return (
    <svg width={220} height={220} viewBox="0 0 220 220">
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={stroke}
      />
      {slices.map((s, i) => {
        const dash = (s.pct / 100) * circ;
        const gap = circ - dash;
        const el = (
          <circle
            key={i}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={(-offset * circ) / 100}
            strokeLinecap="butt"
            style={{
              transition: "stroke-dasharray 0.6s ease",
              transformOrigin: `${CX}px ${CY}px`,
              transform: "rotate(-90deg)",
            }}
          />
        );
        offset += s.pct;
        return el;
      })}
    </svg>
  );
}

// Area Chart
function AreaChart({ data = [], color = "#34d399", darkMode, onHover }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  if (data.length < 2) return null;
  const W = 1000,
    H = 280;
  const min = Math.min(...data),
    max = Math.max(...data);
  const range = max - min || 1;
  const PAD = H * 0.06;
  const toX = (i) => (i / (data.length - 1)) * W;
  const toY = (v) => H - PAD - ((v - min) / range) * (H - PAD * 2);
  const pts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const area =
    `M0,${H} ` +
    data.map((v, i) => `L${toX(i)},${toY(v)}`).join(" ") +
    ` L${W},${H} Z`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        cursor: "crosshair",
      }}
      onMouseLeave={() => {
        setHoverIdx(null);
        onHover?.(null);
      }}
    >
      <defs>
        <linearGradient id="pgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#pgGrad)" />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((v, i) => (
        <rect
          key={i}
          x={toX(i) - W / data.length / 2}
          y={0}
          width={W / data.length}
          height={H}
          fill="transparent"
          onMouseEnter={() => {
            setHoverIdx(i);
            onHover?.({ i, v, x: toX(i), y: toY(v) });
          }}
        />
      ))}
      {hoverIdx != null && (
        <>
          <line
            x1={toX(hoverIdx)}
            y1={0}
            x2={toX(hoverIdx)}
            y2={H}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          <circle
            cx={toX(hoverIdx)}
            cy={toY(data[hoverIdx])}
            r={5}
            fill={color}
            stroke="white"
            strokeWidth={2}
          />
        </>
      )}
    </svg>
  );
}

function Skel({ w = "100%", h = 16, r = 8, dark }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
        animation: "skPulse 1.4s ease-in-out infinite",
      }}
    />
  );
}

// TX filter tabs
const TX_FILTERS = [
  "all",
  "deposit",
  "withdrawal",
  "profit",
  "loss",
  "fee",
  "bonus",
  "refund",
];

// Trade tabs
const TRADE_TABS = ["all", "manual", "copy", "bot"];

export default function PortfolioPage() {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [prices, setPrices] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartLabels, setChartLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [txFilter, setTxFilter] = useState("all");
  const [tradeFilter, setTradeFilter] = useState("all");
  const [timeframe, setTimeframe] = useState("3M");
  const [transactions, setTransactions] = useState([]);
  const [trades, setTrades] = useState([]); // ✅ now uses all-history
  const [txLoading, setTxLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("transactions");
  const timerRef = useRef(null);
  const [tradeStats, setTradeStats] = useState({
    totalProfit: 0,
    totalLoss: 0,
    netProfit: 0,
    winRate: 0,
    totalTrades: 0,
  });

  // Theme
  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const gridClr = darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

  const holdings = useMemo(
    () => ({
      bitcoin: user?.wallet?.balances?.BTC || 0,
      ethereum: user?.wallet?.balances?.ETH || 0,
      solana: user?.wallet?.balances?.SOL || 0,
      tether: user?.wallet?.balances?.USDT || 0,
      binancecoin: user?.wallet?.balances?.BNB || 0,
    }),
    [
      user?.wallet?.balances?.BTC,
      user?.wallet?.balances?.ETH,
      user?.wallet?.balances?.SOL,
      user?.wallet?.balances?.USDT,
      user?.wallet?.balances?.BNB,
    ],
  );

  const usdBalance = user?.wallet?.balances?.USD || 0;

  const fetchPrices = useCallback(async () => {
    try {
      const res = await marketService.getPrices();
      if (res.data?.bitcoin?.usd) setPrices(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  // After fetching trades, calculate P&L
  useEffect(() => {
    if (trades.length > 0) {
      let totalProfit = 0;
      let totalLoss = 0;
      let winningTrades = 0;

      trades.forEach((trade) => {
        const pnl = trade.profit || trade.pnl || 0;
        if (pnl > 0) {
          totalProfit += pnl;
          winningTrades++;
        } else if (pnl < 0) {
          totalLoss += Math.abs(pnl);
        }
      });

      setTradeStats({
        totalProfit,
        totalLoss,
        netProfit: totalProfit - totalLoss,
        winRate: trades.length > 0 ? (winningTrades / trades.length) * 100 : 0,
        totalTrades: trades.length,
      });
    }
  }, [trades]);

  const stats = useMemo(() => {
    if (!prices) return null;

    let totalValue = usdBalance;
    const coinStats = COIN_IDS.map((id) => {
      const price = prices[id]?.usd || 0;
      const chg24h = prices[id]?.usd_24h_change || 0;
      const hold = holdings[id] || 0;
      const value = price * hold;
      totalValue += value;
      return { id, price, chg24h, hold, value };
    });

    // Calculate 24h change percentage for portfolio
    let portfolio24hPct = 0;
    let hasValidData = false;
    let totalPrevValue = 0;
    let totalCurrValue = 0;

    COIN_IDS.forEach((id) => {
      const currentPrice = prices[id]?.usd || 0;
      const chg24h = prices[id]?.usd_24h_change;
      const hold = holdings[id] || 0;

      // Only calculate if we have valid 24h change data and holdings
      if (chg24h !== undefined && chg24h !== null && hold > 0) {
        hasValidData = true;
        // Calculate previous price (24h ago)
        const prevPrice = currentPrice / (1 + chg24h / 100);
        totalCurrValue += currentPrice * hold;
        totalPrevValue += prevPrice * hold;
      } else if (hold > 0 && currentPrice > 0) {
        // If we have holdings but no 24h change data, just use current value
        totalCurrValue += currentPrice * hold;
        totalPrevValue += currentPrice * hold;
      }
    });

    // Add USD balance (no change)
    totalCurrValue += usdBalance;
    totalPrevValue += usdBalance;

    // Calculate percentage change only if we have valid data
    if (hasValidData && totalPrevValue > 0) {
      portfolio24hPct =
        ((totalCurrValue - totalPrevValue) / totalPrevValue) * 100;
    }

    const distribution = coinStats
      .map((c) => ({
        ...c,
        pct: totalValue > 0 ? (c.value / totalValue) * 100 : 0,
      }))
      .filter((c) => c.pct > 0);

    return {
      totalValue,
      portfolio24hPct,
      coinStats,
      distribution,
      hasValid24hData: hasValidData,
    };
  }, [prices, holdings, usdBalance]);

  const generateMockChart = useCallback((currentValue) => {
    const baseValue = currentValue > 0 ? currentValue : 1000;
    const points = 30;
    const data = [];
    let val = baseValue * (0.82 + Math.random() * 0.1);
    for (let i = 0; i < points; i++) {
      val = val * (1 + 0.003 + (Math.random() - 0.47) * 0.025);
      data.push(Math.max(val, baseValue * 0.5));
    }
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

  // Fetch transactions + all-history (manual + copy + bot trades)
  const fetchHistory = useCallback(async () => {
    setTxLoading(true);
    try {
      const [txRes, tradeRes] = await Promise.all([
        api.get("/users/transactions?limit=50"),
        api.get("/trades/all-history?limit=50"), 
      ]);
      setTransactions(txRes.data?.data || []);
      setTrades(tradeRes.data?.data?.trades || []);
    } catch {
      setTransactions([]);
      setTrades([]);
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    fetchHistory();
    timerRef.current = setInterval(fetchPrices, 60_000);
    return () => clearInterval(timerRef.current);
  }, [fetchPrices, fetchHistory]);

  useEffect(() => {
    if (!loading) generateMockChart(stats?.totalValue ?? 0);
  }, [loading, stats?.totalValue, generateMockChart]);

  const fmtUSD = (v) =>
    `$${(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtPct = (v) => {
    if (v === undefined || v === null || isNaN(v)) return "0.00%";
    return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
  };

  const chartMin = chartData.length ? Math.min(...chartData) : 0;
  const chartMax = chartData.length ? Math.max(...chartData) : 0;
  const fmtY = (v) =>
    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`;

  const xLabels =
    chartLabels.length >= 2
      ? [0, 0.2, 0.4, 0.6, 0.8, 1].map(
          (p) => chartLabels[Math.round(p * (chartLabels.length - 1))],
        )
      : [];

  const displayValue =
    hoverInfo != null ? chartData[hoverInfo.i] : stats?.totalValue;
  const isUp = (stats?.portfolio24hPct ?? 0) >= 0;
  const TIMEFRAMES = ["1W", "1M", "3M", "1Y", "All"];

  //  Filter transactions by type
  const filteredTxs =
    txFilter === "all"
      ? transactions
      : transactions.filter((t) => t.type === txFilter);

  // Filter trades by source
  const filteredTrades =
    tradeFilter === "all"
      ? trades
      : trades.filter((t) => t.source === tradeFilter);

  // Get translated display for trade tab//new
  const getTradeTabLabel = (tab) => {
    if (tab === "all") return t("all");
    return t(tab);
  };

  // Get translated display for transaction filter
const getTxFilterLabel = (filter) => {
  if (filter === "all") return t("all");
  return t(filter);
};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBg,
        transition: "background 0.3s",
      }}
    >
      <style>{`
        @keyframes skPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .pf-card { animation: fadeUp 0.4s ease both; }
        .thin-scroll::-webkit-scrollbar{height:3px;width:3px}
        .thin-scroll::-webkit-scrollbar-thumb{background:rgba(245,158,11,0.3);border-radius:99px}
        .thin-scroll{scrollbar-width:thin;scrollbar-color:rgba(245,158,11,0.3) transparent}
      `}</style>

      <DashboardNav />

      <div
        style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 20px 120px" }}
      >
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 800,
              fontSize: "clamp(1.6rem,4vw,2.2rem)",
              color: textClr,
              lineHeight: 1.1,
            }}
          >
            {t("portfolio")}
          </h1>
          <p style={{ color: muted, fontSize: "0.875rem", marginTop: 4 }}>
            {t("portfolio_subtitle")}
          </p>
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            {
              labelKey: "total_value",
              value: stats?.totalValue,
              sub: fmtPct(stats?.portfolio24hPct),
              subUp: isUp,
              highlight: true,
            },
            {
              labelKey: "total_pnl",
              value: tradeStats.netProfit,
              sub:
                tradeStats.totalTrades > 0
                  ? `${tradeStats.winRate.toFixed(1)}% ${t("win_rate_lower")} (${tradeStats.totalTrades} ${t("trades_lower")})`
                  : t("no_trades_yet"),
              subUp: tradeStats.netProfit >= 0,
              isPnl: true,
            },
            {
              labelKey: "24h_change",
              pct: stats?.hasValid24hData ? stats?.portfolio24hPct : 0,
              isPct: true,
            },
            {
              labelKey: "assets",
              count:
                COIN_IDS.filter((id) => (holdings[id] || 0) > 0).length +
                (usdBalance > 0 ? 1 : 0),
              isCount: true,
            },
          ].map((s, i) => (
            <div
              key={i}
              className="pf-card"
              style={{
                animationDelay: `${i * 0.07}s`,
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 18,
                padding: "22px 24px",
              }}
            >
              <div
                style={{
                  color: muted,
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  marginBottom: 8,
                }}
              >
                {t(s.labelKey)}
              </div>
              {loading && !s.isCount && !s.isPnl ? (
                <Skel w={140} h={28} r={8} dark={darkMode} />
              ) : s.isCount ? (
                <div
                  style={{
                    fontFamily: '"Playfair Display",serif',
                    fontWeight: 800,
                    fontSize: "1.8rem",
                    color: textClr,
                  }}
                >
                  {s.count}
                </div>
              ) : s.isPct ? (
                <div
                  style={{
                    fontFamily: '"Playfair Display",serif',
                    fontWeight: 800,
                    fontSize: "1.8rem",
                    color: (s.pct ?? 0) >= 0 ? "#34d399" : "#f87171",
                  }}
                >
                  {fmtPct(s.pct)}
                </div>
              ) : s.isPnl ? (
                <>
                  <div
                    style={{
                      fontFamily: '"Playfair Display",serif',
                      fontWeight: 800,
                      fontSize: "clamp(1.4rem,3vw,1.8rem)",
                      color: (s.value || 0) >= 0 ? "#34d399" : "#f87171",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {(s.value || 0) >= 0 ? "+" : ""}
                    {fmtUSD(s.value || 0)}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: s.subUp
                          ? "rgba(52,211,153,0.15)"
                          : "rgba(248,113,113,0.15)",
                        color: s.subUp ? "#34d399" : "#f87171",
                      }}
                    >
                      {s.sub}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      fontFamily: '"Playfair Display",serif',
                      fontWeight: 800,
                      fontSize: "clamp(1.4rem,3vw,1.8rem)",
                      color: textClr,
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {fmtUSD(s.value)}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: s.subUp
                          ? "rgba(52,211,153,0.15)"
                          : "rgba(248,113,113,0.15)",
                        color: s.subUp ? "#34d399" : "#f87171",
                      }}
                    >
                      {s.sub}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Performance chart */}
        <div
          className="pf-card"
          style={{
            animationDelay: "0.2s",
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: "22px 24px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div>
              <div
                style={{
                  color: textClr,
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  marginBottom: 4,
                }}
              >
                {t("performance")}
              </div>
              {hoverInfo && chartLabels[hoverInfo.i] && (
                <div style={{ color: muted, fontSize: "0.75rem" }}>
                  {chartLabels[hoverInfo.i]}
                </div>
              )}
              {displayValue != null && (
                <div
                  style={{
                    fontFamily: '"Playfair Display",serif',
                    fontWeight: 800,
                    fontSize: "1.5rem",
                    color: textClr,
                    marginTop: 2,
                  }}
                >
                  {fmtUSD(displayValue)}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    border: "none",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    background:
                      timeframe === tf
                        ? "linear-gradient(135deg,#d97706,#f59e0b)"
                        : "transparent",
                    color: timeframe === tf ? "#020617" : muted,
                    transition: "all 0.15s",
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <div
              style={{
                width: 44,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                paddingBottom: 28,
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
                    fontSize: "0.6rem",
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
                    top: `${p * 0.86}%`,
                    left: 0,
                    right: 0,
                    height: 1,
                    background: gridClr,
                  }}
                />
              ))}
              <div style={{ height: 200 }}>
                {chartLoading ? (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Skel w="94%" h={80} r={14} dark={darkMode} />
                  </div>
                ) : chartData.length > 1 ? (
                  <AreaChart
                    data={chartData}
                    color="#34d399"
                    darkMode={darkMode}
                    onHover={setHoverInfo}
                  />
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: muted,
                      fontSize: "0.8rem",
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
                  marginTop: 8,
                }}
              >
                {xLabels.map((l, i) => (
                  <span key={i} style={{ color: muted, fontSize: "0.6rem" }}>
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Distribution + Assets */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: 20,
            marginBottom: 24,
          }}
        >
          {/* Donut */}
          <div
            className="pf-card"
            style={{
              animationDelay: "0.25s",
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "22px 24px",
            }}
          >
            <div
              style={{
                color: textClr,
                fontWeight: 700,
                fontSize: "0.95rem",
                marginBottom: 20,
              }}
            >
              {t("distribution")}
            </div>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Skel w={180} h={180} r={999} dark={darkMode} />
              </div>
            ) : !stats || stats.totalValue === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: muted,
                  fontSize: "0.82rem",
                  padding: "40px 0",
                }}
              >
                {t("no_holdings_yet")}
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <DonutChart
                    slices={stats.distribution.map((d) => ({
                      pct: d.pct,
                      color: COIN_META[d.id].color,
                    }))}
                  />
                </div>
                {usdBalance > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: `1px solid ${divLine}`,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "#34d399",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          color: textClr,
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        USD
                      </span>
                    </div>
                    <span
                      style={{
                        color: muted,
                        fontSize: "0.82rem",
                        fontFamily: "monospace",
                      }}
                    >
                      {stats.totalValue > 0
                        ? ((usdBalance / stats.totalValue) * 100).toFixed(1)
                        : "0.0"}
                      %
                    </span>
                  </div>
                )}
                {stats.distribution.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: `1px solid ${divLine}`,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: COIN_META[d.id].color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          color: textClr,
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        {COIN_META[d.id].symbol}
                      </span>
                    </div>
                    <span
                      style={{
                        color: muted,
                        fontSize: "0.82rem",
                        fontFamily: "monospace",
                      }}
                    >
                      {d.pct.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Assets */}
          <div
            className="pf-card"
            style={{
              animationDelay: "0.3s",
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "22px 24px",
            }}
          >
            <div
              style={{
                color: textClr,
                fontWeight: 700,
                fontSize: "0.95rem",
                marginBottom: 20,
              }}
            >
              {t("assets")}
            </div>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <Skel w="100%" h={40} r={10} dark={darkMode} />
                </div>
              ))
            ) : stats?.coinStats.filter((c) => c.hold > 0).length === 0 &&
              usdBalance === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: muted,
                  fontSize: "0.82rem",
                  padding: "40px 0",
                }}
              >
                {t("no_assets_yet")}
              </div>
            ) : (
              <>
                {usdBalance > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom: `1px solid ${divLine}`,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "rgba(52,211,153,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          color: "#34d399",
                          fontWeight: 800,
                          fontSize: "0.75rem",
                        }}
                      >
                        $
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          color: textClr,
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        USD
                      </div>
                      <div style={{ color: muted, fontSize: "0.7rem" }}>
                        {usdBalance.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        USD
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          color: textClr,
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          fontFamily: "monospace",
                        }}
                      >
                        {fmtUSD(usdBalance)}
                      </div>
                      <div
                        style={{
                          color: muted,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                        }}
                      >
                        {t("stablecoin")}
                      </div>
                    </div>
                  </div>
                )}
                {stats?.coinStats
                  .filter((c) => c.hold > 0)
                  .map((c) => {
                    const meta = COIN_META[c.id];
                    const chgUp = c.chg24h >= 0;
                    return (
                      <div
                        key={c.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 0",
                          borderBottom: `1px solid ${divLine}`,
                        }}
                      >
                        <img
                          src={meta.image}
                          alt={meta.symbol}
                          width={32}
                          height={32}
                          style={{ borderRadius: "50%", flexShrink: 0 }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              color: textClr,
                              fontWeight: 700,
                              fontSize: "0.85rem",
                            }}
                          >
                            {meta.symbol}
                          </div>
                          <div style={{ color: muted, fontSize: "0.7rem" }}>
                            {c.hold.toLocaleString("en-US", {
                              maximumFractionDigits: 6,
                            })}{" "}
                            {meta.symbol}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              color: textClr,
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              fontFamily: "monospace",
                            }}
                          >
                            {fmtUSD(c.value)}
                          </div>
                          <div
                            style={{
                              color: chgUp ? "#34d399" : "#f87171",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                            }}
                          >
                            {fmtPct(c.chg24h)} ({t("24h")})
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </>
            )}
          </div>
        </div>

        {/* Transaction + Trade History */}
        <div
          className="pf-card"
          style={{
            animationDelay: "0.4s",
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
          }}
        >
          {/* Tabs */}
          <div
            style={{
              padding: "20px 24px 0",
              borderBottom: `1px solid ${divLine}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", gap: 0 }}>
              {["transactions", "trades"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "10px 18px",
                    border: "none",
                    background: "transparent",
                    color: activeTab === tab ? "#f59e0b" : muted,
                    fontWeight: activeTab === tab ? 700 : 500,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    borderBottom:
                      activeTab === tab
                        ? "2px solid #f59e0b"
                        : "2px solid transparent",
                    textTransform: "capitalize",
                    transition: "all 0.15s",
                  }}
                >
                  {tab === "transactions" ? t("transactions") : t("trades")}
                </button>
              ))}
            </div>

            {/*  Transaction filters — all types covered */}
            {activeTab === "transactions" && (
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  paddingBottom: 10,
                }}
              >
                {TX_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setTxFilter(f)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 8,
                      border: "none",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      textTransform: "capitalize",
                      background:
                        txFilter === f
                          ? "linear-gradient(135deg,#d97706,#f59e0b)"
                          : darkMode
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.04)",
                      color: txFilter === f ? "#020617" : muted,
                      transition: "all 0.15s",
                    }}
                  >
                    {getTxFilterLabel(f)}
                  </button>
                ))}
              </div>
            )}

            {/*  Trade source filters */}
            {activeTab === "trades" && (
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  paddingBottom: 10,
                }}
              >
                {TRADE_TABS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setTradeFilter(f)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 8,
                      border: "none",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      textTransform: "capitalize",
                      background:
                        tradeFilter === f
                          ? "linear-gradient(135deg,#d97706,#f59e0b)"
                          : darkMode
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.04)",
                      color: tradeFilter === f ? "#020617" : muted,
                      transition: "all 0.15s",
                    }}
                  >
                    {getTradeTabLabel(f)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Transactions tab */}
          {activeTab === "transactions" && (
            <div className="thin-scroll" style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 600 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 90px 140px 120px 100px",
                    gap: 8,
                    padding: "10px 20px",
                    color: muted,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    borderBottom: `1px solid ${divLine}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  <div>{t("type")}</div>
                  <div>{t("currency")}</div>
                  <div>{t("amount")}</div>
                  <div>{t("date")}</div>
                  <div style={{ textAlign: "right" }}>{t("status")}</div>
                </div>
                {txLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "14px 20px",
                        borderBottom: `1px solid ${divLine}`,
                      }}
                    >
                      <Skel w="100%" h={18} r={6} dark={darkMode} />
                    </div>
                  ))
                ) : filteredTxs.length === 0 ? (
                  <div
                    style={{
                      padding: "30px",
                      textAlign: "center",
                      color: muted,
                      fontSize: "0.82rem",
                    }}
                  >
                    {t("no_transactions_found")}
                  </div>
                ) : (
                  filteredTxs.map((tx, i) => {
                    const cfg = TX_CONFIG[tx.type] || TX_CONFIG.deposit;
                    const Icon = cfg.icon;
                    const isDebit = ["withdrawal", "fee", "loss"].includes(
                      tx.type,
                    );
                    return (
                      <div
                        key={tx._id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "140px 90px 140px 120px 100px",
                          gap: 8,
                          padding: "13px 20px",
                          borderBottom:
                            i < filteredTxs.length - 1
                              ? `1px solid ${divLine}`
                              : "none",
                          alignItems: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              background: cfg.bg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Icon
                              style={{
                                width: 13,
                                height: 13,
                                color: cfg.color,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              color: cfg.color,
                              fontWeight: 700,
                              fontSize: "0.82rem",
                              textTransform: "capitalize",
                            }}
                          >
                            {t(cfg.labelKey)}
                          </span>
                        </div>
                        <div
                          style={{
                            color: muted,
                            fontFamily: "monospace",
                            fontSize: "0.82rem",
                          }}
                        >
                          {tx.currency || "USDT"}
                        </div>
                        <div
                          style={{
                            color: isDebit ? "#f87171" : "#34d399",
                            fontFamily: "monospace",
                            fontWeight: 600,
                            fontSize: "0.82rem",
                          }}
                        >
                          {isDebit ? "-" : "+"}
                          {tx.amount?.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6,
                          })}
                        </div>
                        <div style={{ color: muted, fontSize: "0.78rem" }}>
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: 6,
                              background:
                                tx.status === "completed"
                                  ? "rgba(52,211,153,0.12)"
                                  : tx.status === "pending"
                                    ? "rgba(245,158,11,0.12)"
                                    : "rgba(248,113,113,0.12)",
                              color:
                                tx.status === "completed"
                                  ? "#34d399"
                                  : tx.status === "pending"
                                    ? "#f59e0b"
                                    : "#f87171",
                            }}
                          >
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Trades tab — manual + copy + bot unified */}
          {activeTab === "trades" && (
            <div className="thin-scroll" style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 700 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "80px 100px 110px 110px 100px 90px 80px",
                    gap: 8,
                    padding: "10px 20px",
                    color: muted,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    borderBottom: `1px solid ${divLine}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  <div>{t("source")}</div>
                  <div>{t("side")}</div>
                  <div>{t("symbol")}</div>
                  <div>{t("entry")}</div>
                  <div>{t("pnl")}</div>
                  <div>{t("status")}</div>
                  <div style={{ textAlign: "right" }}>{t("date")}</div>
                </div>
                {txLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "14px 20px",
                        borderBottom: `1px solid ${divLine}`,
                      }}
                    >
                      <Skel w="100%" h={18} r={6} dark={darkMode} />
                    </div>
                  ))
                ) : filteredTrades.length === 0 ? (
                  <div
                    style={{
                      padding: "30px",
                      textAlign: "center",
                      color: muted,
                      fontSize: "0.82rem",
                    }}
                  >
                    {t("no_trades_yet_start")}{" "}
                    <span
                      onClick={() => navigate("/trade")}
                      style={{
                        color: "#f59e0b",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {t("start_trading")}
                    </span>
                  </div>
                ) : (
                  filteredTrades.map((trade, i) => {
                    const src =
                      SOURCE_CONFIG[trade.source] || SOURCE_CONFIG.manual;
                    const sideUp = trade.side === "buy";
                    const pnl = trade.profit ?? trade.pnl ?? 0;
                    const pnlUp = pnl >= 0;
                    // entryPrice works for all sources (normalised in getAllTradeHistory)
                    const entry = trade.entryPrice || 0;

                    return (
                      <div
                        key={trade._id || i}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "80px 100px 110px 110px 100px 90px 80px",
                          gap: 8,
                          padding: "13px 20px",
                          borderBottom:
                            i < filteredTrades.length - 1
                              ? `1px solid ${divLine}`
                              : "none",
                          alignItems: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {/* Source badge */}
                        <div>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: 6,
                              background: src.bg,
                              color: src.color,
                            }}
                          >
                            {t(src.labelKey)}
                          </span>
                        </div>
                        {/* Side */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 6,
                              background: sideUp
                                ? "rgba(52,211,153,0.12)"
                                : "rgba(248,113,113,0.12)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {sideUp ? (
                              <TrendingUp
                                style={{
                                  width: 11,
                                  height: 11,
                                  color: "#34d399",
                                }}
                              />
                            ) : (
                              <TrendingDown
                                style={{
                                  width: 11,
                                  height: 11,
                                  color: "#f87171",
                                }}
                              />
                            )}
                          </div>
                          <span
                            style={{
                              color: sideUp ? "#34d399" : "#f87171",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              textTransform: "capitalize",
                            }}
                          >
                            {trade.side === "buy" ? t("buy") : t("sell")}
                          </span>
                        </div>
                        {/* Symbol */}
                        <div
                          style={{
                            color: textClr,
                            fontFamily: "monospace",
                            fontWeight: 600,
                            fontSize: "0.82rem",
                          }}
                        >
                          {trade.symbol}
                        </div>
                        {/* Entry */}
                        <div
                          style={{
                            color: muted,
                            fontFamily: "monospace",
                            fontSize: "0.82rem",
                          }}
                        >
                          {entry ? fmtUSD(entry) : "—"}
                        </div>
                        {/* P&L */}
                        <div
                          style={{
                            color: pnlUp ? "#34d399" : "#f87171",
                            fontFamily: "monospace",
                            fontWeight: 600,
                            fontSize: "0.82rem",
                          }}
                        >
                          {pnl !== 0
                            ? `${pnlUp ? "+" : ""}${fmtUSD(pnl)}`
                            : "—"}
                        </div>
                        {/* Status */}
                        <div>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: 6,
                              background:
                                trade.status === "open" ||
                                trade.status === "filled"
                                  ? "rgba(96,165,250,0.12)"
                                  : trade.status === "closed"
                                    ? "rgba(52,211,153,0.12)"
                                    : "rgba(245,158,11,0.12)",
                              color:
                                trade.status === "open" ||
                                trade.status === "filled"
                                  ? "#60a5fa"
                                  : trade.status === "closed"
                                    ? "#34d399"
                                    : "#f59e0b",
                            }}
                          >
                            {trade.status}
                          </span>
                        </div>
                        {/* Date */}
                        <div
                          style={{
                            color: muted,
                            fontSize: "0.72rem",
                            textAlign: "right",
                          }}
                        >
                          {new Date(
                            trade.openedAt || trade.createdAt,
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
