import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Copy,
  CheckCircle,
  Users,
  TrendingUp,
  Gift,
  Wallet,
  Share2,
  Clock,
  DollarSign,
  Lock,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import api from "../../services/apiService";

function fmt(n, d = 2) {
  if (!n) return "0.00";
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function Skel({ w = 80, h = 12, darkMode }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        animation: "skPulse 1.4s ease-in-out infinite",
      }}
    />
  );
}

export default function ReferralPage() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";

  useEffect(() => {
    api
      .get("/referral/stats")
      .then((res) => setStats(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(stats?.referralCode || "");
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };
  const copyLink = () => {
    navigator.clipboard.writeText(stats?.referralLink || "");
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };
  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({
        title: t("share_title"),
        text: t("share_text", { bonus: stats?.newUserBonus || 20 }),
        url: stats?.referralLink,
      });
    } else copyLink();
  };

  const STAT_CARDS = [
    {
      labelKey: "total_referrals",
      value: stats?.totalReferrals,
      icon: Users,
      color: "#f59e0b",
    },
    {
      labelKey: "active_deposited",
      value: stats?.activeReferrals,
      icon: TrendingUp,
      color: "#34d399",
    },
    {
      labelKey: "pending",
      value: stats?.pendingReferrals,
      icon: Clock,
      color: "#60a5fa",
    },
    {
      labelKey: "total_earned",
      value: `$${fmt(stats?.totalCommissionEarned)}`,
      icon: DollarSign,
      color: "#a78bfa",
    },
  ];

  const HOW_IT_WORKS_STEPS = [
    {
      icon: Share2,
      color: "#f59e0b",
      titleKey: "share_your_link",
      descKey: "share_link_desc",
    },
    {
      icon: Users,
      color: "#34d399",
      titleKey: "they_sign_up",
      descKey: "sign_up_desc",
      bonus: stats?.newUserBonus || 20,
    },
    {
      icon: DollarSign,
      color: "#a78bfa",
      titleKey: "they_deposit",
      descKey: "deposit_desc",
      referrerBonus: stats?.referrerBonus || 50,
      commissionRate: stats?.commissionRate || 9,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <style>{`
        @keyframes skPulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .ref-card{transition:transform 0.18s;}
        .ref-card:hover{transform:translateY(-2px);}
      `}</style>
      <DashboardNav />

      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "80px 16px 120px",
          animation: "fadeUp 0.3s ease",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "none",
            border: "none",
            color: muted,
            cursor: "pointer",
            fontSize: "0.82rem",
            marginBottom: 20,
          }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> {t("back")}
        </button>

        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
            }}
          >
            <h1
              style={{
                fontFamily: '"Playfair Display",serif',
                fontWeight: 800,
                fontSize: "clamp(1.5rem,4vw,2rem)",
                color: textClr,
                margin: 0,
              }}
            >
              {t("referral_program")}
            </h1>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 99,
                background: "rgba(245,158,11,0.15)",
                color: "#f59e0b",
                fontSize: "0.72rem",
                fontWeight: 800,
              }}
            >
              {stats?.commissionRate || 9}%
            </span>
          </div>
          <p style={{ color: muted, fontSize: "0.875rem", margin: 0 }}>
            {t("referral_subtitle_start")}{" "}
            <strong style={{ color: "#f59e0b" }}>
              {stats?.commissionRate || 9}% {t("commission")}
            </strong>{" "}
            {t("referral_subtitle_end")}
          </p>
        </div>

        {/* How it works */}
        <div
          style={{
            background:
              "linear-gradient(135deg,rgba(245,158,11,0.1),rgba(245,158,11,0.03))",
            border: "1px solid rgba(245,158,11,0.22)",
            borderRadius: 18,
            padding: "18px 20px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              color: "#f59e0b",
              fontWeight: 700,
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 14,
            }}
          >
            {t("how_it_works")}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
              gap: 14,
            }}
          >
            {HOW_IT_WORKS_STEPS.map(({ icon: Icon, color, titleKey, descKey, bonus, referrerBonus, commissionRate }) => (
              <div
                key={titleKey}
                style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: `${color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon style={{ width: 15, height: 15, color }} />
                </div>
                <div>
                  <div
                    style={{
                      color: textClr,
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      marginBottom: 2,
                    }}
                  >
                    {t(titleKey)}
                  </div>
                  <div
                    style={{
                      color: muted,
                      fontSize: "0.72rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {bonus && t(descKey, { bonus })}
                    {referrerBonus && t(descKey, { referrerBonus, commissionRate })}
                    {!bonus && !referrerBonus && t(descKey)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code + Link card */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 18,
            padding: "20px 22px",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 14,
            }}
          >
            {t("your_referral_details")}
          </div>

          {/* Code */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: muted, fontSize: "0.72rem", marginBottom: 6 }}>
              {t("referral_code")}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: inputBg,
                  border: `1px solid ${border}`,
                  fontFamily: "monospace",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: "#f59e0b",
                  letterSpacing: "0.1em",
                }}
              >
                {loading ? (
                  <Skel w={100} h={14} darkMode={darkMode} />
                ) : (
                  stats?.referralCode || "—"
                )}
              </div>
              <button
                onClick={copyCode}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: `1px solid ${codeCopied ? "#34d399" : border}`,
                  background: codeCopied
                    ? "rgba(52,211,153,0.1)"
                    : "transparent",
                  color: codeCopied ? "#34d399" : muted,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  whiteSpace: "nowrap",
                  transition: "all 0.18s",
                }}
              >
                {codeCopied ? (
                  <CheckCircle style={{ width: 13, height: 13 }} />
                ) : (
                  <Copy style={{ width: 13, height: 13 }} />
                )}
                {codeCopied ? t("copied_exclamation") : t("copy")}
              </button>
            </div>
          </div>

          {/* Link */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: muted, fontSize: "0.72rem", marginBottom: 6 }}>
              {t("referral_link")}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: inputBg,
                  border: `1px solid ${border}`,
                  fontFamily: "monospace",
                  fontSize: "0.72rem",
                  color: muted,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? (
                  <Skel w="100%" h={12} darkMode={darkMode} />
                ) : (
                  stats?.referralLink || "—"
                )}
              </div>
              <button
                onClick={copyLink}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: `1px solid ${linkCopied ? "#34d399" : border}`,
                  background: linkCopied
                    ? "rgba(52,211,153,0.1)"
                    : "transparent",
                  color: linkCopied ? "#34d399" : muted,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  whiteSpace: "nowrap",
                  transition: "all 0.18s",
                }}
              >
                {linkCopied ? (
                  <CheckCircle style={{ width: 13, height: 13 }} />
                ) : (
                  <Copy style={{ width: 13, height: 13 }} />
                )}
                {linkCopied ? t("copied_exclamation") : t("copy")}
              </button>
            </div>
          </div>

          <button
            onClick={shareLink}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#d97706,#f59e0b)",
              color: "#020617",
              fontSize: "0.875rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
            }}
          >
            <Share2 style={{ width: 15, height: 15 }} /> {t("share_referral_link")}
          </button>
        </div>

        {/* Bonus locked notice */}
        {!user?.wallet?.hasDeposited &&
          (user?.wallet?.bonusLocked || 0) > 0 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                padding: "12px 16px",
                borderRadius: 12,
                background: "rgba(96,165,250,0.07)",
                border: "1px solid rgba(96,165,250,0.2)",
                marginBottom: 14,
              }}
            >
              <Lock
                style={{
                  width: 15,
                  height: 15,
                  color: "#60a5fa",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              />
              <div>
                <div
                  style={{
                    color: "#60a5fa",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    marginBottom: 2,
                  }}
                >
                  {t("bonus_funds_locked")}
                </div>
                <div
                  style={{ color: muted, fontSize: "0.72rem", lineHeight: 1.4 }}
                >
                  {t("bonus_unlock_message", { amount: fmt(user?.wallet?.bonusLocked) })}
                </div>
              </div>
            </div>
          )}

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {STAT_CARDS.map(({ labelKey, value, icon: Icon, color }) => (
            <div
              key={labelKey}
              className="ref-card"
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 16,
                padding: "16px",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: `${color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Icon style={{ width: 15, height: 15, color }} />
              </div>
              <div
                style={{
                  fontFamily: '"Playfair Display",serif',
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  color,
                  marginBottom: 2,
                }}
              >
                {loading ? (
                  <Skel w={50} h={16} darkMode={darkMode} />
                ) : (
                  (value ?? "0")
                )}
              </div>
              <div
                style={{ color: muted, fontSize: "0.68rem", lineHeight: 1.3 }}
              >
                {t(labelKey)}
              </div>
            </div>
          ))}
        </div>

        {/* Referred users */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 18,
            overflow: "hidden",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${divLine}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{ color: textClr, fontWeight: 700, fontSize: "0.9rem" }}
            >
              {t("referred_users")}
            </div>
            {(stats?.totalReferrals || 0) > 0 && (
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: 99,
                  background: "rgba(245,158,11,0.12)",
                  color: "#f59e0b",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                }}
              >
                {stats.totalReferrals} {t("total_ref")}
              </span>
            )}
          </div>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                style={{
                  padding: "14px 20px",
                  borderBottom: `1px solid ${divLine}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <Skel w={120} h={11} darkMode={darkMode} />
                  <Skel w={80} h={9} darkMode={darkMode} />
                </div>
                <Skel w={70} h={22} darkMode={darkMode} />
              </div>
            ))
          ) : !stats?.referredUsers?.length ? (
            <div
              style={{
                padding: "36px",
                textAlign: "center",
                color: muted,
                fontSize: "0.85rem",
              }}
            >
              <Gift
                style={{
                  width: 32,
                  height: 32,
                  color: muted,
                  margin: "0 auto 10px",
                  display: "block",
                  opacity: 0.4,
                }}
              />
              {t("no_referrals_yet")}
            </div>
          ) : (
            stats.referredUsers.map((u, i) => (
              <div
                key={i}
                style={{
                  padding: "13px 20px",
                  borderBottom:
                    i < stats.referredUsers.length - 1
                      ? `1px solid ${divLine}`
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: u.hasDeposited
                        ? "rgba(52,211,153,0.12)"
                        : "rgba(96,165,250,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Users
                      style={{
                        width: 13,
                        height: 13,
                        color: u.hasDeposited ? "#34d399" : "#60a5fa",
                      }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        color: textClr,
                        fontWeight: 600,
                        fontSize: "0.82rem",
                      }}
                    >
                      {u.name}
                    </div>
                    <div style={{ color: muted, fontSize: "0.68rem" }}>
                      {t("joined")} {fmtDate(u.joinedAt)}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    background: u.hasDeposited
                      ? "rgba(52,211,153,0.12)"
                      : "rgba(96,165,250,0.1)",
                    color: u.hasDeposited ? "#34d399" : "#60a5fa",
                  }}
                >
                  {u.hasDeposited ? t("deposited") : t("pending")}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Recent commissions */}
        {stats?.recentBonuses?.length > 0 && (
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 18,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${divLine}`,
              }}
            >
              <div
                style={{ color: textClr, fontWeight: 700, fontSize: "0.9rem" }}
              >
                {t("recent_commissions")}
              </div>
            </div>
            {stats.recentBonuses.map((txn, i) => (
              <div
                key={txn._id || i}
                style={{
                  padding: "13px 20px",
                  borderBottom:
                    i < stats.recentBonuses.length - 1
                      ? `1px solid ${divLine}`
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: "rgba(167,139,250,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Wallet
                      style={{ width: 13, height: 13, color: "#a78bfa" }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        color: textClr,
                        fontWeight: 600,
                        fontSize: "0.82rem",
                      }}
                    >
                      {t("commission_earned")}
                    </div>
                    <div style={{ color: muted, fontSize: "0.68rem" }}>
                      {fmtDate(txn.processedAt || txn.createdAt)}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    color: "#34d399",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  +${fmt(txn.amount)} {txn.currency}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}