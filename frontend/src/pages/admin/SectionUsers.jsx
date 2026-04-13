import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  RefreshCw,
  Wallet,
  ChevronDown,
  ChevronUp,
  X,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Eye,
} from "lucide-react";
import api from "../../services/apiService";
import { fmtUSD, fmtDate, Badge, Skel, PaginationBar } from "./AdminShared";

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

const TYPE_COLORS = {
  bonus: {
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    color: "#f59e0b",
  },
  deposit: {
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.3)",
    color: "#34d399",
  },
  withdrawal: {
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.3)",
    color: "#f87171",
  },
  trade: {
    bg: "rgba(96,165,250,0.1)",
    border: "rgba(96,165,250,0.3)",
    color: "#60a5fa",
  },
  referral: {
    bg: "rgba(167,139,250,0.1)",
    border: "rgba(167,139,250,0.3)",
    color: "#a78bfa",
  },
  fee: {
    bg: "rgba(148,163,184,0.1)",
    border: "rgba(148,163,184,0.3)",
    color: "#94a3b8",
  },
};

// Helper function to format crypto holdings display
const formatCryptoHoldings = (balances) => {
  const parts = [];
  if (balances?.BTC > 0) parts.push(`₿${balances.BTC.toFixed(4)}`);
  if (balances?.ETH > 0) parts.push(`⟠${balances.ETH.toFixed(4)}`);
  if (balances?.SOL > 0) parts.push(`◎${balances.SOL.toFixed(2)}`);
  if (balances?.BNB > 0) parts.push(`🟡${balances.BNB.toFixed(2)}`);
  if (balances?.USDT > 0 && !parts.length) parts.push(`💵${balances.USDT.toFixed(2)}`);
  return parts.join(" ");
};

//  Adjust Wallet Modal
function AdjustWalletModal({
  user,
  onClose,
  onSuccess,
  showToast,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  divLine,
  inputBg,
}) {
  const [form, setForm] = useState({
    amount: "",
    type: "bonus",
    note: "",
    currency: "USDT",
  });
  const [saving, setSaving] = useState(false);

  const iStyle = {
    width: "100%",
    padding: "9px 11px",
    borderRadius: 10,
    border: `1px solid ${border}`,
    background: inputBg,
    color: textClr,
    fontSize: "0.85rem",
    boxSizing: "border-box",
  };

  const amt = parseFloat(form.amount);
  const isCredit = !isNaN(amt) && amt > 0;
  const tc = TYPE_COLORS[form.type] || TYPE_COLORS.bonus;

  const submit = async () => {
    if (!form.amount || isNaN(amt)) {
      showToast("Enter a valid amount", "error");
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/admin/users/${user._id}/wallet`, {
        amount: amt,
        note: form.note || `Admin ${form.type} adjustment`,
        currency: form.currency,
        type: form.type,
      });
      showToast(
        `Wallet ${isCredit ? "credited" : "debited"} $${Math.abs(amt).toFixed(2)}`,
      );
      onSuccess();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
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
        padding: 20,
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
          maxWidth: 420,
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ color: textClr, fontWeight: 800, fontSize: "1rem" }}>
              Adjust Wallet
            </div>
            <div style={{ color: muted, fontSize: "0.72rem", marginTop: 2 }}>
              {user.firstName} {user.lastName}
            </div>
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
            padding: "12px 14px",
            borderRadius: 12,
            background: darkMode
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.03)",
            border: `1px solid ${divLine}`,
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: muted,
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Current Balance
          </span>
          <span
            style={{
              color: textClr,
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: "0.95rem",
            }}
          >
            {fmtUSD(user.wallet?.totalUSD || user.wallet?.balance)}
          </span>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 700,
              display: "block",
              marginBottom: 5,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Amount
          </label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: muted,
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              $
            </span>
            <input
              style={{ ...iStyle, paddingLeft: 26 }}
              type="number"
              placeholder="0.00  (negative = debit)"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
            />
          </div>
          {form.amount && !isNaN(amt) && (
            <div
              style={{
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: "0.73rem",
                fontWeight: 600,
                color: isCredit ? "#34d399" : "#f87171",
              }}
            >
              {isCredit ? (
                <>
                  <TrendingUp style={{ width: 12, height: 12 }} /> Credit +$
                  {Math.abs(amt).toFixed(2)} to balance
                </>
              ) : (
                <>
                  <TrendingDown style={{ width: 12, height: 12 }} /> Debit −$
                  {Math.abs(amt).toFixed(2)} from balance
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 700,
              display: "block",
              marginBottom: 5,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Transaction Type
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 6,
            }}
          >
            {["bonus", "deposit", "withdrawal", "trade", "referral", "fee"].map(
              (t) => {
                const c = TYPE_COLORS[t];
                const active = form.type === t;
                return (
                  <button
                    key={t}
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    style={{
                      padding: "8px 4px",
                      borderRadius: 9,
                      border: `1px solid ${active ? c.border : border}`,
                      background: active ? c.bg : "transparent",
                      color: active ? c.color : muted,
                      fontSize: "0.72rem",
                      fontWeight: active ? 700 : 500,
                      cursor: "pointer",
                      textTransform: "capitalize",
                      transition: "all 0.15s",
                    }}
                  >
                    {t}
                  </button>
                );
              },
            )}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 700,
              display: "block",
              marginBottom: 5,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Currency
          </label>
          <EnhancedSelect
            value={form.currency}
            onChange={(e) =>
              setForm((f) => ({ ...f, currency: e.target.value }))
            }
            options={[
              { value: "USDT", label: "USDT - Tether", icon: "₿", color: "#34d399" },
              { value: "BTC", label: "BTC - Bitcoin", icon: "₿", color: "#f59e0b" },
              { value: "ETH", label: "ETH - Ethereum", icon: "⟠", color: "#a78bfa" },
              { value: "BNB", label: "BNB - Binance Coin", icon: "🟡", color: "#f59e0b" },
              { value: "SOL", label: "SOL - Solana", icon: "⚡", color: "#60a5fa" },
              { value: "USD", label: "USD - US Dollar", icon: "💵", color: "#34d399" },
            ]}
            darkMode={darkMode}
            textClr={textClr}
            muted={muted}
            border={border}
            inputBg={inputBg}
            placeholder="Select currency"
            style={{ padding: "9px 11px" }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 700,
              display: "block",
              marginBottom: 5,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Note{" "}
            <span style={{ fontWeight: 400, textTransform: "none" }}>
              (optional)
            </span>
          </label>
          <input
            style={iStyle}
            type="text"
            placeholder="e.g. Referral reward, manual correction…"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          />
        </div>

        {form.amount && !isNaN(amt) && (
          <div
            style={{
              padding: "9px 13px",
              borderRadius: 9,
              background: tc.bg,
              border: `1px solid ${tc.border}`,
              color: tc.color,
              fontSize: "0.75rem",
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            {isCredit ? "▲" : "▼"} {form.type.charAt(0).toUpperCase() + form.type.slice(1)} ·{" "}
            {isCredit ? "+" : ""}{amt.toFixed(2)} {form.currency}
            {form.note ? ` · "${form.note}"` : ""}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
            onClick={submit}
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
            {saving ? "Saving…" : "Apply"}
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSelectedDisplay = () => {
    const option = options.find((opt) => opt.value === value);
    if (option) return option.label;
    if (value) return value;
    return placeholder;
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={selectRef} style={{ position: "relative", flex: "0 1 130px" }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 8,
          border: `1px solid ${isOpen ? "#f59e0b" : border}`,
          background: inputBg,
          color: textClr,
          fontSize: "0.82rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          transition: "all 0.2s ease",
          boxSizing: "border-box",
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
            width: 12,
            height: 12,
            color: isOpen ? "#f59e0b" : muted,
            transition: "transform 0.2s ease",
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
            marginTop: 6,
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
                  {option.icon && <span style={{ fontSize: "0.9rem" }}>{option.icon}</span>}
                  <span>{option.label}</span>
                </div>
                {isSelected && <CheckCircle style={{ width: 12, height: 12, color: "#f59e0b" }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

//  Main component
export default function SectionUsers({
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  divLine,
  inputBg,
  showToast,
  onViewUserDetails,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [acting, setActing] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [adjusting, setAdjusting] = useState(null);

  const isMobile = useIsMobile();

  const silentRefresh = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data?.data || []);
      setPages(res.data?.pagination?.pages || 1);
    } catch {}
  }, [search, status, page]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data?.data || []);
      setPages(res.data?.pagination?.pages || 1);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, newStatus) => {
    setActing(id);
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, status: newStatus } : u)),
    );
    try {
      await api.patch(`/admin/users/${id}/status`, { status: newStatus });
      showToast(`User ${newStatus}`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
      await silentRefresh();
    } finally {
      setActing(null);
    }
  };

  const viewUserDetails = (userId) => {
    if (onViewUserDetails) {
      onViewUserDetails(userId);
    } else {
      window.open(`/admin/user/${userId}`, "_blank");
    }
  };

  const ActionButtons = ({ u }) => (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      <button
        className="action-btn"
        onClick={() => viewUserDetails(u._id)}
        style={{
          padding: "5px 10px",
          borderRadius: 6,
          border: `1px solid ${border}`,
          background: "transparent",
          color: "#60a5fa",
          fontSize: "0.72rem",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Eye style={{ width: 11, height: 11 }} /> View
      </button>

      <button
        className="action-btn"
        onClick={() => setAdjusting(u)}
        style={{
          padding: "5px 10px",
          borderRadius: 6,
          border: `1px solid ${border}`,
          background: "transparent",
          color: "#f59e0b",
          fontSize: "0.72rem",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Wallet style={{ width: 11, height: 11 }} /> Adjust
      </button>

      {u.status === "active" && (
        <button
          className="action-btn"
          onClick={() => updateStatus(u._id, "suspended")}
          disabled={acting === u._id}
          style={{
            padding: "5px 10px",
            borderRadius: 6,
            border: "1px solid rgba(245,158,11,0.3)",
            background: "rgba(245,158,11,0.08)",
            color: "#f59e0b",
            fontSize: "0.72rem",
            fontWeight: 700,
            cursor: acting === u._id ? "not-allowed" : "pointer",
            opacity: acting === u._id ? 0.6 : 1,
          }}
        >
          {acting === u._id ? "…" : "Suspend"}
        </button>
      )}
      {u.status === "suspended" && (
        <button
          className="action-btn"
          onClick={() => updateStatus(u._id, "active")}
          disabled={acting === u._id}
          style={{
            padding: "5px 10px",
            borderRadius: 6,
            border: "1px solid rgba(52,211,153,0.3)",
            background: "rgba(52,211,153,0.08)",
            color: "#34d399",
            fontSize: "0.72rem",
            fontWeight: 700,
            cursor: acting === u._id ? "not-allowed" : "pointer",
            opacity: acting === u._id ? 0.6 : 1,
          }}
        >
          {acting === u._id ? "…" : "Activate"}
        </button>
      )}

      {u.status !== "banned" ? (
        <button
          className="action-btn"
          onClick={() => updateStatus(u._id, "banned")}
          disabled={acting === u._id}
          style={{
            padding: "5px 10px",
            borderRadius: 6,
            border: "1px solid rgba(248,113,113,0.3)",
            background: "rgba(248,113,113,0.08)",
            color: "#f87171",
            fontSize: "0.72rem",
            fontWeight: 700,
            cursor: acting === u._id ? "not-allowed" : "pointer",
            opacity: acting === u._id ? 0.6 : 1,
          }}
        >
          {acting === u._id ? "…" : "Block"}
        </button>
      ) : (
        <button
          className="action-btn"
          onClick={() => updateStatus(u._id, "active")}
          disabled={acting === u._id}
          style={{
            padding: "5px 10px",
            borderRadius: 6,
            border: "1px solid rgba(52,211,153,0.3)",
            background: "rgba(52,211,153,0.08)",
            color: "#34d399",
            fontSize: "0.72rem",
            fontWeight: 700,
            cursor: acting === u._id ? "not-allowed" : "pointer",
            opacity: acting === u._id ? 0.6 : 1,
          }}
        >
          {acting === u._id ? "…" : "Unblock"}
        </button>
      )}
    </div>
  );

  return (
    <div>
      {adjusting && (
        <AdjustWalletModal
          user={adjusting}
          onClose={() => setAdjusting(null)}
          onSuccess={() => {
            setAdjusting(null);
            load();
          }}
          showToast={showToast}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          divLine={divLine}
          inputBg={inputBg}
        />
      )}

      {/* Filter bar */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 14,
          padding: "10px 14px",
          marginBottom: 14,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ position: "relative", flex: "1 1 160px", minWidth: 0 }}>
          <Search
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              width: 13,
              height: 13,
              color: muted,
            }}
          />
          <input
            placeholder="Search name, email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              padding: "8px 10px 8px 30px",
              borderRadius: 8,
              border: `1px solid ${border}`,
              background: inputBg,
              color: textClr,
              fontSize: "0.82rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        <EnhancedSelect
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={[
            { value: "", label: " All Status", icon: "📊" },
            { value: "active", label: " Active", icon: "🟢", color: "#34d399" },
            { value: "suspended", label: " Suspended", icon: "🟡", color: "#f59e0b" },
            { value: "banned", label: "Banned", icon: "🔴", color: "#f87171" },
            { value: "pending", label: " Pending", icon: "⏳", color: "#60a5fa" },
          ]}
          darkMode={darkMode}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
          placeholder="All Status"
        />

        <button
          onClick={load}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: `1px solid ${border}`,
            background: "transparent",
            color: muted,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: "0.78rem",
            flexShrink: 0,
          }}
        >
          <RefreshCw style={{ width: 12, height: 12 }} /> Refresh
        </button>
      </div>

      {/* Content */}
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
                padding: "14px 16px",
                borderBottom: `1px solid ${divLine}`,
              }}
            >
              <Skel h={14} dark={darkMode} />
            </div>
          ))
        ) : isMobile ? (
          users.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: muted }}>
              No users found.
            </div>
          ) : (
            users.map((u, i) => {
              const open = expanded === u._id;
              return (
                <div
                  key={u._id}
                  style={{
                    borderBottom: i < users.length - 1 ? `1px solid ${divLine}` : "none",
                  }}
                >
                  <div
                    onClick={() => setExpanded(open ? null : u._id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 16px",
                      cursor: "pointer",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: "rgba(245,158,11,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: "#f59e0b",
                          fontWeight: 800,
                          fontSize: "0.85rem",
                        }}
                      >
                        {u.firstName?.[0]?.toUpperCase() || "?"}
                      </div>
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
                          {u.firstName} {u.lastName}
                        </div>
                        <div
                          style={{
                            color: muted,
                            fontSize: "0.7rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {u.email}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <Badge status={u.status} />
                      {open ? (
                        <ChevronUp style={{ width: 14, height: 14, color: muted }} />
                      ) : (
                        <ChevronDown style={{ width: 14, height: 14, color: muted }} />
                      )}
                    </div>
                  </div>
                  {open && (
                    <div
                      style={{
                        padding: "0 16px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {[
                        {
                          label: "Total Balance",
                          value: (
                            <div style={{ textAlign: "right" }}>
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontWeight: 700,
                                  color: textClr,
                                }}
                              >
                                ${u.wallet?.totalUSD?.toLocaleString() || fmtUSD(u.wallet?.balance)}
                              </span>
                              {u.wallet?.locked > 0 && (
                                <span style={{ color: muted, fontSize: "0.68rem", display: "block" }}>
                                  🔒 Locked: {fmtUSD(u.wallet.locked)}
                                </span>
                              )}
                              {u.wallet?.balances && (
                                <span style={{ color: muted, fontSize: "0.6rem", display: "block", marginTop: 2 }}>
                                  {formatCryptoHoldings(u.wallet.balances)}
                                </span>
                              )}
                            </div>
                          ),
                        },
                        { label: "KYC", value: <Badge status={u.kyc?.status || "unverified"} /> },
                        { label: "Joined", value: <span style={{ color: muted, fontSize: "0.78rem" }}>{fmtDate(u.createdAt)}</span> },
                      ].map((row) => (
                        <div
                          key={row.label}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderTop: `1px solid ${divLine}`,
                            paddingTop: 8,
                          }}
                        >
                          <span
                            style={{
                              color: muted,
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            {row.label}
                          </span>
                          {row.value}
                        </div>
                      ))}
                      <div style={{ borderTop: `1px solid ${divLine}`, paddingTop: 10 }}>
                        <ActionButtons u={u} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          <div className="thin-scroll" style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 760 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 150px 100px 110px 110px 140px",
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
                <div>User</div>
                <div>Total Balance</div>
                <div>KYC</div>
                <div>Status</div>
                <div>Joined</div>
                <div style={{ textAlign: "right" }}>Actions</div>
              </div>
              {users.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: muted }}>
                  No users found.
                </div>
              ) : (
                users.map((u, i) => (
                  <div
                    key={u._id}
                    className="adm-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 150px 100px 110px 110px 140px",
                      gap: 8,
                      padding: "12px 18px",
                      borderBottom: i < users.length - 1 ? `1px solid ${divLine}` : "none",
                      alignItems: "center",
                      whiteSpace: "nowrap",
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
                        }}
                      >
                        {u.firstName} {u.lastName}
                      </div>
                      <div
                        style={{
                          color: muted,
                          fontSize: "0.7rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {u.email}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          color: textClr,
                          fontFamily: "monospace",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                        }}
                      >
                        ${u.wallet?.totalUSD?.toLocaleString() || fmtUSD(u.wallet?.balance)}
                      </div>
                      {u.wallet?.locked > 0 && (
                        <div style={{ color: muted, fontSize: "0.68rem" }}>
                          🔒 Locked: {fmtUSD(u.wallet.locked)}
                        </div>
                      )}
                      {u.wallet?.balances && (
                        <div style={{ color: muted, fontSize: "0.6rem", marginTop: 2 }}>
                          {formatCryptoHoldings(u.wallet.balances)}
                        </div>
                      )}
                    </div>
                    <div>
                      <Badge status={u.kyc?.status || "unverified"} />
                    </div>
                    <div>
                      <Badge status={u.status} />
                    </div>
                    <div style={{ color: muted, fontSize: "0.75rem" }}>
                      {fmtDate(u.createdAt)}
                    </div>
                    <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                      <ActionButtons u={u} />
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