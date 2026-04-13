import React, { useState, useEffect } from "react";
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

// Crypto assets that need price conversion
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState({}); // { BTC: 84000, ETH: 1800, ... }
  const [priceLoading, setPriceLoading] = useState(true);

  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";

  // Fetch dashboard stats
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/users/dashboard");
        setStats(res.data?.data || res.data || null);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Fetch crypto prices
  useEffect(() => {
    const fetchPrices = async () => {
      setPriceLoading(true);
      try {
        const res = await api.get("/markets/prices");
        const data = res.data?.data || res.data;

        const p = {};
        CRYPTO_ASSETS.forEach((a) => {
          if (data[a.coingecko]) {
            p[a.key] = data[a.coingecko].usd;
          }
        });
        setPrices(p);
      } catch {
        // silently fail — totalBalance will show stablecoins only if prices unavailable
      } finally {
        setPriceLoading(false);
      }
    };
    fetchPrices();
  }, []);

  // Total portfolio in USD — stablecoins + crypto converted at market price
  const totalBalance = (() => {
    const b = user?.wallet?.balances;
    if (!b) return 0;

    // Stablecoins (1:1 with USD)
    const stables = (b.USD || 0) + (b.USDT || 0);

    // Crypto converted to USD using live prices
    const cryptoUSD = CRYPTO_ASSETS.reduce((sum, a) => {
      const amount = b[a.key] || 0;
      const price = prices[a.key] || 0; // 0 if price not loaded yet
      return sum + amount * price;
    }, 0);

    return stables + cryptoUSD;
  })();

  const locked = user?.wallet?.locked || 0;
  const totalPnl = stats?.totalPnl ?? 0;
  const winRate = stats?.winRate ?? 0;
  const totalTrades = stats?.totalTrades ?? 0;
  const openTrades = stats?.openPositions ?? stats?.openTrades ?? 0;
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
      value: `${isPnlUp ? "+" : ""}$${Math.abs(totalPnl).toFixed(2)}`,
      color: isPnlUp ? "#34d399" : "#f87171",
      icon: TrendingUp,
    },
    {
      labelKey: "win_rate",
      value: loading ? "—" : `${winRate}%`,
      color: "#60a5fa",
      icon: BarChart3,
      isLoading: loading,
    },
    {
      labelKey: "total_trades",
      value: loading ? "—" : totalTrades,
      color: "#a78bfa",
      icon: Activity,
      isLoading: loading,
    },
    {
      labelKey: "open_positions",
      value: loading ? "—" : openTrades,
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
