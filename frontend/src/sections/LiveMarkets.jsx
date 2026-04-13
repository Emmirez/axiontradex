import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import api from "../services/apiService";
import { useTranslation } from 'react-i18next';

const COIN_META = {
  bitcoin: { rank: 1, name: "Bitcoin", symbol: "BTC", vol: "$38.42B" },
  ethereum: { rank: 2, name: "Ethereum", symbol: "ETH", vol: "$18.20B" },
  solana: { rank: 3, name: "Solana", symbol: "SOL", vol: "$4.80B" },
  binancecoin: { rank: 4, name: "BNB", symbol: "BNB", vol: "$2.10B" },
  tether: { rank: 5, name: "Tether", symbol: "USDT", vol: "$98.00B" },
  ripple: { rank: 6, name: "XRP", symbol: "XRP", vol: "$3.20B" },
  cardano: { rank: 7, name: "Cardano", symbol: "ADA", vol: "$1.50B" },
  "avalanche-2": { rank: 8, name: "Avalanche", symbol: "AVAX", vol: "$890M" },
  dogecoin: { rank: 9, name: "Dogecoin", symbol: "DOGE", vol: "$1.20B" },
  chainlink: { rank: 10, name: "Chainlink", symbol: "LINK", vol: "$780M" },
};

function generateSparkline(basePrice) {
  return Array.from({ length: 10 }, () => {
    const noise = (Math.random() - 0.5) * basePrice * 0.012;
    return basePrice + noise;
  });
}

function formatPrice(price) {
  if (!price) return "$0.00";
  if (price >= 1000)
    return (
      "$" +
      price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  if (price >= 1) return "$" + price.toFixed(4);
  return "$" + price.toFixed(6);
}

function Sparkline({ data, up }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80,
    h = 32;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  const color = up ? "#34d399" : "#f87171";
  const fillId = `sf-${Math.random().toString(36).slice(2)}`;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PriceCell({ price, prevPrice }) {
  const [flash, setFlash] = useState(null);
  useEffect(() => {
    if (prevPrice === null) return;
    if (price > prevPrice) setFlash("up");
    else if (price < prevPrice) setFlash("down");
    const t = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(t);
  }, [price]);
  return (
    <div
      className="font-mono text-sm font-semibold transition-colors duration-300"
      style={{
        color:
          flash === "up" ? "#34d399" : flash === "down" ? "#f87171" : "#fff",
      }}
    >
      {formatPrice(price)}
    </div>
  );
}

function DesktopRow({ m }) {
  const iconUrl = `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/128/color/${m.symbol.toLowerCase()}.png`;
  const fallback = `https://ui-avatars.com/api/?name=${m.symbol}&background=d97706&color=fff&size=32`;
  return (
    <div
      className="hidden md:grid items-center gap-3 px-6 py-3 border-b border-white/5 hover:bg-yellow-500/5 transition-colors cursor-pointer"
      style={{ gridTemplateColumns: "32px 1fr 90px 120px 120px 90px" }}
    >
      <div className="text-slate-500 text-sm">{m.rank}</div>
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={iconUrl}
          alt={m.symbol}
          className="w-8 h-8 rounded-full flex-shrink-0"
          onError={(e) => {
            e.target.src = fallback;
          }}
        />
        <div className="min-w-0">
          <div className="text-white text-sm font-semibold truncate">
            {m.name}
          </div>
          <div className="text-slate-500 text-xs">{m.symbol}</div>
        </div>
      </div>
      <div className="flex justify-center">
        <Sparkline data={m.sparkline} up={m.up} />
      </div>
      <div className="text-right">
        <PriceCell price={m.price} prevPrice={m.prevPrice} />
      </div>
      <div className="flex justify-end">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono"
          style={{
            background: m.up ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
            color: m.up ? "#34d399" : "#f87171",
          }}
        >
          {m.up ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {m.change > 0 ? "+" : ""}
          {m.change.toFixed(2)}%
        </span>
      </div>
      <div className="text-right text-slate-400 text-sm font-mono">{m.vol}</div>
    </div>
  );
}

function MobileRow({ m }) {
  const iconUrl = `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/128/color/${m.symbol.toLowerCase()}.png`;
  const fallback = `https://ui-avatars.com/api/?name=${m.symbol}&background=d97706&color=fff&size=32`;
  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 hover:bg-yellow-500/5 transition-colors cursor-pointer gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-slate-600 text-xs w-4 flex-shrink-0">
          {m.rank}
        </span>
        <img
          src={iconUrl}
          alt={m.symbol}
          className="w-8 h-8 rounded-full flex-shrink-0"
          onError={(e) => {
            e.target.src = fallback;
          }}
        />
        <div className="min-w-0">
          <div className="text-white text-sm font-semibold truncate">
            {m.symbol}
          </div>
          <div className="text-slate-500 text-xs truncate">{m.name}</div>
        </div>
      </div>
      <div className="flex-shrink-0">
        <Sparkline data={m.sparkline} up={m.up} />
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-mono text-sm font-semibold text-white">
          {formatPrice(m.price)}
        </div>
        <span
          className="inline-flex items-center gap-0.5 text-xs font-semibold font-mono"
          style={{ color: m.up ? "#34d399" : "#f87171" }}
        >
          {m.up ? "▲" : "▼"} {Math.abs(m.change).toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div
      className="hidden md:grid items-center gap-3 px-6 py-4 border-b border-white/5"
      style={{ gridTemplateColumns: "32px 1fr 90px 120px 120px 90px" }}
    >
      {[32, "100%", 80, 90, 80, 60].map((w, i) => (
        <div
          key={i}
          style={{
            height: 14,
            width: w,
            borderRadius: 6,
            background: "rgba(255,255,255,0.06)",
            animation: "skPulse 1.4s ease-in-out infinite",
            marginLeft: i > 1 ? "auto" : 0,
          }}
        />
      ))}
    </div>
  );
}

export default function LiveMarkets() {
  const [markets, setMarkets] = useState([]);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const prevPricesRef = useRef({});

  // Build market rows from API price data
  const buildMarkets = (priceData) => {
    return Object.entries(COIN_META)
      .map(([cgId, meta]) => {
        const info = priceData[cgId];
        if (!info?.usd) return null;
        const price = info.usd;
        const change = info.usd_24h_change || 0;
        const prevPrice = prevPricesRef.current[cgId] ?? null;
        prevPricesRef.current[cgId] = price;
        return {
          cgId,
          rank: meta.rank,
          name: meta.name,
          symbol: meta.symbol,
          vol: meta.vol,
          price,
          change,
          up: change >= 0,
          prevPrice,
          sparkline: prevPrice
            ? [price] // sparkline updated separately
            : generateSparkline(price),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.rank - b.rank);
  };

  // Fetch live prices from your backend
  const fetchPrices = async (isRefresh = false) => {
    try {
      const res = await api.get("/markets/prices"); 
      const data = res.data?.data; 

      if (!data) return; 

      setMarkets((prev) => {
        const updated = buildMarkets(data);
        if (isRefresh && prev.length > 0) {
          const prevMap = {};
          prev.forEach((m) => {
            prevMap[m.cgId] = m;
          });
          return updated.map((m) => {
            const existing = prevMap[m.cgId];
            if (!existing) return m;
            const newSparkline = [...existing.sparkline.slice(1), m.price];
            return { ...m, sparkline: newSparkline, prevPrice: existing.price };
          });
        }
        return updated;
      });
    } catch (err) {
      console.error("[LiveMarkets] fetch failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPrices(false);
  }, []);

  // Refresh prices every 30s from backend (matches your cache TTL)
  useEffect(() => {
    const t = setInterval(() => fetchPrices(true), 30_000);
    return () => clearInterval(t);
  }, []);

  // Simulate micro price movements between real refreshes (visual only)
  useEffect(() => {
    if (markets.length === 0) return;
    const t = setInterval(() => {
      setMarkets((prev) =>
        prev.map((m) => {
          const delta = (Math.random() - 0.48) * m.price * 0.0008;
          const newPrice = Math.max(m.price + delta, 0.0001);
          const newSparkline = [...m.sparkline.slice(1), newPrice];
          return {
            ...m,
            prevPrice: m.price,
            price: newPrice,
            sparkline: newSparkline,
          };
        }),
      );
    }, 2000);
    return () => clearInterval(t);
  }, [markets.length]);

  return (
    <section id="markets" className="py-20 lg:py-28 fade-section">
      <style>{`@keyframes skPulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-yellow-500 text-xs font-semibold mb-2 uppercase tracking-widest">
              {t("market_watch")}
            </p>
            <h2
              className="font-display font-bold text-white"
              style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)" }}
            >
              {t("live_markets")}<span className="gold-text">{t("markets")}</span>
            </h2>
          </div>
          <a
            href="/login"
            className="flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
          >
            {t("view_all")} <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="card rounded-3xl overflow-hidden">
          {/* Desktop header */}
          <div
            className="hidden md:grid gap-3 px-6 py-4 border-b border-white/5 text-slate-500 text-xs font-semibold uppercase tracking-wider"
            style={{ gridTemplateColumns: "32px 1fr 90px 120px 120px 90px" }}
          >
            <div>#</div>
            <div>{t("asset")}</div>
            <div className="text-center">{t("seven_day_chart")}</div>
            <div className="text-right">{t("price")}</div>
            <div className="text-right">{t("twenty_four_hour_change")}</div>
            <div className="text-right">{t("volume")}</div>
          </div>

          {/* Mobile header */}
          <div className="md:hidden grid grid-cols-3 px-4 py-3 border-b border-white/5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <div>{t("asset")}</div>
            <div className="text-center">{t("chart")}</div>
            <div className="text-right">{t("price_change")}</div>
          </div>

          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            : markets.map((m) => (
                <React.Fragment key={m.cgId}>
                  <DesktopRow m={m} />
                  <MobileRow m={m} />
                </React.Fragment>
              ))}
        </div>
      </div>
    </section>
  );
}
