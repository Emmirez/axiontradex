import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Edit3,
  CheckCircle,
  XCircle,
  X,
  ChevronDown,
  ChevronUp,
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

//  Edit modal (unchanged)
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
        zIndex: 400,
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
          padding: "26px",
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
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
            Edit Deposit
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: muted,
              cursor: "pointer",
            }}
          >
            <X style={{ width: 16, height: 16 }} />
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
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
              style={{ ...iStyle, cursor: "pointer" }}
            >
              {["pending", "completed", "failed", "cancelled"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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
              CURRENCY
            </label>
            <select
              value={form.currency}
              onChange={(e) =>
                setForm((f) => ({ ...f, currency: e.target.value }))
              }
              style={{ ...iStyle, cursor: "pointer" }}
            >
              {["USDT", "BTC", "ETH", "BNB", "SOL", "USD"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        {[
          { key: "amount", label: "AMOUNT", type: "number", ph: "0.00" },
          { key: "txHash", label: "TX HASH", type: "text", ph: "0x..." },
          {
            key: "network",
            label: "NETWORK",
            type: "text",
            ph: "TRC20, ERC20...",
          },
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
              padding: "10px",
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
              padding: "10px",
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

function RejectModal({
  onClose,
  onConfirm,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  inputBg,
}) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const iStyle = {
    width: "100%",
    padding: "9px 11px",
    borderRadius: 8,
    border: `1px solid ${border}`,
    background: inputBg,
    color: textClr,
    fontSize: "0.85rem",
    boxSizing: "border-box",
    outline: "none",
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(note);
      onClose();
    } catch (err) {
      // Error already handled in onConfirm
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
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
          padding: "26px",
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
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
            Reject Deposit
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: muted,
              cursor: "pointer",
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

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
            Reason for rejection (optional)
          </label>
          <textarea
            rows={3}
            style={{ ...iStyle, resize: "vertical" }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter rejection reason..."
          />
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px",
              borderRadius: 9,
              border: `1px solid ${border}`,
              background: "transparent",
              color: textClr,
              fontWeight: 600,
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
              borderRadius: 9,
              border: "none",
              background: "#f87171",
              color: "#fff",
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Rejecting..." : "Reject Deposit"}
          </button>
        </div>
      </div>
    </div>
  );
}

//  Main component
export default function SectionDeposits({
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
  const [filter, setFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [acting, setActing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: "deposit", page, limit: 20 });
      if (filter !== "all") params.set("status", filter);
      const res = await api.get(`/admin/transactions?${params}`);
      setItems(res.data?.data || []);
      setPages(res.data?.pagination?.pages || 1);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id) => {
    setActing(id);
    try {
      await api.post(`/admin/transactions/${id}/approve-deposit`, {
        note: "Approved by admin",
      });
      showToast("Deposit approved — balance credited");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setActing(null);
    }
  };

  const reject = async (id) => {
    setRejecting(id);
  };

  const confirmReject = async (note) => {
    const id = rejecting;
    setActing(id);
    try {
      await api.post(`/admin/transactions/${id}/reject-deposit`, { note });
      showToast("Deposit rejected");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
      throw err;
    } finally {
      setActing(null);
      setRejecting(null);
    }
  };

  const saveEdit = async (id, form) => {
    await api.patch(`/admin/transactions/${id}`, form);
    showToast("Deposit updated");
    setEditing(null);
    load();
  };

  //  Shared action buttons
  const ActionButtons = ({ d }) => (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      <button
        className="action-btn"
        onClick={() => setEditing(d)}
        style={{
          padding: "5px 8px",
          borderRadius: 6,
          border: `1px solid ${border}`,
          background: "transparent",
          color: muted,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: "0.72rem",
          fontWeight: 600,
        }}
      >
        <Edit3 style={{ width: 11, height: 11 }} /> Edit
      </button>
      {d.status === "pending" && (
        <>
          
          <button
            className="action-btn"
            onClick={() => approve(d._id)}
            disabled={acting === d._id}
            style={{
              padding: "5px 8px",
              borderRadius: 6,
              border: "1px solid rgba(52,211,153,0.35)",
              background: "rgba(52,211,153,0.08)",
              color: "#34d399",
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: acting === d._id ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 3,
              opacity: acting === d._id ? 0.7 : 1,
            }}
          >
            {acting === d._id ? (
              // ✅ spinner instead of "…"
              <svg
                style={{
                  width: 10,
                  height: 10,
                  animation: "spin 1s linear infinite",
                }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            ) : (
              <>
                <CheckCircle style={{ width: 10, height: 10 }} /> Approve
              </>
            )}
          </button>
          <button
            className="action-btn"
            onClick={() => reject(d._id)}
            disabled={acting === d._id}
            style={{
              padding: "5px 8px",
              borderRadius: 6,
              border: "1px solid rgba(248,113,113,0.35)",
              background: "rgba(248,113,113,0.08)",
              color: "#f87171",
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            {acting === d._id ? (
              "…"
            ) : (
              <>
                <XCircle style={{ width: 10, height: 10 }} /> Reject
              </>
            )}
          </button>
        </>
      )}
    </div>
  );

  return (
    <div>
      {/*  Filter tabs  */}
      <div
        style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}
      >
        {["pending", "completed", "failed", "all"].map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: `1px solid ${filter === f ? "#f59e0b" : border}`,
              background: filter === f ? "rgba(245,158,11,0.1)" : "transparent",
              color: filter === f ? "#f59e0b" : muted,
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.15s",
            }}
          >
            {f === "all"
              ? "All"
              : f === "completed"
                ? "Approved"
                : f === "failed"
                  ? "Rejected"
                  : "Pending"}
          </button>
        ))}
        <button
          onClick={load}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: `1px solid ${border}`,
            background: "transparent",
            color: muted,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: "0.75rem",
            marginLeft: "auto",
          }}
        >
          <RefreshCw style={{ width: 11, height: 11 }} /> Refresh
        </button>
      </div>

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

      {rejecting && (
        <RejectModal
          onClose={() => setRejecting(null)}
          onConfirm={confirmReject}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
          inputBg={inputBg}
        />
      )}

      {/*  Card / Table  */}
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
        ) : /*  MOBILE: expandable cards  */
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
              No deposits found.
            </div>
          ) : (
            items.map((d, i) => {
              const open = expanded === d._id;
              return (
                <div
                  key={d._id}
                  style={{
                    borderBottom:
                      i < items.length - 1 ? `1px solid ${divLine}` : "none",
                  }}
                >
                  {/* Row header */}
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
                          color: muted,
                          fontSize: "0.7rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {d.user?.email}
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
                        })}{" "}
                        <span style={{ color: muted, fontSize: "0.72rem" }}>
                          {d.currency}
                        </span>
                      </span>
                      <Badge
                        status={d.status}
                        label={
                          d.status === "completed"
                            ? "Approved"
                            : d.status === "failed"
                              ? "Rejected"
                              : d.status
                        }
                      />
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
                          label: "Date",
                          value: (
                            <span style={{ color: muted, fontSize: "0.78rem" }}>
                              {fmtDate(d.createdAt)}
                            </span>
                          ),
                        },
                        {
                          label: "Network",
                          value: (
                            <span style={{ color: muted, fontSize: "0.78rem" }}>
                              {d.network || "—"}
                            </span>
                          ),
                        },
                        {
                          label: "Tx Hash",
                          value: (
                            <span
                              style={{
                                color: muted,
                                fontSize: "0.68rem",
                                fontFamily: "monospace",
                                wordBreak: "break-all",
                                whiteSpace: "normal",
                              }}
                            >
                              {d.txHash || "—"}
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
                        <ActionButtons d={d} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          /* DESKTOP: table */
          <div className="thin-scroll" style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 820 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "130px 180px 90px 90px 130px 100px 160px",
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
                <div>Amount</div>
                <div>Currency</div>
                <div>Network</div>
                <div>Status</div>
                <div style={{ textAlign: "right" }}>Actions</div>
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
                  No deposits found.
                </div>
              ) : (
                items.map((d, i) => (
                  <div
                    key={d._id}
                    className="adm-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "130px 180px 90px 90px 130px 100px 160px",
                      gap: 8,
                      padding: "12px 18px",
                      borderBottom:
                        i < items.length - 1 ? `1px solid ${divLine}` : "none",
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
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 170,
                        }}
                      >
                        {d.user?.firstName} {d.user?.lastName}
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
                        {d.user?.email}
                      </div>
                    </div>
                    <div
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
                    </div>
                    <div
                      style={{
                        color: muted,
                        fontFamily: "monospace",
                        fontSize: "0.78rem",
                      }}
                    >
                      {d.currency}
                    </div>
                    <div style={{ color: muted, fontSize: "0.72rem" }}>
                      {d.network || "—"}
                    </div>
                    <div>
                      <Badge
                        status={d.status}
                        label={
                          d.status === "completed"
                            ? "Approved"
                            : d.status === "failed"
                              ? "Rejected"
                              : d.status
                        }
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        justifyContent: "flex-end",
                      }}
                    >
                      <ActionButtons d={d} />
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
