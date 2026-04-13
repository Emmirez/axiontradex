import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Search,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ZoomIn,
  Loader,
} from "lucide-react";
import api from "../../services/apiService";
import { fmtDate, Skel, PaginationBar } from "./AdminShared";

//  Helpers 

const KYC_COLOR = {
  pending: { color: "#60a5fa", bg: "rgba(96,165,250,0.12)", label: "Pending" },
  approved: {
    color: "#34d399",
    bg: "rgba(52,211,153,0.12)",
    label: "Approved",
  },
  rejected: {
    color: "#f87171",
    bg: "rgba(248,113,113,0.12)",
    label: "Rejected",
  },
  unverified: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    label: "Unverified",
  },
};

function KycBadge({ status }) {
  const cfg = KYC_COLOR[status] || KYC_COLOR.unverified;
  return (
    <span
      style={{
        padding: "3px 9px",
        borderRadius: 6,
        fontSize: "0.68rem",
        fontWeight: 700,
        background: cfg.bg,
        color: cfg.color,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

function SectionLabel({ label, muted }) {
  return (
    <div
      style={{
        color: muted,
        fontSize: "0.7rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        marginBottom: 10,
      }}
    >
      {label}
    </div>
  );
}

function useIsMobile(bp = 700) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < bp);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return isMobile;
}

// Lightbox 

function Lightbox({ src, onClose }) {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 8,
          color: "#fff",
          cursor: "pointer",
          padding: 6,
          display: "flex",
          alignItems: "center",
        }}
      >
        <X style={{ width: 16, height: 16 }} />
      </button>
      <img
        src={src}
        alt="KYC document"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "85vh",
          borderRadius: 12,
          objectFit: "contain",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        }}
      />
    </div>
  );
}

//  Doc image tile 

function DocTile({ label, src, border, darkMode, onZoom }) {
  if (!src)
    return (
      <div>
        <div
          style={{
            color: "#94a3b8",
            fontSize: "0.68rem",
            fontWeight: 600,
            marginBottom: 5,
          }}
        >
          {label}
        </div>
        <div
          style={{
            borderRadius: 10,
            border: `1px dashed ${border}`,
            aspectRatio: "4/3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: darkMode
              ? "rgba(255,255,255,0.02)"
              : "rgba(0,0,0,0.02)",
          }}
        >
          <span style={{ color: "#64748b", fontSize: "0.68rem" }}>
            Not provided
          </span>
        </div>
      </div>
    );

  return (
    <div>
      <div
        style={{
          color: "#94a3b8",
          fontSize: "0.68rem",
          fontWeight: 600,
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      <div
        onClick={() => onZoom(src)}
        style={{
          position: "relative",
          cursor: "zoom-in",
          borderRadius: 10,
          overflow: "hidden",
          border: `1px solid ${border}`,
          aspectRatio: "4/3",
          background: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
        }}
      >
        <img
          src={src}
          alt={label}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        <div
          className="doc-overlay"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.35)";
            e.currentTarget.querySelector("svg").style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0)";
            e.currentTarget.querySelector("svg").style.opacity = "0";
          }}
        >
          <ZoomIn
            style={{
              width: 22,
              height: 22,
              color: "#fff",
              opacity: 0,
              transition: "opacity 0.15s",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Review modal — fetches full user data itself 

function ReviewModal({
  userId,
  onClose,
  onSave,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  inputBg,
}) {
  const [userData, setUserData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [fetchErr, setFetchErr] = useState("");
  const [decision, setDecision] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [lightbox, setLightbox] = useState(null);

  // Fetch FULL user (includes complete kyc with all base64 images + nested objects)
  useEffect(() => {
    const load = async () => {
      try {
        setFetching(true);
        const res = await api.get(`/admin/users/${userId}`);
        // getUserById returns { data: { user, trades, transactions } }
        const u = res.data?.data?.user || res.data?.data || null;
       
        setUserData(u);
      } catch (e) {
        setFetchErr(e.response?.data?.message || "Failed to load user data");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [userId]);

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

  const handleSave = async () => {
    if (!decision) {
      setErr("Please select Approve or Reject");
      return;
    }
    if (decision === "rejected" && !note.trim()) {
      setErr("Rejection reason is required");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      await onSave(userId, { status: decision, note });
    } catch (e) {
      setErr(e.response?.data?.message || e.message || "Failed");
      setSaving(false);
    }
  };

  const kyc = userData?.kyc || {};
  const pi = kyc.personalInfo || {};
  const addr = kyc.addressInfo || {};
  const emp = kyc.employmentInfo || {};

  const infoRows = [
    {
      label: "Document Type",
      value: kyc.documentType?.replace(/_/g, " ") || "—",
    },
    { label: "Document Number", value: kyc.documentNumber || "—" },
    {
      label: "Submitted",
      value: kyc.submittedAt ? fmtDate(kyc.submittedAt) : "—",
    },
    "divider",
    { label: "First Name", value: pi.firstName || userData?.firstName || "—" },
    { label: "Last Name", value: pi.lastName || userData?.lastName || "—" },
    { label: "Date of Birth", value: pi.dob || "—" },
    { label: "Gender", value: pi.gender || "—" },
    "divider",
    { label: "Street", value: addr.street || "—" },
    { label: "City", value: addr.city || "—" },
    { label: "State", value: addr.state || "—" },
    { label: "Country", value: addr.country || "—" },
    { label: "Zip", value: addr.zip || "—" },
    "divider",
    { label: "Employment", value: emp.status || "—" },
    { label: "Employer", value: emp.employer || "—" },
    { label: "Income", value: emp.income || "—" },
  ];

  return (
    <>
      {lightbox && (
        <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(5px)",
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
            maxWidth: 580,
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
              alignItems: "flex-start",
              marginBottom: 20,
            }}
          >
            <div>
              <div
                style={{ color: textClr, fontWeight: 800, fontSize: "1rem" }}
              >
                Review KYC
              </div>
              {userData && (
                <div
                  style={{ color: muted, fontSize: "0.72rem", marginTop: 2 }}
                >
                  {userData.firstName} {userData.lastName} · {userData.email}
                </div>
              )}
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
                flexShrink: 0,
              }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Loading */}
          {fetching && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "40px 0",
                color: muted,
                fontSize: "0.85rem",
              }}
            >
              <Loader
                style={{
                  width: 16,
                  height: 16,
                  animation: "spin 1s linear infinite",
                }}
              />{" "}
              Loading KYC data…
            </div>
          )}

          {/* Error */}
          {!fetching && fetchErr && (
            <div
              style={{
                color: "#f87171",
                fontSize: "0.8rem",
                padding: "12px",
                background: "rgba(248,113,113,0.08)",
                borderRadius: 8,
                border: "1px solid rgba(248,113,113,0.2)",
              }}
            >
              {fetchErr}
            </div>
          )}

          {/* Content */}
          {!fetching && userData && (
            <>
              {/* Status */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 20,
                  flexWrap: "wrap",
                }}
              >
                <KycBadge status={kyc.status} />
                {kyc.reviewNote && (
                  <span style={{ color: muted, fontSize: "0.72rem" }}>
                    "{kyc.reviewNote}"
                  </span>
                )}
              </div>

              {/* Document images — always render all 3 slots */}
              <div style={{ marginBottom: 22 }}>
                <SectionLabel label="Document Images" muted={muted} />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 10,
                  }}
                >
                  <DocTile
                    label="Front of ID"
                    src={kyc.documentUrl}
                    border={border}
                    darkMode={darkMode}
                    onZoom={setLightbox}
                  />
                  <DocTile
                    label="Back of ID"
                    src={kyc.backUrl}
                    border={border}
                    darkMode={darkMode}
                    onZoom={setLightbox}
                  />
                  <DocTile
                    label="Selfie"
                    src={kyc.selfieUrl}
                    border={border}
                    darkMode={darkMode}
                    onZoom={setLightbox}
                  />
                </div>
              </div>

              {/* Info table */}
              <div style={{ marginBottom: 22 }}>
                <SectionLabel label="Submitted Information" muted={muted} />
                <div
                  style={{
                    border: `1px solid ${border}`,
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  {infoRows.map((row, i) =>
                    row === "divider" ? (
                      <div
                        key={`d${i}`}
                        style={{ height: 1, background: border }}
                      />
                    ) : (
                      <div
                        key={row.label}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "150px 1fr",
                          padding: "9px 14px",
                          gap: 8,
                          alignItems: "center",
                          borderBottom:
                            i < infoRows.length - 1
                              ? `1px solid ${border}`
                              : "none",
                        }}
                      >
                        <span
                          style={{
                            color: muted,
                            fontSize: "0.72rem",
                            fontWeight: 600,
                          }}
                        >
                          {row.label}
                        </span>
                        <span
                          style={{
                            color: textClr,
                            fontSize: "0.78rem",
                            wordBreak: "break-word",
                            textTransform:
                              row.label === "Document Type"
                                ? "capitalize"
                                : "none",
                          }}
                        >
                          {row.value}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Decision buttons */}
              <div style={{ marginBottom: 14 }}>
                <SectionLabel label="Decision" muted={muted} />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {[
                    {
                      val: "approved",
                      label: "Approve",
                      color: "#34d399",
                      activeBg: "rgba(52,211,153,0.15)",
                      bg: "rgba(52,211,153,0.06)",
                      icon: CheckCircle,
                    },
                    {
                      val: "rejected",
                      label: "Reject",
                      color: "#f87171",
                      activeBg: "rgba(248,113,113,0.15)",
                      bg: "rgba(248,113,113,0.06)",
                      icon: XCircle,
                    },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setDecision(opt.val)}
                      style={{
                        padding: "11px",
                        borderRadius: 10,
                        border: `1.5px solid ${decision === opt.val ? opt.color : border}`,
                        background:
                          decision === opt.val ? opt.activeBg : opt.bg,
                        color: opt.color,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        transition: "all 0.15s",
                      }}
                    >
                      <opt.icon style={{ width: 14, height: 14 }} /> {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    color: muted,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Note{" "}
                  {decision === "rejected" && (
                    <span style={{ color: "#f87171" }}>*</span>
                  )}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    decision === "rejected"
                      ? "Rejection reason (shown to user)…"
                      : "Optional note…"
                  }
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{
                    ...iStyle,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {err && (
                <div
                  style={{
                    color: "#f87171",
                    fontSize: "0.75rem",
                    marginBottom: 12,
                    padding: "8px 12px",
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
                  onClick={handleSave}
                  disabled={saving || !decision}
                  style={{
                    padding: "11px",
                    borderRadius: 9,
                    border: "none",
                    background: "linear-gradient(135deg,#d97706,#f59e0b)",
                    color: "#020617",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    cursor: saving || !decision ? "not-allowed" : "pointer",
                    opacity: saving || !decision ? 0.6 : 1,
                  }}
                >
                  {saving ? "Saving…" : "Submit Decision"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function SectionKYC({
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
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [reviewingId, setReviewingId] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set("kyc", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const res = await api.get(`/admin/users?${params}`);
      setItems((res.data?.data || []).filter((u) => u.kyc?.status));
      setPages(res.data?.pagination?.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReview = async (userId, payload) => {
    await api.patch(`/admin/users/${userId}/kyc`, payload);
    showToast(`KYC ${payload.status} successfully`);
    setReviewingId(null);
    load();
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

  const TABS = [
    { val: "pending", label: "Pending", icon: Clock, color: "#60a5fa" },
    { val: "approved", label: "Approved", icon: CheckCircle, color: "#34d399" },
    { val: "rejected", label: "Rejected", icon: XCircle, color: "#f87171" },
    { val: "", label: "All", icon: AlertCircle, color: "#94a3b8" },
  ];

  return (
    <div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {reviewingId && (
        <ReviewModal
          userId={reviewingId}
          onClose={() => setReviewingId(null)}
          onSave={handleReview}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
        />
      )}

      {/* Tabs */}
      <div
        style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}
      >
        {TABS.map((tab) => {
          const active = statusFilter === tab.val;
          return (
            <button
              key={tab.val}
              onClick={() => {
                setStatusFilter(tab.val);
                setPage(1);
              }}
              style={{
                padding: "7px 14px",
                borderRadius: 9,
                border: `1px solid ${active ? tab.color : border}`,
                background: active ? `${tab.color}15` : "transparent",
                color: active ? tab.color : muted,
                fontWeight: active ? 700 : 500,
                fontSize: "0.8rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s",
              }}
            >
              <tab.icon style={{ width: 12, height: 12 }} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search + refresh */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              width: 13,
              height: 13,
              color: muted,
              pointerEvents: "none",
            }}
          />
          <input
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              ...selStyle,
              paddingLeft: 30,
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </div>
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
          }}
        >
          <RefreshCw style={{ width: 11, height: 11 }} /> Refresh
        </button>
      </div>

      {/* List */}
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
          items.length === 0 ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: muted,
                fontSize: "0.85rem",
              }}
            >
              No KYC submissions found.
            </div>
          ) : (
            items.map((u, i) => {
              const open = expanded === u._id;
              return (
                <div
                  key={u._id}
                  style={{
                    borderBottom:
                      i < items.length - 1 ? `1px solid ${divLine}` : "none",
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
                          marginTop: 2,
                        }}
                      >
                        {u.email}
                      </div>
                      <div
                        style={{
                          color: muted,
                          fontSize: "0.68rem",
                          marginTop: 2,
                          textTransform: "capitalize",
                        }}
                      >
                        {u.kyc?.documentType?.replace(/_/g, " ")}
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
                      <KycBadge status={u.kyc?.status} />
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
                          borderTop: `1px solid ${divLine}`,
                          paddingTop: 8,
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
                          Submitted
                        </span>
                        <span style={{ color: muted, fontSize: "0.72rem" }}>
                          {u.kyc?.submittedAt
                            ? fmtDate(u.kyc.submittedAt)
                            : "—"}
                        </span>
                      </div>
                      <div
                        style={{
                          borderTop: `1px solid ${divLine}`,
                          paddingTop: 10,
                        }}
                      >
                        <button
                          onClick={() => setReviewingId(u._id)}
                          style={{
                            padding: "7px 16px",
                            borderRadius: 8,
                            border: "none",
                            background:
                              "linear-gradient(135deg,#d97706,#f59e0b)",
                            color: "#020617",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <Eye style={{ width: 12, height: 12 }} /> Review
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          <div className="thin-scroll" style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 820 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "160px 200px 140px 130px 1fr 110px 70px",
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
                <div>Email</div>
                <div>Doc Type</div>
                <div>Doc Number</div>
                <div>Submitted</div>
                <div>Status</div>
                <div style={{ textAlign: "right" }}>Review</div>
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
                  No KYC submissions found.
                </div>
              ) : (
                items.map((u, i) => (
                  <div
                    key={u._id}
                    className="adm-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "160px 200px 140px 130px 1fr 110px 70px",
                      gap: 8,
                      padding: "12px 18px",
                      borderBottom:
                        i < items.length - 1 ? `1px solid ${divLine}` : "none",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div
                      style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      <div
                        style={{
                          color: textClr,
                          fontWeight: 600,
                          fontSize: "0.8rem",
                        }}
                      >
                        {u.firstName} {u.lastName}
                      </div>
                    </div>
                    <div
                      style={{
                        color: muted,
                        fontSize: "0.72rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {u.email}
                    </div>
                    <div
                      style={{
                        color: muted,
                        fontSize: "0.75rem",
                        textTransform: "capitalize",
                      }}
                    >
                      {u.kyc?.documentType?.replace(/_/g, " ") || "—"}
                    </div>
                    <div
                      style={{
                        color: textClr,
                        fontFamily: "monospace",
                        fontSize: "0.78rem",
                      }}
                    >
                      {u.kyc?.documentNumber || "—"}
                    </div>
                    <div style={{ color: muted, fontSize: "0.75rem" }}>
                      {u.kyc?.submittedAt ? fmtDate(u.kyc.submittedAt) : "—"}
                    </div>
                    <div>
                      <KycBadge status={u.kyc?.status} />
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <button
                        className="action-btn"
                        onClick={() => setReviewingId(u._id)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 7,
                          border: `1px solid ${border}`,
                          background: "transparent",
                          color: "#f59e0b",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Eye style={{ width: 11, height: 11 }} /> View
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
