import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { FeaturePage, FeatureHero } from "../features/FeatureLayout";

function Section({ sec, isOpen, onToggle }) {
  const { darkMode } = useTheme();
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#64748b";
  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const border = isOpen ? "rgba(245,158,11,0.35)" : "rgba(245,158,11,0.15)";

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${border}`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 22px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: 12,
        }}
      >
        <span style={{ color: textClr, fontWeight: 600, fontSize: "0.9rem" }}>
          {sec.title}
        </span>
        {isOpen ? (
          <ChevronUp
            style={{ width: 16, height: 16, color: "#f59e0b", flexShrink: 0 }}
          />
        ) : (
          <ChevronDown
            style={{ width: 16, height: 16, color: mutedClr, flexShrink: 0 }}
          />
        )}
      </button>
      {isOpen && (
        <div
          style={{
            padding: "0 22px 20px",
            color: mutedClr,
            fontSize: "0.875rem",
            lineHeight: 1.8,
            whiteSpace: "pre-line",
          }}
        >
          {sec.content}
        </div>
      )}
    </div>
  );
}

export default function TermsOfService() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const [openIdx, setOpenIdx] = useState(0);
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";

  const SECTIONS = [
    {
      title: t("terms_section_1_title"),
      content: t("terms_section_1_content"),
    },
    {
      title: t("terms_section_2_title"),
      content: t("terms_section_2_content"),
    },
    {
      title: t("terms_section_3_title"),
      content: t("terms_section_3_content"),
    },
    {
      title: t("terms_section_4_title"),
      content: t("terms_section_4_content"),
    },
    {
      title: t("terms_section_5_title"),
      content: t("terms_section_5_content"),
    },
    {
      title: t("terms_section_6_title"),
      content: t("terms_section_6_content"),
    },
    {
      title: t("terms_section_7_title"),
      content: t("terms_section_7_content"),
    },
    {
      title: t("terms_section_8_title"),
      content: t("terms_section_8_content"),
    },
    {
      title: t("terms_section_9_title"),
      content: t("terms_section_9_content"),
    },
    {
      title: t("terms_section_10_title"),
      content: t("terms_section_10_content"),
    },
  ];

  return (
    <FeaturePage>
      <FeatureHero
        badge={t("legal")}
        title={t("terms_of")}
        highlight={t("service_dot")}
        subtitle={t("terms_subtitle")}
        icon={FileText}
      />
      <div
        style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 60px" }}
      >
        <div
          style={{
            background: cardBg,
            border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: 20,
            padding: "20px 24px",
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <FileText
            style={{ width: 18, height: 18, color: "#f59e0b", flexShrink: 0 }}
          />
          <div>
            <span
              style={{ color: textClr, fontWeight: 600, fontSize: "0.85rem" }}
            >
              {t("last_updated_terms")}
            </span>
            <span
              style={{ color: mutedClr, fontSize: "0.78rem", marginLeft: 12 }}
            >
              {t("effective_immediately")}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SECTIONS.map((sec, i) => (
            <Section
              key={i}
              sec={sec}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </div>

        <p
          style={{
            color: mutedClr,
            fontSize: "0.8rem",
            lineHeight: 1.7,
            marginTop: 32,
            textAlign: "center",
          }}
        >
          {t("terms_contact_question")}{" "}
          <a
            href="mailto:legal@axiontrade.com"
            style={{ color: "#f59e0b", textDecoration: "none" }}
          >
            legal@axiontrade.com
          </a>
        </p>
      </div>
    </FeaturePage>
  );
}
