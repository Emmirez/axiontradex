// frontend/src/pages/admin/SectionAdminProfile.jsx
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Key,
  Smartphone,
  Globe,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/apiService";
import { fmtDate, Badge } from "./AdminShared";

export default function SectionAdminProfile({
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  divLine,
  inputBg,
  showToast,
}) {
  const { user: authUser, updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
  });
  const [saving, setSaving] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [twoFactorQR, setTwoFactorQR] = useState("");

  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    setLoading(true);
    try {
      // Use the user from AuthContext instead of API call
      if (authUser) {
        setUser(authUser);
        setForm({
          firstName: authUser.firstName || "",
          lastName: authUser.lastName || "",
          email: authUser.email || "",
          phone: authUser.phone || "",
          username: authUser.username || "",
        });
        setTwoFactorEnabled(authUser.twoFactorEnabled || false);
      } else {
        // Fallback: try to get from localStorage or context
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setForm({
            firstName: parsedUser.firstName || "",
            lastName: parsedUser.lastName || "",
            email: parsedUser.email || "",
            phone: parsedUser.phone || "",
            username: parsedUser.username || "",
          });
          setTwoFactorEnabled(parsedUser.twoFactorEnabled || false);
        } else {
          showToast("Unable to load profile data", "error");
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await api.patch("/auth/update-profile", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        username: form.username,
      });

      const updatedUser = res.data?.data || res.data?.user;
      setUser(updatedUser);

      // Update AuthContext with new user data
      if (updateUser) {
        updateUser(updatedUser);
      }

      // Also update localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const currentUser = JSON.parse(storedUser);
        const mergedUser = { ...currentUser, ...updatedUser };
        localStorage.setItem("user", JSON.stringify(mergedUser));
      }

      showToast("Profile updated successfully", "success");
      setEditing(false);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update profile",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const res = await api.post("/auth/enable-2fa");
      setTwoFactorSecret(res.data?.data?.secret);
      setTwoFactorQR(res.data?.data?.qrCode);
      setShow2FAModal(true);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to enable 2FA", "error");
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      showToast("Please enter a valid 6-digit code", "error");
      return;
    }

    try {
      await api.post("/auth/verify-2fa", {
        code: twoFactorCode,
        secret: twoFactorSecret,
      });
      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      setTwoFactorCode("");
      showToast("2FA enabled successfully", "success");
      loadAdminProfile();
    } catch (err) {
      showToast(err.response?.data?.message || "Invalid code", "error");
    }
  };

  const handleDisable2FA = async () => {
    try {
      await api.post("/auth/disable-2fa");
      setTwoFactorEnabled(false);
      showToast("2FA disabled successfully", "success");
      loadAdminProfile();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to disable 2FA",
        "error",
      );
    }
  };

  const iStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${border}`,
    background: inputBg,
    color: textClr,
    fontSize: "0.85rem",
    outline: "none",
    boxSizing: "border-box",
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50, color: muted }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ color: textClr, fontSize: "1.3rem", fontWeight: 700 }}>
            Admin Profile
          </h1>
          <p style={{ color: muted, fontSize: "0.75rem", marginTop: 2 }}>
            Manage your account settings and security
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: `1px solid ${border}`,
              background: "transparent",
              color: "#f59e0b",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            <Edit3 size={14} /> Edit Profile
          </button>
        )}
      </div>

      {/* Profile Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Profile Info Card */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#d97706,#f59e0b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: "#020617",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                }}
              >
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <div
                style={{ color: textClr, fontWeight: 700, fontSize: "1.1rem" }}
              >
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <Badge status={user?.role || "admin"} />
                <Badge status={user?.status || "active"} />
              </div>
            </div>
          </div>

          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label
                  style={{
                    color: muted,
                    fontSize: "0.7rem",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  First Name *
                </label>
                <input
                  style={iStyle}
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    color: muted,
                    fontSize: "0.7rem",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Last Name *
                </label>
                <input
                  style={iStyle}
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    color: muted,
                    fontSize: "0.7rem",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Email *
                </label>
                <input
                  style={iStyle}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label
                  style={{
                    color: muted,
                    fontSize: "0.7rem",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Phone
                </label>
                <input
                  style={iStyle}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label
                  style={{
                    color: muted,
                    fontSize: "0.7rem",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Username
                </label>
                <input
                  style={iStyle}
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 10,
                    border: `1px solid ${border}`,
                    background: "transparent",
                    color: textClr,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg,#f59e0b,#d97706)",
                    color: "#020617",
                    fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={14} color={muted} />
                <span style={{ color: textClr }}>{user?.email}</span>
              </div>
              {user?.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Smartphone size={14} color={muted} />
                  <span style={{ color: textClr }}>{user?.phone}</span>
                </div>
              )}
              {user?.username && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <User size={14} color={muted} />
                  <span style={{ color: textClr }}>@{user?.username}</span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={14} color={muted} />
                <span style={{ color: muted, fontSize: "0.8rem" }}>
                  Joined: {fmtDate(user?.createdAt)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Security Card */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <h3
            style={{
              color: textClr,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Shield size={18} color="#f59e0b" /> Security Settings
          </h3>

          {/* 2FA Section */}
          <div
            style={{
              padding: "16px",
              borderRadius: 12,
              background: darkMode
                ? "rgba(255,255,255,0.03)"
                : "rgba(0,0,0,0.02)",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{ color: textClr, fontWeight: 600, marginBottom: 4 }}
                >
                  Two-Factor Authentication (2FA)
                </div>
                <div style={{ color: muted, fontSize: "0.7rem" }}>
                  {twoFactorEnabled
                    ? "Your account is protected with 2FA"
                    : "Add an extra layer of security to your account"}
                </div>
              </div>
              {twoFactorEnabled ? (
                <button
                  onClick={handleDisable2FA}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(248,113,113,0.3)",
                    background: "rgba(248,113,113,0.1)",
                    color: "#f87171",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  onClick={handleEnable2FA}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: "linear-gradient(135deg,#f59e0b,#d97706)",
                    color: "#020617",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Enable 2FA
                </button>
              )}
            </div>
          </div>

          {/* Change Password */}
          <div
            style={{
              padding: "16px",
              borderRadius: 12,
              background: darkMode
                ? "rgba(255,255,255,0.03)"
                : "rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{ color: textClr, fontWeight: 600, marginBottom: 4 }}
                >
                  Change Password
                </div>
                <div style={{ color: muted, fontSize: "0.7rem" }}>
                  Update your password regularly to stay secure
                </div>
              </div>
              <button
                onClick={() => navigate("/dashboard/change-password")}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: `1px solid ${border}`,
                  background: "transparent",
                  color: textClr,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Change
              </button>
            </div>
          </div>
        </div>

        {/* Account Info Card */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <h3
            style={{
              color: textClr,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Globe size={18} color="#f59e0b" /> Account Information
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ color: muted, fontSize: "0.65rem" }}>User ID</div>
              <div
                style={{
                  color: textClr,
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                }}
              >
                {user?._id}
              </div>
            </div>
            <div>
              <div style={{ color: muted, fontSize: "0.65rem" }}>Role</div>
              <div
                style={{
                  color: "#f59e0b",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {user?.role?.toUpperCase()}
              </div>
            </div>
            <div>
              <div style={{ color: muted, fontSize: "0.65rem" }}>
                Account Status
              </div>
              <Badge status={user?.status || "active"} />
            </div>
            <div>
              <div style={{ color: muted, fontSize: "0.65rem" }}>
                Last Login
              </div>
              <div style={{ color: textClr, fontSize: "0.75rem" }}>
                {fmtDate(user?.lastLoginAt)}
              </div>
            </div>
            {user?.lastLoginIp && (
              <div>
                <div style={{ color: muted, fontSize: "0.65rem" }}>
                  Last Login IP
                </div>
                <div
                  style={{
                    color: textClr,
                    fontSize: "0.7rem",
                    fontFamily: "monospace",
                  }}
                >
                  {user?.lastLoginIp}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
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
            onClick={() => setShow2FAModal(false)}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 24,
              width: "100%",
              maxWidth: 450,
              padding: 24,
            }}
          >
            <h3 style={{ color: textClr, marginBottom: 16 }}>Enable 2FA</h3>
            <p style={{ color: muted, fontSize: "0.8rem", marginBottom: 16 }}>
              1. Scan the QR code with Google Authenticator or Authy
            </p>
            {twoFactorQR && (
              <div
                style={{
                  background: "#fff",
                  padding: 16,
                  borderRadius: 12,
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <img
                  src={twoFactorQR}
                  alt="2FA QR Code"
                  style={{ width: 180, height: 180 }}
                />
              </div>
            )}
            <p style={{ color: muted, fontSize: "0.8rem", marginBottom: 8 }}>
              2. Enter the 6-digit code from your app
            </p>
            <input
              type="text"
              placeholder="000000"
              maxLength="6"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${border}`,
                background: inputBg,
                color: textClr,
                fontSize: "0.9rem",
                textAlign: "center",
                letterSpacing: 4,
                marginBottom: 16,
              }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShow2FAModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: `1px solid ${border}`,
                  background: "transparent",
                  color: textClr,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleVerify2FA}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                  color: "#020617",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Verify & Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
