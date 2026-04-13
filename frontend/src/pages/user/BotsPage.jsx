// frontend/src/pages/user/BotsPage.jsx
import React, { useState, useEffect } from "react";
import {
  Bot,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Zap,
  Grid,
  ArrowDownUp,
  LineChart,
  Shield,
  AlertTriangle,
  CheckCircle,
  X,
  Loader,
  Play,
  Wallet,
  Activity,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import { useTranslation } from "react-i18next";
import api from "../../services/apiService";

const STRATEGY_CONFIG = {
  grid: {
    label: "Grid",
    icon: Grid,
    color: "#60a5fa",
    desc: "Buys and sells at preset intervals in a price range",
  },
  dca: {
    label: "DCA",
    icon: ArrowDownUp,
    color: "#34d399",
    desc: "Dollar cost averaging — spreads investment over time",
  },
  trend_follow: {
    label: "Trend Follow",
    icon: LineChart,
    color: "#a78bfa",
    desc: "Follows market momentum to ride trends",
  },
  scalping: {
    label: "Scalping",
    icon: Zap,
    color: "#f59e0b",
    desc: "Executes rapid trades to capture small price moves",
  },
};

const RISK_CONFIG = {
  Low: { color: "#34d399", bg: "rgba(52,211,153,0.1)", icon: Shield },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: AlertTriangle },
  High: { color: "#f87171", bg: "rgba(248,113,113,0.1)", icon: AlertTriangle },
};

function SubscribeModal({
  bot,
  onClose,
  onSuccess,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  inputBg,
  showToast,
}) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(bot.minDeposit || 100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (amount < bot.minDeposit) {
      setError(`${t("minimum_allocation")} is $${bot.minDeposit}`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/bots/subscribe", {
        botId: bot._id,
        allocationAmount: amount,
      });
      showToast(`${t("subscribed_to")} ${bot.name}!`, "success");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || t("failed_to_subscribe"));
    } finally {
      setLoading(false);
    }
  };

  const strategy = STRATEGY_CONFIG[bot.strategy];
  const risk = RISK_CONFIG[bot.riskLevel];
  const totalCost = amount + (bot.monthlyFee || 0);

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
          maxWidth: 440,
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
            {t("activate")} {bot.name}
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

        {/* Bot summary */}
        <div
          style={{
            background: darkMode
              ? "rgba(255,255,255,0.03)"
              : "rgba(0,0,0,0.02)",
            borderRadius: 14,
            padding: 14,
            marginBottom: 20,
            border: `1px solid ${border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: `${strategy.color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <strategy.icon size={16} color={strategy.color} />
            </div>
            <div>
              <div style={{ color: textClr, fontWeight: 700 }}>{bot.name}</div>
              <div style={{ color: muted, fontSize: "0.7rem" }}>
                {strategy.label} {t("strategy")}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#34d399", fontWeight: 700 }}>
                {bot.stats?.winRate?.toFixed(1) || 0}%
              </div>
              <div style={{ color: muted, fontSize: "0.65rem" }}>
                {t("win_rate")}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#f59e0b", fontWeight: 700 }}>
                +{bot.stats?.totalReturn?.toFixed(1) || 0}%
              </div>
              <div style={{ color: muted, fontSize: "0.65rem" }}>
                {t("total_return")}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: risk.color, fontWeight: 700 }}>
                {bot.riskLevel}
              </div>
              <div style={{ color: muted, fontSize: "0.65rem" }}>
                {t("risk")}
              </div>
            </div>
          </div>
        </div>

        {/* Allocation */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.75rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 8,
            }}
          >
            {t("allocation_amount_usdt")}
          </label>
          <input
            type="number"
            value={amount}
            min={bot.minDeposit}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 12,
              border: `1px solid ${border}`,
              background: inputBg,
              color: textClr,
              fontSize: "1rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div style={{ color: muted, fontSize: "0.7rem", marginTop: 4 }}>
            {t("minimum")}: ${bot.minDeposit} — {t("per_trade_note")}
          </div>
        </div>

        {/* Cost breakdown */}
        <div
          style={{
            background: darkMode
              ? "rgba(245,158,11,0.05)"
              : "rgba(245,158,11,0.03)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ color: muted, fontSize: "0.8rem" }}>
              {t("allocation_per_trade")}
            </span>
            <span style={{ color: textClr, fontWeight: 600 }}>${amount}</span>
          </div>
          {bot.monthlyFee > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ color: muted, fontSize: "0.8rem" }}>
                {t("monthly_fee")}
              </span>
              <span style={{ color: "#f59e0b", fontWeight: 600 }}>
                ${bot.monthlyFee}
              </span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: `1px solid ${border}`,
              paddingTop: 6,
              marginTop: 6,
            }}
          >
            <span
              style={{ color: textClr, fontSize: "0.8rem", fontWeight: 700 }}
            >
              {t("charged_now")}
            </span>
            <span style={{ color: textClr, fontWeight: 700 }}>
              ${bot.monthlyFee > 0 ? bot.monthlyFee : 0}
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

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "11px",
              borderRadius: 12,
              border: `1px solid ${border}`,
              background: "transparent",
              color: textClr,
              cursor: "pointer",
            }}
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "11px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#f59e0b,#d97706)",
              color: "#fff",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? t("activating") : t("activate_bot")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Unsubscribe Confirmation Modal
function UnsubscribeModal({
  botName,
  onClose,
  onConfirm,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
}) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);

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
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 20,
          width: "100%",
          maxWidth: 400,
          padding: 24,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(248,113,113,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Bot size={24} color="#f87171" />
        </div>
        <h3
          style={{
            color: textClr,
            fontSize: "1.1rem",
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {t("unsubscribe_from_bot")}
        </h3>
        <p style={{ color: muted, fontSize: "0.85rem", marginBottom: 24 }}>
          {t("unsubscribe_confirm_message", { botName })}
        </p>
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
              fontWeight: 600,
            }}
          >
            {t("cancel")}
          </button>
          <button
            onClick={async () => {
              setConfirming(true);
              await onConfirm();
              setConfirming(false);
            }}
            disabled={confirming}
            style={{
              padding: "10px",
              borderRadius: 12,
              border: "none",
              background: "#f87171",
              color: "#fff",
              cursor: confirming ? "not-allowed" : "pointer",
              fontWeight: 600,
              opacity: confirming ? 0.7 : 1,
            }}
          >
            {confirming ? t("unsubscribing") : t("unsubscribe")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BotsPage() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();

  const [bots, setBots] = useState([]);
  const [stats, setStats] = useState(null);
  const [myTrades, setMyTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBot, setSelectedBot] = useState(null);
  const [activeTab, setActiveTab] = useState("bots");
  const [toast, setToast] = useState(null);
  const [unsubscribing, setUnsubscribing] = useState(null);
  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [botsRes, statsRes, tradesRes] = await Promise.all([
        api.get("/bots"),
        api.get("/bots/stats"),
        api.get("/bots/my-trades"),
      ]);
      setBots(botsRes.data?.data?.bots || []);
      setStats(statsRes.data?.data);
      setMyTrades(tradesRes.data?.data?.trades || []);
    } catch (err) {
      showToast(
        err.response?.data?.message || t("failed_to_load_data"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUnsubscribe = (botId) => {
    setUnsubscribing(botId);
  };

  const confirmUnsubscribe = async (botId) => {
    try {
      await api.post(`/bots/${botId}/unsubscribe`);
      showToast(t("unsubscribed_from_bot"), "success");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || t("failed"), "error");
    } finally {
      setUnsubscribing(null);
    }
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <style>{`
        @keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: 12,
            background:
              toast.type === "error"
                ? "rgba(248,113,113,0.95)"
                : "rgba(52,211,153,0.95)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.85rem",
            animation: "toastIn 0.25s ease",
          }}
        >
          {toast.msg}
        </div>
      )}

      {selectedBot && (
        <SubscribeModal
          bot={selectedBot}
          onClose={() => setSelectedBot(null)}
          onSuccess={fetchData}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
          showToast={showToast}
        />
      )}

      {/* Unsubscribe Confirmation Modal */}
      {unsubscribing && (
        <UnsubscribeModal
          botName={bots.find((b) => b._id === unsubscribing)?.name || ""}
          onClose={() => setUnsubscribing(null)}
          onConfirm={() => confirmUnsubscribe(unsubscribing)}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
        />
      )}

      <DashboardNav />

      <div style={{ paddingTop: 80, paddingBottom: 100 }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 20px",
            animation: "fadeUp 0.3s ease",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
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
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#f472b6,#a78bfa)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={20} color="#fff" />
              </div>
              {t("ai_trading_bots")}
            </h1>
            <p style={{ color: muted, marginTop: 6, fontSize: "0.9rem" }}>
              {t("bots_page_description")}
            </p>
          </div>

          {/* Stats */}
          {stats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
                gap: 14,
                marginBottom: 28,
              }}
            >
              {[
                {
                  label: t("total_invested"),
                  value: `$${(stats.totalInvested || 0).toFixed(2)}`,
                  color: "#f59e0b",
                  icon: Wallet,
                },
                {
                  label: t("total_profit"),
                  value: `${(stats.totalProfit || 0) >= 0 ? "+" : "-"}$${Math.abs(stats.totalProfit || 0).toFixed(2)}`,
                  color: (stats.totalProfit || 0) >= 0 ? "#34d399" : "#f87171",
                  icon: TrendingUp,
                },
                {
                  label: t("active_bots"),
                  value: stats.activeBots || 0,
                  color: "#f472b6",
                  icon: Bot,
                },
                {
                  label: t("win_rate"),
                  value: `${(stats.winRate || 0).toFixed(1)}%`,
                  color: "#a78bfa",
                  icon: BarChart3,
                },
              ].map(({ label, value, color, icon: Icon }) => (
                <div
                  key={label}
                  style={{
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: 16,
                    padding: 16,
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
                    <Icon size={15} color={color} />
                    <span style={{ color: muted, fontSize: "0.7rem" }}>
                      {label}
                    </span>
                  </div>
                  <div style={{ color, fontSize: "1.3rem", fontWeight: 800 }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 24,
              background: darkMode
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.04)",
              borderRadius: 12,
              padding: 4,
              width: "fit-content",
            }}
          >
            {[
              { key: "bots", label: t("all_bots") },
              { key: "my", label: t("my_bots") },
              { key: "trades", label: t("trade_history") },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background:
                    activeTab === tab.key
                      ? darkMode
                        ? "rgba(245,158,11,0.15)"
                        : "#fff"
                      : "transparent",
                  color: activeTab === tab.key ? "#f59e0b" : muted,
                  fontWeight: activeTab === tab.key ? 700 : 500,
                  fontSize: "0.85rem",
                  boxShadow:
                    activeTab === tab.key
                      ? "0 2px 8px rgba(0,0,0,0.1)"
                      : "none",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* All Bots Tab */}
          {activeTab === "bots" &&
            (loading ? (
              <div style={{ textAlign: "center", padding: 60, color: muted }}>
                <Loader
                  size={32}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              </div>
            ) : bots.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 60,
                  background: cardBg,
                  borderRadius: 20,
                  border: `1px solid ${border}`,
                }}
              >
                <Bot
                  size={48}
                  color={muted}
                  style={{ marginBottom: 16, opacity: 0.4 }}
                />
                <div style={{ color: textClr, fontWeight: 600 }}>
                  {t("no_bots_available")}
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
                  gap: 20,
                }}
              >
                {bots.map((bot) => {
                  const strategy =
                    STRATEGY_CONFIG[bot.strategy] || STRATEGY_CONFIG.grid;
                  const risk = RISK_CONFIG[bot.riskLevel] || RISK_CONFIG.Medium;

                  return (
                    <div
                      key={bot._id}
                      style={{
                        background: cardBg,
                        border: `1px solid ${bot.isSubscribed ? "rgba(245,158,11,0.4)" : border}`,
                        borderRadius: 20,
                        overflow: "hidden",
                        transition: "transform 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-3px)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "translateY(0)")
                      }
                    >
                      <div style={{ padding: 20 }}>
                        {/* Header */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: 14,
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
                                width: 46,
                                height: 46,
                                borderRadius: 14,
                                background: `${strategy.color}18`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <strategy.icon size={20} color={strategy.color} />
                            </div>
                            <div>
                              <div
                                style={{
                                  color: textClr,
                                  fontWeight: 800,
                                  fontSize: "1rem",
                                }}
                              >
                                {bot.name}
                              </div>
                              <div
                                style={{
                                  color: strategy.color,
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                }}
                              >
                                {strategy.label} {t("strategy")}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              gap: 4,
                            }}
                          >
                            {bot.monthlyFee > 0 && (
                              <span
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: 10,
                                  background: "rgba(245,158,11,0.1)",
                                  color: "#f59e0b",
                                  fontSize: "0.65rem",
                                  fontWeight: 700,
                                }}
                              >
                                ${bot.monthlyFee}/mo
                              </span>
                            )}
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: 10,
                                background: risk.bg,
                                color: risk.color,
                                fontSize: "0.65rem",
                                fontWeight: 700,
                              }}
                            >
                              {bot.riskLevel} Risk
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {bot.description && (
                          <p
                            style={{
                              color: muted,
                              fontSize: "0.78rem",
                              marginBottom: 14,
                              lineHeight: 1.5,
                            }}
                          >
                            {bot.description}
                          </p>
                        )}

                        {/* Stats */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: 10,
                            marginBottom: 14,
                          }}
                        >
                          <div
                            style={{
                              textAlign: "center",
                              padding: "8px",
                              background: darkMode
                                ? "rgba(255,255,255,0.03)"
                                : "rgba(0,0,0,0.02)",
                              borderRadius: 10,
                            }}
                          >
                            <div
                              style={{
                                color: "#34d399",
                                fontWeight: 700,
                                fontSize: "0.9rem",
                              }}
                            >
                              {bot.stats?.winRate?.toFixed(1) || 0}%
                            </div>
                            <div style={{ color: muted, fontSize: "0.62rem" }}>
                              {t("win_rate")}
                            </div>
                          </div>
                          <div
                            style={{
                              textAlign: "center",
                              padding: "8px",
                              background: darkMode
                                ? "rgba(255,255,255,0.03)"
                                : "rgba(0,0,0,0.02)",
                              borderRadius: 10,
                            }}
                          >
                            <div
                              style={{
                                color: "#f59e0b",
                                fontWeight: 700,
                                fontSize: "0.9rem",
                              }}
                            >
                              +{bot.stats?.totalReturn?.toFixed(1) || 0}%
                            </div>
                            <div style={{ color: muted, fontSize: "0.62rem" }}>
                              {t("total_return")}
                            </div>
                          </div>
                          <div
                            style={{
                              textAlign: "center",
                              padding: "8px",
                              background: darkMode
                                ? "rgba(255,255,255,0.03)"
                                : "rgba(0,0,0,0.02)",
                              borderRadius: 10,
                            }}
                          >
                            <div
                              style={{
                                color: "#a78bfa",
                                fontWeight: 700,
                                fontSize: "0.9rem",
                              }}
                            >
                              {bot.stats?.totalSubscribers || 0}
                            </div>
                            <div style={{ color: muted, fontSize: "0.62rem" }}>
                              {t("users")}
                            </div>
                          </div>
                        </div>

                        {/* Features */}
                        {bot.features?.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                              marginBottom: 14,
                            }}
                          >
                            {bot.features.slice(0, 3).map((f) => (
                              <span
                                key={f}
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: 20,
                                  background: "rgba(245,158,11,0.08)",
                                  color: "#f59e0b",
                                  fontSize: "0.65rem",
                                }}
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Min deposit */}
                        <div
                          style={{
                            color: muted,
                            fontSize: "0.7rem",
                            marginBottom: 14,
                          }}
                        >
                          {t("min_allocation")}:{" "}
                          <strong style={{ color: textClr }}>
                            ${bot.minDeposit}
                          </strong>
                        </div>

                        {/* Action */}
                        {bot.isSubscribed ? (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr auto",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                padding: "10px 14px",
                                borderRadius: 12,
                                background: "rgba(52,211,153,0.1)",
                                border: "1px solid rgba(52,211,153,0.2)",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <CheckCircle size={14} color="#34d399" />
                              <span
                                style={{
                                  color: "#34d399",
                                  fontWeight: 600,
                                  fontSize: "0.85rem",
                                }}
                              >
                                {t("active")}
                              </span>
                              {bot.mySubscription && (
                                <span
                                  style={{
                                    color: muted,
                                    fontSize: "0.72rem",
                                    marginLeft: "auto",
                                  }}
                                >
                                  +$
                                  {(
                                    bot.mySubscription.totalProfit || 0
                                  ).toFixed(2)}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleUnsubscribe(bot._id)}
                              style={{
                                padding: "10px 14px",
                                borderRadius: 12,
                                border: `1px solid ${border}`,
                                background: "transparent",
                                color: muted,
                                cursor: "pointer",
                                fontSize: "0.75rem",
                              }}
                            >
                              {t("stop")}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedBot(bot)}
                            style={{
                              width: "100%",
                              padding: "11px",
                              borderRadius: 12,
                              border: "none",
                              background:
                                "linear-gradient(135deg,#f472b6,#a78bfa)",
                              color: "#fff",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                            }}
                          >
                            <Play size={14} /> {t("activate_bot")}
                          </button>
                        )}
                      </div>

                      {/* Recent trade */}
                      {bot.recentTrades?.[0] && (
                        <div
                          style={{
                            padding: "12px 20px",
                            borderTop: `1px solid ${border}`,
                            background: darkMode
                              ? "rgba(0,0,0,0.2)"
                              : "rgba(0,0,0,0.02)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ color: muted, fontSize: "0.65rem" }}>
                              Last trade: {bot.recentTrades[0].symbol}{" "}
                              {bot.recentTrades[0].side?.toUpperCase()}
                            </span>
                            <span
                              style={{
                                color:
                                  bot.recentTrades[0].profitPercent >= 0
                                    ? "#34d399"
                                    : "#f87171",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                              }}
                            >
                              {bot.recentTrades[0].profitPercent >= 0
                                ? "+"
                                : ""}
                              {bot.recentTrades[0].profitPercent?.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

          {/* My Bots Tab */}
          {activeTab === "my" && (
            <div>
              {bots.filter((b) => b.isSubscribed).length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 60,
                    background: cardBg,
                    borderRadius: 20,
                    border: `1px solid ${border}`,
                  }}
                >
                  <Bot
                    size={48}
                    color={muted}
                    style={{ marginBottom: 16, opacity: 0.4 }}
                  />
                  <div
                    style={{ color: textClr, fontWeight: 600, marginBottom: 8 }}
                  >
                    {t("no_active_bots")}
                  </div>
                  <button
                    onClick={() => setActiveTab("bots")}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg,#f472b6,#a78bfa)",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {t("browse_bots")}
                  </button>
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {bots
                    .filter((b) => b.isSubscribed)
                    .map((bot) => {
                      const strategy =
                        STRATEGY_CONFIG[bot.strategy] || STRATEGY_CONFIG.grid;
                      const sub = bot.mySubscription;
                      return (
                        <div
                          key={bot._id}
                          style={{
                            background: cardBg,
                            border: `1px solid rgba(245,158,11,0.3)`,
                            borderRadius: 18,
                            padding: 20,
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
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <div
                                style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 12,
                                  background: `${strategy.color}18`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <strategy.icon
                                  size={18}
                                  color={strategy.color}
                                />
                              </div>
                              <div>
                                <div
                                  style={{ color: textClr, fontWeight: 700 }}
                                >
                                  {bot.name}
                                </div>
                                <div
                                  style={{ color: muted, fontSize: "0.72rem" }}
                                >
                                  {strategy.label} • {t("allocation")}: $
                                  {sub?.allocationAmount || 0}/{t("trade")}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 20 }}>
                              <div style={{ textAlign: "center" }}>
                                <div
                                  style={{ color: "#f59e0b", fontWeight: 700 }}
                                >
                                  ${(sub?.totalInvested || 0).toFixed(2)}
                                </div>
                                <div
                                  style={{ color: muted, fontSize: "0.65rem" }}
                                >
                                  {t("trade")}
                                </div>
                              </div>
                              <div style={{ textAlign: "center" }}>
                                <div
                                  style={{
                                    color:
                                      (sub?.totalProfit || 0) >= 0
                                        ? "#34d399"
                                        : "#f87171",
                                    fontWeight: 700,
                                  }}
                                >
                                  {(sub?.totalProfit || 0) >= 0 ? "+" : ""}$
                                  {(sub?.totalProfit || 0).toFixed(2)}
                                </div>
                                <div
                                  style={{ color: muted, fontSize: "0.65rem" }}
                                >
                                  {t("profit")}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Trade History Tab */}
          {activeTab === "trades" && (
            <div
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 18,
                overflow: "hidden",
              }}
            >
              {myTrades.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: muted }}>
                  <Activity
                    size={40}
                    style={{ marginBottom: 12, opacity: 0.4 }}
                  />
                  <div>{t("no_bot_trades_yet")}</div>
                </div>
              ) : (
                myTrades.map((trade, i) => (
                  <div
                    key={trade._id}
                    style={{
                      padding: "14px 20px",
                      borderBottom:
                        i < myTrades.length - 1
                          ? `1px solid ${border}`
                          : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
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
                          background:
                            trade.side === "buy"
                              ? "rgba(52,211,153,0.1)"
                              : "rgba(248,113,113,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          style={{
                            color: trade.side === "buy" ? "#34d399" : "#f87171",
                            fontSize: "0.7rem",
                            fontWeight: 800,
                          }}
                        >
                          {trade.side?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div style={{ color: textClr, fontWeight: 600 }}>
                          {trade.symbol}
                        </div>
                        <div style={{ color: muted, fontSize: "0.68rem" }}>
                          {trade.bot?.name} • {t("entry")} $
                          {trade.entryPrice?.toLocaleString()}
                          {trade.exitPrice &&
                            ` → $${trade.exitPrice?.toLocaleString()}`}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          color:
                            trade.status === "open"
                              ? "#f59e0b"
                              : trade.profit >= 0
                                ? "#34d399"
                                : "#f87171",
                          fontWeight: 700,
                        }}
                      >
                        {trade.status === "open"
                          ? t("open")
                          : `${trade.profit >= 0 ? "+" : ""}$${trade.profit?.toFixed(2)}`}
                      </div>
                      <div style={{ color: muted, fontSize: "0.65rem" }}>
                        {fmtDate(trade.entryAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
