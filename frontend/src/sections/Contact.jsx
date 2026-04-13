import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Clock,
  Send,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Twitter,
  Github,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
  FeaturePage,
  FeatureHero,
  CTABanner,
} from "../pages/features/FeatureLayout";
import { useTranslation } from "react-i18next";

export default function Contact() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();

  const OFFICES = [
    {
      city: t("london"),
      country: t("united_kingdom"),
      address: "30 St Mary Axe, EC3A 8BF",
      phone: "+44 20 7946 0958",
      color: "#f59e0b",
    },
    {
      city: t("new_york"),
      country: t("united_states"),
      address: "1 World Trade Center, NY 10007",
      phone: "+1 212 555 0198",
      color: "#60a5fa",
    },
    {
      city: t("singapore"),
      country: t("singapore"),
      address: "1 Raffles Place, 048616",
      phone: "+65 6521 0100",
      color: "#34d399",
    },
    {
      city: t("toronto"),
      country: t("canada"),
      address: "100 King Street West, Suite 3400",
      phone: "+1 416 555 0100",
      color: "#a78bfa",
    },
  ];

  const SUPPORT_OPTIONS = [
    {
      icon: MessageSquare,
      title: t("live_chat"),
      desc: t("live_chat_desc"),
      badge: t("online_now"),
      color: "#34d399",
      badgeBg: "rgba(52,211,153,0.15)",
    },
    {
      icon: Mail,
      title: t("email_support"),
      desc: t("email_support_desc"),
      badge: t("under_2hrs"),
      color: "#60a5fa",
      badgeBg: "rgba(96,165,250,0.15)",
    },
    {
      icon: Phone,
      title: t("phone_support"),
      desc: t("phone_support_desc"),
      badge: t("twenty_four_seven"),
      color: "#f59e0b",
      badgeBg: "rgba(245,158,11,0.15)",
    },
    {
      icon: MessageCircle,
      title: t("telegram"),
      desc: t("telegram_desc"),
      badge: t("fifty_k_members"),
      color: "#a78bfa",
      badgeBg: "rgba(167,139,250,0.15)",
    },
  ];

  const FAQS = [
    {
      q: t("reset_password_question"),
      a: t("reset_password_answer"),
    },
    {
      q: t("withdrawals_question"),
      a: t("withdrawals_answer"),
    },
    {
      q: t("kyc_question"),
      a: t("kyc_answer"),
    },
    {
      q: t("deposit_methods_question"),
      a: t("deposit_methods_answer"),
    },
    {
      q: t("suspicious_activity_question"),
      a: t("suspicious_activity_answer"),
    },
  ];

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [openFaq, setOpenFaq] = useState(null);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!form.subject.trim()) e.subject = "Required";
    if (!form.message.trim()) e.message = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
  };

  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const inputBg = darkMode ? "rgba(15,23,42,0.6)" : "rgba(248,250,252,0.9)";
  const border = "rgba(245,158,11,0.18)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  const inputStyle = (hasErr) => ({
    width: "100%",
    background: inputBg,
    border: `1px solid ${hasErr ? "#ef4444" : border}`,
    borderRadius: 12,
    padding: "11px 14px",
    color: textClr,
    fontSize: "0.875rem",
    outline: "none",
    fontFamily: "inherit",
    resize: "none",
  });

  const labelStyle = {
    color: mutedClr,
    fontSize: "0.78rem",
    fontWeight: 500,
    display: "block",
    marginBottom: 6,
  };

  return (
    <FeaturePage>
      <FeatureHero
        badge={t("contact_us")}
        title={t("were_here_to_help")}
        highlight={t("help")}
        subtitle={t("support_available")}
        icon={Mail}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
        {/* Support options */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 56,
          }}
        >
          {SUPPORT_OPTIONS.map((opt) => (
            <div
              key={opt.title}
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: "24px",
                transition: "all 0.3s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(245,158,11,0.35)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = border;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(245,158,11,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <opt.icon style={{ width: 20, height: 20, color: opt.color }} />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <h4
                  style={{
                    color: textClr,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  {opt.title}
                </h4>
                <span
                  style={{
                    background: opt.badgeBg,
                    color: opt.color,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                  }}
                >
                  {opt.badge}
                </span>
              </div>
              <p
                style={{
                  color: mutedClr,
                  fontSize: "0.82rem",
                  lineHeight: 1.5,
                }}
              >
                {opt.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Contact form + offices */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
            marginBottom: 56,
          }}
        >
          {/* Contact form */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 24,
              padding: "32px",
            }}
          >
            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    background: "rgba(52,211,153,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <CheckCircle
                    style={{ width: 34, height: 34, color: "#34d399" }}
                  />
                </div>
                <h3
                  style={{
                    fontFamily: '"Playfair Display",serif',
                    fontWeight: 700,
                    fontSize: "1.4rem",
                    color: textClr,
                    marginBottom: 10,
                  }}
                >
                  {t("message_sent")}
                </h3>
                <p
                  style={{
                    color: mutedClr,
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                    marginBottom: 24,
                  }}
                >
                  {t("message_sent_desc")}
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({
                      name: "",
                      email: "",
                      subject: "",
                      category: "",
                      message: "",
                    });
                  }}
                  style={{
                    background: "transparent",
                    border: `1px solid ${border}`,
                    borderRadius: 12,
                    padding: "10px 24px",
                    color: "#f59e0b",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                >
                  {t("send_another")}
                </button>
              </div>
            ) : (
              <>
                <h3
                  style={{
                    fontFamily: '"Playfair Display",serif',
                    fontWeight: 700,
                    fontSize: "1.3rem",
                    color: textClr,
                    marginBottom: 6,
                  }}
                >
                  {t("send_message")}
                </h3>
                <p
                  style={{
                    color: mutedClr,
                    fontSize: "0.82rem",
                    marginBottom: 24,
                  }}
                >
                  {t("send_message_desc")}
                </p>

                <form
                  onSubmit={handleSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {/* Name + Email */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div>
                      <label style={labelStyle}>Full Name</label>
                      <input
                        value={form.name}
                        onChange={set("name")}
                        placeholder="John Doe"
                        style={inputStyle(errors.name)}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#f59e0b";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.name
                            ? "#ef4444"
                            : border;
                        }}
                      />
                      {errors.name && (
                        <p
                          style={{
                            color: "#ef4444",
                            fontSize: "0.72rem",
                            marginTop: 3,
                          }}
                        >
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label style={labelStyle}>{t("email_address")}</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={set("email")}
                        placeholder="john@example.com"
                        style={inputStyle(errors.email)}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#f59e0b";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.email
                            ? "#ef4444"
                            : border;
                        }}
                      />
                      {errors.email && (
                        <p
                          style={{
                            color: "#ef4444",
                            fontSize: "0.72rem",
                            marginTop: 3,
                          }}
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label style={labelStyle}>Category</label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={form.category}
                        onChange={set("category")}
                        style={{
                          ...inputStyle(false),
                          appearance: "none",
                          cursor: "pointer",
                          paddingRight: 36,
                        }}
                      >
                        <option value="">{t("select_category")}</option>
                        <option value="account">
                          {t("account_verification")}
                        </option>
                        <option value="trading">{t("trading_orders")}</option>
                        <option value="deposit">
                          {t("deposits_withdrawals")}
                        </option>
                        <option value="security">
                          {t("security_category")}
                        </option>
                        <option value="technical">
                          {t("technical_issue")}
                        </option>
                        <option value="other">{t("other")}</option>
                      </select>
                      <ChevronDown
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 15,
                          height: 15,
                          color: mutedClr,
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label style={labelStyle}>{t("subject")}</label>
                    <input
                      value={form.subject}
                      onChange={set("subject")}
                      placeholder="Brief description of your issue"
                      style={inputStyle(errors.subject)}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#f59e0b";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.subject
                          ? "#ef4444"
                          : border;
                      }}
                    />
                    {errors.subject && (
                      <p
                        style={{
                          color: "#ef4444",
                          fontSize: "0.72rem",
                          marginTop: 3,
                        }}
                      >
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label style={labelStyle}>{t("message")}</label>
                    <textarea
                      value={form.message}
                      onChange={set("message")}
                      placeholder="Describe your issue in detail..."
                      rows={5}
                      style={{
                        ...inputStyle(errors.message),
                        resize: "vertical",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#f59e0b";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.message
                          ? "#ef4444"
                          : border;
                      }}
                    />
                    {errors.message && (
                      <p
                        style={{
                          color: "#ef4444",
                          fontSize: "0.72rem",
                          marginTop: 3,
                        }}
                      >
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="gold-btn"
                    style={{
                      width: "100%",
                      padding: "13px",
                      borderRadius: 14,
                      border: "none",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: loading ? 0.8 : 1,
                      marginTop: 4,
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
                        <Send style={{ width: 16, height: 16 }} /> {t("send")}
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Offices + hours */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3
              style={{
                fontFamily: '"Playfair Display",serif',
                fontWeight: 700,
                fontSize: "1.2rem",
                color: textClr,
                marginBottom: 4,
              }}
            >
              {t("our_offices")} <span className="gold-text">{t("offices")}</span>
            </h3>
            {OFFICES.map((office) => (
              <div
                key={office.city}
                style={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: 18,
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `rgba(${office.color === "#f59e0b" ? "245,158,11" : office.color === "#60a5fa" ? "96,165,250" : office.color === "#34d399" ? "52,211,153" : "167,139,250"},0.15)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MapPin
                    style={{ width: 18, height: 18, color: office.color }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      color: textClr,
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  >
                    {office.city}
                  </div>
                  <div
                    style={{
                      color: office.color,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {office.country}
                  </div>
                  <div style={{ color: mutedClr, fontSize: "0.8rem" }}>
                    {office.address}
                  </div>
                  <div
                    style={{
                      color: mutedClr,
                      fontSize: "0.8rem",
                      marginTop: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Phone style={{ width: 12, height: 12 }} />
                    {office.phone}
                  </div>
                </div>
              </div>
            ))}

            {/* Support hours */}
            <div
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 18,
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(52,211,153,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Clock style={{ width: 17, height: 17, color: "#34d399" }} />
                </div>
                <h4
                  style={{
                    color: textClr,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {t("support_hours")}
                </h4>
              </div>
              {[
                [t("live_chat_phone"), t("twenty_four_seven_timezones")],
                [t("email_support_hours"), t("mon_fri_9_6")],
                [t("emergency_line"), t("security_issues_only")],
              ].map(([label, val]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingBottom: 10,
                    marginBottom: 10,
                    borderBottom: `1px solid ${divLine}`,
                  }}
                >
                  <span style={{ color: mutedClr, fontSize: "0.8rem" }}>
                    {label}
                  </span>
                  <span
                    style={{
                      color: "#34d399",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    {val}
                  </span>
                </div>
              ))}
              {/* Socials */}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                {[Twitter, Github, Linkedin, MessageCircle].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: darkMode
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.04)",
                      border: `1px solid ${border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: mutedClr,
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#f59e0b";
                      e.currentTarget.style.borderColor =
                        "rgba(245,158,11,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = mutedClr;
                      e.currentTarget.style.borderColor = border;
                    }}
                  >
                    <Icon style={{ width: 15, height: 15 }} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.5rem",
            color: textClr,
            marginBottom: 6,
          }}
        >
          {t("common_questions")} <span className="gold-text">{t("questions")}</span>
        </h2>
        <p style={{ color: mutedClr, fontSize: "0.875rem", marginBottom: 20 }}>
          {t("faq_subtitle")}
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 60,
          }}
        >
          {FAQS.map((f, i) => (
            <div
              key={i}
              style={{
                background: cardBg,
                border: `1px solid ${openFaq === i ? "rgba(245,158,11,0.35)" : border}`,
                borderRadius: 16,
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 20px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    color: textClr,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {f.q}
                </span>
                {openFaq === i ? (
                  <ChevronUp
                    style={{
                      width: 16,
                      height: 16,
                      color: "#f59e0b",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <ChevronDown
                    style={{
                      width: 16,
                      height: 16,
                      color: mutedClr,
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
              {openFaq === i && (
                <div
                  style={{
                    padding: "0 20px 18px",
                    color: mutedClr,
                    fontSize: "0.875rem",
                    lineHeight: 1.7,
                  }}
                >
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <CTABanner
       title={t("still_need_help")}
        subtitle={t("still_need_help_desc")}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </FeaturePage>
  );
}
