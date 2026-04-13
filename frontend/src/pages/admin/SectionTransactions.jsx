import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  RefreshCw,
  Edit3,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";
import api from "../../services/apiService";
import { fmtDate, Badge, Skel, PaginationBar } from "./AdminShared";

const TX_COLOR = {
  deposit: "#34d399",
  withdrawal: "#f87171",
  trade: "#60a5fa",
  fee: "#94a3b8",
  bonus: "#f59e0b",
  referral: "#a78bfa",
};

//  Breakpoint hook
function useIsMobile(bp = 700) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < bp);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return isMobile;
}

//  Edit modal (bottom sheet on mobile)
function EditTxModal({
  txn,
  onClose,
  onSave,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  inputBg,
}) {
  const [form, setForm] = useState({
    status: txn.status || "pending",
    amount: txn.amount || "",
    currency: txn.currency || "USDT",
    txHash: txn.txHash || "",
    network: txn.network || "",
    note: txn.note || "",
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
  };
  const save = async () => {
    setSaving(true);
    setErr("");
    try {
      await onSave(txn._id, form);
    } catch (e) {
      setErr(e.response?.data?.message || e.message || "Failed");
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
          maxWidth: 440,
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          padding: "26px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div style={{ color: textClr, fontWeight: 800, fontSize: "1rem" }}>
            Edit Transaction
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

        <div
          style={{
            color: muted,
            fontSize: "0.72rem",
            fontFamily: "monospace",
            marginBottom: 16,
          }}
        >
          {txn.reference || txn._id?.slice(-12)}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          {/* Status Select in Edit Modal */}
          <div>
            <label
              style={{
                color: muted,
                fontSize: "0.7rem",
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              STATUS
            </label>
            <EnhancedSelect
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
              options={[
                {
                  value: "pending",
                  label: "Pending",
                  icon: "⏳",
                  color: "#f59e0b",
                },
                {
                  value: "completed",
                  label: "Completed",
                  icon: "✅",
                  color: "#34d399",
                },
                {
                  value: "failed",
                  label: "Failed",
                  icon: "❌",
                  color: "#f87171",
                },
                {
                  value: "cancelled",
                  label: "Cancelled",
                  icon: "🚫",
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

          {/* Currency Select in Edit Modal */}
          <div>
            <label
              style={{
                color: muted,
                fontSize: "0.7rem",
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              CURRENCY
            </label>
            <EnhancedSelect
              value={form.currency}
              onChange={(e) =>
                setForm((f) => ({ ...f, currency: e.target.value }))
              }
              options={[
                {
                  value: "USDT",
                  label: "USDT - Tether",
                  icon: "₿",
                  color: "#34d399",
                },
                {
                  value: "BTC",
                  label: "BTC - Bitcoin",
                  icon: "₿",
                  color: "#f59e0b",
                },
                {
                  value: "ETH",
                  label: "ETH - Ethereum",
                  icon: "⟠",
                  color: "#a78bfa",
                },
                {
                  value: "BNB",
                  label: "BNB - Binance Coin",
                  icon: "🟡",
                  color: "#f59e0b",
                },
                {
                  value: "SOL",
                  label: "SOL - Solana",
                  icon: "⚡",
                  color: "#60a5fa",
                },
                {
                  value: "USD",
                  label: "USD - US Dollar",
                  icon: "💵",
                  color: "#34d399",
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

        {[
          { key: "amount", label: "AMOUNT", type: "number", ph: "0.00" },
          { key: "txHash", label: "TX HASH", type: "text", ph: "0x..." },
          { key: "network", label: "NETWORK", type: "text", ph: "TRC20..." },
          { key: "note", label: "NOTE", type: "text", ph: "Admin note..." },
        ].map(({ key, label, type, ph }) => (
          <div key={key} style={{ marginBottom: 10 }}>
            <label
              style={{
                color: muted,
                fontSize: "0.7rem",
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              {label}
            </label>
            <input
              style={iStyle}
              type={type}
              placeholder={ph}
              value={form[key]}
              onChange={(e) =>
                setForm((f) => ({ ...f, [key]: e.target.value }))
              }
            />
          </div>
        ))}

        {form.status === "completed" &&
          txn.status !== "completed" &&
          txn.type === "deposit" && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "rgba(52,211,153,0.08)",
                border: "1px solid rgba(52,211,153,0.2)",
                marginBottom: 10,
                fontSize: "0.75rem",
                color: "#34d399",
              }}
            >
              ✓ Approving will credit {form.amount || txn.amount}{" "}
              {form.currency} to user balance.
            </div>
          )}
        {err && (
          <div
            style={{ color: "#f87171", fontSize: "0.75rem", marginBottom: 10 }}
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
            {saving ? "Saving…" : "Save"}
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

// Adjustment Modal
function AdjustmentModal({
  onClose,
  onConfirm,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  inputBg,
  showToast,
}) {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("Admin bonus");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const userDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search users
  const searchUsers = async (searchTerm) => {
    if (searchTerm.length < 2) return;
    setLoadingUsers(true);
    try {
      const res = await api.get(`/admin/users?search=${searchTerm}&limit=10`);
      setUsers(res.data?.data || []);
      setShowUserDropdown(true);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to search users",
        "error",
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  const selectUser = (user) => {
    setUserId(user._id);
    setUserSearch(`${user.firstName} ${user.lastName} (${user.email})`);
    setShowUserDropdown(false);
  };

  const iStyle = {
    width: "100%",
    padding: "9px 11px",
    borderRadius: 10,
    border: `1px solid ${border}`,
    background: inputBg,
    color: textClr,
    fontSize: "0.85rem",
    boxSizing: "border-box",
    outline: "none",
  };

  const handleConfirm = async () => {
    if (!userId) {
      setError("Please select a user");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt === 0) {
      setError("Please enter a valid amount");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onConfirm(userId, amt, note);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add adjustment");
    } finally {
      setSubmitting(false);
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
          maxWidth: 440,
          maxHeight: "85vh",
          overflowY: "auto",
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <h3 style={{ color: textClr, fontSize: "1.1rem", fontWeight: 700 }}>
            Add Balance Adjustment
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: muted,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Search */}
        <div style={{ marginBottom: 16 }} ref={userDropdownRef}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 4,
            }}
          >
            User *
          </label>
          <div style={{ position: "relative" }}>
            <input
              style={iStyle}
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                searchUsers(e.target.value);
              }}
              placeholder="Search by name or email..."
            />
            {showUserDropdown && users.length > 0 && (
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
                  maxHeight: 200,
                  overflowY: "auto",
                  zIndex: 100,
                }}
              >
                {users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => selectUser(user)}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      color: textClr,
                      borderBottom: `1px solid ${border}`,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = darkMode
                        ? "#f59e0b20"
                        : "#f59e0b10")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div style={{ fontWeight: 600 }}>
                      {user.firstName} {user.lastName}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: muted }}>
                      {user.email}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {loadingUsers && (
              <div
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <Skel h={10} w={20} dark={darkMode} />
              </div>
            )}
          </div>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 4,
            }}
          >
            Amount (USDT) *
          </label>
          <input
            type="number"
            step="0.01"
            style={iStyle}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Positive = credit, Negative = debit"
          />
          <div style={{ color: muted, fontSize: "0.65rem", marginTop: 4 }}>
            Positive amount credits user, negative amount debits user
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 4,
            }}
          >
            Note *
          </label>
          <textarea
            rows={2}
            style={{ ...iStyle, resize: "vertical" }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for adjustment..."
          />
        </div>

        {error && (
          <div
            style={{ color: "#f87171", fontSize: "0.75rem", marginBottom: 12 }}
          >
            {error}
          </div>
        )}

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px",
              borderRadius: 10,
              border: `1px solid ${border}`,
              background: "transparent",
              color: textClr,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            style={{
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg,#d97706,#f59e0b)",
              color: "#fff",
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Adding..." : "Add Adjustment"}
          </button>
        </div>
      </div>
    </div>
  );
}

//  Main component
export default function SectionTransactions({
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  divLine,
  inputBg,
  showToast,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (type) params.set("type", type);
      if (status) params.set("status", status);
      const res = await api.get(`/admin/transactions?${params}`);
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

  const saveEdit = async (id, form) => {
    await api.patch(`/admin/transactions/${id}`, form);
    showToast("Transaction updated");
    setEditing(null);
    load();
  };

  const addAdjustment = async (userId, amount, note) => {
    try {
      await api.post("/admin/transactions/adjustment", {
        userId,
        amount,
        type: "bonus",
        currency: "USDT",
        note,
      });
      showToast("Adjustment added");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
      throw err;
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
      {editing && (
        <EditTxModal
          txn={editing}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
        />
      )}

      {showAdjustmentModal && (
        <AdjustmentModal
          onClose={() => setShowAdjustmentModal(false)}
          onConfirm={addAdjustment}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
          showToast={showToast}
        />
      )}

      {/*  Filter bar */}
      {/* Filter bar - Enhanced Selects */}
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
            { value: "", label: "All Types", icon: "📊" },
            {
              value: "deposit",
              label: "Deposit",
              icon: "💵",
              color: "#34d399",
            },
            {
              value: "withdrawal",
              label: "Withdrawal",
              icon: "💰",
              color: "#f87171",
            },
            { value: "trade", label: "Trade", icon: "📈", color: "#60a5fa" },
            { value: "fee", label: "Fee", icon: "💸", color: "#94a3b8" },
            { value: "bonus", label: "Bonus", icon: "🎁", color: "#f59e0b" },
            {
              value: "referral",
              label: "👥 Referral",
              icon: "👥",
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
            {
              value: "pending",
              label: "Pending",
              icon: "⏳",
              color: "#f59e0b",
            },
            {
              value: "completed",
              label: "Completed",
              icon: "✅",
              color: "#34d399",
            },
            {
              value: "failed",
              label: "Failed",
              icon: "❌",
              color: "#f87171",
            },
            {
              value: "cancelled",
              label: "Cancelled",
              icon: "🚫",
              color: "#94a3b8",
            },
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
          onClick={() => setShowAdjustmentModal(true)}
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
          <Plus style={{ width: 12, height: 12 }} /> Add Adjustment
        </button>
      </div>

      {/* Card / Table  */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        {/* Loading */}
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
        ) : /*  MOBILE: expandable cards */
        isMobile ? (
          items.length === 0 ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: muted,
                fontSize: "0.85rem",
              }}
            >
              No transactions found.
            </div>
          ) : (
            items.map((d, i) => {
              const tc = TX_COLOR[d.type] || "#94a3b8";
              const open = expanded === d._id;
              return (
                <div
                  key={d._id}
                  style={{
                    borderBottom:
                      i < items.length - 1 ? `1px solid ${divLine}` : "none",
                  }}
                >
                  {/* Card header */}
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
                        {d.user?.firstName} {d.user?.lastName}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 3,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: 5,
                            background: `${tc}15`,
                            color: tc,
                            textTransform: "capitalize",
                          }}
                        >
                          {d.type}
                        </span>
                        <span style={{ color: muted, fontSize: "0.7rem" }}>
                          {fmtDate(d.createdAt)}
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
                      <span
                        style={{
                          color: textClr,
                          fontFamily: "monospace",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                        }}
                      >
                        {d.amount?.toLocaleString("en-US", {
                          maximumFractionDigits: 8,
                        })}
                        <span style={{ color: muted, fontSize: "0.7rem" }}>
                          {" "}
                          {d.currency}
                        </span>
                      </span>
                      <Badge status={d.status} />
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

                  {/* Expanded detail */}
                  {open && (
                    <div
                      style={{
                        padding: "0 16px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {[
                        {
                          label: "Email",
                          value: (
                            <span style={{ color: muted, fontSize: "0.72rem" }}>
                              {d.user?.email || "—"}
                            </span>
                          ),
                        },
                        {
                          label: "Note",
                          value: (
                            <span
                              style={{
                                color: muted,
                                fontSize: "0.75rem",
                                textAlign: "right",
                                wordBreak: "break-word",
                                whiteSpace: "normal",
                              }}
                            >
                              {d.note || "—"}
                            </span>
                          ),
                        },
                      ].map((row) => (
                        <div
                          key={row.label}
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
                            {row.label}
                          </span>
                          {row.value}
                        </div>
                      ))}
                      <div
                        style={{
                          borderTop: `1px solid ${divLine}`,
                          paddingTop: 10,
                        }}
                      >
                        <button
                          className="action-btn"
                          onClick={() => setEditing(d)}
                          style={{
                            padding: "6px 14px",
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
                          Transaction
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          /*  DESKTOP: table */
          <div className="thin-scroll" style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 780 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "130px 180px 90px 90px 1fr 100px 60px",
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
                <div>Date</div>
                <div>User</div>
                <div>Type</div>
                <div>Amount</div>
                <div>Note</div>
                <div>Status</div>
                <div style={{ textAlign: "right" }}>Edit</div>
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
                  No transactions found.
                </div>
              ) : (
                items.map((d, i) => {
                  const tc = TX_COLOR[d.type] || "#94a3b8";
                  return (
                    <div
                      key={d._id}
                      className="adm-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "130px 180px 90px 90px 1fr 100px 60px",
                        gap: 8,
                        padding: "12px 18px",
                        borderBottom:
                          i < items.length - 1
                            ? `1px solid ${divLine}`
                            : "none",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <div style={{ color: muted, fontSize: "0.75rem" }}>
                        {fmtDate(d.createdAt)}
                      </div>
                      <div>
                        <div
                          style={{
                            color: textClr,
                            fontWeight: 600,
                            fontSize: "0.8rem",
                          }}
                        >
                          {d.user?.firstName} {d.user?.lastName}
                        </div>
                        <div style={{ color: muted, fontSize: "0.68rem" }}>
                          {d.user?.email}
                        </div>
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 5,
                            background: `${tc}15`,
                            color: tc,
                            textTransform: "capitalize",
                          }}
                        >
                          {d.type}
                        </span>
                      </div>
                      <div
                        style={{
                          color: textClr,
                          fontFamily: "monospace",
                          fontWeight: 600,
                          fontSize: "0.82rem",
                        }}
                      >
                        {d.amount?.toLocaleString("en-US", {
                          maximumFractionDigits: 8,
                        })}{" "}
                        {d.currency}
                      </div>
                      <div
                        style={{
                          color: muted,
                          fontSize: "0.72rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 200,
                        }}
                      >
                        {d.note || "—"}
                      </div>
                      <div>
                        <Badge status={d.status} />
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <button
                          className="action-btn"
                          onClick={() => setEditing(d)}
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
                      </div>
                    </div>
                  );
                })
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
