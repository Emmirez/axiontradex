import React from "react";
import { ArrowRight } from "lucide-react";
import gold from "../assets/gold.jpg";
import crypto from "../assets/crypto.jpg";
import { useTranslation } from "react-i18next";
import bitcoin from "../assets/bitcoin.jpg";


export default function TradingImages() {
  const { t } = useTranslation();
  const IMAGES = [
    {
      url: gold,
      label: t("bitcoin_gold"),
    },
    {
      url: crypto,
      label: t("trading_charts"),
    },
    {
      url: bitcoin,
      label: t("bitcoin_network"),
    },
  ];

  const FEATURES = [
    t("real_time_order_book"),
    t("multi_chart_layouts"),
    t("one_click_trading"),
    t("portfolio_analytics"),
  ];

  return (
    <section className="section-base pb-20 lg:pb-28 fade-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top image strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {IMAGES.map((img) => (
            <div
              key={img.label}
              className="relative group overflow-hidden rounded-2xl"
              style={{ aspectRatio: "16/9" }}
            >
              <img
                src={img.url}
                alt={img.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(2,6,23,.8), transparent)",
                }}
              />
              <div className="absolute bottom-3 left-3 text-white text-xs font-medium image-text">
                {img.label}
              </div>
            </div>
          ))}
        </div>

        {/*  Terminal showcase  */}

        <div className="card rounded-3xl overflow-hidden">
          {/* Image — taller on mobile so it breathes */}
          <div
            className="relative w-full"
            style={{ aspectRatio: "16/7", minHeight: "200px" }}
          >
            <img
              src="https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=1400&q=80"
              alt="Trading Terminal Showcase"
              className="w-full h-full object-cover"
            />
            {/* gradient — only meaningful on lg where text overlays */}
            <div
              className="absolute inset-0 hidden lg:block"
              style={{
                background:
                  "linear-gradient(to top, #020617 0%, rgba(2,6,23,.65) 45%, transparent 100%)",
              }}
            />
            {/* dark tint on mobile so image doesn't look flat */}
            <div
              className="absolute inset-0 lg:hidden"
              style={{ background: "rgba(2,6,23,0.35)" }}
            />

            {/*  Overlay text */}
            <div className="hidden lg:block absolute bottom-8 left-8 right-8 max-w-2xl image-text">
              <h3
                className="font-display font-bold text-white mb-3 image-text"
                style={{ fontSize: "clamp(1.6rem,3vw,2.5rem)" }}
              >
                {t("professional_terminal")}{" "}
                <span className="gold-text">{t("terminal")}</span>
              </h3>
              <p className="text-slate-300 text-base mb-5 image-text">
                {t("terminal_desc")}
              </p>
              <div className="flex flex-wrap gap-4 mb-5">
                {FEATURES.map((f) => (
                  <span
                    key={f}
                    className="flex items-center gap-1.5 text-sm text-yellow-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    {f}
                  </span>
                ))}
              </div>
              <a
                href="/register"
                className="gold-btn inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm"
              >
                {t("explore_terminal")} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/*  Text block — MOBILE ONLY   */}
          <div className="terminal-panel lg:hidden px-6 py-7 space-y-4">
            <h3
              className="font-display font-bold text-white leading-tight"
              style={{ fontSize: "clamp(1.4rem,5vw,2rem)" }}
            >
              {t("professional_terminal")}{" "}
              <span className="gold-text">{t("terminal")}</span>
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t("terminal_desc")}
            </p>

            {/* feature pills */}
            <div className="flex flex-wrap gap-2">
              {FEATURES.map((f) => (
                <span
                  key={f}
                  className="flex items-center gap-1.5 text-xs text-yellow-300 px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.2)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  {f}
                </span>
              ))}
            </div>

            <a
              href="/register"
              className="gold-btn inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm"
            >
              {t("explore_terminal")} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
