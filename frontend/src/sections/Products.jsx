import React from "react";
import { ArrowRight, Coins, BarChart2, Banknote } from "lucide-react";
import cashflow from "../assets/cashflow.jpg";
import { useTranslation } from "react-i18next";
import dollar from "../assets/dollar.jpg";
import coins from "../assets/coins.jpg";
import { Link } from "react-router-dom";

const PRODUCTS = [
  {
    id: "gold",
    Icon: Coins,
    accent: "#f59e0b",
    accentBg: "rgba(245,158,11,0.15)",
    borderColor: "rgba(245,158,11,0.28)",
    tag: "Store of Value",
    tagBg: "rgba(245,158,11,0.15)",
    title: "Gold",
    subtitle: "Digital & Physical Gold",
    desc: "Trade gold-backed tokens with real-time pricing. Diversify with the world's oldest store of value, now fully digitised.",
    features: [
      "Gold-backed tokens",
      "Physical delivery option",
      "Real-time spot pricing",
      "Zero custody fees",
    ],
    img: coins,
  },
  {
    id: "stocks",
    Icon: BarChart2,
    accent: "#60a5fa",
    accentBg: "rgba(96,165,250,0.15)",
    borderColor: "rgba(96,165,250,0.28)",
    tag: "Equities & Funds",
    tagBg: "rgba(96,165,250,0.15)",
    title: "Stocks & Funds",
    subtitle: "Global Equity Markets",
    desc: "Access global stocks, ETFs and index funds with fractional shares. Invest in the world's top companies from one platform.",
    features: [
      "Fractional shares",
      "Global markets access",
      "ETF & index funds",
      "Dividend reinvestment",
    ],
    img: dollar,
  },
  {
    id: "cash",
    Icon: Banknote,
    accent: "#34d399",
    accentBg: "rgba(52,211,153,0.15)",
    borderColor: "rgba(52,211,153,0.28)",
    tag: "Yield & Savings",
    tagBg: "rgba(52,211,153,0.15)",
    title: "Cash Management",
    subtitle: "Smart Yield Solutions",
    desc: "Earn competitive yield on idle cash. High-interest savings, money markets and flexible staking — all in one place.",
    features: [
      "Up to 12% APY",
      "Flexible & locked terms",
      "USDT/USDC staking",
      "Instant withdrawals",
    ],
    img: cashflow,
  },
];

function ProductCard({ p }) {
  const { t } = useTranslation();
  return (
    <Link
      to={`/${p.id}`}
      id={p.id}
      className="card rounded-3xl overflow-hidden group block"
      style={{ borderColor: p.borderColor }}
    >
      {/* image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={p.img}
          alt={p.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top,#0f172a,rgba(15,23,42,.5),transparent)",
          }}
        />
        <span
          className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            background: p.tagBg,
            color: p.accent,
            border: `1px solid ${p.borderColor}`,
          }}
        >
          {p.tag}
        </span>
      </div>

      {/* body */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: p.accentBg }}
          >
            <p.Icon className="w-5 h-5" style={{ color: p.accent }} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg font-display">
              {p.title}
            </h3>
            <p className="text-xs font-medium" style={{ color: p.accent }}>
              {p.subtitle}
            </p>
          </div>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>

        <ul className="space-y-2">
          {p.features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-2 text-sm text-slate-300"
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: p.accent }}
              />
              {f}
            </li>
          ))}
        </ul>

        <span
          className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all"
          style={{ color: p.accent }}
        >
          {t("explore")} {p.title} <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

export default function Products() {
  const { t } = useTranslation();
  const PRODUCTS = [
    {
      id: "gold",
      Icon: Coins,
      accent: "#f59e0b",
      accentBg: "rgba(245,158,11,0.15)",
      borderColor: "rgba(245,158,11,0.28)",
      tag: t("store_of_value"),
      tagBg: "rgba(245,158,11,0.15)",
      title: t("gold"),
      subtitle: t("gold_subtitle"),
      desc: t("gold_desc"),
      features: [
        t("gold_features"),
        t("gold_feature2"),
        t("gold_feature3"),
        t("gold_feature4"),
      ],
      img: coins,
    },
    {
      id: "stocks",
      Icon: BarChart2,
      accent: "#60a5fa",
      accentBg: "rgba(96,165,250,0.15)",
      borderColor: "rgba(96,165,250,0.28)",
      tag: t("equities_funds"),
      tagBg: "rgba(96,165,250,0.15)",
      title: t("stocks_funds"),
      subtitle: t("stocks_subtitle"),
      desc: t("stocks_desc"),
      features: [
        t("stocks_features"),
        t("stocks_feature2"),
        t("stocks_feature3"),
        t("stocks_feature4"),
      ],
      img: dollar,
    },
    {
      id: "cash",
      Icon: Banknote,
      accent: "#34d399",
      accentBg: "rgba(52,211,153,0.15)",
      borderColor: "rgba(52,211,153,0.28)",
      tag: t("yield_savings"),
      tagBg: "rgba(52,211,153,0.15)",
      title: t("cash_management"),
      subtitle: t("cash_subtitle"),
      desc: t("cash_desc"),
      features: [
        t("cash_features"),
        t("cash_feature2"),
        t("cash_feature3"),
        t("cash_feature4"),
      ],
      img: cashflow,
    },
  ];

  return (
    <section id="products" className="py-20 lg:py-28 fade-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-yellow-500 text-xs font-semibold mb-3 uppercase tracking-widest">
            {t("our_products")}
          </p>
          <h2
            className="font-display font-extrabold text-white mb-4"
            style={{ fontSize: "clamp(2rem,5vw,3.2rem)" }}
          >
            {t("diversify_portfolio")}{" "}
            <span className="gold-text">{t("portfolio")}</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t("products_subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
