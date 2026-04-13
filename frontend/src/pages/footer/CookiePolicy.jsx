import React, { useState } from "react";
import {
  Cookie,
  Settings,
  Shield,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { FeaturePage, FeatureHero } from "../features/FeatureLayout";

export default function CookiePolicy() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const COOKIE_TYPES = [
    {
      name: t("essential_cookies"),
      icon: Shield,
      description: t("essential_cookies_desc"),
      examples: [
        t("example_auth"),
        t("example_security"),
        t("example_load_balancing"),
      ],
      required: true,
      color: "#34d399",
    },
    {
      name: t("functional_cookies"),
      icon: Settings,
      description: t("functional_cookies_desc"),
      examples: [
        t("example_language"),
        t("example_theme"),
        t("example_preferences"),
      ],
      required: false,
      color: "#60a5fa",
    },
    {
      name: t("analytics_cookies"),
      icon: RefreshCw,
      description: t("analytics_cookies_desc"),
      examples: [
        t("example_page_views"),
        t("example_click_tracking"),
        t("example_session_duration"),
      ],
      required: false,
      color: "#f59e0b",
    },
    {
      name: t("marketing_cookies"),
      icon: Info,
      description: t("marketing_cookies_desc"),
      examples: [
        t("example_ad_retargeting"),
        t("example_social_tracking"),
        t("example_campaign_performance"),
      ],
      required: false,
      color: "#a78bfa",
    },
  ];

  const FAQS = [
    { q: t("cookies_faq_1_q"), a: t("cookies_faq_1_a") },
    { q: t("cookies_faq_2_q"), a: t("cookies_faq_2_a") },
    { q: t("cookies_faq_3_q"), a: t("cookies_faq_3_a") },
    { q: t("cookies_faq_4_q"), a: t("cookies_faq_4_a") },
    { q: t("cookies_faq_5_q"), a: t("cookies_faq_5_a") },
  ];

  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const cardBg = darkMode ? "rgba(15,23,42,0.6)" : "rgba(248,250,252,0.8)";
  const border = "rgba(245,158,11,0.18)";

  return (
    <FeaturePage>
      <FeatureHero
        badge={t("legal")}
        title={t("cookie_title")}
        highlight={t("cookie_highlight")}
        subtitle={t("cookie_subtitle")}
        icon={Cookie}
      />

      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 60px" }}
      >
        {/* Introduction */}
        <div style={{ marginBottom: 48 }}>
          <p
            style={{
              color: mutedClr,
              fontSize: "1rem",
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            {t("cookie_intro")}
          </p>
          <p style={{ color: mutedClr, fontSize: "0.85rem" }}>
            {t("last_updated_cookie")}
          </p>
        </div>

        {/* Cookie Types */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 24,
          }}
        >
          {t("types_of_cookies")}{" "}
          <span className="gold-text">{t("cookies_use")}</span>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 48,
          }}
        >
          {COOKIE_TYPES.map((cookie) => (
            <div
              key={cookie.name}
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${cookie.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <cookie.icon
                    style={{ width: 20, height: 20, color: cookie.color }}
                  />
                </div>
                <div>
                  <h3
                    style={{
                      color: textClr,
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {cookie.name}
                  </h3>
                  {cookie.required && (
                    <span style={{ fontSize: "0.65rem", color: "#34d399" }}>
                      {t("required")}
                    </span>
                  )}
                </div>
              </div>
              <p
                style={{
                  color: mutedClr,
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  marginBottom: 12,
                }}
              >
                {cookie.description}
              </p>
              <div style={{ marginTop: 12 }}>
                <span
                  style={{
                    color: mutedClr,
                    fontSize: "0.7rem",
                    fontWeight: 500,
                  }}
                >
                  {t("examples")}:
                </span>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 6,
                  }}
                >
                  {cookie.examples.map((ex) => (
                    <span
                      key={ex}
                      style={{
                        fontSize: "0.7rem",
                        padding: "2px 8px",
                        background: `${cookie.color}10`,
                        borderRadius: 12,
                        color: cookie.color,
                      }}
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How to Control Cookies */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 24,
          }}
        >
          {t("how_to_control_cookies")}{" "}
          <span className="gold-text">{t("cookies_control")}</span>
        </h2>
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: "24px",
            marginBottom: 48,
          }}
        >
          <p
            style={{
              color: mutedClr,
              fontSize: "0.9rem",
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            {t("control_cookies_intro")}
          </p>
          <ul
            style={{
              color: mutedClr,
              fontSize: "0.85rem",
              lineHeight: 1.8,
              marginBottom: 16,
              paddingLeft: 20,
            }}
          >
            <li>{t("control_cookies_1")}</li>
            <li>{t("control_cookies_2")}</li>
            <li>{t("control_cookies_3")}</li>
            <li>{t("control_cookies_4")}</li>
            <li>{t("control_cookies_5")}</li>
          </ul>
          <p style={{ color: mutedClr, fontSize: "0.85rem" }}>
            {t("control_cookies_more_info")}{" "}
            <a href="#" style={{ color: "#f59e0b", textDecoration: "none" }}>
              aboutcookies.org
            </a>
            .
          </p>
        </div>

        {/* FAQ */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 24,
          }}
        >
          {t("frequently_asked_questions")}{" "}
          <span className="gold-text">{t("questions")}</span>
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 48,
          }}
        >
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{
                background: cardBg,
                border: `1px solid ${expandedFaq === i ? "rgba(245,158,11,0.35)" : border}`,
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
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
                <span
                  style={{
                    color: textClr,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {faq.q}
                </span>
                {expandedFaq === i ? (
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
              {expandedFaq === i && (
                <div
                  style={{
                    padding: "0 20px 18px",
                    color: mutedClr,
                    fontSize: "0.875rem",
                    lineHeight: 1.7,
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div
          style={{
            textAlign: "center",
            padding: "32px",
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
          }}
        >
          <h3
            style={{
              color: textClr,
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            {t("cookies_contact_title")}
          </h3>
          <p style={{ color: mutedClr, fontSize: "0.85rem", marginBottom: 16 }}>
            {t("cookies_contact_desc")}{" "}
            <a
              href="mailto:privacy@axiontrade.com"
              style={{ color: "#f59e0b", textDecoration: "none" }}
            >
              privacy@axiontrade.com
            </a>
          </p>
        </div>
      </div>
    </FeaturePage>
  );
}
