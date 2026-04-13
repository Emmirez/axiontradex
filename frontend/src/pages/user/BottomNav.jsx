import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LineChart,
  Download,
  LayoutDashboard,
  Headphones,
  User,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";



export default function BottomNav() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [tapped, setTapped] = useState(null);

  const isActive = (path) => location.pathname === path;

  const handleTap = (path) => {
    setTapped(path);
    setTimeout(() => setTapped(null), 400);
    navigate(path);
  };

  const bg = darkMode ? "rgba(5,10,25,0.97)" : "rgba(252,253,255,0.97)";
  const border = darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  const NAV_ITEMS = [
    {
      label: t("bottom_nav_trade"),
      icon: LineChart,
      path: "/trade",
      color: "#34d399",
    },
    {
      label: t("bottom_nav_deposit"),
      icon: Download,
      path: "/deposit",
      color: "#60a5fa",
    },
    {
      label: t("bottom_nav_home"),
      icon: LayoutDashboard,
      path: "/dashboard",
      color: "#f59e0b",
    },
    {
      label: t("bottom_nav_support"),
      icon: Headphones,
      path: "/support",
      color: "#a78bfa",
    },
    {
      label: t("bottom_nav_profile"),
      icon: User,
      path: "/profile",
      color: "#f472b6",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes bounceIn {
          0%   { transform: translateY(0) scale(1); }
          30%  { transform: translateY(-6px) scale(1.15); }
          55%  { transform: translateY(1px) scale(0.95); }
          75%  { transform: translateY(-2px) scale(1.04); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes ripple {
          0%   { transform: scale(0); opacity: 0.5; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        .bnav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px 4px 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          position: relative;
          -webkit-tap-highlight-color: transparent;
          transition: none;
        }
        .bnav-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.18s ease;
        }
        .bnav-item:active .bnav-icon-wrap {
          transform: scale(0.88);
        }
      `}</style>

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          height: 68,
          background: bg,
          borderTop: `1px solid ${border}`,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          display: "flex",
          alignItems: "stretch",
          padding: "0 4px",
          boxShadow: darkMode
            ? "0 -12px 40px rgba(0,0,0,0.45)"
            : "0 -8px 32px rgba(0,0,0,0.08)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {NAV_ITEMS.map(({ label, icon: Icon, path, color }) => {
          const active = isActive(path);
          const tapping = tapped === path;

          return (
            <button
              key={path}
              className="bnav-item"
              onClick={() => handleTap(path)}
            >
              {/* Ripple on tap */}
              {tapping && (
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: `${color}40`,
                    transform: "translate(-50%, -50%) scale(0)",
                    animation: "ripple 0.4s ease-out forwards",
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Icon */}
              <div className="bnav-icon-wrap">
                {active ? (
                  <div
                    style={{
                      position: "relative",
                      width: 48,
                      height: 32,
                      borderRadius: 16,
                      background: `linear-gradient(135deg, ${color}30, ${color}18)`,
                      border: `1px solid ${color}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: tapping
                        ? "bounceIn 0.4s cubic-bezier(0.36,0.07,0.19,0.97)"
                        : "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: -4,
                        borderRadius: 20,
                        background: `radial-gradient(ellipse, ${color}30 0%, transparent 70%)`,
                        animation: "glowPulse 2.4s ease-in-out infinite",
                        pointerEvents: "none",
                      }}
                    />
                    <Icon
                      style={{
                        width: 17,
                        height: 17,
                        color,
                        position: "relative",
                        filter: `drop-shadow(0 0 4px ${color}90)`,
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: tapping
                        ? "bounceIn 0.4s cubic-bezier(0.36,0.07,0.19,0.97)"
                        : "none",
                    }}
                  >
                    <Icon
                      style={{
                        width: 17,
                        height: 17,
                        color: darkMode
                          ? "rgba(148,163,184,0.7)"
                          : "rgba(100,116,139,0.75)",
                        transition: "color 0.2s",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: active ? 700 : 500,
                  color: active
                    ? color
                    : darkMode
                      ? "rgba(148,163,184,0.6)"
                      : "rgba(100,116,139,0.65)",
                  letterSpacing: active ? "0.01em" : "0",
                  transition: "color 0.2s",
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Spacer so page content clears the nav */}
      <div style={{ height: 68 }} />
    </>
  );
}
