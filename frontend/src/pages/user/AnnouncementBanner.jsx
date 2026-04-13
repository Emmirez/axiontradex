import React, { useState, useEffect } from "react";
import {
  X,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Wrench,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api from "../../services/apiService";

const TYPE_CONFIG = {
  info: {
    icon: Info,
    bg: "rgba(96,165,250,0.12)",
    border: "rgba(96,165,250,0.35)",
    color: "#60a5fa",
  },
  success: {
    icon: CheckCircle,
    bg: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.35)",
    color: "#34d399",
  },
  warning: {
    icon: AlertTriangle,
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.35)",
    color: "#f59e0b",
  },
  error: {
    icon: AlertCircle,
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.35)",
    color: "#f87171",
  },
  maintenance: {
    icon: Wrench,
    bg: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.35)",
    color: "#a78bfa",
  },
};

// Characters before truncation kicks in
const TRUNCATE_AT = 100;

function AnnouncementItem({ announcement, darkMode, onDismiss }) {
  const [expanded, setExpanded] = useState(false);

  const config = TYPE_CONFIG[announcement.type] || TYPE_CONFIG.info;
  const Icon = config.icon;

  const message = announcement.message || "";
  const isLong = message.length > TRUNCATE_AT;
  const displayedMessage =
    isLong && !expanded
      ? message.slice(0, TRUNCATE_AT).trimEnd() + "…"
      : message;

  return (
    <div
      style={{
        background: darkMode ? "rgba(15,23,42,0.95)" : "#ffffff",
        border: `1.5px solid ${config.border}`,
        borderLeft: `4px solid ${config.color}`,
        borderRadius: 16,
        padding: "10px 14px",
        marginBottom: 12,
        boxShadow: darkMode
          ? "0 2px 12px rgba(0,0,0,0.35)"
          : "0 2px 10px rgba(0,0,0,0.07)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Icon */}
        <div
          style={{
            width: 30,
            height: 30,
            minWidth: 30,
            borderRadius: 10,
            background: config.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 2,
          }}
        >
          <Icon size={15} color={config.color} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <div
            style={{
              color: darkMode ? "#f1f5f9" : "#0f172a",
              fontWeight: 700,
              fontSize: "0.875rem",
              marginBottom: 4,
              lineHeight: 1.3,
            }}
          >
            {announcement.title || announcement.type}
          </div>

          {/* Message */}
          <div
            style={{
              color: darkMode ? "#94a3b8" : "#475569",
              fontSize: "0.8rem",
              lineHeight: 1.55,
              marginBottom: announcement.actionUrl || isLong ? 8 : 0,
            }}
          >
            {displayedMessage}
          </div>

          {/* Show more / Show less toggle */}
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: config.color,
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                marginBottom: announcement.actionUrl ? 6 : 0,
              }}
            >
              {expanded ? (
                <>
                  <ChevronUp size={13} /> Show less
                </>
              ) : (
                <>
                  <ChevronDown size={13} /> Show more
                </>
              )}
            </button>
          )}

          {/* Action link */}
          {announcement.actionUrl && (
            <div>
              <a
                href={announcement.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: config.color,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {announcement.actionText || "Read more"} →
              </a>
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {announcement.dismissible !== false && (
          <button
            onClick={() => onDismiss(announcement._id)}
            aria-label="Dismiss"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: darkMode ? "#64748b" : "#94a3b8",
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              flexShrink: 0,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = darkMode
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.06)";
              e.currentTarget.style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = darkMode ? "#64748b" : "#94a3b8";
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function AnnouncementBanner({ darkMode }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/announcements/user");
      setAnnouncements(res.data?.data?.announcements || []);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 300000);
    return () => clearInterval(interval);
  }, []);

  const dismissAnnouncement = async (id) => {
    try {
      await api.post(`/announcements/${id}/dismiss`);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Failed to dismiss announcement:", err);
    }
  };

  if (loading || announcements.length === 0) return null;

  return (
    <div style={{ width: "100%", marginBottom: 4 }}>
      {announcements.map((announcement) => (
        <AnnouncementItem
          key={announcement._id}
          announcement={announcement}
          darkMode={darkMode}
          onDismiss={dismissAnnouncement}
        />
      ))}
    </div>
  );
}
