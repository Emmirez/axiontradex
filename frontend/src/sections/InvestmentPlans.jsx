import React, { useState } from "react";
import { CheckCircle, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next'


export default function InvestmentPlans() {
  const { t } = useTranslation()
  const [billing, setBilling] = useState("monthly");
  const discount = billing === "annual" ? 0.8 : 1;

    const PLANS = [
    {
      id: "basic",
      name: t("basic_plan"),
      price: "$0",
      period: t("free_forever"),
      color: "#94a3b8",
      highlight: false,
      badge: null,
      features: [
        t("basic_features"),
        t("basic_feature2"),
        t("basic_feature3"),
        t("basic_feature4"),
        t("basic_feature5"),
        t("basic_feature6"),
      ],
      locked: [
        t("basic_locked1"),
        t("basic_locked2"),
        t("basic_locked3"),
        t("basic_locked4"),
      ],
    },
    {
      id: "standard",
      name: t("standard_plan"),
      price: "$500",
      period: t("per_month"),
      color: "#60a5fa",
      highlight: false,
      badge: null,
      features: [
        t("standard_features"),
        t("standard_feature2"),
        t("standard_feature3"),
        t("standard_feature4"),
        t("standard_feature5"),
        t("standard_feature6"),
        t("standard_feature7"),
        t("standard_feature8"),
      ],
      locked: [t("standard_locked1"), t("standard_locked2")],
    },
    {
      id: "pro",
      name: t("pro_plan"),
      price: "$1000",
      period: t("per_month"),
      color: "#f59e0b",
      highlight: true,
      badge: t("most_popular"),
      features: [
        t("pro_features"),
        t("pro_feature2"),
        t("pro_feature3"),
        t("pro_feature4"),
        t("pro_feature5"),
        t("pro_feature6"),
        t("pro_feature7"),
        t("pro_feature8"),
        t("pro_feature9"),
      ],
      locked: [],
    },
    {
      id: "elite",
      name: t("elite_plan"),
      price: "$1500",
      period: t("per_month"),
      color: "#34d399",
      highlight: false,
      badge: t("best_value"),
      features: [
        t("elite_features"),
        t("elite_feature2"),
        t("elite_feature3"),
        t("elite_feature4"),
        t("elite_feature5"),
        t("elite_feature6"),
        t("elite_feature7"),
        t("elite_feature8"),
        t("elite_feature9"),
      ],
      locked: [],
    },
    {
      id: "enterprise",
      name: t("enterprise_plan"),
      price: "Custom",
      period: t("contact_us_plan"),
      color: "#a78bfa",
      highlight: false,
      badge: null,
      features: [
        t("enterprise_features"),
        t("enterprise_feature2"),
        t("enterprise_feature3"),
        t("enterprise_feature4"),
        t("enterprise_feature5"),
        t("enterprise_feature6"),
        t("enterprise_feature7"),
        t("enterprise_feature8"),
      ],
      locked: [],
    },
  ];

  const displayPrice = (price) => {
    if (price === "$0" || price === "Custom") return price;
    const num = parseFloat(price.replace("$", ""));
    const final = Math.round(num * discount);
    return `$${final}`;
  };

  return (
    <section id="plans" className="section-base py-20 lg:py-28 fade-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10">
          <p className="text-yellow-500 text-xs font-semibold mb-3 uppercase tracking-widest">
             {t("investment_plans")}
          </p>
          <h2
            className="font-display font-extrabold text-white mb-4"
            style={{ fontSize: "clamp(2rem,5vw,3.2rem)" }}
          >
            {t("simple_transparent_pricing")} <span className="gold-text">{t("pricing")}</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
           {t("pricing_subtitle")}
          </p>

          {/* Billing toggle */}
          <div
            className="inline-flex items-center gap-0 p-1 rounded-full card"
            style={{ borderColor: "rgba(245,158,11,0.2)" }}
          >
            {["monthly", "annual"].map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all capitalize"
                style={{
                  background:
                    billing === b
                      ? "linear-gradient(135deg,#d97706,#f59e0b,#b45309)"
                      : "transparent",
                  color: billing === b ? "#020617" : "#94a3b8",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {t(b)}{" "}
                {b === "annual" && (
                  <span
                    style={{
                      color: billing === "annual" ? "#020617" : "#34d399",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                    }}
                  >
                    -20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="card rounded-3xl flex flex-col transition-all duration-300 relative overflow-hidden"
              style={{
                borderColor: plan.highlight
                  ? plan.color + "88"
                  : "rgba(245,158,11,0.14)",
                transform: plan.highlight ? "scale(1.03)" : "none",
                boxShadow: plan.highlight
                  ? `0 12px 40px rgba(245,158,11,0.2)`
                  : "none",
                zIndex: plan.highlight ? 2 : 1,
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className="text-center py-1.5 text-xs font-bold uppercase tracking-wider"
                  style={{
                    background: plan.highlight
                      ? "#f59e0b"
                      : "rgba(52,211,153,0.2)",
                    color: plan.highlight ? "#020617" : "#34d399",
                  }}
                >
                  {plan.badge}
                </div>
              )}

              <div className="p-5 flex flex-col flex-1">
                {/* Plan name */}
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: plan.color }}
                >
                  {plan.name}
                </div>

                {/* Price */}
                <div className="mb-1">
                  <span
                    className="font-display font-black text-white"
                    style={{ fontSize: "2rem" }}
                  >
                    {displayPrice(plan.price)}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="text-slate-500 text-xs ml-1">
                      /{plan.period.replace("per ", "")}
                    </span>
                  )}
                </div>
                <div className="text-slate-500 text-xs mb-5">
                  {billing === "annual" &&
                  plan.price !== "$0" &&
                  plan.price !== "Custom"
                    ? t("billed_annually")
                    : plan.period}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-xs text-slate-300"
                    >
                      <CheckCircle
                        className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                        style={{ color: plan.color }}
                      />
                      {f}
                    </li>
                  ))}
                  {plan.locked.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-xs text-slate-600 line-through"
                    >
                      <CheckCircle
                        className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-30"
                        style={{ color: "#475569" }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.id === "enterprise" ? (
                  <Link
                    to="/contact"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: "rgba(167,139,250,0.15)",
                      color: "#a78bfa",
                      border: "1px solid rgba(167,139,250,0.3)",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(167,139,250,0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(167,139,250,0.15)";
                    }}
                  >
                    {t("contact_sales")} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : plan.highlight ? (
                  <Link
                    to="/register"
                    className="gold-btn flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
                    style={{ textDecoration: "none" }}
                  >
                    <Zap className="w-3.5 h-3.5" /> {t("get_started")}
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: "transparent",
                      color: plan.color,
                      border: `1px solid ${plan.color}44`,
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = plan.color + "18";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {plan.id === "basic" ? t("start_free") : t("choose_plan")}{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <p className="text-center text-slate-600 text-xs mt-8">
           {t("pricing_footnote")}{" "}
          <Link to="/contact" className="text-yellow-500 hover:text-yellow-400">
            {t("contact_footnote")}
          </Link>{" "}
          {t("currency_footnote")}
        </p>
      </div>
    </section>
  );
}
