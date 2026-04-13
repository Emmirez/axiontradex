import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { txColor, txIcon, statusColor } from "./DashboardHelpers";
import DashboardNav from "./DashboardNav";
import { useTranslation } from "react-i18next";
import BottomNav from "./BottomNav";
import api from "../../services/apiService";

const FILTERS = [
  "all",
  "deposit",
  "withdrawal",
  "trade",
  "bonus",
  "loss",
  "profit",
  "fee",
  "refund",
];

// Helper function to determine amount color based on transaction type
const getAmountColor = (type) => {
  // Green for gains
  if (
    type === "deposit" ||
    type === "profit" ||
    type === "bonus" ||
    type === "refund" ||
    type === "investment"
  ) {
    return "#34d399";
  }
  // Red for losses
  if (type === "withdrawal" || type === "fee" || type === "loss") {
    return "#f87171";
  }
  // Blue for trades (neutral)
  if (type === "trade") {
    return "#60a5fa";
  }
  // Default gray
  return "#94a3b8";
};

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
              width: 90,
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
              width: 60,
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
          width: 70,
          height: 14,
          borderRadius: 5,
          background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          animation: "skPulse 1.4s ease-in-out infinite",
        }}
      />
    </div>
  );
}

export default function TransactionsPage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
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
  
    const getFilterLabel = (filterKey) => {
    const filterMap = {
      all: t("all"),
      deposit: t("deposit"),
      withdrawal: t("withdraw"),
      trade: t("trade"),
      bonus: t("bonus"),
      loss: t("loss"),
      profit: t("profit"),
      fee: t("fee"),
      refund: t("refund"),
    };
    return filterMap[filterKey] || filterKey;
  };

   const getTxTypeLabel = (type) => {
    const typeMap = {
      deposit: t("deposit"),
      withdrawal: t("withdraw"),
      trade: t("trade"),
      bonus: t("bonus"),
      loss: t("loss"),
      profit: t("profit"),
      fee: t("fee"),
      refund: t("refund"),
      investment: t("investment"),
      referral: t("referral"),
    };
    return typeMap[type] || type;
  };

 const getStatusLabel = (status) => {
    const statusMap = {
      completed: t("completed"),
      pending: t("pending"),
      failed: t("failed"),
      cancelled: t("cancelled"),
    };
    return statusMap[status] || status;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filter !== "all") params.set("type", filter);
      const res = await api.get(`/users/transactions?${params}`);
      setTransactions(res.data?.data || []);
      setPages(res.data?.pagination?.pages || 1);
      setTotal(res.data?.pagination?.total || 0);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    load();
  }, [load]);

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
            <ArrowLeft style={{ width: 14, height: 14 }} /> {t("back")}
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
               {t("transactions")}
            </h1>
            {total > 0 && (
              <div style={{ color: muted, fontSize: "0.78rem", marginTop: 4 }}>
                {t("total_transactions", { count: total })}
              </div>
            )}
          </div>
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
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 16,
            flexWrap: "wrap",
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
          ) : transactions.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: muted,
                fontSize: "0.85rem",
              }}
            >
              {t("no_transactions_found")}
            </div>
          ) : (
            transactions.map((txn, i) => {
              const Icon = txIcon(txn.type);
              const iconColor = txColor(txn.type);
              const amountColor = getAmountColor(txn.type);
              const isDebit =
                txn.type === "withdrawal" ||
                txn.type === "fee" ||
                txn.type === "loss";

              return (
                <div
                  key={txn._id}
                  style={{
                    padding: "14px 20px",
                    borderBottom:
                      i < transactions.length - 1
                        ? `1px solid ${divLine}`
                        : "none",
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
                        background: `${iconColor}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        style={{ width: 15, height: 15, color: iconColor }}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          color: textClr,
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          textTransform: "capitalize",
                        }}
                      >
                        {getTxTypeLabel(txn.type)}
                      </div>
                      <div style={{ color: muted, fontSize: "0.7rem" }}>
                        {new Date(txn.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {txn.note && (
                          <span style={{ marginLeft: 6, opacity: 0.7 }}>
                            · {txn.note.slice(0, 30)}
                            {txn.note.length > 30 ? "…" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        color: amountColor,
                        fontFamily: "monospace",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      {isDebit ? "-" : "+"}
                      {txn.amount?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}{" "}
                      {txn.currency || "USD"}
                    </div>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: `${statusColor(txn.status)}18`,
                        color: statusColor(txn.status),
                      }}
                    >
                      {getStatusLabel(txn.status)}
                    </span>
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
              {t("next_tx")}
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
