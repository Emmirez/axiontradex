// frontend/src/pages/admin/SectionAIBots.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Play,
  Square,
  Bot,
  Grid,
  ArrowDownUp,
  LineChart,
  Zap,
  Shield,
  AlertTriangle,
  Activity,
  ChevronDown,
} from "lucide-react";
import api from "../../services/apiService";
import { Skel } from "./AdminShared";

const STRATEGY_OPTIONS = [
  { value: "grid", label: "Grid", icon: Grid, color: "#60a5fa" },
  { value: "dca", label: "DCA", icon: ArrowDownUp, color: "#34d399" },
  {
    value: "trend_follow",
    label: "Trend Follow",
    icon: LineChart,
    color: "#a78bfa",
  },
  { value: "scalping", label: "Scalping", icon: Zap, color: "#f59e0b" },
];
const RISK_OPTIONS = ["Low", "Medium", "High"];
const SYMBOLS = [
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

// Custom Select Component
// Custom Select Component
function CustomSelect({
  value,
  onChange,
  options,
  style,
  placeholder,
  darkMode,
  border,
  inputBg,
  textClr,
  muted,
  cardBg,
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
    <div ref={selectRef} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "9px 11px",
          borderRadius: 12,
          border: `1px solid ${border}`,
          background: inputBg,
          color: textClr,
          fontSize: "0.85rem",
          outline: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          ...style,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {selectedOption?.icon && (
            <selectedOption.icon size={14} color={selectedOption.color} />
          )}
          {selectedOption?.label || placeholder || "Select..."}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: muted,
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 12,
            overflow: "hidden",
            zIndex: 100,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                width: "100%",
                padding: "9px 11px",
                border: "none",
                background:
                  value === opt.value ? "rgba(245,158,11,0.1)" : "transparent",
                color: value === opt.value ? "#f59e0b" : textClr,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = darkMode
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.03)";
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {opt.icon && (
                <opt.icon
                  size={14}
                  color={opt.color || (value === opt.value ? "#f59e0b" : muted)}
                />
              )}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

//  Bot Create/Edit Modal
function BotModal({
  bot,
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
    name: bot?.name || "",
    description: bot?.description || "",
    strategy: bot?.strategy || "grid",
    riskLevel: bot?.riskLevel || "Medium",
    minDeposit: bot?.minDeposit || 100,
    monthlyFee: bot?.monthlyFee || 0,
    isActive: bot?.isActive !== undefined ? bot.isActive : true,
    features: bot?.features || [],
    stats: {
      winRate: bot?.stats?.winRate || 0,
      totalReturn: bot?.stats?.totalReturn || 0,
      monthlyProfit: bot?.stats?.monthlyProfit || 0,
      totalTrades: bot?.stats?.totalTrades || 0,
      winningTrades: bot?.stats?.winningTrades || 0,
    },
  });
  const [featureInput, setFeatureInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (bot) {
        await api.patch(`/bots/admin/bots/${bot._id}`, form);
        showToast("Bot updated", "success");
      } else {
        await api.post("/bots/admin/bots", form);
        showToast("Bot created", "success");
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
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
          borderRadius: 24,
          width: "100%",
          maxWidth: 560,
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
            marginBottom: 20,
          }}
        >
          <h2 style={{ color: textClr, fontSize: "1.1rem", fontWeight: 700 }}>
            {bot ? "Edit Bot" : "Create AI Bot"}
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div style={{ gridColumn: "1/-1" }}>
            <label
              style={{
                color: muted,
                fontSize: "0.7rem",
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              Bot Name *
            </label>
            <input
              style={iStyle}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. BTC Grid Master"
            />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
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
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe the bot strategy..."
            />
          </div>
        </div>

        {/* Strategy selector */}
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 6,
            }}
          >
            Strategy
          </label>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            {STRATEGY_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setForm({ ...form, strategy: s.value })}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  cursor: "pointer",
                  border: `1px solid ${form.strategy === s.value ? s.color : border}`,
                  background:
                    form.strategy === s.value ? `${s.color}15` : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <s.icon
                  size={14}
                  color={form.strategy === s.value ? s.color : muted}
                />
                <span
                  style={{
                    color: form.strategy === s.value ? s.color : muted,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Risk level */}
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 6,
            }}
          >
            Risk Level
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {RISK_OPTIONS.map((r) => {
              const colors = {
                Low: "#34d399",
                Medium: "#f59e0b",
                High: "#f87171",
              };
              const c = colors[r];
              return (
                <button
                  key={r}
                  onClick={() => setForm({ ...form, riskLevel: r })}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: 10,
                    cursor: "pointer",
                    border: `1px solid ${form.riskLevel === r ? c : border}`,
                    background: form.riskLevel === r ? `${c}15` : "transparent",
                    color: form.riskLevel === r ? c : muted,
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
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
              Min Deposit (USDT)
            </label>
            <input
              type="number"
              style={iStyle}
              value={form.minDeposit}
              onChange={(e) =>
                setForm({
                  ...form,
                  minDeposit: parseFloat(e.target.value) || 0,
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
              Monthly Fee (USDT)
            </label>
            <input
              type="number"
              style={iStyle}
              value={form.monthlyFee}
              onChange={(e) =>
                setForm({
                  ...form,
                  monthlyFee: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 6,
            }}
          >
            Performance Stats
          </label>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            {[
              { key: "winRate", label: "Win Rate (%)" },
              { key: "totalReturn", label: "Total Return (%)" },
              { key: "monthlyProfit", label: "Monthly Profit ($)" },
              { key: "totalTrades", label: "Total Trades" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label
                  style={{
                    color: muted,
                    fontSize: "0.65rem",
                    display: "block",
                    marginBottom: 3,
                  }}
                >
                  {label}
                </label>
                <input
                  type="number"
                  style={iStyle}
                  value={form.stats[key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stats: {
                        ...form.stats,
                        [key]: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 600,
              display: "block",
              marginBottom: 6,
            }}
          >
            Features
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              style={{ flex: 1, ...iStyle }}
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder="e.g. 24/7 Trading"
              onKeyDown={(e) => {
                if (e.key === "Enter" && featureInput.trim()) {
                  setForm({
                    ...form,
                    features: [...form.features, featureInput.trim()],
                  });
                  setFeatureInput("");
                }
              }}
            />
            <button
              onClick={() => {
                if (featureInput.trim()) {
                  setForm({
                    ...form,
                    features: [...form.features, featureInput.trim()],
                  });
                  setFeatureInput("");
                }
              }}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: "transparent",
                cursor: "pointer",
                color: muted,
              }}
            >
              Add
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {form.features.map((f, i) => (
              <span
                key={i}
                style={{
                  padding: "3px 8px",
                  borderRadius: 20,
                  background: "rgba(244,114,182,0.1)",
                  color: "#f472b6",
                  fontSize: "0.7rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {f}
                <button
                  onClick={() =>
                    setForm({
                      ...form,
                      features: form.features.filter((_, fi) => fi !== i),
                    })
                  }
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#f472b6",
                    padding: 0,
                  }}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          <span style={{ color: textClr, fontSize: "0.8rem" }}>
            Active (visible to users)
          </span>
        </label>

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
              background: "linear-gradient(135deg,#f472b6,#a78bfa)",
              color: "#fff",
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : bot ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Manage Trades Modal
function BotTradeModal({
  bot,
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
  const [closingTrade, setClosingTrade] = useState(null);
  const [closingTradeId, setClosingTradeId] = useState(null);
  const [exitPrice, setExitPrice] = useState("");

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

  useEffect(() => {
    api
      .get(`/bots/admin/bots/${bot._id}/trades`)
      .then((r) => setTrades(r.data?.data?.trades || []))
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = async () => {
    if (!form.entryPrice) {
      showToast("Entry price required", "error");
      return;
    }
    setOpening(true);
    try {
      const res = await api.post("/bots/admin/trade/open", {
        botId: bot._id,
        symbol: form.symbol,
        side: form.side,
        entryPrice: parseFloat(form.entryPrice),
        quantity: parseFloat(form.quantity),
        note: form.note,
      });
      showToast(
        `Trade opened — mirrored to ${res.data?.data?.mirroredTo} subscribers`,
        "success",
      );
      setForm({
        symbol: "BTCUSDT",
        side: "buy",
        entryPrice: "",
        quantity: "1",
        note: "",
      });
      const r = await api.get(`/bots/admin/bots/${bot._id}/trades`);
      setTrades(r.data?.data?.trades || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setOpening(false);
    }
  };

  const handleCloseRequest = (tradeId) => {
    setClosingTrade(tradeId);
    setExitPrice("");
    setClosingTradeId(null);
  };

  const handleCloseTrade = async () => {
    if (!exitPrice || isNaN(parseFloat(exitPrice))) {
      showToast("Please enter a valid exit price", "error");
      return;
    }

    setClosingTradeId(closingTrade); // Set loading state for this trade
    try {
      const res = await api.post(`/bots/admin/trade/${closingTrade}/close`, {
        exitPrice: parseFloat(exitPrice),
      });
      showToast(
        `Closed — ${res.data?.data?.profitPercent}% P&L, settled ${res.data?.data?.settled}`,
        "success",
      );
      const r = await api.get(`/bots/admin/bots/${bot._id}/trades`);
      setTrades(r.data?.data?.trades || []);
      setClosingTrade(null);
      setExitPrice("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setClosingTradeId(null);
    }
  };

  const strategy =
    STRATEGY_OPTIONS.find((s) => s.value === bot.strategy) ||
    STRATEGY_OPTIONS[0];

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
          borderRadius: 24,
          width: "100%",
          maxWidth: 620,
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
            marginBottom: 20,
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
              Manage Trades — {bot.name}
            </h2>
            <p style={{ color: muted, fontSize: "0.72rem", margin: "4px 0 0" }}>
              {bot.stats?.totalSubscribers || 0} active subscribers will be
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

        {/* Open trade form */}
        <div
          style={{
            background: darkMode
              ? "rgba(244,114,182,0.05)"
              : "rgba(244,114,182,0.02)",
            border: "1px solid rgba(244,114,182,0.2)",
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
              <CustomSelect
                value={form.symbol}
                onChange={(val) => setForm({ ...form, symbol: val })}
                options={SYMBOLS.map((s) => ({ value: s, label: s }))}
                darkMode={darkMode}
                border={border}
                inputBg={inputBg}
                textClr={textClr}
                muted={muted}
                cardBg={cardBg}
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
                Side
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setForm({ ...form, side: "buy" })}
                  style={{
                    flex: 1,
                    padding: "9px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    background:
                      form.side === "buy" ? "rgba(52,211,153,0.15)" : inputBg,
                    color: form.side === "buy" ? "#34d399" : muted,
                  }}
                >
                  BUY
                </button>
                <button
                  onClick={() => setForm({ ...form, side: "sell" })}
                  style={{
                    flex: 1,
                    padding: "9px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    background:
                      form.side === "sell" ? "rgba(248,113,113,0.15)" : inputBg,
                    color: form.side === "sell" ? "#f87171" : muted,
                  }}
                >
                  SELL
                </button>
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
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
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
              placeholder="Trade rationale..."
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
              background: "linear-gradient(135deg,#f472b6,#a78bfa)",
              color: "#fff",
              fontWeight: 700,
              cursor: opening ? "not-allowed" : "pointer",
              opacity: opening ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Play size={14} />
            {opening
              ? "Opening & Mirroring..."
              : "Open Trade & Mirror to Subscribers"}
          </button>
        </div>

        {/* Trade history */}
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
            Loading...
          </div>
        ) : trades.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 30,
              color: muted,
              background: darkMode
                ? "rgba(255,255,255,0.02)"
                : "rgba(0,0,0,0.02)",
              borderRadius: 12,
            }}
          >
            No trades yet
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {trades.map((trade) => (
              <div
                key={trade._id}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: `1px solid ${trade.status === "open" ? "rgba(244,114,182,0.3)" : border}`,
                  background:
                    trade.status === "open"
                      ? darkMode
                        ? "rgba(244,114,182,0.05)"
                        : "rgba(244,114,182,0.02)"
                      : "transparent",
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
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ fontWeight: 700, color: textClr }}>
                      {trade.symbol}
                    </span>
                    <span
                      style={{
                        padding: "2px 7px",
                        borderRadius: 6,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        background:
                          trade.side === "buy"
                            ? "rgba(52,211,153,0.12)"
                            : "rgba(248,113,113,0.12)",
                        color: trade.side === "buy" ? "#34d399" : "#f87171",
                      }}
                    >
                      {trade.side?.toUpperCase()}
                    </span>
                    <span
                      style={{
                        padding: "2px 7px",
                        borderRadius: 6,
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        background:
                          trade.status === "open"
                            ? "rgba(244,114,182,0.12)"
                            : "rgba(100,116,139,0.12)",
                        color: trade.status === "open" ? "#f472b6" : "#94a3b8",
                      }}
                    >
                      {trade.status?.toUpperCase()}
                    </span>
                  </div>
                  {trade.status === "open" && (
                    //  Update button click handler
                    <button
                      onClick={() => handleCloseRequest(trade._id)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: "rgba(248,113,113,0.12)",
                        color: "#f87171",
                        fontWeight: 600,
                        fontSize: "0.72rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Square size={10} /> Close
                    </button>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    fontSize: "0.72rem",
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
                  {trade.note && <span>Note: {trade.note}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exit Price Modal */}
      {closingTrade && (
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
            onClick={() => setClosingTrade(null)}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 24,
              width: "100%",
              maxWidth: 400,
              padding: 24,
            }}
          >
            <h3
              style={{
                color: textClr,
                fontSize: "1rem",
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              Close Trade
            </h3>
            <label
              style={{
                color: muted,
                fontSize: "0.75rem",
                fontWeight: 600,
                display: "block",
                marginBottom: 8,
              }}
            >
              Exit Price (USDT)
            </label>
            <input
              type="number"
              style={iStyle}
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              placeholder="Enter exit price"
              autoFocus
              disabled={!!closingTradeId}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !closingTradeId) {
                  handleCloseTrade();
                }
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 20,
              }}
            >
              <button
                onClick={() => setClosingTrade(null)}
                disabled={!!closingTradeId}
                style={{
                  padding: "10px",
                  borderRadius: 12,
                  border: `1px solid ${border}`,
                  background: "transparent",
                  color: textClr,
                  cursor: closingTradeId ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  opacity: closingTradeId ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCloseTrade}
                disabled={!!closingTradeId}
                style={{
                  padding: "10px",
                  borderRadius: 12,
                  border: "none",
                  background: "#f87171",
                  color: "#fff",
                  cursor: closingTradeId ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: closingTradeId ? 0.7 : 1,
                }}
              >
                {closingTradeId ? (
                  <>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        border: "2px solid #fff",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Closing...
                  </>
                ) : (
                  "Confirm Close"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

//  Main Section
export default function SectionAIBots({
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  divLine,
  inputBg,
  showToast,
}) {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [managing, setManaging] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadBots = async () => {
    setLoading(true);
    try {
      const res = await api.get("/bots/admin/all");
      setBots(res.data?.data?.bots || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load bots", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBots();
  }, []);

  const deleteBot = async (id) => {
    setConfirmDelete(id); // Show confirmation modal
  };

  //  function to perform actual deletion
  const performDelete = async (id) => {
    try {
      await api.delete(`/bots/admin/bots/${id}`);
      showToast("Bot deleted", "success");
      loadBots();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    }
    setConfirmDelete(null);
  };

  return (
    <div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {showModal && (
        <BotModal
          bot={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={loadBots}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
          showToast={showToast}
        />
      )}
      {managing && (
        <BotTradeModal
          bot={managing}
          onClose={() => setManaging(null)}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
          showToast={showToast}
        />
      )}

      {/*  Delete Confirmation Modal */}
      {confirmDelete && (
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
            onClick={() => setConfirmDelete(null)}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 24,
              width: "100%",
              maxWidth: 400,
              padding: 24,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(248,113,113,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Trash2 size={24} color="#f87171" />
            </div>
            <h3
              style={{
                color: textClr,
                fontSize: "1.1rem",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Delete Bot?
            </h3>
            <p style={{ color: muted, fontSize: "0.85rem", marginBottom: 24 }}>
              This action cannot be undone. The bot will be permanently removed.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  padding: "10px",
                  borderRadius: 12,
                  border: `1px solid ${border}`,
                  background: "transparent",
                  color: textClr,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => performDelete(confirmDelete)}
                style={{
                  padding: "10px",
                  borderRadius: 12,
                  border: "none",
                  background: "#f87171",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
            AI Trading Bots
          </h2>
          <p style={{ color: muted, fontSize: "0.75rem", marginTop: 2 }}>
            Create and manage automated trading bots
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          style={{
            padding: "8px 16px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg,#f472b6,#a78bfa)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Plus size={14} /> Create Bot
        </button>
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
          <div style={{ minWidth: 820 }}>
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "120px 160px 100px 80px 100px 100px 80px 100px",
                gap: 12,
                padding: "12px 18px",
                color: muted,
                fontSize: "0.65rem",
                fontWeight: 700,
                borderBottom: `1px solid ${divLine}`,
              }}
            >
              <div>Strategy</div>
              <div>Name</div>
              <div>Risk</div>
              <div>Min $</div>
              <div>Win Rate</div>
              <div>Return</div>
              <div>Users</div>
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
            ) : bots.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: muted }}>
                <Bot size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                <div>No bots yet — click Create Bot</div>
              </div>
            ) : (
              bots.map((bot) => {
                const strategy =
                  STRATEGY_OPTIONS.find((s) => s.value === bot.strategy) ||
                  STRATEGY_OPTIONS[0];
                const riskClr =
                  { Low: "#34d399", Medium: "#f59e0b", High: "#f87171" }[
                    bot.riskLevel
                  ] || "#94a3b8";
                return (
                  <div
                    key={bot._id}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "120px 160px 100px 80px 100px 100px 80px 100px",
                      gap: 12,
                      padding: "12px 18px",
                      borderBottom: `1px solid ${divLine}`,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <strategy.icon size={14} color={strategy.color} />
                      <span
                        style={{
                          color: strategy.color,
                          fontSize: "0.72rem",
                          fontWeight: 600,
                        }}
                      >
                        {strategy.label}
                      </span>
                    </div>
                    <div>
                      <div
                        style={{
                          color: textClr,
                          fontWeight: 600,
                          fontSize: "0.82rem",
                        }}
                      >
                        {bot.name}
                      </div>
                      <div style={{ color: muted, fontSize: "0.65rem" }}>
                        {bot.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                    <div>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          background: `${riskClr}18`,
                          color: riskClr,
                        }}
                      >
                        {bot.riskLevel}
                      </span>
                    </div>
                    <div style={{ color: textClr, fontSize: "0.8rem" }}>
                      ${bot.minDeposit}
                    </div>
                    <div style={{ color: "#34d399", fontWeight: 600 }}>
                      {bot.stats?.winRate?.toFixed(1) || 0}%
                    </div>
                    <div style={{ color: "#f59e0b", fontWeight: 600 }}>
                      +{bot.stats?.totalReturn?.toFixed(1) || 0}%
                    </div>
                    <div style={{ color: textClr }}>
                      {bot.stats?.totalSubscribers || 0}
                    </div>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button
                        onClick={() => setManaging(bot)}
                        title="Manage Trades"
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          border: `1px solid ${border}`,
                          background: "transparent",
                          cursor: "pointer",
                          color: "#f472b6",
                        }}
                      >
                        <Activity size={12} />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(bot);
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
                        onClick={() => deleteBot(bot._id)}
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
