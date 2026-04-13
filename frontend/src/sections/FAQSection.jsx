import React, { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";



function FAQItem({ faq, isOpen, onToggle, accentColor }) {
  return (
    <div
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        transition: "background 0.2s",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        <span className="text-white font-semibold text-sm leading-relaxed pr-2">
          {faq.q}
        </span>
        {isOpen ? (
          <ChevronUp
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            style={{ color: accentColor }}
          />
        ) : (
          <ChevronDown className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-500" />
        )}
      </button>
      {isOpen && (
        <div className="pb-5 text-slate-400 text-sm leading-relaxed pr-8">
          {faq.a}
        </div>
      )}
    </div>
  );
}

export default function FAQSection() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("general");
  const [openIndex, setOpenIndex] = useState(0);

  const FAQ_CATEGORIES = [
    {
      id: "general",
      label: t("general"),
      color: "#f59e0b",
      faqs: [
        {
          q: t("what_is_axiontrade"),
          a: t("what_is_axiontrade_answer"),
        },
        {
          q: t("is_axiontrade_regulated"),
          a: t("regulated_answer"),
        },
        {
          q: t("which_countries"),
          a: t("which_countries_answer"),
        },
        {
          q: t("minimum_deposit"),
          a: t("minimum_deposit_answer"),
        },
      ],
    },
    {
      id: "trading",
      label: t("trading_faq"),
      color: "#60a5fa",
      faqs: [
        {
          q: t("what_assets_can_i_trade"),
          a: t("what_assets_answer"),
        },
        {
          q: t("order_execution_speed"),
          a: t("order_execution_answer"),
        },
        {
          q: t("trading_fees"),
          a: t("trading_fees_answer"),
        },
        {
          q: t("leverage_trading"),
          a: t("leverage_answer"),
        },
      ],
    },
    {
      id: "security",
      label: t("security_faq"),
      color: "#34d399",
      faqs: [
        {
          q: t("funds_protection"),
          a: t("funds_protection_answer"),
        },
        {
          q: t("hack_protection"),
          a: t("hack_protection_answer"),
        },
        {
          q: t("personal_data_safety"),
          a: t("personal_data_answer"),
        },
        {
          q: t("enable_2fa"),
          a: t("enable_2fa_answer"),
        },
      ],
    },
    {
      id: "payments",
      label: t("payments_faq"),
      color: "#a78bfa",
      faqs: [
        {
          q: t("deposit_funds_how"),
          a: t("deposit_funds_answer"),
        },
        {
          q: t("withdrawals_question"),
          a: t("withdrawals_answer"),
        },
        {
          q: t("withdrawal_fees"),
          a: t("withdrawal_fees_answer"),
        },
        {
          q: t("supported_currencies"),
          a: t("supported_currencies_answer"),
        },
      ],
    },
  ];

  const category = FAQ_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <section id="faq" className="section-base py-20 lg:py-28 fade-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-yellow-500 text-xs font-semibold mb-3 uppercase tracking-widest">
            FAQ
          </p>
          <h2
            className="font-display font-extrabold text-white mb-4"
            style={{ fontSize: "clamp(2rem,5vw,3.2rem)" }}
          >
           {t("frequently_asked_questions")} <span className="gold-text">{t("questions")}</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            {t("faq_header_desc")}{" "}
            <Link
              to="/contact"
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              {t("chat_with_us")}
            </Link>
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setOpenIndex(0);
              }}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background:
                  activeCategory === cat.id ? cat.color + "20" : "transparent",
                color: activeCategory === cat.id ? cat.color : "#64748b",
                border: `1px solid ${activeCategory === cat.id ? cat.color + "60" : "rgba(255,255,255,0.08)"}`,
                cursor: "pointer",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ list */}
        <div
          className="card rounded-3xl px-6 py-2"
          style={{ borderColor: category.color + "30" }}
        >
          {category.faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              accentColor={category.color}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <p className="text-slate-500 text-sm mb-4">{t("still_have_questions")}</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all"
            style={{
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              color: "#f59e0b",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(245,158,11,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(245,158,11,0.1)";
            }}
          >
            <MessageSquare className="w-4 h-4" />
             {t("contact_support")}
          </Link>
        </div>
      </div>
    </section>
  );
}
