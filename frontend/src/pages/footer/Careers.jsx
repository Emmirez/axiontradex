import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Zap,
  Heart,
  Globe,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  FeaturePage,
  FeatureHero,
  FeatureCard,
  CTABanner,
} from "../features/FeatureLayout";

export default function Careers() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const [activeDept, setActiveDept] = useState("All");
  const [openJob, setOpenJob] = useState(null);

  const JOBS = [
    {
      title: t("job_senior_backend"),
      dept: t("dept_engineering"),
      location: t("location_london_remote"),
      type: t("full_time"),
      color: "#f59e0b",
    },
    {
      title: t("job_react_frontend"),
      dept: t("dept_engineering"),
      location: t("location_remote"),
      type: t("full_time"),
      color: "#f59e0b",
    },
    {
      title: t("job_ml_ai_research"),
      dept: t("dept_ai_research"),
      location: t("location_london_singapore"),
      type: t("full_time"),
      color: "#60a5fa",
    },
    {
      title: t("job_quant_analyst"),
      dept: t("dept_trading"),
      location: t("location_london"),
      type: t("full_time"),
      color: "#34d399",
    },
    {
      title: t("job_compliance_officer"),
      dept: t("dept_legal"),
      location: t("location_london_newyork"),
      type: t("full_time"),
      color: "#a78bfa",
    },
    {
      title: t("job_product_manager"),
      dept: t("dept_product"),
      location: t("location_remote"),
      type: t("full_time"),
      color: "#f87171",
    },
    {
      title: t("job_customer_success"),
      dept: t("dept_support"),
      location: t("location_ontario_remote"),
      type: t("full_time"),
      color: "#14b8a6",
    },
    {
      title: t("job_devops"),
      dept: t("dept_engineering"),
      location: t("location_remote"),
      type: t("full_time"),
      color: "#f59e0b",
    },
    {
      title: t("job_ux_ui_designer"),
      dept: t("dept_design"),
      location: t("location_remote"),
      type: t("full_time"),
      color: "#fb923c",
    },
    {
      title: t("job_growth_marketing"),
      dept: t("dept_marketing"),
      location: t("location_remote"),
      type: t("full_time"),
      color: "#e879f9",
    },
  ];

  const PERKS = [
    {
      icon: Zap,
      title: t("perk_competitive_salary"),
      desc: t("perk_competitive_salary_desc"),
    },
    {
      icon: Globe,
      title: t("perk_remote_first"),
      desc: t("perk_remote_first_desc"),
    },
    {
      icon: Heart,
      title: t("perk_health_wellness"),
      desc: t("perk_health_wellness_desc"),
    },
    {
      icon: Award,
      title: t("perk_learning_budget"),
      desc: t("perk_learning_budget_desc"),
    },
    {
      icon: Users,
      title: t("perk_team_retreats"),
      desc: t("perk_team_retreats_desc"),
    },
    {
      icon: Briefcase,
      title: t("perk_crypto_benefits"),
      desc: t("perk_crypto_benefits_desc"),
    },
  ];

  const DEPTS = [
    t("dept_all"),
    t("dept_engineering"),
    t("dept_ai_research"),
    t("dept_trading"),
    t("dept_product"),
    t("dept_legal"),
    t("dept_support"),
    t("dept_design"),
    t("dept_marketing"),
  ];

  const STATS = [
    { value: "200+", label: t("stat_team_members"), color: "#f59e0b" },
    { value: "12", label: t("stat_countries"), color: "#34d399" },
    { value: "4.8★", label: t("stat_glassdoor_score"), color: "#60a5fa" },
    { value: "94%", label: t("stat_retention_rate"), color: "#a78bfa" },
  ];

  const filtered =
    activeDept === t("dept_all") ? JOBS : JOBS.filter((j) => j.dept === activeDept);

  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const border = "rgba(245,158,11,0.18)";

  return (
    <FeaturePage>
      <FeatureHero
        badge={t("careers")}
        title={t("careers_title")}
        highlight={t("careers_highlight")}
        subtitle={t("careers_subtitle")}
        icon={Briefcase}
      />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
        {/* Stats */}
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
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: '"Playfair Display",serif',
                  fontWeight: 700,
                  fontSize: "2rem",
                  color: s.color,
                }}
              >
                {s.value}
              </div>
              <div
                style={{ color: mutedClr, fontSize: "0.8rem", marginTop: 4 }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Perks */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 6,
          }}
        >
          {t("why_work_at")} <span className="gold-text">AxionTrade</span>
        </h2>
        <p style={{ color: mutedClr, fontSize: "0.875rem", marginBottom: 24 }}>
          {t("careers_perks_subtitle")}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 56,
          }}
        >
          {PERKS.map((p) => (
            <FeatureCard key={p.title} {...p} />
          ))}
        </div>

        {/* Open roles */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 6,
          }}
        >
          {t("open_positions")}
        </h2>
        <p style={{ color: mutedClr, fontSize: "0.875rem", marginBottom: 20 }}>
          {JOBS.length} {t("open_roles")}{" "}
          {new Set(JOBS.map((j) => j.dept)).size} {t("departments")}.
        </p>

        {/* Dept filter */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 20,
          }}
        >
          {DEPTS.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDept(d)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                border: `1px solid ${activeDept === d ? "rgba(245,158,11,0.5)" : border}`,
                background:
                  activeDept === d ? "rgba(245,158,11,0.12)" : "transparent",
                color: activeDept === d ? "#f59e0b" : mutedClr,
                transition: "all 0.2s",
              }}
            >
              {d}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 60,
          }}
        >
          {filtered.map((job, i) => (
            <div
              key={i}
              style={{
                background: cardBg,
                border: `1px solid ${openJob === i ? "rgba(245,158,11,0.35)" : border}`,
                borderRadius: 16,
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              <button
                onClick={() => setOpenJob(openJob === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 20px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flex: 1,
                    minWidth: 0,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: job.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: textClr,
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    {job.title}
                  </span>
                  <span
                    style={{
                      color: mutedClr,
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <MapPin style={{ width: 11, height: 11 }} />
                    {job.location}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "rgba(245,158,11,0.1)",
                      color: "#f59e0b",
                    }}
                  >
                    {job.dept}
                  </span>
                </div>
                {openJob === i ? (
                  <ChevronUp
                    style={{
                      width: 16,
                      height: 16,
                      color: "#f59e0b",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <ChevronDown
                    style={{
                      width: 16,
                      height: 16,
                      color: mutedClr,
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
              {openJob === i && (
                <div style={{ padding: "0 20px 20px" }}>
                  <p
                    style={{
                      color: mutedClr,
                      fontSize: "0.85rem",
                      lineHeight: 1.7,
                      marginBottom: 16,
                    }}
                  >
                    {t("job_description_prefix")} {job.title} {t("job_description_suffix")} {job.dept} {t("job_description_team")}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      marginBottom: 16,
                    }}
                  >
                    {[job.type, job.location, job.dept].map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: "0.72rem",
                          padding: "3px 10px",
                          borderRadius: 999,
                          background: darkMode
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.05)",
                          color: mutedClr,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Clock style={{ width: 10, height: 10 }} />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    className="gold-btn"
                    style={{
                      padding: "9px 24px",
                      borderRadius: 12,
                      border: "none",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {t("apply_now")} →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <CTABanner
        title={t("cta_dont_see_role")}
        subtitle={t("cta_send_cv")}
      />
    </FeaturePage>
  );
}