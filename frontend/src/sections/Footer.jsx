import React from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Twitter,
  Github,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";



export default function Footer(darkMode,) {
  const { t } = useTranslation();

   const FOOTER_LINKS = {
    [t("products")]: [
      { label: t("exchange"), to: "/exchange" },
      { label: t("spot_trading"), to: "/spot-trading" },
      { label: t("futures"), to: "/futures" },
      { label: t("options"), to: "/options" },
      { label: t("staking"), to: "/staking" },
      { label: t("gold"), to: "/gold" },
      { label: t("earn"), to: "/earn" },
    ],
    [t("company")]: [
      { label: t("about_us"), to: "/about" },
      { label: t("press"), to: "/press" },
      { label: t("careers"), to: "/careers" },
      { label: t("blog"), to: "/blog" },
    ],
    [t("support")]: [
      { label: t("help_center"), to: "/help-center" },
      { label: t("api_docs"), to: "/api-docs" },
      { label: t("status"), to: "/status" },
      { label: t("contact_us"), to: "/contact" },
    ],
    [t("legal")]: [
      { label: t("privacy_policy"), to: "/privacy-policy" },
      { label: t("terms_of_service"), to: "/terms-of-service" },
      { label: t("aml_policy"), to: "/aml-policy" },
    ],
  };

  const SOCIALS = [
    { Icon: Twitter, href: "#", label: "Twitter" },
    { Icon: Github, href: "#", label: "GitHub" },
    { Icon: Linkedin, href: "#", label: "LinkedIn" },
    { Icon: MessageCircle, href: "#", label: "Discord" },
  ];

  return (
    <footer
      className="border-t"
      style={{ borderColor: "rgba(255,255,255,0.05)", background: "#020617" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Top grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2">
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
                textDecoration: "none",
              }}
            >
              <div className="w-9 h-9 rounded-xl gold-btn flex items-center justify-center">
                <TrendingUp className="w-5 h-5" style={{ color: "#020617" }} />
              </div>
              <span
                className="font-display font-bold text-xl"
                style={{ color: "#f1f5f9" }}
              >
                Axion<span className="gold-text">Trade</span><span style={{ color: darkMode ? "#ffffff" : "#0f172a" }}>X</span>
              </span>
            </Link>

            <p
              style={{
                color: "#64748b",
                fontSize: "0.875rem",
                lineHeight: 1.6,
                maxWidth: "18rem",
                marginBottom: "1.25rem",
              }}
            >
           {t("footer_description")}
            </p>

            {/* Socials */}
            <div style={{ display: "flex", gap: 12 }}>
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  title={label}
                  className="w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center transition-all"
                  style={{ color: "#64748b", textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#f59e0b";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#64748b";
                  }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4
                className="font-semibold text-sm mb-4"
                style={{ color: "#f1f5f9" }}
              >
                {heading}
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      style={{
                        color: "#475569",
                        fontSize: "0.875rem",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#f59e0b";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#475569";
                      }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/*  Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "2rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <p style={{ color: "#334155", fontSize: "0.875rem" }}>
            © 2025 AxionTradeX. {t("all_rights_reserved")}
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 24,
            }}
          >
            {[t("soc2_certified"),  t("under_10ms_execution"), t("one_eighty_countries")].map(
              (badge) => (
                <span
                  key={badge}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#334155",
                    fontSize: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#f59e0b",
                      display: "inline-block",
                    }}
                  />
                  {badge}
                </span>
              ),
            )}
          </div>
        </div>

        <p
          style={{
            color: "#1e293b",
            fontSize: "0.75rem",
            textAlign: "center",
            marginTop: "1rem",
          }}
        >
           {t("trading_risk_warning")}
        </p>
      </div>
    </footer>
  );
}
