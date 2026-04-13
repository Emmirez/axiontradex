import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", name: "English",    flag: "https://flagcdn.com/w40/us.png" },
  { code: "es", name: "Español",    flag: "https://flagcdn.com/w40/es.png" },
  { code: "fr", name: "Français",   flag: "https://flagcdn.com/w40/fr.png" },
  { code: "de", name: "Deutsch",    flag: "https://flagcdn.com/w40/de.png" },
  { code: "zh", name: "中文",        flag: "https://flagcdn.com/w40/cn.png" },
  { code: "ja", name: "日本語",      flag: "https://flagcdn.com/w40/jp.png" },
  { code: "ko", name: "한국어",      flag: "https://flagcdn.com/w40/kr.png" },
  { code: "ru", name: "Русский",    flag: "https://flagcdn.com/w40/ru.png" },
  { code: "ar", name: "العربية",    flag: "https://flagcdn.com/w40/sa.png" },
  { code: "pt", name: "Português",  flag: "https://flagcdn.com/w40/pt.png" },
  { code: "it", name: "Italiano",   flag: "https://flagcdn.com/w40/it.png" },
  { code: "nl", name: "Nederlands", flag: "https://flagcdn.com/w40/nl.png" },
  { code: "tr", name: "Türkçe",     flag: "https://flagcdn.com/w40/tr.png" },
  { code: "af", name: "Afrikaans",  flag: "https://flagcdn.com/w40/za.png" },
  { code: "hi", name: "हिन्दी",     flag: "https://flagcdn.com/w40/in.png" },
];

export default function GoogleTranslator() {
  const { darkMode } = useTheme();
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // RTL support for Arabic
  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  const handleSelect = (lang) => {
    i18n.changeLanguage(lang.code);
    setIsOpen(false);
  };

  const textClr  = darkMode ? "#f1f5f9"              : "#0f172a";
  const cardBg   = darkMode ? "rgba(15,23,42,0.97)"  : "rgba(255,255,255,0.98)";
  const border   = "rgba(245,158,11,0.2)";
  const mutedClr = darkMode ? "#64748b"              : "#94a3b8";

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>

      {/* Trigger button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 32,
          padding: "4px 8px",
          display: "flex",
          alignItems: "center",
          gap: 4,
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#f59e0b";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = border;
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <img
          src={current.flag}
          alt={current.name}
          style={{ width: 16, height: 16, borderRadius: "50%", objectFit: "cover" }}
        />
        <ChevronDown
          size={9}
          color={mutedClr}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 12,
            padding: 4,
            minWidth: 160,
            maxHeight: 360,
            overflowY: "auto",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            backdropFilter: "blur(10px)",
            zIndex: 999,
          }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang)}
              style={{
                width: "100%",
                padding: "6px 10px",
                background: current.code === lang.code ? "rgba(245,158,11,0.1)" : "transparent",
                border: "none",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                color: textClr,
                fontSize: "0.75rem",
                textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = current.code === lang.code ? "rgba(245,158,11,0.1)" : "transparent")}
            >
              <img
                src={lang.flag}
                alt={lang.name}
                style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />
              <span style={{ flex: 1 }}>{lang.name}</span>
              {current.code === lang.code && (
                <span style={{ color: "#f59e0b", fontWeight: "bold", fontSize: "0.7rem" }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}