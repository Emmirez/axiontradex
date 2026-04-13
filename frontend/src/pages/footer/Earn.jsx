import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  Shield,
  Zap,
  Lock,
  RefreshCw,
  Gift,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  FeaturePage,
  FeatureHero,
  StatCard,
  FeatureCard,
  CTABanner,
} from "../features/FeatureLayout";

const EARN_PRODUCTS = [
  {
    name: "BTC Flexible",
    asset: "BTC",
    apy: 4.2,
    type: "Flexible",
    min: "0.001 BTC",
    icon: "₿",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
  },
  {
    name: "ETH Staking",
    asset: "ETH",
    apy: 5.8,
    type: "Locked 30d",
    min: "0.1 ETH",
    icon: "Ξ",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.12)",
  },
  {
    name: "USDT Savings",
    asset: "USDT",
    apy: 8.5,
    type: "Flexible",
    min: "$10",
    icon: "$",
    color: "#34d399",
    bg: "rgba(52,211,153,0.12)",
  },
  {
    name: "USDC High Yield",
    asset: "USDC",
    apy: 10.2,
    type: "Locked 90d",
    min: "$100",
    icon: "$",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
  },
  {
    name: "SOL Staking",
    asset: "SOL",
    apy: 7.1,
    type: "Locked 30d",
    min: "1 SOL",
    icon: "◎",
    color: "#14b8a6",
    bg: "rgba(20,184,166,0.12)",
  },
  {
    name: "BNB Flexible",
    asset: "BNB",
    apy: 3.9,
    type: "Flexible",
    min: "0.1 BNB",
    icon: "B",
    color: "#f87171",
    bg: "rgba(248,113,113,0.12)",
  },
];

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Up to 10.2% APY",
    desc: "Earn competitive yields on your crypto holdings. Far above traditional savings accounts.",
  },
  {
    icon: Shield,
    title: "Audited & Secure",
    desc: "All earn products are backed by audited smart contracts with over-collateralised reserves.",
  },
  {
    icon: Zap,
    title: "Instant Flexible",
    desc: "Flexible plans allow instant redemption with no lock-up period. Access your funds anytime.",
  },
  {
    icon: Lock,
    title: "Locked Boosts",
    desc: "Lock funds for 30 or 90 days to earn boosted rates. Still early-exit with a small fee.",
  },
  {
    icon: RefreshCw,
    title: "Auto-Compound",
    desc: "Enable compounding to reinvest your daily earnings automatically and grow faster.",
  },
  {
    icon: Gift,
    title: "Referral Bonuses",
    desc: "Earn bonus APY for every friend you refer to the Earn programme. No cap on referrals.",
  },
];

const STATS = [
  { value: "10.2%", label: "Max APY", icon: TrendingUp, color: "#34d399" },
  { value: "$850M", label: "Total Staked", icon: DollarSign, color: "#f59e0b" },
  { value: "6", label: "Earn Products", icon: Gift, color: "#60a5fa" },
  { value: "Daily", label: "Payouts", icon: RefreshCw, color: "#a78bfa" },
];

export default function Earn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [apys, setApys] = useState(() => EARN_PRODUCTS.map((p) => p.apy));

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("token") || false;

  useEffect(() => {
    const iv = setInterval(() => {
      setApys((prev) =>
        prev.map((a, i) => {
          const noise = (Math.random() - 0.5) * 0.08;
          return parseFloat(
            Math.max(
              EARN_PRODUCTS[i].apy * 0.96,
              Math.min(EARN_PRODUCTS[i].apy * 1.04, a + noise),
            ).toFixed(1),
          );
        }),
      );
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const handleStartEarning = (product) => {
    if (!isLoggedIn) {
      // Store the intended action to redirect back after login
      localStorage.setItem("redirectAfterLogin", "/earn");
      localStorage.setItem(
        "intendedEarn",
        JSON.stringify({
          product: product.name,
          asset: product.asset,
          apy: product.apy,
          type: product.type,
        }),
      );
      navigate("/login");
    } else {
      // User is logged in, execute the earn action
      alert(
        `🚀 Start Earning!\n\nProduct: ${product.name}\nAsset: ${product.asset}\nAPY: ${product.apy}%\nType: ${product.type}\nMin Deposit: ${product.min}`,
      );
      // Here you would call your actual earn API
    }
  };

  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const border = "rgba(245,158,11,0.18)";

  return (
    <FeaturePage>
      <FeatureHero
        badge={t("earn")}
        title={t("put_your_crypto")}
        highlight={t("to_work")}
        subtitle={t("earn_subtitle")}
        icon={DollarSign}
      />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 6,
          }}
        >
          {t("earn")} <span className="gold-text">{t("products")}</span>
        </h2>
        <p style={{ color: mutedClr, fontSize: "0.875rem", marginBottom: 20 }}>
          {t("live_apy_rates")}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {EARN_PRODUCTS.map((p, i) => (
            <div
              key={p.name}
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: "22px",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(245,158,11,0.35)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = border;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: p.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: p.color,
                      fontWeight: 800,
                      fontSize: "1.1rem",
                    }}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        color: textClr,
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      {p.name}
                    </div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: p.bg,
                        color: p.color,
                      }}
                    >
                      {p.type}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      color: p.color,
                      fontFamily: "monospace",
                      fontWeight: 800,
                      fontSize: "1.4rem",
                    }}
                  >
                    {apys[i].toFixed(1)}%
                  </div>
                  <div style={{ color: mutedClr, fontSize: "0.68rem" }}>
                    APY
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <span style={{ color: mutedClr, fontSize: "0.78rem" }}>
                  {t("min_deposit")}
                </span>
                <span
                  style={{
                    color: textClr,
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    fontFamily: "monospace",
                  }}
                >
                  {p.min}
                </span>
              </div>
              <button
                onClick={() => handleStartEarning(p)}
                className="gold-btn"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 12,
                  border: "none",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {t("start_earning")}
              </button>
            </div>
          ))}
        </div>

        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 20,
          }}
        >
          {t("why_earn_on")} <span className="gold-text">AxionTrade</span>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 60,
          }}
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
      <CTABanner
        title={t("earn_cta_title")}
        subtitle={t("earn_cta_subtitle")}
      />
    </FeaturePage>
  );
}