import React from "react";
import { ArrowRight, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CTA() {
  const { t } = useTranslation();
  return (
    <section className="py-16 lg:py-24 fade-section">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="card relative overflow-hidden rounded-3xl p-10 lg:p-16 text-center"
          style={{ borderColor: "rgba(245,158,11,0.28)" }}
        >
          {/* glow orbs */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-52 pointer-events-none"
            style={{
              background: "rgba(245,158,11,0.09)",
              filter: "blur(60px)",
              borderRadius: "50%",
            }}
          />
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-52 pointer-events-none"
            style={{
              background: "rgba(180,83,9,0.07)",
              filter: "blur(60px)",
              borderRadius: "50%",
            }}
          />

          <div className="relative">
            <p className="text-yellow-500 text-xs font-semibold mb-4 uppercase tracking-widest">
              Start Today
            </p>
            <h2
              className="font-display font-black text-white mb-5"
              style={{ fontSize: "clamp(2.2rem,6vw,4rem)" }}
            >
              {t("ready_to_start_trading")}{" "}
              <span className="gold-text">{t("trading")}</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              {t("join_two_million_traders")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/register"
                className="gold-btn flex items-center gap-2 px-8 py-4 rounded-2xl text-base w-full sm:w-auto justify-center"
              >
                {t("create_free_account")} <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/login"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/20 text-white hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-all text-base font-medium w-full sm:w-auto justify-center"
              >
                <LogIn className="w-5 h-5" /> {t("sign_in")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
