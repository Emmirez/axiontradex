// frontend/src/pages/admin/SectionSupportTickets.jsx
import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Clock,
  Search,
  User,
  Shield,
  ChevronDown,
} from "lucide-react";
import api from "../../services/apiService";

const STATUS_COLORS = {
  open: { bg: "rgba(52,211,153,0.12)", color: "#34d399", label: "Open" },
  in_progress: {
    bg: "rgba(245,158,11,0.12)",
    color: "#f59e0b",
    label: "In Progress",
  },
  resolved: {
    bg: "rgba(96,165,250,0.12)",
    color: "#60a5fa",
    label: "Resolved",
  },
  closed: { bg: "rgba(100,116,139,0.12)", color: "#94a3b8", label: "Closed" },
};

const PRIORITY_ORDER = { urgent: 4, high: 3, medium: 2, low: 1 };

export default function SectionSupportTickets({
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  inputBg,
  showToast,
}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState({
    status: "",
    priority: "",
    category: "",
  });
  const [search, setSearch] = useState("");

  const fetchTickets = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.priority) params.priority = filter.priority;
      if (filter.category) params.category = filter.category;
      const res = await api.get("/tickets/admin/all", { params });
      setTickets(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/tickets/admin/stats");
      setStats(res.data?.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [filter]);

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      await api.patch(`/tickets/admin/${ticketId}/status`, { status });
      showToast(`Ticket status updated to ${status}`, "success");
      fetchTickets();
      fetchStats();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update status",
        "error",
      );
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    setSending(true);
    try {
      await api.post(`/tickets/admin/${selectedTicket._id}/reply`, {
        message: replyMessage,
      });
      setReplyMessage("");
      showToast("Reply sent successfully", "success");
      fetchTickets();
      if (selectedTicket) {
        const res = await api.get(`/tickets/admin/${selectedTicket._id}`);
        setSelectedTicket(res.data?.data?.ticket);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send reply", "error");
    } finally {
      setSending(false);
    }
  };

  const handleUpdatePriority = async (ticketId, priority) => {
    try {
      await api.patch(`/tickets/admin/${ticketId}/priority`, { priority });
      showToast(`Priority updated to ${priority}`, "success");
      fetchTickets();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update priority",
        "error",
      );
    }
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.ticketId?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (date) => {
    if (!date) return "Recently";
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / (1000 * 60 * 60));
    if (diff < 1) return "Just now";
    if (diff < 24) return `${diff}h ago`;
    if (diff < 168) return `${Math.floor(diff / 24)}d ago`;
    return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Custom dropdown component to avoid browser default styles
  const CustomSelect = ({ value, onChange, options, style }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = React.useRef(null);

    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <div ref={selectRef} style={{ position: "relative", ...style }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: `1px solid ${border}`,
            background: darkMode ? "#1e293b" : "#ffffff",
            color: textClr,
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            whiteSpace: "nowrap",
          }}
        >
          <span>{selectedOption?.label || "Select"}</span>
          <ChevronDown
            style={{
              width: 14,
              height: 14,
              color: muted,
              transition: "transform 0.2s",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </div>
        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 4,
              background: darkMode ? "#1e293b" : "#ffffff",
              border: `1px solid ${border}`,
              borderRadius: 10,
              overflow: "hidden",
              zIndex: 100,
              boxShadow: darkMode
                ? "0 4px 12px rgba(0,0,0,0.3)"
                : "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  color: textClr,
                  fontSize: "0.85rem",
                  background:
                    value === opt.value
                      ? darkMode
                        ? "#f59e0b20"
                        : "#f59e0b10"
                      : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = darkMode
                    ? "#f59e0b30"
                    : "#f59e0b20";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    value === opt.value
                      ? darkMode
                        ? "#f59e0b20"
                        : "#f59e0b10"
                      : "transparent";
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Dropdown options
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  const priorityOptions = [
    { value: "", label: "All Priority" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "account", label: "Account" },
    { value: "kyc", label: "KYC" },
    { value: "deposit", label: "Deposit" },
    { value: "withdrawal", label: "Withdrawal" },
    { value: "trading", label: "Trading" },
    { value: "technical", label: "Technical" },
    { value: "security", label: "Security" },
  ];

  return (
    <div style={{ padding: "0 0 20px 0" }}>
      {/* Stats Cards - Responsive Grid */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[
            { label: "Open", value: stats.open, color: "#34d399" },
            { label: "In Progress", value: stats.inProgress, color: "#f59e0b" },
            { label: "Resolved", value: stats.resolved, color: "#60a5fa" },
            { label: "Closed", value: stats.closed, color: "#94a3b8" },
            {
              label: "High Priority",
              value: stats.highPriority,
              color: "#f87171",
            },
            {
              label: "Avg Response",
              value: `${stats.avgResponseTime || 0}h`,
              color: "#a78bfa",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 12,
                padding: "12px",
              }}
            >
              <div
                style={{
                  color: stat.color,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                {stat.label}
              </div>
              <div
                style={{ color: textClr, fontWeight: 800, fontSize: "1.3rem" }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters - Responsive */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 16,
          padding: "16px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div
            style={{ flex: "1 1 200px", minWidth: 180, position: "relative" }}
          >
            <Search
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                width: 16,
                height: 16,
                color: muted,
              }}
            />
            <input
              type="text"
              placeholder="Search by ID, subject, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                borderRadius: 10,
                border: `1px solid ${border}`,
                background: inputBg,
                color: textClr,
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
          </div>
          <CustomSelect
            value={filter.status}
            onChange={(val) => setFilter({ ...filter, status: val })}
            options={statusOptions}
            style={{ minWidth: 130 }}
          />
          <CustomSelect
            value={filter.priority}
            onChange={(val) => setFilter({ ...filter, priority: val })}
            options={priorityOptions}
            style={{ minWidth: 120 }}
          />
          <CustomSelect
            value={filter.category}
            onChange={(val) => setFilter({ ...filter, category: val })}
            options={categoryOptions}
            style={{ minWidth: 140 }}
          />
        </div>
      </div>

      {/* Tickets List and Detail View - Responsive */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Tickets List */}
        <div style={{ width: "100%" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: muted }}>
              Loading tickets...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 60,
                background: cardBg,
                borderRadius: 20,
                border: `1px solid ${border}`,
              }}
            >
              <MessageSquare
                style={{
                  width: 48,
                  height: 48,
                  color: muted,
                  marginBottom: 16,
                }}
              />
              <div style={{ color: textClr, fontWeight: 600 }}>
                No tickets found
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => setSelectedTicket(ticket)}
                  style={{
                    background:
                      selectedTicket?._id === ticket._id
                        ? `${STATUS_COLORS[ticket.status]?.bg || "rgba(245,158,11,0.1)"}20`
                        : cardBg,
                    border: `1px solid ${selectedTicket?._id === ticket._id ? "#f59e0b" : border}`,
                    borderRadius: 12,
                    padding: "16px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.7rem",
                          color: "#f59e0b",
                          background: "rgba(245,158,11,0.1)",
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {ticket.ticketId}
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          background:
                            PRIORITY_ORDER[ticket.priority] >= 3
                              ? "rgba(248,113,113,0.12)"
                              : "rgba(100,116,139,0.12)",
                          color:
                            PRIORITY_ORDER[ticket.priority] >= 3
                              ? "#f87171"
                              : "#94a3b8",
                        }}
                      >
                        {ticket.priority?.toUpperCase() || "MEDIUM"}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        background:
                          STATUS_COLORS[ticket.status]?.bg ||
                          "rgba(100,116,139,0.12)",
                        color: STATUS_COLORS[ticket.status]?.color || "#94a3b8",
                      }}
                    >
                      {STATUS_COLORS[ticket.status]?.label || ticket.status}
                    </span>
                  </div>
                  <div
                    style={{ color: textClr, fontWeight: 600, marginBottom: 4 }}
                  >
                    {ticket.subject}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      fontSize: "0.7rem",
                      color: muted,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <User style={{ width: 12, height: 12 }} />
                      {ticket.user?.email}
                    </span>
                    <span>•</span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Clock style={{ width: 12, height: 12 }} />
                      {formatDate(ticket.lastActivityAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        {selectedTicket && (
          <div
            style={{
              width: "100%",
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <div
              style={{ padding: "20px", borderBottom: `1px solid ${border}` }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      color: "#f59e0b",
                    }}
                  >
                    {selectedTicket.ticketId}
                  </span>
                  <h3
                    style={{
                      color: textClr,
                      margin: "4px 0 0",
                      fontSize: "1rem",
                    }}
                  >
                    {selectedTicket.subject}
                  </h3>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <CustomSelect
                    value={selectedTicket.priority}
                    onChange={(val) =>
                      handleUpdatePriority(selectedTicket._id, val)
                    }
                    options={priorityOptions.filter((opt) => opt.value !== "")}
                    style={{ minWidth: 100 }}
                  />
                  <CustomSelect
                    value={selectedTicket.status}
                    onChange={(val) =>
                      handleUpdateStatus(selectedTicket._id, val)
                    }
                    options={statusOptions.filter((opt) => opt.value !== "")}
                    style={{ minWidth: 110 }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  fontSize: "0.7rem",
                  color: muted,
                  flexWrap: "wrap",
                }}
              >
                <span>From: {selectedTicket.user?.email}</span>
                <span>Category: {selectedTicket.category}</span>
                <span>Created: {formatDate(selectedTicket.createdAt)}</span>
              </div>
            </div>

            {/* Messages - Fixed light mode colors */}
            <div style={{ padding: "20px", maxHeight: 400, overflowY: "auto" }}>
              {selectedTicket.messages?.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 20,
                    justifyContent:
                      msg.sender === "admin" ? "flex-end" : "flex-start",
                  }}
                >
                  {msg.sender === "user" && (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: darkMode
                          ? "rgba(96,165,250,0.15)"
                          : "#e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <User
                        style={{
                          width: 14,
                          height: 14,
                          color: darkMode ? "#60a5fa" : "#475569",
                        }}
                      />
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: "80%",
                      background:
                        msg.sender === "admin"
                          ? "linear-gradient(135deg,#d97706,#f59e0b)"
                          : darkMode
                            ? "#1e293b"
                            : "#f1f5f9",
                      borderRadius:
                        msg.sender === "admin"
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                      padding: "12px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color:
                          msg.sender === "admin" ? "rgba(2,6,23,0.7)" : muted,
                        marginBottom: 4,
                      }}
                    >
                      {msg.sender === "admin"
                        ? "You"
                        : msg.senderId?.firstName || "User"}
                      <span style={{ marginLeft: 8, fontSize: "0.6rem" }}>
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                    <div
                      style={{
                        color:
                          msg.sender === "admin"
                            ? "#020617"
                            : darkMode
                              ? textClr
                              : "#1e293b",
                        fontSize: "0.85rem",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.message}
                    </div>
                  </div>
                  {msg.sender === "admin" && (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#d97706,#f59e0b)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Shield
                        style={{ width: 14, height: 14, color: "#020617" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Reply Form */}
            {selectedTicket.status !== "closed" && (
              <div
                style={{
                  padding: "16px 20px 20px",
                  borderTop: `1px solid ${border}`,
                }}
              >
                <textarea
                  rows={3}
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 12,
                  }}
                >
                  <button
                    onClick={handleSendReply}
                    disabled={sending || !replyMessage.trim()}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg,#d97706,#f59e0b)",
                      color: "#020617",
                      fontWeight: 600,
                      cursor:
                        sending || !replyMessage.trim()
                          ? "not-allowed"
                          : "pointer",
                      opacity: sending || !replyMessage.trim() ? 0.6 : 1,
                    }}
                  >
                    {sending ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
