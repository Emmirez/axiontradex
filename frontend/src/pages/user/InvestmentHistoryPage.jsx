// frontend/src/pages/user/InvestmentHistoryPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  Bitcoin,
  Building2,
  Wallet,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Loader,
  ChevronDown,
  X,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import api from "../../services/apiService";

const MARKET_CONFIG = {
  stocks: {
    nameKey: "stocks",
    icon: TrendingUp,
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
  },
  crypto: {
    nameKey: "crypto",
    icon: Bitcoin,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
  realestate: {
    nameKey: "real_estate",
    icon: Building2,
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
  },
};

const STATUS_CONFIG = {
  active: { labelKey: "active", color: "#34d399", icon: Clock },
  matured: { labelKey: "matured", color: "#60a5fa", icon: CheckCircle },
  cancelled: { labelKey: "cancelled", color: "#f87171", icon: XCircle },
};

// Custom Select Component
const CustomSelect = ({
  value,
  onChange,
  options,
  darkMode,
  border,
  textClr,
  muted,
  t,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={selectRef} style={{ position: "relative", minWidth: 130 }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "6px 12px",
          borderRadius: 12,
          border: `1px solid ${border}`,
          background: darkMode ? "#1e293b" : "#ffffff",
          color: textClr,
          fontSize: "0.8rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span>{selectedOption?.label || t("select")}</span>
        <ChevronDown
          style={{
            width: 14,
            height: 14,
            color: muted,
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: darkMode ? "#1e293b" : "#ffffff",
            border: `1px solid ${border}`,
            borderRadius: 12,
            overflow: "hidden",
            zIndex: 100,
            boxShadow: darkMode
              ? "0 4px 12px rgba(0,0,0,0.3)"
              : "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                color: textClr,
                fontSize: "0.8rem",
                background:
                  value === opt.value
                    ? darkMode
                      ? "#f59e0b20"
                      : "#f59e0b10"
                    : "transparent",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = darkMode
                  ? "#f59e0b30"
                  : "#f59e0b20";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  value === opt.value
                    ? darkMode
                      ? "#f59e0b20"
                      : "#f59e0b10"
                    : "transparent";
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Toast Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success" ? "#34d399" : type === "error" ? "#f87171" : "#f59e0b";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 100,
        left: "50%",
        transform: "translateX(-50%)",
        background: bgColor,
        color: "#fff",
        padding: "12px 24px",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        gap: 12,
        zIndex: 1000,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        animation: "slideUp 0.3s ease",
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function InvestmentHistoryPage() {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [marketFilter, setMarketFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== "all") params.status = filter;
      if (marketFilter !== "all") params.market = marketFilter;

      const [investmentsRes, summaryRes] = await Promise.all([
        api.get("/investments/my", { params }),
        api.get("/investments/summary"),
      ]);
      setInvestments(investmentsRes.data?.data || []);
      setSummary(summaryRes.data?.data);
    } catch (err) {
      console.error("Failed to fetch investments:", err);
      showToast(
        err.response?.data?.message || t("failed_to_fetch_investments"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, marketFilter]);

  const handleCancelInvestment = async (investmentId) => {
    setCancellingId(investmentId);
    try {
      await api.post(`/investments/${investmentId}/cancel`);
      showToast(t("investment_cancelled_success"), "success");
      fetchData();
    } catch (err) {
      showToast(
        err.response?.data?.message || t("failed_to_cancel_investment"),
        "error",
      );
    } finally {
      setCancellingId(null);
    }
  };

  const handleDeleteInvestment = async (investmentId) => {
    setDeletingId(investmentId);
    try {
      await api.delete(`/investments/${investmentId}`);
      showToast(t("investment_deleted_success"), "success");
      fetchData();
    } catch (err) {
      showToast(
        err.response?.data?.message || t("failed_to_delete_investment"),
        "error",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysRemaining = (maturityDate) => {
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diff = Math.ceil((maturity - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const filterOptions = [
    { value: "all", label: t("all") },
    { value: "active", label: t("active") },
    { value: "matured", label: t("matured") },
    { value: "cancelled", label: t("cancelled") },
  ];

  const marketOptions = [
    { value: "all", label: t("all_markets") },
    { value: "stocks", label: t("stocks") },
    { value: "crypto", label: t("crypto") },
    { value: "realestate", label: t("real_estate") },
  ];

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <DashboardNav />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>

      <div style={{ paddingTop: 80, paddingBottom: 100 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px" }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                color: textClr,
                fontWeight: 800,
                fontSize: "1.5rem",
                margin: 0,
              }}
            >
              {t("my_investments")}
            </h1>
            <p style={{ color: muted, fontSize: "0.85rem", marginTop: 4 }}>
              {t("track_all_investments")}
            </p>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: 16,
                  padding: "16px",
                }}
              >
                <div
                  style={{ color: muted, fontSize: "0.7rem", marginBottom: 4 }}
                >
                  {t("total_invested")}
                </div>
                <div
                  style={{
                    color: textClr,
                    fontSize: "1.3rem",
                    fontWeight: 700,
                  }}
                >
                  ${summary.totalInvested?.toLocaleString() || 0}
                </div>
              </div>
              <div
                style={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: 16,
                  padding: "16px",
                }}
              >
                <div
                  style={{ color: muted, fontSize: "0.7rem", marginBottom: 4 }}
                >
                  {t("active_investments")}
                </div>
                <div
                  style={{
                    color: "#34d399",
                    fontSize: "1.3rem",
                    fontWeight: 700,
                  }}
                >
                  {summary.activeInvestments || 0}
                </div>
              </div>
              <div
                style={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: 16,
                  padding: "16px",
                }}
              >
                <div
                  style={{ color: muted, fontSize: "0.7rem", marginBottom: 4 }}
                >
                  {t("total_returns")}
                </div>
                <div
                  style={{
                    color: "#f59e0b",
                    fontSize: "1.3rem",
                    fontWeight: 700,
                  }}
                >
                  +${summary.totalReturns?.toLocaleString() || 0}
                </div>
              </div>
              <div
                style={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: 16,
                  padding: "16px",
                }}
              >
                <div
                  style={{ color: muted, fontSize: "0.7rem", marginBottom: 4 }}
                >
                  {t("by_market")}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <span
                    style={{
                      color: "#34d399",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    📈 {summary.byMarket?.stocks || 0}
                  </span>
                  <span
                    style={{
                      color: "#f59e0b",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    ₿ {summary.byMarket?.crypto || 0}
                  </span>
                  <span
                    style={{
                      color: "#60a5fa",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    🏠 {summary.byMarket?.realestate || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 20,
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 12,
                    border: `1px solid ${filter === opt.value ? "#f59e0b" : border}`,
                    background:
                      filter === opt.value
                        ? "rgba(245,158,11,0.1)"
                        : "transparent",
                    color: filter === opt.value ? "#f59e0b" : muted,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <CustomSelect
              value={marketFilter}
              onChange={setMarketFilter}
              options={marketOptions}
              darkMode={darkMode}
              border={border}
              textClr={textClr}
              muted={muted}
              t={t}
            />
          </div>

          {/* Investments List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <Loader size={32} className="spin" style={{ color: muted }} />
            </div>
          ) : investments.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 60,
                background: cardBg,
                borderRadius: 20,
                border: `1px solid ${border}`,
              }}
            >
              <Wallet size={48} color={muted} style={{ marginBottom: 16 }} />
              <div style={{ color: textClr, fontWeight: 600 }}>
                {t("no_investments_found")}
              </div>
              <div style={{ color: muted, fontSize: "0.85rem", marginTop: 4 }}>
                {t("start_investing_to_grow")}
              </div>
              <button
                onClick={() => navigate("/stocks-market")}
                style={{
                  marginTop: 20,
                  padding: "8px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t("explore_markets")}
              </button>
            </div>
          ) : (
            <div
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              {investments.map((inv, idx) => {
                const market = MARKET_CONFIG[inv.market];
                const status =
                  STATUS_CONFIG[inv.status] || STATUS_CONFIG.active;
                const StatusIcon = status.icon;
                const daysRemaining =
                  inv.status === "active"
                    ? getDaysRemaining(inv.maturityDate)
                    : 0;
                const returns = (inv.amount * inv.expectedROI) / 100;

                return (
                  <div
                    key={inv._id}
                    style={{
                      padding: "18px 20px",
                      borderBottom:
                        idx < investments.length - 1
                          ? `1px solid ${divLine}`
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: market.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <market.icon size={20} color={market.color} />
                        </div>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <span style={{ color: textClr, fontWeight: 700 }}>
                              {t(market.nameKey)}
                            </span>
                            <span
                              style={{
                                fontSize: "0.7rem",
                                padding: "2px 8px",
                                borderRadius: 20,
                                background: `${status.color}15`,
                                color: status.color,
                              }}
                            >
                              <StatusIcon
                                size={10}
                                style={{ display: "inline", marginRight: 4 }}
                              />
                              {t(status.labelKey)}
                            </span>
                          </div>
                          <div
                            style={{
                              color: muted,
                              fontSize: "0.7rem",
                              marginTop: 4,
                            }}
                          >
                            {inv.planId?.name || t("custom_plan")} •{" "}
                            {inv.duration} {t("days")}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            color: textClr,
                            fontWeight: 700,
                            fontSize: "1.1rem",
                          }}
                        >
                          ${inv.amount.toLocaleString()}
                        </div>
                        <div style={{ color: "#34d399", fontSize: "0.75rem" }}>
                          +${returns.toFixed(2)} {t("at")} {inv.expectedROI}%
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 12,
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
                      >
                        <div>
                          <div style={{ color: muted, fontSize: "0.65rem" }}>
                            {t("started")}
                          </div>
                          <div style={{ color: textClr, fontSize: "0.7rem" }}>
                            {formatDate(inv.startDate)}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: muted, fontSize: "0.65rem" }}>
                            {t("maturity")}
                          </div>
                          <div style={{ color: textClr, fontSize: "0.7rem" }}>
                            {formatDate(inv.maturityDate)}
                          </div>
                        </div>
                        {inv.status === "active" && daysRemaining > 0 && (
                          <div>
                            <div style={{ color: muted, fontSize: "0.65rem" }}>
                              {t("days_left")}
                            </div>
                            <div
                              style={{
                                color: "#f59e0b",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                              }}
                            >
                              {daysRemaining} {t("days")}
                            </div>
                          </div>
                        )}
                        {inv.status === "matured" && inv.returns > 0 && (
                          <div>
                            <div style={{ color: muted, fontSize: "0.65rem" }}>
                              {t("returns_earned")}
                            </div>
                            <div
                              style={{
                                color: "#34d399",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                              }}
                            >
                              +${inv.returns.toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        {inv.status === "active" && (
                          <button
                            onClick={() => handleCancelInvestment(inv._id)}
                            disabled={cancellingId === inv._id}
                            style={{
                              padding: "4px 12px",
                              borderRadius: 8,
                              border: `1px solid #f87171`,
                              background:
                                cancellingId === inv._id
                                  ? "rgba(248,113,113,0.2)"
                                  : "transparent",
                              color: "#f87171",
                              fontSize: "0.7rem",
                              cursor:
                                cancellingId === inv._id ? "wait" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              transition: "all 0.15s",
                              opacity: cancellingId === inv._id ? 0.7 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (cancellingId !== inv._id) {
                                e.currentTarget.style.background =
                                  "rgba(248,113,113,0.1)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (cancellingId !== inv._id) {
                                e.currentTarget.style.background =
                                  "transparent";
                              }
                            }}
                          >
                            {cancellingId === inv._id ? (
                              <>
                                <Loader size={10} className="spin" />{" "}
                                {t("cancelling_dots")}
                              </>
                            ) : (
                              t("cancel_early")
                            )}
                          </button>
                        )}

                        {inv.status === "cancelled" && (
                          <button
                            onClick={() => handleDeleteInvestment(inv._id)}
                            disabled={deletingId === inv._id}
                            style={{
                              padding: "4px 12px",
                              borderRadius: 8,
                              border: `1px solid ${muted}`,
                              background:
                                deletingId === inv._id
                                  ? "rgba(100,116,139,0.2)"
                                  : "transparent",
                              color: muted,
                              fontSize: "0.7rem",
                              cursor:
                                deletingId === inv._id ? "wait" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              transition: "all 0.15s",
                              opacity: deletingId === inv._id ? 0.7 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (deletingId !== inv._id) {
                                e.currentTarget.style.background =
                                  "rgba(100,116,139,0.1)";
                                e.currentTarget.style.color = "#f87171";
                                e.currentTarget.style.borderColor = "#f87171";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (deletingId !== inv._id) {
                                e.currentTarget.style.background =
                                  "transparent";
                                e.currentTarget.style.color = muted;
                                e.currentTarget.style.borderColor = muted;
                              }
                            }}
                          >
                            {deletingId === inv._id ? (
                              <>
                                <Loader size={10} className="spin" />{" "}
                                {t("deleting_dots")}
                              </>
                            ) : (
                              t("delete")
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (inv.market === "realestate") {
                              navigate("/real-estate");
                            } else if (inv.market === "stocks") {
                              navigate("/stocks-market");
                            } else if (inv.market === "crypto") {
                              navigate("/crypto-market");
                            }
                          }}
                          style={{
                            padding: "4px 12px",
                            borderRadius: 8,
                            border: `1px solid ${border}`,
                            background: "transparent",
                            color: muted,
                            fontSize: "0.7rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {t("view_market")} <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
