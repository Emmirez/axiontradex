import React, { useState, useEffect } from "react";
import {
  Users,
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Shield,
  TrendingUp,
  User,
} from "lucide-react";
import api from "../../services/apiService";
import { fmtUSD, fmtDate, Badge, Skel } from "./AdminShared";

// Real crypto logo URLs from CoinGecko CDN
const CRYPTO_LOGOS = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  BNB: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  USDT: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  USD: null, // fallback to $ icon
};

const CURRENCY_COLORS = {
  USD: "#60a5fa",
  USDT: "#34d399",
  BTC: "#f59e0b",
  ETH: "#8b5cf6",
  SOL: "#14b8a6",
  BNB: "#eab308",
};

function CurrencyIcon({ currency, size = 20 }) {
  const logoUrl = CRYPTO_LOGOS[currency];
  const color = CURRENCY_COLORS[currency] || "#f59e0b";

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={currency}
        width={size}
        height={size}
        style={{ borderRadius: "50%", objectFit: "cover", display: "block" }}
        onError={(e) => {
          // Fallback to text if image fails
          e.target.style.display = "none";
          e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
        }}
      />
    );
  }

  // USD fallback
  return (
    <span
      style={{
        fontSize: size * 0.75,
        fontWeight: "bold",
        color,
        lineHeight: 1,
      }}
    >
      $
    </span>
  );
}

const formatAmount = (currency, amount) => {
  if (!amount && amount !== 0) return "0";
  if (["BTC", "ETH", "SOL", "BNB"].includes(currency)) {
    return amount.toFixed(6);
  }
  return amount.toFixed(2);
};

export default function SectionOverview({
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  divLine,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((res) => setData(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};

  const CARDS = [
    {
      label: "Total Users",
      value: loading ? "—" : stats.totalUsers,
      color: "#f59e0b",
      icon: Users,
    },
    {
      label: "Active Users",
      value: loading ? "—" : stats.activeUsers,
      color: "#34d399",
      icon: Activity,
    },
    {
      label: "Total Deposits",
      value: loading ? "—" : fmtUSD(stats.totalDeposits),
      color: "#60a5fa",
      icon: ArrowDownCircle,
    },
    {
      label: "Total Withdrawals",
      value: loading ? "—" : fmtUSD(stats.totalWithdrawals),
      color: "#f87171",
      icon: ArrowUpCircle,
    },
    {
      label: "Total Trades",
      value: loading ? "—" : stats.totalTrades,
      color: "#a78bfa",
      icon: BarChart3,
    },
    {
      label: "Pending KYC",
      value: loading ? "—" : stats.pendingKYC,
      color: "#f59e0b",
      icon: Shield,
    },
    {
      label: "New Users (30d)",
      value: loading ? "—" : stats.newUsers30d,
      color: "#34d399",
      icon: TrendingUp,
    },
  ];

  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      {/* Stats Cards Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {CARDS.map((c) => (
          <div
            key={c.label}
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 16,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: `${c.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <c.icon style={{ width: 16, height: 16, color: c.color }} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: '"Playfair Display",serif',
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  color: c.color,
                }}
              >
                {c.value}
              </div>
              <div style={{ color: muted, fontSize: "0.7rem" }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Balances by Currency Section */}
      {!loading &&
        stats.balancesByCurrency &&
        Object.values(stats.balancesByCurrency).some((v) => v > 0) && (
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 18,
              marginBottom: 20,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${divLine}`,
              }}
            >
              <div
                style={{ color: textClr, fontWeight: 700, fontSize: "0.9rem" }}
              >
                Currency Balance Overview
              </div>
              <div style={{ color: muted, fontSize: "0.7rem", marginTop: 4 }}>
                Total Value:{" "}
                <span style={{ color: "#f59e0b", fontWeight: 600 }}>
                  ${stats.totalPlatformValueUSD?.toLocaleString() || "0"}
                </span>
              </div>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                }}
              >
                {Object.entries(stats.balancesByCurrency).map(
                  ([currency, amount]) => {
                    if (amount === 0) return null;
                    const currencyColor =
                      CURRENCY_COLORS[currency] || "#f59e0b";

                    const usdValue =
                      currency === "USD" || currency === "USDT"
                        ? amount
                        : currency === "BTC" && stats.currentPrices?.BTC
                          ? amount * stats.currentPrices.BTC
                          : currency === "ETH" && stats.currentPrices?.ETH
                            ? amount * stats.currentPrices.ETH
                            : currency === "SOL" && stats.currentPrices?.SOL
                              ? amount * stats.currentPrices.SOL
                              : currency === "BNB" && stats.currentPrices?.BNB
                                ? amount * stats.currentPrices.BNB
                                : 0;

                    return (
                      <div
                        key={currency}
                        style={{
                          background: darkMode
                            ? "rgba(255,255,255,0.03)"
                            : "rgba(0,0,0,0.02)",
                          borderRadius: 12,
                          padding: "12px",
                          border: `1px solid ${border}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: `${currencyColor}15`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              overflow: "hidden",
                            }}
                          >
                            <CurrencyIcon currency={currency} size={22} />
                          </div>
                          <div>
                            <div
                              style={{
                                color: textClr,
                                fontWeight: 600,
                                fontSize: "0.85rem",
                              }}
                            >
                              {currency}
                            </div>
                            {stats.currentPrices?.[currency] && (
                              <div
                                style={{ color: muted, fontSize: "0.65rem" }}
                              >
                                $
                                {stats.currentPrices[currency].toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          style={{
                            color: currencyColor,
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            marginBottom: 4,
                          }}
                        >
                          {formatAmount(currency, amount)}
                        </div>
                        {usdValue > 0 && (
                          <div style={{ color: muted, fontSize: "0.7rem" }}>
                            ≈ $
                            {usdValue.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        )}

      {/* Recent Users Section — mobile-safe */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        <div
          style={{ padding: "16px 20px", borderBottom: `1px solid ${divLine}` }}
        >
          <div style={{ color: textClr, fontWeight: 700, fontSize: "0.9rem" }}>
            Recent Users
          </div>
        </div>

        {loading ? (
          <div
            style={{
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Skel key={i} h={16} dark={darkMode} />
            ))}
          </div>
        ) : (
          (data?.recentUsers || []).map((u, i, arr) => (
            <div
              key={u._id}
              className="adm-row"
              style={{
                display: "flex",
                flexDirection: "column", // stack on mobile
                gap: 6,
                padding: "12px 16px",
                borderBottom:
                  i < arr.length - 1 ? `1px solid ${divLine}` : "none",
              }}
            >
              {/* Top row: avatar + name/email */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(245,158,11,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <User style={{ width: 14, height: 14, color: "#f59e0b" }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      color: textClr,
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {u.firstName} {u.lastName}
                  </div>
                  <div
                    style={{
                      color: muted,
                      fontSize: "0.7rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {u.email}
                  </div>
                </div>
              </div>

              {/* Bottom row: balance + badge + date */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  paddingLeft: 42, // align under name (avatar width + gap)
                  flexWrap: "wrap",
                }}
              >
                {u.wallet?.totalUSD !== undefined && (
                  <div>
                    <span
                      style={{
                        color: "#f59e0b",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      $
                      {u.wallet.totalUSD.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span
                      style={{
                        color: muted,
                        fontSize: "0.65rem",
                        marginLeft: 3,
                      }}
                    >
                      Total
                    </span>
                  </div>
                )}
                <Badge status={u.status} />
                <span
                  style={{
                    color: muted,
                    fontSize: "0.68rem",
                    marginLeft: "auto",
                  }}
                >
                  {fmtDate(u.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
