import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { txIcon, txColor, statusColor } from "./DashboardHelpers";
import api from "../../services/apiService";

export default function RecentTransactions() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/users/transactions?limit=6");
        setTransactions(res.data?.data || []);
      } catch {
        setTransactions([]);
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

  // Helper to get translated transaction type
  const getTxTypeLabel = (type) => {
    const typeMap = {
      deposit: t("deposit"),
      withdrawal: t("withdraw"),
      bonus: t("bonus"),
      profit: t("profit"),
      loss: t("loss"),
      fee: t("fee"),
      trade: t("trade"),
      investment: t("investment"),
      referral: t("referral"),
      refund: t("refund"),
    };
    return typeMap[type] || type;
  };

  // Helper to get translated status
  const getStatusLabel = (status) => {
    const statusMap = {
      completed: t("completed"),
      pending: t("pending"),
      failed: t("failed"),
      cancelled: t("cancelled"),
    };
    return statusMap[status] || status;
  };

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
          {t("recent_transactions")}
        </h3>
        <Link
          to="/transactions"
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
      ) : transactions.length === 0 ? (
        <div
          style={{
            padding: "30px",
            textAlign: "center",
            color: mutedClr,
            fontSize: "0.82rem",
          }}
        >
          {t("no_transactions_yet")}
        </div>
      ) : (
        transactions.map((txn, i) => {
          const Icon = txIcon(txn.type);
          const color = txColor(txn.type);
          const isDebit = txn.type === "withdrawal";
          return (
            <div
              key={txn._id}
              style={{
                padding: "14px 20px",
                borderBottom:
                  i < transactions.length - 1 ? `1px solid ${divLine}` : "none",
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
                    background: `${color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon style={{ width: 14, height: 14, color }} />
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
                  <div style={{ color: mutedClr, fontSize: "0.7rem" }}>
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    color: isDebit ? "#f87171" : "#34d399",
                    fontFamily: "monospace",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  {isDebit ? "-" : "+"}
                  {txn.amount?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
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
  );
}
