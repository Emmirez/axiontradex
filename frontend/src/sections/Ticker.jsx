import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../services/apiService";

// Map coin symbols to CoinGecko IDs (matching TradePage mapping)
const COIN_CONFIG = [
  { symbol: "BTC", coinId: "bitcoin" },
  { symbol: "ETH", coinId: "ethereum" },
  { symbol: "SOL", coinId: "solana" },
  { symbol: "BNB", coinId: "binancecoin" },
  { symbol: "XRP", coinId: "ripple" },
  { symbol: "ADA", coinId: "cardano" },
  { symbol: "DOT", coinId: "polkadot" },
  { symbol: "DOGE", coinId: "dogecoin" },
  { symbol: "AVAX", coinId: "avalanche-2" },
  { symbol: "LINK", coinId: "chainlink" },
];

function formatPrice(price) {
  if (price == null) return "—";
  if (price >= 1000)
    return (
      "$" +
      price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  if (price >= 1) return "$" + price.toFixed(3);
  return "$" + price.toFixed(4);
}

function TickerItem({ coin }) {
  const iconUrl = `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/128/color/${coin.symbol.toLowerCase()}.png`;
  const isUp = (coin.change ?? 0) >= 0;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        margin: "0 20px",
        flexShrink: 0,
      }}
    >
      <img
        src={iconUrl}
        alt={coin.symbol}
        style={{ width: 20, height: 20, borderRadius: "50%" }}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
      <span className="ticker-symbol">{coin.symbol}</span>
      <span
        className="ticker-price"
        style={{
          transition: "color 0.3s",
          color:
            coin.flash === "up"
              ? "#34d399"
              : coin.flash === "down"
                ? "#f87171"
                : undefined,
        }}
      >
        {coin.price != null ? formatPrice(coin.price) : "—"}
      </span>
      <span
        style={{
          color: isUp ? "#34d399" : "#f87171",
          fontFamily: "monospace",
          fontSize: "0.75rem",
          fontWeight: 600,
        }}
      >
        {isUp ? "▲" : "▼"} {isUp ? "+" : ""}
        {(coin.change ?? 0).toFixed(2)}%
      </span>
      <span className="ticker-divider">│</span>
    </span>
  );
}

export default function Ticker() {
  const [coins, setCoins] = useState(() =>
    COIN_CONFIG.map((c) => ({ ...c, price: null, change: 0 })),
  );
  const prevPrices = useRef({});

  // Replace the fetchPrices function:
  const fetchPrices = useCallback(async () => {
    try {
      const res = await api.get("/markets/prices"); 
      const prices = res.data?.data || res.data;

      setCoins((prev) =>
        prev.map((coin) => {
          const data = prices[coin.coinId];
          if (!data?.usd) return coin;

          const newPrice = data.usd;
          const oldPrice = prevPrices.current[coin.symbol];
          let flash = null;
          if (oldPrice != null) {
            if (newPrice > oldPrice) flash = "up";
            else if (newPrice < oldPrice) flash = "down";
          }
          prevPrices.current[coin.symbol] = newPrice;

          return {
            ...coin,
            price: newPrice,
            change: data.usd_24h_change ?? 0,
            flash,
          };
        }),
      );

      setTimeout(() => {
        setCoins((prev) => prev.map((c) => ({ ...c, flash: null })));
      }, 600);
    } catch (err) {
      console.error("[Ticker] price fetch failed:", err.message);
    }
  }, []);

  // Initial fetch + poll every 30s (matching TradePage cadence)
  useEffect(() => {
    fetchPrices();
    const iv = setInterval(fetchPrices, 30_000);
    return () => clearInterval(iv);
  }, [fetchPrices]);

  // Triplicate items for seamless infinite scroll
  const items = [...coins, ...coins, ...coins];

  return (
    <div
      className="ticker-bg"
      style={{
        position: "relative",
        borderTop: "1px solid rgba(245,158,11,0.2)",
        borderBottom: "1px solid rgba(245,158,11,0.2)",
        marginTop: "64px",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes tickerMove {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .ticker-track {
          display: inline-flex;
          white-space: nowrap;
          animation: tickerMove 35s linear infinite;
          will-change: transform;
        }
        .ticker-track:hover { animation-play-state: paused; }

        .ticker-symbol {
          font-family: monospace;
          font-size: 0.875rem;
          font-weight: 600;
          color: #f1f5f9;
        }
        .ticker-price {
          font-family: monospace;
          font-size: 0.875rem;
          color: #cbd5e1;
        }
        .ticker-divider {
          color: #334155;
          margin: 0 4px;
        }

        html:not(.dark) .ticker-symbol  { color: #0f172a; }
        html:not(.dark) .ticker-price   { color: #475569; }
        html:not(.dark) .ticker-divider { color: #cbd5e1; }
      `}</style>

      <div style={{ padding: "10px 0" }}>
        <div className="ticker-track">
          {items.map((c, i) => (
            <TickerItem key={`${c.symbol}-${i}`} coin={c} />
          ))}
        </div>
      </div>

      {/* Left fade */}
      <div
        className="ticker-fade-left"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 80,
          pointerEvents: "none",
        }}
      />
      {/* Right fade */}
      <div
        className="ticker-fade-right"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 80,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
