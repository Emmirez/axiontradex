import React from "react";
import {
  Zap,
  BarChart3,
  Shield,
  Globe,
  Bot,
  Users,
  Cpu,
  DollarSign,
} from "lucide-react";
import { useTranslation } from "react-i18next";


export default function Features() {
  const { t } = useTranslation();

    const FEATURES = [
    {
      id: "instant",
      Icon: Zap,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.15)",
      title: t("instant_trading"),
      desc: t("instant_trading_desc"),
    },
    {
      id: "charts",
      Icon: BarChart3,
      color: "#34d399",
      bg: "rgba(52,211,153,0.15)",
      title: t("advanced_charts"),
      desc: t("advanced_charts_desc"),
    },
    {
      id: "wallet",
      Icon: Shield,
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.15)",
      title: t("secure_wallet"),
      desc: t("secure_wallet_desc"),
    },
    {
      id: "fees",
      Icon: Globe,
      color: "#a78bfa",
      bg: "rgba(167,139,250,0.15)",
      title: t("low_fees"),
      desc: t("low_fees_desc"),
    },
    {
      id: "copy-trading",
      Icon: Users,
      color: "#22d3ee",
      bg: "rgba(6,182,212,0.15)",
      title: t("copy_trading"),
      desc: t("copy_trading_desc"),
    },
    {
      id: "trading-bot",
      Icon: Bot,
      color: "#fb923c",
      bg: "rgba(251,146,60,0.15)",
      title: t("trading_bots"),
      desc: t("trading_bots_desc"),
    },
    {
      id: "ai-trading",
      Icon: Cpu,
      color: "#f472b6",
      bg: "rgba(244,114,182,0.15)",
      title: t("ai_trading_feature"),
      desc: t("ai_trading_feature_desc"),
    },
    {
      id: "funded",
      Icon: DollarSign,
      color: "#4ade80",
      bg: "rgba(74,222,128,0.15)",
      title: t("get_funded_feature"),
      desc: t("get_funded_feature_desc"),
    },
  ];
  return (
    <section
      id="features"
      className="section-darker py-20 lg:py-28 fade-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* heading */}
        <div className="text-center mb-14">
          <p className="text-yellow-500 text-xs font-semibold mb-3 uppercase tracking-widest">
             {t("platform_features")}
          </p>
          <h2
            className="font-display font-extrabold text-white mb-4"
            style={{ fontSize: "clamp(2rem,5vw,3.2rem)" }}
          >
            {t("built_for")} <span className="gold-text">{t("every_trader")}</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t("features_subtitle")}
          </p>
        </div>

        {/* grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ id, Icon, color, bg, title, desc }) => (
            <div key={id} id={id} className="card rounded-2xl p-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: bg }}
              >
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">
                {title}
              </h3>
              <p
                className="text-slate-500 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: desc }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
