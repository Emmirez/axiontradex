// frontend/src/pages/admin/SectionAnnouncements.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  RefreshCw,
  Edit3,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import api from "../../services/apiService";
import { fmtDate, Badge, Skel, PaginationBar } from "./AdminShared";

//  Toast System
function ToastContainer({ toasts, removeToast }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10);
    const hide = setTimeout(() => setVisible(false), toast.duration - 350);
    const remove = setTimeout(() => onRemove(toast.id), toast.duration);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, [toast, onRemove]);

  const cfgMap = {
    success: {
      icon: <CheckCircle style={{ width: 15, height: 15 }} />,
      color: "#34d399",
      border: "rgba(52,211,153,0.25)",
    },
    error: {
      icon: <AlertCircle style={{ width: 15, height: 15 }} />,
      color: "#f87171",
      border: "rgba(248,113,113,0.25)",
    },
    info: {
      icon: <Info style={{ width: 15, height: 15 }} />,
      color: "#60a5fa",
      border: "rgba(96,165,250,0.25)",
    },
    warning: {
      icon: <AlertTriangle style={{ width: 15, height: 15 }} />,
      color: "#f59e0b",
      border: "rgba(245,158,11,0.25)",
    },
  };
  const cfg = cfgMap[toast.type] || cfgMap.info;

  return (
    <div
      style={{
        pointerEvents: "auto",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 16px",
        borderRadius: 12,
        background: "rgba(10,15,30,0.92)",
        border: `1px solid ${cfg.border}`,
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        minWidth: 240,
        maxWidth: 360,
        transform: visible ? "translateX(0)" : "translateX(120%)",
        opacity: visible ? 1 : 0,
        transition:
          "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease",
      }}
    >
      <span style={{ color: cfg.color, flexShrink: 0 }}>{cfg.icon}</span>
      <span
        style={{
          color: "#e2e8f0",
          fontSize: "0.82rem",
          fontWeight: 500,
          flex: 1,
        }}
      >
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#64748b",
          padding: 2,
          display: "flex",
        }}
      >
        <X style={{ width: 12, height: 12 }} />
      </button>
    </div>
  );
}

//  Confirm Dialog
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onCancel}
      />
      {/* Box */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "rgba(10,15,30,0.97)",
          border: "1px solid rgba(248,113,113,0.3)",
          borderRadius: 16,
          padding: "24px 28px",
          maxWidth: 360,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "rgba(248,113,113,0.12)",
              border: "1px solid rgba(248,113,113,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Trash2 style={{ width: 16, height: 16, color: "#f87171" }} />
          </div>
          <div>
            <div
              style={{
                color: "#f1f5f9",
                fontWeight: 700,
                fontSize: "0.92rem",
                marginBottom: 4,
              }}
            >
              Delete Announcement
            </div>
            <div
              style={{ color: "#94a3b8", fontSize: "0.78rem", lineHeight: 1.5 }}
            >
              {message}
            </div>
          </div>
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "10px",
              borderRadius: 9,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "#94a3b8",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "10px",
              borderRadius: 9,
              border: "none",
              background: "linear-gradient(135deg,#dc2626,#f87171)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

//  useToast hook
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "success", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  return { toasts, addToast, removeToast };
}

// Type Colors & Badge
const TYPE_COLOR = {
  info: "#60a5fa",
  success: "#34d399",
  warning: "#f59e0b",
  error: "#f87171",
  maintenance: "#a78bfa",
};

function TypeBadge({ type }) {
  const colors = {
    info: { bg: "rgba(96,165,250,0.12)", color: "#60a5fa", label: "Info" },
    success: {
      bg: "rgba(52,211,153,0.12)",
      color: "#34d399",
      label: "Success",
    },
    warning: {
      bg: "rgba(245,158,11,0.12)",
      color: "#f59e0b",
      label: "Warning",
    },
    error: { bg: "rgba(248,113,113,0.12)", color: "#f87171", label: "Error" },
    maintenance: {
      bg: "rgba(167,139,250,0.12)",
      color: "#a78bfa",
      label: "Maintenance",
    },
  };
  const cfg = colors[type] || colors.info;
  return (
    <span
      style={{
        fontSize: "0.68rem",
        fontWeight: 700,
        padding: "2px 7px",
        borderRadius: 5,
        background: cfg.bg,
        color: cfg.color,
        textTransform: "capitalize",
      }}
    >
      {cfg.label}
    </span>
  );
}

//  Breakpoint Hook
function useIsMobile(bp = 700) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < bp);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return isMobile;
}

//  Create / Edit Modal
function AnnouncementModal({
  announcement,
  onClose,
  onSave,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  inputBg,
  addToast,
}) {
  const [form, setForm] = useState({
    title: announcement?.title || "",
    message: announcement?.message || "",
    type: announcement?.type || "info",
    isActive:
      announcement?.isActive !== undefined ? announcement.isActive : true,
    startDate: announcement?.startDate
      ? new Date(announcement.startDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    endDate: announcement?.endDate
      ? new Date(announcement.endDate).toISOString().slice(0, 16)
      : "",
    actionUrl: announcement?.actionUrl || "",
    actionText: announcement?.actionText || "Read more",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const iStyle = {
    width: "100%",
    padding: "9px 11px",
    borderRadius: 8,
    border: `1px solid ${border}`,
    background: inputBg,
    color: textClr,
    fontSize: "0.85rem",
    boxSizing: "border-box",
    outline: "none",
  };
  const labelStyle = {
    color: muted,
    fontSize: "0.7rem",
    fontWeight: 600,
    display: "block",
    marginBottom: 4,
  };

  const save = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      setErr("Title and message are required");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      if (announcement?._id) {
        await api.patch(`/announcements/admin/${announcement._id}`, {
          ...form,
          isGlobal: true,
          dismissible: true,
        });
        addToast("Announcement updated", "success");
      } else {
        await api.post("/announcements/admin", {
          ...form,
          isGlobal: true,
          dismissible: true,
        });
        addToast("Announcement created", "success");
      }
      onSave();
      onClose();
    } catch (e) {
      const msg = e.response?.data?.message || e.message || "Failed";
      setErr(msg);
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 20,
          width: "100%",
          maxWidth: 500,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          padding: "26px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div style={{ color: textClr, fontWeight: 800, fontSize: "1rem" }}>
            {announcement?._id ? "Edit Announcement" : "Create Announcement"}
          </div>
          <button
            onClick={onClose}
            style={{
              background: darkMode
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.05)",
              border: `1px solid ${border}`,
              borderRadius: 8,
              color: muted,
              cursor: "pointer",
              padding: 5,
              display: "flex",
              alignItems: "center",
            }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>TITLE *</label>
          <input
            style={iStyle}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Announcement title"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>MESSAGE *</label>
          <textarea
            rows={3}
            style={{ ...iStyle, resize: "vertical" }}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Announcement message"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          {/* Type Select in Modal */}
          <div>
            <label style={labelStyle}>TYPE</label>
            <EnhancedSelect
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={[
                {
                  value: "info",
                  label: "Info",
                  icon: "ℹ️",
                  color: "#60a5fa",
                },
                {
                  value: "success",
                  label: "Success",
                  icon: "✅",
                  color: "#34d399",
                },
                {
                  value: "warning",
                  label: "Warning",
                  icon: "⚠️",
                  color: "#f59e0b",
                },
                {
                  value: "error",
                  label: "Error",
                  icon: "❌",
                  color: "#f87171",
                },
                {
                  value: "maintenance",
                  label: "Maintenance",
                  icon: "🔧",
                  color: "#a78bfa",
                },
              ]}
              darkMode={darkMode}
              textClr={textClr}
              muted={muted}
              border={border}
              inputBg={inputBg}
              style={{ padding: "9px 11px" }}
            />
          </div>

          {/* Status Select in Modal */}
          <div>
            <label style={labelStyle}>STATUS</label>
            <EnhancedSelect
              value={form.isActive ? "active" : "inactive"}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.value === "active" })
              }
              options={[
                {
                  value: "active",
                  label: "Active",
                  icon: "🟢",
                  color: "#34d399",
                },
                {
                  value: "inactive",
                  label: "Inactive",
                  icon: "⚫",
                  color: "#94a3b8",
                },
              ]}
              darkMode={darkMode}
              textClr={textClr}
              muted={muted}
              border={border}
              inputBg={inputBg}
              style={{ padding: "9px 11px" }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <label style={labelStyle}>START DATE</label>
            <input
              type="datetime-local"
              style={iStyle}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>END DATE (optional)</label>
            <input
              type="datetime-local"
              style={iStyle}
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>ACTION URL (optional)</label>
          <input
            style={iStyle}
            value={form.actionUrl}
            onChange={(e) => setForm({ ...form, actionUrl: e.target.value })}
            placeholder="/deposit, /referral, etc."
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>ACTION TEXT</label>
          <input
            style={iStyle}
            value={form.actionText}
            onChange={(e) => setForm({ ...form, actionText: e.target.value })}
            placeholder="Read more"
          />
        </div>

        {err && (
          <div
            style={{
              color: "#f87171",
              fontSize: "0.75rem",
              marginBottom: 10,
              padding: "8px 10px",
              background: "rgba(248,113,113,0.08)",
              borderRadius: 8,
              border: "1px solid rgba(248,113,113,0.2)",
            }}
          >
            {err}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginTop: 16,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "11px",
              borderRadius: 9,
              border: `1px solid ${border}`,
              background: "transparent",
              color: textClr,
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{
              padding: "11px",
              borderRadius: 9,
              border: "none",
              background: "linear-gradient(135deg,#d97706,#f59e0b)",
              color: "#020617",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving…" : announcement?._id ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Select Component with custom dropdown
function EnhancedSelect({
  value,
  onChange,
  options,
  darkMode,
  textClr,
  muted,
  border,
  inputBg,
  placeholder = "Select an option",
  style = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get selected option display text
  const getSelectedDisplay = () => {
    const option = options.find((opt) => opt.value === value);
    if (option) return option.label;
    if (value) return value;
    return placeholder;
  };

  // Find selected option for styling
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={selectRef} style={{ position: "relative", flex: "1 0 auto" }}>
      {/* Custom Select Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "7px 12px",
          borderRadius: 8,
          border: `1px solid ${isOpen ? "#f59e0b" : border}`,
          background: inputBg || (darkMode ? "rgba(15,23,42,0.9)" : "#fff"),
          color: textClr,
          fontSize: "0.8rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          transition: "all 0.2s ease",
          minWidth: 120,
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = "rgba(245,158,11,0.5)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = border;
          }
        }}
      >
        <span
          style={{
            fontWeight: 500,
            color: selectedOption?.color || (value ? textClr : muted),
          }}
        >
          {getSelectedDisplay()}
        </span>
        <ChevronDown
          style={{
            width: 14,
            height: 14,
            color: isOpen ? "#f59e0b" : muted,
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: darkMode ? "rgba(30,41,59,0.98)" : "#fff",
            backdropFilter: "blur(12px)",
            border: `1px solid ${border}`,
            borderRadius: 12,
            overflow: "hidden",
            zIndex: 50,
            boxShadow: darkMode
              ? "0 10px 25px -5px rgba(0,0,0,0.3)"
              : "0 10px 25px -5px rgba(0,0,0,0.1)",
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {options.map((option, idx) => {
            const isSelected = value === option.value;
            return (
              <div
                key={idx}
                onClick={() => {
                  onChange({ target: { value: option.value } });
                  setIsOpen(false);
                }}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  color: isSelected ? "#f59e0b" : textClr,
                  backgroundColor: isSelected
                    ? darkMode
                      ? "rgba(245,158,11,0.1)"
                      : "rgba(245,158,11,0.05)"
                    : "transparent",
                  fontSize: "0.8rem",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = darkMode
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {option.icon && (
                    <span style={{ fontSize: "0.9rem" }}>{option.icon}</span>
                  )}
                  <span>{option.label}</span>
                </div>
                {isSelected && (
                  <CheckCircle
                    style={{ width: 12, height: 12, color: "#f59e0b" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

//  Main Component
export default function SectionAnnouncements({
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  divLine,
  inputBg,
  showToast: externalShowToast,
}) {
  const { toasts, addToast, removeToast } = useToast();

  const showToast = useCallback(
    (message, type = "success") => {
      addToast(message, type);
      if (typeof externalShowToast === "function")
        externalShowToast(message, type);
    },
    [addToast, externalShowToast],
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [confirmId, setConfirmId] = useState(null); // id pending delete confirmation

  const isMobile = useIsMobile();

  const openCreate = () => {
    setEditing(null);
    setIsModalOpen(true);
  };
  const openEdit = (d) => {
    setEditing(d);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (type) params.set("type", type);
      if (status) params.set("isActive", status);
      const res = await api.get(`/announcements/admin/all?${params}`);
      setItems(res.data?.data || []);
      setPages(res.data?.pagination?.pages || 1);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [type, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/announcements/admin/${id}/toggle`);
      showToast("Status updated");
      load();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update status",
        "error",
      );
    }
  };

  // Step 1: show confirm dialog
  const promptDelete = (id) => setConfirmId(id);

  // Step 2: user confirmed — actually delete
  const confirmDelete = async () => {
    const id = confirmId;
    setConfirmId(null);
    try {
      await api.delete(`/announcements/admin/${id}`);
      showToast("Announcement deleted");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  const selStyle = {
    padding: "7px 12px",
    borderRadius: 8,
    border: `1px solid ${border}`,
    background: darkMode ? "rgba(15,23,42,0.9)" : "#fff",
    color: textClr,
    fontSize: "0.8rem",
    cursor: "pointer",
  };

  return (
    <div>
      {/*  Toasts  */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/*  Delete Confirm Dialog  */}
      {confirmId && (
        <ConfirmDialog
          message="This announcement will be permanently deleted and cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/*  Create / Edit Modal  */}
      {isModalOpen && (
        <AnnouncementModal
          announcement={editing}
          onClose={closeModal}
          onSave={load}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
          addToast={addToast}
        />
      )}

      {/*  Filter Bar */}

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Type Select */}
        <EnhancedSelect
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          options={[
            { value: "", label: "All Types", icon: "📋" },
            { value: "info", label: "Info", icon: "ℹ️", color: "#60a5fa" },
            {
              value: "success",
              label: "Success",
              icon: "✅",
              color: "#34d399",
            },
            {
              value: "warning",
              label: "Warning",
              icon: "⚠️",
              color: "#f59e0b",
            },
            { value: "error", label: "Error", icon: "❌", color: "#f87171" },
            {
              value: "maintenance",
              label: "Maintenance",
              icon: "🔧",
              color: "#a78bfa",
            },
          ]}
          darkMode={darkMode}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
        />

        {/* Status Select */}
        <EnhancedSelect
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={[
            { value: "", label: "All Status", icon: "🔄" },
            { value: "true", label: "Active", icon: "🟢", color: "#34d399" },
            { value: "false", label: "Inactive", icon: "⚫", color: "#94a3b8" },
          ]}
          darkMode={darkMode}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
        />

        <button
          onClick={load}
          style={{
            padding: "7px 12px",
            borderRadius: 8,
            border: `1px solid ${border}`,
            background: "transparent",
            color: muted,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: "0.78rem",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#f59e0b";
            e.currentTarget.style.color = "#f59e0b";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = border;
            e.currentTarget.style.color = muted;
          }}
        >
          <RefreshCw style={{ width: 11, height: 11 }} /> Refresh
        </button>

        <button
          onClick={openCreate}
          style={{
            marginLeft: "auto",
            padding: "7px 14px",
            borderRadius: 9,
            border: "none",
            background: "linear-gradient(135deg,#d97706,#f59e0b)",
            color: "#020617",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(245,158,11,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Plus style={{ width: 12, height: 12 }} /> Create Announcement
        </button>
      </div>

      {/*  Card / Table */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                padding: "14px 18px",
                borderBottom: `1px solid ${divLine}`,
              }}
            >
              <Skel h={14} dark={darkMode} />
            </div>
          ))
        ) : isMobile ? (
          /* ── MOBILE ── */
          items.length === 0 ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: muted,
                fontSize: "0.85rem",
              }}
            >
              No announcements found.
            </div>
          ) : (
            items.map((d, i) => {
              const open = expanded === d._id;
              return (
                <div
                  key={d._id}
                  style={{
                    borderBottom:
                      i < items.length - 1 ? `1px solid ${divLine}` : "none",
                  }}
                >
                  <div
                    onClick={() => setExpanded(open ? null : d._id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 16px",
                      cursor: "pointer",
                      gap: 10,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          color: textClr,
                          fontWeight: 600,
                          fontSize: "0.82rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {d.title}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 3,
                        }}
                      >
                        <TypeBadge type={d.type} />
                        <span style={{ color: muted, fontSize: "0.7rem" }}>
                          {fmtDate(d.startDate)}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexShrink: 0,
                      }}
                    >
                      <Badge
                        status={d.isActive ? "active" : "inactive"}
                        label={d.isActive ? "Active" : "Inactive"}
                      />
                      {open ? (
                        <ChevronUp
                          style={{ width: 14, height: 14, color: muted }}
                        />
                      ) : (
                        <ChevronDown
                          style={{ width: 14, height: 14, color: muted }}
                        />
                      )}
                    </div>
                  </div>

                  {open && (
                    <div
                      style={{
                        padding: "0 16px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          borderTop: `1px solid ${divLine}`,
                          paddingTop: 8,
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            color: muted,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            flexShrink: 0,
                          }}
                        >
                          Message
                        </span>
                        <span
                          style={{
                            color: muted,
                            fontSize: "0.75rem",
                            textAlign: "right",
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                          }}
                        >
                          {d.message}
                        </span>
                      </div>
                      {d.endDate && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderTop: `1px solid ${divLine}`,
                            paddingTop: 8,
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              color: muted,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            Ends
                          </span>
                          <span style={{ color: muted, fontSize: "0.72rem" }}>
                            {fmtDate(d.endDate)}
                          </span>
                        </div>
                      )}
                      {d.actionUrl && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderTop: `1px solid ${divLine}`,
                            paddingTop: 8,
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              color: muted,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            Link
                          </span>
                          <a
                            href={d.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: TYPE_COLOR[d.type] || "#60a5fa",
                              fontSize: "0.72rem",
                              textDecoration: "none",
                            }}
                          >
                            {d.actionText || "Read more"} →
                          </a>
                        </div>
                      )}
                      <div
                        style={{
                          borderTop: `1px solid ${divLine}`,
                          paddingTop: 10,
                          display: "flex",
                          gap: 8,
                        }}
                      >
                        <button
                          onClick={() => toggleStatus(d._id)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 7,
                            border: `1px solid ${border}`,
                            background: "transparent",
                            color: d.isActive ? "#34d399" : muted,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          {d.isActive ? (
                            <Eye style={{ width: 12, height: 12 }} />
                          ) : (
                            <EyeOff style={{ width: 12, height: 12 }} />
                          )}
                          {d.isActive ? "Set Inactive" : "Set Active"}
                        </button>
                        <button
                          onClick={() => openEdit(d)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 7,
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
                          <Edit3 style={{ width: 12, height: 12 }} /> Edit
                        </button>
                        <button
                          onClick={() => promptDelete(d._id)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 7,
                            border: "1px solid rgba(248,113,113,0.35)",
                            background: "rgba(248,113,113,0.08)",
                            color: "#f87171",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <Trash2 style={{ width: 12, height: 12 }} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          /* ── DESKTOP ── */
          <div className="thin-scroll" style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 780 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "180px 1fr 80px 100px 100px 100px",
                  gap: 8,
                  padding: "10px 18px",
                  color: muted,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  borderBottom: `1px solid ${divLine}`,
                  whiteSpace: "nowrap",
                }}
              >
                <div>Title</div>
                <div>Message</div>
                <div>Type</div>
                <div>Dates</div>
                <div>Status</div>
                <div style={{ textAlign: "right" }}>Actions</div>
              </div>

              {items.length === 0 ? (
                <div
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    color: muted,
                    fontSize: "0.85rem",
                  }}
                >
                  No announcements found.
                </div>
              ) : (
                items.map((d, i) => (
                  <div
                    key={d._id}
                    className="adm-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "180px 1fr 80px 100px 100px 100px",
                      gap: 8,
                      padding: "12px 18px",
                      borderBottom:
                        i < items.length - 1 ? `1px solid ${divLine}` : "none",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div
                      style={{
                        color: textClr,
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {d.title}
                    </div>
                    <div
                      style={{
                        color: muted,
                        fontSize: "0.72rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 260,
                      }}
                    >
                      {d.message}
                    </div>
                    <div>
                      <TypeBadge type={d.type} />
                    </div>
                    <div style={{ fontSize: "0.7rem", color: muted }}>
                      <div>{fmtDate(d.startDate)}</div>
                      {d.endDate && <div>→ {fmtDate(d.endDate)}</div>}
                    </div>
                    <div>
                      <button
                        onClick={() => toggleStatus(d._id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          color: d.isActive ? "#34d399" : "#94a3b8",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                        }}
                      >
                        {d.isActive ? (
                          <Eye style={{ width: 11, height: 11 }} />
                        ) : (
                          <EyeOff style={{ width: 11, height: 11 }} />
                        )}
                        {d.isActive ? "Active" : "Inactive"}
                      </button>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        className="action-btn"
                        onClick={() => openEdit(d)}
                        style={{
                          padding: "4px 7px",
                          borderRadius: 6,
                          border: `1px solid ${border}`,
                          background: "transparent",
                          color: muted,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Edit3 style={{ width: 11, height: 11 }} />
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => promptDelete(d._id)}
                        style={{
                          padding: "4px 7px",
                          borderRadius: 6,
                          border: "1px solid rgba(248,113,113,0.35)",
                          background: "rgba(248,113,113,0.08)",
                          color: "#f87171",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Trash2 style={{ width: 11, height: 11 }} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {pages > 1 && (
          <PaginationBar
            page={page}
            pages={pages}
            setPage={setPage}
            border={border}
            textClr={textClr}
            muted={muted}
            divLine={divLine}
          />
        )}
      </div>
    </div>
  );
}
