import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  User,
  UserCog,
  ChevronDown,
  ChevronUp,
  Loader,
  CheckCircle,
  XCircle,
  AlertTriangle,
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

// Promote Confirmation Modal
function PromoteModal({
  user,
  onClose,
  onConfirm,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
}) {
  const [promoting, setPromoting] = useState(false);

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
            background: "rgba(245,158,11,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <UserCog size={24} color="#f59e0b" />
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
          Promote to Admin?
        </h3>
        <p
          style={{
            color: muted,
            fontSize: "0.85rem",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Are you sure you want to promote{" "}
          <strong style={{ color: textClr }}>
            {user?.firstName} {user?.lastName}
          </strong>{" "}
          to Admin?
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
            <span style={{ color: muted, fontSize: "0.7rem" }}>Email:</span>
            <span style={{ color: textClr, fontSize: "0.8rem" }}>
              {user?.email}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: muted, fontSize: "0.7rem" }}>Current Role:</span>
            <span style={{ color: "#f59e0b", fontSize: "0.8rem", fontWeight: 600 }}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
              paddingTop: 8,
              borderTop: `1px solid ${border}`,
            }}
          >
            <span style={{ color: muted, fontSize: "0.7rem" }}>New Role:</span>
            <span style={{ color: "#34d399", fontSize: "0.8rem", fontWeight: 600 }}>
              ADMIN
            </span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
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
              setPromoting(true);
              await onConfirm(user._id);
              setPromoting(false);
            }}
            disabled={promoting}
            style={{
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg,#f59e0b,#d97706)",
              color: "#020617",
              cursor: promoting ? "not-allowed" : "pointer",
              fontWeight: 600,
              opacity: promoting ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {promoting ? (
              <Loader size={14} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <Shield size={14} />
            )}
            {promoting ? "Promoting..." : "Confirm Promote"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Demote Confirmation Modal
function DemoteModal({
  user,
  onClose,
  onConfirm,
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
}) {
  const [demoting, setDemoting] = useState(false);

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
            background: "rgba(248,113,113,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <AlertTriangle size={24} color="#f87171" />
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
          Demote to User?
        </h3>
        <p
          style={{
            color: muted,
            fontSize: "0.85rem",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Are you sure you want to demote{" "}
          <strong style={{ color: textClr }}>
            {user?.firstName} {user?.lastName}
          </strong>{" "}
          from Admin to regular User?
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
            <span style={{ color: muted, fontSize: "0.7rem" }}>Email:</span>
            <span style={{ color: textClr, fontSize: "0.8rem" }}>
              {user?.email}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: muted, fontSize: "0.7rem" }}>Current Role:</span>
            <span style={{ color: "#f59e0b", fontSize: "0.8rem", fontWeight: 600 }}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
              paddingTop: 8,
              borderTop: `1px solid ${border}`,
            }}
          >
            <span style={{ color: muted, fontSize: "0.7rem" }}>New Role:</span>
            <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600 }}>
              USER
            </span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
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
              setDemoting(true);
              await onConfirm(user._id);
              setDemoting(false);
            }}
            disabled={demoting}
            style={{
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: "#f87171",
              color: "#fff",
              cursor: demoting ? "not-allowed" : "pointer",
              fontWeight: 600,
              opacity: demoting ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {demoting ? (
              <Loader size={14} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <XCircle size={14} />
            )}
            {demoting ? "Demoting..." : "Confirm Demote"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function SectionPromoteUsers({
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  divLine,
  inputBg,
  showToast,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [promoting, setPromoting] = useState(null);
  const [demoting, setDemoting] = useState(null);
  const [acting, setActing] = useState(false);

  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set("search", search);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data?.data || []);
      setPages(res.data?.pagination?.pages || 1);
    } catch {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const promoteUser = async (userId) => {
    setActing(true);
    try {
      await api.patch(`/admin/users/${userId}/promote`);
      showToast("User promoted to Admin successfully", "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to promote user", "error");
    } finally {
      setActing(false);
      setPromoting(null);
    }
  };

  const demoteUser = async (userId) => {
    setActing(true);
    try {
      await api.patch(`/admin/users/${userId}/demote`);
      showToast("Admin demoted to User successfully", "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to demote user", "error");
    } finally {
      setActing(false);
      setDemoting(null);
    }
  };

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return {
        label: "Admin",
        bg: "rgba(245,158,11,0.12)",
        color: "#f59e0b",
        icon: Shield,
      };
    }
    if (role === "superadmin") {
      return {
        label: "Super Admin",
        bg: "rgba(248,113,113,0.12)",
        color: "#f87171",
        icon: ShieldAlert,
      };
    }
    return {
      label: "User",
      bg: "rgba(96,165,250,0.12)",
      color: "#60a5fa",
      icon: User,
    };
  };

  return (
    <div>
      {promoting && (
        <PromoteModal
          user={users.find((u) => u._id === promoting)}
          onClose={() => setPromoting(null)}
          onConfirm={promoteUser}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
        />
      )}

      {demoting && (
        <DemoteModal
          user={users.find((u) => u._id === demoting)}
          onClose={() => setDemoting(null)}
          onConfirm={demoteUser}
          darkMode={darkMode}
          cardBg={cardBg}
          textClr={textClr}
          muted={muted}
          border={border}
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
            Manage Admin Roles
          </h2>
          <p style={{ color: muted, fontSize: "0.75rem", marginTop: 2 }}>
            Promote users to admin or demote admins back to regular users
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 14,
          padding: "10px 14px",
          marginBottom: 14,
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
            placeholder="Search by name or email..."
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
      </div>

      {/* Users Table */}
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
        ) : users.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: muted }}>
            No users found.
          </div>
        ) : isMobile ? (
          // Mobile expandable cards
          users.map((user, i) => {
            const open = expanded === user._id;
            const roleBadge = getRoleBadge(user.role);
            const RoleIcon = roleBadge.icon;
            const canPromote = user.role !== "admin" && user.role !== "superadmin";
            const canDemote = user.role === "admin";

            return (
              <div
                key={user._id}
                style={{
                  borderBottom:
                    i < users.length - 1 ? `1px solid ${divLine}` : "none",
                }}
              >
                <div
                  onClick={() => setExpanded(open ? null : user._id)}
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
                      {user.firstName} {user.lastName}
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
                      {user.email}
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
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: roleBadge.bg,
                        color: roleBadge.color,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <RoleIcon size={10} /> {roleBadge.label}
                    </span>
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderTop: `1px solid ${divLine}`,
                        paddingTop: 8,
                      }}
                    >
                      <span style={{ color: muted, fontSize: "0.72rem" }}>Email</span>
                      <span style={{ color: textClr, fontSize: "0.78rem" }}>
                        {user.email}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderTop: `1px solid ${divLine}`,
                        paddingTop: 8,
                      }}
                    >
                      <span style={{ color: muted, fontSize: "0.72rem" }}>Joined</span>
                      <span style={{ color: textClr, fontSize: "0.78rem" }}>
                        {fmtDate(user.createdAt)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderTop: `1px solid ${divLine}`,
                        paddingTop: 8,
                      }}
                    >
                      <span style={{ color: muted, fontSize: "0.72rem" }}>Status</span>
                      <Badge status={user.status} />
                    </div>
                    <div
                      style={{
                        borderTop: `1px solid ${divLine}`,
                        paddingTop: 10,
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      {canPromote && (
                        <button
                          onClick={() => setPromoting(user._id)}
                          disabled={acting}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: `1px solid rgba(245,158,11,0.35)`,
                            background: "rgba(245,158,11,0.08)",
                            color: "#f59e0b",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <UserCog size={12} /> Promote to Admin
                        </button>
                      )}
                      {canDemote && (
                        <button
                          onClick={() => setDemoting(user._id)}
                          disabled={acting}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: `1px solid rgba(248,113,113,0.35)`,
                            background: "rgba(248,113,113,0.08)",
                            color: "#f87171",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <User size={12} /> Demote to User
                        </button>
                      )}
                      {user.role === "superadmin" && (
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: "rgba(100,116,139,0.08)",
                            color: muted,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          Cannot modify Super Admin
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Desktop table
          <div className="thin-scroll" style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 760 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 180px 120px 100px 140px",
                  gap: 12,
                  padding: "12px 18px",
                  color: muted,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  borderBottom: `1px solid ${divLine}`,
                }}
              >
                <div>User</div>
                <div>Email</div>
                <div>Role</div>
                <div>Status</div>
                <div style={{ textAlign: "right" }}>Actions</div>
              </div>

              {users.map((user, i) => {
                const roleBadge = getRoleBadge(user.role);
                const RoleIcon = roleBadge.icon;
                const canPromote = user.role !== "admin" && user.role !== "superadmin";
                const canDemote = user.role === "admin";

                return (
                  <div
                    key={user._id}
                    className="adm-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 180px 120px 100px 140px",
                      gap: 12,
                      padding: "12px 18px",
                      borderBottom:
                        i < users.length - 1 ? `1px solid ${divLine}` : "none",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: textClr,
                          fontWeight: 600,
                          fontSize: "0.82rem",
                        }}
                      >
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                    <div
                      style={{
                        color: muted,
                        fontSize: "0.75rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.email}
                    </div>
                    <div>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: roleBadge.bg,
                          color: roleBadge.color,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <RoleIcon size={10} /> {roleBadge.label}
                      </span>
                    </div>
                    <div>
                      <Badge status={user.status} />
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      {canPromote && (
                        <button
                          onClick={() => setPromoting(user._id)}
                          disabled={acting}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: `1px solid rgba(245,158,11,0.35)`,
                            background: "rgba(245,158,11,0.08)",
                            color: "#f59e0b",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <UserCog size={11} /> Promote
                        </button>
                      )}
                      {canDemote && (
                        <button
                          onClick={() => setDemoting(user._id)}
                          disabled={acting}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: `1px solid rgba(248,113,113,0.35)`,
                            background: "rgba(248,113,113,0.08)",
                            color: "#f87171",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <User size={11} /> Demote
                        </button>
                      )}
                      {user.role === "superadmin" && (
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            background: "rgba(100,116,139,0.08)",
                            color: muted,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          }}
                        >
                          Super Admin
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
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