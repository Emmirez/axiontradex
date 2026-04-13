// frontend/src/pages/admin/SectionCopyTrading.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign,
  Shield,
  Star,
  X,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  Activity,
  TrendingDown,
  Play,
  Square,
  AlertCircle,
  Info,
} from "lucide-react";
import api from "../../services/apiService";
import { fmtDate, Badge, Skel, PaginationBar } from "./AdminShared";

// ─── In-modal Toast ────────────────────────────────────────────────────────────
function InlineToast({ message, type = "success", onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 7000);
    return () => clearTimeout(t);
  }, [message]);

  const colors = {
    success: {
      bg: "rgba(52,211,153,0.12)",
      border: "rgba(52,211,153,0.3)",
      color: "#34d399",
      Icon: CheckCircle,
    },
    error: {
      bg: "rgba(248,113,113,0.12)",
      border: "rgba(248,113,113,0.3)",
      color: "#f87171",
      Icon: AlertCircle,
    },
    info: {
      bg: "rgba(96,165,250,0.12)",
      border: "rgba(96,165,250,0.3)",
      color: "#60a5fa",
      Icon: Info,
    },
  };
  const { bg, border, color, Icon } = colors[type] || colors.info;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 12,
        background: bg,
        border: `1px solid ${border}`,
        marginBottom: 16,
        animation: "fadeSlideIn 0.25s ease",
      }}
    >
      <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }`}</style>
      <Icon size={16} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ color, fontSize: "0.8rem", flex: 1, lineHeight: 1.5 }}>
        {message}
      </span>
      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color,
          padding: 0,
          lineHeight: 1,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Custom Select ─────────────────────────────────────────────────────────────
function CustomSelect({
  value,
  onChange,
  options,
  darkMode,
  border,
  textClr,
  muted,
  placeholder = "Select",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);
  const dropBg = darkMode ? "#1e293b" : "#ffffff";

  return (
    <div ref={ref} style={{ position: "relative", minWidth: 140 }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "8px 12px",
          borderRadius: 12,
          border: `1px solid ${border}`,
          background: dropBg,
          color: textClr,
          fontSize: "0.8rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span>{selected?.label || placeholder}</span>
        <ChevronDown
          size={14}
          color={muted}
          style={{
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "none",
          }}
        />
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: dropBg,
            border: `1px solid ${border}`,
            borderRadius: 12,
            overflow: "hidden",
            zIndex: 200,
            boxShadow: darkMode
              ? "0 8px 24px rgba(0,0,0,0.5)"
              : "0 8px 24px rgba(0,0,0,0.12)",
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
                padding: "9px 12px",
                cursor: "pointer",
                color: textClr,
                fontSize: "0.8rem",
                background:
                  value === opt.value
                    ? darkMode
                      ? "rgba(245,158,11,0.15)"
                      : "rgba(245,158,11,0.08)"
                    : "transparent",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = darkMode
                  ? "rgba(245,158,11,0.2)"
                  : "rgba(245,158,11,0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  value === opt.value
                    ? darkMode
                      ? "rgba(245,158,11,0.15)"
                      : "rgba(245,158,11,0.08)"
                    : "transparent")
              }
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Trader Modal ──────────────────────────────────────────────────────────────
function TraderModal({
  trader,
  onClose,
  onSave,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  inputBg,
  showToast,
}) {
  const [form, setForm] = useState({
    userId: trader?.user?._id || "",
    username: trader?.username || "",
    bio: trader?.bio || "",
    subscriptionFee: trader?.subscriptionFee || 0,
    isActive: trader?.isActive !== undefined ? trader.isActive : true,
    isVerified: trader?.isVerified || false,
    stats: {
      winRate: trader?.stats?.winRate || 0,
      totalFollowers: trader?.stats?.totalFollowers || 0,
      monthlyProfit: trader?.stats?.monthlyProfit || 0,
      totalReturn: trader?.stats?.totalReturn || 0,
      totalTrades: trader?.stats?.totalTrades || 0,
      winningTrades: trader?.stats?.winningTrades || 0,
      avgProfit: trader?.stats?.avgProfit || 0,
    },
  });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target)
      )
        setShowUserDropdown(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const searchUsers = async (term) => {
    if (term.length < 2) return;
    setLoadingUsers(true);
    try {
      const res = await api.get(`/admin/users?search=${term}&limit=10`);
      setUsers(res.data?.data || []);
      setShowUserDropdown(true);
    } catch {
    } finally {
      setLoadingUsers(false);
    }
  };

  const selectUser = (user) => {
    setForm({
      ...form,
      userId: user._id,
      username: user.username || `${user.firstName} ${user.lastName}`,
    });
    setShowUserDropdown(false);
    setUserSearch("");
  };

  const iStyle = {
    width: "100%",
    padding: "9px 11px",
    borderRadius: 12,
    border: `1px solid ${border}`,
    background: inputBg,
    color: textClr,
    fontSize: "0.85rem",
    boxSizing: "border-box",
    outline: "none",
  };

  const handleSubmit = async () => {
    if (!form.userId) {
      setToast({ msg: "Please select a user", type: "error" });
      return;
    }
    if (!form.username.trim()) {
      setToast({ msg: "Username is required", type: "error" });
      return;
    }
    setSaving(true);
    try {
      await api.post("/copy-trading/admin/trader", form);
      showToast(
        trader ? "Trader updated successfully" : "Trader created successfully",
        "success",
      );
      onSave();
      onClose();
    } catch (err) {
      setToast({
        msg: err.response?.data?.message || "Failed to save trader",
        type: "error",
      });
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
          borderRadius: 24,
          width: "100%",
          maxWidth: 550,
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ color: textClr, fontSize: "1.2rem", fontWeight: 700 }}>
            {trader ? "Edit Copy Trader" : "Create Copy Trader"}
          </h2>
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

        {toast && (
          <InlineToast
            message={toast.msg}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}

        {/* User Selection */}
        <div style={{ marginBottom: 12 }} ref={userDropdownRef}>
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
          {trader ? (
            <div style={{ ...iStyle, cursor: "not-allowed", opacity: 0.7 }}>
              {trader.user?.firstName} {trader.user?.lastName} (
              {trader.user?.email})
            </div>
          ) : (
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
                    borderRadius: 12,
                    maxHeight: 200,
                    overflowY: "auto",
                    zIndex: 100,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
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
                          ? "rgba(245,158,11,0.15)"
                          : "rgba(245,158,11,0.08)")
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
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 4,
            }}
          >
            Username *
          </label>
          <input
            style={iStyle}
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Display name"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 4,
            }}
          >
            Bio
          </label>
          <textarea
            rows={2}
            style={iStyle}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Trading style..."
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 4,
            }}
          >
            Subscription Fee (USDT/month)
          </label>
          <input
            type="number"
            style={iStyle}
            value={form.subscriptionFee}
            onChange={(e) =>
              setForm({
                ...form,
                subscriptionFee: parseFloat(e.target.value) || 0,
              })
            }
          />
          <div style={{ color: muted, fontSize: "0.65rem", marginTop: 4 }}>
            Set to 0 for free
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
          {[
            {
              label: "Win Rate (%)",
              key: "winRate",
              step: "0.1",
              parse: parseFloat,
            },
            {
              label: "Total Followers",
              key: "totalFollowers",
              parse: parseInt,
            },
            {
              label: "Monthly Profit (USDT)",
              key: "monthlyProfit",
              parse: parseFloat,
            },
            {
              label: "Total Return (%)",
              key: "totalReturn",
              step: "0.1",
              parse: parseFloat,
            },
            { label: "Total Trades", key: "totalTrades", parse: parseInt },
            { label: "Winning Trades", key: "winningTrades", parse: parseInt },
          ].map(({ label, key, step, parse }) => (
            <div key={key}>
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
                type="number"
                step={step || "1"}
                style={iStyle}
                value={form.stats[key]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stats: { ...form.stats, [key]: parse(e.target.value) || 0 },
                  })
                }
              />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 4,
            }}
          >
            Avg Profit per Trade (USDT)
          </label>
          <input
            type="number"
            step="0.01"
            style={iStyle}
            value={form.stats.avgProfit}
            onChange={(e) =>
              setForm({
                ...form,
                stats: {
                  ...form.stats,
                  avgProfit: parseFloat(e.target.value) || 0,
                },
              })
            }
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Active (visible to users)", key: "isActive" },
            { label: "Verified Badge", key: "isVerified" },
          ].map(({ label, key }) => (
            <label
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
              />
              <span style={{ color: textClr, fontSize: "0.8rem" }}>
                {label}
              </span>
            </label>
          ))}
        </div>

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
              padding: "10px",
              borderRadius: 12,
              border: `1px solid ${border}`,
              background: "transparent",
              color: textClr,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: "10px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#f59e0b,#d97706)",
              color: "#fff",
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : trader ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({
  onClose,
  onConfirm,
  traderName,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
}) {
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
          maxWidth: 400,
          padding: "24px",
        }}
      >
        <h3
          style={{
            color: textClr,
            fontSize: "1.1rem",
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          Delete Trader
        </h3>
        <p style={{ color: muted, marginBottom: 24 }}>
          Are you sure you want to delete "{traderName}"? This will remove them
          from the copy trading platform.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: `1px solid ${border}`,
              background: "transparent",
              color: textClr,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "none",
              background: "#f87171",
              color: "#fff",
              fontWeight: 600,
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

// ─── Close Trade Sub-modal ─────────────────────────────────────────────────────
function CloseTradeModal({
  trade,
  onClose,
  onConfirm,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  inputBg,
}) {
  const [exitPrice, setExitPrice] = useState("");
  const [closing, setClosing] = useState(false);
  const [toast, setToast] = useState(null);

  const handleConfirm = async () => {
    const price = parseFloat(exitPrice);
    if (!exitPrice || isNaN(price) || price <= 0) {
      setToast({ msg: "Please enter a valid exit price", type: "error" });
      return;
    }
    setClosing(true);
    try {
      await onConfirm(trade._id, price);
    } catch {
      setToast({ msg: "Failed to close trade", type: "error" });
      setClosing(false);
    }
  };

  const iStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 12,
    border: `1px solid ${border}`,
    background: inputBg,
    color: textClr,
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
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
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
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
          maxWidth: 380,
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              color: textClr,
              fontWeight: 700,
              fontSize: "1rem",
              margin: 0,
            }}
          >
            Close Trade
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
            <X size={18} />
          </button>
        </div>

        {toast && (
          <InlineToast
            message={toast.msg}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}

        {/* Trade summary */}
        <div
          style={{
            background: darkMode
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.03)",
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <span style={{ fontWeight: 700, color: textClr }}>
              {trade.symbol}
            </span>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 6,
                fontSize: "0.7rem",
                fontWeight: 700,
                background:
                  trade.side === "buy"
                    ? "rgba(52,211,153,0.12)"
                    : "rgba(248,113,113,0.12)",
                color: trade.side === "buy" ? "#34d399" : "#f87171",
              }}
            >
              {trade.side.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: muted }}>
            Entry:{" "}
            <b style={{ color: textClr }}>
              ${trade.entryPrice?.toLocaleString()}
            </b>
            &nbsp;·&nbsp; Qty:{" "}
            <b style={{ color: textClr }}>{trade.quantity}</b>
          </div>
        </div>

        <label
          style={{
            color: muted,
            fontSize: "0.7rem",
            fontWeight: 600,
            display: "block",
            marginBottom: 6,
          }}
        >
          Exit Price (USDT)
        </label>
        <input
          type="number"
          style={iStyle}
          value={exitPrice}
          onChange={(e) => setExitPrice(e.target.value)}
          placeholder={`e.g. ${(trade.entryPrice * 1.05).toFixed(0)}`}
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
        />

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
              padding: "10px",
              borderRadius: 12,
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
            disabled={closing}
            style={{
              padding: "10px",
              borderRadius: 12,
              border: "none",
              background: closing
                ? "#94a3b8"
                : "linear-gradient(135deg,#f87171,#ef4444)",
              color: "#fff",
              fontWeight: 600,
              cursor: closing ? "not-allowed" : "pointer",
            }}
          >
            {closing ? "Closing..." : "Confirm Close"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Trade Modal ───────────────────────────────────────────────────────────────
function TradeModal({
  trader,
  onClose,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  inputBg,
  showToast,
}) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [closingTrade, setClosingTrade] = useState(null); // trade being closed
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    symbol: "BTCUSDT",
    side: "buy",
    entryPrice: "",
    quantity: "1",
    note: "",
  });

  const iStyle = {
    width: "100%",
    padding: "9px 11px",
    borderRadius: 10,
    border: `1px solid ${border}`,
    background: inputBg,
    color: textClr,
    fontSize: "0.85rem",
    outline: "none",
    boxSizing: "border-box",
  };

  const symbolOptions = [
    "BTCUSDT",
    "ETHUSDT",
    "SOLUSDT",
    "BNBUSDT",
    "XRPUSDT",
    "ADAUSDT",
    "DOGEUSDT",
    "AVAXUSDT",
    "LINKUSDT",
  ];

  const loadTrades = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/copy-trading/admin/trader/${trader._id}/trades`,
      );
      setTrades(res.data?.data?.trades || []);
    } catch (err) {
      setToast({ msg: "Failed to load trades", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, []);

  const handleOpen = async () => {
    if (!form.entryPrice) {
      setToast({ msg: "Entry price is required", type: "error" });
      return;
    }
    if (parseFloat(form.entryPrice) <= 0) {
      setToast({ msg: "Entry price must be greater than 0", type: "error" });
      return;
    }

    // Capture form values before clearing
    const payload = {
      traderId: trader._id,
      symbol: form.symbol,
      side: form.side,
      entryPrice: parseFloat(form.entryPrice),
      quantity: parseFloat(form.quantity),
      note: form.note,
    };

    // Optimistic: insert pending trade into list immediately
    const optimisticId = `opt-${Date.now()}`;
    const optimisticTrade = {
      _id: optimisticId,
      symbol: payload.symbol,
      side: payload.side,
      entryPrice: payload.entryPrice,
      quantity: payload.quantity,
      note: payload.note,
      status: "open",
      _optimistic: true,
    };
    setTrades((prev) => [optimisticTrade, ...prev]);
    setForm({
      symbol: "BTCUSDT",
      side: "buy",
      entryPrice: "",
      quantity: "1",
      note: "",
    });
    setOpening(true);

    try {
      const res = await api.post("/copy-trading/admin/trade/open", payload);
      const mirrored = res.data?.data?.mirroredTo ?? 0;
      // Show success immediately — don't wait for loadTrades
      setToast({
        msg: `✓ Trade opened & mirrored to ${mirrored} follower${mirrored !== 1 ? "s" : ""}`,
        type: "success",
      });
      // Refetch in background to replace optimistic entry with real data
      loadTrades();
    } catch (err) {
      // Roll back optimistic entry
      setTrades((prev) => prev.filter((t) => t._id !== optimisticId));
      setToast({
        msg: err.response?.data?.message || "Failed to open trade",
        type: "error",
      });
    } finally {
      setOpening(false);
    }
  };

  const handleCloseConfirm = async (tradeId, exitPrice) => {
    // Optimistic: mark trade as closed immediately in the list
    setTrades((prev) =>
      prev.map((t) =>
        t._id === tradeId
          ? { ...t, status: "closed", exitPrice, _optimistic: true }
          : t,
      ),
    );
    setClosingTrade(null); // close the sub-modal instantly

    try {
      const res = await api.post(`/copy-trading/admin/trade/${tradeId}/close`, {
        exitPrice,
      });
      const { settled, profitPercent } = res.data?.data || {};
      const pnl = parseFloat(profitPercent);
      setToast({
        msg: `✓ Trade closed · ${settled ?? 0} position${settled !== 1 ? "s" : ""} settled · P&L: ${pnl >= 0 ? "+" : ""}${profitPercent}%`,
        type: pnl >= 0 ? "success" : "info",
      });
      // Refetch in background to get accurate profitPercent on the row
      loadTrades();
    } catch (err) {
      // Roll back optimistic close
      setTrades((prev) =>
        prev.map((t) =>
          t._id === tradeId
            ? { ...t, status: "open", exitPrice: undefined }
            : t,
        ),
      );
      setToast({
        msg: err.response?.data?.message || "Failed to close trade",
        type: "error",
      });
    }
  };

  return (
    <>
      {/* Close-trade sub-modal — rendered OUTSIDE the scrollable modal so it's always on top */}
      {closingTrade && (
        <CloseTradeModal
          trade={closingTrade}
          onClose={() => setClosingTrade(null)}
          onConfirm={handleCloseConfirm}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
        />
      )}

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
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
            borderRadius: 24,
            width: "100%",
            maxWidth: 600,
            maxHeight: "88vh",
            overflowY: "auto",
            padding: 24,
            scrollbarWidth: "thin",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div>
              <h2
                style={{
                  color: textClr,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Manage Trades — {trader.username}
              </h2>
              <p
                style={{ color: muted, fontSize: "0.75rem", margin: "4px 0 0" }}
              >
                {trader.stats?.totalFollowers || 0} active followers will be
                mirrored
              </p>
            </div>
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

          {/* In-modal toast — always visible inside modal */}
          {toast && (
            <InlineToast
              message={toast.msg}
              type={toast.type}
              onDismiss={() => setToast(null)}
            />
          )}

          {/* Open Trade Form */}
          <div
            style={{
              background: darkMode
                ? "rgba(245,158,11,0.05)"
                : "rgba(245,158,11,0.03)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                color: textClr,
                fontSize: "0.9rem",
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Open New Trade
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 10,
              }}
            >
              {/* Symbol — custom themed select */}
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
                  Symbol
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={form.symbol}
                    onChange={(e) =>
                      setForm({ ...form, symbol: e.target.value })
                    }
                    style={{
                      ...iStyle,
                      appearance: "none",
                      WebkitAppearance: "none",
                      paddingRight: 32,
                      cursor: "pointer",
                    }}
                  >
                    {symbolOptions.map((s) => (
                      <option
                        key={s}
                        value={s}
                        style={{
                          background: darkMode ? "#1e293b" : "#ffffff",
                          color: textClr,
                        }}
                      >
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    color={muted}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              {/* Side */}
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
                  Side
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["buy", "sell"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm({ ...form, side: s })}
                      style={{
                        flex: 1,
                        padding: "9px",
                        borderRadius: 10,
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        background:
                          form.side === s
                            ? s === "buy"
                              ? "rgba(52,211,153,0.15)"
                              : "rgba(248,113,113,0.15)"
                            : inputBg,
                        color:
                          form.side === s
                            ? s === "buy"
                              ? "#34d399"
                              : "#f87171"
                            : muted,
                        transition: "all 0.15s",
                      }}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 10,
              }}
            >
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
                  Entry Price (USDT)
                </label>
                <input
                  type="number"
                  style={iStyle}
                  value={form.entryPrice}
                  onChange={(e) =>
                    setForm({ ...form, entryPrice: e.target.value })
                  }
                  placeholder="e.g. 84500"
                />
              </div>
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
                  Quantity
                </label>
                <input
                  type="number"
                  style={iStyle}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  placeholder="e.g. 1"
                />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  color: muted,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Note (optional)
              </label>
              <input
                style={iStyle}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="e.g. Strong support level breakout..."
              />
            </div>

            <button
              onClick={handleOpen}
              disabled={opening}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 12,
                border: "none",
                background: opening
                  ? "#64748b"
                  : "linear-gradient(135deg,#f59e0b,#d97706)",
                color: "#fff",
                fontWeight: 700,
                cursor: opening ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "opacity 0.2s",
              }}
            >
              <Play size={14} />
              {opening
                ? "Opening & Mirroring..."
                : "Open Trade & Mirror to Followers"}
            </button>
          </div>

          {/* Trade History */}
          <h3
            style={{
              color: textClr,
              fontSize: "0.9rem",
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Trade History
          </h3>

          {loading ? (
            <div style={{ textAlign: "center", padding: 30, color: muted }}>
              Loading trades...
            </div>
          ) : trades.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 30,
                color: muted,
                background: darkMode
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.02)",
                borderRadius: 12,
              }}
            >
              No trades yet. Open your first trade above.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {trades.map((trade) => (
                <div
                  key={trade._id}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: `1px solid ${trade.status === "open" ? "rgba(245,158,11,0.3)" : border}`,
                    background:
                      trade.status === "open"
                        ? darkMode
                          ? "rgba(245,158,11,0.05)"
                          : "rgba(245,158,11,0.02)"
                        : "transparent",
                    opacity: trade._optimistic ? 0.6 : 1,
                    transition: "opacity 0.4s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
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
                      <span style={{ fontWeight: 700, color: textClr }}>
                        {trade.symbol}
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          background:
                            trade.side === "buy"
                              ? "rgba(52,211,153,0.12)"
                              : "rgba(248,113,113,0.12)",
                          color: trade.side === "buy" ? "#34d399" : "#f87171",
                        }}
                      >
                        {trade.side.toUpperCase()}
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          background:
                            trade.status === "open"
                              ? "rgba(245,158,11,0.12)"
                              : "rgba(100,116,139,0.12)",
                          color:
                            trade.status === "open" ? "#f59e0b" : "#94a3b8",
                        }}
                      >
                        {trade.status.toUpperCase()}
                      </span>
                    </div>

                    {trade.status === "open" && (
                      <button
                        onClick={() => setClosingTrade(trade)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 8,
                          border: "none",
                          background: "rgba(248,113,113,0.15)",
                          color: "#f87171",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Square size={10} /> Close Trade
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 18,
                      fontSize: "0.75rem",
                      color: muted,
                      flexWrap: "wrap",
                    }}
                  >
                    <span>
                      Entry:{" "}
                      <b style={{ color: textClr }}>
                        ${trade.entryPrice?.toLocaleString()}
                      </b>
                    </span>
                    {trade.exitPrice && (
                      <span>
                        Exit:{" "}
                        <b style={{ color: textClr }}>
                          ${trade.exitPrice?.toLocaleString()}
                        </b>
                      </span>
                    )}
                    {trade.status === "closed" && (
                      <span>
                        P&L:{" "}
                        <b
                          style={{
                            color:
                              trade.profitPercent >= 0 ? "#34d399" : "#f87171",
                          }}
                        >
                          {trade.profitPercent >= 0 ? "+" : ""}
                          {trade.profitPercent?.toFixed(2)}%
                        </b>
                      </span>
                    )}
                    <span>
                      Qty: <b style={{ color: textClr }}>{trade.quantity}</b>
                    </span>
                    {trade.note && <span>Note: {trade.note}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SectionCopyTrading({
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  divLine,
  inputBg,
  showToast,
}) {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [managingTrades, setManagingTrades] = useState(null);

  const statusOptions = [
    { value: "", label: "All" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const loadTraders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/copy-trading/admin/all");
      let list = res.data?.data?.traders || [];
      if (filterStatus === "active") list = list.filter((t) => t.isActive);
      if (filterStatus === "inactive") list = list.filter((t) => !t.isActive);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (t) =>
            t.username?.toLowerCase().includes(q) ||
            t.user?.email?.toLowerCase().includes(q) ||
            `${t.user?.firstName} ${t.user?.lastName}`
              .toLowerCase()
              .includes(q),
        );
      }
      setTraders(list);
    } catch (err) {
      console.error("Failed to load traders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTraders();
  }, [filterStatus, search]);

  const toggleStatus = async (trader) => {
    try {
      await api.post("/copy-trading/admin/trader", {
        userId: trader.user?._id,
        isActive: !trader.isActive,
      });
      showToast(
        `Trader ${!trader.isActive ? "activated" : "deactivated"}`,
        "success",
      );
      loadTraders();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update status",
        "error",
      );
    }
  };

  const deleteTrader = async () => {
    try {
      await api.delete(`/copy-trading/admin/trader/${deleting._id}`);
      showToast("Trader deleted", "success");
      loadTraders();
      setDeleting(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  return (
    <div>
      {showModal && (
        <TraderModal
          trader={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={loadTraders}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
          showToast={showToast}
        />
      )}

      {deleting && (
        <DeleteModal
          onClose={() => setDeleting(null)}
          onConfirm={deleteTrader}
          traderName={deleting.username}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
        />
      )}

      {managingTrades && (
        <TradeModal
          trader={managingTrades}
          onClose={() => setManagingTrades(null)}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
          showToast={showToast}
        />
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ color: textClr, fontSize: "1.2rem", fontWeight: 700 }}>
            Copy Traders
          </h2>
          <p style={{ color: muted, fontSize: "0.75rem", marginTop: 2 }}>
            Manage traders that users can follow and copy
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <CustomSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={statusOptions}
            darkMode={darkMode}
            border={border}
            textClr={textClr}
            muted={muted}
            placeholder="All Status"
          />
          <button
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#f59e0b,#d97706)",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Plus size={14} /> Add Trader
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        <div
          style={{ padding: "12px 16px", borderBottom: `1px solid ${divLine}` }}
        >
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 12,
              border: `1px solid ${border}`,
              background: inputBg,
              color: textClr,
              fontSize: "0.85rem",
              outline: "none",
            }}
          />
        </div>

        <div className="thin-scroll" style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 800 }}>
            {/* Column headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "80px 140px 180px 1fr 120px 120px 100px 100px",
                gap: 12,
                padding: "12px 18px",
                color: muted,
                fontSize: "0.65rem",
                fontWeight: 700,
                borderBottom: `1px solid ${divLine}`,
              }}
            >
              {[
                "Status",
                "Username",
                "User",
                "Bio",
                "Win Rate",
                "Followers",
                "Fee",
                "Actions",
              ].map((h) => (
                <div key={h}>{h}</div>
              ))}
            </div>

            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 18px",
                    borderBottom: `1px solid ${divLine}`,
                  }}
                >
                  <Skel h={12} dark={darkMode} />
                </div>
              ))
            ) : traders.length === 0 ? (
              <div
                style={{ padding: "60px", textAlign: "center", color: muted }}
              >
                <Users
                  size={48}
                  color={muted}
                  style={{ marginBottom: 16, opacity: 0.5 }}
                />
                <div>No copy traders found</div>
                <div style={{ fontSize: "0.75rem", marginTop: 4 }}>
                  Click "Add Trader" to create your first copy trader
                </div>
              </div>
            ) : (
              traders.map((trader) => (
                <div
                  key={trader._id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "80px 140px 180px 1fr 120px 120px 100px 100px",
                    gap: 12,
                    padding: "12px 18px",
                    borderBottom: `1px solid ${divLine}`,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <button
                      onClick={() => toggleStatus(trader)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        border: "none",
                        background: trader.isActive
                          ? "rgba(52,211,153,0.12)"
                          : "rgba(148,163,184,0.12)",
                        color: trader.isActive ? "#34d399" : "#94a3b8",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {trader.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <span style={{ color: textClr, fontWeight: 600 }}>
                      {trader.username}
                    </span>
                    {trader.isVerified && <Shield size={12} color="#60a5fa" />}
                  </div>
                  <div>
                    <div style={{ color: textClr }}>
                      {trader.user?.firstName} {trader.user?.lastName}
                    </div>
                    <div style={{ color: muted, fontSize: "0.68rem" }}>
                      {trader.user?.email}
                    </div>
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
                    {trader.bio || "—"}
                  </div>
                  <div>
                    <span style={{ color: "#34d399", fontWeight: 600 }}>
                      {trader.stats?.winRate?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div>
                    <span style={{ color: textClr, fontWeight: 600 }}>
                      {trader.stats?.totalFollowers?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        color: trader.subscriptionFee > 0 ? "#f59e0b" : muted,
                      }}
                    >
                      {trader.subscriptionFee > 0
                        ? `$${trader.subscriptionFee}`
                        : "Free"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => {
                        setEditing(trader);
                        setShowModal(true);
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: `1px solid ${border}`,
                        background: "transparent",
                        cursor: "pointer",
                        color: muted,
                      }}
                      title="Edit"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => setDeleting(trader)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: `1px solid ${border}`,
                        background: "transparent",
                        cursor: "pointer",
                        color: "#f87171",
                      }}
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                    <button
                      onClick={() => setManagingTrades(trader)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: `1px solid ${border}`,
                        background: "transparent",
                        cursor: "pointer",
                        color: "#f59e0b",
                      }}
                      title="Manage Trades"
                    >
                      <Activity size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
