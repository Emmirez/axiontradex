import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  X,
  TrendingUp,
  TrendingDown,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  Shield,
  Star,
  Settings,
  Share2,
  Repeat2,
  Wallet,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import api from "../../services/apiService";

// Match backend enum exactly
const TYPE_FILTERS = [
  "all",
  "deposit",
  "withdrawal",
  "trade",
  "trading",
  "swap",
  "security",
  "kyc",
  "settings",
  "referral",
  "investment",
  "system",
];

// Icon mapping matching backend ICON_MAP
const iconMap = {
  ArrowDownCircle: ({ size, color }) => (
    <ArrowDownCircle size={size} color={color} />
  ),
  ArrowUpCircle: ({ size, color }) => (
    <ArrowUpCircle size={size} color={color} />
  ),
  Activity: ({ size, color }) => <Activity size={size} color={color} />,
  Shield: ({ size, color }) => <Shield size={size} color={color} />,
  Star: ({ size, color }) => <Star size={size} color={color} />,
  Settings: ({ size, color }) => <Settings size={size} color={color} />,
  Share2: ({ size, color }) => <Share2 size={size} color={color} />,
  Bell: ({ size, color }) => <Bell size={size} color={color} />,
  TrendingUp: ({ size, color }) => <TrendingUp size={size} color={color} />,
  TrendingDown: ({ size, color }) => <TrendingDown size={size} color={color} />,
  Repeat2: ({ size, color }) => <Repeat2 size={size} color={color} />,
  Wallet: ({ size, color }) => <Wallet size={size} color={color} />,
  RefreshCw: ({ size, color }) => <RefreshCw size={size} color={color} />,
  AlertCircle: ({ size, color }) => <AlertCircle size={size} color={color} />,
};

// Get icon and color based on notification type (matches backend ICON_MAP)
const getNotificationStyle = (type, t) => {
  const styles = {
    deposit: { icon: "ArrowDownCircle", color: "#34d399", labelKey: "deposit" },
    withdrawal: {
      icon: "ArrowUpCircle",
      color: "#f87171",
      labelKey: "withdrawal",
    },
    trade: { icon: "Activity", color: "#a78bfa", labelKey: "trade" },
    trading: { icon: "Activity", color: "#a78bfa", labelKey: "trading" },
    profit: { icon: "TrendingUp", color: "#34d399", labelKey: "profit" },
    loss: { icon: "TrendingDown", color: "#f87171", labelKey: "loss" },
    refund: { icon: "ArrowUpCircle", color: "#f87171", labelKey: "refund" },
    swap: { icon: "Repeat2", color: "#a78bfa", labelKey: "swap" },
    security: { icon: "Shield", color: "#60a5fa", labelKey: "security" },
    kyc: { icon: "Star", color: "#f59e0b", labelKey: "kyc" },
    settings: { icon: "Settings", color: "#94a3b8", labelKey: "settings" },
    referral: { icon: "Share2", color: "#f59e0b", labelKey: "referral" },
    investment: {
      icon: "TrendingUp",
      color: "#34d399",
      labelKey: "investment",
    },
    system: { icon: "Bell", color: "#60a5fa", labelKey: "system" },
  };
  return styles[type] || styles.system;
};

export default function UserNotificationsPage() {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showUnread, setShowUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const hoverBg = darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== "all") params.type = filter;
      if (showUnread) params.unread = "true";

      const res = await api.get("/notifications", { params });
      setNotifications(res.data?.data?.notifications || []);
      setUnreadCount(res.data?.data?.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter, showUnread]);

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const deleteOne = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (!notifications.find((n) => n._id === id)?.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getIconComponent = (iconName) => {
    const IconComponent = iconMap[iconName] || iconMap.Bell;
    return IconComponent;
  };

  const getFilterLabel = (filterKey) => {
    const filterMap = {
      all: t("all"),
      deposit: t("deposit"),
      withdrawal: t("withdrawal"),
      trade: t("trade"),
      trading: t("trading"),
      swap: t("swap"),
      security: t("security"),
      kyc: t("kyc"),
      settings: t("settings"),
      referral: t("referral"),
      investment: t("investment"),
      system: t("system"),
    };
    return filterMap[filterKey] || filterKey;
  };

  // Group by date
  const groups = notifications.reduce((acc, n) => {
    const date = new Date(n.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey;
    if (date.toDateString() === today.toDateString()) {
      dateKey = t("today");
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = t("yesterday");
    } else if (date > new Date(today.setDate(today.getDate() - 7))) {
      dateKey = t("this_week");
    } else {
      dateKey = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    acc[dateKey] = acc[dateKey] || [];
    acc[dateKey].push(n);
    return acc;
  }, {});

  const formatTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / (1000 * 60));

    if (diff < 1) return t("just_now");
    if (diff < 60) return t("minutes_ago", { minutes: diff });
    if (diff < 1440)
      return t("hours_ago_short", { hours: Math.floor(diff / 60) });
    return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <DashboardNav />
      <div style={{ paddingTop: 80, paddingBottom: 80 }}>
        <style>{`.notif-row:hover { background: ${hoverBg} !important; } .notif-row { transition: background 0.12s; }`}</style>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <h1
                style={{
                  color: textClr,
                  fontWeight: 800,
                  fontSize: "1.4rem",
                  margin: 0,
                }}
              >
                {t("notifications")}
              </h1>
              <p
                style={{ color: muted, fontSize: "0.82rem", margin: "4px 0 0" }}
              >
                {unreadCount > 0
                  ? t("unread_count", { count: unreadCount })
                  : t("all_caught_up")}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowUnread((o) => !o)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 9,
                  border: `1px solid ${showUnread ? "rgba(245,158,11,0.4)" : border}`,
                  background: showUnread
                    ? "rgba(245,158,11,0.08)"
                    : "transparent",
                  color: showUnread ? "#f59e0b" : muted,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Filter style={{ width: 12, height: 12 }} /> {t("unread_only")}
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 9,
                    border: `1px solid ${border}`,
                    background: "transparent",
                    color: muted,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <CheckCheck style={{ width: 12, height: 12 }} />
                  {t("mark_all_read")}
                </button>
              )}
            </div>
          </div>

          {/* Type filters */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            {TYPE_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 99,
                  border: `1px solid ${filter === f ? "rgba(245,158,11,0.4)" : border}`,
                  background:
                    filter === f ? "rgba(245,158,11,0.1)" : "transparent",
                  color: filter === f ? "#f59e0b" : muted,
                  fontSize: "0.72rem",
                  fontWeight: filter === f ? 700 : 500,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 0.15s",
                }}
              >
                {getFilterLabel(f)}
              </button>
            ))}
          </div>

          {/* Notification groups */}
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: muted }}>
              {t("loading_notifications")}
            </div>
          ) : Object.keys(groups).length === 0 ? (
            <div
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: darkMode
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <Bell style={{ width: 22, height: 22, color: muted }} />
              </div>
              <div
                style={{
                  color: textClr,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  marginBottom: 6,
                }}
              >
                {t("no_notifications")}
              </div>
              <div style={{ color: muted, fontSize: "0.78rem" }}>
                {t("all_caught_up")}
              </div>
            </div>
          ) : (
            Object.entries(groups).map(([date, items]) => (
              <div key={date} style={{ marginBottom: 20 }}>
                <div
                  style={{
                    color: muted,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 8,
                    paddingLeft: 4,
                  }}
                >
                  {date}
                </div>
                <div
                  style={{
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: 18,
                    overflow: "hidden",
                  }}
                >
                  {items.map((n, i) => {
                    // Use the icon and color from backend if available, otherwise compute from type
                    const style = getNotificationStyle(n.type, t);
                    const iconName = n.icon || style.icon;
                    const iconColor = n.iconColor || style.color;
                    const IconComponent = getIconComponent(iconName);
                    const displayType = t(style.labelKey) || n.type;

                    return (
                      <div
                        key={n._id}
                        className="notif-row"
                        onClick={() => !n.read && markRead(n._id)}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          padding: "14px 16px",
                          borderBottom:
                            i < items.length - 1
                              ? `1px solid ${divLine}`
                              : "none",
                          cursor: "pointer",
                          background: !n.read
                            ? darkMode
                              ? "rgba(245,158,11,0.03)"
                              : "rgba(245,158,11,0.02)"
                            : "transparent",
                          position: "relative",
                        }}
                      >
                        {/* Unread bar */}
                        {!n.read && (
                          <div
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: 3,
                              background: "#f59e0b",
                              borderRadius: "0 2px 2px 0",
                            }}
                          />
                        )}

                        {/* Icon */}
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 11,
                            background: `${iconColor}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: 1,
                          }}
                        >
                          <IconComponent size={15} color={iconColor} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 8,
                              marginBottom: 3,
                            }}
                          >
                            <span
                              style={{
                                color: textClr,
                                fontWeight: n.read ? 500 : 700,
                                fontSize: "0.83rem",
                                lineHeight: 1.3,
                              }}
                            >
                              {n.title}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                flexShrink: 0,
                              }}
                            >
                              <span
                                style={{
                                  color: muted,
                                  fontSize: "0.68rem",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {formatTime(n.createdAt)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteOne(n._id);
                                }}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: muted,
                                  cursor: "pointer",
                                  padding: 2,
                                  display: "flex",
                                  opacity: 0.5,
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.opacity = 1)
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.opacity = 0.5)
                                }
                              >
                                <Trash2 style={{ width: 11, height: 11 }} />
                              </button>
                            </div>
                          </div>
                          <div
                            style={{
                              color: muted,
                              fontSize: "0.75rem",
                              lineHeight: 1.5,
                            }}
                          >
                            {n.body}
                          </div>
                          {/* Type badge */}
                          <span
                            style={{
                              marginTop: 6,
                              display: "inline-block",
                              padding: "1px 8px",
                              borderRadius: 99,
                              background: `${iconColor}12`,
                              color: iconColor,
                              fontSize: "0.62rem",
                              fontWeight: 700,
                              textTransform: "capitalize",
                            }}
                          >
                            {displayType}
                          </span>
                        </div>

                        {/* Unread dot */}
                        {!n.read && (
                          <div
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: "#f59e0b",
                              flexShrink: 0,
                              marginTop: 5,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
