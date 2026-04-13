// frontend/src/pages/admin/SectionUserInvestments.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";
import api from "../../services/apiService";
import { fmtDate, Badge, Skel, PaginationBar } from "./AdminShared";

// Breakpoint hook
function useIsMobile(bp = 700) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < bp);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return isMobile;
}

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
          padding: "7px 12px",
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
        <ChevronDownIcon
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

// Mature Investment Confirmation Modal
function MatureConfirmModal({
  investment,
  onClose,
  onConfirm,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
}) {
  const [confirming, setConfirming] = useState(false);

  const returns = (investment?.amount * investment?.expectedROI) / 100;

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
          maxWidth: 420,
          padding: 24,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(52,211,153,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <TrendingUp size={24} color="#34d399" />
        </div>
        <h3
          style={{
            color: textClr,
            fontSize: "1.1rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Mature Investment?
        </h3>
        <p
          style={{
            color: muted,
            fontSize: "0.85rem",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          This will credit{" "}
          <strong style={{ color: "#34d399" }}>${returns.toFixed(2)}</strong> to{" "}
          {investment?.user?.firstName} {investment?.user?.lastName}'s wallet.
        </p>
        <div
          style={{
            background: darkMode
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.03)",
            borderRadius: 12,
            padding: "12px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ color: muted, fontSize: "0.7rem" }}>Plan:</span>
            <span
              style={{ color: textClr, fontSize: "0.8rem", fontWeight: 600 }}
            >
              {investment?.planId?.name || "Custom Plan"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ color: muted, fontSize: "0.7rem" }}>Amount:</span>
            <span
              style={{ color: textClr, fontSize: "0.8rem", fontWeight: 600 }}
            >
              ${investment?.amount?.toLocaleString()}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: muted, fontSize: "0.7rem" }}>Returns:</span>
            <span
              style={{ color: "#34d399", fontSize: "0.8rem", fontWeight: 700 }}
            >
              +${returns.toFixed(2)}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
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
            onClick={async () => {
              setConfirming(true);
              await onConfirm(investment._id);
              setConfirming(false);
            }}
            disabled={confirming}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg,#34d399,#2c9c70)",
              color: "#fff",
              fontWeight: 600,
              cursor: confirming ? "not-allowed" : "pointer",
              opacity: confirming ? 0.7 : 1,
            }}
          >
            {confirming ? "Processing..." : "Confirm Mature"}
          </button>
        </div>
      </div>
    </div>
  );
}

const MARKET_CONFIG = {
  stocks: { name: "Stocks", color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  crypto: { name: "Crypto", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  realestate: {
    name: "Real Estate",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
  },
};

const STATUS_CONFIG = {
  active: { label: "Active", color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  matured: { label: "Matured", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  cancelled: {
    label: "Cancelled",
    color: "#f87171",
    bg: "rgba(248,113,113,0.12)",
  },
};

export default function SectionUserInvestments({
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  divLine,
  inputBg,
  showToast,
}) {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMarket, setFilterMarket] = useState("");
  const [search, setSearch] = useState("");
  const [matureConfirm, setMatureConfirm] = useState(null);

  const isMobile = useIsMobile();

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "matured", label: "Matured" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const marketOptions = [
    { value: "", label: "All Markets" },
    { value: "stocks", label: "Stock Market" },
    { value: "crypto", label: "Cryptocurrency" },
    { value: "realestate", label: "Real Estate" },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filterStatus) params.set("status", filterStatus);
      if (filterMarket) params.set("market", filterMarket);
      if (search) params.set("search", search);
      const res = await api.get(`/investments/admin/all?${params}`);
      setInvestments(res.data?.data || []);
      setPages(res.data?.pagination?.pages || 1);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to load investments",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterMarket, search]);

  useEffect(() => {
    load();
  }, [load]);

  const matureInvestment = async (id) => {
    setMatureConfirm(id);
  };

  const confirmMature = async (id) => {
    try {
      await api.post(`/investments/admin/${id}/mature`);
      showToast("Investment matured successfully", "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setMatureConfirm(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysRemaining = (maturityDate) => {
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diff = Math.ceil((maturity - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div>
      {matureConfirm && (
        <MatureConfirmModal
          investment={investments.find((inv) => inv._id === matureConfirm)}
          onClose={() => setMatureConfirm(null)}
          onConfirm={confirmMature}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
        />
      )}
      {/* Filter bar with rounded custom selects */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              width: 14,
              height: 14,
              color: muted,
            }}
          />
          <input
            type="text"
            placeholder="Search by user email or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              padding: "7px 12px 7px 32px",
              borderRadius: 12,
              border: `1px solid ${border}`,
              background: inputBg,
              color: textClr,
              fontSize: "0.8rem",
              outline: "none",
            }}
          />
        </div>

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

        <button
          onClick={load}
          style={{
            padding: "7px 12px",
            borderRadius: 12,
            border: `1px solid ${border}`,
            background: "transparent",
            color: muted,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <RefreshCw style={{ width: 11, height: 11 }} /> Refresh
        </button>
      </div>

      {/* Card / Table */}
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
          investments.length === 0 ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: muted,
                fontSize: "0.85rem",
              }}
            >
              No investments found.
            </div>
          ) : (
            investments.map((inv, i) => {
              const market = MARKET_CONFIG[inv.market] || MARKET_CONFIG.stocks;
              const status = STATUS_CONFIG[inv.status] || STATUS_CONFIG.active;
              const open = expanded === inv._id;
              const daysRemaining =
                inv.status === "active"
                  ? getDaysRemaining(inv.maturityDate)
                  : 0;
              const returns = (inv.amount * inv.expectedROI) / 100;

              return (
                <div
                  key={inv._id}
                  style={{
                    borderBottom:
                      i < investments.length - 1
                        ? `1px solid ${divLine}`
                        : "none",
                  }}
                >
                  <div
                    onClick={() => setExpanded(open ? null : inv._id)}
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
                        }}
                      >
                        {inv.user?.firstName} {inv.user?.lastName}
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
                            background: market.bg,
                            color: market.color,
                          }}
                        >
                          {market.name}
                        </span>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            padding: "2px 7px",
                            borderRadius: 5,
                            background: status.bg,
                            color: status.color,
                          }}
                        >
                          {status.label}
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
                        ${inv.amount?.toLocaleString()}
                      </span>
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
                          }}
                        >
                          User
                        </span>
                        <span
                          style={{
                            color: muted,
                            fontSize: "0.78rem",
                            textAlign: "right",
                          }}
                        >
                          {inv.user?.email}
                        </span>
                      </div>
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
                          }}
                        >
                          Plan
                        </span>
                        <span
                          style={{
                            color: textClr,
                            fontSize: "0.78rem",
                            textAlign: "right",
                          }}
                        >
                          {inv.planId?.name || "Custom Plan"}
                        </span>
                      </div>
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
                          }}
                        >
                          Amount
                        </span>
                        <span
                          style={{
                            color: textClr,
                            fontSize: "0.78rem",
                            fontFamily: "monospace",
                          }}
                        >
                          ${inv.amount?.toLocaleString()}
                        </span>
                      </div>
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
                          }}
                        >
                          ROI
                        </span>
                        <span
                          style={{
                            color: "#34d399",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                          }}
                        >
                          {inv.expectedROI}% (${returns.toFixed(2)})
                        </span>
                      </div>
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
                          }}
                        >
                          Started
                        </span>
                        <span style={{ color: textClr, fontSize: "0.78rem" }}>
                          {formatDate(inv.startDate)}
                        </span>
                      </div>
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
                          }}
                        >
                          Maturity
                        </span>
                        <span style={{ color: textClr, fontSize: "0.78rem" }}>
                          {formatDate(inv.maturityDate)}
                        </span>
                      </div>
                      {inv.status === "active" && daysRemaining > 0 && (
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
                            }}
                          >
                            Days Left
                          </span>
                          <span
                            style={{
                              color: "#f59e0b",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                            }}
                          >
                            {daysRemaining} days
                          </span>
                        </div>
                      )}
                      <div
                        style={{
                          borderTop: `1px solid ${divLine}`,
                          paddingTop: 10,
                        }}
                      >
                        {inv.status === "active" && (
                          <button
                            onClick={() => setMatureConfirm(inv)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 8,
                              border: `1px solid rgba(52,211,153,0.35)`,
                              background: "rgba(52,211,153,0.08)",
                              color: "#34d399",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <TrendingUp style={{ width: 12, height: 12 }} />{" "}
                            Mature Investment
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          <div className="thin-scroll" style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 1000 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "150px 200px 100px 100px 100px 120px 100px 100px",
                  gap: 8,
                  padding: "10px 18px",
                  color: muted,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  borderBottom: `1px solid ${divLine}`,
                }}
              >
                <div>User</div>
                <div>Plan</div>
                <div>Market</div>
                <div>Amount</div>
                <div>ROI</div>
                <div>Started</div>
                <div>Maturity</div>
                <div>Status</div>
                <div>Action</div>
              </div>
              {investments.length === 0 ? (
                <div
                  style={{ padding: "30px", textAlign: "center", color: muted }}
                >
                  No investments found.
                </div>
              ) : (
                investments.map((inv, i) => {
                  const market =
                    MARKET_CONFIG[inv.market] || MARKET_CONFIG.stocks;
                  const status =
                    STATUS_CONFIG[inv.status] || STATUS_CONFIG.active;
                  const returns = (inv.amount * inv.expectedROI) / 100;
                  const daysRemaining =
                    inv.status === "active"
                      ? getDaysRemaining(inv.maturityDate)
                      : 0;

                  return (
                    <div
                      key={inv._id}
                      className="adm-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "150px 200px 100px 100px 100px 120px 100px 100px",
                        gap: 8,
                        padding: "12px 18px",
                        borderBottom:
                          i < investments.length - 1
                            ? `1px solid ${divLine}`
                            : "none",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ color: textClr, fontWeight: 600 }}>
                          {inv.user?.firstName} {inv.user?.lastName}
                        </div>
                        <div style={{ color: muted, fontSize: "0.68rem" }}>
                          {inv.user?.email}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: textClr }}>
                          {inv.planId?.name || "Custom Plan"}
                        </div>
                        <div style={{ color: muted, fontSize: "0.68rem" }}>
                          {inv.duration} days
                        </div>
                      </div>
                      <div>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 5,
                            background: market.bg,
                            color: market.color,
                            fontSize: "0.7rem",
                          }}
                        >
                          {market.name}
                        </span>
                      </div>
                      <div style={{ fontFamily: "monospace", fontWeight: 600 }}>
                        ${inv.amount?.toLocaleString()}
                      </div>
                      <div>
                        <span style={{ color: "#34d399" }}>
                          {inv.expectedROI}%
                        </span>
                        <div style={{ fontSize: "0.65rem", color: muted }}>
                          +${returns.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.75rem" }}>
                        {formatDate(inv.startDate)}
                      </div>
                      <div style={{ fontSize: "0.75rem" }}>
                        {formatDate(inv.maturityDate)}
                      </div>
                      <div>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 5,
                            background: status.bg,
                            color: status.color,
                            fontSize: "0.7rem",
                          }}
                        >
                          {status.label}
                        </span>
                        {inv.status === "active" && daysRemaining > 0 && (
                          <div
                            style={{
                              fontSize: "0.6rem",
                              color: "#f59e0b",
                              marginTop: 2,
                            }}
                          >
                            {daysRemaining}d left
                          </div>
                        )}
                      </div>
                      <div>
                        {inv.status === "active" && (
                          <button
                            onClick={() => setMatureConfirm(inv)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 8,
                              border: `1px solid rgba(52,211,153,0.35)`,
                              background: "rgba(52,211,153,0.08)",
                              color: "#34d399",
                              cursor: "pointer",
                              fontSize: "0.7rem",
                            }}
                          >
                            Mature
                          </button>
                        )}
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
