import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  Activity,
  Settings,
  Star,
  Shield,
} from "lucide-react";
import api from "../../services/apiService";
import { useNavigate } from "react-router-dom";

const iconMap = {
  ArrowDownCircle: ArrowDownCircle,
  ArrowUpCircle: ArrowUpCircle,
  Users: Users,
  Activity: Activity,
  Settings: Settings,
  Star: Star,
  Shield: Shield,
  Bell: Bell,
};

export default function NotificationBell({
  darkMode,
  border,
  textClr,
  muted,
  divLine,
  onViewAll,
  showToast,
}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const dropdownBg = darkMode
    ? "rgba(15,23,42,0.98)"
    : "rgba(255,255,255,0.99)";

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/notifications", {
        params: { limit: 5 },
      });
      setNotifications(res.data?.data?.notifications || []);
      setUnreadCount(res.data?.data?.unreadCount || 0);
    } catch (err) {
      showToast?.(
        err.response?.data?.message || "Failed to fetch notifications",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count periodically
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/admin/notifications/unread-count");
      setUnreadCount(res.data?.data?.count || 0);
    } catch (err) {
      showToast?.(
        err.response?.data?.message || "Failed to fetch unread count",
        "error",
      );
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch("/admin/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      showToast?.(
        err.response?.data?.message || "Failed to mark all as read",
        "error",
      );
    }
  };

  const markOneRead = async (id) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      showToast?.(
        err.response?.data?.message || "Failed to mark as read",
        "error",
      );
    }
  };

  const deleteOne = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/admin/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (!notifications.find((n) => n._id === id)?.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      showToast?.(
        err.response?.data?.message || "Failed to delete notification",
        "error",
      );
    }
  };

  // const handleNotificationClick = (notification) => {
  //   markOneRead(notification._id);
  //   if (notification.actionUrl) {
  //     window.location.href = notification.actionUrl;
  //   }
  //   setOpen(false);
  // };

  const handleNotificationClick = async (notification) => {
    await markOneRead(notification._id); 
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setOpen(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / (1000 * 60));

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
    return then.toLocaleDateString();
  };

  const getIconComponent = (iconName) => {
    const Icon = iconMap[iconName] || iconMap.Bell;
    return Icon;
  };

  return (
    <>
      {/* Mobile full-screen backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            top: 60,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 98,
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <div ref={ref} style={{ position: "relative" }}>
        {/* Bell button */}
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: `1px solid ${open ? "rgba(245,158,11,0.4)" : border}`,
            background: open ? "rgba(245,158,11,0.08)" : "transparent",
            cursor: "pointer",
            color: open ? "#f59e0b" : muted,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            transition: "all 0.15s",
          }}
        >
          <Bell style={{ width: 14, height: 14 }} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#f87171",
                border: `2px solid ${darkMode ? "rgba(2,6,23,0.95)" : "rgba(248,250,252,0.95)"}`,
              }}
            />
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div
            style={{
              position: "fixed",
              top: 60,
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(380px, 94vw)",
              background: dropdownBg,
              border: `1px solid ${border}`,
              borderRadius: 14,
              boxShadow: darkMode
                ? "0 20px 60px rgba(0,0,0,0.6)"
                : "0 20px 60px rgba(0,0,0,0.14)",
              zIndex: 99,
              animation: "dropIn 0.2s ease",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px 10px",
                borderBottom: `1px solid ${divLine}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span
                  style={{
                    color: textClr,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  Admin Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      padding: "1px 7px",
                      borderRadius: 99,
                      background: "rgba(248,113,113,0.15)",
                      color: "#f87171",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#f59e0b",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: 0,
                    }}
                  >
                    <CheckCheck style={{ width: 12, height: 12 }} /> Mark all
                    read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>

            {/* List */}
            <div
              style={{ maxHeight: 400, overflowY: "auto" }}
              className="thin-scroll"
            >
              {loading ? (
                <div
                  style={{
                    padding: "28px 16px",
                    textAlign: "center",
                    color: muted,
                    fontSize: "0.8rem",
                  }}
                >
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div
                  style={{
                    padding: "28px 16px",
                    textAlign: "center",
                    color: muted,
                    fontSize: "0.8rem",
                  }}
                >
                  No notifications
                </div>
              ) : (
                notifications.map((notif, index) => {
                  const IconComponent = getIconComponent(notif.icon);
                  return (
                    <div
                      key={notif._id}
                      className="notif-item"
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 11,
                        padding: "11px 16px",
                        borderBottom:
                          index < notifications.length - 1
                            ? `1px solid ${divLine}`
                            : "none",
                        background: !notif.read
                          ? darkMode
                            ? "rgba(245,158,11,0.04)"
                            : "rgba(245,158,11,0.03)"
                          : "transparent",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!notif.read) {
                          e.currentTarget.style.background = darkMode
                            ? "rgba(245,158,11,0.08)"
                            : "rgba(245,158,11,0.06)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!notif.read) {
                          e.currentTarget.style.background = darkMode
                            ? "rgba(245,158,11,0.04)"
                            : "rgba(245,158,11,0.03)";
                        } else {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      {/* Icon bubble */}
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          background: `${notif.iconColor}18`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        <IconComponent
                          style={{
                            width: 13,
                            height: 13,
                            color: notif.iconColor,
                          }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 6,
                            marginBottom: 2,
                          }}
                        >
                          <span
                            style={{
                              color: textClr,
                              fontWeight: notif.read ? 500 : 700,
                              fontSize: "0.78rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {notif.title}
                          </span>
                          <span
                            style={{
                              color: muted,
                              fontSize: "0.65rem",
                              flexShrink: 0,
                            }}
                          >
                            {formatTime(notif.createdAt)}
                          </span>
                        </div>
                        <div
                          style={{
                            color: muted,
                            fontSize: "0.72rem",
                            lineHeight: 1.4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {notif.body}
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => deleteOne(notif._id, e)}
                        style={{
                          background: "none",
                          border: "none",
                          color: muted,
                          cursor: "pointer",
                          padding: 2,
                          opacity: 0.4,
                          transition: "opacity 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = 1)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = 0.4)
                        }
                      >
                        <X style={{ width: 10, height: 10 }} />
                      </button>

                      {/* Unread dot */}
                      {!notif.read && (
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "#f59e0b",
                            flexShrink: 0,
                            marginTop: 6,
                          }}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "10px 16px",
                textAlign: "center",
                borderTop: `1px solid ${divLine}`,
              }}
            >
              <button
                onClick={() => {
                  setOpen(false);
                  if (onViewAll) {
                    onViewAll(); // Call the passed function to switch to notifications section
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f59e0b",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.8)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
              >
                View all notifications →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
