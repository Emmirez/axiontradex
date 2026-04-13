import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  RefreshCw,
  BarChart3,
  Activity,
  DollarSign,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import DashboardNav from "./DashboardNav";
import { useTranslation } from "react-i18next";
import BottomNav from "./BottomNav";

// Backend API URL
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Full coin list (for reference, backend will handle actual data)
// Note: Backend will return data for these coins via the /markets endpoint
const ALL_COIN_IDS = [
  "bitcoin",
  "ethereum",
  "tether",
  "solana",
  "ripple",
  "dogecoin",
  "cardano",
  "avalanche-2",
  "polkadot",
  "chainlink",
  "matic-network",
  "near",
  "sui",
  "binancecoin",
];

// Helpers
const fmtPrice = (p) => {
  if (p == null) return "—";
  if (p >= 1000)
    return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (p >= 1) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(6)}`;
};

const fmtBig = (v) => {
  if (!v) return "—";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  return `$${v.toFixed(0)}`;
};

// Skeleton
function Skel({ w = "100%", h = 16, r = 6, dark }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
        animation: "skPulse 1.4s ease-in-out infinite",
        flexShrink: 0,
      }}
    />
  );
}

// Sparkline (7-day mini chart)
function Sparkline({ data = [], up }) {
  if (!data || data.length < 2)
    return <div style={{ width: 80, height: 32 }} />;
  const W = 80,
    H = 32;
  const min = Math.min(...data),
    max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map(
      (v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`,
    )
    .join(" ");
  const color = up ? "#34d399" : "#f87171";
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block" }}
    >
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

//  Main Page
export default function MarketsPage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [coins, setCoins] = useState([]);
  const [global, setGlobal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("marketCap");
  const [sortDir, setSortDir] = useState("desc");
  const [favourites, setFavourites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mkt_favs") || "[]");
    } catch {
      return [];
    }
  });
  const [lastUpd, setLastUpd] = useState(null);
  const timerRef = useRef(null);

  // theme
  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const hoverBg = darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)";

  //  Fetch market movers from backend
  const fetchMovers = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE}/markets/movers`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      // Backend returns { data: movers, cached: boolean }
      const moversData = result.data || result;

      // Transform backend data to match our component structure
      const transformedCoins = moversData.map((coin, index) => ({
        rank: index + 1,
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image,
        price: coin.price,
        change24h: coin.change24h,
        volume: coin.volume,
        marketCap: coin.marketCap || coin.price * coin.volume * 100, // Fallback calculation
        spark: coin.sparkline || [], // Backend might not have sparkline yet
      }));

      setCoins(transformedCoins);
      setLastUpd(new Date());
    } catch (err) {
      console.error("[Markets] fetchMovers error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  //  Fetch global stats from backend or calculate from movers
  const fetchGlobalStats = useCallback(async () => {
    try {
      // Try to fetch global stats from your backend if you have an endpoint
      // If not, we'll calculate from coin data
      const response = await fetch(`${API_BASE}/markets/prices`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const prices = result.data || result;

        // Calculate approximate global stats from price data
        const totalMarketCap = Object.values(prices).reduce((sum, coin) => {
          // This is approximate - you might want a dedicated endpoint
          return sum + (coin.usd * 1000000 || 0);
        }, 0);

        setGlobal({
          marketCap: totalMarketCap,
          volume: totalMarketCap * 0.05, // Approximate daily volume
          avgChange: 2.5, // Placeholder
        });
      }
    } catch (err) {
      console.log("[Markets] Could not fetch global stats:", err.message);
      // Set default global stats if fetch fails
      setGlobal({
        marketCap: 2500000000000,
        volume: 125000000000,
        avgChange: 1.2,
      });
    }
  }, []);

  // Combined fetch function
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchMovers(), fetchGlobalStats()]);
  }, [fetchMovers, fetchGlobalStats]);

  // Initial load and interval
  useEffect(() => {
    fetchAllData();
    timerRef.current = setInterval(fetchAllData, 60000); // Update every 60 seconds
    return () => clearInterval(timerRef.current);
  }, [fetchAllData]);

  // Favourites toggle
  const toggleFav = (id) => {
    setFavourites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      localStorage.setItem("mkt_favs", JSON.stringify(next));
      return next;
    });
  };

  //  Sort handler
  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  //  Filtered + sorted list
  const displayed = useMemo(() => {
    let list = [...coins];

    // Category filter
    if (filter === "gainers") list = list.filter((c) => (c.change24h ?? 0) > 0);
    if (filter === "losers") list = list.filter((c) => (c.change24h ?? 0) < 0);
    if (filter === "favourites")
      list = list.filter((c) => favourites.includes(c.id));

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.symbol?.toLowerCase().includes(q),
      );
    }

    // Sort
    list.sort((a, b) => {
      let va = a[sortBy] ?? 0;
      let vb = b[sortBy] ?? 0;

      // Handle string sorting for name/symbol
      if (sortBy === "name") {
        va = a.name?.toLowerCase() || "";
        vb = b.name?.toLowerCase() || "";
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }

      return sortDir === "asc" ? va - vb : vb - va;
    });

    return list;
  }, [coins, filter, search, sortBy, sortDir, favourites]);

  const FILTERS = [
    { key: "all", labelKey: "all" },
    { key: "gainers", labelKey: "top_gainers" },
    { key: "losers", labelKey: "top_losers" },
    { key: "favourites", labelKey: "watchlist" },
  ];

  const SortHeader = ({ col, label, align = "right" }) => (
    <div
      onClick={() => handleSort(col)}
      style={{
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 4,
        justifyContent: align === "right" ? "flex-end" : "flex-start",
        userSelect: "none",
      }}
    >
      <span>{label}</span>
      <ArrowUpDown
        style={{
          width: 10,
          height: 10,
          opacity: sortBy === col ? 1 : 0.4,
          color: sortBy === col ? "#f59e0b" : "inherit",
        }}
      />
    </div>
  );

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
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .mkt-row:hover { background: ${hoverBg} !important; }
        .mkt-row { transition: background 0.15s; cursor: pointer; }
        .thin-scroll::-webkit-scrollbar{height:3px;width:3px}
        .thin-scroll::-webkit-scrollbar-thumb{background:rgba(245,158,11,0.3);border-radius:99px}
        .thin-scroll{scrollbar-width:thin;scrollbar-color:rgba(245,158,11,0.3) transparent}
        .fav-btn { background:none;border:none;cursor:pointer;padding:2px;display:flex;align-items:center;transition:transform 0.15s; }
        .fav-btn:hover { transform: scale(1.2); }
        .search-input:focus { outline: none; border-color: rgba(245,158,11,0.5) !important; }
        .trade-btn { opacity: 0; transform: scale(0.88); transition: opacity 0.18s ease, transform 0.18s ease; pointer-events: none; }
        .mkt-row:hover .trade-btn { opacity: 1; transform: scale(1); pointer-events: auto; }
      `}</style>

      <DashboardNav />

      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 20px 120px" }}
      >
        {/* Page header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: '"Playfair Display",serif',
                fontWeight: 800,
                fontSize: "clamp(1.6rem,4vw,2.2rem)",
                color: textClr,
                lineHeight: 1.1,
              }}
            >
              {t("markets")}
            </h1>
            <p style={{ color: muted, fontSize: "0.875rem", marginTop: 4 }}>
              {t("markets_subtitle")}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={fetchAllData}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                border: `1px solid ${border}`,
                background: "transparent",
                color: muted,
                fontSize: "0.78rem",
                cursor: "pointer",
              }}
            >
              <RefreshCw style={{ width: 12, height: 12 }} />
              {lastUpd
                ? lastUpd.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : t("refresh")}
            </button>
          </div>
        </div>

        {/*  Global stats  */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: 14,
            marginBottom: 24,
          }}
        >
          {[
            {
              labelKey: "total_market_cap",
              value: fmtBig(global?.marketCap),
              icon: BarChart3,
              color: "#34d399",
              up: true,
            },
            {
              labelKey: "24h_volume",
              value: fmtBig(global?.volume),
              icon: Activity,
              color: "#60a5fa",
              up: true,
            },
            {
              labelKey: "avg_24h_change",
              value:
                global?.avgChange != null
                  ? `${global.avgChange >= 0 ? "+" : ""}${global.avgChange.toFixed(2)}%`
                  : "—",
              icon: TrendingUp,
              color: (global?.avgChange ?? 0) >= 0 ? "#34d399" : "#f87171",
              up: (global?.avgChange ?? 0) >= 0,
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 16,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                animation: "fadeUp 0.35s ease both",
                animationDelay: `${i * 0.07}s`,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: `${s.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <s.icon style={{ width: 16, height: 16, color: s.color }} />
              </div>
              <div>
                <div
                  style={{ color: muted, fontSize: "0.7rem", marginBottom: 2 }}
                >
                  {t(s.labelKey)}
                </div>
                <div
                  style={{
                    fontFamily: '"Playfair Display",serif',
                    fontWeight: 800,
                    fontSize: "1.15rem",
                    color: s.color,
                  }}
                >
                  {loading ? "—" : s.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: "#f8717110",
              border: "1px solid #f87171",
              borderRadius: 12,
              padding: "12px 20px",
              marginBottom: 20,
              color: "#f87171",
              fontSize: "0.85rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Search + filters */}
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
              padding: "16px 20px",
              borderBottom: `1px solid ${divLine}`,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
            }}
          >
            {/* Search */}
            <div
              style={{ position: "relative", flex: "1 1 200px", maxWidth: 320 }}
            >
              <Search
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 14,
                  height: 14,
                  color: muted,
                  pointerEvents: "none",
                }}
              />
              <input
                className="search-input"
                placeholder={t("search_assets")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 34px",
                  borderRadius: 10,
                  border: `1px solid ${border}`,
                  background: inputBg,
                  color: textClr,
                  fontSize: "0.82rem",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
              />
            </div>

            {/* Category pills */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "none",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    background:
                      filter === f.key
                        ? "linear-gradient(135deg,#d97706,#f59e0b)"
                        : darkMode
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.05)",
                    color: filter === f.key ? "#020617" : muted,
                    transition: "all 0.15s",
                  }}
                >
                  {t(f.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/*  Table  */}
          <div className="thin-scroll" style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 740 }}>
              {/* Header row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "32px 28px 36px 1fr 130px 100px 120px 110px 80px",
                  gap: 8,
                  padding: "10px 20px",
                  color: muted,
                  fontSize: "0.66rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  borderBottom: `1px solid ${divLine}`,
                  whiteSpace: "nowrap",
                  alignItems: "center",
                }}
              >
                <div></div>
                <div>#</div>
                <div></div>
                <div>
                  <SortHeader col="name" label={t("asset")} align="left" />
                </div>
                <div style={{ textAlign: "right" }}>
                  <SortHeader col="price" label={t("price")} />
                </div>
                <div style={{ textAlign: "right" }}>
                  <SortHeader col="change24h" label={t("24h_percent")} />
                </div>
                <div style={{ textAlign: "right" }}>
                  <SortHeader col="volume" label={t("volume")} />
                </div>
                <div style={{ textAlign: "right" }}>
                  <SortHeader col="marketCap" label={t("mkt_cap")} />
                </div>
                <div style={{ textAlign: "right" }}>{t("action")}</div>
              </div>
              {/* Rows */}
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "32px 28px 36px 1fr 130px 100px 120px 110px 80px",
                      gap: 8,
                      padding: "14px 20px",
                      borderBottom: `1px solid ${divLine}`,
                      alignItems: "center",
                    }}
                  >
                    <Skel w={16} h={16} r={4} dark={darkMode} />
                    <Skel w={16} h={12} r={4} dark={darkMode} />
                    <Skel w={32} h={32} r={16} dark={darkMode} />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <Skel w={80} h={13} r={4} dark={darkMode} />
                      <Skel w={40} h={10} r={4} dark={darkMode} />
                    </div>
                    <Skel w={80} h={13} r={4} dark={darkMode} />
                    <Skel w={50} h={20} r={6} dark={darkMode} />
                    <Skel w={70} h={13} r={4} dark={darkMode} />
                    <Skel w={70} h={13} r={4} dark={darkMode} />
                    <Skel w={50} h={26} r={8} dark={darkMode} />
                  </div>
                ))
              ) : displayed.length === 0 ? (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: muted,
                    fontSize: "0.85rem",
                  }}
                >
                  {t("no_assets_match")}
                </div>
              ) : (
                displayed.map((coin, i) => {
                  const up = (coin.change24h ?? 0) >= 0;
                  const isFav = favourites.includes(coin.id);
                  const clr = up ? "#34d399" : "#f87171";

                  return (
                    <div
                      key={coin.id}
                      className="mkt-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "32px 28px 36px 1fr 130px 100px 120px 110px 80px",
                        gap: 8,
                        padding: "13px 20px",
                        borderBottom:
                          i < displayed.length - 1
                            ? `1px solid ${divLine}`
                            : "none",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => navigate(`/trade/${coin.symbol}USDT`)}
                    >
                      {/* Star */}
                      <button
                        className="fav-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFav(coin.id);
                        }}
                      >
                        <Star
                          style={{
                            width: 14,
                            height: 14,
                            color: isFav ? "#f59e0b" : muted,
                            fill: isFav ? "#f59e0b" : "none",
                          }}
                        />
                      </button>

                      {/* Rank */}
                      <div
                        style={{
                          color: muted,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {coin.rank}
                      </div>

                      {/* Image */}
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          overflow: "hidden",
                          background: darkMode
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(0,0,0,0.05)",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {coin.image ? (
                          <img
                            src={coin.image}
                            alt={coin.symbol}
                            width={32}
                            height={32}
                            style={{ borderRadius: "50%", objectFit: "cover" }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: "0.6rem",
                              fontWeight: 800,
                              color: muted,
                            }}
                          >
                            {coin.symbol?.slice(0, 2)}
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <div>
                        <span
                          style={{
                            color: textClr,
                            fontWeight: 700,
                            fontSize: "0.875rem",
                          }}
                        >
                          {coin.name}
                        </span>
                        <span
                          style={{
                            color: muted,
                            fontSize: "0.72rem",
                            marginLeft: 4,
                          }}
                        >
                          {coin.symbol}
                        </span>
                      </div>

                      {/* Price */}
                      <div
                        style={{
                          textAlign: "right",
                          color: textClr,
                          fontFamily: "monospace",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        {fmtPrice(coin.price)}
                      </div>

                      {/* 24h % */}
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: `${clr}18`,
                            color: clr,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          {up ? (
                            <TrendingUp style={{ width: 10, height: 10 }} />
                          ) : (
                            <TrendingDown style={{ width: 10, height: 10 }} />
                          )}
                          {up ? "+" : ""}
                          {(coin.change24h ?? 0).toFixed(2)}%
                        </span>
                      </div>

                      {/* Volume */}
                      <div
                        style={{
                          textAlign: "right",
                          color: muted,
                          fontFamily: "monospace",
                          fontSize: "0.82rem",
                        }}
                      >
                        {fmtBig(coin.volume)}
                      </div>

                      {/* Market cap */}
                      <div
                        style={{
                          textAlign: "right",
                          color: muted,
                          fontFamily: "monospace",
                          fontSize: "0.82rem",
                        }}
                      >
                        {fmtBig(coin.marketCap)}
                      </div>

                      {/* Trade button — hidden until row hover */}
                      <div
                        style={{ textAlign: "right" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          to={`/trade/${coin.symbol}USDT`}
                          className="trade-btn"
                          style={{
                            padding: "5px 12px",
                            borderRadius: 8,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            background:
                              "linear-gradient(135deg,#d97706,#f59e0b)",
                            color: "#020617",
                            textDecoration: "none",
                            display: "inline-block",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t("trade")}
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer */}
          {!loading && displayed.length > 0 && (
            <div
              style={{
                padding: "12px 20px",
                borderTop: `1px solid ${divLine}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: muted, fontSize: "0.72rem" }}>
                {t("showing_assets", {
                  shown: displayed.length,
                  total: coins.length,
                })}
              </span>
              <span style={{ color: muted, fontSize: "0.68rem" }}>
                {t("data_source_note")}
              </span>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
