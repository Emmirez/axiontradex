// frontend/src/pages/user/CopyTradingPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Shield,
  ChevronRight,
  Wallet,
  ArrowUpRight,
  UserPlus,
  Settings,
  X,
  Loader,
  CheckCircle,
  Clock,
  BarChart3,
  AlertTriangle,
  Edit2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import api from "../../services/apiService";
import { useTranslation } from "react-i18next";

function Toast({ toasts, t }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 90,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {toasts.map((tItem) => (
        <div
          key={tItem.id}
          style={{
            padding: "11px 20px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: "0.82rem",
            color: "#fff",
            whiteSpace: "nowrap",
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            animation: "toastIn 0.25s ease",
            background:
              tItem.type === "error"
                ? "rgba(248,113,113,0.95)"
                : tItem.type === "warning"
                  ? "rgba(245,158,11,0.95)"
                  : "rgba(52,211,153,0.95)",
          }}
        >
          {tItem.msg}
        </div>
      ))}
    </div>
  );
}

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  t,
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onCancel}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 20,
          width: "100%",
          maxWidth: 380,
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "rgba(248,113,113,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={18} color="#f87171" />
          </div>
          <p
            style={{
              color: textClr,
              fontSize: "0.9rem",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {message}
          </p>
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "10px",
              borderRadius: 10,
              border: `1px solid ${border}`,
              background: "transparent",
              color: textClr,
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: "rgba(248,113,113,0.9)",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

function FollowModal({
  trader,
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
  const [allocationType, setAllocationType] = useState("fixed");
  const [allocationAmount, setAllocationAmount] = useState(100);
  const [allocationPercentage, setAllocationPercentage] = useState(10);
  const [autoMirror, setAutoMirror] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (allocationType === "fixed" && allocationAmount < 10) {
      setError(t("min_allocation_amount"));
      return;
    }
    if (
      allocationType === "percentage" &&
      (allocationPercentage < 1 || allocationPercentage > 100)
    ) {
      setError(t("percentage_range_error"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/copy-trading/follow", {
        traderId: trader._id,
        allocationType,
        allocationAmount: allocationType === "fixed" ? allocationAmount : 0,
        allocationPercentage:
          allocationType === "percentage" ? allocationPercentage : 0,
        autoMirror,
      });
      showToast(t("now_following", { username: trader.username }), "success");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || t("failed_to_follow_trader"));
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
        padding: 20,
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
          padding: 24,
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
          <h2
            style={{
              color: textClr,
              fontSize: "1.1rem",
              fontWeight: 700,
              margin: 0,
            }}
          >
            {t("follow_trader_title", { username: trader.username })}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: muted,
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {trader.subscriptionFee > 0 && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span style={{ color: muted, fontSize: "0.8rem" }}>
                {t("monthly_subscription")}
              </span>
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>
                ${trader.subscriptionFee}
              </span>
            </div>
            <div style={{ color: muted, fontSize: "0.68rem" }}>
              {t("subscription_charged_notice")}
            </div>
          </div>
        )}

        {/* Allocation method */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.72rem",
              fontWeight: 600,
              marginBottom: 8,
              display: "block",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {t("allocation_method")}
          </label>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {[
              { value: "fixed", label: t("fixed_amount"), color: "#34d399" },
              {
                value: "percentage",
                label: t("percent_of_balance"),
                color: "#f59e0b",
              },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAllocationType(opt.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${allocationType === opt.value ? opt.color : border}`,
                  background:
                    allocationType === opt.value
                      ? `${opt.color}18`
                      : "transparent",
                  color: allocationType === opt.value ? opt.color : textClr,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {allocationType === "fixed" ? (
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                color: muted,
                fontSize: "0.72rem",
                fontWeight: 600,
                marginBottom: 8,
                display: "block",
              }}
            >
              {t("amount_per_trade_usdt")}
            </label>
            <input
              type="number"
              value={allocationAmount}
              onChange={(e) =>
                setAllocationAmount(parseFloat(e.target.value) || 0)
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${border}`,
                background: inputBg,
                color: textClr,
                fontSize: "0.9rem",
                boxSizing: "border-box",
              }}
            />
            <div style={{ color: muted, fontSize: "0.68rem", marginTop: 4 }}>
              {t("minimum_10_per_trade")}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                color: muted,
                fontSize: "0.72rem",
                fontWeight: 600,
                marginBottom: 8,
                display: "block",
              }}
            >
              {t("percentage_of_balance_label")}
            </label>
            <input
              type="number"
              value={allocationPercentage}
              onChange={(e) =>
                setAllocationPercentage(parseFloat(e.target.value) || 0)
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${border}`,
                background: inputBg,
                color: textClr,
                fontSize: "0.9rem",
                boxSizing: "border-box",
              }}
            />
            <div style={{ color: muted, fontSize: "0.68rem", marginTop: 4 }}>
              {t("percentage_range_hint")}
            </div>
          </div>
        )}

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            marginBottom: 20,
          }}
        >
          <input
            type="checkbox"
            checked={autoMirror}
            onChange={(e) => setAutoMirror(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: "#f59e0b" }}
          />
          <span style={{ color: textClr, fontSize: "0.84rem" }}>
            {t("auto_mirror_trades")}
          </span>
        </label>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#f87171",
              fontSize: "0.75rem",
              marginBottom: 12,
              padding: "8px 12px",
              background: "rgba(248,113,113,0.08)",
              borderRadius: 8,
            }}
          >
            <AlertTriangle size={13} /> {error}
          </div>
        )}

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px",
              borderRadius: 10,
              border: `1px solid ${border}`,
              background: "transparent",
              color: textClr,
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg,#f59e0b,#d97706)",
              color: "#fff",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              fontSize: "0.85rem",
            }}
          >
            {loading ? t("following_dots") : t("follow_trader")}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdjustAllocationModal({
  follow,
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
  const copyTrade = follow.copyTrade;

  const [allocationType, setAllocationType] = useState(
    copyTrade?.allocationType || "fixed",
  );
  const [allocationAmount, setAllocationAmount] = useState(
    copyTrade?.allocationAmount || 100,
  );
  const [allocationPercentage, setAllocationPercentage] = useState(
    copyTrade?.allocationPercentage || 10,
  );
  const [maxAllocation, setMaxAllocation] = useState(
    copyTrade?.maxAllocation || 0,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (allocationType === "fixed" && allocationAmount < 10) {
      setError(t("min_allocation_amount"));
      return;
    }
    if (
      allocationType === "percentage" &&
      (allocationPercentage < 1 || allocationPercentage > 100)
    ) {
      setError(t("percentage_range_error"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.patch(`/copy-trading/allocation/${copyTrade._id}`, {
        allocationType,
        allocationAmount: allocationType === "fixed" ? allocationAmount : 0,
        allocationPercentage:
          allocationType === "percentage" ? allocationPercentage : 0,
        maxAllocation: maxAllocation || 0,
      });
      showToast(t("allocation_updated"), "success");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || t("failed_to_update_allocation"));
    } finally {
      setLoading(false);
    }
  };

  const traderName = follow.trader?.username || t("trader");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
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
          padding: 24,
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
          <div>
            <h2
              style={{
                color: textClr,
                fontSize: "1.1rem",
                fontWeight: 700,
                margin: 0,
              }}
            >
              {t("adjust_investment")}
            </h2>
            <div style={{ color: muted, fontSize: "0.72rem", marginTop: 3 }}>
              {t("following_trader", { traderName })}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: muted,
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Current allocation info */}
        <div
          style={{
            marginBottom: 20,
            padding: 12,
            background: darkMode
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.03)",
            borderRadius: 12,
            border: `1px solid ${border}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: muted, fontSize: "0.75rem" }}>
              {t("current_allocation")}
            </span>
            <span
              style={{ color: textClr, fontWeight: 600, fontSize: "0.8rem" }}
            >
              {copyTrade?.allocationType === "fixed"
                ? t("fixed_amount_value", {
                    amount: copyTrade?.allocationAmount,
                  })
                : t("percentage_of_balance_value", {
                    percent: copyTrade?.allocationPercentage,
                  })}
            </span>
          </div>
          {copyTrade?.totalInvested > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
              }}
            >
              <span style={{ color: muted, fontSize: "0.75rem" }}>
                {t("total_invested")}
              </span>
              <span
                style={{
                  color: "#f59e0b",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                }}
              >
                ${copyTrade.totalInvested?.toFixed(2)}
              </span>
            </div>
          )}
          {copyTrade?.totalProfit !== 0 && copyTrade?.totalProfit != null && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
              }}
            >
              <span style={{ color: muted, fontSize: "0.75rem" }}>
                {t("total_pnl")}
              </span>
              <span
                style={{
                  color: copyTrade.totalProfit >= 0 ? "#34d399" : "#f87171",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                }}
              >
                {copyTrade.totalProfit >= 0 ? "+" : ""}$
                {copyTrade.totalProfit?.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Allocation method */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.72rem",
              fontWeight: 600,
              marginBottom: 8,
              display: "block",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {t("allocation_method")}
          </label>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {[
              { value: "fixed", label: t("fixed_amount"), color: "#34d399" },
              {
                value: "percentage",
                label: t("percent_of_balance"),
                color: "#f59e0b",
              },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAllocationType(opt.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${allocationType === opt.value ? opt.color : border}`,
                  background:
                    allocationType === opt.value
                      ? `${opt.color}18`
                      : "transparent",
                  color: allocationType === opt.value ? opt.color : textClr,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {allocationType === "fixed" ? (
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                color: muted,
                fontSize: "0.72rem",
                fontWeight: 600,
                marginBottom: 8,
                display: "block",
              }}
            >
              {t("amount_per_trade_usdt")}
            </label>
            <input
              type="number"
              value={allocationAmount}
              onChange={(e) =>
                setAllocationAmount(parseFloat(e.target.value) || 0)
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${border}`,
                background: inputBg,
                color: textClr,
                fontSize: "0.9rem",
                boxSizing: "border-box",
              }}
            />
            <div style={{ color: muted, fontSize: "0.68rem", marginTop: 4 }}>
              {t("minimum_10_per_trade")}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                color: muted,
                fontSize: "0.72rem",
                fontWeight: 600,
                marginBottom: 8,
                display: "block",
              }}
            >
              {t("percentage_of_balance_label")}
            </label>
            <input
              type="number"
              value={allocationPercentage}
              onChange={(e) =>
                setAllocationPercentage(parseFloat(e.target.value) || 0)
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${border}`,
                background: inputBg,
                color: textClr,
                fontSize: "0.9rem",
                boxSizing: "border-box",
              }}
            />
            <div style={{ color: muted, fontSize: "0.68rem", marginTop: 4 }}>
              {t("percentage_range_hint")}
            </div>
          </div>
        )}

        {/* Max allocation cap */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.72rem",
              fontWeight: 600,
              marginBottom: 8,
              display: "block",
            }}
          >
            {t("max_allocation_cap")}{" "}
            <span style={{ fontWeight: 400 }}>{t("optional")}</span>
          </label>
          <input
            type="number"
            value={maxAllocation}
            onChange={(e) => setMaxAllocation(parseFloat(e.target.value) || 0)}
            placeholder="0 = no cap"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${border}`,
              background: inputBg,
              color: textClr,
              fontSize: "0.9rem",
              boxSizing: "border-box",
            }}
          />
          <div style={{ color: muted, fontSize: "0.68rem", marginTop: 4 }}>
            {t("max_allocation_hint")}
          </div>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#f87171",
              fontSize: "0.75rem",
              marginBottom: 12,
              padding: "8px 12px",
              background: "rgba(248,113,113,0.08)",
              borderRadius: 8,
            }}
          >
            <AlertTriangle size={13} /> {error}
          </div>
        )}

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px",
              borderRadius: 10,
              border: `1px solid ${border}`,
              background: "transparent",
              color: textClr,
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg,#34d399,#059669)",
              color: "#fff",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              fontSize: "0.85rem",
            }}
          >
            {loading ? t("saving_dots") : t("save_changes")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Page
export default function CopyTradingPage() {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [traders, setTraders] = useState([]);
  const [stats, setStats] = useState(null);
  const [followed, setFollowed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("totalFollowers");

  // modals
  const [followTarget, setFollowTarget] = useState(null); // trader obj
  const [adjustTarget, setAdjustTarget] = useState(null); // follow obj {copyTrade, trader}
  const [confirmPayload, setConfirmPayload] = useState(null); // { message, onConfirm }

  // toasts
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3200,
    );
  }, []);

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tradersRes, statsRes, followsRes] = await Promise.all([
        api.get(`/copy-trading/traders?sortBy=${sortBy}`),
        api.get("/copy-trading/stats"),
        api.get("/copy-trading/my-follows"),
      ]);
      setTraders(tradersRes.data?.data?.traders || []);
      setStats(statsRes.data?.data);
      setFollowed(followsRes.data?.data?.followedTraders || []);
    } catch (err) {
      showToast(t("failed_to_load_data"), "error");
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Unfollow — uses ConfirmDialog instead of window.confirm
  const handleUnfollow = (traderId, traderName) => {
    setConfirmPayload({
      message: t("unfollow_confirm_message", { traderName }),
      onConfirm: async () => {
        setConfirmPayload(null);
        try {
          await api.post(`/copy-trading/${traderId}/unfollow`);
          showToast(t("unfollowed_success", { traderName }), "success");
          fetchData();
        } catch (err) {
          showToast(
            err.response?.data?.message || t("failed_to_unfollow"),
            "error",
          );
        }
      },
    });
  };

  const sortOptions = [
    { value: "totalFollowers", label: t("most_followed") },
    { value: "winRate", label: t("win_rate") },
    { value: "monthlyProfit", label: t("monthly_profit") },
    { value: "totalReturn", label: t("total_return") },
  ];

  // Find the follow record for a given trader (to pass to AdjustModal)
  const getFollowRecord = (traderId) =>
    followed.find(
      (f) =>
        f.trader?._id === traderId ||
        f.trader?._id?.toString() === traderId?.toString(),
    );

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .spin { animation: spin 1s linear infinite; }
      `}</style>

      <DashboardNav />
      <Toast toasts={toasts} t={t} />

      {/* Follow Modal */}
      {followTarget && (
        <FollowModal
          trader={followTarget}
          onClose={() => setFollowTarget(null)}
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

      {/* Adjust Allocation Modal */}
      {adjustTarget && (
        <AdjustAllocationModal
          follow={adjustTarget}
          onClose={() => setAdjustTarget(null)}
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

      {/* Confirm Dialog */}
      {confirmPayload && (
        <ConfirmDialog
          message={confirmPayload.message}
          onConfirm={confirmPayload.onConfirm}
          onCancel={() => setConfirmPayload(null)}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          t={t}
        />
      )}

      <div style={{ paddingTop: 80, paddingBottom: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          {/* Page header */}
          <div style={{ marginBottom: 28 }}>
            <h1
              style={{
                color: textClr,
                fontWeight: 800,
                fontSize: "1.8rem",
                margin: 0,
              }}
            >
              {t("copy_trading")}
            </h1>
            <p style={{ color: muted, marginTop: 4, fontSize: "0.88rem" }}>
              {t("copy_trading_desc_copy")}
            </p>
          </div>

          {/* Stats */}
          {stats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: 16,
                marginBottom: 32,
              }}
            >
              {[
                {
                  icon: <Wallet size={15} color="#f59e0b" />,
                  label: t("total_invested"),
                  value: `$${stats.totalInvested?.toLocaleString() || 0}`,
                  color: textClr,
                },
                {
                  icon: (
                    <TrendingUp
                      size={15}
                      color={
                        (stats.totalProfit || 0) >= 0 ? "#34d399" : "#f87171"
                      }
                    />
                  ),
                  label: t("total_profit"),
                  value: `${(stats.totalProfit || 0) >= 0 ? "+" : "-"}$${Math.abs(stats.totalProfit || 0).toLocaleString()}`,
                  color: (stats.totalProfit || 0) >= 0 ? "#34d399" : "#f87171",
                },
                {
                  icon: <Users size={15} color="#60a5fa" />,
                  label: t("following"),
                  value: stats.activeFollows || 0,
                  color: textClr,
                },
                {
                  icon: <BarChart3 size={15} color="#a78bfa" />,
                  label: t("win_rate"),
                  value: `${stats.winRate?.toFixed(1) || 0}%`,
                  color: textClr,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: 16,
                    padding: "16px 18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      marginBottom: 6,
                    }}
                  >
                    {s.icon}
                    <span
                      style={{
                        color: muted,
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <div
                    style={{
                      color: s.color,
                      fontSize: "1.25rem",
                      fontWeight: 700,
                    }}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Currently following — compact list */}
          {followed.length > 0 && (
            <div
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 20,
                marginBottom: 32,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: `1px solid ${divLine}`,
                }}
              >
                <h2
                  style={{
                    color: textClr,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {t("currently_following", { count: followed.length })}
                </h2>
              </div>
              {followed.map((f, i) => {
                const ct = f.copyTrade;
                const tr = f.trader;
                return (
                  <div
                    key={ct?._id || i}
                    style={{
                      padding: "14px 20px",
                      borderBottom:
                        i < followed.length - 1
                          ? `1px solid ${divLine}`
                          : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg,#f59e0b,#d97706)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                          }}
                        >
                          {tr?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div
                          style={{
                            color: textClr,
                            fontWeight: 600,
                            fontSize: "0.88rem",
                          }}
                        >
                          {tr?.username}
                        </div>
                        <div
                          style={{
                            color: muted,
                            fontSize: "0.7rem",
                            marginTop: 1,
                          }}
                        >
                          {ct?.allocationType === "fixed"
                            ? t("fixed_per_trade", {
                                amount: ct?.allocationAmount,
                              })
                            : t("percentage_per_trade", {
                                percent: ct?.allocationPercentage,
                              })}
                          {ct?.maxAllocation > 0 &&
                            t("max_cap_suffix", { amount: ct.maxAllocation })}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Stats inline */}
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            color: muted,
                            fontSize: "0.62rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {t("invested_short")}
                        </div>
                        <div
                          style={{
                            color: "#f59e0b",
                            fontWeight: 600,
                            fontSize: "0.82rem",
                          }}
                        >
                          ${ct?.totalInvested?.toFixed(2) || "0.00"}
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            color: muted,
                            fontSize: "0.62rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {t("pnl_short")}
                        </div>
                        <div
                          style={{
                            color:
                              (ct?.totalProfit || 0) >= 0
                                ? "#34d399"
                                : "#f87171",
                            fontWeight: 600,
                            fontSize: "0.82rem",
                          }}
                        >
                          {(ct?.totalProfit || 0) >= 0 ? "+" : ""}$
                          {(ct?.totalProfit || 0).toFixed(2)}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => setAdjustTarget(f)}
                          title="Adjust investment amount"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: `1px solid ${border}`,
                            background: "transparent",
                            color: "#60a5fa",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          <Edit2 size={12} /> {t("adjust")}
                        </button>
                        <button
                          onClick={() => handleUnfollow(tr?._id, tr?.username)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "1px solid rgba(248,113,113,0.3)",
                            background: "rgba(248,113,113,0.06)",
                            color: "#f87171",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          <X size={12} /> {t("unfollow")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sort tabs */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: `1px solid ${sortBy === opt.value ? "#f59e0b" : border}`,
                  background:
                    sortBy === opt.value
                      ? "rgba(245,158,11,0.1)"
                      : "transparent",
                  color: sortBy === opt.value ? "#f59e0b" : muted,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Traders grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <Loader size={32} className="spin" style={{ color: muted }} />
            </div>
          ) : traders.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 60,
                background: cardBg,
                borderRadius: 20,
                border: `1px solid ${border}`,
              }}
            >
              <Users size={48} color={muted} style={{ marginBottom: 16 }} />
              <div style={{ color: textClr, fontWeight: 600 }}>
                {t("no_traders_available")}
              </div>
              <div style={{ color: muted, fontSize: "0.85rem", marginTop: 4 }}>
                {t("check_back_later")}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 20,
              }}
            >
              {traders.map((trader) => {
                const followRecord = getFollowRecord(trader._id);
                const isFollowing = !!followRecord;
                return (
                  <div
                    key={trader._id}
                    style={{
                      background: cardBg,
                      border: `1px solid ${border}`,
                      borderRadius: 20,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ padding: 20 }}>
                      {/* Card header */}
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
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg,#f59e0b,#d97706)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span
                              style={{
                                color: "#fff",
                                fontSize: "1.2rem",
                                fontWeight: 700,
                              }}
                            >
                              {trader.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <span
                                style={{
                                  color: textClr,
                                  fontWeight: 700,
                                  fontSize: "1rem",
                                }}
                              >
                                {trader.username}
                              </span>
                              {trader.isVerified && (
                                <Shield size={12} color="#60a5fa" />
                              )}
                            </div>
                            <div style={{ color: muted, fontSize: "0.7rem" }}>
                              {trader.user?.firstName} {trader.user?.lastName}
                            </div>
                          </div>
                        </div>
                        {trader.subscriptionFee > 0 && (
                          <div
                            style={{
                              padding: "2px 8px",
                              borderRadius: 12,
                              background: "rgba(245,158,11,0.1)",
                              color: "#f59e0b",
                              fontSize: "0.65rem",
                              fontWeight: 600,
                            }}
                          >
                            ${trader.subscriptionFee}
                            {t("per_month_abbr")}
                          </div>
                        )}
                      </div>

                      {trader.bio && (
                        <p
                          style={{
                            color: muted,
                            fontSize: "0.75rem",
                            marginBottom: 16,
                            lineHeight: 1.45,
                          }}
                        >
                          {trader.bio}
                        </p>
                      )}

                      {/* Stats grid */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 12,
                          marginBottom: 16,
                        }}
                      >
                        {[
                          {
                            label: t("win_rate"),
                            value: `${trader.stats?.winRate?.toFixed(1) || 0}%`,
                            color: "#34d399",
                          },
                          {
                            label: t("followers"),
                            value:
                              trader.stats?.totalFollowers?.toLocaleString() ||
                              0,
                            color: textClr,
                          },
                          {
                            label: t("monthly_profit"),
                            value: `+$${trader.stats?.monthlyProfit?.toLocaleString() || 0}`,
                            color: "#34d399",
                          },
                          {
                            label: t("total_return"),
                            value: `+${trader.stats?.totalReturn?.toFixed(1) || 0}%`,
                            color: "#f59e0b",
                          },
                        ].map((s) => (
                          <div key={s.label}>
                            <div
                              style={{
                                color: muted,
                                fontSize: "0.62rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                              }}
                            >
                              {s.label}
                            </div>
                            <div
                              style={{
                                color: s.color,
                                fontWeight: 700,
                                fontSize: "0.88rem",
                                marginTop: 2,
                              }}
                            >
                              {s.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      {isFollowing ? (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 8,
                          }}
                        >
                          <button
                            onClick={() => setAdjustTarget(followRecord)}
                            style={{
                              padding: "9px",
                              borderRadius: 10,
                              border: `1px solid rgba(96,165,250,0.4)`,
                              background: "rgba(96,165,250,0.08)",
                              color: "#60a5fa",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              fontSize: "0.8rem",
                              fontWeight: 600,
                            }}
                          >
                            <Edit2 size={13} /> {t("adjust")}
                          </button>
                          <button
                            onClick={() =>
                              handleUnfollow(trader._id, trader.username)
                            }
                            style={{
                              padding: "9px",
                              borderRadius: 10,
                              border: `1px solid ${border}`,
                              background: "transparent",
                              color: muted,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              fontSize: "0.8rem",
                            }}
                          >
                            <CheckCircle size={13} color="#34d399" />{" "}
                            {t("following")}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setFollowTarget(trader)}
                          style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: 10,
                            border: "none",
                            background:
                              "linear-gradient(135deg,#f59e0b,#d97706)",
                            color: "#fff",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            fontSize: "0.85rem",
                          }}
                        >
                          <UserPlus size={14} /> {t("follow_trader")}
                        </button>
                      )}
                    </div>

                    {/* Recent trade footer */}
                    {trader.recentTrades?.[0] && (
                      <div
                        style={{
                          padding: "10px 20px",
                          borderTop: `1px solid ${border}`,
                          background: darkMode
                            ? "rgba(0,0,0,0.2)"
                            : "rgba(0,0,0,0.02)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Clock size={11} color={muted} />
                          <span style={{ color: muted, fontSize: "0.62rem" }}>
                            {t("recent_trade")}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: 4,
                          }}
                        >
                          <span
                            style={{
                              color: textClr,
                              fontSize: "0.75rem",
                              fontWeight: 500,
                            }}
                          >
                            {trader.recentTrades[0].symbol} ·{" "}
                            {trader.recentTrades[0].side.toUpperCase()}
                          </span>
                          <span
                            style={{
                              color:
                                trader.recentTrades[0].profit > 0
                                  ? "#34d399"
                                  : "#f87171",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            {trader.recentTrades[0].profit > 0 ? "+" : ""}
                            {trader.recentTrades[0].profitPercent?.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    )}
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
