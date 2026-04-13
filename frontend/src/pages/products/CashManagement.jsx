import React, { useState, useEffect } from "react";
import {
  Banknote,
  TrendingUp,
  Shield,
  Zap,
  Lock,
  RefreshCw,
  DollarSign,
  ChevronDown,
  ChevronUp,
  BarChart3,
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

// Page
export default function CashManagement() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();

  const PLANS = [
    {
      name: t("flexible_savings"),
      apy: 6.5,
      min: "$10",
      lock: t("none"),
      currency: "USDT/USDC",
      color: "#34d399",
      desc: t("flexible_savings_desc"),
    },
    {
      name: t("thirty_day_lock"),
      apy: 8.2,
      min: "$100",
      lock: t("thirty_days"),
      currency: "USDT/USDC",
      color: "#60a5fa",
      desc: t("thirty_day_lock_desc"),
    },
    {
      name: t("ninety_day_lock"),
      apy: 10.5,
      min: "$500",
      lock: t("ninety_days"),
      currency: "USDT/USDC",
      color: "#f59e0b",
      desc: t("ninety_day_lock_desc"),
    },
    {
      name: t("premium_vault"),
      apy: 12.0,
      min: "$5,000",
      lock: t("one_eighty_days"),
      currency: "USDT/USDC",
      color: "#a78bfa",
      desc: t("premium_vault_desc"),
    },
  ];

  const HISTORY = [
    { period: t("thirty_days"), return: "0.54%", label: t("flexible_apy") },
    { period: t("sixty_days"), return: "1.35%", label: t("thirty_day_apy") },
    { period: t("ninety_days"), return: "2.60%", label: t("ninety_day_apy") },
    { period: t("one_eighty_days"), return: "5.93%", label: t("premium_apy") },
    { period: t("one_year"), return: "12.0%", label: t("max_annual_yield") },
    { period: t("two_years"), return: "25.4%", label: t("compounded") },
    { period: t("three_years"), return: "40.5%", label: t("compounded") },
    { period: t("five_years"), return: "76.2%", label: t("compounded") },
  ];

  const FAQS = [
    { q: t("yield_generation_question"), a: t("yield_generation_answer") },
    { q: t("money_safety_question"), a: t("money_safety_answer") },
    { q: t("interest_payments_question"), a: t("interest_payments_answer") },
    { q: t("break_lock_question"), a: t("break_lock_answer") },
    {
      q: t("stablecoins_supported_question"),
      a: t("stablecoins_supported_answer"),
    },
  ];

  const FEATURES = [
    {
      icon: TrendingUp,
      title: t("up_to_12_apy"),
      desc: t("up_to_12_apy_desc"),
    },
    {
      icon: Shield,
      title: t("fully_audited"),
      desc: t("fully_audited_desc"),
    },
    {
      icon: Zap,
      title: t("instant_withdrawals_feature"),
      desc: t("instant_withdrawals_desc"),
    },
    {
      icon: Lock,
      title: t("segregated_funds"),
      desc: t("segregated_funds_desc"),
    },
    {
      icon: RefreshCw,
      title: t("auto_compounding"),
      desc: t("auto_compounding_desc"),
    },
    {
      icon: BarChart3,
      title: t("earnings_dashboard"),
      desc: t("earnings_dashboard_desc"),
    },
  ];

  const [selected, setSelected] = useState(0);
  const [amount, setAmount] = useState("");
  const [compound, setCompound] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [earnings, setEarnings] = useState({
    daily: "0.00",
    monthly: "0.00",
    annual: "0.00",
  });

  // Live APY — start from the numeric value in PLANS
  const [liveApys, setLiveApys] = useState(() => PLANS.map((p) => p.apy));

  // Fluctuate APY every 5 seconds
  useEffect(() => {
    const iv = setInterval(() => {
      setLiveApys((prev) =>
        prev.map((a, i) => {
          const noise = (Math.random() - 0.5) * 0.1;
          const min = PLANS[i].apy * 0.95;
          const max = PLANS[i].apy * 1.05;
          return parseFloat(Math.min(max, Math.max(min, a + noise)).toFixed(1));
        }),
      );
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  // Earnings calculator
  useEffect(() => {
    const principal = parseFloat(amount);
    if (!amount || isNaN(principal) || principal <= 0) {
      setEarnings({ daily: "0.00", monthly: "0.00", annual: "0.00" });
      return;
    }
    const apy = (liveApys[selected] ?? PLANS[selected].apy) / 100;
    const daily = compound
      ? principal * (Math.pow(1 + apy / 365, 1) - 1)
      : (principal * apy) / 365;
    const monthly = compound
      ? principal * (Math.pow(1 + apy / 365, 30) - 1)
      : (principal * apy) / 12;
    const annual = compound
      ? principal * (Math.pow(1 + apy, 1) - 1)
      : principal * apy;
    setEarnings({
      daily: daily.toFixed(2),
      monthly: monthly.toFixed(2),
      annual: annual.toFixed(2),
    });
  }, [amount, selected, compound, liveApys]);

  //  Theme
  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const inputBg = darkMode ? "rgba(15,23,42,0.6)" : "rgba(248,250,252,0.9)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const border = "rgba(52,211,153,0.18)";

  const STATS = [
    { value: "12%", label: t("max_apy"), icon: TrendingUp, color: "#34d399" },
    {
      value: "$850M",
      label: t("total_value_locked"),
      icon: Banknote,
      color: "#f59e0b",
    },
    {
      value: "25K+",
      label: t("active_savers"),
      icon: Shield,
      color: "#60a5fa",
    },
    {
      value: t("daily"),
      label: t("interest_payments"),
      icon: RefreshCw,
      color: "#a78bfa",
    },
  ];

  return (
    <FeaturePage>
      <FeatureHero
       badge={t("cash_management")}
        title={t("make_your_cash")}
        highlight={t("work_harder")}
        subtitle={t("cash_management_subtitle")}
        icon={Banknote}
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

        {/* Plan cards */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 6,
          }}
        >
          {t("yield_plans")} <span className="gold-text">{t("plans")}</span>
        </h2>
        <p style={{ color: mutedClr, fontSize: "0.875rem", marginBottom: 20 }}>
          {t("choose_plan_subtitle")}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              onClick={() => setSelected(i)}
              style={{
                background: cardBg,
                border: `2px solid ${selected === i ? plan.color : border}`,
                borderRadius: 20,
                padding: "22px",
                cursor: "pointer",
                transition: "all 0.3s",
                transform: selected === i ? "translateY(-4px)" : "none",
                boxShadow:
                  selected === i ? "0 8px 30px rgba(0,0,0,0.15)" : "none",
              }}
            >
              <div
                style={{
                  color: plan.color,
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                {plan.name}
              </div>

              {/* APY display — fontFamily only once */}
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "2.2rem",
                  fontWeight: 900,
                  color: plan.color,
                  marginBottom: 4,
                }}
              >
                {(liveApys[i] ?? plan.apy).toFixed(1)}%
              </div>

              <div
                style={{
                  color: mutedClr,
                  fontSize: "0.72rem",
                  marginBottom: 14,
                }}
              >
                APY · {plan.currency}
              </div>
              <p
                style={{
                  color: mutedClr,
                  fontSize: "0.8rem",
                  lineHeight: 1.5,
                  marginBottom: 14,
                }}
              >
                {plan.desc}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  [t("min_deposit"), plan.min],
                  [t("lock_period"), plan.lock],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: mutedClr, fontSize: "0.78rem" }}>
                      {label}
                    </span>
                    <span
                      style={{
                        color: textClr,
                        fontWeight: 600,
                        fontSize: "0.78rem",
                      }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Calculator + Live Rates */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
            marginBottom: 48,
          }}
        >
          {/* Earnings calculator */}
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
                marginBottom: 4,
                fontFamily: '"Playfair Display",serif',
              }}
            >
              {t("earnings_calculator")}
            </h3>
            <p
              style={{ color: mutedClr, fontSize: "0.78rem", marginBottom: 20 }}
            >
              Using:{" "}
              <span style={{ color: PLANS[selected].color, fontWeight: 600 }}>
                {PLANS[selected].name}
              </span>{" "}
              {t("at")} {(liveApys[selected] ?? PLANS[selected].apy).toFixed(1)}
              % APY
            </p>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  color: mutedClr,
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {t("deposit_amount_usdt")}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
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
                  e.target.style.borderColor = "#34d399";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = border;
                }}
              />
            </div>

            {/* Compound toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <span style={{ color: mutedClr, fontSize: "0.8rem" }}>
                {t("auto_compound_interest")}
              </span>
              <button
                onClick={() => setCompound((c) => !c)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: compound
                    ? "#34d399"
                    : darkMode
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#fff",
                    position: "absolute",
                    top: 3,
                    left: compound ? 23 : 3,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }}
                />
              </button>
            </div>

            {/* Results */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {[
                [t("daily"), earnings.daily],
                [t("monthly"), earnings.monthly],
                [t("annual"), earnings.annual],
              ].map(([label, val]) => (
                <div
                  key={label}
                  style={{
                    background: "rgba(52,211,153,0.07)",
                    border: "1px solid rgba(52,211,153,0.15)",
                    borderRadius: 12,
                    padding: "12px 8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: mutedClr,
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 6,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      color: "#34d399",
                      fontFamily: "monospace",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                    }}
                  >
                    ${val}
                  </div>
                </div>
              ))}
            </div>

            <a
              href="/login"
              style={{ textDecoration: "none", display: "block" }}
            >
              <button
                className="gold-btn"
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 14,
                  border: "none",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {t("start_earning_now")}
              </button>
            </a>
          </div>

          {/* Live rates panel */}
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
                marginBottom: 4,
                fontFamily: '"Playfair Display",serif',
              }}
            >
              {t("live_rates")}
            </h3>
            <p
              style={{ color: mutedClr, fontSize: "0.78rem", marginBottom: 20 }}
            >
              {t("live_rates_desc")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {PLANS.map((plan, i) => (
                <div
                  key={plan.name}
                  onClick={() => setSelected(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: darkMode
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.03)",
                    borderRadius: 12,
                    border: `1px solid ${selected === i ? plan.color + "44" : "transparent"}`,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(52,211,153,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = darkMode
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.03)";
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: textClr,
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      {plan.name}
                    </div>
                    <div
                      style={{
                        color: mutedClr,
                        fontSize: "0.72rem",
                        marginTop: 2,
                      }}
                    >
                      Lock: {plan.lock} · Min: {plan.min}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        color: plan.color,
                        fontFamily: "monospace",
                        fontWeight: 800,
                        fontSize: "1.2rem",
                      }}
                    >
                      {(liveApys[i] ?? plan.apy).toFixed(1)}%
                    </div>
                    <div style={{ color: mutedClr, fontSize: "0.68rem" }}>
                      APY
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Historical / projected returns */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 6,
          }}
        >
          {t("projected_earnings")}{" "}
          <span className="gold-text">{t("earnings")}</span>
        </h2>
        <p style={{ color: mutedClr, fontSize: "0.875rem", marginBottom: 20 }}>
          {t("projected_earnings_desc")}
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
                    i < HISTORY.length - 1 ? `1px solid ${divLine}` : "none",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(52,211,153,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  style={{
                    color: mutedClr,
                    fontSize: "0.68rem",
                    fontWeight: 500,
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {h.period}
                </div>
                <div
                  style={{
                    color: "#34d399",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                  }}
                >
                  {h.return}
                </div>
                <div
                  style={{ color: mutedClr, fontSize: "0.65rem", marginTop: 3 }}
                >
                  {h.label}
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
          {t("why_cash_management")}{" "}
          <span className="gold-text">AxionTrade</span>
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
          {t("frequently_asked_questions")}{" "}
          <span className="gold-text">{t("questions")}</span>
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
                border: `1px solid ${openFaq === i ? "rgba(52,211,153,0.35)" : border}`,
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
                      color: "#34d399",
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
        title={t("start_earning_cash_today")}
        subtitle={t("start_earning_cash_subtitle")}
      />
    </FeaturePage>
  );
}
