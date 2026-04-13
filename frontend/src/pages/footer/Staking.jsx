import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Zap,
  Shield,
  DollarSign,
  Clock,
  Gift,
  PiggyBank,
  Percent,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  FeaturePage,
  FeatureHero,
  StatCard,
  FeatureCard,
  CTABanner,
} from "../features/FeatureLayout";

const STAKING_PLANS = [
  {
    asset: "BTC",
    apy: "2.5%",
    term: "Flexible",
    minStake: "0.001",
    icon: "₿",
    color: "#f59e0b",
  },
  {
    asset: "ETH",
    apy: "4.2%",
    term: "30 Days",
    minStake: "0.1",
    icon: "Ξ",
    color: "#60a5fa",
  },
  {
    asset: "SOL",
    apy: "6.8%",
    term: "90 Days",
    minStake: "1",
    icon: "◎",
    color: "#a78bfa",
  },
  {
    asset: "ADA",
    apy: "5.5%",
    term: "60 Days",
    minStake: "100",
    icon: "₳",
    color: "#34d399",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Passive Income",
    desc: "Earn rewards by staking your crypto assets. No trading required.",
  },
  {
    icon: Shield,
    title: "Secure Validation",
    desc: "Your assets are staked through secure, audited validators.",
  },
  {
    icon: Clock,
    title: "Flexible Terms",
    desc: "Choose from flexible or fixed-term staking options.",
  },
  {
    icon: Gift,
    title: "Compound Rewards",
    desc: "Auto-compound your earnings for maximum returns.",
  },
  {
    icon: DollarSign,
    title: "Instant Unstaking",
    desc: "Unstake anytime with minimal waiting periods.",
  },
  {
    icon: Percent,
    title: "Competitive APY",
    desc: "Get industry-leading yields on all supported assets.",
  },
];

const STATS = [
  { value: "8%", label: "Max APY", icon: Percent, color: "#f59e0b" },
  { value: "15+", label: "Assets", icon: PiggyBank, color: "#34d399" },
  {
    value: "$100M+",
    label: "Total Staked",
    icon: DollarSign,
    color: "#60a5fa",
  },
  { value: "50K+", label: "Stakers", icon: TrendingUp, color: "#a78bfa" },
];

export default function Staking() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("BTC");

  // Check if user is logged in (adjust based on your auth logic)
  const isLoggedIn = localStorage.getItem("token") || false;

  const handleStake = (asset) => {
    if (!isLoggedIn) {
      // Store the intended action in localStorage to redirect back after login
      localStorage.setItem("redirectAfterLogin", "/staking");
      localStorage.setItem(
        "intendedStake",
        JSON.stringify({
          asset,
          amount: stakeAmount || "0",
          plan: STAKING_PLANS.find((p) => p.asset === asset),
        }),
      );
      navigate("/login");
    } else {
      // User is logged in, execute the stake
      alert(
        `🚀 ${t("staking_confirmed")}\n\n${t("asset")}: ${asset}\n${t("amount")}: ${stakeAmount || "0"} ${asset}\nAPY: ${STAKING_PLANS.find((p) => p.asset === asset)?.apy}\n${t("term")}: ${STAKING_PLANS.find((p) => p.asset === asset)?.term}`,
      );
      // Here you would call your actual staking API
    }
  };

  const handleStakeFromCalculator = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert(t("enter_valid_stake_amount"));
      return;
    }

    if (!isLoggedIn) {
      localStorage.setItem("redirectAfterLogin", "/staking");
      localStorage.setItem(
        "intendedStake",
        JSON.stringify({
          asset: selectedAsset,
          amount: stakeAmount,
          plan: STAKING_PLANS.find((p) => p.asset === selectedAsset),
        }),
      );
      navigate("/login");
    } else {
      alert(
        `🚀 ${t("staking_confirmed")}\n\n${t("asset")}: ${selectedAsset}\n${t("amount")}: ${stakeAmount} ${selectedAsset}\nAPY: ${STAKING_PLANS.find((p) => p.asset === selectedAsset)?.apy}`,
      );
    }
  };

  const getApyForAsset = (asset) => {
    const plan = STAKING_PLANS.find((p) => p.asset === asset);
    return plan ? parseFloat(plan.apy) / 100 : 0.05;
  };

  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const border = "rgba(245,158,11,0.18)";

  return (
    <FeaturePage>
      <FeatureHero
        badge={t("crypto_staking")}
        title={t("stake_and_earn")}
        highlight={t("passive_income")}
        subtitle={t("staking_subtitle")}
        icon={PiggyBank}
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
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Staking Plans */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 24,
          }}
        >
          {t("available_staking_plans")}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 48,
          }}
        >
          {STAKING_PLANS.map((plan) => (
            <div
              key={plan.asset}
              style={{
                background: darkMode
                  ? "rgba(15,23,42,0.8)"
                  : "rgba(255,255,255,0.95)",
                border: `1px solid ${selectedPlan === plan.asset ? "#f59e0b" : border}`,
                borderRadius: 20,
                padding: "24px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => setSelectedPlan(plan.asset)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: "2rem" }}>{plan.icon}</div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    color: plan.color,
                  }}
                >
                  {plan.apy}
                </div>
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: textClr,
                  marginBottom: 8,
                }}
              >
                {plan.asset}
              </div>
              <div
                style={{
                  color: mutedClr,
                  fontSize: "0.85rem",
                  marginBottom: 4,
                }}
              >
                {t("term")}: {plan.term}
              </div>
              <div
                style={{
                  color: mutedClr,
                  fontSize: "0.85rem",
                  marginBottom: 16,
                }}
              >
                {t("min")}: {plan.minStake} {plan.asset}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStake(plan.asset);
                }}
                className="gold-btn"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {!isLoggedIn
                  ? `🔒 ${t("login_to_stake")} ${plan.asset}`
                  : `${t("stake")} ${plan.asset}`}
              </button>
            </div>
          ))}
        </div>

        {/* Calculator */}
        <div
          style={{
            background: darkMode
              ? "rgba(15,23,42,0.8)"
              : "rgba(255,255,255,0.95)",
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: "24px",
            marginBottom: 48,
          }}
        >
          <h3
            style={{
              color: textClr,
              fontWeight: 700,
              fontSize: "1.2rem",
              marginBottom: 20,
              fontFamily: '"Playfair Display",serif',
            }}
          >
            {t("staking_calculator")}
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
            }}
          >
            <div>
              <label
                style={{
                  color: mutedClr,
                  fontSize: "0.78rem",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {t("asset")}
              </label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                style={{
                  width: "100%",
                  background: darkMode
                    ? "rgba(15,23,42,0.6)"
                    : "rgba(248,250,252,0.9)",
                  border: `1px solid ${border}`,
                  borderRadius: 12,
                  padding: "10px",
                  color: textClr,
                }}
              >
                {STAKING_PLANS.map((plan) => (
                  <option key={plan.asset}>{plan.asset}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  color: mutedClr,
                  fontSize: "0.78rem",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {t("amount")} ({selectedAsset})
              </label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width: "100%",
                  background: darkMode
                    ? "rgba(15,23,42,0.6)"
                    : "rgba(248,250,252,0.9)",
                  border: `1px solid ${border}`,
                  borderRadius: 12,
                  padding: "10px",
                  color: textClr,
                }}
              />
            </div>
          </div>
          {stakeAmount && (
            <>
              <div
                style={{
                  marginTop: 24,
                  padding: "16px",
                  background: "rgba(245,158,11,0.06)",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: mutedClr }}>{t("est_annual_reward")}</span>
                  <span style={{ color: "#f59e0b", fontWeight: 600 }}>
                    ≈{" "}
                    {(
                      parseFloat(stakeAmount) * getApyForAsset(selectedAsset)
                    ).toFixed(4)}{" "}
                    {selectedAsset}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: mutedClr }}>{t("est_monthly_reward")}</span>
                  <span style={{ color: "#34d399", fontWeight: 600 }}>
                    ≈{" "}
                    {(
                      (parseFloat(stakeAmount) *
                        getApyForAsset(selectedAsset)) /
                      12
                    ).toFixed(4)}{" "}
                    {selectedAsset}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: mutedClr }}>{t("est_daily_reward")}</span>
                  <span style={{ color: "#60a5fa", fontWeight: 600 }}>
                    ≈{" "}
                    {(
                      (parseFloat(stakeAmount) *
                        getApyForAsset(selectedAsset)) /
                      365
                    ).toFixed(6)}{" "}
                    {selectedAsset}
                  </span>
                </div>
              </div>
              <button
                onClick={handleStakeFromCalculator}
                className="gold-btn"
                style={{
                  width: "100%",
                  marginTop: "20px",
                  padding: "12px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {!isLoggedIn
                  ? `🔒 ${t("login_to_stake")} ${stakeAmount} ${selectedAsset}`
                  : `${t("stake")} ${stakeAmount} ${selectedAsset}`}
              </button>
            </>
          )}
          {!isLoggedIn && stakeAmount && (
            <p
              style={{
                color: mutedClr,
                fontSize: "0.7rem",
                textAlign: "center",
                marginTop: 12,
              }}
            >
              {t("login_to_stake_message")}
            </p>
          )}
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
          {t("why_stake_with")} <span className="gold-text">AxionTrade</span>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 60,
          }}
        >
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
      <CTABanner
        title={t("start_staking_today")}
        subtitle={t("start_staking_subtitle")}
      />
    </FeaturePage>
  );
}