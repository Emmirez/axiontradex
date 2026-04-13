import { useState, useEffect } from "react";
import { X, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

const AvailableOn = ({ darkMode }) => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check global prompt captured in main.jsx
    if (window.__pwaInstallPrompt) {
      setDeferredPrompt(window.__pwaInstallPrompt);
    }

    const handler = (e) => {
      e.preventDefault();
      window.__pwaInstallPrompt = e;
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    
  const handleAndroidInstall = async () => {
    const prompt = deferredPrompt || window.__pwaInstallPrompt;

    if (!prompt) {
      alert(t("install_address_bar"));
      return;
    }

    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        setShowIOSModal(false);
      }
    } catch (err) {
      console.error("Install error:", err);
    }
  };

  const handleClick = (platform) => {
    if (platform === "web") return;

    if (platform === "ios") {
      setShowIOSModal(true);
      return;
    }

    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    const prompt = deferredPrompt || window.__pwaInstallPrompt;
    
    if (prompt) {
      handleAndroidInstall();
    } else {
      alert(t("install_address_bar"));
    }
  };

  const textPrimary = darkMode ? "#f1f5f9" : "#0f172a";
  const textSecondary = darkMode ? "#94a3b8" : "#475569";
  const cardBg = darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const cardBorder = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const modalBg = darkMode ? "rgba(10,15,30,0.97)" : "rgba(255,255,255,0.98)";
  const modalBorder = darkMode
    ? "rgba(245,158,11,0.2)"
    : "rgba(245,158,11,0.3)";

  const platforms = [
    {
      id: "web",
      label: t("platform_web"),
      icon: "https://cdn.simpleicons.org/googlechrome/4285F4",
      description: t("platform_web_desc"),
      clickable: false,
      badge: t("badge_live"),
    },
    {
      id: "windows",
      label: t("platform_windows"),
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Windows_logo_-_2012.svg/120px-Windows_logo_-_2012.svg.png",
      description: t("platform_windows_desc"),
      clickable: true,
      badge: t("badge_install"),
    },
    {
      id: "android",
      label: t("platform_android"),
      icon: "https://cdn.simpleicons.org/android/3DDC84",
      description: t("platform_android_desc"),
      clickable: true,
      badge: t("badge_install"),
    },
    {
      id: "ios",
      label: t("platform_ios"),
      icon: "https://cdn.simpleicons.org/apple/888888",
      description: t("platform_ios_desc"),
      clickable: true,
      badge: t("badge_add"),
    },
  ];

  return (
    <>
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p
            className="font-mono text-xs tracking-widest uppercase mb-3"
            style={{ color: "#f59e0b" }}
          >
            {t("available_on_subtitle")}
          </p>
          <h2
            className="font-display font-bold text-2xl md:text-3xl mb-3"
            style={{ color: textPrimary }}
          >
            {t("available_on_title")}
          </h2>
          <p
            className="text-sm mb-10 max-w-md mx-auto"
            style={{ color: textSecondary }}
          >
            {t("available_on_desc")}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => platform.clickable && handleClick(platform.id)}
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 16,
                  padding: "24px 16px",
                  cursor: platform.clickable ? "pointer" : "default",
                  transition: "all 0.2s",
                  color: textSecondary,
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (!platform.clickable) return;
                  e.currentTarget.style.border = "1px solid rgba(245,158,11,0.4)";
                  e.currentTarget.style.background = "rgba(245,158,11,0.06)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(245,158,11,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = `1px solid ${cardBorder}`;
                  e.currentTarget.style.background = cardBg;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background:
                      platform.badge === t("badge_live")
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(245,158,11,0.12)",
                    border:
                      platform.badge === t("badge_live")
                        ? "1px solid rgba(34,197,94,0.3)"
                        : "1px solid rgba(245,158,11,0.25)",
                    borderRadius: 20,
                    padding: "2px 8px",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    color: platform.badge === t("badge_live") ? "#4ade80" : "#f59e0b",
                  }}
                >
                  {platform.badge}
                </div>

                <div className="flex justify-center mb-4">
                  <img
                    src={platform.icon}
                    alt={platform.label}
                    style={{
                      width: 44,
                      height: 44,
                      objectFit: "contain",
                      filter: darkMode ? "brightness(1)" : "brightness(0.9)",
                    }}
                  />
                </div>

                <p
                  className="font-display font-semibold text-sm mb-1"
                  style={{ color: textPrimary }}
                >
                  {platform.label}
                </p>
                <p className="text-xs" style={{ color: textSecondary }}>
                  {platform.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {showIOSModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{
              background: modalBg,
              border: `1px solid ${modalBorder}`,
              backdropFilter: "blur(24px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gold-btn flex items-center justify-center">
                  <TrendingUp size={18} style={{ color: "#020617" }} />
                </div>
                <div>
                  <p
                    className="font-display font-bold text-sm"
                    style={{ color: textPrimary }}
                  >
                    Axion<span className="gold-text">Trade</span>
                  </p>
                  <p className="text-xs" style={{ color: textSecondary }}>
                    {t("ios_installation")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                style={{ color: textSecondary }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f59e0b")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = textSecondary)
                }
              >
                <X size={18} />
              </button>
            </div>

            {[
              {
                step: "1",
                text: t("ios_step_1"),
              },
              {
                step: "2",
                text: t("ios_step_2"),
              },
              {
                step: "3",
                text: t("ios_step_3"),
              },
            ].map(({ step, text }) => (
              <div
                key={step}
                className="flex items-start gap-3 mb-4 p-3 rounded-xl"
                style={{
                  background: darkMode
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.03)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-full gold-btn flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ color: "#020617" }}
                >
                  {step}
                </div>
                <p
                  className="text-sm leading-relaxed pt-0.5"
                  style={{ color: textSecondary }}
                  dangerouslySetInnerHTML={{ __html: text }}
                />
              </div>
            ))}

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full gold-btn py-3 rounded-xl text-sm font-bold border-0 cursor-pointer mt-2"
              style={{ color: "#020617" }}
            >
              {t("got_it")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AvailableOn;