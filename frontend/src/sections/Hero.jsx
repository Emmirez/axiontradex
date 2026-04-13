import React, { useState, useEffect } from "react";
import { ArrowRight, Play, Shield, Zap, TrendingUp, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../services/apiService";
import { useTheme } from "../context/ThemeContext";

function TerminalCard({ prices, darkMode }) {
  const { t } = useTranslation();
  const btc = prices?.bitcoin;
  const eth = prices?.ethereum;
  const sol = prices?.solana;

  const btcPrice = btc?.usd || 0;
  const btcChange = btc?.usd_24h_change || 0;
  const btcUp = btcChange >= 0;
  const ethPrice = eth?.usd || 0;
  const ethChange = eth?.usd_24h_change || 0;
  const ethUp = ethChange >= 0;
  const solPrice = sol?.usd || 0;
  const solChange = sol?.usd_24h_change || 0;
  const solUp = solChange >= 0;

  const [prevBtc, setPrevBtc] = useState(null);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (!btcPrice) return;
    if (prevBtc === null) { setPrevBtc(btcPrice); return; }
    setFlash(btcPrice > prevBtc ? "up" : "down");
    const t = setTimeout(() => setFlash(null), 600);
    setPrevBtc(btcPrice);
    return () => clearTimeout(t);
  }, [btcPrice]);

  const fmt = (p) =>
    p ? "$" + p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

  return (
    <div className="animate-float relative w-full max-w-sm mx-auto lg:mx-0">
      <div className="card rounded-3xl p-6 shadow-2xl" style={{ borderColor: "rgba(245,158,11,0.35)" }}>
        <div className="flex items-center justify-between mb-5" style={{ position: "relative", zIndex: 1 }}>
          <div className="flex items-center gap-2.5">
            <img
              src="https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/128/color/btc.png"
              alt="BTC"
              className="w-9 h-9"
              onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=BTC&background=f59e0b&color=fff&size=36"; }}
            />
            <div>
              <div className="text-white font-semibold text-sm">{t("bitcoin")}</div>
              <div className="text-slate-500 text-xs">{t("btc_usdt")}</div>
            </div>
          </div>
          <div className="text-right">
            <div
              className="font-mono font-bold text-xl transition-colors duration-300"
              style={{ color: flash === "up" ? "#34d399" : flash === "down" ? "#f87171" : darkMode ? "#f1f5f9" : "#0f172a" }}
            >
              {fmt(btcPrice)}
            </div>
            <div className={`text-sm font-semibold ${btcUp ? "text-emerald-400" : "text-red-400"}`}>
              {btcUp ? "▲" : "▼"} {btcChange > 0 ? "+" : ""}{btcChange.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* SVG mini-chart */}
        <div className="relative h-28 mb-5 rounded-xl overflow-hidden" style={{ background: "rgba(245,158,11,0.04)" }}>
          <svg viewBox="0 0 320 80" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="chart-line" d="M0,65 C20,62 30,60 50,52 C70,44 80,50 100,38 C120,26 130,35 150,24 C170,13 180,20 200,14 C220,8 240,12 260,6 C280,2 300,8 320,4" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            <path d="M0,65 C20,62 30,60 50,52 C70,44 80,50 100,38 C120,26 130,35 150,24 C170,13 180,20 200,14 C220,8 240,12 260,6 C280,2 300,8 320,4 L320,80 L0,80 Z" fill="url(#cg)" />
          </svg>
        </div>

        {/* stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            [t("price"), fmt(btcPrice)],
            [t("change"), `${btcChange >= 0 ? "+" : ""}${btcChange.toFixed(2)}%`],
            [t("volume"), "$38.4B"],
          ].map(([label, val]) => (
            <div key={label} className="rounded-xl p-2 text-center text-xs font-mono" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="text-slate-500 mb-0.5">{label}</div>
              <div className="text-white font-semibold">{val}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <a href="/register">
            <button className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80" style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.35)", color: "#34d399" }}>
              {t("buy_btc")}
            </button>
          </a>
          <a href="/register">
            <button className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80" style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }}>
              {t("sell_btc")}
            </button>
          </a>
        </div>
      </div>

      {/* floating ETH */}
      <div className="card absolute top-12 -right-8 rounded-2xl p-3 w-28 shadow-xl">
        <div className="flex items-center gap-1.5 mb-1">
          <img src="https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/128/color/eth.png" alt="ETH" className="w-5 h-5" onError={(e) => { e.target.style.display = "none"; }} />
          <span className="text-white text-xs font-bold">ETH</span>
        </div>
        <div className="text-white font-mono text-sm font-bold">{fmt(ethPrice)}</div>
        <div className={`text-xs font-mono ${ethUp ? "text-emerald-400" : "text-red-400"}`}>
          {ethUp ? "▲" : "▼"} {ethChange >= 0 ? "+" : ""}{ethChange.toFixed(2)}%
        </div>
      </div>

      {/* floating SOL */}
      <div className="card absolute -bottom-3 -left-2 rounded-2xl p-3 w-28 shadow-xl">
        <div className="flex items-center gap-1.5 mb-1">
          <img src="https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/128/color/sol.png" alt="SOL" className="w-5 h-5" onError={(e) => { e.target.style.display = "none"; }} />
          <span className="text-white text-xs font-bold">SOL</span>
        </div>
        <div className="text-white font-mono text-sm font-bold">{fmt(solPrice)}</div>
        <div className={`text-xs font-mono ${solUp ? "text-emerald-400" : "text-red-400"}`}>
          {solUp ? "▲" : "▼"} {solChange >= 0 ? "+" : ""}{solChange.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

function VideoModal({ onClose }) {
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)", paddingTop: "80px" }}
      onClick={onClose}
    >
      <div
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl"
        style={{ border: "1px solid rgba(245,158,11,0.35)", maxWidth: "min(90vw, 760px)", maxHeight: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-[1001] w-9 h-9 rounded-full flex items-center justify-center hover:text-yellow-400 transition-colors"
          style={{ background: "rgba(0,0,0,0.85)", color: "#f1f5f9" }}
        >
          <X className="w-5 h-5" />
        </button>
        <video src="/trading-demo.mp4" controls autoPlay playsInline style={{ width: "100%", display: "block", background: "#000", flexShrink: 1, minHeight: 0 }} />
        <div className="px-6 py-4" style={{ background: "rgba(15,23,42,0.97)" }}>
          <p style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "0.875rem" }}>{t("platform_demo")}</p>
          <p style={{ color: "#64748b", fontSize: "0.75rem", marginTop: 2 }}>{t("platform_demo_desc")}</p>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const [videoOpen, setVideoOpen] = useState(false);
  const [prices, setPrices] = useState(null);

  const STATS = [
    { value: "5M+",   label: t("active_traders") },
    { value: "$12B+", label: t("daily_volume") },
    { value: "99.9%", label: t("uptime") },
    { value: "180+",  label: t("countries") },
  ];

  const fetchPrices = async (silent = false) => {
    try {
      const res = await api.get("/markets/prices");
      if (res.data?.data) setPrices(res.data.data);
    } catch (err) {
      if (!silent) console.error("[Hero] price fetch failed:", err.message);
    }
  };

  useEffect(() => {
    fetchPrices();
    const timer = setInterval(() => fetchPrices(true), 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <section id="home" className="section-dark relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(245,158,11,0.06)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(217,119,6,0.05)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* Left copy */}
            <div className="space-y-7">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 text-sm font-medium"
                style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}
              >
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                {t("next_gen_platform")}
              </div>

              <div>
                <h1 className="font-display font-black leading-[1.08]" style={{ fontSize: "clamp(2.6rem,6vw,4.5rem)" }}>
                  <span className="block text-white">{t("trade_crypto")}</span>
                  <span className="block">
                    <span className="gold-text">{t("securely")}</span>{" "}
                    <span className="text-white">&amp;</span>
                  </span>
                  <span className="block text-white">{t("intelligently")}</span>
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed max-w-lg mt-4">
                  {t("hero_description")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/register" className="gold-btn flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base">
                  {t("start_trading")} <ArrowRight className="w-5 h-5" />
                </a>
                <button
                  onClick={() => setVideoOpen(true)}
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border border-white/20 text-white hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-all text-base font-medium"
                >
                  <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(245,158,11,0.2)", animation: "pulseGold 2s ease-in-out infinite" }}>
                    <Play className="w-4 h-4 text-yellow-400 fill-current ml-0.5" />
                  </span>
                  {t("watch_demo")}
                </button>
              </div>

              <div className="flex flex-wrap gap-5">
                {[
                  [Shield,     t("bank_grade_badge")],
                  [Zap,        t("execution_badge")],
                  [TrendingUp, t("soc2_badge")],
                ].map(([Icon, text]) => (
                  <span key={text} className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Icon className="w-4 h-4 text-yellow-500" />
                    <span>{text}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Right — live terminal card */}
            <div className="flex justify-center overflow-hidden">
              <TerminalCard prices={prices} darkMode={darkMode} />
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-5">
            {STATS.map((s) => (
              <div key={s.label} className="card rounded-2xl p-5 text-center">
                <div className="gold-text font-display font-bold text-3xl">{s.value}</div>
                <div className="text-slate-400 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {videoOpen && <VideoModal onClose={() => setVideoOpen(false)} />}
    </>
  );
}