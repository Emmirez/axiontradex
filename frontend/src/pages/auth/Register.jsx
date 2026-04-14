import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Gift,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { AuthHeader, AuthFooter } from "../../components/AuthLayout";

//  Data
const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Belgium",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Bulgaria",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Ethiopia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Latvia",
  "Lebanon",
  "Libya",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Malta",
  "Mexico",
  "Moldova",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Panama",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Tanzania",
  "Thailand",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "UAE",
  "Uganda",
  "Ukraine",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Venezuela",
  "Vietnam",
  "Zambia",
  "Zimbabwe",
];

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
];

const STEPS = [
  "Personal Info",
  "Contact & Address",
  "Account Setup",
  "Security",
];

//  Input
function Input({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  darkMode,
}) {
  return (
    <div>
      <label
        style={{
          color: darkMode ? "#94a3b8" : "#475569",
          fontSize: "0.78rem",
          fontWeight: 500,
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {Icon && (
          <Icon
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              width: 15,
              height: 15,
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            background: darkMode
              ? "rgba(15,23,42,0.6)"
              : "rgba(248,250,252,0.9)",
            border: `1px solid ${error ? "#ef4444" : "rgba(245,158,11,0.25)"}`,
            borderRadius: 12,
            padding: Icon ? "10px 13px 10px 38px" : "10px 13px",
            color: darkMode ? "#f1f5f9" : "#0f172a",
            fontSize: "0.875rem",
            outline: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#f59e0b";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error
              ? "#ef4444"
              : "rgba(245,158,11,0.25)";
          }}
        />
      </div>
      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
}

//  Select
function Select({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
  error,
  darkMode,
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
    if (!value) return placeholder || "Select an option";

    const selected = options.find((opt) =>
      typeof opt === "string" ? opt === value : opt.code === value,
    );

    if (!selected) return placeholder || "Select an option";

    if (typeof selected === "string") return selected;
    return `${selected.symbol} ${selected.code} — ${selected.name}`;
  };

  return (
    <div ref={selectRef} style={{ position: "relative" }}>
      <label
        style={{
          color: darkMode ? "#94a3b8" : "#475569",
          fontSize: "0.78rem",
          fontWeight: 500,
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>

      {/* Custom Select Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          background: darkMode
            ? "rgba(15,23,42,0.85)"
            : "rgba(248,250,252,0.9)",
          border: `1px solid ${
            error ? "#ef4444" : isOpen ? "#f59e0b" : "rgba(245,158,11,0.25)"
          }`,
          borderRadius: 14,
          padding: Icon ? "10px 36px 10px 38px" : "10px 36px 10px 13px",
          color: value
            ? darkMode
              ? "#f1f5f9"
              : "#0f172a"
            : darkMode
              ? "#94a3b8"
              : "#a0a0a0",
          fontSize: "0.875rem",
          cursor: "pointer",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {Icon && (
            <Icon
              style={{
                width: 15,
                height: 15,
                color: isOpen ? "#f59e0b" : "#94a3b8",
                transition: "color 0.2s",
              }}
            />
          )}
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {getSelectedDisplay()}
          </span>
        </div>
        <ChevronDown
          style={{
            width: 16,
            height: 16,
            color: isOpen ? "#f59e0b" : "#94a3b8",
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
            background: darkMode
              ? "rgba(15,23,42,0.98)"
              : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${error ? "#ef4444" : "rgba(245,158,11,0.3)"}`,
            borderRadius: 14,
            maxHeight: 280,
            overflowY: "auto",
            zIndex: 50,
            boxShadow: darkMode
              ? "0 10px 25px -5px rgba(0,0,0,0.3)"
              : "0 10px 25px -5px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ padding: "8px 0" }}>
            {options.map((opt, idx) => {
              const isSelected =
                typeof opt === "string" ? value === opt : value === opt.code;

              const displayText =
                typeof opt === "string"
                  ? opt
                  : `${opt.symbol} ${opt.code} — ${opt.name}`;

              const optionValue = typeof opt === "string" ? opt : opt.code;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    onChange({ target: { value: optionValue } });
                    setIsOpen(false);
                  }}
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    color: isSelected
                      ? "#f59e0b"
                      : darkMode
                        ? "#f1f5f9"
                        : "#0f172a",
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
                  <span>{displayText}</span>
                  {isSelected && (
                    <CheckCircle
                      style={{ width: 14, height: 14, color: "#f59e0b" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
}

//  Password Input
function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  darkMode,
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label
        style={{
          color: darkMode ? "#94a3b8" : "#475569",
          fontSize: "0.78rem",
          fontWeight: 500,
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <Lock
          style={{
            position: "absolute",
            left: 13,
            top: "50%",
            transform: "translateY(-50%)",
            width: 15,
            height: 15,
            color: "#94a3b8",
            pointerEvents: "none",
          }}
        />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            background: darkMode
              ? "rgba(15,23,42,0.6)"
              : "rgba(248,250,252,0.9)",
            border: `1px solid ${error ? "#ef4444" : "rgba(245,158,11,0.25)"}`,
            borderRadius: 12,
            padding: "10px 42px 10px 38px",
            color: darkMode ? "#f1f5f9" : "#0f172a",
            fontSize: "0.875rem",
            outline: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#f59e0b";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error
              ? "#ef4444"
              : "rgba(245,158,11,0.25)";
          }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          style={{
            position: "absolute",
            right: 13,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#94a3b8",
            padding: 0,
          }}
        >
          {show ? (
            <EyeOff style={{ width: 15, height: 15 }} />
          ) : (
            <Eye style={{ width: 15, height: 15 }} />
          )}
        </button>
      </div>
      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
}

//  Step Bar
function StepBar({ current }) {
  const { t } = useTranslation();
  const STEPS_LOCAL = [
    t("step_personal_info"),
    t("step_contact_address"),
    t("step_account_setup"),
    t("step_security"),
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
      {STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background:
                  i < current
                    ? "#f59e0b"
                    : i === current
                      ? "rgba(245,158,11,0.15)"
                      : "rgba(255,255,255,0.04)",
                border:
                  i <= current
                    ? "2px solid #f59e0b"
                    : "2px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s",
              }}
            >
              {i < current ? (
                <CheckCircle
                  style={{ width: 14, height: 14, color: "#020617" }}
                />
              ) : (
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: i === current ? "#f59e0b" : "#475569",
                  }}
                >
                  {i + 1}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: "0.6rem",
                marginTop: 4,
                color: i <= current ? "#f59e0b" : "#475569",
                fontWeight: i === current ? 600 : 400,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              style={{
                height: 2,
                flex: 1,
                background: i < current ? "#f59e0b" : "rgba(255,255,255,0.07)",
                marginBottom: 18,
                transition: "background 0.3s",
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

//  Register Page
export default function Register() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    dob: "",
    phone: "",
    country: "",
    homeAddress: "",
    email: "",
    currency: "",
    referral: "",
    password: "",
    confirmPassword: "",
  });

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.firstName.trim()) e.firstName = t("required");
      if (!form.lastName.trim()) e.lastName = t("required");
      if (!form.username.trim()) e.username = t("required");
      if (!form.dob) e.dob = t("required");
    }
    if (step === 1) {
      if (!form.phone.trim()) e.phone = t("required");
      if (!form.country) e.country = t("select_country");
      if (!form.homeAddress.trim()) e.homeAddress = t("required");
    }
    if (step === 2) {
      if (!form.email.trim()) e.email = t("required");
      // if (!form.currency) e.currency = t("select_currency");
    }
    if (step === 3) {
      if (!form.password) e.password = t("required");
      if (form.password.length < 8) e.password = t("min_8_characters");
      if (form.password !== form.confirmPassword)
        e.confirmPassword = t("passwords_do_not_match");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const next = async () => {
    if (!validate()) return;
    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }
    setLoading(true);
    try {
      await register(form);
      setDone(true);
    } catch (err) {
      setErrors({
        confirmPassword: err.message || t("registration_failed"),
      });
    } finally {
      setLoading(false);
    }
  };

  const prev = () => {
    setStep((s) => s - 1);
    setErrors({});
  };

  //  Theme values
  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.75)" : "rgba(255,255,255,0.97)";
  const headClr = darkMode ? "#f1f5f9" : "#0f172a";
  const subClr = darkMode ? "#475569" : "#64748b";
  const leftBg = darkMode
    ? "radial-gradient(ellipse at 30% 50%, #1a0e00 0%, #020617 65%)"
    : "linear-gradient(135deg, #fffbeb 0%, #f1f5f9 100%)";
  const h2Clr = darkMode ? "#f1f5f9" : "#0f172a";
  const bulletClr = darkMode ? "#94a3b8" : "#64748b";
  const stepLabelClr = darkMode ? "#334155" : "#94a3b8";

  // Success screen
  // Success screen
  if (done)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: pageBg,
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
            padding: 24,
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 440 }}>
            {/* Icon */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(245,158,11,0.15)",
                border: "2px solid rgba(245,158,11,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <Mail style={{ width: 36, height: 36, color: "#f59e0b" }} />
            </div>

            {/* Title */}
            <h2
              style={{
                fontFamily: '"Playfair Display",serif',
                fontWeight: 700,
                fontSize: "1.8rem",
                color: headClr,
                marginBottom: 10,
              }}
            >
              {t("check_your_email")}
            </h2>

            {/* Email sent to */}
            <div
              style={{
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 14,
                padding: "14px 20px",
                margin: "16px 0 24px",
              }}
            >
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "0.85rem",
                  marginBottom: 6,
                }}
              >
                {t("verification_sent_to")}
              </p>
              <p
                style={{ color: "#f59e0b", fontWeight: 700, fontSize: "1rem" }}
              >
                {form.email}
              </p>
            </div>

            {/* Instructions */}
            <p
              style={{
                color: subClr,
                fontSize: "0.875rem",
                lineHeight: 1.8,
                marginBottom: 28,
              }}
            >
              {t("verification_instructions")}
            </p>

            {/* Steps */}
            <div
              style={{
                background: darkMode
                  ? "rgba(15,23,42,0.6)"
                  : "rgba(248,250,252,0.9)",
                border: "1px solid rgba(245,158,11,0.12)",
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 28,
                textAlign: "left",
              }}
            >
              {[t("verify_step_1"), t("verify_step_2"), t("verify_step_3")].map(
                (step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: i < 2 ? 12 : 0,
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "rgba(245,158,11,0.15)",
                        border: "1px solid rgba(245,158,11,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          color: "#f59e0b",
                        }}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <span
                      style={{
                        color: darkMode ? "#94a3b8" : "#64748b",
                        fontSize: "0.82rem",
                      }}
                    >
                      {step}
                    </span>
                  </div>
                ),
              )}
            </div>

            {/* Spam notice */}
            <p
              style={{
                color: "#475569",
                fontSize: "0.75rem",
                marginBottom: 24,
              }}
            >
              {t("check_spam_folder")}
            </p>

            {/* Sign in button */}
            <Link
              to="/login"
              className="gold-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 32px",
                borderRadius: 14,
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              {t("go_to_sign_in")}{" "}
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        </div>
        <AuthFooter />
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBg,
        display: "flex",
        flexDirection: "column",
        transition: "background 0.3s",
      }}
    >
      <AuthHeader />

      <div style={{ flex: 1, display: "flex", paddingTop: 64 }}>
        {/*  Left branding */}
        <div
          className="hidden lg:flex"
          style={{
            width: "40%",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px",
            position: "relative",
            overflow: "hidden",
            background: leftBg,
            transition: "background 0.3s",
          }}
        >
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "30%",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "rgba(245,158,11,0.07)",
              filter: "blur(70px)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            <h2
              style={{
                fontFamily: '"Playfair Display",serif',
                fontWeight: 900,
                fontSize: "clamp(2rem,3.5vw,2.8rem)",
                color: h2Clr,
                lineHeight: 1.1,
                marginBottom: 16,
                transition: "color 0.3s",
              }}
            >
              {t("join_future_trading")}
              <br />
              of <span className="gold-text">Trading.</span>
            </h2>
            <p
              style={{
                color: darkMode ? "#64748b" : "#64748b",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                maxWidth: 320,
                marginBottom: 40,
              }}
            >
              {t("create_free_account_desc")}
            </p>

            {/* Step progress */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background:
                        i < step
                          ? "#f59e0b"
                          : i === step
                            ? "rgba(245,158,11,0.15)"
                            : "rgba(255,255,255,0.04)",
                      border:
                        i <= step
                          ? "2px solid #f59e0b"
                          : "2px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s",
                    }}
                  >
                    {i < step ? (
                      <CheckCircle
                        style={{ width: 13, height: 13, color: "#020617" }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          color: i === step ? "#f59e0b" : stepLabelClr,
                        }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: i <= step ? h2Clr : stepLabelClr,
                      fontWeight: i === step ? 600 : 400,
                      transition: "color 0.3s",
                    }}
                  >
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*  Right form  */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 24px",
            overflowY: "auto",
          }}
        >
          <div style={{ width: "100%", maxWidth: 500 }}>
            {/* Mobile logo */}
            <div
              className="lg:hidden"
              style={{ textAlign: "center", marginBottom: 24 }}
            >
              <Link
                to="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  textDecoration: "none",
                }}
              >
                <div
                  className="gold-btn"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User style={{ width: 18, height: 18, color: "#020617" }} />
                </div>
                <span
                  style={{
                    fontFamily: '"Playfair Display",serif',
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: headClr,
                  }}
                >
                  Axion<span className="gold-text">Trade</span>
                </span>
              </Link>
            </div>

            {/* Card */}
            <div
              style={{
                background: cardBg,
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 24,
                padding: "28px 24px",
                backdropFilter: "blur(20px)",
                boxShadow: darkMode
                  ? "0 20px 60px rgba(0,0,0,0.3)"
                  : "0 20px 60px rgba(0,0,0,0.08)",
                transition: "background 0.3s",
              }}
            >
              <h3
                style={{
                  fontFamily: '"Playfair Display",serif',
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  color: headClr,
                  marginBottom: 4,
                  transition: "color 0.3s",
                }}
              >
                {t("create_account")}
              </h3>
              <p
                style={{ color: subClr, fontSize: "0.82rem", marginBottom: 20 }}
              >
                Step {step + 1} of {STEPS.length} — {STEPS[step]}
              </p>

              <StepBar current={step} />

              {/* Step 0 */}
              {step === 0 && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <Input
                      label={t("first_name")}
                      icon={User}
                      value={form.firstName}
                      onChange={set("firstName")}
                      placeholder="John"
                      error={errors.firstName}
                      darkMode={darkMode}
                    />
                    <Input
                      label={t("last_name")}
                      icon={User}
                      value={form.lastName}
                      onChange={set("lastName")}
                      placeholder="Doe"
                      error={errors.lastName}
                      darkMode={darkMode}
                    />
                  </div>
                  <Input
                    label={t("username")}
                    icon={User}
                    value={form.username}
                    onChange={set("username")}
                    placeholder="johndoe123"
                    error={errors.username}
                    darkMode={darkMode}
                  />
                  <Input
                    label={t("date_of_birth")}
                    icon={Calendar}
                    type="date"
                    value={form.dob}
                    onChange={set("dob")}
                    error={errors.dob}
                    darkMode={darkMode}
                  />
                </div>
              )}

              {/* Step 1 */}
              {step === 1 && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <Input
                    label={t("phone_number")}
                    icon={Phone}
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="+1 234 567 8900"
                    error={errors.phone}
                    darkMode={darkMode}
                  />
                  <Select
                    label={t("country")}
                    icon={MapPin}
                    value={form.country}
                    onChange={set("country")}
                    options={COUNTRIES}
                    placeholder={t("select_your_country")}
                    error={errors.country}
                    darkMode={darkMode}
                  />
                  <Input
                    label={t("home_address")}
                    icon={MapPin}
                    value={form.homeAddress}
                    onChange={set("homeAddress")}
                    placeholder="123 Main St, City, State"
                    error={errors.homeAddress}
                    darkMode={darkMode}
                  />
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <Input
                    label={t("email_address")}
                    icon={Mail}
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="john@example.com"
                    error={errors.email}
                    darkMode={darkMode}
                  />
                  {/* <Select
                    label={t("base_currency")}
                    icon={DollarSign}
                    value={form.currency}
                    onChange={set("currency")}
                    options={CURRENCIES}
                    placeholder={t("select_base_currency")}
                    error={errors.currency}
                    darkMode={darkMode}
                  /> */}
                  <Input
                    label={t("referral_code_optional")}
                    icon={Gift}
                    value={form.referral}
                    onChange={set("referral")}
                    placeholder={t("enter_referral_code")}
                    darkMode={darkMode}
                  />
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <PasswordInput
                    label={t("password")}
                    value={form.password}
                    onChange={set("password")}
                    placeholder={t("minimum_8_characters")}
                    error={errors.password}
                    darkMode={darkMode}
                  />
                  <PasswordInput
                    label={t("confirm_password")}
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    placeholder={t("repeat_your_password")}
                    error={errors.confirmPassword}
                    darkMode={darkMode}
                  />
                  <div
                    style={{
                      background: "rgba(245,158,11,0.06)",
                      border: "1px solid rgba(245,158,11,0.15)",
                      borderRadius: 12,
                      padding: "12px 16px",
                    }}
                  >
                    <p
                      style={{
                        color: subClr,
                        fontSize: "0.75rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {t("agree_to_terms")}{" "}
                      <Link
                        to="/terms-of-service"
                        style={{ color: "#f59e0b", textDecoration: "none" }}
                      >
                        {t("terms_of_service")}
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy-policy"
                        style={{ color: "#f59e0b", textDecoration: "none" }}
                      >
                        {t("privacy_policy")}
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
                {step > 0 && (
                  <button
                    onClick={prev}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 14,
                      border: "1px solid rgba(245,158,11,0.3)",
                      background: "transparent",
                      color: "#f59e0b",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <ArrowLeft style={{ width: 15, height: 15 }} />{" "}
                    {t("previous")}
                  </button>
                )}
                <button
                  onClick={next}
                  disabled={loading}
                  className="gold-btn"
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 14,
                    border: "none",
                    fontSize: "0.875rem",
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
                        width: 16,
                        height: 16,
                        border: "2px solid #020617",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                  ) : (
                    <>
                      {step === 3 ? t("create_account") : t("next")}{" "}
                      <ArrowRight style={{ width: 15, height: 15 }} />
                    </>
                  )}
                </button>
              </div>

              <p
                style={{
                  textAlign: "center",
                  marginTop: 18,
                  color: subClr,
                  fontSize: "0.82rem",
                }}
              >
                {t("already_have_account")}{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#f59e0b",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  {t("sign_in")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <AuthFooter />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
