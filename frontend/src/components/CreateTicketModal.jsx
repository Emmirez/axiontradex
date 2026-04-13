// frontend/src/components/CreateTicketModal.jsx
import React, { useState, useRef, useEffect } from "react";
import { X, Send, AlertCircle, ChevronDown } from "lucide-react";
import api from "../services/apiService";

const CATEGORIES = [
  { value: "account", label: "Account Issues" },
  { value: "kyc", label: "KYC Verification" },
  { value: "deposit", label: "Deposit Problems" },
  { value: "withdrawal", label: "Withdrawal Issues" },
  { value: "trading", label: "Trading Questions" },
  { value: "technical", label: "Technical Support" },
  { value: "security", label: "Security Concerns" },
  { value: "other", label: "Other" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

// Custom Select Component
function CustomSelect({ value, onChange, options, darkMode, border, textClr, muted, placeholder = "Select" }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={selectRef} style={{ position: "relative", width: "100%" }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "10px 12px",
          borderRadius: 12,
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
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown 
          style={{ 
            width: 14, 
            height: 14, 
            color: muted,
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
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
            borderRadius: 12,
            overflow: "hidden",
            zIndex: 100,
            boxShadow: darkMode ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.1)",
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
                background: value === opt.value ? (darkMode ? "#f59e0b20" : "#f59e0b10") : "transparent",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = darkMode ? "#f59e0b30" : "#f59e0b20";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = value === opt.value 
                  ? (darkMode ? "#f59e0b20" : "#f59e0b10")
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
}

export default function CreateTicketModal({ isOpen, onClose, onSuccess, darkMode }) {
  const [form, setForm] = useState({
    subject: "",
    category: "account",
    priority: "medium",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Theme tokens
  const bgColor = darkMode ? "rgba(2,6,23,0.98)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/tickets", form);
      onSuccess();
      onClose();
      setForm({ subject: "", category: "account", priority: "medium", message: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const iStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${border}`,
    background: inputBg,
    color: textClr,
    fontSize: "0.85rem",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
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
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: bgColor,
          border: `1px solid ${border}`,
          borderRadius: 24,
          width: "90%",
          maxWidth: 500,
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: `1px solid ${border}`,
          }}
        >
          <h2 style={{ color: textClr, fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
            Create Support Ticket
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: muted,
              padding: 4,
            }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {error && (
            <div
              style={{
                padding: "12px",
                borderRadius: 10,
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.25)",
                color: "#f87171",
                fontSize: "0.8rem",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertCircle style={{ width: 14, height: 14 }} />
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                color: muted,
                fontSize: "0.7rem",
                fontWeight: 700,
                display: "block",
                marginBottom: 6,
              }}
            >
              Subject *
            </label>
            <input
              type="text"
              placeholder="Brief description of your issue"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              style={iStyle}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label
                style={{
                  color: muted,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Category *
              </label>
              <CustomSelect
                value={form.category}
                onChange={(val) => setForm({ ...form, category: val })}
                options={CATEGORIES}
                darkMode={darkMode}
                border={border}
                textClr={textClr}
                muted={muted}
                placeholder="Select category"
              />
            </div>
            <div>
              <label
                style={{
                  color: muted,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Priority
              </label>
              <CustomSelect
                value={form.priority}
                onChange={(val) => setForm({ ...form, priority: val })}
                options={PRIORITIES}
                darkMode={darkMode}
                border={border}
                textClr={textClr}
                muted={muted}
                placeholder="Select priority"
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                color: muted,
                fontSize: "0.7rem",
                fontWeight: 700,
                display: "block",
                marginBottom: 6,
              }}
            >
              Message *
            </label>
            <textarea
              rows={5}
              placeholder="Please provide details about your issue..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              style={{
                ...iStyle,
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#d97706,#f59e0b)",
              color: "#020617",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Send style={{ width: 16, height: 16 }} />
            {loading ? "Creating..." : "Create Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
}