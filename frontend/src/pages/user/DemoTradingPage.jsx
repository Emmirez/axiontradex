// frontend/src/pages/user/DemoTradingPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  RefreshCw,
  X,
  Loader,
  Trophy,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronRight,
  Wallet,
  AlertCircle,
  ChevronDown,
  Activity,
  BarChart2,
  List,
  Search,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import { useTranslation } from "react-i18next";
import api from "../../services/apiService";

// Real coin images from CoinGecko CDN
const COIN_IMAGES = {
  BTCUSDT: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETHUSDT: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOLUSDT: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  BNBUSDT:
    "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  DOGEUSDT: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  XRPUSDT:
    "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  ADAUSDT: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  AVAXUSDT:
    "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  DOTUSDT: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  MATICUSDT:
    "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
  LINKUSDT:
    "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  UNIUSDT:
    "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png",
  AAVEUSDT: "https://assets.coingecko.com/coins/images/12645/small/AAVE.png",
  SHIBUSDT: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
  PEPEUSDT:
    "https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg",
};

const PAIRS = [
  {
    label: "BTC/USDT",
    symbol: "BTCUSDT",
    base: "BTC",
    binance: "BTCUSDT",
    category: "layer1",
  },
  {
    label: "ETH/USDT",
    symbol: "ETHUSDT",
    base: "ETH",
    binance: "ETHUSDT",
    category: "layer1",
  },
  {
    label: "SOL/USDT",
    symbol: "SOLUSDT",
    base: "SOL",
    binance: "SOLUSDT",
    category: "layer1",
  },
  {
    label: "BNB/USDT",
    symbol: "BNBUSDT",
    base: "BNB",
    binance: "BNBUSDT",
    category: "layer1",
  },
  {
    label: "XRP/USDT",
    symbol: "XRPUSDT",
    base: "XRP",
    binance: "XRPUSDT",
    category: "layer1",
  },
  {
    label: "ADA/USDT",
    symbol: "ADAUSDT",
    base: "ADA",
    binance: "ADAUSDT",
    category: "layer1",
  },
  {
    label: "DOGE/USDT",
    symbol: "DOGEUSDT",
    base: "DOGE",
    binance: "DOGEUSDT",
    category: "meme",
  },
  {
    label: "SHIB/USDT",
    symbol: "SHIBUSDT",
    base: "SHIB",
    binance: "SHIBUSDT",
    category: "meme",
  },
  {
    label: "PEPE/USDT",
    symbol: "PEPEUSDT",
    base: "PEPE",
    binance: "PEPEUSDT",
    category: "meme",
  },
  {
    label: "MATIC/USDT",
    symbol: "MATICUSDT",
    base: "MATIC",
    binance: "MATICUSDT",
    category: "infrastructure",
  },
  {
    label: "LINK/USDT",
    symbol: "LINKUSDT",
    base: "LINK",
    binance: "LINKUSDT",
    category: "infrastructure",
  },
  {
    label: "UNI/USDT",
    symbol: "UNIUSDT",
    base: "UNI",
    binance: "UNIUSDT",
    category: "defi",
  },
  {
    label: "AAVE/USDT",
    symbol: "AAVEUSDT",
    base: "AAVE",
    binance: "AAVEUSDT",
    category: "defi",
  },
  {
    label: "AVAX/USDT",
    symbol: "AVAXUSDT",
    base: "AVAX",
    binance: "AVAXUSDT",
    category: "layer1",
  },
  {
    label: "DOT/USDT",
    symbol: "DOTUSDT",
    base: "DOT",
    binance: "DOTUSDT",
    category: "layer1",
  },
];

const CATEGORIES = [
  { key: "layer1", labelKey: "crypto", icon: "⬡" },
  { key: "infrastructure", labelKey: "infrastructure", icon: "⚙" },
  { key: "defi", labelKey: "defi", icon: "◈" },
  { key: "meme", labelKey: "meme", icon: "🐸" },
];

const fmtPrice = (p) => {
  if (p == null) return "—";
  if (p >= 1000)
    return p.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (p >= 1) return p.toFixed(4);
  return p.toFixed(6);
};

const fmtUSD = (v) =>
  `$${(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const rand = (min, max) => Math.random() * (max - min) + min;

function generateOrderBook(mid, rows = 10) {
  if (!mid) return { asks: [], bids: [] };
  const spread = mid * 0.0005;
  const asks = [],
    bids = [];
  let askP = mid + spread / 2,
    bidP = mid - spread / 2;
  let aTotal = 0,
    bTotal = 0;
  for (let i = 0; i < rows; i++) {
    const aAmt = parseFloat(rand(0.1, 3).toFixed(4));
    aTotal += aAmt;
    asks.push({
      price: askP,
      amount: aAmt,
      total: parseFloat(aTotal.toFixed(4)),
    });
    askP += mid * rand(0.0001, 0.0005);
    const bAmt = parseFloat(rand(0.1, 3).toFixed(4));
    bTotal += bAmt;
    bids.push({
      price: bidP,
      amount: bAmt,
      total: parseFloat(bTotal.toFixed(4)),
    });
    bidP -= mid * rand(0.0001, 0.0005);
  }
  return { asks: asks.reverse(), bids };
}

// Fixed TVChart component with proper initialization
function TVChart({ symbol, darkMode, height = 400 }) {
  const containerId = useRef(
    `tv_${symbol.replace(/[^a-z0-9]/gi, "_")}_${Math.random().toString(36).slice(2, 7)}`,
  );
  const widgetRef = useRef(null);
  const roRef = useRef(null);
  const timerRef = useRef(null);
  const theme = darkMode ? "dark" : "light";
  const [isReady, setIsReady] = useState(false);

  const initWidget = useCallback(() => {
    const id = containerId.current;
    const el = document.getElementById(id);
    if (!el || typeof TradingView === "undefined") return;

    // Guard: container must have real dimensions
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Clear previous widget
    el.innerHTML = "";
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (_) {}
      widgetRef.current = null;
    }

    try {
      widgetRef.current = new TradingView.widget({
        autosize: true,
        symbol: `BINANCE:${symbol}`,
        interval: "15",
        container_id: id,
        timezone: "Etc/UTC",
        theme,
        style: "1",
        locale: "en",
        toolbar_bg: darkMode ? "#0a1020" : "#f8fafc",
        enable_publishing: false,
        withdateranges: true,
        hide_side_toolbar: false,
        allow_symbol_change: false,
        studies: ["MASimple@tv-basicstudies", "RSI@tv-basicstudies"],
        show_popup_button: false,
        save_image: false,
        backgroundColor: darkMode ? "#0a1020" : "#ffffff",
        overrides: {
          "mainSeriesProperties.candleStyle.upColor": "#00c896",
          "mainSeriesProperties.candleStyle.downColor": "#ff4d6d",
          "mainSeriesProperties.candleStyle.borderUpColor": "#00c896",
          "mainSeriesProperties.candleStyle.borderDownColor": "#ff4d6d",
          "mainSeriesProperties.candleStyle.wickUpColor": "#00c896",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ff4d6d",
        },
        loading_screen: { backgroundColor: darkMode ? "#0a1020" : "#ffffff" },
      });

      setIsReady(true);
    } catch (e) {
      console.warn("[TVChart]", e.message);
      setIsReady(false);
    }
  }, [symbol, theme, darkMode]);

  const scheduleInit = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      initWidget();
    }, 100);
  }, [initWidget]);

  useEffect(() => {
    const id = containerId.current;
    setIsReady(false);

    const run = () => {
      if (typeof TradingView !== "undefined") {
        scheduleInit();
      } else {
        const existing = document.querySelector('script[src*="tradingview"]');
        if (existing) {
          existing.addEventListener("load", scheduleInit);
        } else {
          const s = document.createElement("script");
          s.src = "https://s3.tradingview.com/tv.js";
          s.async = true;
          s.onload = scheduleInit;
          document.head.appendChild(s);
        }
      }
    };

    if (typeof ResizeObserver !== "undefined") {
      roRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            roRef.current?.disconnect();
            run();
            break;
          }
        }
      });
      const el = document.getElementById(id);
      if (el) {
        roRef.current.observe(el);
      } else {
        setTimeout(run, 100);
      }
    } else {
      run();
    }

    return () => {
      clearTimeout(timerRef.current);
      roRef.current?.disconnect();
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (_) {}
      }
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
    };
  }, [symbol, theme, scheduleInit]);

  // Re-initialize when symbol changes
  useEffect(() => {
    if (widgetRef.current) {
      scheduleInit();
    }
  }, [symbol, scheduleInit]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: height,
        minHeight: height,
        background: darkMode ? "#0a1020" : "#ffffff",
      }}
    >
      <div
        id={containerId.current}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
      {!isReady && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: darkMode ? "#64748b" : "#94a3b8",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Loader size={16} style={{ animation: "spin 1s linear infinite" }} />
          <span>Loading chart...</span>
        </div>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const fetchCurrentPrice = async (symbol) => {
  try {
    const response = await api.get("/markets/prices");
    const result = response.data;
    const prices = result.data || result;
    const pairToCoinId = {
      BTCUSDT: "bitcoin",
      ETHUSDT: "ethereum",
      SOLUSDT: "solana",
      BNBUSDT: "binancecoin",
      DOGEUSDT: "dogecoin",
      XRPUSDT: "ripple",
      ADAUSDT: "cardano",
      AVAXUSDT: "avalanche-2",
      DOTUSDT: "polkadot",
      MATICUSDT: "matic-network",
      LINKUSDT: "chainlink",
      UNIUSDT: "uniswap",
      AAVEUSDT: "aave",
      SHIBUSDT: "shiba-inu",
      PEPEUSDT: "pepe",
    };
    const coinId = pairToCoinId[symbol];
    return prices[coinId]?.usd || 0;
  } catch {
    return 0;
  }
};

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);
  const colors = { success: "#00c896", error: "#ff4d6d", warning: "#f59e0b" };
  return (
    <div
      style={{
        position: "fixed",
        bottom: 88,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#161b2e",
        border: `1px solid ${colors[type] || colors.warning}`,
        color: "#e2e8f0",
        padding: "12px 20px",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        gap: 10,
        zIndex: 9999,
        boxShadow: `0 0 24px ${colors[type]}33`,
        animation: "toastIn 0.3s ease",
        minWidth: 240,
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: colors[type] || colors.warning,
          flexShrink: 0,
        }}
      />
      <span style={{ flex: 1, fontSize: "0.85rem", fontWeight: 500 }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#64748b",
          cursor: "pointer",
          padding: 2,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

function ResetConfirmModal({ onClose, onConfirm, t }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "#161b2e",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: 480,
          padding: "28px 24px 40px",
          animation: "slideUp 0.3s ease",
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.15)",
            margin: "0 auto 24px",
          }}
        />
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(255,77,109,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <RefreshCw size={22} color="#ff4d6d" />
        </div>
        <h3
          style={{
            color: "#f1f5f9",
            fontSize: "1.1rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          {t("resetDemoAccount")}
        </h3>
        <p
          style={{
            color: "#64748b",
            fontSize: "0.83rem",
            textAlign: "center",
            marginBottom: 28,
            lineHeight: 1.5,
          }}
        >
          {t("resetDemoWarning")}
        </p>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.88rem",
            }}
          >
            {t("cancel")}
          </button>
          <button
            onClick={async () => {
              setConfirming(true);
              await onConfirm();
              setConfirming(false);
            }}
            disabled={confirming}
            style={{
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: confirming
                ? "rgba(255,77,109,0.4)"
                : "linear-gradient(135deg,#c0001a,#ff4d6d)",
              color: "#fff",
              cursor: confirming ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: "0.88rem",
            }}
          >
            {confirming ? t("resetting") : t("reset")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Pair Row component with real images
function PairRow({ p, selected, onSelect, textClr, muted, divLine, t }) {
  const imgSrc = COIN_IMAGES[p.symbol];
  return (
    <button
      onClick={onSelect}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "11px 16px",
        border: "none",
        borderBottom: `1px solid ${divLine}`,
        background: selected ? "rgba(245,158,11,0.08)" : "transparent",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            border: selected
              ? "2px solid rgba(245,158,11,0.5)"
              : "2px solid transparent",
            background: "rgba(255,255,255,0.06)",
          }}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={p.base}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:800;color:${selected ? "#f59e0b" : muted};font-family:monospace">${p.base.slice(0, 4)}</div>`;
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.6rem",
                fontWeight: 800,
                color: selected ? "#f59e0b" : muted,
                fontFamily: "monospace",
              }}
            >
              {p.base.slice(0, 4)}
            </div>
          )}
        </div>
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              color: selected ? "#f59e0b" : textClr,
              fontWeight: 700,
              fontSize: "0.87rem",
              fontFamily: "monospace",
            }}
          >
            {p.label}
          </div>
          <div
            style={{
              color: muted,
              fontSize: "0.62rem",
              textTransform: "capitalize",
              marginTop: 1,
            }}
          >
            {t(p.category) || p.category}
          </div>
        </div>
      </div>
      {selected && (
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#f59e0b",
            boxShadow: "0 0 8px #f59e0b",
          }}
        />
      )}
    </button>
  );
}

// All Markets Drawer
function AllMarketsDrawer({
  open,
  onClose,
  pairs,
  selectedPair,
  onSelect,
  darkMode,
  textClr,
  muted,
  border,
  inputBg,
  divLine,
  t,
}) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    return pairs.filter(
      (p) =>
        (activeTab === "all" || p.category === activeTab) &&
        (p.label.toLowerCase().includes(q) || p.base.toLowerCase().includes(q)),
    );
  }, [pairs, activeTab, search]);

  const grouped = React.useMemo(() => {
    if (activeTab !== "all" || search) return null;
    const g = {};
    filtered.forEach((p) => {
      if (!g[p.category]) g[p.category] = [];
      g[p.category].push(p);
    });
    return g;
  }, [filtered, activeTab, search]);

  if (!open) return null;

  const drawerBg = darkMode ? "#080f1e" : "#ffffff";
  const catBg = darkMode ? "#0d1527" : "#f4f6fa";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500 }} onClick={onClose}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(360px, 92vw)",
          background: drawerBg,
          boxShadow: "4px 0 48px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          animation: "slideInLeft 0.25s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        <div
          style={{
            padding: "16px 16px 12px",
            borderBottom: `1px solid ${border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <span style={{ color: textClr, fontWeight: 800, fontSize: "1rem" }}>
              {t("all_markets")}
            </span>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: muted,
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
            >
              <X size={18} />
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: muted,
                pointerEvents: "none",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search_symbol")}
              autoFocus
              style={{
                width: "100%",
                padding: "9px 10px 9px 32px",
                borderRadius: 9,
                border: `1px solid ${border}`,
                background: inputBg,
                color: textClr,
                fontSize: "0.84rem",
                boxSizing: "border-box",
                outline: "none",
                fontFamily: "monospace",
              }}
            />
          </div>
        </div>
        <div
          style={{
            borderBottom: `1px solid ${border}`,
            background: catBg,
            flexShrink: 0,
          }}
        >
          <div
            style={{ display: "flex", overflowX: "auto" }}
            className="hide-scrollbar"
          >
            {[{ key: "all", labelKey: "all_markets_short" }, ...CATEGORIES].map(
              (cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveTab(cat.key)}
                  style={{
                    padding: "10px 12px",
                    border: "none",
                    borderBottom:
                      activeTab === cat.key
                        ? "2px solid #f59e0b"
                        : "2px solid transparent",
                    background: "transparent",
                    color: activeTab === cat.key ? "#f59e0b" : muted,
                    fontWeight: activeTab === cat.key ? 700 : 500,
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {cat.key === "all" ? t("all") : t(cat.labelKey)}
                </button>
              ),
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }} className="thin-scroll">
          {grouped
            ? Object.entries(grouped).map(([catKey, catPairs]) => {
                const catMeta = CATEGORIES.find((c) => c.key === catKey);
                return (
                  <div key={catKey}>
                    <div
                      style={{
                        padding: "8px 16px 5px",
                        color: "#f59e0b",
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        background: catBg,
                        borderBottom: `1px solid ${divLine}`,
                      }}
                    >
                      {catMeta?.icon} {catMeta ? t(catMeta.labelKey) : catKey}
                    </div>
                    {catPairs.map((p) => (
                      <PairRow
                        key={p.symbol}
                        p={p}
                        selected={selectedPair.symbol === p.symbol}
                        onSelect={() => {
                          onSelect(p);
                          onClose();
                        }}
                        textClr={textClr}
                        muted={muted}
                        divLine={divLine}
                        t={t}
                      />
                    ))}
                  </div>
                );
              })
            : filtered.map((p) => (
                <PairRow
                  key={p.symbol}
                  p={p}
                  selected={selectedPair.symbol === p.symbol}
                  onSelect={() => {
                    onSelect(p);
                    onClose();
                  }}
                  textClr={textClr}
                  muted={muted}
                  divLine={divLine}
                  t={t}
                />
              ))}
          {filtered.length === 0 && (
            <div
              style={{
                padding: "48px 16px",
                textAlign: "center",
                color: muted,
                fontSize: "0.84rem",
              }}
            >
              {t("no_results", { search })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PositionCard({ position, onClose, closingId, t }) {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loadingPrice, setLoadingPrice] = useState(true);

  useEffect(() => {
    const load = async () => {
      const p = await fetchCurrentPrice(position.symbol);
      setCurrentPrice(p);
      setLoadingPrice(false);
    };
    load();
    const interval = setInterval(load, 6000);
    return () => clearInterval(interval);
  }, [position.symbol]);

  const margin = position.margin || position.entryPrice * position.quantity;
  const pnl =
    position.side === "buy"
      ? (currentPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - currentPrice) * position.quantity;
  const pnlPct = margin > 0 ? (pnl / margin) * 100 : 0; // ROE% based on margin
  const pnlColor = pnl >= 0 ? "#00c896" : "#ff4d6d";

  const stats = [
    { label: t("qty"), value: position.quantity },
    { label: t("entry"), value: `$${fmtPrice(position.entryPrice)}` },
    {
      label: t("current"),
      value: loadingPrice ? "..." : `$${fmtPrice(currentPrice)}`,
    },
    {
      label: t("liquidation_price_lev"),
      value: position.liquidationPrice
        ? `$${fmtPrice(position.liquidationPrice)}`
        : "—",
      warn: true,
    },
  ];

  return (
    <div
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "0.92rem" }}
          >
            {position.symbol}
          </span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 6,
              fontSize: "0.68rem",
              fontWeight: 700,
              background:
                position.side === "buy"
                  ? "rgba(0,200,150,0.12)"
                  : "rgba(255,77,109,0.12)",
              color: position.side === "buy" ? "#00c896" : "#ff4d6d",
            }}
          >
            {position.side.toUpperCase()}
          </span>
          {position.leverage > 1 && (
            <span
              style={{
                padding: "2px 7px",
                borderRadius: 6,
                fontSize: "0.65rem",
                fontWeight: 700,
                background: "rgba(245,158,11,0.12)",
                color: "#f59e0b",
              }}
            >
              {position.leverage}×
            </span>
          )}
        </div>
        <button
          onClick={() => onClose(position.tradeId, position.symbol)}
          disabled={closingId === position.tradeId}
          style={{
            padding: "5px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent",
            color: "#64748b",
            cursor: "pointer",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          {closingId === position.tradeId ? t("closing") : t("close")}
        </button>
      </div>

      {/* Stats grid — 4 cols */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 8,
        }}
      >
        {stats.map(({ label, value, warn }) => (
          <div
            key={label}
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: 8,
              padding: "8px 10px",
            }}
          >
            <div
              style={{
                color: "#475569",
                fontSize: "0.65rem",
                marginBottom: 3,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {label}
            </div>
            <div
              style={{
                color: warn ? "#f87171" : "#e2e8f0",
                fontFamily: "monospace",
                fontSize: "0.78rem",
                fontWeight: 500,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* P&L row */}
      <div
        style={{
          marginTop: 10,
          padding: "8px 12px",
          borderRadius: 8,
          background: `${pnlColor}10`,
          border: `1px solid ${pnlColor}22`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
          {t("unrealizedPnL")}
        </span>
        <span
          style={{
            color: pnlColor,
            fontFamily: "monospace",
            fontWeight: 700,
            fontSize: "0.88rem",
          }}
        >
          {pnl >= 0 ? "+" : ""}
          {fmtUSD(pnl)}
          <span style={{ fontSize: "0.72rem", marginLeft: 4, opacity: 0.8 }}>
            ({pnlPct >= 0 ? "+" : ""}
            {pnlPct.toFixed(2)}% ROE)
          </span>
        </span>
      </div>
    </div>
  );
}

function RecentTradeCard({ trade, t }) {
  const profitColor = (trade.profit || 0) >= 0 ? "#00c896" : "#ff4d6d";
  return (
    <div
      style={{
        padding: "11px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background:
            trade.side === "buy"
              ? "rgba(0,200,150,0.1)"
              : "rgba(255,77,109,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {trade.side === "buy" ? (
          <TrendingUp size={16} color="#00c896" />
        ) : (
          <TrendingDown size={16} color="#ff4d6d" />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 3,
          }}
        >
          <span
            style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "0.85rem" }}
          >
            {trade.symbol}
          </span>
          <span
            style={{
              color: profitColor,
              fontFamily: "'DM Mono', monospace",
              fontWeight: 700,
              fontSize: "0.85rem",
            }}
          >
            {(trade.profit || 0) >= 0 ? "+" : ""}
            {fmtUSD(trade.profit)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#475569", fontSize: "0.7rem" }}>
            {new Date(trade.closedAt).toLocaleDateString()} · {t("qty")}:{" "}
            {trade.quantity}
          </span>
          <span
            style={{ color: profitColor, fontSize: "0.7rem", opacity: 0.8 }}
          >
            ({trade.profitPercent?.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DemoTradingPage() {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [leverage, setLeverage] = useState(1);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [selectedPair, setSelectedPair] = useState(PAIRS[0]);
  const [marketsOpen, setMarketsOpen] = useState(false);
  const [priceData, setPriceData] = useState(null);
  const [prevPrice, setPrevPrice] = useState(null);
  const [orderBook, setOrderBook] = useState({ asks: [], bids: [] });
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [account, setAccount] = useState(null);
  const [openPositions, setOpenPositions] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [activeTab, setActiveTab] = useState("chart");
  const [priceFlash, setPriceFlash] = useState(null);
  const [obExpanded, setObExpanded] = useState(false);

  const priceTimer = useRef(null);
  const obTimer = useRef(null);

  const pageBg = darkMode ? "#020617" : "#f0f2f5";
  const cardBg = darkMode ? "rgba(10,16,35,0.98)" : "rgba(255,255,255,0.99)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const inputBg = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  const currentPrice = priceData?.price || 0;
  const demoBalance = account?.balance || 100000;
  const isUp = (priceData?.change24h ?? 0) >= 0;
  const notional = parseFloat(amount || 0) * currentPrice; // full position size
  const margin = parseFloat((notional / leverage).toFixed(8));
  const fee = parseFloat((notional * 0.001).toFixed(8));
  const cost = parseFloat((margin + fee).toFixed(8));
  const liqPrice =
    leverage > 1 && currentPrice
      ? side === "buy"
        ? parseFloat((currentPrice * (1 - 1 / leverage + 0.005)).toFixed(2))
        : parseFloat((currentPrice * (1 + 1 / leverage - 0.005)).toFixed(2))
      : null;

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchPrice = useCallback(async () => {
    try {
      const price = await fetchCurrentPrice(selectedPair.symbol);
      setPriceData((prev) => {
        if (prev?.price && price !== prev.price) {
          setPriceFlash(price > prev.price ? "up" : "down");
          setTimeout(() => setPriceFlash(null), 600);
          setPrevPrice(prev.price);
        }
        return {
          price,
          change24h: prev?.change24h ?? 0,
          high24h: price * 1.05,
          low24h: price * 0.95,
        };
      });
    } catch {}
  }, [selectedPair.symbol]);

  useEffect(() => {
    fetchPrice();
    priceTimer.current = setInterval(fetchPrice, 10000);
    return () => clearInterval(priceTimer.current);
  }, [fetchPrice]);

  useEffect(() => {
    if (currentPrice) setOrderBook(generateOrderBook(currentPrice));
    obTimer.current = setInterval(() => {
      if (currentPrice) setOrderBook(generateOrderBook(currentPrice));
    }, 4000);
    return () => clearInterval(obTimer.current);
  }, [currentPrice]);

  const fetchDemoData = async () => {
    setLoading(true);
    try {
      const [statsRes] = await Promise.all([api.get("/demo-trading/stats")]);
      const data = statsRes.data?.data;
      setAccount({
        balance: data?.stats?.balance,
        profit: data?.stats?.profit,
      });
      setOpenPositions(data?.openPositions || []);
      setRecentTrades(data?.recentTrades || []);
    } catch (err) {
      showToast(t("failedToFetchDemoData"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoData();
  }, []);

  const handleSelectPair = (p) => {
    setSelectedPair(p);
  };

  const handlePlaceOrder = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast(t("enterValidAmount"), "error");
      return;
    }
    if (cost > demoBalance) {
      showToast(
        t("insufficient_balance_lev", {
          required: cost.toFixed(2),
          available: demoBalance.toFixed(2),
        }),
        "error",
      );
      return;
    }
    if (margin > demoBalance * 0.9) {
      showToast(t("position_too_large"), "error");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/demo-trading/trade/open", {
        symbol: selectedPair.symbol,
        side,
        quantity: parseFloat(amount),
        entryPrice: currentPrice,
        leverage,
      });
      showToast(
        t("order_placed_demo", {
          action: side === "buy" ? t("bought") : t("sold"),
          amount: amount,
          symbol: selectedPair.base,
          leverage: leverage > 1 ? `(${leverage}×)` : "",
        }),
        "success",
      );
      setAmount("");
      fetchDemoData();
    } catch (err) {
      showToast(
        err.response?.data?.message || t("failedToPlaceOrder"),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClosePosition = async (tradeId, symbol) => {
    setClosingId(tradeId);
    try {
      const cp = await fetchCurrentPrice(symbol);
      await api.post("/demo-trading/trade/close", { tradeId, exitPrice: cp });
      showToast(t("positionClosed"), "success");
      fetchDemoData();
    } catch (err) {
      showToast(
        err.response?.data?.message || t("failedToClosePosition"),
        "error",
      );
    } finally {
      setClosingId(null);
    }
  };

  const confirmReset = async () => {
    setResetting(true);
    try {
      await api.post("/demo-trading/reset");
      showToast(t("demo_reset_success"), "success");
      fetchDemoData();
    } catch (err) {
      showToast(err.response?.data?.message || t("failedToReset"), "error");
    } finally {
      setResetting(false);
      setResetConfirm(false);
    }
  };

  const setAmountPct = (pct) => {
    const usdAmt = demoBalance * (pct / 100);
    const coinAmt = currentPrice > 0 ? usdAmt / currentPrice : 0;
    setAmount(parseFloat(coinAmt.toFixed(6)).toString());
  };

  const profitColor = (account?.profit || 0) >= 0 ? "#00c896" : "#ff4d6d";
  const MOBILE_CHART_HEIGHT = 380;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBg,
        fontFamily: "'DM Sans', 'Nunito', sans-serif",
      }}
    >
      <DashboardNav />

      <style>{`
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(16px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
        @keyframes slideInLeft { from { transform:translateX(-100%); } to { transform:translateX(0); } }
        @keyframes flashGreen { 0%,100% { background:transparent; } 30% { background:rgba(0,200,150,0.18); } }
        @keyframes flashRed { 0%,100% { background:transparent; } 30% { background:rgba(255,77,109,0.18); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
        input[type=number] { -moz-appearance:textfield; }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
        .thin-scroll::-webkit-scrollbar { width:3px; height:3px; }
        .thin-scroll::-webkit-scrollbar-thumb { background:rgba(245,158,11,0.25); border-radius:99px; }
        .thin-scroll { scrollbar-width:thin; scrollbar-color:rgba(245,158,11,0.25) transparent; }
        .hide-scrollbar::-webkit-scrollbar { display:none; }
        .hide-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
        .pct-btn { transition: all 0.15s; cursor: pointer; border: none; }
        .pct-btn:hover { background: rgba(240,180,41,0.15) !important; color: #f0b429 !important; border-color: rgba(240,180,41,0.3) !important; }
        
        /* Force TradingView iframe to fill container */
        [id^="tv_"] iframe,
        [id^="tv_"] > div,
        [id^="tv_"] > div > iframe {
          width: 100% !important;
          height: 100% !important;
          min-height: inherit !important;
          border: none !important;
        }
      `}</style>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {resetConfirm && (
        <ResetConfirmModal
          onClose={() => setResetConfirm(false)}
          onConfirm={confirmReset}
          t={t}
        />
      )}

      <AllMarketsDrawer
        open={marketsOpen}
        onClose={() => setMarketsOpen(false)}
        pairs={PAIRS}
        selectedPair={selectedPair}
        onSelect={handleSelectPair}
        darkMode={darkMode}
        textClr={textClr}
        muted={muted}
        border={border}
        inputBg={inputBg}
        divLine={divLine}
        t={t}
      />

      <div style={{ paddingTop: 64, paddingBottom: 80 }}>
        {/* Header Bar */}
        <div
          style={{
            background: cardBg,
            borderBottom: `1px solid ${border}`,
            padding: "10px 14px",
          }}
        >
          {/* Pair selector + price row - with horizontal scroll */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 10,
              overflowX: "auto",
              overflowY: "hidden",
              whiteSpace: "nowrap",
              scrollbarWidth: "thin",
              WebkitOverflowScrolling: "touch",
            }}
            className="hide-scrollbar"
          >
            <button
              onClick={() => setMarketsOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 12px",
                borderRadius: 10,
                border: "1px solid rgba(245,158,11,0.3)",
                background:
                  "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.04))",
                color: "#f59e0b",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              ◈ {t("all_markets_short")} <ChevronRight size={12} />
            </button>

            <button
              onClick={() => setMarketsOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                {COIN_IMAGES[selectedPair.symbol] ? (
                  <img
                    src={COIN_IMAGES[selectedPair.symbol]}
                    alt={selectedPair.base}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      color: muted,
                    }}
                  >
                    {selectedPair.base.slice(0, 3)}
                  </div>
                )}
              </div>
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  color: textClr,
                }}
              >
                {selectedPair.label}
              </span>
              <ChevronDown size={13} style={{ color: muted }} />
            </button>

            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontWeight: 600,
                fontSize: "1.35rem",
                color:
                  priceFlash === "up"
                    ? "#00c896"
                    : priceFlash === "down"
                      ? "#ff4d6d"
                      : textClr,
                transition: "color 0.3s",
                animation: priceFlash
                  ? `${priceFlash === "up" ? "flashGreen" : "flashRed"} 0.6s ease`
                  : "none",
                flexShrink: 0,
              }}
            >
              ${priceData ? fmtPrice(priceData.price) : "—"}
            </div>

            <button
              onClick={() => setResetConfirm(true)}
              disabled={resetting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 10px",
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: "transparent",
                color: muted,
                cursor: "pointer",
                fontSize: "0.78rem",
                flexShrink: 0,
              }}
            >
              <RefreshCw
                size={13}
                style={{
                  animation: resetting ? "pulse 1s infinite" : "none",
                }}
              />
              {t("reset")}
            </button>
          </div>

          {/* Stats strip - also add scroll if needed */}
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              overflowX: "auto",
              overflowY: "hidden",
              whiteSpace: "nowrap",
              scrollbarWidth: "thin",
              WebkitOverflowScrolling: "touch",
            }}
            className="hide-scrollbar"
          >
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  color: muted,
                  fontSize: "0.65rem",
                  marginBottom: 1,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {t("demoBalance")}
              </div>
              <div
                style={{
                  color: "#f59e0b",
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                }}
              >
                {loading ? "..." : fmtUSD(demoBalance)}
              </div>
            </div>
            <div
              style={{
                width: 1,
                height: 28,
                background: border,
                flexShrink: 0,
              }}
            />
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  color: muted,
                  fontSize: "0.65rem",
                  marginBottom: 1,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {t("totalPnL")}
              </div>
              <div
                style={{
                  color: profitColor,
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                }}
              >
                {loading
                  ? "..."
                  : `${(account?.profit || 0) >= 0 ? "+" : ""}${fmtUSD(account?.profit || 0)}`}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 20,
                background: "rgba(0,200,150,0.08)",
                border: "1px solid rgba(0,200,150,0.15)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#00c896",
                  animation: "pulse 2s infinite",
                }}
              />
              <span
                style={{
                  color: "#00c896",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                }}
              >
                {t("demo")}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            background: cardBg,
            borderBottom: `1px solid ${border}`,
            padding: "0 16px",
          }}
        >
          {[
            { id: "chart", icon: <BarChart2 size={14} />, label: t("chart") },
            {
              id: "orderbook",
              icon: <List size={14} />,
              label: t("orderBook"),
            },
            {
              id: "positions",
              icon: <Activity size={14} />,
              label: `${t("positions")} (${openPositions.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 0",
                marginRight: 24,
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === tab.id
                    ? "2px solid #f59e0b"
                    : "2px solid transparent",
                color: activeTab === tab.id ? textClr : muted,
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chart Panel - FIXED with proper dimensions */}
        {activeTab === "chart" && (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: MOBILE_CHART_HEIGHT,
              minHeight: MOBILE_CHART_HEIGHT,
              background: darkMode ? "#0a1020" : "#fff",
              overflow: "hidden",
            }}
          >
            <TVChart
              symbol={selectedPair.binance}
              darkMode={darkMode}
              height={MOBILE_CHART_HEIGHT}
            />
          </div>
        )}

        {/* Order Book Panel */}
        {activeTab === "orderbook" && (
          <div style={{ background: cardBg, padding: "12px 16px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                padding: "0 0 6px",
                color: muted,
                fontSize: "0.68rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <span>{t("price")}</span>
              <span style={{ textAlign: "right" }}>{t("amount")}</span>
              <span style={{ textAlign: "right" }}>{t("total")}</span>
            </div>
            {/* Asks */}
            <div
              className="thin-scroll"
              style={{ maxHeight: 200, overflowY: "auto" }}
            >
              {[...orderBook.asks].reverse().map((row, i) => {
                const pct = Math.min(
                  (row.total /
                    (orderBook.asks[orderBook.asks.length - 1]?.total || 1)) *
                    100,
                  100,
                );
                return (
                  <div
                    key={i}
                    onClick={() =>
                      setAmount((currentPrice / row.price).toFixed(6))
                    }
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      padding: "4px 0",
                      position: "relative",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: `${pct}%`,
                        background: "rgba(255,77,109,0.07)",
                        borderRadius: 2,
                      }}
                    />
                    <span
                      style={{
                        color: "#ff4d6d",
                        fontSize: "0.75rem",
                        fontFamily: "'DM Mono', monospace",
                        position: "relative",
                      }}
                    >
                      {fmtPrice(row.price)}
                    </span>
                    <span
                      style={{
                        color: muted,
                        fontSize: "0.75rem",
                        textAlign: "right",
                        fontFamily: "'DM Mono', monospace",
                        position: "relative",
                      }}
                    >
                      {row.amount}
                    </span>
                    <span
                      style={{
                        color: muted,
                        fontSize: "0.75rem",
                        textAlign: "right",
                        fontFamily: "'DM Mono', monospace",
                        position: "relative",
                      }}
                    >
                      {row.total}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Spread */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "8px 0",
                gap: 8,
              }}
            >
              <div style={{ flex: 1, height: 1, background: border }} />
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: isUp ? "#00c896" : "#ff4d6d",
                }}
              >
                ${priceData ? fmtPrice(priceData.price) : "—"}
              </span>
              <div style={{ flex: 1, height: 1, background: border }} />
            </div>
            {/* Bids */}
            <div
              className="thin-scroll"
              style={{ maxHeight: 200, overflowY: "auto" }}
            >
              {orderBook.bids.map((row, i) => {
                const pct = Math.min(
                  (row.total /
                    (orderBook.bids[orderBook.bids.length - 1]?.total || 1)) *
                    100,
                  100,
                );
                return (
                  <div
                    key={i}
                    onClick={() =>
                      setAmount((currentPrice / row.price).toFixed(6))
                    }
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      padding: "4px 0",
                      position: "relative",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: `${pct}%`,
                        background: "rgba(0,200,150,0.07)",
                        borderRadius: 2,
                      }}
                    />
                    <span
                      style={{
                        color: "#00c896",
                        fontSize: "0.75rem",
                        fontFamily: "'DM Mono', monospace",
                        position: "relative",
                      }}
                    >
                      {fmtPrice(row.price)}
                    </span>
                    <span
                      style={{
                        color: muted,
                        fontSize: "0.75rem",
                        textAlign: "right",
                        fontFamily: "'DM Mono', monospace",
                        position: "relative",
                      }}
                    >
                      {row.amount}
                    </span>
                    <span
                      style={{
                        color: muted,
                        fontSize: "0.75rem",
                        textAlign: "right",
                        fontFamily: "'DM Mono', monospace",
                        position: "relative",
                      }}
                    >
                      {row.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Positions Panel */}
        {activeTab === "positions" && (
          <div style={{ background: cardBg }}>
            {openPositions.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <Activity
                  size={32}
                  color="#1e293b"
                  style={{ marginBottom: 12 }}
                />
                <div style={{ color: muted, fontSize: "0.85rem" }}>
                  {t("noOpenPositions")}
                </div>
                <div
                  style={{
                    color: muted,
                    fontSize: "0.75rem",
                    marginTop: 4,
                    opacity: 0.7,
                  }}
                >
                  {t("placeDemoTradeToStart")}
                </div>
              </div>
            ) : (
              openPositions.map((pos) => (
                <PositionCard
                  key={pos.tradeId}
                  position={pos}
                  onClose={handleClosePosition}
                  closingId={closingId}
                  t={t}
                />
              ))
            )}
            {recentTrades.length > 0 && (
              <>
                <div
                  style={{
                    padding: "10px 16px",
                    borderTop: `1px solid ${border}`,
                    color: muted,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {t("recentTrades")}
                </div>
                {recentTrades.slice(0, 5).map((trade) => (
                  <RecentTradeCard key={trade.tradeId} trade={trade} t={t} />
                ))}
              </>
            )}
          </div>
        )}

        {/* Trade Panel */}
        <div
          style={{
            background: cardBg,
            marginTop: 1,
            borderTop: `1px solid ${border}`,
          }}
        >
          {/* Buy / Sell Toggle */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 0,
              borderBottom: `1px solid ${border}`,
            }}
          >
            <button
              onClick={() => setSide("buy")}
              style={{
                padding: "14px",
                border: "none",
                cursor: "pointer",
                background:
                  side === "buy" ? "rgba(0,200,150,0.08)" : "transparent",
                color: side === "buy" ? "#00c896" : muted,
                fontWeight: 700,
                fontSize: "0.92rem",
                borderBottom:
                  side === "buy"
                    ? "2px solid #00c896"
                    : "2px solid transparent",
              }}
            >
              {t("buy")}
            </button>
            <button
              onClick={() => setSide("sell")}
              style={{
                padding: "14px",
                border: "none",
                cursor: "pointer",
                background:
                  side === "sell" ? "rgba(255,77,109,0.08)" : "transparent",
                color: side === "sell" ? "#ff4d6d" : muted,
                fontWeight: 700,
                fontSize: "0.92rem",
                borderBottom:
                  side === "sell"
                    ? "2px solid #ff4d6d"
                    : "2px solid transparent",
              }}
            >
              {t("sell")}
            </button>
          </div>

          <div style={{ padding: "16px" }}>
            {/* Amount Input */}
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <label
                  style={{
                    color: muted,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {t("amountLabel", { base: selectedPair.base })}
                </label>
                <span style={{ color: muted, fontSize: "0.7rem" }}>
                  {t("avail")}: {fmtUSD(demoBalance)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0,
                  background: inputBg,
                  border: `1px solid ${border}`,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "13px 14px",
                    background: "transparent",
                    border: "none",
                    color: textClr,
                    fontSize: "1rem",
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 500,
                    outline: "none",
                  }}
                />
                <span
                  style={{
                    padding: "0 14px",
                    color: muted,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    borderLeft: `1px solid ${border}`,
                  }}
                >
                  {selectedPair.base}
                </span>
              </div>
            </div>

            {/* Percentage Buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 6,
                marginBottom: 14,
              }}
            >
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  className="pct-btn"
                  onClick={() => setAmountPct(pct)}
                  style={{
                    padding: "8px 0",
                    borderRadius: 8,
                    border: `1px solid ${border}`,
                    background: inputBg,
                    color: muted,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {pct}%
                </button>
              ))}
            </div>

            {/* Leverage Selector */}
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
                    color: muted,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Leverage
                </label>
                <span
                  style={{
                    color: side === "buy" ? "#00c896" : "#ff4d6d",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    fontFamily: "monospace",
                  }}
                >
                  {leverage}×
                </span>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {[1, 2, 3, 5, 10, 20, 50, 100].map((lev) => (
                  <button
                    key={lev}
                    onClick={() => setLeverage(lev)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 7,
                      cursor: "pointer",
                      border: `1px solid ${leverage === lev ? (side === "buy" ? "#00c896" : "#ff4d6d") : border}`,
                      background:
                        leverage === lev
                          ? side === "buy"
                            ? "rgba(0,200,150,0.12)"
                            : "rgba(255,77,109,0.12)"
                          : inputBg,
                      color:
                        leverage === lev
                          ? side === "buy"
                            ? "#00c896"
                            : "#ff4d6d"
                          : muted,
                      fontSize: "0.74rem",
                      fontWeight: leverage === lev ? 800 : 500,
                    }}
                  >
                    {lev}×
                  </button>
                ))}
              </div>
              {leverage > 1 && (
                <div
                  style={{
                    marginTop: 6,
                    padding: "5px 10px",
                    borderRadius: 7,
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.15)",
                    fontSize: "0.68rem",
                    color: "#f59e0b",
                  }}
                >
                  ⚠ {t("leverage_warning", { leverage: leverage })}
                </div>
              )}
            </div>

            {/* Summary */}
            <div
              style={{
                background: inputBg,
                border: `1px solid ${border}`,
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 14,
              }}
            >
              {[
                { label: "Position size", value: `$${notional.toFixed(2)}` },
                {
                  label: `Margin (${leverage}×)`,
                  value: `$${margin.toFixed(2)}`,
                  color: side === "buy" ? "#00c896" : "#ff4d6d",
                },
                { label: "Fee (0.1%)", value: `$${fee.toFixed(2)}` },
                { label: "Cost", value: `$${cost.toFixed(2)}`, bold: true },
                liqPrice
                  ? {
                      label: "Liq. price",
                      value: `$${liqPrice.toFixed(2)}`,
                      color: "#ff4d6d",
                    }
                  : null,
              ]
                .filter(Boolean)
                .map((row, i, arr) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingBottom: i < arr.length - 1 ? 8 : 0,
                      marginBottom: i < arr.length - 1 ? 8 : 0,
                      borderBottom:
                        i < arr.length - 1 ? `1px solid ${border}` : "none",
                    }}
                  >
                    <span style={{ color: muted, fontSize: "0.78rem" }}>
                      {row.label}
                    </span>
                    <span
                      style={{
                        color: row.color || textClr,
                        fontFamily: "monospace",
                        fontWeight: row.bold ? 800 : 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              {/* Risk warning */}
              {margin > demoBalance * 0.8 && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "5px 8px",
                    borderRadius: 6,
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    fontSize: "0.68rem",
                    color: "#f87171",
                  }}
                >
                  ⚠{" "}
                  {t("risk_warning_percent", {
                    percent: ((margin / demoBalance) * 100).toFixed(0),
                  })}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: 12,
                border: "none",
                background: submitting
                  ? muted
                  : side === "buy"
                    ? "linear-gradient(135deg, #00a67e, #00c896)"
                    : "linear-gradient(135deg, #c0001a, #ff4d6d)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: submitting ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                letterSpacing: "0.02em",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Loader
                    size={16}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  {t("placingOrder")}
                </span>
              ) : (
                `${side === "buy" ? t("buy") : t("sell")} ${selectedPair.base}`
              )}
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
