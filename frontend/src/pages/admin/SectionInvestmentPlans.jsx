// frontend/src/pages/admin/SectionInvestmentPlans.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp,
  Bitcoin,
  Building2,
  Shield,
  AlertTriangle,
  X,
  Loader,
  ChevronDown,
} from "lucide-react";
import api from "../../services/apiService";
import { fmtDate, Badge, Skel, PaginationBar } from "./AdminShared";

const MARKET_CONFIG = {
  stocks: {
    name: "Stock Market",
    icon: TrendingUp,
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
  },
  crypto: {
    name: "Cryptocurrency",
    icon: Bitcoin,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
  realestate: {
    name: "Real Estate",
    icon: Building2,
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
  },
};

const RISK_LEVELS = [
  { value: "Low", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: Shield },
  {
    value: "Medium",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    icon: AlertTriangle,
  },
  {
    value: "High",
    color: "#f87171",
    bg: "rgba(248,113,113,0.12)",
    icon: AlertTriangle,
  },
];

// Custom Select Component for Modal
function CustomSelect({
  value,
  onChange,
  options,
  darkMode,
  border,
  textClr,
  muted,
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
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "9px 11px",
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
}

// Create/Edit Modal
function PlanModal({
  plan,
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
    market: plan?.market || "stocks",
    name: plan?.name || "",
    description: plan?.description || "",
    minAmount: plan?.minAmount || 100,
    maxAmount: plan?.maxAmount || "",
    roi: plan?.roi || 10,
    duration: plan?.duration || 30,
    riskLevel: plan?.riskLevel || "Medium",
    isActive: plan?.isActive !== undefined ? plan.isActive : true,
    features: plan?.features || [],
  });
  const [featureInput, setFeatureInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const marketOptions = [
    { value: "stocks", label: "Stock Market" },
    { value: "crypto", label: "Cryptocurrency" },
    { value: "realestate", label: "Real Estate" },
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

  const addFeature = () => {
    if (featureInput.trim() && !form.features.includes(featureInput.trim())) {
      setForm({ ...form, features: [...form.features, featureInput.trim()] });
      setFeatureInput("");
    }
  };

  const removeFeature = (feature) => {
    setForm({ ...form, features: form.features.filter((f) => f !== feature) });
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Plan name is required");
      return;
    }
    if (form.minAmount <= 0) {
      setError("Minimum amount must be greater than 0");
      return;
    }
    if (form.roi <= 0) {
      setError("ROI must be greater than 0");
      return;
    }
    if (form.duration <= 0) {
      setError("Duration must be greater than 0");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        maxAmount: form.maxAmount ? parseFloat(form.maxAmount) : undefined,
      };

      if (plan) {
        await api.patch(`/investments/admin/plans/${plan._id}`, payload);
        showToast("Plan updated successfully", "success");
      } else {
        await api.post("/investments/admin/plans", payload);
        showToast("Plan created successfully", "success");
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save plan");
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
          div::-webkit-scrollbar {
            width: 4px;
          }
          div::-webkit-scrollbar-track {
            background: ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"};
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb {
            background: rgba(245,158,11,0.3);
            border-radius: 4px;
          }
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
            {plan ? "Edit Investment Plan" : "Create Investment Plan"}
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
            Plan Name *
          </label>
          <input
            style={iStyle}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Blue Chip Stocks, Bitcoin Max, Commercial REIT"
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
            placeholder="Describe this investment plan..."
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
              Min Amount (USDT) *
            </label>
            <input
              type="number"
              style={iStyle}
              value={form.minAmount}
              onChange={(e) =>
                setForm({ ...form, minAmount: parseFloat(e.target.value) || 0 })
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
              Max Amount (USDT)
            </label>
            <input
              type="number"
              style={iStyle}
              value={form.maxAmount}
              onChange={(e) =>
                setForm({
                  ...form,
                  maxAmount: e.target.value ? parseFloat(e.target.value) : "",
                })
              }
              placeholder="Unlimited"
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
              ROI (%) *
            </label>
            <input
              type="number"
              style={iStyle}
              value={form.roi}
              onChange={(e) =>
                setForm({ ...form, roi: parseFloat(e.target.value) || 0 })
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
              Duration (days) *
            </label>
            <input
              type="number"
              style={iStyle}
              value={form.duration}
              onChange={(e) =>
                setForm({ ...form, duration: parseInt(e.target.value) || 0 })
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
            Features
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              style={{ flex: 1, ...iStyle }}
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder="e.g., Daily Returns, No Lock Period"
              onKeyPress={(e) => e.key === "Enter" && addFeature()}
            />
            <button
              onClick={addFeature}
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
                  background: "rgba(245,158,11,0.1)",
                  color: "#f59e0b",
                  fontSize: "0.7rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {f}
                <button
                  onClick={() => removeFeature(f)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#f59e0b",
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
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
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <span style={{ color: textClr, fontSize: "0.8rem" }}>
              Active (visible to users)
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
            {saving ? "Saving..." : plan ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

//delete confirmation modal
function DeleteConfirmModal({
  planName,
  onClose,
  onConfirm,
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
          Delete Investment Plan?
        </h3>
        <p style={{ color: muted, fontSize: "0.85rem", marginBottom: 24 }}>
          Are you sure you want to delete "{planName}"? This action cannot be
          undone.
        </p>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
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
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
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
  );
}

export default function SectionInvestmentPlans({
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  divLine,
  inputBg,
  showToast,
}) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [marketFilter, setMarketFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get("/investments/admin/plans");
      setPlans(res.data?.data?.plans || []);
    } catch (err) {
      console.error("Failed to load plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/investments/admin/plans/${id}`, {
        isActive: !currentStatus,
      });
      showToast(
        `Plan ${!currentStatus ? "activated" : "deactivated"}`,
        "success",
      );
      loadPlans();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update status",
        "error",
      );
    }
  };

  const deletePlan = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    const id = deleteConfirm;
    try {
      await api.delete(`/investments/admin/plans/${id}`);
      showToast("Plan deleted", "success");
      loadPlans();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete", "error");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filteredPlans =
    marketFilter === "all"
      ? plans
      : plans.filter((p) => p.market === marketFilter);

  // Custom select for market filter
  const filterOptions = [
    { value: "all", label: "All Markets" },
    { value: "stocks", label: "Stock Market" },
    { value: "crypto", label: "Cryptocurrency" },
    { value: "realestate", label: "Real Estate" },
  ];

  const FilterSelect = () => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);
    const selectedOption = filterOptions.find(
      (opt) => opt.value === marketFilter,
    );

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div ref={selectRef} style={{ position: "relative" }}>
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
            minWidth: 140,
          }}
        >
          <span>{selectedOption?.label}</span>
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
            {filterOptions.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  setMarketFilter(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  color: textClr,
                  fontSize: "0.8rem",
                  background:
                    marketFilter === opt.value
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
                    marketFilter === opt.value
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

  return (
    <div>
      {showModal && (
        <PlanModal
          plan={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={loadPlans}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
          showToast={showToast}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          planName={plans.find((p) => p._id === deleteConfirm)?.name || ""}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={confirmDelete}
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
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ color: textClr, fontSize: "1.2rem", fontWeight: 700 }}>
            Investment Plans
          </h2>
          <p style={{ color: muted, fontSize: "0.75rem", marginTop: 2 }}>
            Create and manage investment plans for users
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <FilterSelect />
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
            <Plus size={14} /> Create Plan
          </button>
        </div>
      </div>

      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 18,
          overflowX: "auto",
          overflowY: "auto",
          maxHeight: "calc(100vh - 200px)",
          scrollbarWidth: "thin",
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          div::-webkit-scrollbar-track {
            background: ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"};
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb {
            background: rgba(245,158,11,0.3);
            border-radius: 4px;
          }
        `}</style>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "80px 140px 1fr 100px 100px 100px 80px 80px",
            gap: 12,
            padding: "12px 18px",
            color: muted,
            fontSize: "0.7rem",
            fontWeight: 700,
            borderBottom: `1px solid ${divLine}`,
            minWidth: "800px",
          }}
        >
          <div>Market</div>
          <div>Name</div>
          <div>Description</div>
          <div>Min/Max</div>
          <div>ROI/Days</div>
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
        ) : filteredPlans.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: muted }}>
            No investment plans found. Create your first plan!
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const market = MARKET_CONFIG[plan.market];
            const risk = RISK_LEVELS.find((r) => r.value === plan.riskLevel);
            return (
              <div
                key={plan._id}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "80px 140px 1fr 100px 100px 100px 80px 80px",
                  gap: 12,
                  padding: "12px 18px",
                  borderBottom: `1px solid ${divLine}`,
                  alignItems: "center",
                  minWidth: "800px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <market.icon size={16} color={market.color} />
                  <span style={{ fontSize: "0.7rem", color: market.color }}>
                    {market.name}
                  </span>
                </div>
                <div>
                  <div
                    style={{
                      color: textClr,
                      fontWeight: 600,
                      fontSize: "0.8rem",
                    }}
                  >
                    {plan.name}
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
                  {plan.description || "—"}
                </div>
                <div>
                  <div style={{ fontSize: "0.7rem", color: textClr }}>
                    ${plan.minAmount}
                  </div>
                  <div style={{ fontSize: "0.6rem", color: muted }}>
                    {plan.maxAmount ? `$${plan.maxAmount}` : "Unlimited"}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      color: "#34d399",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  >
                    {plan.roi}%
                  </div>
                  <div style={{ fontSize: "0.6rem", color: muted }}>
                    {plan.duration} days
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: risk?.bg,
                      color: risk?.color,
                      fontSize: "0.65rem",
                    }}
                  >
                    {plan.riskLevel}
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => toggleStatus(plan._id, plan.isActive)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: "none",
                      border: "none",
                      color: plan.isActive ? "#34d399" : muted,
                      cursor: "pointer",
                      fontSize: "0.7rem",
                    }}
                  >
                    {plan.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                    {plan.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => {
                      setEditing(plan);
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
                    onClick={() => deletePlan(plan._id)}
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
  );
}
