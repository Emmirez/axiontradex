import React from "react";
import { useTranslation } from "react-i18next";
import {
  Newspaper,
  Award,
  Calendar,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { FeaturePage, FeatureHero, CTABanner } from "../features/FeatureLayout";

const PRESS_RELEASES = [
  {
    date: "March 15, 2026",
    title: "AxionTrade Launches AI-Powered Trading Bot with 78% Win Rate",
    category: "Product Launch",
    link: "#",
  },
  {
    date: "February 28, 2026",
    title: "AxionTrade Secures $50M Series B Funding Led by Sequoia Capital",
    category: "Funding",
    link: "#",
  },
  {
    date: "January 10, 2026",
    title: "AxionTrade Reaches 2 Million Active Users, Up 150% YoY",
    category: "Milestone",
    link: "#",
  },
  {
    date: "December 5, 2025",
    title: "AxionTrade Partners with Visa for Crypto Debit Card Program",
    category: "Partnership",
    link: "#",
  },
];

const AWARDS = [
  {
    year: "2026",
    title: "Best Crypto Exchange",
    organization: "Crypto Awards",
    icon: "🏆",
  },
  {
    year: "2025",
    title: "Most Innovative Trading Platform",
    organization: "FinTech Magazine",
    icon: "⭐",
  },
  {
    year: "2025",
    title: "Best Customer Support",
    organization: "Crypto Insider",
    icon: "🎖️",
  },
];

const MEDIA_COVERAGE = [
  {
    outlet: "Bloomberg",
    title: "Crypto Trading Platform AxionTrade Hits $10B Daily Volume",
    link: "#",
    logo: "Bloomberg",
  },
  {
    outlet: "CoinDesk",
    title: "AxionTrade Introduces AI Trading Bot to Retail Users",
    link: "#",
    logo: "CoinDesk",
  },
  {
    outlet: "TechCrunch",
    title: "AxionTrade Raises $50M to Expand AI Trading Features",
    link: "#",
    logo: "TechCrunch",
  },
  {
    outlet: "The Block",
    title: "AxionTrade Market Share Grows to 8% in Q1 2026",
    link: "#",
    logo: "The Block",
  },
];

export default function Press() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const border = "rgba(245,158,11,0.18)";

  return (
    <FeaturePage>
      <FeatureHero
        badge={t("press_room")}
        title={t("press_media")}
        highlight={t("coverage")}
        subtitle={t("press_subtitle")}
        icon={Newspaper}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
        {/* Recent Press Releases */}
        <div style={{ marginBottom: 60 }}>
          <h2
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 700,
              fontSize: "1.8rem",
              color: textClr,
              marginBottom: 24,
            }}
          >
            {t("recent_press_releases")}
          </h2>
          <div style={{ display: "grid", gap: 16 }}>
            {PRESS_RELEASES.map((pr) => (
              <div
                key={pr.title}
                style={{
                  background: darkMode
                    ? "rgba(15,23,42,0.6)"
                    : "rgba(248,250,252,0.8)",
                  border: `1px solid ${border}`,
                  borderRadius: 16,
                  padding: "20px",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
                onClick={() => (window.location.href = pr.link)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: "#f59e0b",
                      fontSize: "0.75rem",
                    }}
                  >
                    <Calendar className="w-3 h-3" /> {pr.date}
                  </span>
                  <span
                    style={{
                      background: "rgba(245,158,11,0.15)",
                      color: "#f59e0b",
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: "0.7rem",
                    }}
                  >
                    {pr.category}
                  </span>
                </div>
                <h3
                  style={{
                    color: textClr,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  {pr.title}
                </h3>
                <a
                  href={pr.link}
                  style={{
                    color: "#f59e0b",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    textDecoration: "none",
                  }}
                >
                  {t("read_full_release")} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Awards & Recognition */}
        <div style={{ marginBottom: 60 }}>
          <h2
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 700,
              fontSize: "1.8rem",
              color: textClr,
              marginBottom: 24,
            }}
          >
            {t("awards_recognition")}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {AWARDS.map((award) => (
              <div
                key={award.title}
                style={{
                  textAlign: "center",
                  padding: "24px",
                  background: darkMode
                    ? "rgba(15,23,42,0.6)"
                    : "rgba(248,250,252,0.8)",
                  border: `1px solid ${border}`,
                  borderRadius: 20,
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>
                  {award.icon}
                </div>
                <div
                  style={{
                    color: "#f59e0b",
                    fontSize: "0.9rem",
                    marginBottom: 8,
                  }}
                >
                  {award.year}
                </div>
                <h3
                  style={{
                    color: textClr,
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  {award.title}
                </h3>
                <div style={{ color: mutedClr, fontSize: "0.8rem" }}>
                  {award.organization}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Coverage */}
        <div style={{ marginBottom: 60 }}>
          <h2
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 700,
              fontSize: "1.8rem",
              color: textClr,
              marginBottom: 24,
            }}
          >
            {t("in_the_news")}
          </h2>
          <div style={{ display: "grid", gap: 12 }}>
            {MEDIA_COVERAGE.map((media) => (
              <a
                key={media.title}
                href={media.link}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    background: darkMode
                      ? "rgba(15,23,42,0.4)"
                      : "rgba(248,250,252,0.6)",
                    border: `1px solid ${border}`,
                    borderRadius: 12,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = darkMode
                      ? "rgba(245,158,11,0.1)"
                      : "rgba(245,158,11,0.05)")
                  }
                >
                  <div>
                    <div
                      style={{
                        color: "#f59e0b",
                        fontSize: "0.7rem",
                        marginBottom: 4,
                      }}
                    >
                      {media.outlet}
                    </div>
                    <div
                      style={{
                        color: textClr,
                        fontSize: "0.9rem",
                        fontWeight: 500,
                      }}
                    >
                      {media.title}
                    </div>
                  </div>
                  <ExternalLink
                    className="w-4 h-4"
                    style={{ color: mutedClr }}
                  />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Media Kit */}
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            background: darkMode
              ? "rgba(15,23,42,0.6)"
              : "rgba(248,250,252,0.8)",
            border: `1px solid ${border}`,
            borderRadius: 24,
            marginBottom: 60,
          }}
        >
          <h3
            style={{
              color: textClr,
              fontSize: "1.3rem",
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            {t("media_kit")}
          </h3>
          <p style={{ color: mutedClr, marginBottom: 20 }}>
            {t("media_kit_desc")}
          </p>
          <button
            className="gold-btn"
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => (window.location.href = "/contact")}
          >
            {t("download_media_kit")}
          </button>
        </div>
      </div>
      <CTABanner
        title={t("media_inquiries")}
        subtitle={t("media_inquiries_subtitle")}
      />
    </FeaturePage>
  );
}
