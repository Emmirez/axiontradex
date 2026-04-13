import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import AnnouncementBanner from "./AnnouncementBanner";
import DashboardNav from "./DashboardNav";
import WelcomeBanner from "./WelcomeBanner";
import StatsGrid from "./StatsGrid";
import PortfolioSections from "./PortfolioSections";
import TopMovers from "./TopMovers";
import RecentTrades from "./RecentTrades";
import RecentTransactions from "./RecentTransactions";
import Ticker from "../../sections/Ticker";
import BottomNav from "./BottomNav";
import { useAuth } from "../../context/AuthContext";

// Global thin-scrollbar CSS (applied once at the top level)
const SCROLLBAR_CSS = `
  .thin-scroll { overflow-x: auto; }
  .thin-scroll::-webkit-scrollbar { height: 3px; width: 3px; }
  .thin-scroll::-webkit-scrollbar-track { background: transparent; }
  .thin-scroll::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.35); border-radius: 99px; }
  .thin-scroll::-webkit-scrollbar-thumb:hover { background: rgba(245,158,11,0.6); }
  .thin-scroll { scrollbar-width: thin; scrollbar-color: rgba(245,158,11,0.35) transparent; }
`;

export default function UserDashboard() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const pageBg = darkMode ? "#020617" : "#f1f5f9";

  useEffect(() => {
  // Refresh on mount
  refreshUser()

  // Refresh every 30 seconds
  const interval = setInterval(refreshUser, 30_000)

  // Refresh when user comes back to the tab
  const onFocus = () => refreshUser()
  window.addEventListener('focus', onFocus)

  return () => {
    clearInterval(interval)
    window.removeEventListener('focus', onFocus)
  }
}, [])

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBg,
        transition: "background 0.3s",
      }}
    >
      <style>{SCROLLBAR_CSS}</style>

      {/* Fixed navigation bar */}
      <DashboardNav />

      {/*  Live price ticker strip (sits just below nav) ── */}
      <Ticker />

      {/* Page content  */}
      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px 100px" }}
      >
        <AnnouncementBanner darkMode={darkMode} />
        {/* Greeting + action buttons */}
        <WelcomeBanner />

        {/* 6 stat cards */}
        <StatsGrid />

        {/* Live portfolio chart + My Assets */}
        <PortfolioSections darkMode={darkMode} />

        {/* Live top movers */}
        <div style={{ marginBottom: 20 }}>
          <TopMovers
            darkMode={darkMode}
            onViewAll={() => navigate("/markets")}
          />
        </div>

        {/* Recent activity row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 20,
          }}
        >
          <RecentTrades />
          <RecentTransactions />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
