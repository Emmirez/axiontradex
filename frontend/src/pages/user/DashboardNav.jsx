import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  TrendingUp,
  Bell,
  Sun,
  Moon,
  User,
  Shield,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ArrowLeftRight,
  LineChart,
  Users,
  Bot,
  FlaskConical,
  Globe2,
  Star,
  BarChart3,
  Bitcoin,
  Building2,
  Wallet,
  Download,
  Upload,
  Repeat2,
  Settings,
  Share2,
  Headphones,
  Lock,
  FileCheck,
  CheckCheck,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  Circle,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/apiService";
import { useTranslation } from "react-i18next";

const iconMap = {
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  Shield,
  Star,
  Settings,
  Share2,
  Bell,
};

const DIRECT_LINKS = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    color: "#f59e0b",
  },
  {
    label: "Transactions",
    icon: ArrowLeftRight,
    path: "/transactions",
    color: "#60a5fa",
  },
  { label: "Trade", icon: LineChart, path: "/trade", color: "#34d399" },
];

const DROPDOWN_GROUPS = [
  {
    label: "Strategies",
    color: "#a78bfa",
    items: [
      {
        label: "Copy Trading",
        icon: Users,
        path: "/copy-trader",
        color: "#a78bfa",
      },
      { label: "AI Trading Bots", icon: Bot, path: "/bots", color: "#f472b6" },
      {
        label: "Demo Trading",
        icon: FlaskConical,
        path: "/demo",
        color: "#34d399",
      },
      {
        label: "Premium Signals",
        icon: Star,
        path: "/signals",
        color: "#f59e0b",
      },
    ],
  },
  {
    label: "Investments",
    color: "#34d399",
    items: [
      {
        label: "Stock Market",
        icon: BarChart3,
        path: "/stocks-market",
        color: "#34d399",
      },
      {
        label: "Cryptocurrency",
        icon: Bitcoin,
        path: "/crypto-market",
        color: "#f59e0b",
      },
      {
        label: "Gold",
        icon: TrendingUp,
        path: "/gold-trade",
        color: "#f59e0b",
      },
      {
        label: "Real Estate",
        icon: Building2,
        path: "/real-estate",
        color: "#60a5fa",
      },
    ],
  },
  {
    label: "Finance",
    color: "#60a5fa",
    items: [
      {
        label: "Deposit Funds",
        icon: Download,
        path: "/deposit",
        color: "#34d399",
      },
      {
        label: "Withdraw Funds",
        icon: Upload,
        path: "/withdraw",
        color: "#f87171",
      },
      {
        label: "Swap Currency",
        icon: Repeat2,
        path: "/swap",
        color: "#a78bfa",
      },
    ],
  },
  {
    label: "Account",
    color: "#f472b6",
    items: [
      {
        label: "Portfolio",
        icon: BarChart3,
        path: "/portfolio",
        color: "#34d399",
      },
      {
        label: "Referral",
        icon: Share2,
        path: "/referral",
        color: "#f59e0b",
        badge: "9%",
      },
    ],
  },
];

export default function DashboardNav() {
  const { darkMode, setDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);
  const settingsRef = useRef(null);
  const notifRef = useRef(null);

  const DIRECT_LINKS = [
    {
      label: t("dashboard"),
      icon: LayoutDashboard,
      path: "/dashboard",
      color: "#f59e0b",
    },
    {
      label: t("transactions"),
      icon: ArrowLeftRight,
      path: "/transactions",
      color: "#60a5fa",
    },
    {
      label: t("trade_nav"),
      icon: LineChart,
      path: "/trade",
      color: "#34d399",
    },
  ];

  const DROPDOWN_GROUPS = [
    {
      label: t("strategies"),
      color: "#a78bfa",
      items: [
        {
          label: t("copy_trading"),
          icon: Users,
          path: "/copy-trader",
          color: "#a78bfa",
        },
        {
          label: t("ai_trading_bots"),
          icon: Bot,
          path: "/bots",
          color: "#f472b6",
        },
        {
          label: t("demo_trading"),
          icon: FlaskConical,
          path: "/demo",
          color: "#34d399",
        },
        {
          label: t("premium_signals"),
          icon: Star,
          path: "/signals",
          color: "#f59e0b",
        },
      ],
    },
    {
      label: t("investments"),
      color: "#34d399",
      items: [
        {
          label: t("stock_market"),
          icon: BarChart3,
          path: "/stocks-market",
          color: "#34d399",
        },
        {
          label: t("cryptocurrency_nav"),
          icon: Bitcoin,
          path: "/crypto-market",
          color: "#f59e0b",
        },
        {
          label: t("gold_nav"),
          icon: TrendingUp,
          path: "/gold-trade",
          color: "#f59e0b",
        },
        {
          label: t("real_estate"),
          icon: Building2,
          path: "/real-estate",
          color: "#60a5fa",
        },
      ],
    },
    {
      label: t("finance"),
      color: "#60a5fa",
      items: [
        {
          label: t("deposit_funds"),
          icon: Download,
          path: "/deposit",
          color: "#34d399",
        },
        {
          label: t("withdraw_funds"),
          icon: Upload,
          path: "/withdraw",
          color: "#f87171",
        },
        {
          label: t("swap_currency"),
          icon: Repeat2,
          path: "/swap",
          color: "#a78bfa",
        },
      ],
    },
    {
      label: t("account"),
      color: "#f472b6",
      items: [
        {
          label: t("portfolio"),
          icon: BarChart3,
          path: "/portfolio",
          color: "#34d399",
        },
        {
          label: t("referral"),
          icon: Share2,
          path: "/referral",
          color: "#f59e0b",
          badge: "9%",
        },
      ],
    },
  ];

  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const divLine = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const dropBg = darkMode ? "rgba(10,16,35,0.99)" : "rgba(255,255,255,0.99)";
  const drawerBg = darkMode
    ? "linear-gradient(180deg,rgba(5,10,28,0.99) 0%,rgba(8,14,32,0.99) 100%)"
    : "linear-gradient(180deg,rgba(252,253,255,0.99) 0%,rgba(247,249,252,0.99) 100%)";

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications", { params: { limit: 5 } });
      setNotifications(res.data?.data?.notifications || []);
      setUnreadCount(res.data?.data?.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const isActive = (path) => location.pathname === path;

  // Close dropdowns on outside click
  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target))
        setSettingsOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setExpandedGroup(null);
  }, [location.pathname]);

  const SETTINGS_ITEMS = [
    {
      label: t("update_profile"),
      icon: User,
      path: "/profile",
      color: "#f59e0b",
      desc: t("edit_personal_info"),
    },
    {
      label: t("change_password"),
      icon: Lock,
      path: "/password",
      color: "#60a5fa",
      desc: t("update_your_password"),
    },
    {
      label: t("kyc_verification"),
      icon: FileCheck,
      path: "/kyc",
      color: "#34d399",
      desc: t("verify_your_identity"),
    },
  ];

  return (
    <>
      <style>{`
        @keyframes dropIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .nav-icon-btn{width:36px;height:36px;border-radius:50%;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background 0.15s;}
        .nav-icon-btn:hover{background:rgba(245,158,11,0.08);}
        .dd-row{width:100%;display:flex;align-items:center;padding:10px 12px;border-radius:10px;border:none;background:transparent;cursor:pointer;transition:background 0.15s;}
        .dd-row:hover{background:rgba(245,158,11,0.06);}
        .notif-item{transition:background 0.12s;cursor:pointer;}
        .notif-item:hover{background:rgba(245,158,11,0.04)!important;}
        .drawer-direct-link{display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:12px;margin-bottom:2px;text-decoration:none;font-size:0.875rem;font-weight:600;transition:all 0.18s;position:relative;overflow:hidden;}
        .drawer-direct-link:hover .dl-label{color:#f59e0b!important;}
        .drawer-direct-link:hover{background:rgba(245,158,11,0.07)!important;}
        .drawer-group-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:9px 12px;border-radius:12px;border:none;font-size:0.875rem;font-weight:600;cursor:pointer;transition:all 0.18s;}
        .drawer-group-btn:hover{background:rgba(255,255,255,0.04)!important;}
        .drawer-sub-link{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:9px;margin-bottom:1px;text-decoration:none;font-size:0.82rem;font-weight:500;transition:all 0.16s;}
        .drawer-sub-link:hover{background:rgba(245,158,11,0.07)!important;}
        .drawer-sub-link:hover .sl-label{color:#f59e0b!important;}
        .drawer-support-link{display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:12px;text-decoration:none;font-size:0.875rem;font-weight:600;transition:all 0.18s;}
        .drawer-support-link:hover{background:rgba(245,158,11,0.07)!important;}
        .drawer-scroll::-webkit-scrollbar{width:3px;}
        .drawer-scroll::-webkit-scrollbar-thumb{background:rgba(245,158,11,0.25);border-radius:99px;}
        .thin-scroll::-webkit-scrollbar{width:3px;}
        .thin-scroll::-webkit-scrollbar-thumb{background:rgba(245,158,11,0.2);border-radius:99px;}
      `}</style>

      {/* HEADER */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 64,
          background: darkMode ? "rgba(2,6,23,0.92)" : "rgba(248,250,252,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            className="nav-icon-btn"
            onClick={() => setDrawerOpen((o) => !o)}
            style={{ border: `1px solid ${border}`, color: mutedClr }}
          >
            {drawerOpen ? (
              <X style={{ width: 15, height: 15 }} />
            ) : (
              <Menu style={{ width: 15, height: 15 }} />
            )}
          </button>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(135deg,#d97706,#f59e0b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp style={{ width: 16, height: 16, color: "#020617" }} />
            </div>
            <span
              style={{
                fontFamily: '"Playfair Display",serif',
                fontWeight: 700,
                fontSize: "1.05rem",
                color: textClr,
              }}
            >
              Axion<span style={{ color: "#f59e0b" }}>Trade</span><span style={{ color: darkMode ? "#ffffff" : "#0f172a" }}>X</span>
            </span>
          </Link>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Dark mode */}
          <button
            className="nav-icon-btn"
            style={{ border: `1px solid ${border}`, color: mutedClr }}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? (
              <Sun style={{ width: 15, height: 15 }} />
            ) : (
              <Moon style={{ width: 15, height: 15 }} />
            )}
          </button>

          {/* Notification bell */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              className="nav-icon-btn"
              onClick={() => {
                setNotifOpen((o) => !o);
                setDropdownOpen(false);
                setSettingsOpen(false);
              }}
              style={{
                border: `1px solid ${notifOpen ? "rgba(245,158,11,0.4)" : border}`,
                background: notifOpen ? "rgba(245,158,11,0.08)" : "transparent",
                color: notifOpen ? "#f59e0b" : mutedClr,
                position: "relative",
              }}
            >
              <Bell style={{ width: 15, height: 15 }} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#f87171",
                    border: `2px solid ${darkMode ? "rgba(2,6,23,0.92)" : "rgba(248,250,252,0.95)"}`,
                  }}
                />
              )}
            </button>
            {notifOpen && (
              <div
                style={{
                  position: "fixed",
                  top: 70,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "min(360px,94vw)",
                  background: dropBg,
                  border: `1px solid ${border}`,
                  borderRadius: 16,
                  boxShadow: darkMode
                    ? "0 20px 60px rgba(0,0,0,0.6)"
                    : "0 20px 50px rgba(0,0,0,0.13)",
                  zIndex: 100,
                  animation: "dropIn 0.18s ease",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px 10px",
                    borderBottom: `1px solid ${divLine}`,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <span
                      style={{
                        color: textClr,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      {t("notifications")}
                    </span>
                    {unreadCount > 0 && (
                      <span
                        style={{
                          padding: "1px 7px",
                          borderRadius: 99,
                          background: "rgba(248,113,113,0.15)",
                          color: "#f87171",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                        }}
                      >
                        {unreadCount} {t("new")}
                      </span>
                    )}
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#f59e0b",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          padding: 0,
                        }}
                      >
                        <CheckCheck style={{ width: 11, height: 11 }} /> All
                        {t("all_read")}
                      </button>
                    )}
                    <button
                      onClick={() => setNotifOpen(false)}
                      style={{
                        background: "none",
                        border: "none",
                        color: mutedClr,
                        cursor: "pointer",
                        padding: 2,
                        display: "flex",
                      }}
                    >
                      <X style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div
                  style={{ maxHeight: 300, overflowY: "auto" }}
                  className="thin-scroll"
                >
                  {notifications.length === 0 ? (
                    <div
                      style={{
                        padding: "24px",
                        textAlign: "center",
                        color: mutedClr,
                        fontSize: "0.78rem",
                      }}
                    >
                      {t("no_notifications")}
                    </div>
                  ) : (
                    notifications.map((n, i) => {
                      const Icon = iconMap[n.icon] || Bell;
                      return (
                        <div
                          key={n._id}
                          className="notif-item"
                          onClick={() => !n.read && markOneRead(n._id)}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            padding: "11px 14px",
                            borderBottom:
                              i < notifications.length - 1
                                ? `1px solid ${divLine}`
                                : "none",
                            background: !n.read
                              ? darkMode
                                ? "rgba(245,158,11,0.03)"
                                : "rgba(245,158,11,0.025)"
                              : "transparent",
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 9,
                              background: `${n.iconColor}15`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              marginTop: 1,
                            }}
                          >
                            <Icon
                              style={{
                                width: 13,
                                height: 13,
                                color: n.iconColor,
                              }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 6,
                                marginBottom: 2,
                              }}
                            >
                              <span
                                style={{
                                  color: textClr,
                                  fontWeight: n.read ? 500 : 700,
                                  fontSize: "0.78rem",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {n.title}
                              </span>
                              <span
                                style={{
                                  color: mutedClr,
                                  fontSize: "0.64rem",
                                  flexShrink: 0,
                                }}
                              >
                                {n.time}
                              </span>
                            </div>
                            <div
                              style={{
                                color: mutedClr,
                                fontSize: "0.71rem",
                                lineHeight: 1.4,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {n.body}
                            </div>
                          </div>
                          {!n.read && (
                            <div
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#f59e0b",
                                flexShrink: 0,
                                marginTop: 5,
                              }}
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div
                  style={{
                    padding: "9px 14px",
                    textAlign: "center",
                    borderTop: `1px solid ${divLine}`,
                  }}
                >
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      navigate("/notifications");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#f59e0b",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {t("view_all_notifications")} →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User dropdown */}
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              onClick={() => {
                setDropdownOpen((o) => !o);
                setSettingsOpen(false);
                setNotifOpen(false);
              }}
              className="nav-icon-btn"
              style={{
                border: `1px solid ${dropdownOpen ? "rgba(245,158,11,0.4)" : border}`,
                background: dropdownOpen
                  ? "rgba(245,158,11,0.08)"
                  : "transparent",
                gap: 6,
                display: "flex",
                alignItems: "center",
              }}
            >
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "rgba(245,158,11,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User style={{ width: 13, height: 13, color: "#f59e0b" }} />
                </div>
                {/* Small dropdown indicator */}
                <div
                  style={{
                    position: "absolute",
                    bottom: -3,
                    right: -3,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: darkMode
                      ? "rgba(2,6,23,0.92)"
                      : "rgba(248,250,252,0.95)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronDown
                    style={{
                      width: 8,
                      height: 8,
                      color: "#f59e0b",
                      transition: "transform 0.2s",
                      transform: dropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                </div>
              </div>
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  minWidth: 220,
                  background: dropBg,
                  border: `1px solid ${border}`,
                  borderRadius: 16,
                  overflow: "hidden",
                  zIndex: 100,
                  boxShadow: darkMode
                    ? "0 20px 60px rgba(0,0,0,0.6)"
                    : "0 20px 50px rgba(0,0,0,0.12)",
                  animation: "dropIn 0.18s ease",
                }}
              >
                {/* User card */}
                <div
                  style={{
                    padding: "12px 14px",
                    borderBottom: `1px solid ${divLine}`,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "rgba(245,158,11,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <User
                        style={{ width: 14, height: 14, color: "#f59e0b" }}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          color: textClr,
                          fontWeight: 700,
                          fontSize: "0.875rem",
                        }}
                      >
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div style={{ color: mutedClr, fontSize: "0.72rem" }}>
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "6px" }}>
                  <button
                    className="dd-row"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/profile");
                    }}
                    style={{ color: textClr, justifyContent: "space-between" }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: "rgba(245,158,11,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <User
                          style={{ width: 13, height: 13, color: "#f59e0b" }}
                        />
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                        {t("profile_settings")}
                      </span>
                    </div>
                    <ChevronRight
                      style={{ width: 14, height: 14, color: mutedClr }}
                    />
                  </button>
                  <button
                    className="dd-row"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/kyc");
                    }}
                    style={{ color: textClr, justifyContent: "space-between" }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: "rgba(52,211,153,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Shield
                          style={{ width: 13, height: 13, color: "#34d399" }}
                        />
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: textClr,
                          }}
                        >
                          {t("kyc_verification")}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: mutedClr }}>
                          {t("verify_your_identity")}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 99,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        background:
                          user?.kyc?.status === "approved"
                            ? "rgba(52,211,153,0.12)"
                            : "rgba(245,158,11,0.12)",
                        color:
                          user?.kyc?.status === "approved"
                            ? "#34d399"
                            : "#f59e0b",
                      }}
                    >
                      {user?.kyc?.status === "approved"
                        ? t("verified")
                        : user?.kyc?.status === "pending"
                          ? t("pending")
                          : t("unverified")}
                    </span>
                  </button>

                  {/* 2FA ITEM  */}
                  <button
                    className="dd-row"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/dashboard/2fa");
                    }}
                    style={{ color: textClr, justifyContent: "space-between" }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: "rgba(52,211,153,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Shield
                          style={{ width: 13, height: 13, color: "#34d399" }}
                        />
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: textClr,
                          }}
                        >
                          {t("two_factor_authentication")}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: mutedClr }}>
                          {user?.twoFactorEnabled
                            ? t("enabled")
                            : t("secure_your_account")}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 99,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        background: user?.twoFactorEnabled
                          ? "rgba(52,211,153,0.12)"
                          : "rgba(100,116,139,0.12)",
                        color: user?.twoFactorEnabled ? "#34d399" : mutedClr,
                      }}
                    >
                      {user?.twoFactorEnabled ? t("on") : t("off")}
                    </span>
                  </button>

                  {/* Divider */}
                  <div
                    style={{ margin: "6px 0", height: 1, background: divLine }}
                  />

                  <button
                    className="dd-row"
                    onClick={handleLogout}
                    style={{ color: "#f87171", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: "rgba(248,113,113,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <LogOut
                        style={{ width: 13, height: 13, color: "#f87171" }}
                      />
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      {t("log_out")}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BACKDROP */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 48,
            backdropFilter: "blur(3px)",
            transition: "opacity 0.2s",
          }}
        />
      )}

      {/* DRAWER */}
      <div
        className="drawer-scroll"
        style={{
          position: "fixed",
          top: 64,
          left: 0,
          bottom: 0,
          width: 268,
          background: drawerBg,
          borderRight: `1px solid ${border}`,
          boxShadow: drawerOpen ? "4px 0 40px rgba(0,0,0,0.3)" : "none",
          zIndex: 49,
          overflowY: "auto",
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.26s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* User mini card */}
        <div
          style={{
            margin: "16px 12px 12px",
            padding: "14px",
            borderRadius: 14,
            background: darkMode
              ? "rgba(245,158,11,0.06)"
              : "rgba(245,158,11,0.05)",
            border: "1px solid rgba(245,158,11,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg,#d97706,#f59e0b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <User style={{ width: 16, height: 16, color: "#020617" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: textClr,
                fontWeight: 700,
                fontSize: "0.82rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.firstName} {user?.lastName}
            </div>
            <div
              style={{
                color: mutedClr,
                fontSize: "0.68rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.email}
            </div>
          </div>
        </div>

        <div style={{ padding: "0 10px 96px" }}>
          <div style={{ padding: "6px 4px 4px", marginBottom: 2 }}>
            <span
              style={{
                color: mutedClr,
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {t("main")}
            </span>
          </div>

          {DIRECT_LINKS.map(({ label, icon: Icon, path, color }) => {
            const active = isActive(path);
            return (
              <Link
                key={label}
                to={path}
                className="drawer-direct-link"
                style={{
                  background: active
                    ? `linear-gradient(135deg,${color}20,${color}0d)`
                    : "transparent",
                  border: active
                    ? `1px solid ${color}30`
                    : "1px solid transparent",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    flexShrink: 0,
                    background: active
                      ? `${color}25`
                      : darkMode
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    style={{
                      width: 14,
                      height: 14,
                      color: active ? color : mutedClr,
                    }}
                  />
                </div>
                <span
                  className="dl-label"
                  style={{
                    color: active ? color : darkMode ? "#cbd5e1" : "#334155",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  {label}
                </span>
                {active && (
                  <div
                    style={{
                      marginLeft: "auto",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: color,
                      boxShadow: `0 0 8px ${color}`,
                    }}
                  />
                )}
              </Link>
            );
          })}

          <div
            style={{ height: 1, background: divLine, margin: "10px 2px 8px" }}
          />

          {DROPDOWN_GROUPS.map((group) => {
            const isExpanded = expandedGroup === group.label;
            const hasActive = group.items.some((i) => isActive(i.path));
            return (
              <div key={group.label} style={{ marginBottom: 2 }}>
                <button
                  className="drawer-group-btn"
                  onClick={() =>
                    setExpandedGroup((e) =>
                      e === group.label ? null : group.label,
                    )
                  }
                  style={{
                    background: isExpanded
                      ? darkMode
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.04)"
                      : "transparent",
                    color: hasActive
                      ? "#f59e0b"
                      : darkMode
                        ? "#cbd5e1"
                        : "#334155",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 11 }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        flexShrink: 0,
                        background:
                          isExpanded || hasActive
                            ? `${group.color}20`
                            : darkMode
                              ? "rgba(255,255,255,0.05)"
                              : "rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background:
                            isExpanded || hasActive ? group.color : mutedClr,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                      {group.label}
                    </span>
                    {hasActive && (
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "#f59e0b",
                          marginLeft: -4,
                        }}
                      />
                    )}
                  </div>
                  <ChevronDown
                    style={{
                      width: 14,
                      height: 14,
                      flexShrink: 0,
                      color: isExpanded ? group.color : mutedClr,
                      transition: "transform 0.22s",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                <div
                  style={{
                    overflow: "hidden",
                    maxHeight: isExpanded
                      ? `${group.items.length * 42}px`
                      : "0px",
                    transition: "max-height 0.26s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  <div
                    style={{
                      marginLeft: 15,
                      paddingLeft: 12,
                      paddingTop: 4,
                      paddingBottom: 4,
                      borderLeft: `2px solid ${group.color}30`,
                    }}
                  >
                    {group.items.map(
                      ({ label, icon: Icon, path, color, badge }) => {
                        const active = isActive(path);
                        return (
                          <Link
                            key={label}
                            to={path}
                            className="drawer-sub-link"
                            style={{
                              background: active ? `${color}12` : "transparent",
                              border: active
                                ? `1px solid ${color}25`
                                : "1px solid transparent",
                            }}
                          >
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 7,
                                flexShrink: 0,
                                background: active
                                  ? `${color}22`
                                  : darkMode
                                    ? "rgba(255,255,255,0.05)"
                                    : "rgba(0,0,0,0.04)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Icon
                                style={{
                                  width: 12,
                                  height: 12,
                                  color: active ? color : mutedClr,
                                }}
                              />
                            </div>
                            <span
                              className="sl-label"
                              style={{
                                color: active
                                  ? color
                                  : darkMode
                                    ? "#94a3b8"
                                    : "#64748b",
                                fontWeight: active ? 600 : 500,
                                display: "flex",
                                alignItems: "center",
                                gap: "80px",
                              }}
                            >
                              {label}
                              {badge && (
                                <span
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #f59e0b20, #f59e0b10)",
                                    color: "#f59e0b",
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    padding: "2px 6px",
                                    borderRadius: "20px",
                                    border: "1px solid rgba(245, 158, 11, 0.3)",
                                  }}
                                >
                                  {badge}
                                </span>
                              )}
                            </span>
                            {active && (
                              <div
                                style={{
                                  marginLeft: "auto",
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  background: color,
                                }}
                              />
                            )}
                          </Link>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div
            style={{ height: 1, background: divLine, margin: "10px 2px 8px" }}
          />

          {/* Settings section in drawer */}
          <div style={{ marginBottom: 2 }}>
            <div style={{ padding: "6px 4px 4px", marginBottom: 4 }}>
              <span
                style={{
                  color: mutedClr,
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {t("settings")}
              </span>
            </div>
            {SETTINGS_ITEMS.map(({ label, icon: Icon, path, color, desc }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className="drawer-direct-link"
                  style={{
                    background: active ? `${color}12` : "transparent",
                    border: active
                      ? `1px solid ${color}25`
                      : "1px solid transparent",
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      flexShrink: 0,
                      background: active
                        ? `${color}25`
                        : darkMode
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      style={{
                        width: 14,
                        height: 14,
                        color: active ? color : mutedClr,
                      }}
                    />
                  </div>
                  <span
                    className="dl-label"
                    style={{
                      color: active ? color : darkMode ? "#cbd5e1" : "#334155",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </span>
                  {active && (
                    <div
                      style={{
                        marginLeft: "auto",
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: color,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div
            style={{ height: 1, background: divLine, margin: "10px 2px 8px" }}
          />

          <Link
            to="/support"
            className="drawer-support-link"
            style={{
              background: isActive("/support")
                ? "rgba(99,102,241,0.1)"
                : "transparent",
              border: isActive("/support")
                ? "1px solid rgba(99,102,241,0.2)"
                : "1px solid transparent",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                flexShrink: 0,
                background: isActive("/support")
                  ? "rgba(99,102,241,0.18)"
                  : darkMode
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Headphones
                style={{
                  width: 14,
                  height: 14,
                  color: isActive("/support") ? "#818cf8" : mutedClr,
                }}
              />
            </div>
            <span
              style={{
                color: isActive("/support")
                  ? "#818cf8"
                  : darkMode
                    ? "#cbd5e1"
                    : "#334155",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              {t("support")}
            </span>
          </Link>

          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: `1px solid ${divLine}`,
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "10px 12px",
                borderRadius: 12,
                border: "none",
                background: "rgba(248,113,113,0.08)",
                color: "#f87171",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(248,113,113,0.15)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(248,113,113,0.08)")
              }
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "rgba(248,113,113,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LogOut style={{ width: 13, height: 13, color: "#f87171" }} />
              </div>
              {t("sign_out")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
