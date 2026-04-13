import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { statusColor } from "./DashboardHelpers";
import api from "../../services/apiService";
import { useTranslation } from "react-i18next";

export default function RecentTrades() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/trades/all-history?limit=6");
        setTrades(res.data?.data?.trades || []);
      } catch {
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const Skel = () => (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: `1px solid ${divLine}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: darkMode
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.06)",
            animation: "skPulse 1.4s ease-in-out infinite",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div
            style={{
              width: 70,
              height: 11,
              borderRadius: 5,
              background: darkMode
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.06)",
              animation: "skPulse 1.4s ease-in-out infinite",
            }}
          />
          <div
            style={{
              width: 50,
              height: 9,
              borderRadius: 5,
              background: darkMode
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.06)",
              animation: "skPulse 1.4s ease-in-out infinite",
            }}
          />
        </div>
      </div>
      <div
        style={{
          width: 60,
          height: 14,
          borderRadius: 5,
          background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          animation: "skPulse 1.4s ease-in-out infinite",
        }}
      />
    </div>
  );

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${border}`,
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <style>{`@keyframes skPulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Header */}
      <div
        style={{
          padding: "18px 20px",
          borderBottom: `1px solid ${divLine}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            color: textClr,
            fontWeight: 700,
            fontSize: "0.95rem",
            margin: 0,
          }}
        >
          {t("recent_trades")}
        </h3>
        <Link
          to="/trades"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            color: "#f59e0b",
            fontSize: "0.78rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          {t("view_all")} <ChevronRight style={{ width: 13, height: 13 }} />
        </Link>
      </div>

      {/* Rows */}
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => <Skel key={i} />)
      ) : trades.length === 0 ? (
        <div
          style={{
            padding: "30px",
            textAlign: "center",
            color: mutedClr,
            fontSize: "0.82rem",
          }}
        >
          {t("no_trades_yet_trade")}{" "}
          <Link
            to="/trade"
            style={{
              color: "#f59e0b",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {t("start_trading")}
          </Link>
        </div>
      ) : (
        trades.map((trade, i) => {
          const pnl = trade.profit ?? trade.pnl ?? 0;
          const side = trade.side || "buy";
          const isUp = side === "buy";
          const isCopy = trade.source === "copy";
          const hasPnl = pnl !== 0;

          return (
            <div
              key={trade._id}
              style={{
                padding: "14px 20px",
                borderBottom:
                  i < trades.length - 1 ? `1px solid ${divLine}` : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: isUp
                      ? "rgba(52,211,153,0.12)"
                      : "rgba(239,68,68,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isUp ? (
                    <TrendingUp
                      style={{ width: 14, height: 14, color: "#34d399" }}
                    />
                  ) : (
                    <TrendingDown
                      style={{ width: 14, height: 14, color: "#f87171" }}
                    />
                  )}
                </div>
                <div>
                  <div
                    style={{
                      color: textClr,
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      fontFamily: "monospace",
                    }}
                  >
                    {trade.symbol}
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: "0.7rem",
                        fontFamily: "inherit",
                        fontWeight: 600,
                        color: isUp ? "#34d399" : "#f87171",
                        textTransform: "uppercase",
                      }}
                    >
                      {side === "buy" ? t("buy") : t("sell")}
                    </span>
                  </div>
                  <div
                    style={{
                      color: mutedClr,
                      fontSize: "0.7rem",
                      marginTop: 1,
                    }}
                  >
                    {isCopy && trade.traderName ? (
                      <span style={{ color: "#a78bfa" }}>
                        via {trade.traderName}
                      </span>
                    ) : (
                      `${trade.quantity} units`
                    )}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    color: hasPnl
                      ? pnl >= 0
                        ? "#34d399"
                        : "#f87171"
                      : mutedClr,
                    fontFamily: "monospace",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  {hasPnl
                    ? `${pnl > 0 ? "+" : ""}$${pnl.toFixed(2)}`
                    : trade.amountInvested
                      ? `$${trade.amountInvested.toFixed(2)}`
                      : "—"}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    justifyContent: "flex-end",
                    marginTop: 3,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.65rem",
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: `${statusColor(trade.status)}18`,
                      color: statusColor(trade.status),
                    }}
                  >
                    {trade.status === "open"
                      ? t("open")
                      : trade.status === "closed"
                        ? t("closed")
                        : trade.status === "filled"
                          ? t("filled")
                          : trade.status}
                  </span>
                  {isCopy && (
                    <span
                      style={{
                        fontSize: "0.65rem",
                        padding: "2px 6px",
                        borderRadius: 6,
                        background: "rgba(167,139,250,0.12)",
                        color: "#a78bfa",
                      }}
                    >
                      {t("copy")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
