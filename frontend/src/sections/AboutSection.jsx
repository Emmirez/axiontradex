import React from "react";
import { TrendingUp, Shield, Users, Globe, Award, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";



export default function AboutSection() {
  const { t } = useTranslation();
  const PILLARS = [
  {
    icon: Shield,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    title: t("bank_grade_security"),
    desc: t("bank_grade_security_desc"),
  },
  {
    icon: TrendingUp,
    color: "#34d399",
    bg: "rgba(52,211,153,0.12)",
    title: t("institutional_tools"),
    desc: t("institutional_tools_desc"),
  },
  {
    icon: Users,
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.12)",
    title: t("built_for_everyone"),
    desc: t("built_for_everyone_desc"),
  },
  {
    icon: Globe,
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    title: t("global_borderless"),
    desc: t("global_borderless_desc"),
  },
  {
    icon: Zap,
    color: "#f87171",
    bg: "rgba(248,113,113,0.12)",
    title: t("lightning_execution"),
    desc: t("lightning_execution_desc"),
  },
  {
    icon: Award,
    color: "#14b8a6",
    bg: "rgba(20,184,166,0.12)",
    title: t("regulated_compliant"),
    desc: t("regulated_compliant_desc"),
  },
];

  return (
    <section id="about" className="section-base py-20 lg:py-28 fade-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-yellow-500 text-xs font-semibold mb-3 uppercase tracking-widest">
            {t("about_axiontrade")}
          </p>
          <h2
            className="font-display font-extrabold text-white mb-4"
            style={{ fontSize: "clamp(2rem,5vw,3.2rem)" }}
          >
            {t("why_traders_choose")}{" "}
            <span className="gold-text">AxionTrade</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t("founded_description")}
          </p>
        </div>

        {/* Two-column intro */}
        <div
          className="card rounded-3xl p-8 lg:p-12 mb-14 relative overflow-hidden"
          style={{ borderColor: "rgba(245,158,11,0.2)" }}
        >
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
            style={{
              background: "rgba(245,158,11,0.04)",
              filter: "blur(60px)",
            }}
          />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h3
                className="font-display font-bold text-white mb-4"
                style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)" }}
              >
                {t("our_mission")}{" "}
                <span className="gold-text">{t("democratise_access")}</span>{" "}
                {t("professional_trading")}
              </h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                {t("democratise_access_desc")}
              </p>
              <p className="text-slate-400 leading-relaxed">
                {t('all_in_one')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "5M+", label: "Active Traders" },
                { value: "180+", label: "Countries" },
                { value: "$5B+", label: "Trading Volume" },
                { value: "99.9%", label: "Platform Uptime" },
              ].map((s) => (
                <div key={s.label} className="card rounded-2xl p-5 text-center">
                  <div className="gold-text font-display font-bold text-3xl">
                    {s.value}
                  </div>
                  <div className="text-slate-400 text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pillars grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PILLARS.map((p) => (
            <div key={p.title} className="card rounded-2xl p-6 group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: p.bg }}
              >
                <p.icon className="w-6 h-6" style={{ color: p.color }} />
              </div>
              <h4 className="text-white font-semibold text-base mb-2">
                {p.title}
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
