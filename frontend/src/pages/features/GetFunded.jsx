import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  Shield,
  CheckCircle,
  ArrowRight,
  Trophy,
  Users,
  Target,
  Zap,
  Star,
} from "lucide-react";
import FeatureLayout from "./FeatureLayout";
import { useTheme } from "../../context/ThemeContext";

export default function GetFunded() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const [selected, setSelected] = useState("Pro");

  const STATS = [
    { value: "$500K", label: t("max_funding"), icon: DollarSign },
    { value: "90%", label: t("profit_split"), icon: TrendingUp },
    { value: "2K+", label: t("funded_traders"), icon: Users },
    { value: "14 Days", label: t("avg_pass_time"), icon: Target },
  ];

  const PLANS = [
    {
      name: t("starter"),
      capital: "$10,000",
      price: "$99",
      profit: "80%",
      color: "#3b82f6",
      features: [
        t("starter_feature_1"),
        t("starter_feature_2"),
        t("starter_feature_3"),
        t("starter_feature_4"),
        t("starter_feature_5"),
      ],
    },
    {
      name: t("pro"),
      capital: "$50,000",
      price: "$299",
      profit: "85%",
      color: "#f59e0b",
      popular: true,
      features: [
        t("pro_feature_1"),
        t("pro_feature_2"),
        t("pro_feature_3"),
        t("pro_feature_4"),
        t("pro_feature_5"),
        t("pro_feature_6"),
      ],
    },
    {
      name: t("elite"),
      capital: "$200,000",
      price: "$699",
      profit: "90%",
      color: "#10b981",
      features: [
        t("elite_feature_1"),
        t("elite_feature_2"),
        t("elite_feature_3"),
        t("elite_feature_4"),
        t("elite_feature_5"),
        t("elite_feature_6"),
        t("elite_feature_7"),
      ],
    },
    {
      name: t("master"),
      capital: "$500,000",
      price: "$1,299",
      profit: "90%",
      color: "#8b5cf6",
      features: [
        t("master_feature_1"),
        t("master_feature_2"),
        t("master_feature_3"),
        t("master_feature_4"),
        t("master_feature_5"),
        t("master_feature_6"),
        t("master_feature_7"),
        t("master_feature_8"),
      ],
    },
  ];

  const STEPS = [
    {
      step: "01",
      icon: Trophy,
      title: t("choose_challenge"),
      desc: t("choose_challenge_desc"),
    },
    {
      step: "02",
      icon: Target,
      title: t("pass_evaluation"),
      desc: t("pass_evaluation_desc"),
    },
    {
      step: "03",
      icon: DollarSign,
      title: t("get_funded_title"),
      desc: t("get_funded_desc_funded"),
    },
    {
      step: "04",
      icon: TrendingUp,
      title: t("earn_scale"),
      desc: t("earn_scale_desc"),
    },
  ];

  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const cardBorder = darkMode
    ? "rgba(245,158,11,0.15)"
    : "rgba(245,158,11,0.2)";
  const headClr = darkMode ? "#f1f5f9" : "#0f172a";
  const subClr = darkMode ? "#64748b" : "#64748b";
  const labelClr = darkMode ? "#94a3b8" : "#475569";

  return (
    <FeatureLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        {/*  Hero  */}
        <div style={{ textAlign: "center", padding: "60px 0 48px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: 999,
              padding: "6px 16px",
              marginBottom: 20,
            }}
          >
            <Trophy style={{ width: 14, height: 14, color: "#f59e0b" }} />
            <span
              style={{ color: "#f59e0b", fontSize: "0.8rem", fontWeight: 600 }}
            >
              {t("get_funded")}
            </span>
          </div>
          <h1
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 900,
              fontSize: "clamp(2rem,5vw,3.5rem)",
              color: headClr,
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            {t("trade_our_capital")}
            <br />
            <span className="gold-text">{t("keep_the_profits")}</span>
          </h1>
          <p
            style={{
              color: subClr,
              fontSize: "1rem",
              lineHeight: 1.7,
              maxWidth: 560,
              margin: "0 auto 32px",
            }}
          >
            {t("get_funded_hero_desc")}
          </p>
          <Link
            to="/register"
            className="gold-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              borderRadius: 14,
              textDecoration: "none",
              fontSize: "0.95rem",
            }}
          >
            {t("start_challenge")}{" "}
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>

        {/*  Stats  */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 56,
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: 20,
                padding: "24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(245,158,11,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <s.icon style={{ width: 20, height: 20, color: "#f59e0b" }} />
              </div>
              <div
                style={{
                  fontFamily: '"Playfair Display",serif',
                  fontWeight: 700,
                  fontSize: "1.8rem",
                  color: "#f59e0b",
                }}
              >
                {s.value}
              </div>
              <div
                style={{ color: labelClr, fontSize: "0.8rem", marginTop: 4 }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={{ marginBottom: 56 }}>
          <h2
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 700,
              fontSize: "1.8rem",
              color: headClr,
              marginBottom: 8,
            }}
          >
            {t("how_it_works")}
          </h2>
          <p style={{ color: subClr, fontSize: "0.9rem", marginBottom: 24 }}>
            {t("how_it_works_subtitle_funded")}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {STEPS.map((s) => (
              <div
                key={s.step}
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 20,
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    color: "#f59e0b",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    fontFamily: "monospace",
                    marginBottom: 12,
                    opacity: 0.7,
                  }}
                >
                  {s.step}
                </div>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "rgba(245,158,11,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <s.icon style={{ width: 18, height: 18, color: "#f59e0b" }} />
                </div>
                <div
                  style={{
                    color: headClr,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    marginBottom: 8,
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{
                    color: subClr,
                    fontSize: "0.83rem",
                    lineHeight: 1.6,
                  }}
                >
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*  Plans  */}
        <div style={{ marginBottom: 56 }}>
          <h2
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 700,
              fontSize: "1.8rem",
              color: headClr,
              marginBottom: 8,
            }}
          >
            {t("choose_your_challenge")}
          </h2>
          <p style={{ color: subClr, fontSize: "0.9rem", marginBottom: 24 }}>
            {t("choose_challenge_subtitle")}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                onClick={() => setSelected(plan.name)}
                style={{
                  background:
                    selected === plan.name ? `${plan.color}12` : cardBg,
                  border: `2px solid ${selected === plan.name ? plan.color : cardBorder}`,
                  borderRadius: 20,
                  padding: "24px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  position: "relative",
                }}
              >
                {plan.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: -10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: plan.color,
                      color: "#fff",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "3px 12px",
                      borderRadius: 999,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("most_popular")}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: headClr,
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      {plan.name}
                    </div>
                    <div
                      style={{
                        color: plan.color,
                        fontSize: "1.4rem",
                        fontFamily: '"Playfair Display",serif',
                        fontWeight: 700,
                      }}
                    >
                      {plan.capital}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        color: headClr,
                        fontWeight: 700,
                        fontSize: "1.3rem",
                      }}
                    >
                      {plan.price}
                    </div>
                    <div style={{ color: labelClr, fontSize: "0.72rem" }}>
                      {t("one_time_fee")}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    background: `${plan.color}15`,
                    border: `1px solid ${plan.color}30`,
                    borderRadius: 10,
                    padding: "8px 12px",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Star style={{ width: 13, height: 13, color: plan.color }} />
                  <span
                    style={{
                      color: plan.color,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                    }}
                  >
                    {plan.profit} {t("profit_split")}
                  </span>
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: "0.8rem",
                        color: labelClr,
                      }}
                    >
                      <CheckCircle
                        style={{
                          width: 13,
                          height: 13,
                          color: plan.color,
                          flexShrink: 0,
                        }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    width: "100%",
                    padding: "10px",
                    borderRadius: 12,
                    background: plan.color,
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  {t("start_challenge")}{" "}
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/*  CTA  */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: 24,
            padding: "48px 32px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 300,
              height: 150,
              background: "rgba(245,158,11,0.08)",
              filter: "blur(60px)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
          <h2
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 700,
              fontSize: "1.8rem",
              color: headClr,
              marginBottom: 12,
              position: "relative",
            }}
          >
            {t("ready_to_prove_skills")}
          </h2>
          <p
            style={{
              color: subClr,
              fontSize: "0.9rem",
              marginBottom: 28,
              position: "relative",
            }}
          >
            {t("join_funded_traders")}
          </p>
          <Link
            to="/register"
            className="gold-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              borderRadius: 14,
              textDecoration: "none",
              fontSize: "0.95rem",
              position: "relative",
            }}
          >
            {t("get_funded_today")}{" "}
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </div>
    </FeatureLayout>
  );
}
