// frontend/src/pages/user/GoldPage.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  ArrowUpRight,
  Wallet,
  BarChart3,
  RefreshCw,
  Clock,
  ArrowRight,
  Loader,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import api from "../../services/apiService";
import { useTranslation } from "react-i18next";

function fmt(n, d = 2) {
  if (!n && n !== 0) return "—";
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Simple SVG sparkline for gold price simulation
function GoldChart({ darkMode, pricePerOz }) {
  const [points, setPoints] = useState(() =>
    Array.from({ length: 30 }, (_, i) => {
      const base = pricePerOz || 2350;
      return base + (Math.random() - 0.5) * base * 0.02;
    }),
  );

  useEffect(() => {
    const t = setInterval(() => {
      setPoints((prev) => {
        const last = prev[prev.length - 1];
        const delta = (Math.random() - 0.48) * last * 0.003;
        return [...prev.slice(1), Math.max(last + delta, 1)];
      });
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 600,
    h = 120;
  const pts = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  const isUp = points[points.length - 1] >= points[0];
  const color = isUp ? "#f59e0b" : "#f87171";
  const fillId = "gold-fill";

  return (
    <div style={{ width: "100%", height: 120, position: "relative" }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${fillId})`} />
      </svg>
    </div>
  );
}

export default function GoldPage() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const [rates, setRates] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [history, setHistory] = useState([]);
  const [rateAge, setRateAge] = useState(0);

  const [tab, setTab] = useState("buy"); // buy | sell
  const [usdtInput, setUsdtInput] = useState("");
  const [gramsInput, setGramsInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [toast, setToast] = useState(null);

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = async () => {
    try {
      const [ratesRes, portRes, histRes] = await Promise.all([
        api.get("/gold/rates"),
        api.get("/gold/portfolio"),
        api.get("/gold/history?limit=10"),
      ]);
      setRates(ratesRes.data?.data);
      setPortfolio(portRes.data?.data);
      setHistory(histRes.data?.data?.trades || []);
      setRateAge(0);
    } catch (err) {
      console.error("[GoldPage] fetch failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Rate age counter
  useEffect(() => {
    const t = setInterval(() => setRateAge((a) => a + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto refresh rates every 60s
  useEffect(() => {
    const t = setInterval(() => {
      api
        .get("/gold/rates")
        .then((r) => {
          setRates(r.data?.data);
          setRateAge(0);
        })
        .catch(() => {});
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  const pricePerGram = rates?.pricePerGram || 0;
  const pricePerOz = rates?.pricePerOz || 0;

  // Live preview
  const gramsForUsdt =
    usdtInput && pricePerGram
      ? ((parseFloat(usdtInput) * 0.995) / pricePerGram).toFixed(6)
      : "0.000000";

  const usdtForGrams =
    gramsInput && pricePerGram
      ? (parseFloat(gramsInput) * pricePerGram * 0.995).toFixed(2)
      : "0.00";

  const handleBuy = async () => {
    const amount = parseFloat(usdtInput);
    if (!amount || amount <= 0)
      return showToast(t("enter_valid_amount"), "error");
    if (amount < 10) return showToast("Minimum is $10 USDT", "error");
    setExecuting(true);
    try {
      const res = await api.post("/gold/buy", { usdtAmount: amount });
      const data = res.data?.data;
      showToast(
        t("bought_gold_success", { grams: data.grams, amount }),
        "success",
      );
      setUsdtInput("");
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || t("buy_failed"), "error");
    } finally {
      setExecuting(false);
    }
  };

  const handleSell = async () => {
    const grams = parseFloat(gramsInput);
    if (!grams || grams <= 0) return showToast(t("enter_valid_grams"), "error");
    setExecuting(true);
    try {
      const res = await api.post("/gold/sell", { grams });
      const data = res.data?.data;
      showToast(
        t("sold_gold_success", { grams, usdtReceived: data.usdtReceived }),
        "success",
      );
      setGramsInput("");
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || t("sell_failed"), "error");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            padding: "11px 24px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: "0.85rem",
            color: "#fff",
            whiteSpace: "nowrap",
            background:
              toast.type === "error"
                ? "rgba(248,113,113,0.95)"
                : "rgba(245,158,11,0.95)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          }}
        >
          {toast.msg}
        </div>
      )}

      <DashboardNav />

      <div
        style={{
          paddingTop: 80,
          paddingBottom: 100,
          animation: "fadeUp 0.3s ease",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
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
              <span style={{ fontSize: "2rem" }}>🥇</span> {t("gold_trading")}
            </h1>
            <p style={{ color: muted, marginTop: 6, fontSize: "0.88rem" }}>
              {t("gold_trading_subtitle")}
            </p>
          </div>

          {/* Live price banner */}
          <div
            style={{
              background:
                "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.05))",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 18,
              padding: "18px 20px",
              marginBottom: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    color: muted,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {t("xau_usd_per_oz")}
                </div>
                <div
                  style={{
                    color: "#f59e0b",
                    fontWeight: 800,
                    fontSize: "1.8rem",
                    fontFamily: "monospace",
                  }}
                >
                  {loading ? "—" : `$${fmt(pricePerOz)}`}
                </div>
              </div>
              <div>
                <div
                  style={{
                    color: muted,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {t("per_gram")}
                </div>
                <div
                  style={{
                    color: textClr,
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    fontFamily: "monospace",
                  }}
                >
                  {loading ? "—" : `$${fmt(pricePerGram, 4)}`}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  color: rateAge > 55 ? "#f87171" : muted,
                  fontSize: "0.7rem",
                }}
              >
                {t("seconds_ago", { seconds: rateAge })}
              </span>
              <button
                onClick={fetchAll}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: muted,
                  display: "flex",
                }}
              >
                <RefreshCw size={14} className={loading ? "spin" : ""} />
              </button>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: "rgba(245,158,11,0.15)",
                  color: "#f59e0b",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                }}
              >
                {rates?.source || t("live_gold")}
              </span>
            </div>
          </div>

          {/* Chart */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "20px",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <span style={{ color: textClr, fontWeight: 700 }}>
                {t("xau_usd_live_chart")}
              </span>
              <span style={{ color: muted, fontSize: "0.72rem" }}>
                {t("simulated_chart_note")}
              </span>
            </div>
            <GoldChart darkMode={darkMode} pricePerOz={pricePerOz} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
              marginBottom: 20,
            }}
          >
            {/* Portfolio card */}
            <div
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>🥇</span>
                <span style={{ color: textClr, fontWeight: 700 }}>
                  {t("my_gold")}
                </span>
              </div>
              {loading ? (
                <div style={{ color: muted, fontSize: "0.85rem" }}>
                  {t("loading_dots")}
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ color: muted, fontSize: "0.7rem" }}>
                      {t("grams_owned")}
                    </div>
                    <div
                      style={{
                        color: "#f59e0b",
                        fontWeight: 800,
                        fontSize: "1.4rem",
                        fontFamily: "monospace",
                      }}
                    >
                      {fmt(portfolio?.gramsOwned || 0, 6)}g
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ color: muted, fontSize: "0.65rem" }}>
                        {t("current_value")}
                      </div>
                      <div style={{ color: textClr, fontWeight: 600 }}>
                        ${fmt(portfolio?.currentValue || 0)}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: muted, fontSize: "0.65rem" }}>
                        {t("invested")}
                      </div>
                      <div style={{ color: textClr, fontWeight: 600 }}>
                        ${fmt(portfolio?.totalInvested || 0)}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: muted, fontSize: "0.65rem" }}>
                        {t("avg_buy_price")}
                      </div>
                      <div style={{ color: textClr, fontWeight: 600 }}>
                        ${fmt(portfolio?.avgBuyPrice || 0, 4)}/g
                      </div>
                    </div>
                    <div>
                      <div style={{ color: muted, fontSize: "0.65rem" }}>
                        {t("unrealised_pnl")}
                      </div>
                      <div
                        style={{
                          color:
                            (portfolio?.totalProfit || 0) >= 0
                              ? "#34d399"
                              : "#f87171",
                          fontWeight: 700,
                        }}
                      >
                        {(portfolio?.totalProfit || 0) >= 0 ? "+" : ""}$
                        {fmt(portfolio?.totalProfit || 0)}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Trade panel */}
            <div
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: 20,
              }}
            >
              {/* Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  marginBottom: 16,
                  background: darkMode
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.04)",
                  borderRadius: 10,
                  padding: 4,
                }}
              >
                {["buy", "sell"].map((tKey) => (
                  <button
                    key={tKey}
                    onClick={() => setTab(tKey)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      background:
                        tab === tKey
                          ? tKey === "buy"
                            ? "rgba(52,211,153,0.15)"
                            : "rgba(248,113,113,0.15)"
                          : "transparent",
                      color:
                        tab === tKey
                          ? tKey === "buy"
                            ? "#34d399"
                            : "#f87171"
                          : muted,
                      fontWeight: tab === tKey ? 700 : 500,
                      fontSize: "0.85rem",
                    }}
                  >
                    {tKey === "buy" ? t("buy_gold") : t("sell_gold")}
                  </button>
                ))}
              </div>

              {tab === "buy" ? (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <label
                      style={{
                        color: muted,
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      {t("usdt_amount")}
                    </label>
                    <input
                      type="number"
                      value={usdtInput}
                      onChange={(e) => setUsdtInput(e.target.value)}
                      placeholder={t("min_10_usdt")}
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
                  </div>
                  <div
                    style={{
                      background: "rgba(245,158,11,0.06)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ color: muted, fontSize: "0.75rem" }}>
                        {t("you_receive")}
                      </span>
                      <span style={{ color: "#f59e0b", fontWeight: 700 }}>
                        {gramsForUsdt}g
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: muted, fontSize: "0.75rem" }}>
                         {t("fee_percent_gold", { percent: 0.5 })}
                      </span>
                      <span style={{ color: muted, fontSize: "0.75rem" }}>
                        $
                        {usdtInput
                          ? (parseFloat(usdtInput) * 0.005).toFixed(4)
                          : "0.0000"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleBuy}
                    disabled={executing || !usdtInput}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: 12,
                      border: "none",
                      fontWeight: 700,
                      cursor: executing ? "not-allowed" : "pointer",
                      opacity: executing ? 0.7 : 1,
                      background: "linear-gradient(135deg,#f59e0b,#d97706)",
                      color: "#020617",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {executing ? (
                      <>
                        <Loader
                          size={14}
                          style={{ animation: "spin 1s linear infinite" }}
                        />{" "}
                        {t("buying_dots")}
                      </>
                    ) : (
                      "🥇" + t("buy_gold")
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <label
                      style={{
                        color: muted,
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      {t("grams_to_sell", {
                        owned: fmt(portfolio?.gramsOwned || 0, 6),
                      })}
                    </label>
                    <input
                      type="number"
                      value={gramsInput}
                      onChange={(e) => setGramsInput(e.target.value)}
                      placeholder="0.000000"
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
                    <button
                      onClick={() =>
                        setGramsInput((portfolio?.gramsOwned || 0).toFixed(6))
                      }
                      style={{
                        marginTop: 4,
                        background: "none",
                        border: "none",
                        color: "#f87171",
                        fontSize: "0.7rem",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      {t("sell_all")}
                    </button>
                  </div>
                  <div
                    style={{
                      background: "rgba(248,113,113,0.06)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ color: muted, fontSize: "0.75rem" }}>
                        {t("you_receive")}
                      </span>
                      <span style={{ color: "#34d399", fontWeight: 700 }}>
                        ${usdtForGrams} USDT
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: muted, fontSize: "0.75rem" }}>
                        {t("fee_percent_gold", { percent: 0.5 })}
                      </span>
                      <span style={{ color: muted, fontSize: "0.75rem" }}>
                        $
                        {gramsInput
                          ? (
                              parseFloat(gramsInput) *
                              pricePerGram *
                              0.005
                            ).toFixed(4)
                          : "0.0000"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSell}
                    disabled={executing || !gramsInput}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: 12,
                      border: "none",
                      fontWeight: 700,
                      cursor: executing ? "not-allowed" : "pointer",
                      opacity: executing ? 0.7 : 1,
                      background: "linear-gradient(135deg,#f87171,#ef4444)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {executing ? (
                      <>
                        <Loader
                          size={14}
                          style={{ animation: "spin 1s linear infinite" }}
                        />{" "}
                        {t("selling_dots")}
                      </>
                    ) : (
                      t("sell_gold")
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Trade history */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: `1px solid ${divLine}`,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Clock size={13} color={muted} />
              <span
                style={{ color: textClr, fontWeight: 700, fontSize: "0.9rem" }}
              >
                {t("gold_trade_history")}
              </span>
            </div>

            {history.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: muted }}>
                {t("no_gold_trades")}
              </div>
            ) : (
              history.map((trade, i) => (
                <div
                  key={trade._id}
                  style={{
                    padding: "13px 20px",
                    borderBottom:
                      i < history.length - 1 ? `1px solid ${divLine}` : "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
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
                            ? "rgba(245,158,11,0.1)"
                            : "rgba(248,113,113,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1rem",
                      }}
                    >
                      {trade.side === "buy" ? "🥇" : "💰"}
                    </div>
                    <div>
                      <div
                        style={{
                          color: textClr,
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        {trade.side === "buy" ? t("bought") : t("sold")}{" "}
                        {fmt(trade.quantity, 6)}g XAU
                      </div>
                      <div style={{ color: muted, fontSize: "0.68rem" }}>
                        ${fmt(trade.filledPrice, 4)}/g ·{" "}
                        {fmtDate(trade.filledAt)}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        color: trade.side === "buy" ? "#f59e0b" : "#34d399",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      {trade.side === "buy" ? "-" : "+"}${fmt(trade.total)}
                    </div>
                    {trade.pnl !== 0 && trade.side === "sell" && (
                      <div
                        style={{
                          color: trade.pnl >= 0 ? "#34d399" : "#f87171",
                          fontSize: "0.68rem",
                        }}
                      >
                        {trade.pnl >= 0 ? "+" : ""}${fmt(trade.pnl)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
