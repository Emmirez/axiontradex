import React from "react";
import {
  Shield,
  Globe,
  Users,
  TrendingUp,
  Award,
  Zap,
  Heart,
  Target,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import {
  FeaturePage,
  FeatureHero,
  StatCard,
  FeatureCard,
  CTABanner,
} from "../pages/features/FeatureLayout";
import cami from "../assets/Cami.jpg";
import raul from "../assets/Raul.jpg";
import wood from "../assets/Wood.jpg";
import festus from "../assets/Festus.jpg";
import loveth from "../assets/Loveth.jpg";
import ruth from "../assets/Ruth.jpg";

export default function AboutUs() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const border = "rgba(245,158,11,0.15)";

  const TEAM = [
    {
      name: "Sarah Reid",
      role: t("ceo_cofounder"),
      avatar: cami,
      color: "#f59e0b",
      bio: t("ceo_bio"),
    },
    {
      name: "Kenneth Sharma",
      role: t("cto_cofounder"),
      avatar: raul,
      color: "#60a5fa",
      bio: t("cto_bio"),
    },
    {
      name: "David Wood",
      role: t("chief_risk_officer"),
      avatar: wood,
      color: "#34d399",
      bio: t("cro_bio"),
    },
    {
      name: "Festus Erwin",
      role: t("head_of_product"),
      avatar: festus,
      color: "#a78bfa",
      bio: t("head_of_product_bio"),
    },
    {
      name: "Cathy Henderson",
      role: t("head_of_security"),
      avatar: loveth,
      color: "#f87171",
      bio: t("head_of_security_bio"),
    },
    {
      name: "Elena Moses",
      role: t("head_of_ai"),
      avatar: ruth,
      color: "#14b8a6",
      bio: t("head_of_ai_bio"),
    },
  ];

  const MILESTONES = [
    {
      year: "2020",
      title: t("founded_2020"),
      desc: t("founded_desc"),
    },
    {
      year: "2021",
      title: t("series_a"),
      desc: t("series_a_desc"),
    },
    {
      year: "2022",
      title: t("one_million_users"),
      desc: t("one_million_users_desc"),
    },
    {
      year: "2023",
      title: t("global_expansion"),
      desc: t("global_expansion_desc"),
    },
    {
      year: "2024",
      title: t("ai_trading"),
      desc: t("ai_trading_desc"),
    },
    {
      year: "2025",
      title: t("get_funded"),
      desc: t("get_funded_desc"),
    },
  ];

  const VALUES = [
    {
      icon: Shield,
      title: t("security_first"),
      desc: t("security_first_desc"),
    },
    {
      icon: Heart,
      title: t("trader_first"),
      desc: t("trader_first_desc"),
    },
    {
      icon: Globe,
      title: t("global_access"),
      desc: t("global_access_desc"),
    },
    {
      icon: Target,
      title: t("radical_transparency"),
      desc: t("radical_transparency_desc"),
    },
    {
      icon: Zap,
      title: t("innovation"),
      desc: t("innovation_desc"),
    },
    {
      icon: Award,
      title: t("excellence"),
      desc: t("excellence_desc"),
    },
  ];

  const STATS = [
    { value: "5M+", label: t("active_traders"), icon: Users, color: "#f59e0b" },
    {
      value: "180+",
      label: t("countries_served"),
      icon: Globe,
      color: "#34d399",
    },
    {
      value: "$5B+",
      label: t("trading_volume"),
      icon: TrendingUp,
      color: "#60a5fa",
    },
    { value: "2020", label: t("founded_2020"), icon: Award, color: "#a78bfa" },
  ];

  return (
    <FeaturePage>
      <FeatureHero
        badge={t("about_us")}
        title={t("built_for_traders_by_traders")}
        highlight={t("by_traders")}
        subtitle={t("about_us_subtitle")}
        icon={Users}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 56,
          }}
        >
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Mission */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 24,
            padding: "40px",
            marginBottom: 56,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 300,
              height: 300,
              background: "rgba(245,158,11,0.04)",
              filter: "blur(60px)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", maxWidth: 720 }}>
            <p
              style={{
                color: "#f59e0b",
                fontSize: "0.8rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 12,
              }}
            >
              {t("our_mission_title")}
            </p>
            <h2
              style={{
                fontFamily: '"Playfair Display",serif',
                fontWeight: 800,
                fontSize: "clamp(1.6rem,4vw,2.5rem)",
                color: textClr,
                lineHeight: 1.2,
                marginBottom: 20,
              }}
            >
               {t("democratise_access")}{" "}
              <span className="gold-text">{t("professional_trading")}</span>
            </h2>
            <p style={{ color: mutedClr, fontSize: "1rem", lineHeight: 1.8 }}>
             {t("democratise_access_desc")}
            </p>
          </div>
        </div>

        {/* Values */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 6,
          }}
        >
          {t("our_values")} <span className="gold-text">{t("values")}</span>
        </h2>
        <p style={{ color: mutedClr, fontSize: "0.875rem", marginBottom: 24 }}>
          {t("values_subtitle")}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 56,
          }}
        >
          {VALUES.map((v) => (
            <FeatureCard key={v.title} {...v} />
          ))}
        </div>

        {/* Timeline */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 6,
          }}
        >
          {t("our_journey")} <span className="gold-text">{t("journey")}</span>
        </h2>
        <p style={{ color: mutedClr, fontSize: "0.875rem", marginBottom: 24 }}>
           {t("journey_subtitle")}
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 56,
          }}
        >
          {MILESTONES.map((m, i) => (
            <div
              key={m.year}
              style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "rgba(245,158,11,0.12)",
                  border: "2px solid #f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    color: "#f59e0b",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                  }}
                >
                  {m.year}
                </span>
              </div>
              <div
                style={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: 16,
                  padding: "16px 20px",
                  flex: 1,
                }}
              >
                <h4
                  style={{
                    color: textClr,
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    marginBottom: 5,
                  }}
                >
                  {m.title}
                </h4>
                <p
                  style={{
                    color: mutedClr,
                    fontSize: "0.85rem",
                    lineHeight: 1.6,
                  }}
                >
                  {m.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Team */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 6,
          }}
        >
          {t("meet_the_team")} <span className="gold-text">{t("team")}</span>
        </h2>
        <p style={{ color: mutedClr, fontSize: "0.875rem", marginBottom: 24 }}>
           {t("team_subtitle")}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            marginBottom: 60,
          }}
        >
          {TEAM.map((member) => (
            <div
              key={member.name}
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: "24px",
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
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
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: member.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    color: textClr,
                    fontWeight: 700,
                    fontSize: "0.95rem",
                  }}
                >
                  {member.name}
                </div>
                <div
                  style={{
                    color: "#f59e0b",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  {member.role}
                </div>
                <p
                  style={{
                    color: mutedClr,
                    fontSize: "0.82rem",
                    lineHeight: 1.6,
                  }}
                >
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CTABanner
        title={t("join_community")}
        subtitle={t("join_community_desc")}
      />
    </FeaturePage>
  );
}
