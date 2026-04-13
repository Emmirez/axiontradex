import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Shield,
  Globe,
  Zap,
  BarChart3,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import {
  FeaturePage,
  FeatureHero,
  StatCard,
  FeatureCard,
  CTABanner,
} from "../features/FeatureLayout";

//  Toast Notification System

const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.25)",
  },
  error: {
    icon: AlertCircle,
    color: "#f87171",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.25)",
  },
  info: {
    icon: Info,
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
    border: "rgba(96,165,250,0.25)",
  },
  gold: {
    icon: Coins,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
  },
};

function Toast({ id, type = "info", title, message, onClose }) {
  const { t } = useTranslation();
  const {
    icon: Icon,
    color,
    bg,
    border,
  } = TOAST_TYPES[type] || TOAST_TYPES.info;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const t1 = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 4.5s
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(id), 350);
    }, 4500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [id, onClose]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        background: "rgba(2,6,23,0.92)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${border}`,
        borderRadius: 16,
        padding: "14px 16px",
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${border}`,
        minWidth: 300,
        maxWidth: 380,
        transform: visible
          ? "translateX(0) scale(1)"
          : "translateX(120%) scale(0.95)",
        opacity: visible ? 1 : 0,
        transition:
          "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 2,
          background: color,
          borderRadius: "0 0 0 16px",
          animation: visible ? "toastProgress 4.5s linear forwards" : "none",
        }}
      />
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          flexShrink: 0,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon style={{ width: 18, height: 18, color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div
            style={{
              color: "#f1f5f9",
              fontWeight: 700,
              fontSize: "0.875rem",
              marginBottom: 3,
            }}
          >
            {title}
          </div>
        )}
        {message && (
          <div
            style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.5 }}
          >
            {message}
          </div>
        )}
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onClose(id), 350);
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 2,
          color: "#475569",
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        <X style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: "all" }}>
          <Toast {...t} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-4), { id, ...opts }]);
    return id;
  }, []);

  return { toasts, toast, dismiss };
}

//  Main Component
export default function Gold() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const { toasts, toast, dismiss } = useToast();

  const [price, setPrice] = useState(2342.5);
  const [change, setChange] = useState(12.3);
  const [pct, setPct] = useState(0.53);
  const [up, setUp] = useState(true);
  const [flash, setFlash] = useState(null);
  const [bars, setBars] = useState(() =>
    Array.from({ length: 30 }, (_, i) => 2280 + Math.random() * 60 + i * 2),
  );
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = localStorage.getItem("token") || false;

  const HISTORY = [
    { period: t("one_week"), return: "+1.8%", up: true },
    { period: t("one_month"), return: "+4.2%", up: true },
    { period: t("three_months"), return: "+9.7%", up: true },
    { period: t("six_months"), return: "+14.3%", up: true },
    { period: t("one_year_short"), return: "+22.8%", up: true },
    { period: t("three_years_short"), return: "+61.4%", up: true },
    { period: t("five_years_short"), return: "+89.2%", up: true },
    { period: t("ytd"), return: "+8.1%", up: true },
  ];

  const FAQS = [
    { q: t("gold_physically_backed_q"), a: t("gold_physically_backed_a") },
    { q: t("gold_physical_delivery_q"), a: t("gold_physical_delivery_a") },
    { q: t("gold_price_set_q"), a: t("gold_price_set_a") },
    { q: t("gold_storage_fees_q"), a: t("gold_storage_fees_a") },
    { q: t("gold_min_investment_q"), a: t("gold_min_investment_a") },
  ];

  const FEATURES = [
    {
      icon: Shield,
      title: t("gold_feature_insured_vaults"),
      desc: t("gold_feature_insured_vaults_desc"),
    },
    {
      icon: Globe,
      title: t("gold_feature_global_delivery"),
      desc: t("gold_feature_global_delivery_desc"),
    },
    {
      icon: Zap,
      title: t("gold_feature_instant_liquidity"),
      desc: t("gold_feature_instant_liquidity_desc"),
    },
    {
      icon: BarChart3,
      title: t("gold_feature_fractional_ownership"),
      desc: t("gold_feature_fractional_ownership_desc"),
    },
    {
      icon: Coins,
      title: t("gold_feature_zero_custody_fees"),
      desc: t("gold_feature_zero_custody_fees_desc"),
    },
    {
      icon: TrendingUp,
      title: t("gold_feature_inflation_hedge"),
      desc: t("gold_feature_inflation_hedge_desc"),
    },
  ];

  useEffect(() => {
    const iv = setInterval(() => {
      setPrice((p) => {
        const delta = (Math.random() - 0.48) * 3.5;
        const next = parseFloat((p + delta).toFixed(2));
        const diff = parseFloat((next - 2330.2).toFixed(2));
        const pctV = parseFloat((((next - 2330.2) / 2330.2) * 100).toFixed(2));
        setUp(diff >= 0);
        setChange(Math.abs(diff));
        setPct(Math.abs(pctV));
        setFlash(next > p ? "up" : "down");
        setTimeout(() => setFlash(null), 600);
        setBars((b) => [...b.slice(1), next]);
        return next;
      });
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  const handleTrade = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        type: "error",
        title: "Invalid Amount",
        message: "Please enter a valid amount greater than $0.",
      });
      return;
    }

    if (!isLoggedIn) {
      localStorage.setItem("redirectAfterLogin", "/gold");
      localStorage.setItem(
        "intendedTrade",
        JSON.stringify({ side, amount, price, asset: "Gold" }),
      );
      toast({
        type: "info",
        title: "Login Required",
        message: "Redirecting you to login to complete your trade...",
      });
      setTimeout(() => navigate("/login"), 1200);
      return;
    }

    // Simulate trade execution
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const grams = ((parseFloat(amount) / price) * 31.1035).toFixed(4);
      toast({
        type: "gold",
        title: `${side === "buy" ? "↑ Buy" : "↓ Sell"} Order Executed`,
        message: `$${parseFloat(amount).toLocaleString()} · ${price.toFixed(2)}/oz · ${grams}g gold`,
      });
      setAmount("");
    }, 800);
  };

  const grams = amount
    ? ((parseFloat(amount) / price) * 31.1035).toFixed(4)
    : "";
  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const inputBg = darkMode ? "rgba(15,23,42,0.6)" : "rgba(248,250,252,0.9)";
  const border = "rgba(245,158,11,0.18)";
  const minB = Math.min(...bars),
    maxB = Math.max(...bars);

  const STATS = [
    {
      value: `$${price.toFixed(0)}`,
      label: t("spot_price_per_oz"),
      icon: Coins,
      color: "#f59e0b",
    },
    {
      value: "+22.8%",
      label: t("one_year_return"),
      icon: TrendingUp,
      color: "#34d399",
    },
    {
      value: "5K+",
      label: t("active_gold_holders"),
      icon: Globe,
      color: "#60a5fa",
    },
    { value: "0%", label: t("custody_fees"), icon: Shield, color: "#a78bfa" },
  ];

  return (
    <FeaturePage>
      <FeatureHero
        badge={t("gold")}
        title={t("trade_gold")}
        highlight={t("digitally")}
        subtitle={t("gold_subtitle_desc")}
        icon={Coins}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Price + Chart + Form */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            marginBottom: 48,
          }}
        >
          {/* Live price & chart */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(245,158,11,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Coins style={{ width: 22, height: 22, color: "#f59e0b" }} />
                </div>
                <div>
                  <div style={{ color: textClr, fontWeight: 700 }}>
                    Gold / USD
                  </div>
                  <div style={{ color: mutedClr, fontSize: "0.75rem" }}>
                    XAU/USD · Troy Ounce
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 800,
                    fontSize: "1.8rem",
                    color:
                      flash === "up"
                        ? "#34d399"
                        : flash === "down"
                          ? "#f87171"
                          : textClr,
                    transition: "color 0.3s",
                  }}
                >
                  $
                  {price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    justifyContent: "flex-end",
                  }}
                >
                  {up ? (
                    <TrendingUp
                      style={{ width: 13, height: 13, color: "#34d399" }}
                    />
                  ) : (
                    <TrendingDown
                      style={{ width: 13, height: 13, color: "#f87171" }}
                    />
                  )}
                  <span
                    style={{
                      color: up ? "#34d399" : "#f87171",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {up ? "+" : "-"}${change.toFixed(2)} ({up ? "+" : "-"}
                    {pct.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Bar chart */}
            <div
              style={{
                height: 80,
                display: "flex",
                alignItems: "flex-end",
                gap: 2,
              }}
            >
              {bars.map((b, i) => {
                const h = ((b - minB) / (maxB - minB || 1)) * 70 + 10;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h}px`,
                      borderRadius: 3,
                      background:
                        i === bars.length - 1
                          ? "#f59e0b"
                          : darkMode
                            ? "rgba(245,158,11,0.25)"
                            : "rgba(245,158,11,0.4)",
                      transition: "height 0.4s ease",
                    }}
                  />
                );
              })}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <span style={{ color: mutedClr, fontSize: "0.68rem" }}>
                 {t("thirty_ticks")}
              </span>
              <span style={{ color: mutedClr, fontSize: "0.68rem" }}>
                {t("live_updates")}
              </span>
            </div>
          </div>

          {/* Buy/Sell form */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "24px",
            }}
          >
            <h3
              style={{
                color: textClr,
                fontWeight: 700,
                fontSize: "1.05rem",
                marginBottom: 18,
                fontFamily: '"Playfair Display",serif',
              }}
            >
              {t("trade_gold_title")}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 18,
              }}
            >
              {["buy", "sell"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  style={{
                    padding: "10px",
                    borderRadius: 12,
                    border: `1px solid ${side === s ? (s === "buy" ? "rgba(52,211,153,0.5)" : "rgba(239,68,68,0.5)") : border}`,
                    background:
                      side === s
                        ? s === "buy"
                          ? "rgba(52,211,153,0.15)"
                          : "rgba(239,68,68,0.15)"
                        : "transparent",
                    color:
                      side === s
                        ? s === "buy"
                          ? "#34d399"
                          : "#f87171"
                        : mutedClr,
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {s === "buy" ? "↑ Buy" : "↓ Sell"}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  color: mutedClr,
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                  {t("amount_usd")}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width: "100%",
                  background: inputBg,
                  border: `1px solid ${border}`,
                  borderRadius: 12,
                  padding: "11px 14px",
                  color: textClr,
                  fontSize: "0.95rem",
                  outline: "none",
                  fontFamily: "monospace",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#f59e0b";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = border;
                }}
              />
            </div>
            {grams && (
              <div
                style={{
                  background: "rgba(245,158,11,0.07)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  marginBottom: 14,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ color: mutedClr, fontSize: "0.8rem" }}>
                  {t("you_receive")}
                </span>
                <span
                  style={{
                    color: "#f59e0b",
                    fontWeight: 700,
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                  }}
                >
                  {grams}g gold
                </span>
              </div>
            )}
            <button
              onClick={handleTrade}
              disabled={loading}
              className="gold-btn"
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 14,
                border: "none",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid #020617",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.6s linear infinite",
                    }}
                  />{" "}
                  {t("processing")}
                </>
              ) : side === "buy" ? (
                "↑ Buy Gold"
              ) : (
                "↓ Sell Gold"
              )}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p
              style={{
                color: mutedClr,
                fontSize: "0.72rem",
                textAlign: "center",
                marginTop: 10,
              }}
            >
               {t("gold_trade_footer")}
            </p>
          </div>
        </div>

        {/* Historical returns */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 6,
          }}
        >
          {t("historical_returns")} <span className="gold-text">{t("returns")}</span>
        </h2>
        <p style={{ color: mutedClr, fontSize: "0.875rem", marginBottom: 20 }}>
          {t("gold_performance_desc")}
        </p>
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            overflow: "auto",
            marginBottom: 48,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              minWidth: 600,
            }}
          >
            {HISTORY.map((h, i) => (
              <div
                key={h.period}
                style={{
                  padding: "20px 12px",
                  textAlign: "center",
                  borderRight:
                    i < HISTORY.length - 1
                      ? `1px solid ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`
                      : "none",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(245,158,11,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  style={{
                    color: mutedClr,
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {h.period}
                </div>
                <div
                  style={{
                    color: h.up ? "#34d399" : "#f87171",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                  }}
                >
                  {h.return}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 20,
          }}
        >
          {t("why_gold_on")} <span className="gold-text">AxionTrade</span>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>

        {/* FAQ */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 20,
          }}
        >
           {t("frequently_asked_questions")} <span className="gold-text">{t("questions")}</span>
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 60,
          }}
        >
          {FAQS.map((f, i) => (
            <div
              key={i}
              style={{
                background: cardBg,
                border: `1px solid ${openFaq === i ? "rgba(245,158,11,0.35)" : border}`,
                borderRadius: 16,
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 20px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    color: textClr,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {f.q}
                </span>
                {openFaq === i ? (
                  <ChevronUp
                    style={{
                      width: 16,
                      height: 16,
                      color: "#f59e0b",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <ChevronDown
                    style={{
                      width: 16,
                      height: 16,
                      color: mutedClr,
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
              {openFaq === i && (
                <div
                  style={{
                    padding: "0 20px 18px",
                    color: mutedClr,
                    fontSize: "0.875rem",
                    lineHeight: 1.7,
                  }}
                >
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <CTABanner
         title={t("start_trading_gold_today")}
        subtitle={t("start_trading_gold_subtitle")}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onClose={dismiss} />
    </FeaturePage>
  );
}
