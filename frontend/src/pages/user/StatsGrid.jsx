import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Shield,
  TrendingUp,
  BarChart3,
  Activity,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/apiService";
import { useTranslation } from "react-i18next";

const CRYPTO_ASSETS = [
  { key: "BTC", coingecko: "bitcoin" },
  { key: "ETH", coingecko: "ethereum" },
  { key: "SOL", coingecko: "solana" },
  { key: "BNB", coingecko: "binancecoin" },
];

export default function StatsGrid() {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState({});
  const [priceLoading, setPriceLoading] = useState(true);

  const [tradeStats, setTradeStats] = useState({
    totalPnl: 0,
    winRate: 0,
    totalTrades: 0,
    openTrades: 0,
  });

  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";

  const loadTrades = useCallback(async () => {
    try {
      const res = await api.get("/trades/all-history?limit=500");
      const trades = res.data?.data?.trades || [];

      let totalPnl = 0;
      let winningTrades = 0;
      let openTrades = 0;

      trades.forEach((trade) => {
        const pnl = trade.profit ?? trade.pnl ?? 0;
        totalPnl += pnl;
        if (pnl > 0) winningTrades++;
        if (trade.status === "open" || trade.status === "filled") openTrades++;
      });

      const totalTrades = trades.length;
      const winRate =
        totalTrades > 0
          ? parseFloat(((winningTrades / totalTrades) * 100).toFixed(1))
          : 0;

      setTradeStats({ totalPnl, winRate, totalTrades, openTrades });
    } catch {
      // keep previous values on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch crypto prices
  const loadPrices = useCallback(async () => {
    setPriceLoading(true);
    try {
      const res = await api.get("/markets/prices");
      const data = res.data?.data || res.data;
      const p = {};
      CRYPTO_ASSETS.forEach((a) => {
        if (data[a.coingecko]) p[a.key] = data[a.coingecko].usd;
      });
      setPrices(p);
    } catch {
      // silently fail
    } finally {
      setPriceLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrades();
    loadPrices();

    const tradeInterval = setInterval(loadTrades, 30_000);
    const priceInterval = setInterval(loadPrices, 60_000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadTrades();
        loadPrices();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(tradeInterval);
      clearInterval(priceInterval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loadTrades, loadPrices]);

  // Total portfolio balance
  const totalBalance = (() => {
    const b = user?.wallet?.balances;
    if (!b) return 0;
    const stables = (b.USD || 0) + (b.USDT || 0);
    const cryptoUSD = CRYPTO_ASSETS.reduce((sum, a) => {
      return sum + (b[a.key] || 0) * (prices[a.key] || 0);
    }, 0);
    return stables + cryptoUSD;
  })();

  const locked = user?.wallet?.locked || 0;
  const { totalPnl, winRate, totalTrades, openTrades } = tradeStats;
  const isPnlUp = totalPnl >= 0;

  const balanceLoading =
    priceLoading &&
    CRYPTO_ASSETS.some((a) => (user?.wallet?.balances?.[a.key] || 0) > 0);

  const items = [
    {
      labelKey: "total_balance",
      value: balanceLoading
        ? "—"
        : `$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: "#f59e0b",
      icon: Wallet,
      isLoading: balanceLoading,
    },
    {
      labelKey: "locked_funds",
      value: `$${locked.toFixed(2)}`,
      color: "#94a3b8",
      icon: Shield,
    },
    {
      labelKey: "total_pnl",
      value: `${totalPnl >= 0 ? "+" : "-"}$${Math.abs(totalPnl).toFixed(2)}`,
      color: isPnlUp ? "#34d399" : "#f87171",
      icon: TrendingUp,
      isLoading: loading,
    },
    {
      labelKey: "win_rate",
      value: `${winRate}%`,
      color: "#60a5fa",
      icon: BarChart3,
      isLoading: loading,
    },
    {
      labelKey: "total_trades",
      value: totalTrades,
      color: "#a78bfa",
      icon: Activity,
      isLoading: loading,
    },
    {
      labelKey: "open_positions",
      value: openTrades,
      color: "#f87171",
      icon: RefreshCw,
      isLoading: loading,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        marginBottom: 28,
      }}
    >
      {items.map((s) => (
        <div
          key={s.labelKey}
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 18,
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: `${s.color}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <s.icon style={{ width: 18, height: 18, color: s.color }} />
          </div>
          <div>
            {s.isLoading ? (
              <div
                style={{
                  width: 80,
                  height: 22,
                  borderRadius: 6,
                  background: darkMode
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(0,0,0,0.07)",
                  animation: "skPulse 1.4s ease-in-out infinite",
                  marginBottom: 4,
                }}
              />
            ) : (
              <div
                style={{
                  fontFamily: '"Playfair Display",serif',
                  fontWeight: 700,
                  fontSize: "1.3rem",
                  color: s.color,
                }}
              >
                {s.value}
              </div>
            )}
            <div style={{ color: mutedClr, fontSize: "0.75rem", marginTop: 1 }}>
              {t(s.labelKey)}
            </div>
          </div>
        </div>
      ))}
      <style>{`@keyframes skPulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
