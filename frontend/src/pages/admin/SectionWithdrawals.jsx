// frontend/src/pages/admin/SectionWithdrawals.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader,
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

export default function SectionWithdrawals({
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
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: null, id: null });
  const [modalLoading, setModalLoading] = useState(false);

  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: "withdrawal",
        page,
        limit: 20,
      });
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

  const approve = async (id, txHash) => {
    setModalLoading(true);
    try {
      await api.post(`/admin/transactions/${id}/approve-withdrawal`, {
        txHash,
        note: "Processed by admin",
      });
      showToast("Withdrawal approved", "success");
      load();
      setModal({ isOpen: false, type: null, id: null });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const reject = async (id, reason) => {
    setModalLoading(true);
    try {
      await api.post(`/admin/transactions/${id}/reject-withdrawal`, {
        note: reason,
      });
      showToast("Withdrawal rejected — funds returned", "success");
      load();
      setModal({ isOpen: false, type: null, id: null });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setModalLoading(false);
    }
  };

  // Approve Modal with loading state
  const ApproveModal = ({ isOpen, onClose, onConfirm, id }) => {
    const [txHash, setTxHash] = useState("");

    if (!isOpen) return null;

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
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
            Approve Withdrawal
          </h3>
          <p style={{ color: muted, fontSize: "0.85rem", marginBottom: 16 }}>
            Enter transaction hash (optional):
          </p>
          <input
            type="text"
            placeholder="0x..."
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            disabled={modalLoading}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              border: `1px solid ${border}`,
              background: inputBg,
              color: textClr,
              fontSize: "0.85rem",
              marginBottom: 20,
              outline: "none",
              opacity: modalLoading ? 0.6 : 1,
            }}
          />
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={onClose}
              disabled={modalLoading}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: "transparent",
                color: textClr,
                cursor: modalLoading ? "not-allowed" : "pointer",
                opacity: modalLoading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(id, txHash)}
              disabled={modalLoading}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 8,
                border: "none",
                background: "#34d399",
                color: "#fff",
                fontWeight: 600,
                cursor: modalLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                opacity: modalLoading ? 0.7 : 1,
              }}
            >
              {modalLoading ? (
                <>
                  <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                  Approving...
                </>
              ) : (
                "Approve"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Reject Modal with loading state
  const RejectModal = ({ isOpen, onClose, onConfirm, id }) => {
    const [reason, setReason] = useState("");

    if (!isOpen) return null;

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
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
            Reject Withdrawal
          </h3>
          <p style={{ color: muted, fontSize: "0.85rem", marginBottom: 16 }}>
            Reason for rejection (optional):
          </p>
          <textarea
            rows={3}
            placeholder="Enter reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={modalLoading}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              border: `1px solid ${border}`,
              background: inputBg,
              color: textClr,
              fontSize: "0.85rem",
              marginBottom: 20,
              outline: "none",
              resize: "vertical",
              opacity: modalLoading ? 0.6 : 1,
            }}
          />
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={onClose}
              disabled={modalLoading}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: "transparent",
                color: textClr,
                cursor: modalLoading ? "not-allowed" : "pointer",
                opacity: modalLoading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(id, reason)}
              disabled={modalLoading}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 8,
                border: "none",
                background: "#f87171",
                color: "#fff",
                fontWeight: 600,
                cursor: modalLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                opacity: modalLoading ? 0.7 : 1,
              }}
            >
              {modalLoading ? (
                <>
                  <Loader style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                  Rejecting...
                </>
              ) : (
                "Reject"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Action buttons
  const ActionButtons = ({ d }) =>
    d.status === "pending" ? (
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        <button
          className="action-btn"
          onClick={() => setModal({ isOpen: true, type: "approve", id: d._id })}
          disabled={acting === d._id}
          style={{
            padding: "5px 10px",
            borderRadius: 6,
            border: "1px solid rgba(52,211,153,0.35)",
            background: "rgba(52,211,153,0.08)",
            color: "#34d399",
            fontSize: "0.72rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          {acting === d._id ? (
            <>
              <Loader style={{ width: 10, height: 10, animation: "spin 1s linear infinite" }} />
              ...
            </>
          ) : (
            <>
              <CheckCircle style={{ width: 10, height: 10 }} /> Approve
            </>
          )}
        </button>
        <button
          className="action-btn"
          onClick={() => setModal({ isOpen: true, type: "reject", id: d._id })}
          disabled={acting === d._id}
          style={{
            padding: "5px 10px",
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
            <>
              <Loader style={{ width: 10, height: 10, animation: "spin 1s linear infinite" }} />
              ...
            </>
          ) : (
            <>
              <XCircle style={{ width: 10, height: 10 }} /> Reject
            </>
          )}
        </button>
      </div>
    ) : null;

  // Add spin animation style
  const spinStyle = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  return (
    <div>
      <style>{spinStyle}</style>
      
      {/* Approve Modal */}
      <ApproveModal
        isOpen={modal.isOpen && modal.type === "approve"}
        onClose={() => setModal({ isOpen: false, type: null, id: null })}
        onConfirm={approve}
        id={modal.id}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={modal.isOpen && modal.type === "reject"}
        onClose={() => setModal({ isOpen: false, type: null, id: null })}
        onConfirm={reject}
        id={modal.id}
      />

      {/* Filter tabs */}
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
              border: `1px solid ${filter === f ? "#f87171" : border}`,
              background:
                filter === f ? "rgba(248,113,113,0.1)" : "transparent",
              color: filter === f ? "#f87171" : muted,
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
                ? "Processed"
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

      {/* Card / Table */}
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
          Array.from({ length: 5 }).map((_, i) => (
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
          // ... rest of your mobile rendering code stays the same
          items.length === 0 ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: muted,
                fontSize: "0.85rem",
              }}
            >
              No withdrawals found.
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
                  {/* Card header row */}
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
                            ? "Processed"
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
                          label: "To Address",
                          value: (
                            <span
                              style={{
                                color: muted,
                                fontSize: "0.68rem",
                                fontFamily: "monospace",
                                wordBreak: "break-all",
                                whiteSpace: "normal",
                                textAlign: "right",
                              }}
                            >
                              {d.address || "—"}
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
          /* DESKTOP: table (keep your existing desktop code) */
          <div className="thin-scroll" style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 820 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "130px 180px 90px 90px 1fr 100px 160px",
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
                <div>To Address</div>
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
                  No withdrawals found.
                </div>
              ) : (
                items.map((d, i) => (
                  <div
                    key={d._id}
                    className="adm-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "130px 180px 90px 90px 1fr 100px 160px",
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
                    <div
                      style={{
                        color: muted,
                        fontFamily: "monospace",
                        fontSize: "0.72rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 180,
                      }}
                    >
                      {d.address || "—"}
                    </div>
                    <div>
                      <Badge
                        status={d.status}
                        label={
                          d.status === "completed"
                            ? "Processed"
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