import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { AuthHeader, AuthFooter } from "../../components/AuthLayout";
import { useTranslation } from 'react-i18next';
import authService from "../../services/authService";

export default function ForgotPassword() {
  const { darkMode } = useTheme();
  const [email, setEmail] = useState("");
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const cardBg = darkMode ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.92)";
  const labelClr = darkMode ? "#94a3b8" : "#475569";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#475569" : "#94a3b8";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
     setError(t("email_required"));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
    setError(t("valid_email_required"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
            t("something_went_wrong"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode ? "#020617" : "#f1f5f9",
        display: "flex",
        flexDirection: "column",
        transition: "background 0.3s",
      }}
    >
      <AuthHeader />

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 24px 40px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 440 }}>
          {/* Card */}
          <div
            style={{
              background: cardBg,
              border: "1px solid rgba(245,158,11,0.15)",
              borderRadius: 24,
              padding: "36px 32px",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            {sent ? (
              /*  Success state */
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    background: "rgba(245,158,11,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <CheckCircle
                    style={{ width: 34, height: 34, color: "#f59e0b" }}
                  />
                </div>
                <h3
                  style={{
                    fontFamily: '"Playfair Display",serif',
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    color: textClr,
                    marginBottom: 10,
                  }}
                >
                  {t("check_your_email")}
                </h3>
                <p
                  style={{
                    color: mutedClr,
                    fontSize: "0.875rem",
                    lineHeight: 1.7,
                    marginBottom: 8,
                  }}
                >
                   {t("reset_link_sent")}
                </p>
                <p
                  style={{
                    color: "#f59e0b",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    marginBottom: 28,
                  }}
                >
                  {email}
                </p>
                <p
                  style={{
                    color: mutedClr,
                    fontSize: "0.8rem",
                    lineHeight: 1.6,
                    marginBottom: 28,
                  }}
                >
                  {t("didnt_receive_email")}{" "}
                  <button
                    onClick={() => {
                      setSent(false);
                      setEmail("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#f59e0b",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      padding: 0,
                    }}
                  >
                    {t("try_again")}
                  </button>
                  .
                </p>
                <Link
                  to="/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#f59e0b",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  <ArrowLeft style={{ width: 15, height: 15 }} />
                   {t("back_to_sign_in")}
                </Link>
              </div>
            ) : (
              /* Form state  */
              <>
                {/* Icon */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "rgba(245,158,11,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <Mail style={{ width: 24, height: 24, color: "#f59e0b" }} />
                </div>

                <h3
                  style={{
                    fontFamily: '"Playfair Display",serif',
                    fontWeight: 700,
                    fontSize: "1.6rem",
                    color: textClr,
                    marginBottom: 8,
                  }}
                >
                   {t("forgot_password")}
                </h3>
                <p
                  style={{
                    color: mutedClr,
                    fontSize: "0.85rem",
                    lineHeight: 1.6,
                    marginBottom: 28,
                  }}
                >
                 {t("forgot_password_desc")}
                </p>

                <form
                  onSubmit={handleSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: 18 }}
                >
                  {/* Email field */}
                  <div>
                    <label
                      style={{
                        color: labelClr,
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      {t("email_address")}
                    </label>
                    <div style={{ position: "relative" }}>
                      <Mail
                        style={{
                          position: "absolute",
                          left: 14,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 15,
                          height: 15,
                          color: "#475569",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        placeholder="john@example.com"
                        style={{
                          width: "100%",
                          background: darkMode
                            ? "rgba(15,23,42,0.6)"
                            : "rgba(248,250,252,0.8)",
                          border: `1px solid ${error ? "#ef4444" : "rgba(245,158,11,0.2)"}`,
                          borderRadius: 12,
                          padding: "11px 14px 11px 40px",
                          color: textClr,
                          fontSize: "0.875rem",
                          outline: "none",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#f59e0b";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = error
                            ? "#ef4444"
                            : "rgba(245,158,11,0.2)";
                        }}
                      />
                    </div>
                    {error && (
                      <p
                        style={{
                          color: "#ef4444",
                          fontSize: "0.75rem",
                          marginTop: 4,
                        }}
                      >
                        {error}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="gold-btn"
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: 14,
                      border: "none",
                      fontSize: "0.95rem",
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: loading ? 0.8 : 1,
                    }}
                  >
                    {loading ? (
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          border: "2px solid #020617",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "spin 0.7s linear infinite",
                        }}
                      />
                    ) : (
                      <>
                        <ArrowRight style={{ width: 17, height: 17 }} /> Send
                         {t("send_reset_link")}
                      </>
                    )}
                  </button>
                </form>

                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <Link
                    to="/login"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      color: mutedClr,
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#f59e0b";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = mutedClr;
                    }}
                  >
                    <ArrowLeft style={{ width: 14, height: 14 }} />
                     {t("back_to_sign_in")}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <AuthFooter />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
