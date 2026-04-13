import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  BarChart3,
  FileText,
  Settings,
  LayoutDashboard,
  Menu,
  X,
  User,
  Sun,
  Moon,
  LogOut,
  Bell,
  CheckCheck,
  Circle,
  Shield,
  MessageSquare,
  ChevronRight,
  Megaphone,
  Wallet,
  Star,
  Bot,
  Coins,
  UserCog,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import SectionKYC from "./SectionKYC";
import SectionOverview from "./SectionOverview";
import SectionUsers from "./SectionUsers";
import SectionDeposits from "./SectionDeposits";
import SectionWithdrawals from "./SectionWithdrawals";
import SectionTrades from "./SectionTrade";
import SectionTransactions from "./SectionTransactions";
import SectionDepositSettings from "./SectionDepositSettings";
import BottomNav from "./AdminBottomNav";
import NotificationBell from "./NotificationBell";
import SectionSupportTickets from "./SectionSupportTickets";
import SectionAdminNotifications from "./AdminNotificationsPage";
import SectionAnnouncements from "./SectionAnnouncements";
import SectionInvestmentPlans from "./SectionInvestmentPlans";
import SectionUserInvestments from "./SectionUserInvestment";
import SectionCopyTrading from "./SectionCopyTrading";
import SectionPremiumSignals from "./SectionPremiumSignals";
import SectionAIBots from "./SectionAIBots";
import SectionGold from "./SectionGold";
import SectionPromoteUsers from "./SectionPromoteUsers";
import SectionUserDetails from "./SectionUserDetails";
import SectionAdminProfile from "./SectionAdminProfile";

const NAV = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    color: "#f59e0b",
  },
  { key: "users", label: "Users", icon: Users, color: "#60a5fa" },
  { key: "kyc", label: "KYC", icon: Shield, color: "#a78bfa" },
  {
    key: "promote-users",
    label: "Promote ",
    icon: UserCog,
    color: "#f59e0b",
  },
  { key: "tickets", label: "Tickets", icon: MessageSquare, color: "#f59e0b" },
  {
    key: "notifications",
    label: "Notifications",
    icon: Bell,
    color: "#f59e0b",
  },
  {
    key: "investments",
    label: "Investments",
    icon: TrendingUp,
    color: "#34d399",
  },
  {
    key: "user-investments",
    label: "Users Plans",
    icon: Wallet,
    color: "#60a5fa",
  },
  {
    key: "deposits",
    label: "Deposits",
    icon: ArrowDownCircle,
    color: "#34d399",
  },
  {
    key: "withdrawals",
    label: "Withdrawals",
    icon: ArrowUpCircle,
    color: "#f87171",
  },
  { key: "trades", label: "Trades", icon: Activity, color: "#a78bfa" },
  { key: "signals", label: "Signals", icon: Star, color: "#f59e0b" },
  { key: "copy-trading", label: "Copy Trading", icon: Users, color: "#a78bfa" },
  { key: "ai-bots", label: "AI Bots", icon: Bot, color: "#f472b6" },
  { key: "gold", label: "Gold", icon: Coins, color: "#f59e0b" },
  {
    key: "transactions",
    label: "Transactions",
    icon: FileText,
    color: "#60a5fa",
  },
  { key: "announcements", label: "News", icon: Megaphone, color: "#f59e0b" },
  { key: "settings", label: "Settings", icon: Settings, color: "#f59e0b" },
];

export default function AdminDashboard() {
  const { darkMode, setDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [section, setSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // User profile dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleViewUserDetails = (userId) => {
    setSelectedUserId(userId);
    setSection("user-details");
  };

  // Theme tokens
  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const sidebarBg = darkMode ? "rgba(10,16,35,0.98)" : "rgba(255,255,255,0.99)";
  const dropdownBg = darkMode
    ? "rgba(13,20,40,0.99)"
    : "rgba(255,255,255,0.99)";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const sharedProps = {
    darkMode,
    cardBg,
    textClr,
    muted,
    border,
    divLine,
    inputBg,
    showToast,
  };

  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
    "A";

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <style>{`
        @keyframes skPulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dropIn{from{opacity:0;transform:translateY(-8px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .adm-row:hover{background:${darkMode ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)"}!important;}
        .adm-row{transition:background 0.12s;}
        .thin-scroll::-webkit-scrollbar{width:3px;height:3px}
        .thin-scroll::-webkit-scrollbar-thumb{background:rgba(245,158,11,0.25);border-radius:99px}
        .thin-scroll{scrollbar-width:thin;scrollbar-color:rgba(245,158,11,0.25) transparent}
        input:focus,select:focus,textarea:focus{outline:none;border-color:rgba(245,158,11,0.45)!important;}
        .nav-item:hover{background:rgba(245,158,11,0.06)!important;}
        .action-btn:hover{opacity:0.8!important;}
        .notif-item:hover{background:${darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}!important;}
        .notif-item{transition:background 0.12s;cursor:pointer;}
        .prof-item:hover{background:${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"}!important;}
        .prof-item{transition:background 0.12s;cursor:pointer;}
      `}</style>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 94,
            right: 30,
            zIndex: 600,
            padding: "12px 20px",
            borderRadius: 12,
            background:
              toast.type === "error"
                ? "rgba(248,113,113,0.95)"
                : "rgba(52,211,153,0.95)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.85rem",
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            animation: "toastIn 0.25s ease",
            whiteSpace: "nowrap",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 39,
            background: "rgba(0,0,0,0.4)",
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className="thin-scroll"
        style={{
          width: 240,
          flexShrink: 0,
          background: sidebarBg,
          borderRight: `1px solid ${border}`,
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 64,
          height: "calc(100vh - 64px)",
          overflowY: "auto",
          overflowX: "hidden",
          zIndex: 40,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: `1px solid ${divLine}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "linear-gradient(135deg,#d97706,#f59e0b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp style={{ width: 15, height: 15, color: "#020617" }} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: '"Playfair Display",serif',
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  color: textClr,
                }}
              >
                Axion<span style={{ color: "#f59e0b" }}>Trade</span>
              </div>
              <div
                style={{
                  color: "#f59e0b",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                }}
              >
                ADMIN
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
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
              justifyContent: "center",
            }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px 12px" }}>
          {NAV.map((n) => (
            <button
              key={n.key}
              className="nav-item"
              onClick={() => {
                setSection(n.key);
                setSidebarOpen(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                background: section === n.key ? `${n.color}12` : "transparent",
                cursor: "pointer",
                marginBottom: 2,
                transition: "background 0.15s",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background:
                    section === n.key ? `${n.color}20` : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <n.icon
                  style={{
                    width: 14,
                    height: 14,
                    color: section === n.key ? n.color : muted,
                  }}
                />
              </div>
              <span
                style={{
                  color: section === n.key ? n.color : muted,
                  fontWeight: section === n.key ? 700 : 500,
                  fontSize: "0.85rem",
                }}
              >
                {n.label}
              </span>
            </button>
          ))}
        </nav>

        {/* User info */}
        <div
          style={{ padding: "14px 16px", borderTop: `1px solid ${divLine}` }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(245,158,11,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User style={{ width: 14, height: 14, color: "#f59e0b" }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: textClr,
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.firstName} {user?.lastName}
              </div>
              <div
                style={{
                  color: "#f59e0b",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                }}
              >
                {user?.role?.toUpperCase()}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 9,
              border: "1px solid rgba(248,113,113,0.3)",
              background: "rgba(248,113,113,0.06)",
              color: "#f87171",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <LogOut style={{ width: 13, height: 13 }} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main area  */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top bar */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            height: 60,
            background: darkMode
              ? "rgba(2,6,23,0.95)"
              : "rgba(248,250,252,0.95)",
            backdropFilter: "blur(20px)",
            borderBottom: `1px solid ${border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            gap: 12,
          }}
        >
          {/* Left */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                border: `1px solid ${border}`,
                background: "transparent",
                cursor: "pointer",
                color: muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Menu style={{ width: 16, height: 16 }} />
            </button>
            <div>
              <div
                style={{ color: textClr, fontWeight: 700, fontSize: "0.95rem" }}
              >
                {NAV.find((n) => n.key === section)?.label || "Admin"}
              </div>
              <div style={{ color: muted, fontSize: "0.68rem" }}>
                AxionTrade Admin Panel
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Notification Bell */}
            <NotificationBell
              darkMode={darkMode}
              border={border}
              textClr={textClr}
              muted={muted}
              divLine={divLine}
              onViewAll={() => setSection("notifications")}
              showToast={showToast}
            />

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: `1px solid ${border}`,
                background: "transparent",
                cursor: "pointer",
                color: muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {darkMode ? (
                <Sun style={{ width: 14, height: 14 }} />
              ) : (
                <Moon style={{ width: 14, height: 14 }} />
              )}
            </button>

            {/* User profile button + dropdown  */}
            <div ref={profileRef} style={{ position: "relative" }}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 10px 4px 4px",
                  borderRadius: 99,
                  border: `1px solid ${profileOpen ? "rgba(245,158,11,0.4)" : border}`,
                  background: profileOpen
                    ? "rgba(245,158,11,0.06)"
                    : "transparent",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#d97706,#f59e0b)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      color: "#020617",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                    }}
                  >
                    {initials}
                  </span>
                </div>
                <div
                  style={{
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span
                    style={{
                      color: textClr,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      maxWidth: 90,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user?.firstName}
                  </span>
                  <span
                    style={{
                      color: "#f59e0b",
                      fontSize: "0.58rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {user?.role?.toUpperCase()}
                  </span>
                </div>
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    width: 230,
                    background: dropdownBg,
                    border: `1px solid ${border}`,
                    borderRadius: 16,
                    boxShadow: darkMode
                      ? "0 20px 60px rgba(0,0,0,0.7)"
                      : "0 20px 50px rgba(0,0,0,0.13)",
                    zIndex: 200,
                    animation: "dropIn 0.2s ease",
                    overflow: "hidden",
                  }}
                >
                  {/* Profile card */}
                  <div
                    style={{
                      padding: "16px 16px 12px",
                      borderBottom: `1px solid ${divLine}`,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg,#d97706,#f59e0b)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            color: "#020617",
                            fontSize: "0.9rem",
                            fontWeight: 800,
                          }}
                        >
                          {initials}
                        </span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            color: textClr,
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {user?.firstName} {user?.lastName}
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
                          {user?.email}
                        </div>
                        <div style={{ marginTop: 3 }}>
                          <span
                            style={{
                              padding: "1px 8px",
                              borderRadius: 99,
                              background: "rgba(245,158,11,0.12)",
                              color: "#f59e0b",
                              fontSize: "0.62rem",
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                            }}
                          >
                            {user?.role?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div style={{ padding: "6px" }}>
                    {/* Profile */}
                    <div
                      className="prof-item"
                      onClick={() => {
                        setProfileOpen(false);
                        setSection("admin-profile");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            background: "rgba(96,165,250,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <User
                            style={{ width: 13, height: 13, color: "#60a5fa" }}
                          />
                        </div>
                        <div>
                          <div
                            style={{
                              color: textClr,
                              fontSize: "0.8rem",
                              fontWeight: 600,
                            }}
                          >
                            My Profile
                          </div>
                          <div style={{ color: muted, fontSize: "0.68rem" }}>
                            View account details
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        style={{ width: 13, height: 13, color: muted }}
                      />
                    </div>

                    {/* Promote user */}
                    <div
                      className="prof-item"
                      onClick={() => {
                        setProfileOpen(false);
                        setSection("promote-users");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            background: "rgba(167,139,250,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Shield
                            style={{ width: 13, height: 13, color: "#a78bfa" }}
                          />
                        </div>
                        <div>
                          <div
                            style={{
                              color: textClr,
                              fontSize: "0.8rem",
                              fontWeight: 600,
                            }}
                          >
                            Promote User
                          </div>
                          <div style={{ color: muted, fontSize: "0.68rem" }}>
                            Manage user roles
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        style={{ width: 13, height: 13, color: muted }}
                      />
                    </div>

                    {/* User view */}
                    <div
                      className="prof-item"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/dashboard");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            background: "rgba(52,211,153,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <LayoutDashboard
                            style={{ width: 13, height: 13, color: "#34d399" }}
                          />
                        </div>
                        <div>
                          <div
                            style={{
                              color: textClr,
                              fontSize: "0.8rem",
                              fontWeight: 600,
                            }}
                          >
                            User View
                          </div>
                          <div style={{ color: muted, fontSize: "0.68rem" }}>
                            Switch to user dashboard
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        style={{ width: 13, height: 13, color: muted }}
                      />
                    </div>
                  </div>

                  {/* Logout */}
                  <div
                    style={{
                      padding: "6px",
                      borderTop: `1px solid ${divLine}`,
                    }}
                  >
                    <div
                      className="prof-item"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                        navigate("/login");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: "rgba(248,113,113,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <LogOut
                          style={{ width: 13, height: 13, color: "#f87171" }}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            color: "#f87171",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                          }}
                        >
                          Sign Out
                        </div>
                        <div style={{ color: muted, fontSize: "0.68rem" }}>
                          End your session
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* end profile */}
          </div>
        </header>

        {/* Content */}
        <main
          style={{ flex: 1, padding: "24px 20px 40px", overflowY: "auto" }}
          className="thin-scroll"
        >
          {section === "overview" && <SectionOverview {...sharedProps} />}
          {section === "users" && (
            <SectionUsers
              {...sharedProps}
              onViewUserDetails={handleViewUserDetails}
            />
          )}
          {section === "kyc" && <SectionKYC {...sharedProps} />}
          {section === "tickets" && <SectionSupportTickets {...sharedProps} />}
          {section === "notifications" && (
            <SectionAdminNotifications {...sharedProps} />
          )}
          {section === "investments" && (
            <SectionInvestmentPlans {...sharedProps} />
          )}
          {section === "deposits" && <SectionDeposits {...sharedProps} />}
          {section === "withdrawals" && <SectionWithdrawals {...sharedProps} />}
          {section === "trades" && <SectionTrades {...sharedProps} />}
          {section === "transactions" && (
            <SectionTransactions {...sharedProps} />
          )}
          {section === "announcements" && (
            <SectionAnnouncements {...sharedProps} />
          )}
          {section === "settings" && (
            <SectionDepositSettings {...sharedProps} />
          )}
          {section === "user-investments" && (
            <SectionUserInvestments {...sharedProps} />
          )}
          {section === "copy-trading" && (
            <SectionCopyTrading {...sharedProps} />
          )}
          {section === "signals" && <SectionPremiumSignals {...sharedProps} />}
          {section === "ai-bots" && <SectionAIBots {...sharedProps} />}
          {section === "gold" && <SectionGold {...sharedProps} />}
          {section === "promote-users" && (
            <SectionPromoteUsers {...sharedProps} />
          )}
          {section === "user-details" && selectedUserId && (
            <SectionUserDetails
              {...sharedProps}
              userId={selectedUserId}
              onBack={() => setSection("users")}
            />
          )}
          {section === "admin-profile" && <SectionAdminProfile {...sharedProps} />}
        </main>

        <BottomNav section={section} setSection={setSection} />
      </div>
    </div>
  );
}
