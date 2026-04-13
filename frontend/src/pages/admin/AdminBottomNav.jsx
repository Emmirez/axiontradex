import React from "react";
import {
  LayoutDashboard,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ITEMS = [
  { key: "overview",     label: "Overview", icon: LayoutDashboard, color: "#f59e0b" },
  { key: "users",        label: "Users",    icon: Users,            color: "#60a5fa" },
  { key: "deposits",     label: "Deposits", icon: ArrowDownCircle,  color: "#34d399" },
  { key: "withdrawals",  label: "Withdraw", icon: ArrowUpCircle,    color: "#f87171" },
  { key: "trades",       label: "Trades",   icon: Activity,         color: "#a78bfa" },
];

export default function AdminBottomNav({ section, setSection }) {
  const { darkMode } = useTheme();

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          height: 64,
          display: "flex",
          background: darkMode ? "#0a1023" : "#ffffff",
          borderTop: darkMode
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
        }}
      >
        {ITEMS.map(({ key, label, icon: Icon, color }) => {
          const active = section === key;
          return (
            <button
              key={key}
              onClick={() => setSection(key)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: "6px 2px",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 26,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  // active: colored bg, inactive dark: subtle border pill, inactive light: nothing
                  background: active
                    ? `${color}20`
                    : darkMode ? "rgba(255,255,255,0.05)" : "transparent",
                  border: active
                    ? `1px solid ${color}40`
                    : darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                  transition: "background 0.15s, border 0.15s",
                }}
              >
                <Icon
                  style={{
                    width: 16,
                    height: 16,
                    color: active
                      ? color
                      : darkMode ? "#cbd5e1" : "#94a3b8",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "0.58rem",
                  fontWeight: active ? 700 : 500,
                  color: active
                    ? color
                    : darkMode ? "#94a3b8" : "#64748b",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ height: 64 }} />
    </>
  );
}