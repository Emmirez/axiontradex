import React from "react";
import { Lock, Shield, Eye, Server } from "lucide-react";
import { useTranslation } from 'react-i18next';



export default function Security() {
  const { t } = useTranslation();
  const SEC_FEATURES = [
    {
      Icon: Lock,
      title: t("multi_sig"),
      desc: t("multi_sig_desc"),
    },
    {
      Icon: Shield,
      title: t("hardware_security"),
      desc: t("hardware_security_desc"),
    },
    {
      Icon: Eye,
      title: t("monitoring"),
      desc: t("monitoring_desc"),
    },
    {
      Icon: Server,
      title: t("cold_storage"),
      desc: t("cold_storage_desc"),
    },
  ];

  const STATS = [
    { value: "98%", label: t("cold_storage_stat") },
    { value: "99.9%", label: t("uptime") },
    { value: "24/7", label: t("support_stat") },
    { value: "5M+", label: t("users_stat") },
  ];

  return (
    <section
      id="security"
      className="section-darkest py-20 lg:py-28 fade-section relative overflow-hidden"
    >
      {/* ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "rgba(245,158,11,0.04)", filter: "blur(80px)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy  */}
          <div className="space-y-8">
            <div>
              <p className="text-yellow-500 text-xs font-semibold mb-3 uppercase tracking-widest">
                {t("security_first_section")}
              </p>
              <h2
                className="font-display font-extrabold text-white mb-4"
                style={{ fontSize: "clamp(2rem,5vw,3.2rem)" }}
              >
                {t("security_priority")} <br />
                <span className="gold-text">{t("our_priority")}</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                  {t("security_desc")}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {SEC_FEATURES.map(({ Icon, title, desc }) => (
                <div key={title} className="card rounded-2xl p-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: "rgba(245,158,11,0.15)" }}
                  >
                    <Icon className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h4 className="text-white font-semibold text-sm mb-1.5">
                    {title}
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right image + stats  */}
          <div className="mt-12 lg:mt-0 space-y-5">
            <div
              className="rounded-3xl overflow-hidden"
              style={{ aspectRatio: "1" }}
            >
              <img
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1920&q=80"
                alt="Security infrastructure"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="card rounded-2xl p-4 text-center">
                  <div className="gold-text font-display font-bold text-3xl">
                    {s.value}
                  </div>
                  <div className="text-slate-500 text-xs mt-1 uppercase tracking-wider">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
