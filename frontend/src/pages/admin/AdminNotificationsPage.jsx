// frontend/src/pages/admin/AdminNotificationsPage.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../../services/apiService";
import { fmtDate, Badge, Skel, PaginationBar } from "./AdminShared";
import { useTheme } from "../../context/ThemeContext";


// Breakpoint hook
function useIsMobile(bp = 700) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < bp);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return isMobile;
}

// Toast Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "#34d399" : type === "error" ? "#f87171" : "#f59e0b";
  
  return (
    <div
      style={{
        position: "fixed",
        bottom: 100,
        left: "50%",
        transform: "translateX(-50%)",
        background: bgColor,
        color: "#fff",
        padding: "12px 24px",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        gap: 12,
        zIndex: 1000,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        animation: "slideUp 0.3s ease",
      }}
    >
      <span>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
        <X size={14} />
      </button>
    </div>
  );
}

const TYPE_FILTERS = ["all", "deposit", "withdrawal", "user", "trade", "kyc", "system", "security"];

export default function SectionAdminNotifications({ darkMode, cardBg, textClr, muted, border, divLine, showToast }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showUnread, setShowUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expanded, setExpanded] = useState(null);

  const isMobile = useIsMobile();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== "all") params.type = filter;
      if (showUnread) params.read = "false";
      
      const res = await api.get("/admin/notifications", { params });
      setNotifications(res.data?.data?.notifications || []);
      setUnreadCount(res.data?.data?.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      showToast?.(err.response?.data?.message || "Failed to fetch", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter, showUnread]);

  const markAllRead = async () => {
    try {
      await api.patch("/admin/notifications/read-all");
      showToast?.("All notifications marked as read", "success");
      fetchNotifications();
    } catch (err) {
      showToast?.(err.response?.data?.message || "Failed to mark all as read", "error");
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      showToast?.("Notification marked as read", "success");
    } catch (err) {
      showToast?.(err.response?.data?.message || "Failed to mark as read", "error");
    }
  };

  const deleteOne = async (id) => {
    try {
      await api.delete(`/admin/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (!notifications.find(n => n._id === id)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      showToast?.("Notification deleted", "success");
    } catch (err) {
      showToast?.(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  const formatDate = (date) => {
    if (!date) return "Recently";
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / (1000 * 60));
    
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
    return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Action buttons component
  const ActionButtons = ({ n }) => (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      {!n.read && (
        <button
          className="action-btn"
          onClick={() => markRead(n._id)}
          style={{ padding: '5px 8px', borderRadius: 6, border: `1px solid rgba(245,158,11,0.35)`, background: 'rgba(245,158,11,0.08)', color: '#f59e0b', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
        >
          <CheckCheck style={{ width: 10, height: 10 }} /> Mark read
        </button>
      )}
      <button
        className="action-btn"
        onClick={() => deleteOne(n._id)}
        style={{ padding: '5px 8px', borderRadius: 6, border: `1px solid rgba(248,113,113,0.35)`, background: 'rgba(248,113,113,0.08)', color: '#f87171', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
      >
        <Trash2 style={{ width: 10, height: 10 }} /> Delete
      </button>
    </div>
  );

  return (
    <div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Header with stats */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bell style={{ width: 20, height: 20, color: "#f59e0b" }} />
            <span style={{ color: textClr, fontWeight: 700, fontSize: "0.9rem" }}>
              Admin Notifications
            </span>
            {unreadCount > 0 && (
              <span style={{ 
                padding: "2px 8px", 
                borderRadius: 20, 
                background: "rgba(248,113,113,0.15)", 
                color: "#f87171", 
                fontSize: "0.7rem", 
                fontWeight: 700 
              }}>
                {unreadCount} unread
              </span>
            )}
          </div>
          <div style={{ color: muted, fontSize: "0.7rem", marginTop: 4 }}>
            System and user activity updates
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button 
            onClick={() => setShowUnread(!showUnread)} 
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${showUnread ? "rgba(245,158,11,0.4)" : border}`,
              background: showUnread ? "rgba(245,158,11,0.08)" : "transparent",
              color: showUnread ? "#f59e0b" : muted,
              fontSize: "0.7rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Filter style={{ width: 12, height: 12 }} />
            {showUnread ? "All" : "Unread only"}
          </button>
          {unreadCount > 0 && (
            <button 
              onClick={markAllRead}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: "transparent",
                color: muted,
                fontSize: "0.7rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <CheckCheck style={{ width: 12, height: 12 }} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TYPE_FILTERS.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                padding: "5px 14px",
                borderRadius: 20,
                border: `1px solid ${filter === t ? "rgba(245,158,11,0.4)" : border}`,
                background: filter === t ? "rgba(245,158,11,0.1)" : "transparent",
                color: filter === t ? "#f59e0b" : muted,
                fontSize: "0.72rem",
                fontWeight: filter === t ? 700 : 500,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 18, overflow: "hidden" }}>

        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ padding: '14px 18px', borderBottom: `1px solid ${divLine}` }}>
              <Skel h={14} dark={darkMode} />
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: muted }}>
            <Bell style={{ width: 48, height: 48, color: muted, marginBottom: 16, opacity: 0.5 }} />
            <div style={{ color: textClr, fontWeight: 600, marginBottom: 4 }}>No notifications</div>
            <div style={{ color: muted, fontSize: "0.8rem" }}>
              {showUnread ? 'You have no unread notifications' : 'All caught up!'}
            </div>
          </div>
        ) : isMobile ? (
          // MOBILE: Expandable cards
          notifications.map((n, i) => {
            const open = expanded === n._id;
            return (
              <div key={n._id} style={{ borderBottom: i < notifications.length - 1 ? `1px solid ${divLine}` : 'none' }}>
                {/* Row header */}
                <div
                  onClick={() => setExpanded(open ? null : n._id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', cursor: 'pointer', gap: 10, position: 'relative' }}
                >
                  {!n.read && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#f59e0b', borderRadius: '0 2px 2px 0' }} />}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: textClr, fontWeight: !n.read ? 700 : 600, fontSize: '0.85rem', marginBottom: 4 }}>
                      {n.title}
                    </div>
                    <div style={{ color: muted, fontSize: '0.7rem' }}>
                      {formatDate(n.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 4, background: `${n.iconColor}15`, color: n.iconColor, textTransform: 'capitalize' }}>
                      {n.type}
                    </span>
                    {open ? <ChevronUp style={{ width: 14, height: 14, color: muted }} /> : <ChevronDown style={{ width: 14, height: 14, color: muted }} />}
                  </div>
                </div>

                {/* Expanded detail */}
                {open && (
                  <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: `1px solid ${divLine}`, paddingTop: 8, gap: 8 }}>
                      <span style={{ color: muted, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>Message</span>
                      <span style={{ color: muted, fontSize: '0.78rem', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'right' }}>{n.body}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${divLine}`, paddingTop: 8 }}>
                      <ActionButtons n={n} />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // DESKTOP: Table view
          <div className="thin-scroll" style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 800 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 100px 140px 1fr 80px 100px', gap: 12, padding: '12px 18px', color: muted, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1px solid ${divLine}` }}>
                <div>Time</div>
                <div>Type</div>
                <div>Title</div>
                <div>Message</div>
                <div>Status</div>
                <div style={{ textAlign: 'center' }}>Actions</div>
              </div>
              
              {notifications.map((n, i) => (
                <div
                  key={n._id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 100px 140px 1fr 80px 100px',
                    gap: 12,
                    padding: '12px 18px',
                    borderBottom: i < notifications.length - 1 ? `1px solid ${divLine}` : 'none',
                    alignItems: 'center',
                    background: !n.read ? (darkMode ? 'rgba(245,158,11,0.03)' : 'rgba(245,158,11,0.02)') : 'transparent',
                    position: 'relative',
                  }}
                >
                  {!n.read && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#f59e0b', borderRadius: '0 2px 2px 0' }} />}
                  
                  <div style={{ color: muted, fontSize: '0.7rem' }}>{formatDate(n.createdAt)}</div>
                  <div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: `${n.iconColor}15`,
                      color: n.iconColor,
                      textTransform: 'capitalize',
                      display: 'inline-block',
                    }}>
                      {n.type}
                    </span>
                  </div>
                  <div style={{ color: textClr, fontWeight: !n.read ? 700 : 500, fontSize: '0.8rem', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {n.title}
                  </div>
                  <div style={{ color: muted, fontSize: '0.75rem', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.4 }}>
                    {n.body}
                  </div>
                  <div>
                    {n.read ? (
                      <span style={{ color: muted, fontSize: '0.7rem' }}>Read</span>
                    ) : (
                      <span style={{ color: '#f59e0b', fontSize: '0.7rem', fontWeight: 600 }}>Unread</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {!n.read && (
                      <button
                        onClick={() => markRead(n._id)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 8,
                          border: `1px solid ${border}`,
                          background: 'transparent',
                          color: '#f59e0b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.65rem',
                        }}
                      >
                        <CheckCheck style={{ width: 11, height: 11 }} />
                        Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteOne(n._id)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 8,
                        border: `1px solid ${border}`,
                        background: 'transparent',
                        color: muted,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}