// frontend/src/pages/user/StocksMarketPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  DollarSign,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Wallet,
  ArrowUpRight,
  Calendar,
  Percent,
  Loader,
  X,
  Plus,
  Minus,
  Building2,
  BarChart3,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import api from "../../services/apiService";
import { useTranslation } from "react-i18next";

const RISK_COLORS = {
  Low: { bg: "rgba(52,211,153,0.12)", color: "#34d399", icon: Shield },
  Medium: {
    bg: "rgba(245,158,11,0.12)",
    color: "#f59e0b",
    icon: AlertTriangle,
  },
  High: { bg: "rgba(248,113,113,0.12)", color: "#f87171", icon: AlertTriangle },
};

// Toast Component
function Toast({ message, type, onClose, t }) {
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

// Investment Modal
function InvestModal({
  plan,
  onClose,
  onSuccess,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  inputBg,
  showToast,
  t
}) {
  const [amount, setAmount] = useState(plan?.minAmount || 100);
  const [customROI, setCustomROI] = useState(5);
  const [customDuration, setCustomDuration] = useState(30);
  const [planType, setPlanType] = useState("fixed");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const minAmount = plan?.minAmount || 100;
  const maxAmount = plan?.maxAmount || 100000;

  const handleAmountChange = (value) => {
    let newAmount = value;
    if (newAmount < minAmount) newAmount = minAmount;
    if (newAmount > maxAmount) newAmount = maxAmount;
    setAmount(newAmount);
  };

  const handleSubmit = async () => {
    if (amount < minAmount) {
      setError(t("min_investment_error", { amount: minAmount }));
      return;
    }
    if (amount > maxAmount) {
      setError(t("max_investment_error", { amount: maxAmount }));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        market: "stocks",
        planType,
        amount,
      };

      if (planType === "fixed" && plan) {
        payload.planId = plan._id;
      } else {
        payload.customROI = customROI;
        payload.customDuration = customDuration;
      }

      const response = await api.post("/investments", payload);

      // Show success toast
      showToast(t("investment_success", { amount }), "success");

      // Refresh data and close modal
      onSuccess();
      onClose();

      // Dispatch event to refresh notifications
      window.dispatchEvent(new CustomEvent("investment-created"));
    } catch (err) {
      const errorMsg = err.response?.data?.message || t("investment_failed");
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const returns =
    (amount * (planType === "fixed" ? plan?.roi || 0 : customROI)) / 100;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 24,
          width: "100%",
          maxWidth: 480,
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ color: textClr, fontSize: "1.2rem", fontWeight: 700 }}>
            {t("invest_in_stocks")}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: muted,
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {plan && (
          <div
            style={{
              marginBottom: 20,
              padding: "12px",
              background: "rgba(52,211,153,0.08)",
              borderRadius: 12,
            }}
          >
            <div style={{ fontWeight: 600, color: textClr }}>{plan.name}</div>
            <div style={{ fontSize: "0.75rem", color: muted, marginTop: 4 }}>
              {plan.description}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.75rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 8,
            }}
          >
            {t("investment_amount_usdt")}
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => handleAmountChange(amount - 100)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: inputBg,
                cursor: "pointer",
              }}
            >
              <Minus size={14} color={textClr} />
            </button>
            <input
              type="number"
              value={amount}
              onChange={(e) =>
                handleAmountChange(parseFloat(e.target.value) || 0)
              }
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: inputBg,
                color: textClr,
                fontSize: "1rem",
                fontWeight: 600,
                textAlign: "center",
              }}
            />
            <button
              onClick={() => handleAmountChange(amount + 100)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: inputBg,
                cursor: "pointer",
              }}
            >
              <Plus size={14} color={textClr} />
            </button>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
              fontSize: "0.7rem",
              color: muted,
            }}
          >
            <span>{t("min_amount_label", { amount: minAmount })}</span>
            <span>{t("max_amount_label", { amount: maxAmount })}</span>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.75rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 8,
            }}
          >
            {t("investment_type")}
          </label>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setPlanType("fixed")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 10,
                border: `1px solid ${planType === "fixed" ? "#34d399" : border}`,
                background:
                  planType === "fixed" ? "rgba(52,211,153,0.1)" : "transparent",
                color: planType === "fixed" ? "#34d399" : textClr,
                cursor: "pointer",
              }}
            >
              {t("fixed_plan")}
            </button>
            <button
              onClick={() => setPlanType("custom")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 10,
                border: `1px solid ${planType === "custom" ? "#f59e0b" : border}`,
                background:
                  planType === "custom"
                    ? "rgba(245,158,11,0.1)"
                    : "transparent",
                color: planType === "custom" ? "#f59e0b" : textClr,
                cursor: "pointer",
              }}
            >
              {t("custom_plan")}
            </button>
          </div>
        </div>

        {planType === "custom" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div>
              <label
                style={{
                  color: muted,
                  fontSize: "0.7rem",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                {t("roi_percent")}
              </label>
              <input
                type="number"
                value={customROI}
                onChange={(e) => setCustomROI(parseFloat(e.target.value) || 0)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: 8,
                  border: `1px solid ${border}`,
                  background: inputBg,
                  color: textClr,
                }}
              />
            </div>
            <div>
              <label
                style={{
                  color: muted,
                  fontSize: "0.7rem",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                {t("duration_days")}
              </label>
              <input
                type="number"
                value={customDuration}
                onChange={(e) =>
                  setCustomDuration(parseInt(e.target.value) || 0)
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: 8,
                  border: `1px solid ${border}`,
                  background: inputBg,
                  color: textClr,
                }}
              />
            </div>
          </div>
        )}

        <div
          style={{
            background: "rgba(52,211,153,0.05)",
            borderRadius: 12,
            padding: "12px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ color: muted, fontSize: "0.75rem" }}>
              {t("expected_returns")}
            </span>
            <span style={{ color: "#34d399", fontWeight: 700 }}>
              +${returns.toFixed(2)}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ color: muted, fontSize: "0.75rem" }}>
              {t("total_at_maturity")}
            </span>
            <span style={{ color: textClr, fontWeight: 700 }}>
              ${(amount + returns).toFixed(2)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: muted, fontSize: "0.75rem" }}>Duration</span>
            <span style={{ color: textClr }}>
              {planType === "fixed" ? plan?.duration : customDuration}{" "}
              {t("days")}
            </span>
          </div>
        </div>

        {error && (
          <div
            style={{ color: "#f87171", fontSize: "0.75rem", marginBottom: 12 }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg,#34d399,#10b981)",
            color: "#fff",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {loading ? (
            <Loader size={18} className="spin" />
          ) : (
            <Wallet size={18} />
          )}
          {loading ? t("processing_dots") : t("invest_now")}
        </button>
      </div>
    </div>
  );
}

export default function StocksMarketPage() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchData = async () => {
    try {
      const [plansRes, investmentsRes, summaryRes] = await Promise.all([
        api.get("/investments/plans?market=stocks"),
        api.get("/investments/my?market=stocks"),
        api.get("/investments/summary"),
      ]);
      setPlans(plansRes.data?.data?.plans || []);
      setInvestments(investmentsRes.data?.data || []);
      setSummary(summaryRes.data?.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleWithdraw = async (investmentId) => {
    try {
      await api.post(`/investments/${investmentId}/withdraw`);
      showToast(t("withdrawal_success"), "success");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || t("withdrawal_failed"), "error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <DashboardNav />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
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

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          t={t}
        />
      )}

      {showModal && selectedPlan && (
        <InvestModal
          plan={selectedPlan}
          onClose={() => {
            setShowModal(false);
            setSelectedPlan(null);
          }}
          onSuccess={fetchData}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
          showToast={showToast}
          t={t}
        />
      )}

      <div style={{ paddingTop: 80, paddingBottom: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "rgba(52,211,153,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUp size={24} color="#34d399" />
              </div>
              <div>
                <h1
                  style={{
                    color: textClr,
                    fontWeight: 800,
                    fontSize: "1.8rem",
                    margin: 0,
                  }}
                >
                  {t("stock_market")}
                </h1>
                <p style={{ color: muted, margin: "4px 0 0" }}>
                  {t("stock_market_subtitle")}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/investments")}
              style={{
                marginTop: 12,
                background: "none",
                border: "none",
                color: "#34d399",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <ArrowUpRight size={14} /> {t("view_my_investments")}
            </button>
          </div>
          {/* Stats Cards */}
          {summary && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
                marginBottom: 32,
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
                    fontSize: "1.5rem",
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
                    color: textClr,
                    fontSize: "1.5rem",
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
                    color: "#34d399",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                  }}
                >
                  +${summary.totalReturns?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          )}
          {/* Investment Plans */}
          <h2
            style={{
              color: textClr,
              fontSize: "1.2rem",
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            {t("investment_plans")}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 20,
              marginBottom: 40,
            }}
          >
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: 20,
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      height: 20,
                      background: darkMode
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.05)",
                      borderRadius: 4,
                      marginBottom: 12,
                    }}
                  />
                  <div
                    style={{
                      height: 40,
                      background: darkMode
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.05)",
                      borderRadius: 4,
                      marginBottom: 12,
                    }}
                  />
                  <div
                    style={{
                      height: 60,
                      background: darkMode
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.05)",
                      borderRadius: 4,
                    }}
                  />
                </div>
              ))
            ) : plans.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 60,
                  background: cardBg,
                  borderRadius: 20,
                  border: `1px solid ${border}`,
                }}
              >
                <TrendingUp
                  size={48}
                  color={muted}
                  style={{ marginBottom: 16 }}
                />
                <div style={{ color: textClr, fontWeight: 600 }}>
                  {t("no_investment_plans")}
                </div>
                <div style={{ color: muted, fontSize: "0.85rem" }}>
                  {t("check_back_later_plans")}
                </div>
              </div>
            ) : (
              plans.map((plan) => {
                const RiskIcon = RISK_COLORS[plan.riskLevel]?.icon || Shield;
                const riskColor =
                  RISK_COLORS[plan.riskLevel]?.color || "#94a3b8";
                return (
                  <div
                    key={plan._id}
                    style={{
                      background: cardBg,
                      border: `1px solid ${border}`,
                      borderRadius: 20,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ padding: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: "rgba(52,211,153,0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <BarChart3 size={18} color="#34d399" />
                          </div>
                          <h3
                            style={{
                              color: textClr,
                              fontSize: "1rem",
                              fontWeight: 700,
                            }}
                          >
                            {plan.name}
                          </h3>
                        </div>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: "0.7rem",
                            color: riskColor,
                            background: RISK_COLORS[plan.riskLevel]?.bg,
                            padding: "2px 8px",
                            borderRadius: 20,
                          }}
                        >
                          <RiskIcon size={10} />{" "}
                          {t(plan.riskLevel?.toLowerCase() || "medium")}
                        </span>
                      </div>
                      <p
                        style={{
                          color: muted,
                          fontSize: "0.8rem",
                          marginBottom: 16,
                        }}
                      >
                        {plan.description}
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 12,
                          marginBottom: 16,
                        }}
                      >
                        <div>
                          <div style={{ color: muted, fontSize: "0.65rem" }}>
                            {t("roi")}
                          </div>
                          <div
                            style={{
                              color: "#34d399",
                              fontWeight: 700,
                              fontSize: "1.1rem",
                            }}
                          >
                            {plan.roi}%
                          </div>
                        </div>
                        <div>
                          <div style={{ color: muted, fontSize: "0.65rem" }}>
                            {t("duration")}
                          </div>
                          <div style={{ color: textClr, fontWeight: 600 }}>
                            {plan.duration} {t("days")}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: muted, fontSize: "0.65rem" }}>
                            {t("min_investment")}
                          </div>
                          <div style={{ color: textClr, fontWeight: 600 }}>
                            ${plan.minAmount}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: muted, fontSize: "0.65rem" }}>
                            {t("max_investment")}
                          </div>
                          <div style={{ color: textClr, fontWeight: 600 }}>
                            ${plan.maxAmount || t("unlimited")}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowModal(true);
                        }}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: 10,
                          border: "none",
                          background: "linear-gradient(135deg,#34d399,#10b981)",
                          color: "#fff",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        {t("invest_now")} <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* Active Investments */}
          {investments.length > 0 && (
            <>
              <h2
                style={{
                  color: textClr,
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  marginBottom: 20,
                }}
              >
                {t("your_investments")}
              </h2>
              <div
                style={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
                {investments
                  .filter(
                    (i) => i.status === "active" || i.status === "matured",
                  )
                  .slice(0, 5)
                  .map((inv, idx, arr) => {
                    const isReady =
                      inv.canWithdraw ||
                      inv.effectiveStatus === "ready_to_withdraw";
                    return (
                      <div
                        key={inv._id}
                        style={{
                          padding: "16px 20px",
                          borderBottom:
                            idx < arr.length - 1
                              ? `1px solid ${border}`
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 12,
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: textClr }}>
                              {inv.planId?.name || t("custom_investment")}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                marginTop: 4,
                                fontSize: "0.7rem",
                                color: muted,
                              }}
                            >
                              <span>${inv.amount}</span>
                              <span>{inv.expectedROI}% {t("roi")}</span>
                              <span>
                                <Calendar size={10} />{" "}
                                {formatDate(inv.maturityDate)}
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              textAlign: "right",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              gap: 6,
                            }}
                          >
                            <div style={{ color: "#34d399", fontWeight: 600 }}>
                              +$
                              {((inv.amount * inv.expectedROI) / 100).toFixed(
                                2,
                              )}
                            </div>
                            {isReady ? (
                              <button
                                onClick={() => handleWithdraw(inv._id)}
                                style={{
                                  padding: "6px 14px",
                                  borderRadius: 8,
                                  border: "none",
                                  background:
                                    "linear-gradient(135deg,#34d399,#10b981)",
                                  color: "#fff",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  cursor: "pointer",
                                }}
                              >
                                {t("withdraw")}
                              </button>
                            ) : inv.status === "matured" ? (
                              <span
                                style={{
                                  fontSize: "0.65rem",
                                  color: "#34d399",
                                  background: "rgba(52,211,153,0.1)",
                                  padding: "2px 8px",
                                  borderRadius: 20,
                                }}
                              >
                                {t("matured")} ✓
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: "0.65rem",
                                  color: "#f59e0b",
                                  background: "rgba(245,158,11,0.1)",
                                  padding: "2px 8px",
                                  borderRadius: 20,
                                }}
                              >
                               {t("active")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
