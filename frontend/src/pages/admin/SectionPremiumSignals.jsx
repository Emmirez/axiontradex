// frontend/src/pages/admin/SectionPremiumSignals.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Star,
  TrendingUp,
  Bitcoin,
  DollarSign,
  X,
  ChevronDown,
  Loader,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import api from "../../services/apiService";
import { fmtDate, Badge, Skel, PaginationBar } from "./AdminShared";

// Custom Select Component
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

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={selectRef} style={{ position: "relative", minWidth: 130 }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "8px 12px",
          borderRadius: 12,
          border: `1px solid ${border}`,
          background: darkMode ? "#1e293b" : "#ffffff",
          color: textClr,
          fontSize: "0.8rem",
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
            borderRadius: 12,
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
                fontSize: "0.8rem",
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
}

// Create/Edit Signal Modal
function SignalModal({
  signal,
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
    title: signal?.title || "",
    description: signal?.description || "",
    market: signal?.market || "crypto",
    symbol: signal?.symbol || "",
    signalType: signal?.signalType || "buy",
    entryPrice: signal?.entryPrice || 0,
    targetPrice: signal?.targetPrice || 0,
    stopLoss: signal?.stopLoss || 0,
    riskLevel: signal?.riskLevel || "Medium",
    confidence: signal?.confidence || 70,
    expiryDate: signal?.expiryDate
      ? new Date(signal.expiryDate).toISOString().slice(0, 16)
      : "",
    isPremium: signal?.isPremium !== undefined ? signal.isPremium : true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const marketOptions = [
    { value: "stocks", label: "Stock Market" },
    { value: "crypto", label: "Cryptocurrency" },
    { value: "forex", label: "Forex" },
    { value: "commodities", label: "Commodities" },
  ];

  const signalTypeOptions = [
    { value: "buy", label: "Buy" },
    { value: "sell", label: "Sell" },
    { value: "hold", label: "Hold" },
  ];

  const riskOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
  ];

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
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.symbol.trim()) {
      setError("Symbol is required");
      return;
    }
    if (form.entryPrice <= 0) {
      setError("Entry price must be greater than 0");
      return;
    }
    if (form.targetPrice <= 0) {
      setError("Target price must be greater than 0");
      return;
    }
    if (form.stopLoss <= 0) {
      setError("Stop loss must be greater than 0");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        expiryDate:
          form.expiryDate ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      if (signal) {
        await api.patch(`/signals/admin/${signal._id}`, payload);
        showToast("Signal updated successfully", "success");
      } else {
        await api.post("/signals/admin/signal", payload);
        showToast("Signal created successfully", "success");
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save signal");
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
          scrollbarWidth: "thin",
        }}
      >
        <style>{`
          div::-webkit-scrollbar { width: 4px; }
          div::-webkit-scrollbar-track { background: ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}; border-radius: 4px; }
          div::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.3); border-radius: 4px; }
        `}</style>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ color: textClr, fontSize: "1.2rem", fontWeight: 700 }}>
            {signal ? "Edit Signal" : "Create Signal"}
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
            Title *
          </label>
          <input
            style={iStyle}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g., Bitcoin Breakout Signal"
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
            Description
          </label>
          <textarea
            rows={2}
            style={iStyle}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the trade setup..."
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
              Market *
            </label>
            <CustomSelect
              value={form.market}
              onChange={(val) => setForm({ ...form, market: val })}
              options={marketOptions}
              darkMode={darkMode}
              border={border}
              textClr={textClr}
              muted={muted}
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
              Symbol *
            </label>
            <input
              style={iStyle}
              value={form.symbol}
              onChange={(e) =>
                setForm({ ...form, symbol: e.target.value.toUpperCase() })
              }
              placeholder="BTC/USD, AAPL, etc."
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
            <label
              style={{
                color: muted,
                fontSize: "0.7rem",
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              Signal Type *
            </label>
            <CustomSelect
              value={form.signalType}
              onChange={(val) => setForm({ ...form, signalType: val })}
              options={signalTypeOptions}
              darkMode={darkMode}
              border={border}
              textClr={textClr}
              muted={muted}
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
              Risk Level *
            </label>
            <CustomSelect
              value={form.riskLevel}
              onChange={(val) => setForm({ ...form, riskLevel: val })}
              options={riskOptions}
              darkMode={darkMode}
              border={border}
              textClr={textClr}
              muted={muted}
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
            <label
              style={{
                color: muted,
                fontSize: "0.7rem",
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              Entry Price *
            </label>
            <input
              type="number"
              step="0.01"
              style={iStyle}
              value={form.entryPrice}
              onChange={(e) =>
                setForm({
                  ...form,
                  entryPrice: parseFloat(e.target.value) || 0,
                })
              }
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
              Target Price *
            </label>
            <input
              type="number"
              step="0.01"
              style={iStyle}
              value={form.targetPrice}
              onChange={(e) =>
                setForm({
                  ...form,
                  targetPrice: parseFloat(e.target.value) || 0,
                })
              }
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
            <label
              style={{
                color: muted,
                fontSize: "0.7rem",
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              Stop Loss *
            </label>
            <input
              type="number"
              step="0.01"
              style={iStyle}
              value={form.stopLoss}
              onChange={(e) =>
                setForm({ ...form, stopLoss: parseFloat(e.target.value) || 0 })
              }
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
              Confidence (%)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              style={iStyle}
              value={form.confidence}
              onChange={(e) =>
                setForm({ ...form, confidence: parseInt(e.target.value) || 0 })
              }
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
            Expiry Date
          </label>
          <input
            type="datetime-local"
            style={iStyle}
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={form.isPremium}
              onChange={(e) =>
                setForm({ ...form, isPremium: e.target.checked })
              }
            />
            <span style={{ color: textClr, fontSize: "0.8rem" }}>
              Premium Signal (requires subscription)
            </span>
          </label>
        </div>

        {error && (
          <div
            style={{ color: "#f87171", fontSize: "0.75rem", marginBottom: 12 }}
          >
            {error}
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
            {saving ? "Saving..." : signal ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteModal({
  onClose,
  onConfirm,
  signalTitle,
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
          Delete Signal
        </h3>
        <p style={{ color: muted, marginBottom: 24 }}>
          Are you sure you want to delete "{signalTitle}"? This action cannot be
          undone.
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

// Main Component
export default function SectionPremiumSignals({
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  divLine,
  inputBg,
  showToast,
}) {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filterMarket, setFilterMarket] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [activeStatusDropdown, setActiveStatusDropdown] = useState(null);

  const marketOptions = [
    { value: "", label: "All Markets" },
    { value: "stocks", label: "Stock Market" },
    { value: "crypto", label: "Cryptocurrency" },
    { value: "forex", label: "Forex" },
    { value: "commodities", label: "Commodities" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
    { value: "hit", label: "Target Hit" },
    { value: "stopped", label: "Stop Loss Hit" },
  ];

  const loadSignals = async () => {
    setLoading(true);
    try {
      const res = await api.get("/signals/admin/all");
      let signalsList = res.data?.data?.signals || [];
      if (filterMarket) {
        signalsList = signalsList.filter((s) => s.market === filterMarket);
      }
      if (filterStatus) {
        signalsList = signalsList.filter((s) => s.status === filterStatus);
      }
      setSignals(signalsList);
    } catch (err) {
      console.error("Failed to load signals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();
  }, [filterMarket, filterStatus]);

  const updateStatus = async (id, status, performance = null) => {
    try {
      await api.patch(`/signals/admin/${id}`, { status, performance });
      showToast(`Signal marked as ${status}`, "success");
      loadSignals();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update status",
        "error",
      );
    }
  };

 
const deleteSignal = async () => {
  try {
    await api.delete(`/signals/admin/${deleting._id}`);
    setDeleting(null);        // close modal FIRST
    loadSignals();
    showToast("Signal deleted", "success");  // toast shows after modal gone
  } catch (err) {
    setDeleting(null);        // also close on error
    showToast(err.response?.data?.message || "Failed to delete", "error");
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return {
          bg: "rgba(52,211,153,0.12)",
          color: "#34d399",
          label: "Active",
        };
      case "expired":
        return {
          bg: "rgba(100,116,139,0.12)",
          color: "#94a3b8",
          label: "Expired",
        };
      case "hit":
        return {
          bg: "rgba(52,211,153,0.12)",
          color: "#34d399",
          label: "Target Hit",
        };
      case "stopped":
        return {
          bg: "rgba(248,113,113,0.12)",
          color: "#f87171",
          label: "Stop Loss",
        };
      default:
        return {
          bg: "rgba(100,116,139,0.12)",
          color: "#94a3b8",
          label: status,
        };
    }
  };

  const getSignalTypeColor = (type) => {
    if (type === "buy")
      return { bg: "rgba(52,211,153,0.12)", color: "#34d399" };
    if (type === "sell")
      return { bg: "rgba(248,113,113,0.12)", color: "#f87171" };
    return { bg: "rgba(96,165,250,0.12)", color: "#60a5fa" };
  };

  return (
    <div>
      {showModal && (
        <SignalModal
          signal={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={loadSignals}
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
          onConfirm={deleteSignal}
          signalTitle={deleting.title}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
        />
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ color: textClr, fontSize: "1.2rem", fontWeight: 700 }}>
            Premium Signals
          </h2>
          <p style={{ color: muted, fontSize: "0.75rem", marginTop: 2 }}>
            Create and manage trading signals for subscribers
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
            flex: "1 1 auto",
            justifyContent: "flex-end",
          }}
        >
          <CustomSelect
            value={filterMarket}
            onChange={setFilterMarket}
            options={marketOptions}
            darkMode={darkMode}
            border={border}
            textClr={textClr}
            muted={muted}
            placeholder="All Markets"
          />
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
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={14} /> Create Signal
          </button>
        </div>
      </div>

      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        <div className="thin-scroll" style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 900 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "80px 150px 100px 100px 100px 100px 100px 80px 120px",
                gap: 12,
                padding: "12px 18px",
                color: muted,
                fontSize: "0.65rem",
                fontWeight: 700,
                borderBottom: `1px solid ${divLine}`,
              }}
            >
              <div>Type</div>
              <div>Title</div>
              <div>Market</div>
              <div>Symbol</div>
              <div>Entry</div>
              <div>Target</div>
              <div>Stop</div>
              <div>Risk</div>
              <div>Status</div>
              <div>Actions</div>
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
            ) : signals.length === 0 ? (
              <div
                style={{ padding: "60px", textAlign: "center", color: muted }}
              >
                <Star
                  size={48}
                  color={muted}
                  style={{ marginBottom: 16, opacity: 0.5 }}
                />
                <div>No signals found</div>
                <div style={{ fontSize: "0.75rem", marginTop: 4 }}>
                  Click "Create Signal" to add your first trading signal
                </div>
              </div>
            ) : (
              signals.map((signal) => {
                const signalTypeColor = getSignalTypeColor(signal.signalType);
                const statusColor = getStatusColor(signal.status);
                const riskColor =
                  signal.riskLevel === "Low"
                    ? "#34d399"
                    : signal.riskLevel === "Medium"
                      ? "#f59e0b"
                      : "#f87171";
                return (
                  <div
                    key={signal._id}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "80px 150px 100px 100px 100px 100px 100px 80px 120px",
                      gap: 12,
                      padding: "12px 18px",
                      borderBottom: `1px solid ${divLine}`,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          padding: "2px 10px",
                          borderRadius: 20,
                          background: signalTypeColor.bg,
                          color: signalTypeColor.color,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        {signal.signalType}
                      </span>
                    </div>
                    <div>
                      <div style={{ color: textClr, fontWeight: 600 }}>
                        {signal.title}
                      </div>
                      <div style={{ color: muted, fontSize: "0.65rem" }}>
                        {signal.description?.slice(0, 30)}
                      </div>
                    </div>
                    <div
                      style={{
                        color: muted,
                        fontSize: "0.7rem",
                        textTransform: "capitalize",
                      }}
                    >
                      {signal.market}
                    </div>
                    <div style={{ color: textClr, fontWeight: 600 }}>
                      {signal.symbol}
                    </div>
                    <div style={{ color: "#34d399", fontWeight: 600 }}>
                      ${signal.entryPrice}
                    </div>
                    <div style={{ color: "#f59e0b", fontWeight: 600 }}>
                      ${signal.targetPrice}
                    </div>
                    <div style={{ color: "#f87171", fontWeight: 600 }}>
                      ${signal.stopLoss}
                    </div>
                    {/* Status Select - Enhanced Dropdown */}
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={() => {
                          // Close other dropdowns, toggle this one
                          setActiveStatusDropdown(
                            activeStatusDropdown === signal._id
                              ? null
                              : signal._id,
                          );
                        }}
                        style={{
                          padding: "4px 12px",
                          borderRadius: 8,
                          border: `1px solid ${statusColor.color}40`,
                          background: statusColor.bg,
                          color: statusColor.color,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {statusColor.label}
                        <ChevronDown
                          style={{
                            width: 12,
                            height: 12,
                            transition: "transform 0.2s",
                            transform:
                              activeStatusDropdown === signal._id
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                          }}
                        />
                      </button>

                      {activeStatusDropdown === signal._id && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            marginTop: 4,
                            background: darkMode ? "#1e293b" : "#ffffff",
                            border: `1px solid ${border}`,
                            borderRadius: 10,
                            overflow: "hidden",
                            zIndex: 50,
                            minWidth: 130,
                            boxShadow: darkMode
                              ? "0 4px 12px rgba(0,0,0,0.3)"
                              : "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        >
                          {[
                            {
                              value: "active",
                              label: "Active",
                              icon: "🟢",
                              color: "#34d399",
                            },
                            {
                              value: "expired",
                              label: "Expired",
                              icon: "⏰",
                              color: "#94a3b8",
                            },
                            {
                              value: "hit",
                              label: "Target Hit",
                              icon: "🎯",
                              color: "#34d399",
                            },
                            {
                              value: "stopped",
                              label: "Stop Loss",
                              icon: "🛑",
                              color: "#f87171",
                            },
                          ].map((opt) => (
                            <div
                              key={opt.value}
                              onClick={() => {
                                updateStatus(signal._id, opt.value);
                                setActiveStatusDropdown(null);
                              }}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                backgroundColor:
                                  signal.status === opt.value
                                    ? darkMode
                                      ? "rgba(245,158,11,0.15)"
                                      : "rgba(245,158,11,0.08)"
                                    : "transparent",
                                color: textClr,
                                fontSize: "0.75rem",
                                transition: "background 0.15s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = darkMode
                                  ? "rgba(255,255,255,0.05)"
                                  : "rgba(0,0,0,0.03)";
                              }}
                              onMouseLeave={(e) => {
                                if (signal.status !== opt.value) {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                }
                              }}
                            >
                              <span style={{ fontSize: "0.8rem" }}>
                                {opt.icon}
                              </span>
                              <span
                                style={{ color: opt.color, fontWeight: 500 }}
                              >
                                {opt.label}
                              </span>
                              {signal.status === opt.value && (
                                <CheckCircle
                                  style={{
                                    width: 12,
                                    height: 12,
                                    color: "#f59e0b",
                                    marginLeft: "auto",
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => {
                          setEditing(signal);
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
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => setDeleting(signal)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          border: `1px solid ${border}`,
                          background: "transparent",
                          cursor: "pointer",
                          color: "#f87171",
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
