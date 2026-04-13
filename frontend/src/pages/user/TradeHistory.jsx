import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { statusColor } from "./DashboardHelpers";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import api from "../../services/apiService";
import { useTranslation } from "react-i18next";

const FILTERS = ["all", "manual", "copy", "filled", "cancelled"];

function Skel({ darkMode, divLine }) {
  return (
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
            width: 36,
            height: 36,
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
              width: 80,
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
              width: 55,
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
          width: 65,
          height: 14,
          borderRadius: 5,
          background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          animation: "skPulse 1.4s ease-in-out infinite",
        }}
      />
    </div>
  );
}

export default function TradesPage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filter === "manual" || filter === "copy") {
        params.set("type", filter);
      } else if (filter !== "all") {
        params.set("status", filter);
      }
      const res = await api.get(`/trades/all-history?${params}`);
      setTrades(res.data?.data?.trades || []);
      setPages(res.data?.data?.pagination?.pages || 1);
      setTotal(res.data?.data?.pagination?.total || 0);
    } catch {
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const getFilterLabel = (filterKey) => {
    const filterMap = {
      all: t("all"),
      manual: t("manual_trade"),
      copy: t("copy"),
      filled: t("filled"),
      cancelled: t("cancelled_trade"),
    };
    return filterMap[filterKey] || filterKey;
  };

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <style>{`@keyframes skPulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <DashboardNav />

      <div
        style={{ maxWidth: 640, margin: "0 auto", padding: "80px 16px 120px" }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: "none",
              color: muted,
              cursor: "pointer",
              fontSize: "0.82rem",
            }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />  {t("back")}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: '"Playfair Display",serif',
                fontWeight: 800,
                fontSize: "clamp(1.4rem,4vw,1.8rem)",
                color: textClr,
                margin: 0,
              }}
            >
              {t("trade_history_trade")}
            </h1>
            {total > 0 && (
              <div style={{ color: muted, fontSize: "0.78rem", marginTop: 4 }}>
                {t("total_trades_trade", { count: total })}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={load}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 14px",
                borderRadius: 10,
                border: `1px solid ${border}`,
                background: "transparent",
                color: muted,
                fontSize: "0.78rem",
                cursor: "pointer",
              }}
            >
              <RefreshCw style={{ width: 12, height: 12 }} /> {t("refresh")}
            </button>
            <Link
              to="/trade"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 14px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg,#d97706,#f59e0b)",
                color: "#020617",
                fontSize: "0.78rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {t("new_trade_trade")}
            </Link>
          </div>
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 16,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: 8,
                border: `1px solid ${filter === f ? "#f59e0b" : border}`,
                background:
                  filter === f ? "rgba(245,158,11,0.1)" : "transparent",
                color: filter === f ? "#f59e0b" : muted,
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.15s",
              }}
            >
              {getFilterLabel(f)}
            </button>
          ))}
        </div>

        {/* List */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skel key={i} darkMode={darkMode} divLine={divLine} />
            ))
          ) : trades.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: muted,
                fontSize: "0.85rem",
              }}
            >
              {t("no_trades_found_trade")}{" "}
              <Link
                to="/trade"
                style={{
                  color: "#f59e0b",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {t("start_trading_trade")}
              </Link>
            </div>
          ) : (
            trades.map((trade, i) => {
              const pnl = trade.profit ?? trade.pnl ?? 0;
              const side = trade.side || "buy";
              const isUp = side === "buy";
              const hasPnl =
                trade.status === "closed" ||
                (trade.status === "filled" && pnl !== 0);
              const isCopy = trade.source === "copy";

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
                    gap: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: isUp
                          ? "rgba(52,211,153,0.12)"
                          : "rgba(239,68,68,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {isUp ? (
                        <TrendingUp
                          style={{ width: 15, height: 15, color: "#34d399" }}
                        />
                      ) : (
                        <TrendingDown
                          style={{ width: 15, height: 15, color: "#f87171" }}
                        />
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          color: textClr,
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          fontFamily: "monospace",
                        }}
                      >
                        {trade.symbol}
                        <span
                          style={{
                            marginLeft: 7,
                            fontSize: "0.72rem",
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
                          color: muted,
                          fontSize: "0.7rem",
                          marginTop: 1,
                        }}
                      >
                        {trade.quantity} @ $
                        {(
                          trade.entryPrice || trade.filledPrice
                        )?.toLocaleString("en-US", {
                          maximumFractionDigits: 4,
                        }) || "—"}
                        {trade.traderName && (
                          <span style={{ marginLeft: 6, color: "#a78bfa" }}>
                            · {trade.traderName}
                          </span>
                        )}
                        <span style={{ marginLeft: 8 }}>
                          {new Date(trade.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        color: hasPnl
                          ? pnl >= 0
                            ? "#34d399"
                            : "#f87171"
                          : muted,
                        fontFamily: "monospace",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      {hasPnl
                        ? `${pnl > 0 ? "+" : ""}$${pnl.toFixed(2)}`
                        : trade.amountInvested
                          ? `$${trade.amountInvested.toFixed(2)}`
                          : `$${(trade.total || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
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
                              : trade.status === "cancelled"
                                ? t("cancelled")
                                : trade.status}
                      </span>
                      {isCopy && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            padding: "2px 8px",
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

        {/* Pagination */}
        {pages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: "transparent",
                color: page === 1 ? muted : textClr,
                cursor: page === 1 ? "default" : "pointer",
                fontSize: "0.78rem",
                opacity: page === 1 ? 0.4 : 1,
              }}
            >
              {t("prev")}
            </button>
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 8,
                    border: `1px solid ${page === p ? "#f59e0b" : border}`,
                    background:
                      page === p ? "rgba(245,158,11,0.12)" : "transparent",
                    color: page === p ? "#f59e0b" : muted,
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    fontWeight: page === p ? 700 : 400,
                  }}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: "transparent",
                color: page === pages ? muted : textClr,
                cursor: page === pages ? "default" : "pointer",
                fontSize: "0.78rem",
                opacity: page === pages ? 0.4 : 1,
              }}
            >
              {t("next_trade")}
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
