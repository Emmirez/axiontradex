import React, { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle,
  Loader,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/apiService";
import { useTranslation } from "react-i18next";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";

export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  const iStyle = {
    width: "100%",
    padding: "10px 40px 10px 12px",
    borderRadius: 10,
    border: `1px solid ${border}`,
    background: inputBg,
    color: textClr,
    fontSize: "0.88rem",
    boxSizing: "border-box",
    outline: "none",
  };

  // Password strength
  const pwd = form.newPassword;
  const checks = [
    { label: t("at_least_8_characters"), ok: pwd.length >= 8 },
    { label: t("uppercase_letter"), ok: /[A-Z]/.test(pwd) },
    { label: t("lowercase_letter"), ok: /[a-z]/.test(pwd) },
    { label: t("number"), ok: /[0-9]/.test(pwd) },
    { label: t("special_character"), ok: /[^A-Za-z0-9]/.test(pwd) },
  ];
  const strength = checks.filter((c) => c.ok).length;
  const strengthColor =
    strength <= 1 ? "#f87171" : strength <= 3 ? "#f59e0b" : "#34d399";
  const strengthLabel =
    strength <= 1 ? t("weak") : strength <= 3 ? t("fair") : t("strong");

  const handleSubmit = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError(t("all_fields_required"));
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError(t("passwords_do_not_match"));
      return;
    }
    if (form.newPassword.length < 8) {
      setError(t("password_min_8_characters"));
      return;
    }
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await api.patch("/users/change-password", {
        //  was /user/change-password
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || t("failed_to_change_password"));
    } finally {
      setSaving(false);
    }
  };

  const PasswordField = ({ label, fieldKey, showKey }) => (
    <div>
      <label
        style={{
          color: muted,
          fontSize: "0.7rem",
          fontWeight: 700,
          display: "block",
          marginBottom: 5,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          style={iStyle}
          type={show[showKey] ? "text" : "password"}
          placeholder="••••••••"
          value={form[fieldKey]}
          onChange={(e) =>
            setForm((f) => ({ ...f, [fieldKey]: e.target.value }))
          }
          onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = border)}
        />
        <button
          onClick={() => setShow((s) => ({ ...s, [showKey]: !s[showKey] }))}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: muted,
            cursor: "pointer",
            padding: 0,
            display: "flex",
          }}
        >
          {show[showKey] ? (
            <EyeOff style={{ width: 15, height: 15 }} />
          ) : (
            <Eye style={{ width: 15, height: 15 }} />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <DashboardNav />
      <div style={{ paddingTop: 80, paddingBottom: 80, minHeight: "100vh" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ marginBottom: 28 }}>
            <h1
              style={{
                color: textClr,
                fontWeight: 800,
                fontSize: "1.4rem",
                margin: 0,
              }}
            >
              {t("change_password")}
            </h1>
            <p style={{ color: muted, fontSize: "0.82rem", margin: "4px 0 0" }}>
              {t("keep_account_secure")}
            </p>
          </div>

          {/* Security badge */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "18px 20px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(52,211,153,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldCheck
                style={{ width: 20, height: 20, color: "#34d399" }}
              />
            </div>
            <div>
              <div
                style={{ color: textClr, fontWeight: 700, fontSize: "0.85rem" }}
              >
                {t("password_security")}
              </div>
              <div style={{ color: muted, fontSize: "0.75rem", marginTop: 2 }}>
                {t("unique_password_note")}
              </div>
            </div>
          </div>

          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <PasswordField
                label={t("current_password")}
                fieldKey="currentPassword"
                showKey="current"
              />
              <div style={{ height: 1, background: divLine }} />
              <PasswordField
                label={t("new_password")}
                fieldKey="newPassword"
                showKey="new"
              />

              {/* Strength meter */}
              {pwd.length > 0 && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        color: muted,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                      }}
                    >
                      {t("password_strength")}
                    </span>
                    <span
                      style={{
                        color: strengthColor,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      {strengthLabel}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 3,
                          borderRadius: 99,
                          background:
                            i <= strength
                              ? strengthColor
                              : darkMode
                                ? "rgba(255,255,255,0.08)"
                                : "rgba(0,0,0,0.08)",
                          transition: "background 0.2s",
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "4px 12px",
                      marginTop: 10,
                    }}
                  >
                    {checks.map((c) => (
                      <div
                        key={c.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: c.ok
                              ? "#34d399"
                              : darkMode
                                ? "rgba(255,255,255,0.15)"
                                : "rgba(0,0,0,0.15)",
                            transition: "background 0.2s",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            color: c.ok ? "#34d399" : muted,
                            fontSize: "0.68rem",
                            fontWeight: c.ok ? 600 : 400,
                          }}
                        >
                          {c.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <PasswordField
                label={t("confirm_new_password")}
                fieldKey="confirmPassword"
                showKey="confirm"
              />

              {/* Match indicator */}
              {form.confirmPassword && (
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color:
                      form.newPassword === form.confirmPassword
                        ? "#34d399"
                        : "#f87171",
                  }}
                >
                  {form.newPassword === form.confirmPassword
                    ? t("passwords_match")
                    : t("passwords_do_not_match_indicator")}
                </div>
              )}
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
                <CheckCircle style={{ width: 14, height: 14 }} />{" "}
                {t("password_changed_success")}
              </div>
            )}

            <button
              onClick={handleSubmit}
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
                  {t("updating")}
                </>
              ) : (
                <>
                  <Lock style={{ width: 15, height: 15 }} />{" "}
                  {t("update_password")}
                </>
              )}
            </button>
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
      <BottomNav />
    </div>
  );
}
