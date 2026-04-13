import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  TrendingUp,
  Sun,
  Moon,
  User,
  Menu,
  X,
  ChevronDown,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import GoogleTranslator from "./GoogleTranslator";
import { useTranslation } from "react-i18next";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  {
    label: "Features",
    href: "#features",
    sub: [
      { label: "Copy Trading", href: "/copy-trading" },
      { label: "Trading Bot", href: "/trading-bot" },
      { label: "Automated Trading", href: "/automated" },
      { label: "AI Trading", href: "/ai-trading" },
      { label: "Get Funded", href: "/funded" },
    ],
  },
  {
    label: "Products",
    href: "#products",
    sub: [
      { label: "Gold", href: "/gold" },
      { label: "Stocks & Funds", href: "/stocks" },
      { label: "Cash Management", href: "/cash" },
    ],
  },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const NAV_ITEMS = [
    { label: t("nav_home"), href: "/" },
    {
      label: t("nav_features"),
      href: "#features",
      sub: [
        { label: t("nav_copy_trading"), href: "/copy-trading" },
        { label: t("nav_trading_bot"), href: "/trading-bot" },
        { label: t("nav_automated"), href: "/automated" },
        { label: t("nav_ai_trading"), href: "/ai-trading" },
        { label: t("nav_get_funded"), href: "/funded" },
      ],
    },
    {
      label: t("nav_products"),
      href: "#products",
      sub: [
        { label: t("nav_gold"), href: "/gold" },
        { label: t("nav_stocks_funds"), href: "/stocks" },
        { label: t("nav_cash_management"), href: "/cash" },
      ],
    },
    { label: t("nav_about_us"), href: "/about" },
    { label: t("nav_contact"), href: "/contact" },
  ];

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [userDropdown, setUserDropdown] = useState(false);

  const userRef = useRef(null);
  const leaveTimer = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMouseEnter = (label) => {
    clearTimeout(leaveTimer.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 120);
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileExpanded(null);
  };

  return (
    <>
      <style>{`
        .nav-dropdown-bridge::before {
          content: '';
          position: absolute;
          top: -8px;
          left: 0;
          right: 0;
          height: 8px;
        }
      `}</style>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-xl shadow-black/30" : "bg-transparent"}`}
      >
        {/* Desktop bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 shrink-0"
              style={{ textDecoration: "none" }}
            >
              <div className="w-9 h-9 rounded-xl gold-btn flex items-center justify-center">
                <TrendingUp className="w-5 h-5" style={{ color: "#020617" }} />
              </div>
              <span className="font-display font-bold text-xl navbar-logo-text">
                Axion<span className="gold-text">Trade</span><span style={{ color: darkMode ? "#ffffff" : "#0f172a" }}>X</span>
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.sub && handleMouseEnter(item.label)}
                  onMouseLeave={() => item.sub && handleMouseLeave()}
                >
                  {item.href.startsWith("/") && !item.sub ? (
                    <Link
                      to={item.href}
                      className="nav-link flex items-center gap-1"
                      style={{ textDecoration: "none" }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      className="nav-link flex items-center gap-1"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      onClick={() =>
                        item.href.startsWith("/") && navigate(item.href)
                      }
                    >
                      {item.label}
                      {item.sub && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180" : ""}`}
                        />
                      )}
                    </button>
                  )}

                  {/* Dropdown */}
                  {item.sub && activeDropdown === item.label && (
                    <div
                      className="nav-dropdown-bridge absolute top-full left-0 mt-1 w-52 rounded-2xl p-2 shadow-2xl border border-yellow-500/20"
                      style={{
                        background: darkMode
                          ? "rgba(10,15,30,0.97)"
                          : "rgba(255,255,255,0.98)",
                        backdropFilter: "blur(24px)",
                        zIndex: 100,
                      }}
                      onMouseEnter={() => handleMouseEnter(item.label)}
                      onMouseLeave={() => handleMouseLeave()}
                    >
                      {item.sub.map((s) => (
                        <Link
                          key={s.label}
                          to={s.href}
                          onClick={() => setActiveDropdown(null)}
                          style={{
                            color: darkMode ? "#94a3b8" : "#475569",
                            textDecoration: "none",
                            display: "block",
                            padding: "10px 12px",
                            borderRadius: 12,
                            transition: "all 0.15s",
                            fontSize: "0.875rem",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#f59e0b";
                            e.currentTarget.style.background =
                              "rgba(245,158,11,0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = darkMode
                              ? "#94a3b8"
                              : "#475569";
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <GoogleTranslator />
              {/* Theme toggle */}
              <div style={{ position: "relative" }} className="group">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-9 h-9 flex items-center justify-center rounded-full glass text-slate-300 hover:text-yellow-400 transition-all border border-white/10"
                >
                  {darkMode ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>

                {/* Custom tooltip */}
                <div
                  className="hidden lg:block  absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
                  style={{
                    background: darkMode
                      ? "rgba(10,15,30,0.97)"
                      : "rgba(255,255,255,0.98)",
                    border: `1px solid ${darkMode ? "rgba(245,158,11,0.25)" : "rgba(0,0,0,0.1)"}`,
                    borderRadius: 10,
                    padding: "6px 12px",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    color: darkMode ? "#cbd5e1" : "#334155",
                    whiteSpace: "nowrap",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    zIndex: 999,
                  }}
                >
                  {t("toggle_theme")}
                </div>
              </div>

              {/* User dropdown */}
              <div ref={userRef} style={{ position: "relative" }}>
                <div style={{ position: "relative" }} className="group">
                  <button
                    onClick={() => setUserDropdown((v) => !v)}
                    className="w-9 h-9 flex items-center justify-center rounded-full glass text-slate-300 hover:text-yellow-400 transition-all border border-white/10"
                  >
                    <User className="w-4 h-4" />
                  </button>

                  {/* Custom tooltip */}
                  {!userDropdown && (
                    <div
                      className="hidden lg:block  absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
                      style={{
                        background: darkMode
                          ? "rgba(10,15,30,0.97)"
                          : "rgba(255,255,255,0.98)",
                        border: `1px solid ${darkMode ? "rgba(245,158,11,0.25)" : "rgba(0,0,0,0.1)"}`,
                        borderRadius: 10,
                        padding: "6px 12px",
                        fontSize: "0.78rem",
                        fontWeight: 500,
                        color: darkMode ? "#cbd5e1" : "#334155",
                        whiteSpace: "nowrap",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                        zIndex: 999,
                      }}
                    >
                       {t("account")}
                    </div>
                  )}
                </div>
                {userDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      width: 180,
                      borderRadius: 16,
                      padding: 8,
                      background: darkMode
                        ? "rgba(10,15,30,0.97)"
                        : "rgba(255,255,255,0.98)",
                      border: `1px solid ${darkMode ? "rgba(245,158,11,0.2)" : "rgba(0,0,0,0.1)"}`,
                      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                      backdropFilter: "blur(20px)",
                      zIndex: 100,
                    }}
                  >
                    {[
                      { label: t("sign_in"), icon: LogIn, path: "/login" },
                      { label: t("register"), icon: UserPlus, path: "/register" },
                    ].map(({ label, icon: Icon, path }) => (
                      <button
                        key={label}
                        onClick={() => {
                          setUserDropdown(false);
                          navigate(path);
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 14px",
                          borderRadius: 12,
                          border: "none",
                          background: "transparent",
                          color: darkMode ? "#cbd5e1" : "#334155",
                          fontSize: "0.875rem",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(245,158,11,0.1)";
                          e.currentTarget.style.color = "#f59e0b";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = darkMode
                            ? "#cbd5e1"
                            : "#334155";
                        }}
                      >
                        <Icon style={{ width: 15, height: 15 }} />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sign Up button — desktop */}
              <button
                onClick={() => navigate("/register")}
                className="hidden lg:flex items-center gap-1.5 gold-btn px-5 py-2 rounded-full text-sm border-0 cursor-pointer"
              >
                {t("sign_up")}
              </button>

              {/* Hamburger — mobile */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full glass text-slate-300 hover:text-yellow-400 transition-all border border-white/10"
              >
                {mobileOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="glass border-t border-white/5 px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                {item.sub ? (
                  <>
                    <button
                      onClick={() =>
                        setMobileExpanded((e) =>
                          e === item.label ? null : item.label,
                        )
                      }
                      className="w-full flex items-center justify-between px-4 py-3 text-slate-300 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-xl transition-all text-sm font-medium"
                    >
                      {item.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${mobileExpanded === item.label ? "rotate-180" : ""}`}
                      />
                    </button>
                    {mobileExpanded === item.label && (
                      <div className="ml-4 pl-4 border-l border-yellow-500/20 space-y-0.5 mt-0.5">
                        {item.sub.map((s) => (
                          <Link
                            key={s.label}
                            to={s.href}
                            onClick={closeMobile}
                            style={{ textDecoration: "none" }}
                            className="block px-3 py-2.5 text-sm text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all"
                          >
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.href}
                    onClick={closeMobile}
                    style={{ textDecoration: "none" }}
                    className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-xl transition-all"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            {/* Mobile auth buttons */}
            <div className="pt-3 flex gap-3">
              <button
                onClick={() => {
                  closeMobile();
                  navigate("/login");
                }}
                className="flex-1 text-center px-4 py-2.5 rounded-xl border border-yellow-500/30 text-yellow-400 text-sm font-medium hover:bg-yellow-500/10 transition-all bg-transparent cursor-pointer"
              >
                {t("sign_in")}
              </button>
              <button
                onClick={() => {
                  closeMobile();
                  navigate("/register");
                }}
                className="flex-1 text-center gold-btn px-4 py-2.5 rounded-xl text-sm border-0 cursor-pointer"
              >
                {t("register")}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
