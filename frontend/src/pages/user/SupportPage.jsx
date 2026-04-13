// frontend/src/pages/user/SupportPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  HelpCircle,
  Plus,
  MessageSquare,
  Clock,
  ChevronRight,
  Search,
  X,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import CreateTicketModal from "../../components/CreateTicketModal";
import api from "../../services/apiService";
import { useTranslation } from "react-i18next";

const STATUS_COLORS = {
  open: { bg: "rgba(52,211,153,0.12)", color: "#34d399", labelKey: "open" },
  in_progress: {
    bg: "rgba(245,158,11,0.12)",
    color: "#f59e0b",
    labelKey: "in_progress",
  },
  resolved: {
    bg: "rgba(96,165,250,0.12)",
    color: "#60a5fa",
    labelKey: "resolved",
  },
  closed: {
    bg: "rgba(100,116,139,0.12)",
    color: "#94a3b8",
    labelKey: "closed",
  },
};

const PRIORITY_COLORS = {
  low: { bg: "rgba(100,116,139,0.12)", color: "#94a3b8" },
  medium: { bg: "rgba(52,211,153,0.12)", color: "#34d399" },
  high: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  urgent: { bg: "rgba(248,113,113,0.12)", color: "#f87171" },
};

export default function SupportPage() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState({ status: "", category: "" });
  const [search, setSearch] = useState("");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const statusRef = useRef(null);
  const categoryRef = useRef(null);

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.category) params.category = filter.category;
      const res = await api.get("/tickets", { params });
      setTickets(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const filteredTickets = tickets.filter(
    (t) =>
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketId?.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (date) => {
    if (!date) return t("recently");
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / (1000 * 60 * 60));
    if (diff < 1) return t("just_now");
    if (diff < 24) return t("hours_ago_support", { hours: diff });
    return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const statusOptions = [
    { value: "", labelKey: "all_status" },
    { value: "open", labelKey: "open" },
    { value: "in_progress", labelKey: "in_progress" },
    { value: "resolved", labelKey: "resolved" },
    { value: "closed", labelKey: "closed" },
  ];

  const categoryOptions = [
    { value: "", labelKey: "all_categories" },
    { value: "account", labelKey: "account" },
    { value: "kyc", labelKey: "kyc" },
    { value: "deposit", labelKey: "deposit" },
    { value: "withdrawal", labelKey: "withdrawal" },
    { value: "trading", labelKey: "trading" },
    { value: "technical", labelKey: "technical" },
    { value: "security", labelKey: "security" },
    { value: "other", labelKey: "other" },
  ];

  const selectedStatus = statusOptions.find(
    (opt) => opt.value === filter.status,
  );
  const selectedCategory = categoryOptions.find(
    (opt) => opt.value === filter.category,
  );

  // Custom Dropdown Component
  const CustomDropdown = ({
    options,
    value,
    onChange,
    isOpen,
    setIsOpen,
    containerRef,
    placeholder,
    icon,
  }) => {
    const selected = options.find((opt) => opt.value === value);

    return (
      <div ref={containerRef} style={{ position: "relative", minWidth: 140 }}>
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
          }}
        >
          <span>{selected ? t(selected.labelKey) : t(placeholder)}</span>
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
                {t(opt.labelKey)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <DashboardNav />

      <div style={{ paddingTop: 80, paddingBottom: 100, minHeight: "100vh" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  color: textClr,
                  fontWeight: 800,
                  fontSize: "1.4rem",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <HelpCircle
                  style={{ width: 24, height: 24, color: "#f59e0b" }}
                />
                {t("support_tickets")}
              </h1>
              <p
                style={{ color: muted, fontSize: "0.82rem", margin: "4px 0 0" }}
              >
                {t("support_subtitle")}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg,#d97706,#f59e0b)",
                color: "#020617",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Plus style={{ width: 16, height: 16 }} />
              {t("new_ticket")}
            </button>
          </div>

          {/* Filters with Custom Dropdowns */}
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
                style={{
                  flex: "1 1 200px",
                  minWidth: 180,
                  position: "relative",
                }}
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
                  placeholder={t("search_placeholder")}
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

              <CustomDropdown
                containerRef={statusRef}
                options={statusOptions}
                value={filter.status}
                onChange={(val) => setFilter({ ...filter, status: val })}
                isOpen={statusDropdownOpen}
                setIsOpen={setStatusDropdownOpen}
                placeholder={t("all_status")} 
              />

              <CustomDropdown
                containerRef={statusRef}
                options={categoryOptions}
                value={filter.category}
                onChange={(val) => setFilter({ ...filter, category: val })}
                isOpen={categoryDropdownOpen}
                setIsOpen={setCategoryDropdownOpen}
                placeholder={t("all_categories")} 
              />

              {(filter.status || filter.category) && (
                <button
                  onClick={() => setFilter({ status: "", category: "" })}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: `1px solid ${border}`,
                    background: "transparent",
                    color: muted,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.8rem",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = darkMode
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <X style={{ width: 14, height: 14 }} />
                  {t("clear_filters")}
                </button>
              )}
            </div>
          </div>

          {/* Tickets List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: muted }}>
              {t("loading_tickets")}
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
              <div style={{ color: textClr, fontWeight: 600, marginBottom: 8 }}>
                {t("no_tickets_found")}
              </div>
              <div
                style={{ color: muted, fontSize: "0.85rem", marginBottom: 20 }}
              >
                {search || filter.status || filter.category
                  ? t("try_different_filters")
                  : t("create_first_ticket")}
              </div>
              {!search && !filter.status && !filter.category && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 10,
                    border: `1px solid #f59e0b`,
                    background: "transparent",
                    color: "#f59e0b",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(245,158,11,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {t("create_ticket")}
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => navigate(`/support/ticket/${ticket._id}`)}
                  style={{
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: 16,
                    padding: "16px 20px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(4px)";
                    e.currentTarget.style.borderColor = "#f59e0b";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.borderColor = border;
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                          fontSize: "0.75rem",
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
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          background:
                            PRIORITY_COLORS[ticket.priority]?.bg ||
                            "rgba(100,116,139,0.12)",
                          color:
                            PRIORITY_COLORS[ticket.priority]?.color ||
                            "#94a3b8",
                        }}
                      >
                        {t(ticket.priority?.toLowerCase() || "medium")}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          background:
                            STATUS_COLORS[ticket.status]?.bg ||
                            "rgba(100,116,139,0.12)",
                          color:
                            STATUS_COLORS[ticket.status]?.color || "#94a3b8",
                        }}
                      >
                        {t(
                          STATUS_COLORS[ticket.status]?.labelKey ||
                            ticket.status,
                        )}
                      </span>
                      <ChevronRight
                        style={{ width: 16, height: 16, color: muted }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      color: textClr,
                      fontWeight: 600,
                      fontSize: "1rem",
                      marginBottom: 8,
                    }}
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
                    <span>{t(ticket.category?.toLowerCase() || "other")}</span>
                    <span>•</span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Clock style={{ width: 12, height: 12 }} />
                      {t("last_activity")}: {formatDate(ticket.lastActivityAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchTickets}
        darkMode={darkMode}
      />
      <BottomNav />
    </div>
  );
}
