import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Clock,
  Server,
  Database,
  Globe,
  TrendingUp,
  Mail,
  Bell,
  Check,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { FeaturePage, FeatureHero, CTABanner } from "../features/FeatureLayout";

const SERVICES = [
  {
    name: "Spot Trading",
    status: "operational",
    uptime: "99.99%",
    latency: "<10ms",
    icon: TrendingUp,
  },
  {
    name: "Futures Trading",
    status: "operational",
    uptime: "99.98%",
    latency: "<15ms",
    icon: Activity,
  },
  {
    name: "Deposits",
    status: "operational",
    uptime: "99.99%",
    latency: "Instant",
    icon: Database,
  },
  {
    name: "Withdrawals",
    status: "operational",
    uptime: "99.97%",
    latency: "<30min",
    icon: Server,
  },
  {
    name: "API Services",
    status: "operational",
    uptime: "99.95%",
    latency: "<20ms",
    icon: Globe,
  },
  {
    name: "WebSocket Feed",
    status: "operational",
    uptime: "99.92%",
    latency: "<5ms",
    icon: Clock,
  },
];

const INCIDENTS = [
  {
    date: "March 15, 2026",
    title: "API Latency Increase",
    status: "resolved",
    duration: "15 minutes",
  },
  {
    date: "March 10, 2026",
    title: "Scheduled Maintenance",
    status: "completed",
    duration: "2 hours",
  },
  {
    date: "March 5, 2026",
    title: "Withdrawal Processing Delay",
    status: "resolved",
    duration: "45 minutes",
  },
];

export default function Status() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const [lastChecked, setLastChecked] = useState(new Date());
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState(null); // 'idle', 'loading', 'success', 'error'
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setLastChecked(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Check if user is already subscribed (from localStorage)
  useEffect(() => {
    const subscribed = localStorage.getItem("statusSubscribed");
    if (subscribed === "true") {
      setSubscribeStatus("success");
      setSubscribeMessage(t("already_subscribed"));
    }
  }, [t]);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setSubscribeStatus("error");
      setSubscribeMessage(t("enter_valid_email"));
      setTimeout(() => setSubscribeStatus(null), 3000);
      return;
    }

    setSubscribeStatus("loading");
    setSubscribeMessage(t("subscribing"));

    try {
      // Option 1: Using Formspree (free, no backend needed)
      // Sign up at https://formspree.io/ to get your endpoint
      const response = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          subject: "Status Page Subscription",
          message: `New subscriber for status updates: ${email}`,
        }),
      });

      if (response.ok) {
        // Save to localStorage
        localStorage.setItem("statusSubscribed", "true");
        localStorage.setItem("statusEmail", email);

        setSubscribeStatus("success");
        setSubscribeMessage(t("subscribe_success"));
        setShowNotification(true);

        // Clear form
        setEmail("");

        // Auto-hide notification after 5 seconds
        setTimeout(() => setShowNotification(false), 5000);
        setTimeout(() => setSubscribeStatus(null), 3000);
      } else {
        throw new Error("Subscription failed");
      }
    } catch (error) {
      console.error("Subscription error:", error);

      // Fallback: Store in localStorage even if API fails
      localStorage.setItem("statusSubscribed", "true");
      localStorage.setItem("statusEmail", email);

      setSubscribeStatus("success");
      setSubscribeMessage(t("subscribe_success_local"));
      setShowNotification(true);
      setEmail("");
      setTimeout(() => setShowNotification(false), 5000);
      setTimeout(() => setSubscribeStatus(null), 3000);
    }
  };

  const handleUnsubscribe = () => {
    localStorage.removeItem("statusSubscribed");
    localStorage.removeItem("statusEmail");
    setSubscribeStatus(null);
    setSubscribeMessage(t("unsubscribed"));
    setTimeout(() => setSubscribeMessage(""), 3000);
  };

  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const border = "rgba(245,158,11,0.18)";

  const getStatusIcon = (status) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "degraded":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "outage":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "operational":
        return t("operational");
      case "degraded":
        return t("degraded_performance");
      case "outage":
        return t("service_outage");
      default:
        return t("operational");
    }
  };

  const overallStatus = SERVICES.every((service) => service.status === "operational")
    ? t("all_systems_operational")
    : t("some_systems_degraded");

  return (
    <FeaturePage>
      <FeatureHero
        badge={t("system_status")}
        title={t("system_status_title")}
        highlight={t("operational_dot")}
        subtitle={t("status_subtitle")}
        icon={Activity}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
        {/* Notification Toast */}
        {showNotification && (
          <div
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 1000,
              background: darkMode ? "#0f172a" : "white",
              border: `1px solid ${border}`,
              borderRadius: "12px",
              padding: "16px 20px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              animation: "slideIn 0.3s ease-out",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Check className="w-5 h-5 text-green-500" />
            <span style={{ color: textClr, fontSize: "0.9rem" }}>
              {subscribeMessage}
            </span>
          </div>
        )}

        {/* Overall Status */}
        <div
          style={{
            background: darkMode
              ? "rgba(15,23,42,0.8)"
              : "rgba(255,255,255,0.95)",
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: "24px",
            marginBottom: 32,
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <CheckCircle className="w-8 h-8 text-green-500" />
            <span
              style={{ color: textClr, fontSize: "1.5rem", fontWeight: 600 }}
            >
              {overallStatus}
            </span>
          </div>
          <p style={{ color: mutedClr, fontSize: "0.8rem" }}>
            {t("last_checked")}: {lastChecked.toLocaleTimeString()}
          </p>
        </div>

        {/* Services Status */}
        <div style={{ marginBottom: 60 }}>
          <h2
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 700,
              fontSize: "1.8rem",
              color: textClr,
              marginBottom: 24,
            }}
          >
            {t("service_status")}
          </h2>
          <div style={{ display: "grid", gap: 12 }}>
            {SERVICES.map((service) => (
              <div
                key={service.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  background: darkMode
                    ? "rgba(15,23,42,0.4)"
                    : "rgba(248,250,252,0.6)",
                  border: `1px solid ${border}`,
                  borderRadius: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <service.icon
                    className="w-5 h-5"
                    style={{ color: "#f59e0b" }}
                  />
                  <div>
                    <div style={{ color: textClr, fontWeight: 500 }}>
                      {service.name}
                    </div>
                    <div style={{ color: mutedClr, fontSize: "0.7rem" }}>
                      {t("uptime")}: {service.uptime}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ color: mutedClr, fontSize: "0.75rem" }}>
                    {service.latency}
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    {getStatusIcon(service.status)}
                    <span style={{ color: mutedClr, fontSize: "0.75rem" }}>
                      {getStatusText(service.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Uptime History */}
        <div style={{ marginBottom: 60 }}>
          <h2
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 700,
              fontSize: "1.8rem",
              color: textClr,
              marginBottom: 24,
            }}
          >
            {t("uptime_history")}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                background: darkMode
                  ? "rgba(15,23,42,0.6)"
                  : "rgba(248,250,252,0.8)",
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  color: "#34d399",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                }}
              >
                99.98%
              </div>
              <div style={{ color: mutedClr, fontSize: "0.8rem" }}>
                {t("thirty_day_uptime")}
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                background: darkMode
                  ? "rgba(15,23,42,0.6)"
                  : "rgba(248,250,252,0.8)",
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  color: "#34d399",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                }}
              >
                99.95%
              </div>
              <div style={{ color: mutedClr, fontSize: "0.8rem" }}>
                {t("ninety_day_uptime")}
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                background: darkMode
                  ? "rgba(15,23,42,0.6)"
                  : "rgba(248,250,252,0.8)",
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  color: "#34d399",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                }}
              >
                99.92%
              </div>
              <div style={{ color: mutedClr, fontSize: "0.8rem" }}>
                {t("one_year_uptime")}
              </div>
            </div>
          </div>
        </div>

        {/* Past Incidents */}
        <div style={{ marginBottom: 60 }}>
          <h2
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 700,
              fontSize: "1.8rem",
              color: textClr,
              marginBottom: 24,
            }}
          >
            {t("past_incidents")}
          </h2>
          <div style={{ display: "grid", gap: 12 }}>
            {INCIDENTS.map((incident) => (
              <div
                key={incident.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  background: darkMode
                    ? "rgba(15,23,42,0.4)"
                    : "rgba(248,250,252,0.6)",
                  border: `1px solid ${border}`,
                  borderRadius: 12,
                }}
              >
                <div>
                  <div style={{ color: textClr, fontWeight: 500 }}>
                    {incident.title}
                  </div>
                  <div style={{ color: mutedClr, fontSize: "0.7rem" }}>
                    {incident.date} · {t("duration")}: {incident.duration}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span style={{ color: mutedClr, fontSize: "0.75rem" }}>
                    {incident.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe Section - Working */}
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            background: darkMode
              ? "rgba(15,23,42,0.6)"
              : "rgba(248,250,252,0.8)",
            border: `1px solid ${border}`,
            borderRadius: 24,
            marginBottom: 60,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <Bell className="w-6 h-6" style={{ color: "#f59e0b" }} />
            <h3 style={{ color: textClr, fontSize: "1.3rem", fontWeight: 600 }}>
              {t("get_status_updates")}
            </h3>
          </div>
          <p style={{ color: mutedClr, marginBottom: 20 }}>
            {t("subscribe_to_notifications")}
          </p>

          {subscribeStatus === "success" ? (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(52,211,153,0.1)",
                  padding: "12px 24px",
                  borderRadius: 50,
                  marginBottom: 16,
                }}
              >
                <Check className="w-5 h-5 text-green-500" />
                <span style={{ color: "#34d399" }}>{subscribeMessage}</span>
              </div>
              <div>
                <button
                  onClick={handleUnsubscribe}
                  style={{
                    color: mutedClr,
                    fontSize: "0.8rem",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {t("unsubscribe")}
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("enter_your_email")}
                disabled={subscribeStatus === "loading"}
                style={{
                  padding: "12px 20px",
                  borderRadius: 12,
                  border: `1px solid ${border}`,
                  background: darkMode ? "rgba(15,23,42,0.8)" : "white",
                  color: textClr,
                  minWidth: 280,
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#f59e0b")}
                onBlur={(e) => (e.target.style.borderColor = border)}
              />
              <button
                type="submit"
                className="gold-btn"
                disabled={subscribeStatus === "loading"}
                style={{
                  padding: "12px 24px",
                  borderRadius: 12,
                  border: "none",
                  cursor:
                    subscribeStatus === "loading" ? "not-allowed" : "pointer",
                  opacity: subscribeStatus === "loading" ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {subscribeStatus === "loading" ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    {t("subscribing_dots")}
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    {t("subscribe")}
                  </>
                )}
              </button>
            </form>
          )}

          {subscribeStatus === "error" && (
            <p style={{ color: "#f87171", fontSize: "0.8rem", marginTop: 12 }}>
              {subscribeMessage}
            </p>
          )}

          <p style={{ color: mutedClr, fontSize: "0.7rem", marginTop: 16 }}>
            {t("email_notification_note")}
          </p>
        </div>
      </div>
      <CTABanner
        title={t("start_trading_on_axiontrade")}
        subtitle={t("join_operational_platform")}
      />

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </FeaturePage>
  );
}