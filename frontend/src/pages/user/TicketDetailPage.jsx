// frontend/src/pages/user/TicketDetailPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Star as StarOutline,
  MessageSquare,
  User,
  Shield,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import api from "../../services/apiService";

const STATUS_COLORS = {
  open: { bg: "rgba(52,211,153,0.12)", color: "#34d399", labelKey: "open" },
  in_progress: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", labelKey: "in_progress" },
  resolved: { bg: "rgba(96,165,250,0.12)", color: "#60a5fa", labelKey: "resolved" },
  closed: { bg: "rgba(100,116,139,0.12)", color: "#94a3b8", labelKey: "closed" },
};

export default function TicketDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [showRating, setShowRating] = useState(false);
  const messagesEndRef = useRef(null);

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data?.data?.ticket);
      if (res.data?.data?.ticket?.status === "closed" && !res.data?.data?.ticket?.rating) {
        setShowRating(true);
      }
    } catch (err) {
      console.error("Failed to fetch ticket:", err);
      navigate("/support");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await api.post(`/tickets/${id}/reply`, { message: newMessage });
      setNewMessage("");
      await fetchTicket();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      await api.patch(`/tickets/${id}/close`);
      await fetchTicket();
    } catch (err) {
      console.error("Failed to close ticket:", err);
    }
  };

  const handleRateTicket = async () => {
    if (!rating) return;
    try {
      await api.post(`/tickets/${id}/rate`, { score: rating, comment: ratingComment });
      setShowRating(false);
      await fetchTicket();
    } catch (err) {
      console.error("Failed to rate ticket:", err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: pageBg }}>
        <DashboardNav />
        <div style={{ paddingTop: 80, textAlign: "center", color: muted }}>{t("loading")}</div>
        <BottomNav />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <DashboardNav />

      <div style={{ paddingTop: 80, paddingBottom: 100 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px" }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => navigate("/support")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                color: muted,
                cursor: "pointer",
                marginBottom: 16,
              }}
            >
              <ArrowLeft style={{ width: 16, height: 16 }} />
              {t("back_to_tickets")}
            </button>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ color: textClr, fontWeight: 800, fontSize: "1.2rem", margin: 0 }}>
                  {ticket.subject}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                  <span style={{
                    fontFamily: "monospace",
                    fontSize: "0.7rem",
                    color: "#f59e0b",
                    background: "rgba(245,158,11,0.1)",
                    padding: "2px 8px",
                    borderRadius: 6,
                  }}>
                    {ticket.ticketId}
                  </span>
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    background: STATUS_COLORS[ticket.status]?.bg || "rgba(100,116,139,0.12)",
                    color: STATUS_COLORS[ticket.status]?.color || "#94a3b8",
                  }}>
                    {t(STATUS_COLORS[ticket.status]?.labelKey || ticket.status)}
                  </span>
                </div>
              </div>
              {ticket.status !== "closed" && (
                <button
                  onClick={handleCloseTicket}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: `1px solid ${border}`,
                    background: "transparent",
                    color: "#f87171",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                  }}
                >
                  {t("close_ticket")}
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "20px", maxHeight: 500, overflowY: "auto" }}>
              {ticket.messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 20,
                    justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  {msg.sender === "admin" && (
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(245,158,11,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Shield style={{ width: 14, height: 14, color: "#f59e0b" }} />
                    </div>
                  )}
                  <div style={{
                    maxWidth: "70%",
                    background: msg.sender === "user"
                      ? "linear-gradient(135deg,#d97706,#f59e0b)"
                      : darkMode ? "rgba(30,41,59,0.8)" : "#f1f5f9",
                    borderRadius: msg.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    padding: "12px 16px",
                  }}>
                    <div style={{
                      fontSize: "0.7rem",
                      color: msg.sender === "user" ? "rgba(2,6,23,0.7)" : muted,
                      marginBottom: 4,
                    }}>
                      {msg.sender === "user" ? t("you") : t("support_team")}
                      <span style={{ marginLeft: 8, fontSize: "0.6rem" }}>
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                    <div style={{
                      color: msg.sender === "user" ? "#020617" : textClr,
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}>
                      {msg.message}
                    </div>
                  </div>
                  {msg.sender === "user" && (
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#d97706,#f59e0b)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <User style={{ width: 14, height: 14, color: "#020617" }} />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Reply Form */}
          {ticket.status !== "closed" && (
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: "16px" }}>
              <textarea
                rows={3}
                placeholder={t("message_placeholder_ticket")}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 12,
                  border: `1px solid ${border}`,
                  background: inputBg,
                  color: textClr,
                  fontSize: "0.85rem",
                  resize: "vertical",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, gap: 10 }}>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg,#d97706,#f59e0b)",
                    color: "#020617",
                    fontWeight: 600,
                    cursor: sending || !newMessage.trim() ? "not-allowed" : "pointer",
                    opacity: sending || !newMessage.trim() ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Send style={{ width: 14, height: 14 }} />
                  {t("send_message")}
                </button>
              </div>
            </div>
          )}

          {/* Rating Modal */}
          {showRating && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}>
              <div style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 24,
                padding: "28px",
                maxWidth: 400,
                width: "90%",
              }}>
                <h3 style={{ color: textClr, marginBottom: 16, textAlign: "center" }}>
                  {t("rate_experience")}
                </h3>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      style={{ background: "none", border: "none", cursor: "pointer" }}
                    >
                      {star <= rating ? (
                        <Star style={{ width: 32, height: 32, color: "#f59e0b", fill: "#f59e0b" }} />
                      ) : (
                        <StarOutline style={{ width: 32, height: 32, color: muted }} />
                      )}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  placeholder={t("feedback_placeholder")}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 12,
                    border: `1px solid ${border}`,
                    background: inputBg,
                    color: textClr,
                    marginBottom: 20,
                  }}
                />
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => setShowRating(false)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      border: `1px solid ${border}`,
                      background: "transparent",
                      color: muted,
                      cursor: "pointer",
                    }}
                  >
                    {t("skip")}
                  </button>
                  <button
                    onClick={handleRateTicket}
                    disabled={!rating}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg,#d97706,#f59e0b)",
                      color: "#020617",
                      fontWeight: 600,
                      cursor: rating ? "pointer" : "not-allowed",
                      opacity: rating ? 1 : 0.6,
                    }}
                  >
                    {t("submit_rating")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}