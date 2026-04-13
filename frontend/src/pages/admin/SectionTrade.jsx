import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  RefreshCw,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";
import api from "../../services/apiService";
import { fmtUSD, fmtDate, Badge, Skel, PaginationBar } from "./AdminShared";

const SideBadge = ({ side }) => (
  <span
    style={{
      fontSize: "0.7rem",
      fontWeight: 700,
      padding: "2px 7px",
      borderRadius: 5,
      background:
        side === "buy" ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
      color: side === "buy" ? "#34d399" : "#f87171",
      textTransform: "uppercase",
    }}
  >
    {side}
  </span>
);

function useIsMobile(bp = 1100) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < bp);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return isMobile;
}

function AdminOpenTradeModal({
  onClose,
  onSuccess,
  showToast,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  inputBg,
}) {
  const [form, setForm] = useState({
    userId: "",
    symbol: "BTCUSDT",
    side: "buy",
    type: "market",
    quantity: "",
    price: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");
  const [userBalance, setUserBalance] = useState(null);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const userDropdownRef = useRef(null);
  const debounceTimeout = useRef(null);

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

  // Fetch user balance when userId changes
  const fetchUserBalance = async (userId) => {
    if (!userId) {
      setUserBalance(null);
      return;
    }
    setCheckingBalance(true);
    try {
      const res = await api.get(`/admin/users/${userId}/balance`);
      setUserBalance(res.data?.data);
    } catch (err) {
      console.error("Failed to fetch user balance:", err);
    } finally {
      setCheckingBalance(false);
    }
  };

  // Search users with debounce
  const searchUsers = async (searchTerm) => {
    if (searchTerm.length < 2) return;
    setLoadingUsers(true);
    try {
      const res = await api.get(`/admin/users?search=${searchTerm}&limit=10`);
      setUsers(res.data?.data || []);
      setShowUserDropdown(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search users");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoadingUsers(false);
    }
  };

  const selectUser = (user) => {
    setForm({ ...form, userId: user._id });
    setUserSearch(`${user.firstName} ${user.lastName} (${user.email})`);
    setShowUserDropdown(false);
    setError("");
    // Fetch user balance after selecting
    fetchUserBalance(user._id);
  };

  // Clear error when form fields change
  const handleFormChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError("");
  };

  // Calculate total cost preview
  const quantity = parseFloat(form.quantity) || 0;
  const price = parseFloat(form.price) || 0;
  const total = quantity * price;
  const fee = total * 0.001;
  const totalCost = total + fee;

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

  const errorStyle = {
    ...iStyle,
    borderColor: "#f87171",
    boxShadow: "0 0 0 1px rgba(248,113,113,0.2)",
  };

  const submit = async () => {
    // Validate required fields
    if (!form.userId) {
      setError("Please select a user");
      return;
    }
    if (!form.quantity || parseFloat(form.quantity) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      setError("Please enter a valid price");
      return;
    }

    // Check if user has sufficient balance before submitting
    if (form.side === "buy" && userBalance) {
      const required = totalCost;
      const available = userBalance.balances?.available || 0;
      if (available < required) {
        setError(
          `Insufficient funds! Required: $${required.toFixed(2)} USDT, Available: $${available.toFixed(2)} USDT (Total: $${userBalance.balances?.USDT?.toFixed(2) || 0}, Locked: $${userBalance.balances?.locked?.toFixed(2) || 0})`,
        );
        return;
      }
    }

    setSaving(true);
    setError("");
    try {
      await api.post("/admin/trades", {
        ...form,
        quantity: parseFloat(form.quantity),
        price: parseFloat(form.price),
      });
      showToast("Trade opened for user");
      onSuccess();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to open trade";
      setError(errorMsg);
      // Still show in parent toast for visibility
      showToast(errorMsg, "error");
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
          maxHeight: "85vh",
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
            Open Trade for User
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

        {/* ERROR DISPLAY - VISIBLE INSIDE MODAL */}
        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              borderRadius: 10,
              background: "rgba(248,113,113,0.12)",
              border: "1px solid rgba(248,113,113,0.3)",
              color: "#f87171",
              fontSize: "0.8rem",
              fontWeight: 500,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1rem" }}>⚠️</span>
              <span style={{ flex: 1 }}>{error}</span>
              <button
                onClick={() => setError("")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f87171",
                  cursor: "pointer",
                  padding: 2,
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* USER SEARCH FIELD */}
        <div style={{ marginBottom: 10 }} ref={userDropdownRef}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 4,
            }}
          >
            USER *
          </label>
          <div style={{ position: "relative" }}>
            <input
              style={error && !form.userId ? errorStyle : iStyle}
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                if (debounceTimeout.current)
                  clearTimeout(debounceTimeout.current);
                debounceTimeout.current = setTimeout(() => {
                  searchUsers(e.target.value);
                }, 300);
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
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
                      transition: "background 0.15s",
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

        {/* USER BALANCE DISPLAY - SHOWS AFTER SELECTING USER */}
        {userBalance && form.userId && (
          <div
            style={{
              marginBottom: 14,
              padding: "8px 12px",
              borderRadius: 8,
              background: darkMode
                ? "rgba(245,158,11,0.08)"
                : "rgba(245,158,11,0.05)",
              border: `1px solid rgba(245,158,11,0.2)`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.7rem",
                marginBottom: 4,
              }}
            >
              <span style={{ color: muted }}>Available Balance</span>
              <span
                style={{
                  color:
                    userBalance.balances?.available < totalCost &&
                    form.side === "buy"
                      ? "#f87171"
                      : "#f59e0b",
                  fontWeight: 700,
                  fontFamily: "monospace",
                }}
              >
                ${userBalance.balances?.available?.toLocaleString() || 0} USDT
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.65rem",
              }}
            >
              <span style={{ color: muted }}>Total / Locked</span>
              <span style={{ color: muted, fontFamily: "monospace" }}>
                ${userBalance.balances?.USDT?.toLocaleString() || 0} / $
                {userBalance.balances?.locked?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        )}

        {[
          { key: "symbol", label: "SYMBOL", type: "text", ph: "BTCUSDT" },
          { key: "quantity", label: "QUANTITY", type: "number", ph: "0.01" },
          { key: "price", label: "PRICE", type: "number", ph: "87000" },
          { key: "note", label: "NOTE", type: "text", ph: "Admin note…" },
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
              {key === "quantity" || key === "price" ? " *" : ""}
            </label>
            <input
              style={
                error && (key === "quantity" || key === "price") && !form[key]
                  ? errorStyle
                  : iStyle
              }
              type={type}
              placeholder={ph}
              value={form[key]}
              onChange={(e) => handleFormChange(key, e.target.value)}
            />
          </div>
        ))}

        {/* Side and Type Selects */}
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
                textTransform: "uppercase",
              }}
            >
              Side *
            </label>
            <EnhancedSelect
              value={form.side}
              onChange={(e) => handleFormChange("side", e.target.value)}
              options={[
                {
                  value: "buy",
                  label: "Buy - Long",
                  icon: "📈",
                  color: "#34d399",
                },
                {
                  value: "sell",
                  label: "Sell - Short",
                  icon: "📉",
                  color: "#f87171",
                },
              ]}
              darkMode={darkMode}
              textClr={textClr}
              muted={muted}
              border={border}
              inputBg={inputBg}
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
                textTransform: "uppercase",
              }}
            >
              Type *
            </label>
            <EnhancedSelect
              value={form.type}
              onChange={(e) => handleFormChange("type", e.target.value)}
              options={[
                {
                  value: "market",
                  label: "Market",
                  icon: "⚡",
                  color: "#60a5fa",
                },
                {
                  value: "limit",
                  label: "Limit",
                  icon: "📊",
                  color: "#f59e0b",
                },
                { value: "stop", label: "Stop", icon: "🛑", color: "#f87171" },
              ]}
              darkMode={darkMode}
              textClr={textClr}
              muted={muted}
              border={border}
              inputBg={inputBg}
            />
          </div>
        </div>

        {/* Trade Preview Card */}
        {quantity > 0 && price > 0 && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              marginBottom: 14,
              background:
                form.side === "buy"
                  ? "rgba(52,211,153,0.08)"
                  : "rgba(248,113,113,0.08)",
              border: `1px solid ${form.side === "buy" ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)"}`,
            }}
          >
            <div
              style={{
                color: form.side === "buy" ? "#34d399" : "#f87171",
                fontSize: "0.75rem",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {form.side === "buy" ? "▲ Long (Buy)" : "▼ Short (Sell)"} ·{" "}
              {form.type} order
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.7rem",
                marginBottom: 4,
              }}
            >
              <span style={{ color: muted }}>Quantity × Price</span>
              <span style={{ color: textClr, fontFamily: "monospace" }}>
                {quantity} × ${price.toLocaleString()} = $
                {total.toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.7rem",
                marginBottom: 4,
              }}
            >
              <span style={{ color: muted }}>Fee (0.1%)</span>
              <span style={{ color: muted, fontFamily: "monospace" }}>
                ${fee.toFixed(2)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.7rem",
                paddingTop: 4,
                borderTop: `1px solid ${border}`,
                marginTop: 4,
              }}
            >
              <span style={{ color: muted, fontWeight: 600 }}>Total Cost</span>
              <span
                style={{
                  color: form.side === "buy" ? "#34d399" : "#f87171",
                  fontWeight: 700,
                  fontFamily: "monospace",
                }}
              >
                ${totalCost.toFixed(2)} USDT
              </span>
            </div>
            {form.side === "buy" && userBalance && totalCost > 0 && (
              <div
                style={{
                  marginTop: 6,
                  paddingTop: 4,
                  fontSize: "0.65rem",
                  color:
                    userBalance.balances?.available >= totalCost
                      ? "#34d399"
                      : "#f87171",
                }}
              >
                {userBalance.balances?.available >= totalCost ? (
                  "✓ Sufficient balance"
                ) : (
                  <span>
                    ⚠️ Insufficient balance! Need ${totalCost.toFixed(2)}, have
                    ${userBalance.balances?.available?.toFixed(2)}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
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
            onClick={submit}
            disabled={saving}
            style={{
              padding: "11px",
              borderRadius: 9,
              border: "none",
              background:
                form.side === "buy"
                  ? "linear-gradient(135deg,#16a34a,#22c55e)"
                  : "linear-gradient(135deg,#dc2626,#ef4444)",
              color: "#fff",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving
              ? "Opening…"
              : form.side === "buy"
                ? "Open Buy Trade"
                : "Open Sell Trade"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Close Trade Modal
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
  const [closePrice, setClosePrice] = useState("");
  const [note, setNote] = useState("");
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState("");

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
    const price = parseFloat(closePrice);
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid close price");
      return;
    }
    setClosing(true);
    setError("");
    try {
      await onConfirm(trade._id, price, note);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to close trade");
    } finally {
      setClosing(false);
    }
  };

  return (
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
          borderRadius: 20,
          width: "100%",
          maxWidth: 400,
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
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              background: darkMode
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.03)",
              borderRadius: 10,
              padding: "12px",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span style={{ color: textClr, fontWeight: 600 }}>
                {trade.symbol}
              </span>
              <SideBadge side={trade.side} />
              <span style={{ color: muted }}>
                Entry: ${trade.filledPrice?.toLocaleString()}
              </span>
              <span style={{ color: muted }}>Qty: {trade.quantity}</span>
            </div>
          </div>

          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 4,
            }}
          >
            Close Price (USDT) *
          </label>
          <input
            type="number"
            step="0.01"
            style={iStyle}
            value={closePrice}
            onChange={(e) => setClosePrice(e.target.value)}
            placeholder={`e.g. ${(trade.filledPrice * 1.05).toFixed(2)}`}
            autoFocus
          />

          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 4,
              marginTop: 12,
            }}
          >
            Admin Note (optional)
          </label>
          <textarea
            rows={2}
            style={{ ...iStyle, resize: "vertical" }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about this close..."
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
            disabled={closing}
            style={{
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: "#f87171",
              color: "#fff",
              fontWeight: 600,
              cursor: closing ? "not-allowed" : "pointer",
              opacity: closing ? 0.7 : 1,
            }}
          >
            {closing ? "Closing..." : "Confirm Close"}
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
    <div ref={selectRef} style={{ position: "relative", width: "100%" }}>
      {/* Custom Select Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "9px 11px",
          borderRadius: 10,
          border: `1px solid ${isOpen ? "#f59e0b" : border}`,
          background: inputBg,
          color: textClr,
          fontSize: "0.85rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
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
                  padding: "10px 12px",
                  cursor: "pointer",
                  color: isSelected ? "#f59e0b" : textClr,
                  backgroundColor: isSelected
                    ? darkMode
                      ? "rgba(245,158,11,0.1)"
                      : "rgba(245,158,11,0.05)"
                    : "transparent",
                  fontSize: "0.85rem",
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
                    style={{ width: 14, height: 14, color: "#f59e0b" }}
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

export default function SectionTrade({
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  divLine,
  inputBg,
  showToast,
}) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("filled");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [acting, setActing] = useState(null);
  const [showOpen, setShowOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [closingTrade, setClosingTrade] = useState(null);

  const isMobile = useIsMobile(1100);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filter !== "all") params.set("status", filter);
      const res = await api.get(`/admin/trades?${params}`);
      setTrades(res.data?.data || []);
      setPages(res.data?.pagination?.pages || 1);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const closeTrade = async (id, closePrice, note) => {
    setActing(id);
    try {
      await api.post(`/admin/trades/${id}/close`, { closePrice, note });
      showToast("Trade closed");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
      throw err;
    } finally {
      setActing(null);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {["filled", "pending", "closed", "all"].map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: `1px solid ${filter === f ? "#a78bfa" : border}`,
              background:
                filter === f ? "rgba(167,139,250,0.1)" : "transparent",
              color: filter === f ? "#a78bfa" : muted,
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.15s",
            }}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
        <button
          onClick={() => setShowOpen(true)}
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
          }}
        >
          <Plus style={{ width: 12, height: 12 }} /> Open Trade
        </button>
      </div>

      {showOpen && (
        <AdminOpenTradeModal
          onClose={() => setShowOpen(false)}
          onSuccess={() => {
            setShowOpen(false);
            load();
          }}
          showToast={showToast}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
        />
      )}

      {closingTrade && (
        <CloseTradeModal
          trade={closingTrade}
          onClose={() => setClosingTrade(null)}
          onConfirm={closeTrade}
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
          trades.length === 0 ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: muted,
                fontSize: "0.85rem",
              }}
            >
              No trades found.
            </div>
          ) : (
            trades.map((t, i) => {
              const open = expanded === t._id;
              const pnlColor =
                t.pnl > 0 ? "#34d399" : t.pnl < 0 ? "#f87171" : muted;
              return (
                <div
                  key={t._id}
                  style={{
                    borderBottom:
                      i < trades.length - 1 ? `1px solid ${divLine}` : "none",
                  }}
                >
                  <div
                    onClick={() => setExpanded(open ? null : t._id)}
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
                        {t.user?.firstName} {t.user?.lastName}
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
                            color: textClr,
                            fontFamily: "monospace",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                          }}
                        >
                          {t.symbol}
                        </span>
                        <SideBadge side={t.side} />
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
                      {t.pnl != null && t.pnl !== 0 && (
                        <span
                          style={{
                            color: pnlColor,
                            fontFamily: "monospace",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                          }}
                        >
                          {t.pnl > 0 ? "+" : ""}
                          {fmtUSD(t.pnl)}
                        </span>
                      )}
                      <Badge status={t.status} />
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
                      {[
                        {
                          label: "Entry Price",
                          value: (
                            <span
                              style={{
                                color: textClr,
                                fontFamily: "monospace",
                                fontSize: "0.8rem",
                              }}
                            >
                              {fmtUSD(t.filledPrice || t.price)}
                            </span>
                          ),
                        },
                        {
                          label: "Quantity",
                          value: (
                            <span
                              style={{
                                color: muted,
                                fontFamily: "monospace",
                                fontSize: "0.8rem",
                              }}
                            >
                              {t.quantity}
                            </span>
                          ),
                        },
                        {
                          label: "Type",
                          value: (
                            <span
                              style={{
                                color: muted,
                                fontSize: "0.78rem",
                                textTransform: "capitalize",
                              }}
                            >
                              {t.type}
                            </span>
                          ),
                        },
                        {
                          label: "Email",
                          value: (
                            <span
                              style={{
                                color: muted,
                                fontSize: "0.72rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {t.user?.email}
                            </span>
                          ),
                        },
                      ].map((row) => (
                        <div
                          key={row.label}
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
                              flexShrink: 0,
                            }}
                          >
                            {row.label}
                          </span>
                          {row.value}
                        </div>
                      ))}
                      {t.status === "filled" && (
                        <div
                          style={{
                            borderTop: `1px solid ${divLine}`,
                            paddingTop: 10,
                          }}
                        >
                          <button
                            className="action-btn"
                            onClick={() => setClosingTrade(t)}
                            disabled={acting === t._id}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 6,
                              border: "1px solid rgba(248,113,113,0.35)",
                              background: "rgba(248,113,113,0.08)",
                              color: "#f87171",
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {acting === t._id ? "…" : "Close"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          <div className="thin-scroll" style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 900 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "180px 110px 70px 70px 110px 110px 100px 100px 100px",
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
                <div>Symbol</div>
                <div>Side</div>
                <div>Type</div>
                <div>Entry</div>
                <div>Qty</div>
                <div>P&L</div>
                <div>Status</div>
                <div style={{ textAlign: "right" }}>Actions</div>
              </div>
              {trades.length === 0 ? (
                <div
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    color: muted,
                    fontSize: "0.85rem",
                  }}
                >
                  No trades found.
                </div>
              ) : (
                trades.map((t, i) => (
                  <div
                    key={t._id}
                    className="adm-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "180px 110px 70px 70px 110px 110px 100px 100px 100px",
                      gap: 8,
                      padding: "12px 18px",
                      borderBottom:
                        i < trades.length - 1 ? `1px solid ${divLine}` : "none",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: textClr,
                          fontWeight: 600,
                          fontSize: "0.8rem",
                        }}
                      >
                        {t.user?.firstName} {t.user?.lastName}
                      </div>
                      <div
                        style={{
                          color: muted,
                          fontSize: "0.68rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 170,
                        }}
                      >
                        {t.user?.email}
                      </div>
                    </div>
                    <div
                      style={{
                        color: textClr,
                        fontFamily: "monospace",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                      }}
                    >
                      {t.symbol}
                    </div>
                    <div>
                      <SideBadge side={t.side} />
                    </div>
                    <div
                      style={{
                        color: muted,
                        fontSize: "0.75rem",
                        textTransform: "capitalize",
                      }}
                    >
                      {t.type}
                    </div>
                    <div
                      style={{
                        color: textClr,
                        fontFamily: "monospace",
                        fontSize: "0.82rem",
                      }}
                    >
                      {fmtUSD(t.filledPrice || t.price)}
                    </div>
                    <div
                      style={{
                        color: muted,
                        fontFamily: "monospace",
                        fontSize: "0.78rem",
                      }}
                    >
                      {t.quantity}
                    </div>
                    <div
                      style={{
                        color:
                          t.pnl > 0 ? "#34d399" : t.pnl < 0 ? "#f87171" : muted,
                        fontFamily: "monospace",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      {t.pnl != null && t.pnl !== 0
                        ? `${t.pnl > 0 ? "+" : ""}${fmtUSD(t.pnl)}`
                        : "—"}
                    </div>
                    <div>
                      <Badge status={t.status} />
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {t.status === "filled" && (
                        <button
                          className="action-btn"
                          onClick={() => closeTrade(t._id)}
                          disabled={acting === t._id}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: "1px solid rgba(248,113,113,0.35)",
                            background: "rgba(248,113,113,0.08)",
                            color: "#f87171",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {acting === t._id ? "…" : "Close"}
                        </button>
                      )}
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
