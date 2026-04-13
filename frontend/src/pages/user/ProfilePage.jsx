import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  Camera,
  CheckCircle,
  Loader,
  Shield,
  ShieldCheck,
  ShieldOff,
  Copy,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/apiService";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import { useTranslation } from "react-i18next";

// Select Component with custom dropdown
function EnhancedSelect({
  value,
  onChange,
  options,
  darkMode,
  textClr,
  muted,
  border,
  inputBg,
  t,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get selected option display text
  const getSelectedDisplay = () => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value || t("select_currency");
  };

  // Find selected option for styling
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={selectRef} style={{ position: "relative", width: "100%" }}>
      {/* Custom Select Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 12,
          border: `1px solid ${isOpen ? "#f59e0b" : border}`,
          background:
            inputBg ||
            (darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"),
          color: textClr,
          fontSize: "0.88rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          transition: "all 0.2s ease",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            fontWeight: 500,
            color: selectedOption?.color || textClr,
          }}
        >
          {getSelectedDisplay()}
        </span>
        <ChevronDown
          style={{
            width: 16,
            height: 16,
            color: isOpen ? "#f59e0b" : muted,
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 8,
            background: darkMode ? "rgba(30,41,59,0.98)" : "#fff",
            backdropFilter: "blur(12px)",
            border: `1px solid ${border}`,
            borderRadius: 14,
            overflow: "hidden",
            zIndex: 50,
            boxShadow: darkMode
              ? "0 10px 25px -5px rgba(0,0,0,0.3)"
              : "0 10px 25px -5px rgba(0,0,0,0.1)",
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <div
                key={option.value}
                onClick={() => {
                  onChange({ target: { value: option.value } });
                  setIsOpen(false);
                }}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  color: isSelected ? "#f59e0b" : textClr,
                  backgroundColor: isSelected
                    ? darkMode
                      ? "rgba(245,158,11,0.1)"
                      : "rgba(245,158,11,0.05)"
                    : "transparent",
                  fontSize: "0.85rem",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontFamily: option.mono ? "monospace" : "inherit",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = darkMode
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {option.icon && (
                    <span style={{ fontSize: "1rem" }}>{option.icon}</span>
                  )}
                  <span>{option.label}</span>
                </div>
                {isSelected && (
                  <CheckCircle
                    style={{ width: 14, height: 14, color: "#f59e0b" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    homeAddress: user?.homeAddress || "",
    country: user?.country || "",
    currency: user?.currency || "USD",
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 2FA state
  const [twoFAStep, setTwoFAStep] = useState("idle");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [disablePw, setDisablePw] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAMsg, setTwoFAMsg] = useState(null); // { text, type }
  const [twoFAEnabled, setTwoFAEnabled] = useState(
    user?.twoFactorEnabled || false,
  );

  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successPw, setSuccessPw] = useState(false);
  const [error, setError] = useState("");
  const [errorPw, setErrorPw] = useState("");

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  const iStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${border}`,
    background: inputBg,
    color: textClr,
    fontSize: "0.88rem",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const labelStyle = {
    color: muted,
    fontSize: "0.7rem",
    fontWeight: 700,
    display: "block",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
    "U";

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await api.patch("/users/me", form);
      if (setUser) setUser(res.data?.data?.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || t("failed_to_save_profile"));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setErrorPw("");
    setSuccessPw(false);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setErrorPw(t("passwords_do_not_match"));
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setErrorPw(t("password_min_length"));
      return;
    }
    setSavingPw(true);
    try {
      await api.patch("/users/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setSuccessPw(true);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccessPw(false), 3000);
    } catch (err) {
      setErrorPw(err.response?.data?.message || t("failed_to_change_password"));
    } finally {
      setSavingPw(false);
    }
  };

  //  2FA handlers
  const handle2FASetup = async () => {
    setTwoFALoading(true);
    setTwoFAMsg(null);
    setTwoFAStep("setup");
    try {
      const res = await api.post("/auth/2fa/setup");
      setQrCode(res.data?.data?.qrCode);
      setSecret(res.data?.data?.secret);
      setTwoFAStep("verify");
    } catch (err) {
      setTwoFAMsg({
        text: err.response?.data?.message || t("setup_failed"),
        type: "error",
      });
      setTwoFAStep("idle");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handle2FAEnable = async () => {
    if (!totpToken || totpToken.length < 6) {
      setTwoFAMsg({
        text: t("enter_6_digit_code"),
        type: "error",
      });
      return;
    }
    setTwoFALoading(true);
    setTwoFAMsg(null);
    try {
      await api.post("/auth/2fa/enable", { token: totpToken });

      setTwoFAEnabled(true);
      setTwoFAStep("idle");
      setTotpToken("");
      setQrCode("");
      setSecret("");
      setTwoFAMsg({
        text: t("2fa_enabled_success"),
        type: "success",
      });
    } catch (err) {
      setTwoFAMsg({
        text: t("enter_password_to_disable"),
        type: "error",
      });
    } finally {
      setTwoFALoading(false);
    }
  };

  const handle2FADisable = async () => {
    if (!disablePw) {
      setTwoFAMsg({
        text: t("enter_password_to_disable"),
        type: "error",
      });
      return;
    }
    setTwoFALoading(true);
    setTwoFAMsg(null);
    try {
      await api.post("/auth/2fa/disable", { password: disablePw });

      // Update UI immediately
      setTwoFAEnabled(false);
      setTwoFAStep("idle");
      setDisablePw("");
      setTwoFAMsg({
        text: t("2fa_disabled_success"),
        type: "success",
      });
    } catch (err) {
      setTwoFAMsg({
        text: err.response?.data?.message || t("incorrect_password"),
        type: "error",
      });
    } finally {
      setTwoFALoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setTwoFAMsg({ text: t("secret_copied"), type: "success" });
    setTimeout(() => setTwoFAMsg(null), 2000);
  };

  const FIELDS = [
    { key: "firstName", labelKey: "first_name", ph: "John", half: true },
    { key: "lastName", labelKey: "last_name", ph: "Doe", half: true },
    { key: "phone", labelKey: "phone_number", ph: "+1 234 567 89", half: true },
    { key: "country", labelKey: "country", ph: "United States", half: true },
    {
      key: "homeAddress",
      labelKey: "home_address",
      ph: "123 Main St…",
      half: false,
    },
  ];

  const CURRENCIES = [
    "USD",
    "EUR",
    "GBP",
    "USDT",
    "BTC",
    "ETH",
    "NGN",
    "AUD",
    "CAD",
    "JPY",
  ];

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <DashboardNav />

      <div style={{ paddingTop: 80, paddingBottom: 80, minHeight: "100vh" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px" }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1
              style={{
                color: textClr,
                fontWeight: 800,
                fontSize: "1.4rem",
                margin: 0,
              }}
            >
              {t("profile_settings")}
            </h1>
            <p style={{ color: muted, fontSize: "0.82rem", margin: "4px 0 0" }}>
              {t("profile_subtitle")}
            </p>
          </div>

          {/* Avatar card */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "24px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#d97706,#f59e0b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#020617",
                }}
              >
                {initials}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: `2px solid ${cardBg}`,
                }}
              >
                <Camera style={{ width: 11, height: 11, color: "#020617" }} />
              </div>
            </div>
            <div>
              <div
                style={{ color: textClr, fontWeight: 700, fontSize: "1rem" }}
              >
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ color: muted, fontSize: "0.78rem", marginTop: 2 }}>
                {user?.email}
              </div>
              <div style={{ marginTop: 6 }}>
                <span
                  style={{
                    padding: "2px 10px",
                    borderRadius: 99,
                    background: "rgba(245,158,11,0.12)",
                    color: "#f59e0b",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                  }}
                >
                  {user?.role?.toUpperCase() || "USER"}
                </span>
              </div>
            </div>
          </div>

          {/* Personal info form */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "24px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                color: textClr,
                fontWeight: 700,
                fontSize: "0.9rem",
                marginBottom: 18,
                paddingBottom: 12,
                borderBottom: `1px solid ${divLine}`,
              }}
            >
              {t("personal_information")}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              {FIELDS.map(({ key, labelKey, ph, half }) => (
                <div
                  key={key}
                  style={{ gridColumn: half ? "span 1" : "span 2" }}
                >
                  <label style={labelStyle}>{t(labelKey)}</label>
                  <input
                    style={iStyle}
                    placeholder={ph}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    onFocus={(e) =>
                      (e.target.style.borderColor = "rgba(245,158,11,0.5)")
                    }
                    onBlur={(e) => (e.target.style.borderColor = border)}
                  />
                </div>
              ))}
              {/* Currency Selection with Enhanced Select */}
              {/* <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>{t("preferred_currency")}</label>
                <EnhancedSelect
                  value={form.currency}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, currency: e.target.value }))
                  }
                  options={[
                    {
                      value: "USD",
                      label: "💵 USD - US Dollar",

                      color: "#34d399",
                    },
                    {
                      value: "EUR",
                      label: "💶 EUR - Euro",

                      color: "#60a5fa",
                    },
                    {
                      value: "GBP",
                      label: "💷 GBP - British Pound",

                      color: "#f87171",
                    },
                    {
                      value: "USDT",
                      label: "₿ USDT - Tether",

                      color: "#34d399",
                      mono: true,
                    },
                    {
                      value: "BTC",
                      label: "₿ BTC - Bitcoin",

                      color: "#f59e0b",
                      mono: true,
                    },
                    {
                      value: "ETH",
                      label: "⟠ ETH - Ethereum",

                      color: "#a78bfa",
                      mono: true,
                    },
                    {
                      value: "AUD",
                      label: "A$ AUD - Australian Dollar",

                      color: "#f59e0b",
                    },
                    {
                      value: "CAD",
                      label: "C$ CAD - Canadian Dollar",

                      color: "#f87171",
                    },
                    {
                      value: "JPY",
                      label: "¥ JPY - Japanese Yen",

                      color: "#60a5fa",
                    },
                  ]}
                  darkMode={darkMode}
                  textClr={textClr}
                  muted={muted}
                  border={border}
                  inputBg={inputBg}
                  t={t}
                />
              </div> */}
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>{t("email_address")}</label>
              <input
                style={{ ...iStyle, opacity: 0.5, cursor: "not-allowed" }}
                value={user?.email || ""}
                readOnly
              />
              <div style={{ color: muted, fontSize: "0.68rem", marginTop: 4 }}>
                {t("email_cannot_be_changed")}
              </div>
            </div>
            {error && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  borderRadius: 9,
                  background: "rgba(248,113,113,0.1)",
                  border: "1px solid rgba(248,113,113,0.25)",
                  color: "#f87171",
                  fontSize: "0.8rem",
                }}
              >
                {error}
              </div>
            )}
            {success && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  borderRadius: 9,
                  background: "rgba(52,211,153,0.1)",
                  border: "1px solid rgba(52,211,153,0.25)",
                  color: "#34d399",
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <CheckCircle style={{ width: 14, height: 14 }} /> 
                {t("profile_updated_success")}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                marginTop: 20,
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg,#d97706,#f59e0b)",
                color: "#020617",
                fontWeight: 800,
                fontSize: "0.9rem",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {saving ? (
                <>
                  <Loader
                    style={{
                      width: 15,
                      height: 15,
                      animation: "spin 1s linear infinite",
                    }}
                  />{" "}
                  {t("saving_dots")}
                </>
              ) : (
                <>
                  <Save style={{ width: 15, height: 15 }} /> {t("save_changes")}
                </>
              )}
            </button>
          </div>

          {/* Change password */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "24px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                color: textClr,
                fontWeight: 700,
                fontSize: "0.9rem",
                marginBottom: 18,
                paddingBottom: 12,
                borderBottom: `1px solid ${divLine}`,
              }}
            >
              {t("change_password")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                {
                  key: "currentPassword",
                  labelKey: "current_password",
                  ph: t("enter_current_password"),
                },
                {
                  key: "newPassword",
                  labelKey: "new_password",
                  ph: t("min_8_characters"),
                },
                {
                  key: "confirmPassword",
                  labelKey: "confirm_password",
                  ph: t("repeat_new_password"),
                },
              ].map(({ key, labelKey, ph }) => (
                <div key={key}>
                  <label style={labelStyle}>{t(labelKey)}</label>
                  <input
                    type="password"
                    style={iStyle}
                    placeholder={ph}
                    value={pwForm[key]}
                    onChange={(e) =>
                      setPwForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    onFocus={(e) =>
                      (e.target.style.borderColor = "rgba(245,158,11,0.5)")
                    }
                    onBlur={(e) => (e.target.style.borderColor = border)}
                  />
                </div>
              ))}
            </div>
            {errorPw && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  borderRadius: 9,
                  background: "rgba(248,113,113,0.1)",
                  border: "1px solid rgba(248,113,113,0.25)",
                  color: "#f87171",
                  fontSize: "0.8rem",
                }}
              >
                {errorPw}
              </div>
            )}
            {successPw && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  borderRadius: 9,
                  background: "rgba(52,211,153,0.1)",
                  border: "1px solid rgba(52,211,153,0.25)",
                  color: "#34d399",
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <CheckCircle style={{ width: 14, height: 14 }} />{" "}
                {t("password_changed_success")}
              </div>
            )}
            <button
              onClick={handleChangePassword}
              disabled={savingPw}
              style={{
                marginTop: 20,
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg,#1e3a5f,#2563eb)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "0.9rem",
                cursor: savingPw ? "not-allowed" : "pointer",
                opacity: savingPw ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {savingPw ? (
                <>
                  <Loader
                    style={{
                      width: 15,
                      height: 15,
                      animation: "spin 1s linear infinite",
                    }}
                  />{" "}
                  {t("updating_dots")}
                </>
              ) : (
                t("update_password")
              )}
            </button>
          </div>

          {/*  Two-Factor Authentication */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${twoFAEnabled ? "rgba(52,211,153,0.3)" : border}`,
              borderRadius: 20,
              padding: "24px",
            }}
          >
            {/* Section header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
                paddingBottom: 12,
                borderBottom: `1px solid ${divLine}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {twoFAEnabled ? (
                  <ShieldCheck
                    style={{ width: 20, height: 20, color: "#34d399" }}
                  />
                ) : (
                  <Shield style={{ width: 20, height: 20, color: muted }} />
                )}
                <div>
                  <div
                    style={{
                      color: textClr,
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  >
                    {t("two_factor_authentication")}
                  </div>
                  <div style={{ color: muted, fontSize: "0.72rem" }}>
                    {twoFAEnabled
                      ? t("2fa_active_description")
                      : t("2fa_inactive_description")}
                  </div>
                </div>
              </div>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 99,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  background: twoFAEnabled
                    ? "rgba(52,211,153,0.12)"
                    : "rgba(100,116,139,0.12)",
                  color: twoFAEnabled ? "#34d399" : "#94a3b8",
                }}
              >
                {twoFAEnabled ? t("enabled") : t("disabled")}
              </span>
            </div>

            {/* Feedback message */}
            {twoFAMsg && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "10px 14px",
                  borderRadius: 9,
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  background:
                    twoFAMsg.type === "error"
                      ? "rgba(248,113,113,0.1)"
                      : "rgba(52,211,153,0.1)",
                  border:
                    twoFAMsg.type === "error"
                      ? "1px solid rgba(248,113,113,0.25)"
                      : "1px solid rgba(52,211,153,0.25)",
                  color: twoFAMsg.type === "error" ? "#f87171" : "#34d399",
                }}
              >
                <CheckCircle style={{ width: 14, height: 14 }} />
                {twoFAMsg.text}
              </div>
            )}

            {/*  IDLE state — not enabled  */}
            {twoFAStep === "idle" && !twoFAEnabled && (
              <div>
                <p
                  style={{
                    color: muted,
                    fontSize: "0.82rem",
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}
                >
                  {t("2fa_setup_description")}{" "}
                  <strong style={{ color: textClr }}>
                    {t("google_authenticator")}
                  </strong>{" "}
                  {t("or")}{" "}
                  <strong style={{ color: textClr }}>{t("authy")}</strong>{" "}
                  {t("2fa_benefit_description")}
                </p>
                <button
                  onClick={() => {
                    setTwoFAStep("setup");
                    handle2FASetup();
                  }}
                  disabled={twoFALoading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg,#1e3a5f,#2563eb)",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: twoFALoading ? "not-allowed" : "pointer",
                    opacity: twoFALoading ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {twoFALoading ? (
                    <>
                      <Loader
                        style={{
                          width: 15,
                          height: 15,
                          animation: "spin 1s linear infinite",
                        }}
                      />{" "}
                      {t("setting_up_dots")}
                    </>
                  ) : (
                    <>
                      <Shield style={{ width: 15, height: 15 }} />{" "}
                      {t("enable_two_factor")}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Loading UI */}
            {twoFAStep === "setup" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "30px 0",
                  gap: 16,
                }}
              >
                <Loader
                  style={{
                    width: 32,
                    height: 32,
                    color: "#f59e0b",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <div style={{ color: muted, fontSize: "0.85rem" }}>
                  {t("generating_qr_code")}
                </div>
              </div>
            )}

            {/*  VERIFY state — show QR + enter code  */}
            {twoFAStep === "verify" && (
              <div>
                <p
                  style={{
                    color: muted,
                    fontSize: "0.82rem",
                    marginBottom: 16,
                  }}
                >
                  {t("scan_qr_instructions")}
                </p>

                {/* QR Code */}
                {qrCode && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        padding: 16,
                        background: "#ffffff",
                        borderRadius: 16,
                        display: "inline-block",
                      }}
                    >
                      <img
                        src={qrCode}
                        alt="2FA QR Code"
                        style={{ width: 180, height: 180, display: "block" }}
                      />
                    </div>
                  </div>
                )}

                {/* Manual secret */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>{t("manual_entry_key")}</label>
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <div
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: `1px solid ${border}`,
                        background: inputBg,
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        color: textClr,
                        letterSpacing: "0.08em",
                        wordBreak: "break-all",
                      }}
                    >
                      {showSecret ? secret : secret.replace(/./g, "•")}
                    </div>
                    <button
                      onClick={() => setShowSecret((s) => !s)}
                      style={{
                        padding: "10px",
                        borderRadius: 10,
                        border: `1px solid ${border}`,
                        background: "transparent",
                        cursor: "pointer",
                        color: muted,
                        display: "flex",
                      }}
                    >
                      {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={copySecret}
                      style={{
                        padding: "10px",
                        borderRadius: 10,
                        border: `1px solid ${border}`,
                        background: "transparent",
                        cursor: "pointer",
                        color: muted,
                        display: "flex",
                      }}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <div
                    style={{ color: muted, fontSize: "0.68rem", marginTop: 4 }}
                  >
                    {t("manual_entry_hint")}
                  </div>
                </div>

                {/* TOTP input */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>{t("verification_code")}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={totpToken}
                    onChange={(e) =>
                      setTotpToken(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    style={{
                      ...iStyle,
                      textAlign: "center",
                      letterSpacing: "0.3em",
                      fontSize: "1.4rem",
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "rgba(245,158,11,0.5)")
                    }
                    onBlur={(e) => (e.target.style.borderColor = border)}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <button
                    onClick={() => {
                      setTwoFAStep("idle");
                      setTotpToken("");
                      setQrCode("");
                      setSecret("");
                      setTwoFAMsg(null);
                    }}
                    style={{
                      padding: "11px",
                      borderRadius: 12,
                      border: `1px solid ${border}`,
                      background: "transparent",
                      color: textClr,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={handle2FAEnable}
                    disabled={twoFALoading || totpToken.length < 6}
                    style={{
                      padding: "11px",
                      borderRadius: 12,
                      border: "none",
                      background: "linear-gradient(135deg,#d97706,#f59e0b)",
                      color: "#020617",
                      fontWeight: 700,
                      cursor:
                        twoFALoading || totpToken.length < 6
                          ? "not-allowed"
                          : "pointer",
                      opacity: twoFALoading || totpToken.length < 6 ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {twoFALoading ? (
                      <>
                        <Loader
                          style={{
                            width: 14,
                            height: 14,
                            animation: "spin 1s linear infinite",
                          }}
                        />{" "}
                        {t("verifying_dots")}
                      </>
                    ) : (
                      <>
                        <ShieldCheck style={{ width: 14, height: 14 }} />{" "}
                        {t("confirm_and_enable")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/*  ENABLED state */}
            {twoFAStep === "idle" && twoFAEnabled && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: 14,
                    background: "rgba(52,211,153,0.06)",
                    border: "1px solid rgba(52,211,153,0.15)",
                    marginBottom: 16,
                  }}
                >
                  <ShieldCheck
                    style={{
                      width: 20,
                      height: 20,
                      color: "#34d399",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        color: "#34d399",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      {t("2fa_is_active")}
                    </div>
                    <div style={{ color: muted, fontSize: "0.72rem" }}>
                      {t("2fa_active_description")}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTwoFAStep("disable");
                    setTwoFAMsg(null);
                  }}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: 12,
                    border: "1px solid rgba(248,113,113,0.3)",
                    background: "rgba(248,113,113,0.06)",
                    color: "#f87171",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <ShieldOff style={{ width: 14, height: 14 }} /> 
                  {t("disable_two_factor")}
                </button>
              </div>
            )}

            {/*  DISABLE confirm  */}
            {twoFAStep === "disable" && (
              <div>
                <p
                  style={{
                    color: muted,
                    fontSize: "0.82rem",
                    marginBottom: 14,
                  }}
                >
                  {t("disable_2fa_warning")}
                </p>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>{t("your_password")}</label>
                  <input
                    type="password"
                    value={disablePw}
                    onChange={(e) => setDisablePw(e.target.value)}
                    placeholder={t("enter_current_password")}
                    style={iStyle}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "rgba(248,113,113,0.5)")
                    }
                    onBlur={(e) => (e.target.style.borderColor = border)}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <button
                    onClick={() => {
                      setTwoFAStep("idle");
                      setDisablePw("");
                      setTwoFAMsg(null);
                    }}
                    style={{
                      padding: "11px",
                      borderRadius: 12,
                      border: `1px solid ${border}`,
                      background: "transparent",
                      color: textClr,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={handle2FADisable}
                    disabled={twoFALoading || !disablePw}
                    style={{
                      padding: "11px",
                      borderRadius: 12,
                      background: "rgba(248,113,113,0.15)",
                      color: "#f87171",
                      fontWeight: 700,
                      cursor:
                        twoFALoading || !disablePw ? "not-allowed" : "pointer",
                      opacity: twoFALoading || !disablePw ? 0.6 : 1,
                      border: "1px solid rgba(248,113,113,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {twoFALoading ? (
                      <>
                        <Loader
                          style={{
                            width: 14,
                            height: 14,
                            animation: "spin 1s linear infinite",
                          }}
                        />{" "}
                        {t("disabling_dots")}
                      </>
                    ) : (
                      <>
                        <ShieldOff style={{ width: 14, height: 14 }} />{" "}
                        {t("disable_2fa")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <BottomNav />
    </div>
  );
}
