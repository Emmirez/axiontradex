import { useState, useEffect } from "react";
import { X, Download, Smartphone, TrendingUp } from "lucide-react";

const PWAInstallBanner = ({ darkMode }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    if (window.__pwaInstallPrompt) {
      setDeferredPrompt(window.__pwaInstallPrompt);
      setShowAndroidBanner(true);
    }

    const handler = (e) => {
      e.preventDefault();
      window.__pwaInstallPrompt = e;
      setDeferredPrompt(e);
      setShowAndroidBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowAndroidBanner(false);
    setDeferredPrompt(null);
  };

  const dismissAndroid = () => {
    setShowAndroidBanner(false);
  };

  const dismissIOS = () => {
    setShowIOSBanner(false);
  };

  const bannerBg = darkMode ? "rgba(10,15,30,0.97)" : "rgba(255,255,255,0.98)";
  const borderColor = darkMode
    ? "rgba(245,158,11,0.2)"
    : "rgba(245,158,11,0.3)";
  const textPrimary = darkMode ? "#f1f5f9" : "#0f172a";
  const textSecondary = darkMode ? "#94a3b8" : "#475569";

  if (showAndroidBanner) {
    return (
      <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
        <div
          className="max-w-lg mx-auto rounded-2xl p-4 shadow-2xl flex items-center gap-4"
          style={{
            background: bannerBg,
            border: `1px solid ${borderColor}`,
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Logo */}
          <div className="w-11 h-11 rounded-xl gold-btn flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" style={{ color: "#020617" }} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p
              className="font-display font-bold text-sm"
              style={{ color: textPrimary }}
            >
              Axion<span className="gold-text">Trade</span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: textSecondary }}>
              Install for the best trading experience
            </p>
          </div>

          {/* Install button */}
          <button
            onClick={handleAndroidInstall}
            className="gold-btn flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold flex-shrink-0 border-0 cursor-pointer"
          >
            <Download size={12} />
            Install
          </button>

          {/* Dismiss */}
          <button
            onClick={dismissAndroid}
            className="flex-shrink-0 transition-colors"
            style={{ color: textSecondary }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f59e0b")}
            onMouseLeave={(e) => (e.currentTarget.style.color = textSecondary)}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (showIOSBanner) {
    return (
      <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
        <div
          className="max-w-lg mx-auto rounded-2xl p-4 shadow-2xl"
          style={{
            background: bannerBg,
            border: `1px solid ${borderColor}`,
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl gold-btn flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4" style={{ color: "#020617" }} />
            </div>
            <div className="flex-1">
              <p
                className="font-display font-bold text-sm"
                style={{ color: textPrimary }}
              >
                Axion<span className="gold-text">Trade</span>
              </p>
              <p className="text-xs" style={{ color: textSecondary }}>
                Add to your home screen
              </p>
            </div>
            <button
              onClick={dismissIOS}
              style={{ color: textSecondary }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f59e0b")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = textSecondary)
              }
            >
              <X size={16} />
            </button>
          </div>

          {/* Instructions */}
          <div
            className="flex items-center gap-3 rounded-xl p-3"
            style={{
              background: darkMode
                ? "rgba(245,158,11,0.08)"
                : "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.15)",
            }}
          >
            <Smartphone size={15} className="flex-shrink-0 gold-text" />
            <p
              className="text-xs leading-relaxed"
              style={{ color: textSecondary }}
            >
              Tap the{" "}
              <span style={{ color: "#f59e0b" }} className="font-semibold">
                Share button
              </span>{" "}
              in Safari, then select{" "}
              <span style={{ color: "#f59e0b" }} className="font-semibold">
                "Add to Home Screen"
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PWAInstallBanner;
