import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  Loader,
  AlertCircle,
  Camera,
  FileText,
  User,
  MapPin,
  Briefcase,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import userService from "../../services/userService";

const DOC_TYPES = [
  { value: "passport", labelKey: "passport" },
  { value: "national_id", labelKey: "national_id" },
  { value: "drivers_license", labelKey: "drivers_license" },
  { value: "residence_permit", labelKey: "residence_permit" },
];

const STEPS = [
  { key: "documents", labelKey: "documents", icon: FileText },
  { key: "personal", labelKey: "personal_info", icon: User },
  { key: "address", labelKey: "address", icon: MapPin },
  { key: "employment", labelKey: "employment", icon: Briefcase },
];

function UploadZone({
  label,
  required,
  hint,
  file,
  onChange,
  darkMode,
  border,
  muted,
  textClr,
  t,
}) {
  const inputRef = useRef(null);
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          color: textClr,
          fontSize: "0.8rem",
          fontWeight: 600,
          display: "block",
          marginBottom: 8,
        }}
      >
        {label} {required && <span style={{ color: "#f87171" }}>*</span>}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${file ? "rgba(245,158,11,0.5)" : border}`,
          borderRadius: 14,
          padding: "24px 16px",
          textAlign: "center",
          cursor: "pointer",
          background: file
            ? "rgba(245,158,11,0.04)"
            : darkMode
              ? "rgba(255,255,255,0.02)"
              : "rgba(0,0,0,0.02)",
          transition: "all 0.18s",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "rgba(245,158,11,0.5)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = file
            ? "rgba(245,158,11,0.5)"
            : border)
        }
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            style={{
              maxHeight: 120,
              maxWidth: "100%",
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
        ) : (
          <>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: darkMode
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px",
              }}
            >
              <Camera style={{ width: 20, height: 20, color: muted }} />
            </div>
            <div
              style={{
                color: textClr,
                fontSize: "0.82rem",
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {t("click_to_upload", { label: label.toLowerCase() })}
            </div>
            <div style={{ color: muted, fontSize: "0.72rem" }}>
              {t("upload_format_hint")}
            </div>
          </>
        )}
        {hint && !file && (
          <div style={{ color: muted, fontSize: "0.68rem", marginTop: 6 }}>
            {hint}
          </div>
        )}
        {file && (
          <div
            style={{
              color: "#f59e0b",
              fontSize: "0.72rem",
              marginTop: 8,
              fontWeight: 600,
            }}
          >
            ✓ {file.name}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && f.size <= 5 * 1024 * 1024) onChange(f);
        }}
      />
    </div>
  );
}

// Enhanced Select Component with custom dropdown
function EnhancedSelect({
  value,
  onChange,
  options,
  darkMode,
  textClr,
  muted,
  border,
  inputBg,
  placeholder = "Select an option",
  className = "",
  style = {},
  t,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSelectedDisplay = () => {
    const option = options.find((opt) => opt.value === value);
    if (option) return option.label || t(option.labelKey);
    if (value) return value;
    return placeholder;
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={selectRef} style={{ position: "relative", width: "100%" }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "11px 13px",
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
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = "rgba(245,158,11,0.5)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = border;
          }
        }}
      >
        <span
          style={{
            fontWeight: 500,
            color: selectedOption?.color || (value ? textClr : muted),
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
          {options.map((option, idx) => {
            const isSelected = value === option.value;
            const displayLabel = option.label || t(option.labelKey);
            return (
              <div
                key={idx}
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
                  <span>{displayLabel}</span>
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

export default function KYCPage() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const { user, updateUser } = useAuth();
  const kycStatus = user?.kyc?.status || "unverified";
  const [resubmitting, setResubmitting] = useState(false);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [docForm, setDocForm] = useState({
    documentType: "passport",
    documentNumber: "",
  });
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);

  const [personal, setPersonal] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    dob: "",
    gender: "",
  });
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zip: "",
  });
  const [employment, setEmployment] = useState({
    status: "",
    employer: "",
    income: "",
  });

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  const iStyle = {
    width: "100%",
    padding: "11px 13px",
    borderRadius: 10,
    border: `1px solid ${border}`,
    background: inputBg,
    color: textClr,
    fontSize: "0.88rem",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const STATUS_CONFIG = {
    unverified: {
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.25)",
      icon: AlertCircle,
      labelKey: "not_verified",
      descKey: "submit_documents_desc",
    },
    pending: {
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.1)",
      border: "rgba(96,165,250,0.25)",
      icon: Clock,
      labelKey: "under_review",
      descKey: "under_review_desc",
    },
    approved: {
      color: "#34d399",
      bg: "rgba(52,211,153,0.1)",
      border: "rgba(52,211,153,0.25)",
      icon: CheckCircle,
      labelKey: "verified",
      descKey: "verified_desc",
    },
    rejected: {
      color: "#f87171",
      bg: "rgba(248,113,113,0.1)",
      border: "rgba(248,113,113,0.25)",
      icon: XCircle,
      labelKey: "rejected",
      descKey: "rejected_desc",
    },
  };
  const sc = STATUS_CONFIG[kycStatus] || STATUS_CONFIG.unverified;
  const Ico = sc.icon;

  const handleNext = () => {
    if (step === 0) {
      if (!docForm.documentNumber.trim()) {
        setError(t("document_number_required"));
        return;
      }
      if (!frontFile) {
        setError(t("front_id_required"));
        return;
      }
      if (!selfieFile) {
        setError(t("selfie_required"));
        return;
      }
    }
    setError("");
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");

    try {
      const result = await userService.submitKYC({
        documentType: docForm.documentType,
        documentNumber: docForm.documentNumber,
        frontFile,
        backFile,
        selfieFile,
        personalInfo: personal,
        addressInfo: address,
        employmentInfo: employment,
      });

      updateUser({ kyc: result.data.kyc });
      setResubmitting(false);
      setSuccess(true);
    } catch (err) {
      console.error(
        "❌ Error submitting KYC:",
        err.response?.data || err.message,
      );
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const StatusScreen = ({
    icon: Icon,
    iconColor,
    iconBg,
    title,
    desc,
    extra,
  }) => (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <DashboardNav />
      <div
        style={{ maxWidth: 520, margin: "0 auto", padding: "96px 20px 80px" }}
      >
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
            }}
          >
            <Icon style={{ width: 32, height: 32, color: iconColor }} />
          </div>
          <div
            style={{
              color: textClr,
              fontWeight: 800,
              fontSize: "1.1rem",
              marginBottom: 8,
            }}
          >
            {title}
          </div>
          <div style={{ color: muted, fontSize: "0.82rem", lineHeight: 1.6 }}>
            {desc}
          </div>
          {extra}
        </div>
      </div>
      <BottomNav />
    </div>
  );

  if (kycStatus === "approved")
    return (
      <StatusScreen
        icon={CheckCircle}
        iconColor="#34d399"
        iconBg="rgba(52,211,153,0.12)"
        title={t("identity_verified")}
        desc={t("verified_desc_full")}
        extra={
          user?.kyc?.submittedAt && (
            <div style={{ marginTop: 14, color: muted, fontSize: "0.72rem" }}>
              {t("verified_on")}{" "}
              {new Date(user.kyc.submittedAt).toLocaleDateString()}
            </div>
          )
        }
      />
    );

  if (kycStatus === "pending")
    return (
      <StatusScreen
        icon={Clock}
        iconColor="#60a5fa"
        iconBg="rgba(96,165,250,0.12)"
        title={t("under_review")}
        desc={t("under_review_desc_full")}
      />
    );

  if (success)
    return (
      <StatusScreen
        icon={CheckCircle}
        iconColor="#34d399"
        iconBg="rgba(52,211,153,0.12)"
        title={t("submitted_successfully")}
        desc={t("submitted_success_desc")}
      />
    );

  if (kycStatus === "rejected" && !resubmitting)
    return (
      <StatusScreen
        icon={XCircle}
        iconColor="#f87171"
        iconBg="rgba(248,113,113,0.12)"
        title={t("verification_rejected")}
        desc={
          user?.kyc?.reviewNote || t("rejected_default_message")
        }
        extra={
          <button
            onClick={() => setResubmitting(true)}
            style={{
              marginTop: 20,
              padding: "11px 28px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#d97706,#f59e0b)",
              color: "#020617",
              fontWeight: 800,
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
          >
            {t("resubmit_documents")}
          </button>
        }
      />
    );

  // Get translated options for selects
  const docTypeOptions = DOC_TYPES.map((dt) => ({
    value: dt.value,
    labelKey: dt.labelKey,
  }));

  const genderOptions = [
    { value: "Male", labelKey: "male", icon: "♂️" },
    { value: "Female", labelKey: "female", icon: "♀️" },
    { value: "Non-binary", labelKey: "non_binary", icon: "⚧️" },
    { value: "Prefer not to say", labelKey: "prefer_not_to_say", icon: "🤐" },
  ];

  const employmentStatusOptions = [
    { value: "Employed", labelKey: "employed", icon: "💼" },
    { value: "Self-employed", labelKey: "self_employed", icon: "🏢" },
    { value: "Unemployed", labelKey: "unemployed", icon: "🔍" },
    { value: "Student", labelKey: "student", icon: "📚" },
    { value: "Retired", labelKey: "retired", icon: "🌴" },
  ];

  const incomeOptions = [
    { value: "Under $10,000", labelKey: "under_10k", icon: "💰" },
    { value: "$10,000 – $30,000", labelKey: "10k_30k", icon: "💵" },
    { value: "$30,000 – $60,000", labelKey: "30k_60k", icon: "💵" },
    { value: "$60,000 – $100,000", labelKey: "60k_100k", icon: "💵" },
    { value: "Over $100,000", labelKey: "over_100k", icon: "🏆" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <DashboardNav />
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .kyc-input:focus{border-color:rgba(245,158,11,0.5)!important;outline:none!important;}
        select option{background:${darkMode ? "#0f172a" : "#fff"};color:${darkMode ? "#f1f5f9" : "#0f172a"};}
      `}</style>

      <div style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                color: textClr,
                fontWeight: 800,
                fontSize: "1.4rem",
                margin: 0,
              }}
            >
              {t("kyc_verification")}
            </h1>
            <p style={{ color: muted, fontSize: "0.82rem", margin: "4px 0 0" }}>
              {t("kyc_subtitle")}
            </p>
          </div>

          {/* Status banner */}
          <div
            style={{
              background: sc.bg,
              border: `1px solid ${sc.border}`,
              borderRadius: 14,
              padding: "13px 16px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Ico
              style={{ width: 18, height: 18, color: sc.color, flexShrink: 0 }}
            />
            <div
              style={{ color: sc.color, fontWeight: 600, fontSize: "0.82rem" }}
            >
              {t(sc.descKey)}
            </div>
          </div>

          {/* Step progress */}
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 28 }}
          >
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step,
                complete = i < step;
              const color = complete || active ? "#f59e0b" : muted;
              return (
                <React.Fragment key={s.key}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flex: "0 0 auto",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: complete
                          ? "rgba(245,158,11,0.15)"
                          : active
                            ? "rgba(245,158,11,0.12)"
                            : darkMode
                              ? "rgba(255,255,255,0.05)"
                              : "rgba(0,0,0,0.05)",
                        border: `2px solid ${active || complete ? "#f59e0b" : border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      {complete ? (
                        <CheckCircle
                          style={{ width: 14, height: 14, color: "#f59e0b" }}
                        />
                      ) : (
                        <Icon
                          style={{
                            width: 14,
                            height: 14,
                            color: active ? "#f59e0b" : muted,
                          }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        color,
                        fontSize: "0.62rem",
                        fontWeight: active ? 700 : 500,
                        marginTop: 4,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t(s.labelKey)}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background:
                          i < step
                            ? "#f59e0b"
                            : darkMode
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(0,0,0,0.08)",
                        marginBottom: 18,
                        transition: "background 0.3s",
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "24px",
            }}
          >
            {/* STEP 0: Documents */}
            {step === 0 && (
              <>
                <div
                  style={{
                    color: textClr,
                    fontWeight: 800,
                    fontSize: "1rem",
                    marginBottom: 20,
                  }}
                >
                  {t("upload_documents")}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      color: textClr,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    {t("document_type")}{" "}
                    <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <EnhancedSelect
                    value={docForm.documentType}
                    onChange={(e) =>
                      setDocForm((f) => ({
                        ...f,
                        documentType: e.target.value,
                      }))
                    }
                    options={docTypeOptions}
                    darkMode={darkMode}
                    textClr={textClr}
                    muted={muted}
                    border={border}
                    inputBg={inputBg}
                    placeholder={t("select_document_type")}
                    t={t}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      color: textClr,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    {t("document_number")}{" "}
                    <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <input
                    className="kyc-input"
                    style={iStyle}
                    placeholder={t("enter_document_number")}
                    value={docForm.documentNumber}
                    onChange={(e) =>
                      setDocForm((f) => ({
                        ...f,
                        documentNumber: e.target.value,
                      }))
                    }
                  />
                </div>
                <UploadZone
                  label={t("front_of_id")}
                  required
                  file={frontFile}
                  onChange={setFrontFile}
                  darkMode={darkMode}
                  border={border}
                  muted={muted}
                  textClr={textClr}
                  t={t}
                />
                <UploadZone
                  label={t("back_of_id")}
                  file={backFile}
                  onChange={setBackFile}
                  darkMode={darkMode}
                  border={border}
                  muted={muted}
                  textClr={textClr}
                  t={t}
                />
                <UploadZone
                  label={t("selfie_with_id")}
                  required
                  hint={t("selfie_hint")}
                  file={selfieFile}
                  onChange={setSelfieFile}
                  darkMode={darkMode}
                  border={border}
                  muted={muted}
                  textClr={textClr}
                  t={t}
                />
                <div
                  style={{
                    padding: "10px 13px",
                    borderRadius: 9,
                    background: "rgba(96,165,250,0.08)",
                    border: "1px solid rgba(96,165,250,0.2)",
                    color: "#60a5fa",
                    fontSize: "0.75rem",
                    marginTop: 4,
                  }}
                >
                  ℹ️ {t("document_quality_hint")}
                </div>
              </>
            )}

            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <>
                <div
                  style={{
                    color: textClr,
                    fontWeight: 800,
                    fontSize: "1rem",
                    marginBottom: 20,
                  }}
                >
                  {t("personal_information")}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  {[
                    { key: "firstName", labelKey: "first_name", ph: "John" },
                    { key: "lastName", labelKey: "last_name", ph: "Doe" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label
                        style={{
                          color: textClr,
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          display: "block",
                          marginBottom: 5,
                        }}
                      >
                        {t(f.labelKey)}{" "}
                        <span style={{ color: "#f87171" }}>*</span>
                      </label>
                      <input
                        className="kyc-input"
                        style={iStyle}
                        placeholder={f.ph}
                        value={personal[f.key]}
                        onChange={(e) =>
                          setPersonal((p) => ({
                            ...p,
                            [f.key]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12 }}>
                  <label
                    style={{
                      color: textClr,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    {t("date_of_birth")}{" "}
                    <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <input
                    className="kyc-input"
                    style={iStyle}
                    type="date"
                    value={personal.dob}
                    onChange={(e) =>
                      setPersonal((p) => ({ ...p, dob: e.target.value }))
                    }
                  />
                </div>
                <div style={{ marginTop: 12 }}>
                  <label
                    style={{
                      color: textClr,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    {t("gender")} <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <EnhancedSelect
                    value={personal.gender}
                    onChange={(e) =>
                      setPersonal((p) => ({ ...p, gender: e.target.value }))
                    }
                    options={genderOptions}
                    darkMode={darkMode}
                    textClr={textClr}
                    muted={muted}
                    border={border}
                    inputBg={inputBg}
                    placeholder={t("select_gender")}
                    t={t}
                  />
                </div>
              </>
            )}

            {/* STEP 2: Address */}
            {step === 2 && (
              <>
                <div
                  style={{
                    color: textClr,
                    fontWeight: 800,
                    fontSize: "1rem",
                    marginBottom: 20,
                  }}
                >
                  {t("address_information")}
                </div>
                {[
                  { key: "street", labelKey: "street_address", ph: "123 Main Street" },
                  { key: "city", labelKey: "city", ph: "New York" },
                  { key: "state", labelKey: "state_province", ph: "NY" },
                  { key: "country", labelKey: "country", ph: "United States" },
                  { key: "zip", labelKey: "postal_code", ph: "10001" },
                ].map((f) => (
                  <div key={f.key} style={{ marginBottom: 12 }}>
                    <label
                      style={{
                        color: textClr,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        display: "block",
                        marginBottom: 5,
                      }}
                    >
                      {t(f.labelKey)}
                    </label>
                    <input
                      className="kyc-input"
                      style={iStyle}
                      placeholder={f.ph}
                      value={address[f.key]}
                      onChange={(e) =>
                        setAddress((a) => ({ ...a, [f.key]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </>
            )}

            {/* STEP 3: Employment */}
            {step === 3 && (
              <>
                <div
                  style={{
                    color: textClr,
                    fontWeight: 800,
                    fontSize: "1rem",
                    marginBottom: 20,
                  }}
                >
                  {t("employment_information")}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{
                      color: textClr,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    {t("employment_status")}
                  </label>
                  <EnhancedSelect
                    value={employment.status}
                    onChange={(e) =>
                      setEmployment((p) => ({ ...p, status: e.target.value }))
                    }
                    options={employmentStatusOptions}
                    darkMode={darkMode}
                    textClr={textClr}
                    muted={muted}
                    border={border}
                    inputBg={inputBg}
                    placeholder={t("select_employment_status")}
                    t={t}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{
                      color: textClr,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    {t("employer_company")}
                  </label>
                  <input
                    className="kyc-input"
                    style={iStyle}
                    placeholder={t("company_name_placeholder")}
                    value={employment.employer}
                    onChange={(e) =>
                      setEmployment((p) => ({ ...p, employer: e.target.value }))
                    }
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label
                    style={{
                      color: textClr,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    {t("annual_income_usd")}
                  </label>
                  <EnhancedSelect
                    value={employment.income}
                    onChange={(e) =>
                      setEmployment((p) => ({ ...p, income: e.target.value }))
                    }
                    options={incomeOptions}
                    darkMode={darkMode}
                    textClr={textClr}
                    muted={muted}
                    border={border}
                    inputBg={inputBg}
                    placeholder={t("select_income_range")}
                    t={t}
                  />
                </div>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    color: muted,
                    fontSize: "0.75rem",
                    lineHeight: 1.6,
                    marginTop: 8,
                  }}
                >
                  {t("kyc_confirmation_notice")}
                </div>
              </>
            )}

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

            {/* Nav buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: step > 0 ? "1fr 1fr" : "1fr",
                gap: 10,
                marginTop: 22,
              }}
            >
              {step > 0 && (
                <button
                  onClick={() => {
                    setStep((s) => s - 1);
                    setError("");
                  }}
                  style={{
                    padding: "12px",
                    borderRadius: 12,
                    border: `1px solid ${border}`,
                    background: "transparent",
                    color: textClr,
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  {t("back")}
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  style={{
                    padding: "12px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg,#d97706,#f59e0b)",
                    color: "#020617",
                    fontWeight: 800,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {t("next")}{" "}
                  <ChevronRight style={{ width: 15, height: 15 }} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  style={{
                    padding: "12px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg,#d97706,#f59e0b)",
                    color: "#020617",
                    fontWeight: 800,
                    fontSize: "0.88rem",
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
                      {t("submitting_dots")}
                    </>
                  ) : (
                    t("submit_verification")
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}