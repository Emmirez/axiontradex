// frontend/src/pages/admin/SectionUserDetails.jsx
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Bitcoin,
  Coins,
} from "lucide-react";
import api from "../../services/apiService";
import { fmtUSD, fmtDate, Badge } from "./AdminShared";

// Helper function to format crypto holdings display
const formatCryptoHoldings = (balances) => {
  const parts = [];
  if (balances?.BTC > 0) parts.push(`₿${balances.BTC.toFixed(6)}`);
  if (balances?.ETH > 0) parts.push(`⟠${balances.ETH.toFixed(4)}`);
  if (balances?.SOL > 0) parts.push(`◎${balances.SOL.toFixed(2)}`);
  if (balances?.BNB > 0) parts.push(`🟡${balances.BNB.toFixed(2)}`);
  if (balances?.USDT > 0 && parts.length === 0) parts.push(`💵${balances.USDT.toFixed(2)}`);
  return parts.join(" • ");
};

export default function SectionUserDetails({
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  divLine,
  inputBg,
  showToast,
  userId,
  onBack,
}) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabs, setTabs] = useState("overview");
  const [transactions, setTransactions] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loadingTabs, setLoadingTabs] = useState(false);

  useEffect(() => {
    if (!userId) {
      setError("No user ID provided");
      setLoading(false);
      return;
    }
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      const data = res.data?.data;
      setUserData(data);
      setTransactions(data?.transactions || []);
      setTrades(data?.trades || []);
    } catch (err) {
      console.error("Failed to load user:", err);
      setError(err.response?.data?.message || "Failed to load user details");
      showToast("Failed to load user details", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50, color: muted }}>
        Loading user details...
      </div>
    );
  }

  if (error || !userData?.user) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <div style={{ color: "#f87171", marginBottom: 16 }}>
          {error || "User not found"}
        </div>
        <button
          onClick={onBack}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: `1px solid ${border}`,
            background: "transparent",
            color: textClr,
            cursor: "pointer",
          }}
        >
          ← Back to Users
        </button>
      </div>
    );
  }

  const user = userData.user;

  // Get wallet data - using totalUSD from backend if available
 // Get wallet data - use the actual wallet data from API
const wallet = user.wallet || {};
const balances = wallet.balances || {};
const totalUSD = wallet.totalUSD || wallet.balance || 0;
const locked = wallet.locked || 0;
const available = Math.max(0, totalUSD - locked);
const bonusLocked = wallet.bonusLocked || 0;

  // Get KYC status
  const kycStatus = user.kyc?.status || "unverified";
  const kycColors = {
    approved: { color: "#34d399", label: "Approved" },
    rejected: { color: "#f87171", label: "Rejected" },
    pending: { color: "#f59e0b", label: "Pending" },
    unverified: { color: "#94a3b8", label: "Not Submitted" },
  };
  const kycInfo = kycColors[kycStatus] || kycColors.unverified;

  return (
    <div>
      {/* Header with back button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 8,
            border: `1px solid ${border}`,
            background: "transparent",
            color: textClr,
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={14} /> Back to Users
        </button>
        <div>
          <h1 style={{ color: textClr, fontSize: "1.3rem", fontWeight: 700 }}>
            {user.firstName} {user.lastName}
          </h1>
          <p style={{ color: muted, fontSize: "0.75rem" }}>
            User Account Details
          </p>
        </div>
      </div>

      {/* User Info Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Profile Card */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#f59e0b,#d97706)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: "#020617",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                }}
              >
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </span>
            </div>
            <div>
              <div
                style={{ color: textClr, fontWeight: 700, fontSize: "1rem" }}
              >
                {user.firstName} {user.lastName}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <Badge status={user.role || "user"} />
                <Badge status={user.status || "active"} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Mail size={12} color={muted} />
              <span style={{ color: textClr, fontSize: "0.8rem" }}>
                {user.email}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={12} color={muted} />
              <span style={{ color: muted, fontSize: "0.75rem" }}>
                Joined: {fmtDate(user.createdAt)}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Shield size={12} color={muted} />
              <span style={{ color: muted, fontSize: "0.75rem" }}>
                KYC:{" "}
                <span style={{ color: kycInfo.color }}>{kycInfo.label}</span>
              </span>
            </div>
            {user.referredBy && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <User size={12} color={muted} />
                <span style={{ color: muted, fontSize: "0.75rem" }}>
                  Referred by: {user.referredBy}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Card - NOW SHOWING TOTAL USD EQUIVALENT */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Wallet size={16} color="#f59e0b" />
              <span style={{ color: textClr, fontWeight: 700 }}>
                Total Balance
              </span>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div
              style={{ color: "#f59e0b", fontSize: "1.8rem", fontWeight: 800 }}
            >
              {fmtUSD(totalUSD)}
            </div>
            <div style={{ color: muted, fontSize: "0.7rem" }}>
              USD Equivalent (All Assets)
            </div>
          </div>

          {/* Crypto Holdings Breakdown */}
          {Object.keys(balances).length > 0 && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                background: darkMode
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.02)",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: "0.65rem",
                  color: muted,
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Holdings Breakdown
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  fontSize: "0.7rem",
                }}
              >
                {balances.USDT > 0 && (
                  <span style={{ color: "#34d399" }}>
                    💵 USDT: {balances.USDT.toFixed(2)}
                  </span>
                )}
                {balances.BTC > 0 && (
                  <span style={{ color: "#f59e0b" }}>
                    ₿ BTC: {balances.BTC.toFixed(6)}
                  </span>
                )}
                {balances.ETH > 0 && (
                  <span style={{ color: "#a78bfa" }}>
                    ⟠ ETH: {balances.ETH.toFixed(4)}
                  </span>
                )}
                {balances.SOL > 0 && (
                  <span style={{ color: "#60a5fa" }}>
                    ◎ SOL: {balances.SOL.toFixed(2)}
                  </span>
                )}
                {balances.BNB > 0 && (
                  <span style={{ color: "#f59e0b" }}>
                    🟡 BNB: {balances.BNB.toFixed(2)}
                  </span>
                )}
                {balances.USD > 0 && (
                  <span style={{ color: "#94a3b8" }}>
                    💵 USD: {balances.USD.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              paddingTop: 12,
              borderTop: `1px solid ${divLine}`,
            }}
          >
            <div>
              <div style={{ color: muted, fontSize: "0.65rem" }}>Available</div>
              <div style={{ color: "#34d399", fontWeight: 700 }}>
                {fmtUSD(available)}
              </div>
            </div>
            <div>
              <div style={{ color: muted, fontSize: "0.65rem" }}>Locked</div>
              <div style={{ color: "#f87171", fontWeight: 700 }}>
                {fmtUSD(locked)}
              </div>
            </div>
          </div>
          {bonusLocked > 0 && (
            <div
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: `1px solid ${divLine}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: muted, fontSize: "0.65rem" }}>
                  Bonus Locked
                </span>
                <span
                  style={{
                    color: "#f59e0b",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                  }}
                >
                  {fmtUSD(bonusLocked)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stats Card */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 20,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <span style={{ color: textClr, fontWeight: 700 }}>
              Account Summary
            </span>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <div style={{ color: muted, fontSize: "0.65rem" }}>User ID</div>
              <div
                style={{
                  color: textClr,
                  fontSize: "0.7rem",
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                }}
              >
                {user._id?.slice(-8)}
              </div>
            </div>
            <div>
              <div style={{ color: muted, fontSize: "0.65rem" }}>
                Referral Code
              </div>
              <div
                style={{
                  color: textClr,
                  fontSize: "0.7rem",
                  fontFamily: "monospace",
                }}
              >
                {user.referralCode || "—"}
              </div>
            </div>
            <div>
              <div style={{ color: muted, fontSize: "0.65rem" }}>
                Referral Count
              </div>
              <div style={{ color: textClr, fontSize: "0.8rem" }}>
                {user.referralCount || 0}
              </div>
            </div>
            <div>
              <div style={{ color: muted, fontSize: "0.65rem" }}>
                Email Verified
              </div>
              <div
                style={{
                  color: user.isEmailVerified ? "#34d399" : "#f87171",
                  fontSize: "0.8rem",
                }}
              >
                {user.isEmailVerified ? "Yes" : "No"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 20,
          borderBottom: `1px solid ${divLine}`,
        }}
      >
        {["overview", "transactions", "trades"].map((tab) => (
          <button
            key={tab}
            onClick={() => setTabs(tab)}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "transparent",
              color: tabs === tab ? "#f59e0b" : muted,
              fontWeight: tabs === tab ? 700 : 500,
              fontSize: "0.85rem",
              cursor: "pointer",
              borderBottom:
                tabs === tab ? "2px solid #f59e0b" : "2px solid transparent",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
            {tab === "transactions" && `(${transactions.length})`}
          </button>
        ))}
      </div>

      {/* Tab Content - Overview */}
      {tabs === "overview" && (
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 20,
          }}
        >
          <h3 style={{ color: textClr, marginBottom: 16 }}>
            Personal Information
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 16,
            }}
          >
            <div>
              <div style={{ color: muted, fontSize: "0.7rem" }}>Full Name</div>
              <div style={{ color: textClr, fontSize: "0.85rem" }}>
                {user.fullName || `${user.firstName} ${user.lastName}`}
              </div>
            </div>
            <div>
              <div style={{ color: muted, fontSize: "0.7rem" }}>Username</div>
              <div style={{ color: textClr, fontSize: "0.85rem" }}>
                {user.username || "—"}
              </div>
            </div>
            <div>
              <div style={{ color: muted, fontSize: "0.7rem" }}>Phone</div>
              <div style={{ color: textClr, fontSize: "0.85rem" }}>
                {user.phone || "—"}
              </div>
            </div>
            <div>
              <div style={{ color: muted, fontSize: "0.7rem" }}>Country</div>
              <div style={{ color: textClr, fontSize: "0.85rem" }}>
                {user.country || "—"}
              </div>
            </div>
            <div>
              <div style={{ color: muted, fontSize: "0.7rem" }}>Last Login</div>
              <div style={{ color: textClr, fontSize: "0.85rem" }}>
                {fmtDate(user.lastLoginAt)}
              </div>
            </div>
            <div>
              <div style={{ color: muted, fontSize: "0.7rem" }}>
                Last Login IP
              </div>
              <div
                style={{
                  color: textClr,
                  fontSize: "0.85rem",
                  fontFamily: "monospace",
                }}
              >
                {user.lastLoginIp || "—"}
              </div>
            </div>
          </div>

          {/* KYC Details if available */}
          {user.kyc && user.kyc.status && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ color: textClr, marginBottom: 16 }}>
                KYC Information
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ color: muted, fontSize: "0.7rem" }}>
                    KYC Status
                  </div>
                  <div
                    style={{
                      color: kycInfo.color,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {kycInfo.label}
                  </div>
                </div>
                <div>
                  <div style={{ color: muted, fontSize: "0.7rem" }}>
                    Document Type
                  </div>
                  <div style={{ color: textClr, fontSize: "0.85rem" }}>
                    {user.kyc.documentType || "—"}
                  </div>
                </div>
                <div>
                  <div style={{ color: muted, fontSize: "0.7rem" }}>
                    Submitted At
                  </div>
                  <div style={{ color: textClr, fontSize: "0.85rem" }}>
                    {fmtDate(user.kyc.submittedAt)}
                  </div>
                </div>
                {user.kyc.reviewNote && (
                  <div>
                    <div style={{ color: muted, fontSize: "0.7rem" }}>
                      Review Note
                    </div>
                    <div style={{ color: "#f87171", fontSize: "0.85rem" }}>
                      {user.kyc.reviewNote}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content - Transactions */}
      {tabs === "transactions" && (
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {transactions.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: muted }}>
              No transactions found
            </div>
          ) : (
            <div className="thin-scroll" style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 600 }}>
                {transactions.map((tx, i) => (
                  <div
                    key={tx._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 18px",
                      borderBottom:
                        i < transactions.length - 1
                          ? `1px solid ${divLine}`
                          : "none",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            color: textClr,
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        >
                          {tx.type}
                        </span>
                        {tx.subType && (
                          <span style={{ color: muted, fontSize: "0.65rem" }}>
                            • {tx.subType}
                          </span>
                        )}
                      </div>
                      <div style={{ color: muted, fontSize: "0.65rem" }}>
                        {fmtDate(tx.createdAt)}
                      </div>
                      {tx.note && (
                        <div
                          style={{
                            color: muted,
                            fontSize: "0.65rem",
                            maxWidth: 300,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {tx.note}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          color: ["trade", "bonus", "deposit"].includes(tx.type)
                            ? "#34d399"
                            : "#f87171",
                          fontWeight: 700,
                        }}
                      >
                        {["trade", "bonus", "deposit"].includes(tx.type)
                          ? "+"
                          : "-"}
                        {fmtUSD(tx.amount)}
                      </div>
                      <Badge status={tx.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content - Trades */}
      {tabs === "trades" && (
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {trades.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: muted }}>
              No trades found
            </div>
          ) : (
            <div className="thin-scroll" style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 700 }}>
                {trades.map((trade, i) => (
                  <div
                    key={trade._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 18px",
                      borderBottom:
                        i < trades.length - 1 ? `1px solid ${divLine}` : "none",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ color: textClr, fontWeight: 600 }}>
                          {trade.symbol}
                        </span>
                        <Badge status={trade.side} />
                      </div>
                      <div style={{ color: muted, fontSize: "0.65rem" }}>
                        {fmtDate(trade.filledAt || trade.createdAt)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: textClr, fontFamily: "monospace" }}>
                        {trade.quantity} @ $
                        {trade.filledPrice?.toLocaleString()}
                      </div>
                      {trade.pnl !== undefined && (
                        <div
                          style={{
                            color: trade.pnl >= 0 ? "#34d399" : "#f87171",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {trade.pnl >= 0 ? "+" : ""}
                          {fmtUSD(trade.pnl)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}