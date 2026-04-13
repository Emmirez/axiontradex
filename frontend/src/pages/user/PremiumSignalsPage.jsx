// frontend/src/pages/user/PremiumSignalsPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  Clock,
  Shield,
  AlertTriangle,
  ChevronRight,
  Wallet,
  Star,
  X,
  Loader,
  CheckCircle,
  Calendar,
  Zap,
  LogOut,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import api from "../../services/apiService";

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

// Subscription Modal
function SubscribeModal({
  onClose,
  onSuccess,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  inputBg,
  showToast,
  t,
}) {
  const [plan, setPlan] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const plans = {
    basic: {
      price: 500,
      color: "#60a5fa",
      features: [
        t("signals_5_per_week"),
        t("basic_analysis"),
        t("email_alerts"),
        t("entry_exit_prices"),
      ],
    },
    pro: {
      price: 1200,
      color: "#f59e0b",
      features: [
        t("signals_15_per_week"),
        t("detailed_analysis"),
        t("email_push_alerts"),
        t("entry_exit_timing"),
        t("risk_management_tips"),
        t("weekly_market_recap"),
      ],
    },
    premium: {
      price: 2500,
      color: "#a78bfa",
      features: [
        t("unlimited_signals"),
        t("vip_analysis"),
        t("priority_support"),
        t("expert_insights"),
        t("live_webinars"),
        t("one_on_one_coaching"),
        t("early_access_signals"),
      ],
    },
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/signals/subscribe", { plan });
      showToast(t("subscribed_success", { plan }), "success");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || t("failed_to_subscribe"));
    } finally {
      setLoading(false);
    }
  };

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
            marginBottom: 20,
          }}
        >
          <h2 style={{ color: textClr, fontSize: "1.2rem", fontWeight: 700 }}>
            {t("subscribe_to_signals")}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: muted,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {Object.entries(plans).map(([key, data]) => (
            <button
              key={key}
              onClick={() => setPlan(key)}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 12,
                border: `2px solid ${plan === key ? data.color : border}`,
                background: plan === key ? `${data.color}20` : "transparent",
              }}
            >
              <div
                style={{
                  color: textClr,
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
              >
                {key}
              </div>
              <div style={{ color: data.color, fontWeight: 700 }}>
                ${data.price}
                {t("per_month_abbr")}
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ color: textClr, fontWeight: 600, marginBottom: 12 }}>
            {t("features")}:
          </div>
          {plans[plan].features.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <CheckCircle size={12} color="#34d399" />
              <span style={{ color: muted, fontSize: "0.8rem" }}>{f}</span>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ color: "#f87171", marginBottom: 12 }}>{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg,#f59e0b,#d97706)",
            color: "#fff",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? t("processing_dots")
            : `${t("subscribe")} - $${plans[plan].price}/${t("month")}`}
        </button>
      </div>
    </div>
  );
}

// Unsubscribe Modal
function UnsubscribeModal({
  onClose,
  onConfirm,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  showToast,
  t,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUnsubscribe = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/signals/unsubscribe");
      showToast(t("unsubscribed_success"), "success");
      onConfirm();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || t("failed_to_unsubscribe"));
    } finally {
      setLoading(false);
    }
  };

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
          maxWidth: 400,
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(248,113,113,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <AlertCircle size={24} color="#f87171" />
          </div>
          <h2
            style={{
              color: textClr,
              fontSize: "1.2rem",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {t("cancel_subscription")}
          </h2>
          <p style={{ color: muted, fontSize: "0.85rem", marginBottom: 24 }}>
            {t("unsubscribe_warning")}
          </p>
        </div>

        {error && (
          <div
            style={{ color: "#f87171", marginBottom: 12, textAlign: "center" }}
          >
            {error}
          </div>
        )}

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px",
              borderRadius: 12,
              border: `1px solid ${border}`,
              background: "transparent",
              color: textClr,
              cursor: "pointer",
            }}
          >
            {t("keep_subscription")}
          </button>
          <button
            onClick={handleUnsubscribe}
            disabled={loading}
            style={{
              padding: "10px",
              borderRadius: 12,
              border: "none",
              background: "#f87171",
              color: "#fff",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? t("cancelling_dots") : t("yes_cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Select Component with custom dropdown
function EnhancedSelect({
  value,
  onChange,
  options,
  darkMode,
  textClr,
  muted,
  border,
  t,
}) {
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

  const getSelectedDisplay = () => {
    if (!value || value === "all") return t("all_markets");
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : t("all_markets");
  };

  return (
    <div ref={selectRef} style={{ position: "relative" }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "8px 16px",
          borderRadius: 20,
          border: `1px solid ${isOpen ? "#f59e0b" : border}`,
          background: darkMode ? "rgba(30,41,59,0.9)" : "#fff",
          color: textClr,
          fontSize: "0.8rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          minWidth: 140,
          transition: "all 0.2s ease",
        }}
      >
        <span style={{ fontWeight: 500 }}>{getSelectedDisplay()}</span>
        <ChevronDown
          style={{
            width: 14,
            height: 14,
            color: isOpen ? "#f59e0b" : muted,
            transition: "transform 0.2s ease",
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
            marginTop: 8,
            minWidth: 180,
            background: darkMode ? "rgba(30,41,59,0.98)" : "#fff",
            backdropFilter: "blur(12px)",
            border: `1px solid ${border}`,
            borderRadius: 16,
            overflow: "hidden",
            zIndex: 50,
            boxShadow: darkMode
              ? "0 10px 25px -5px rgba(0,0,0,0.3)"
              : "0 10px 25px -5px rgba(0,0,0,0.1)",
          }}
        >
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <div
                key={option.value}
                onClick={() => {
                  onChange({ target: { value: option.value } });
                  setIsOpen(false);
                }}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  color: isSelected ? "#f59e0b" : textClr,
                  backgroundColor: isSelected
                    ? darkMode
                      ? "rgba(245,158,11,0.1)"
                      : "rgba(245,158,11,0.05)"
                    : "transparent",
                  fontSize: "0.8rem",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = darkMode
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <CheckCircle
                    style={{ width: 12, height: 12, color: "#f59e0b" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Main Component
export default function PremiumSignalsPage() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [executedSignals, setExecutedSignals] = useState(new Set());
  const [signals, setSignals] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);
  const [filter, setFilter] = useState("all");
  const [marketFilter, setMarketFilter] = useState("all");
  const [toast, setToast] = useState(null);

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [signalsRes, subRes] = await Promise.all([
        api.get("/signals"),
        api.get("/signals/subscription"),
      ]);
      setSignals(signalsRes.data?.data?.signals || []);
      setSubscription(subRes.data?.data);
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(`executed_signals_${user?._id}`);
    if (saved) {
      setExecutedSignals(new Set(JSON.parse(saved)));
    }
  }, [user]);

  useEffect(() => {
    if (user?._id && executedSignals.size > 0) {
      localStorage.setItem(
        `executed_signals_${user._id}`,
        JSON.stringify([...executedSignals]),
      );
    }
  }, [executedSignals, user]);

  const hasSubscription = subscription?.hasSubscription;
  const daysLeft = subscription?.subscription?.daysLeft;
  const plan = subscription?.subscription?.plan;

  const filteredSignals = signals.filter((s) => {
    if (filter !== "all" && s.signalType !== filter) return false;
    if (marketFilter !== "all" && s.market !== marketFilter) return false;
    return true;
  });

  const getSignalColor = (type) => {
    if (type === "buy")
      return { bg: "rgba(52,211,153,0.12)", color: "#34d399" };
    if (type === "sell")
      return { bg: "rgba(248,113,113,0.12)", color: "#f87171" };
    return { bg: "rgba(96,165,250,0.12)", color: "#60a5fa" };
  };

  const getRiskColor = (risk) => {
    if (risk === "Low")
      return { bg: "rgba(52,211,153,0.12)", color: "#34d399" };
    if (risk === "Medium")
      return { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" };
    return { bg: "rgba(248,113,113,0.12)", color: "#f87171" };
  };

  const handleExecuteTrade = async (signal) => {
    if (executedSignals.has(signal._id)) {
      showToast(t("already_executed"), "warning");
      navigate(
        `/trade?symbol=${signal.symbol}&type=${signal.signalType}&entry=${signal.entryPrice}&target=${signal.targetPrice}&stop=${signal.stopLoss}&signalId=${signal._id}`,
      );
      return;
    }

    try {
      const response = await api.post(`/signals/${signal._id}/received`);
      if (!response.data?.data?.alreadyExecuted) {
        setExecutedSignals((prev) => new Set(prev).add(signal._id));
        showToast(t("signal_marked_executed"), "success");
      }
    } catch (err) {
      console.error("Failed to mark signal:", err);
    }

    navigate(
      `/trade?symbol=${signal.symbol}&type=${signal.signalType}&entry=${signal.entryPrice}&target=${signal.targetPrice}&stop=${signal.stopLoss}&signalId=${signal._id}`,
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <DashboardNav />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          t={t}
        />
      )}

      {showSubscribe && (
        <SubscribeModal
          onClose={() => setShowSubscribe(false)}
          onSuccess={fetchData}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={null}
          showToast={showToast}
          t={t}
        />
      )}

      {showUnsubscribe && (
        <UnsubscribeModal
          onClose={() => setShowUnsubscribe(false)}
          onConfirm={fetchData}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
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
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <h1
                  style={{
                    color: textClr,
                    fontWeight: 800,
                    fontSize: "1.8rem",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Zap size={28} color="#f59e0b" />
                  {t("premium_signals")}
                </h1>
                <p style={{ color: muted, marginTop: 4 }}>
                  {t("premium_signals_subtitle")}
                </p>
              </div>
              {hasSubscription ? (
                <button
                  onClick={() => setShowUnsubscribe(true)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 12,
                    border: `1px solid #f87171`,
                    background: "transparent",
                    color: "#f87171",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <LogOut size={14} /> {t("cancel_subscription_btn")}
                </button>
              ) : (
                <button
                  onClick={() => setShowSubscribe(true)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg,#f59e0b,#d97706)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Star size={16} /> {t("subscribe_now")}
                </button>
              )}
            </div>
          </div>

          {/* Subscription Status */}
          {hasSubscription ? (
            <div
              style={{
                background: "rgba(52,211,153,0.1)",
                border: `1px solid rgba(52,211,153,0.3)`,
                borderRadius: 16,
                padding: "16px",
                marginBottom: 24,
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
                  <div style={{ color: textClr, fontWeight: 600 }}>
                    {t("active_subscription")}{" "}
                    <span
                      style={{ color: "#34d399", textTransform: "capitalize" }}
                    >
                      {plan}
                    </span>
                  </div>
                  <div
                    style={{ color: muted, fontSize: "0.75rem", marginTop: 4 }}
                  >
                    <Calendar
                      size={12}
                      style={{ display: "inline", marginRight: 4 }}
                    />
                    {daysLeft > 0
                      ? t("days_remaining", { days: daysLeft })
                      : t("expiring_soon")}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <div>
                    <span style={{ color: "#f59e0b", fontWeight: 600 }}>
                      {subscription.subscription?.signalsReceived || 0}
                    </span>
                    <span style={{ color: muted, fontSize: "0.7rem" }}>
                      {" "}
                      {t("signals_received")}
                    </span>
                  </div>
                  <div>
                    {(() => {
                      const profit =
                        subscription.subscription?.totalProfit ?? 0;
                      const isProfit = profit >= 0;
                      return (
                        <>
                          <span
                            style={{
                              color: isProfit ? "#34d399" : "#f87171",
                              fontWeight: 600,
                            }}
                          >
                            {isProfit ? "+" : "-"}$
                            {Math.abs(profit).toLocaleString()}
                          </span>
                          <span style={{ color: muted, fontSize: "0.7rem" }}>
                            {" "}
                            {isProfit ? t("profit") : t("loss")}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
              {daysLeft <= 3 && daysLeft > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "8px 12px",
                    background: "rgba(245,158,11,0.1)",
                    borderRadius: 8,
                  }}
                >
                  <span style={{ color: "#f59e0b", fontSize: "0.75rem" }}>
                    ⚠️ {t("expires_in_days", { days: daysLeft })}{" "}
                    <button
                      onClick={() => setShowSubscribe(true)}
                      style={{
                        color: "#f59e0b",
                        textDecoration: "underline",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {t("renew_now")}
                    </button>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: 60,
                background: cardBg,
                borderRadius: 20,
                border: `1px solid ${border}`,
                marginBottom: 24,
              }}
            >
              <Star
                size={48}
                color={muted}
                style={{ marginBottom: 16, opacity: 0.5 }}
              />
              <div style={{ color: textClr, fontWeight: 600, marginBottom: 8 }}>
                {t("no_active_subscription")}
              </div>
              <div
                style={{ color: muted, fontSize: "0.85rem", marginBottom: 20 }}
              >
                {t("subscribe_to_receive_signals")}
              </div>
              <button
                onClick={() => setShowSubscribe(true)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                {t("view_plans")}
              </button>
            </div>
          )}

          {/* Filters - Only show if user has subscription */}
          {hasSubscription && (
            <>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 24,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["all", "buy", "sell", "hold"].map((tKey) => (
                    <button
                      key={tKey}
                      onClick={() => setFilter(tKey)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: 20,
                        border: `1px solid ${filter === tKey ? "#f59e0b" : border}`,
                        background:
                          filter === tKey
                            ? "rgba(245,158,11,0.1)"
                            : "transparent",
                        color: filter === tKey ? "#f59e0b" : muted,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        textTransform: "capitalize",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {tKey === "all" ? t("all") : t(tKey)}
                    </button>
                  ))}
                </div>

                <EnhancedSelect
                  value={marketFilter}
                  onChange={(e) => setMarketFilter(e.target.value)}
                  options={[
                    { value: "all", label: t("all_markets_icon") },
                    { value: "stocks", label: t("stocks_icon") },
                    { value: "crypto", label: t("crypto_icon") },
                    { value: "forex", label: t("forex_icon") },
                    { value: "commodities", label: t("commodities_icon") },
                  ]}
                  darkMode={darkMode}
                  textClr={textClr}
                  muted={muted}
                  border={border}
                  t={t}
                />
              </div>

              {/* Signals List */}
              {loading ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  <Loader size={32} className="spin" style={{ color: muted }} />
                </div>
              ) : filteredSignals.length === 0 ? (
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
                    {t("no_signals_available")}
                  </div>
                  <div style={{ color: muted, fontSize: "0.85rem" }}>
                    {t("check_back_soon")}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(350px, 1fr))",
                    gap: 20,
                  }}
                >
                  {filteredSignals.map((signal) => {
                    const signalColor = getSignalColor(signal.signalType);
                    const riskColor = getRiskColor(signal.riskLevel);
                    return (
                      <div
                        key={signal._id}
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
                              alignItems: "center",
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
                              <span
                                style={{
                                  padding: "2px 10px",
                                  borderRadius: 20,
                                  background: signalColor.bg,
                                  color: signalColor.color,
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                }}
                              >
                                {t(signal.signalType)}
                              </span>
                              <span
                                style={{
                                  color: muted,
                                  fontSize: "0.7rem",
                                  textTransform: "capitalize",
                                }}
                              >
                                {t(signal.market)}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Clock size={10} color={muted} />
                              <span
                                style={{ color: muted, fontSize: "0.65rem" }}
                              >
                                {new Date(
                                  signal.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <h3
                            style={{
                              color: textClr,
                              fontSize: "1rem",
                              fontWeight: 700,
                              marginBottom: 4,
                            }}
                          >
                            {signal.title}
                          </h3>
                          <p
                            style={{
                              color: muted,
                              fontSize: "0.75rem",
                              marginBottom: 16,
                            }}
                          >
                            {signal.description}
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
                              <div
                                style={{ color: muted, fontSize: "0.65rem" }}
                              >
                                {t("symbol")}
                              </div>
                              <div style={{ color: textClr, fontWeight: 600 }}>
                                {signal.symbol}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{ color: muted, fontSize: "0.65rem" }}
                              >
                                {t("entry")}
                              </div>
                              <div
                                style={{ color: "#34d399", fontWeight: 600 }}
                              >
                                ${signal.entryPrice}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{ color: muted, fontSize: "0.65rem" }}
                              >
                                {t("target")}
                              </div>
                              <div
                                style={{ color: "#f59e0b", fontWeight: 600 }}
                              >
                                ${signal.targetPrice}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{ color: muted, fontSize: "0.65rem" }}
                              >
                                {t("stop_loss")}
                              </div>
                              <div
                                style={{ color: "#f87171", fontWeight: 600 }}
                              >
                                ${signal.stopLoss}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              paddingTop: 12,
                              borderTop: `1px solid ${border}`,
                            }}
                          >
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: 12,
                                background: riskColor.bg,
                                color: riskColor.color,
                                fontSize: "0.65rem",
                              }}
                            >
                              {t(signal.riskLevel?.toLowerCase() || "medium")}{" "}
                              {t("risk")}
                            </span>
                            <span
                              style={{ color: "#f59e0b", fontSize: "0.7rem" }}
                            >
                              {signal.confidence}% {t("confidence")}
                            </span>
                          </div>

                          <button
                            onClick={() => handleExecuteTrade(signal)}
                            style={{
                              width: "100%",
                              padding: "8px",
                              borderRadius: 8,
                              border: "none",
                              background:
                                "linear-gradient(135deg,#34d399,#10b981)",
                              color: "#fff",
                              fontWeight: 600,
                              cursor: "pointer",
                              marginTop: 12,
                            }}
                          >
                            {t("execute_trade")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <BottomNav />
    </div>
  );
}
