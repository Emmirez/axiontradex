// frontend/src/pages/user/SwapPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowDownUp,
  RefreshCw,
  ChevronDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  TrendingUp,
  TrendingDown,
  Info,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import DashboardNav from "./DashboardNav";
import { useTranslation } from "react-i18next";
import BottomNav from "./BottomNav";
import api from "../../services/apiService";

const CURRENCY_META = {
  USD: {
    cgId: null,
    symbol: "$",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    labelKey: "us_dollar",
    decimals: 2,
    image: null,
  },
  USDT: {
    cgId: "tether",
    symbol: "₮",
    color: "#26a17b",
    bg: "rgba(38,161,123,0.12)",
    labelKey: "tether",
    decimals: 2,
    image: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  },
  BTC: {
    cgId: "bitcoin",
    symbol: "₿",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    labelKey: "bitcoin",
    decimals: 8,
    image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  },
  ETH: {
    cgId: "ethereum",
    symbol: "Ξ",
    color: "#818cf8",
    bg: "rgba(129,140,248,0.12)",
    labelKey: "ethereum",
    decimals: 6,
    image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  },
  SOL: {
    cgId: "solana",
    symbol: "◎",
    color: "#9945ff",
    bg: "rgba(153,69,255,0.12)",
    labelKey: "solana",
    decimals: 4,
    image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  },
  BNB: {
    cgId: "binancecoin",
    symbol: "B",
    color: "#f3ba2f",
    bg: "rgba(243,186,47,0.12)",
    labelKey: "bnb",
    decimals: 4,
    image:
      "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  },
};

const CURRENCIES = Object.keys(CURRENCY_META);

function Toast({ toasts, t }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 90,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {toasts.map((tItem) => (
        <div
          key={tItem.id}
          style={{
            padding: "11px 20px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: "0.82rem",
            color: "#fff",
            whiteSpace: "nowrap",
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            animation: "toastIn 0.25s ease",
            background:
              tItem.type === "error"
                ? "rgba(248,113,113,0.95)"
                : tItem.type === "warning"
                  ? "rgba(245,158,11,0.95)"
                  : "rgba(52,211,153,0.95)",
          }}
        >
          {tItem.msg}
        </div>
      ))}
    </div>
  );
}

function CurrencySelector({
  value,
  onChange,
  exclude,
  walletBalances,
  rates,
  darkMode,
  textClr,
  muted,
  border,
  t,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const meta = CURRENCY_META[value];
  const dropBg = darkMode ? "#0f172a" : "#ffffff";

  const getBalance = (c) => {
    if (c === "USD") return walletBalances?.balance ?? 0;
    return walletBalances?.balances?.[c] ?? 0;
  };

  const getUsdValue = (c, bal) => {
    if (!rates) return 0;
    return bal * (rates[c] || 1);
  };

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 14px",
          borderRadius: 14,
          border: `1px solid ${open ? meta.color + "60" : border}`,
          background: meta.bg,
          cursor: "pointer",
          transition: "border 0.2s",
          minWidth: 140,
        }}
      >
        {meta.image ? (
          <img
            src={meta.image}
            alt={value}
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span
            style={{
              fontSize: "1rem",
              color: meta.color,
              fontWeight: 800,
              width: 22,
              textAlign: "center",
            }}
          >
            {meta.symbol}
          </span>
        )}
        <div style={{ flex: 1, textAlign: "left" }}>
          <div
            style={{
              color: textClr,
              fontWeight: 700,
              fontSize: "0.88rem",
              lineHeight: 1,
            }}
          >
            {value}
          </div>
          <div style={{ color: muted, fontSize: "0.58rem", marginTop: 2 }}>
            {t(meta.labelKey)}
          </div>
        </div>
        <ChevronDown
          size={13}
          color={muted}
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 500,
            background: dropBg,
            border: `1px solid ${border}`,
            borderRadius: 16,
            overflow: "hidden",
            minWidth: 230,
            boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
          }}
        >
          {CURRENCIES.filter((c) => c !== exclude).map((c, i, arr) => {
            const cm = CURRENCY_META[c];
            const bal = getBalance(c);
            const usd = getUsdValue(c, bal);
            return (
              <div
                key={c}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 14px",
                  cursor: "pointer",
                  background: c === value ? cm.bg : "transparent",
                  borderBottom:
                    i < arr.length - 1 ? `1px solid ${border}` : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = cm.bg)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    c === value ? cm.bg : "transparent")
                }
              >
                {cm.image ? (
                  <img
                    src={cm.image}
                    alt={c}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: cm.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        color: cm.color,
                        fontWeight: 800,
                        fontSize: "0.75rem",
                      }}
                    >
                      {cm.symbol}
                    </span>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: textClr,
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    {c}
                  </div>
                  <div style={{ color: muted, fontSize: "0.62rem" }}>
                    {t(cm.labelKey)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      color: textClr,
                      fontWeight: 600,
                      fontSize: "0.78rem",
                    }}
                  >
                    {bal.toFixed(cm.decimals)}
                  </div>
                  <div style={{ color: muted, fontSize: "0.6rem" }}>
                    ${usd.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SwapPage() {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [fromCurrency, setFromCurrency] = useState("USDT");
  const [toCurrency, setToCurrency] = useState("BTC");
  const [fromAmount, setFromAmount] = useState("");
  const [quote, setQuote] = useState(null);
  const [rates, setRates] = useState(null);
  const [walletBal, setWalletBal] = useState(null);
  const [history, setHistory] = useState([]);
  const [rateAge, setRateAge] = useState(0);
  const [swapSuccess, setSwapSuccess] = useState(null);

  const [loadingRates, setLoadingRates] = useState(true);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [loadingHist, setLoadingHist] = useState(true);

  const [toasts, setToasts] = useState([]);
  const quoteTimer = useRef(null);
  const rateTimer = useRef(null);

  const showToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  const fetchRates = useCallback(async (silent = false) => {
    if (!silent) setLoadingRates(true);
    try {
      const res = await api.get("/markets/prices");
      const data = res.data?.data || res.data;

      const mapped = { USD: 1, USDT: 1 };
      for (const [currency, meta] of Object.entries(CURRENCY_META)) {
        if (!meta.cgId) continue;
        const price = data[meta.cgId]?.usd;
        if (price) mapped[currency] = price;
      }
      setRates(mapped);
      setRateAge(0);
    } catch {
      showToast(t("could_not_refresh_rates"), "warning");
    } finally {
      setLoadingRates(false);
    }
  }, []);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await api.get("/wallet");
      setWalletBal(res.data?.data?.wallet);
    } catch {}
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHist(true);
    try {
      const res = await api.get("/swap/history?limit=10");
      setHistory(res.data?.data?.swaps || []);
    } catch {
    } finally {
      setLoadingHist(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    fetchWallet();
    fetchHistory();
  }, []);

  // Rate age counter
  useEffect(() => {
    const t = setInterval(() => setRateAge((a) => a + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-refresh rates every 30s — matches your priceCache TTL
  useEffect(() => {
    const t = setInterval(() => fetchRates(true), 30_000);
    return () => clearInterval(t);
  }, [fetchRates]);

  useEffect(() => {
    setQuote(null);
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;
    clearTimeout(quoteTimer.current);
    quoteTimer.current = setTimeout(async () => {
      setLoadingQuote(true);
      try {
        const res = await api.post("/swap/quote", {
          fromCurrency,
          toCurrency,
          fromAmount: parseFloat(fromAmount),
        });
        setQuote(res.data?.data);
      } catch (err) {
        showToast(
          err.response?.data?.message || t("failed_to_get_quote"),
          "error",
        );
      } finally {
        setLoadingQuote(false);
      }
    }, 500);
    return () => clearTimeout(quoteTimer.current);
  }, [fromAmount, fromCurrency, toCurrency]);

  const getBalance = (c) => {
    if (!walletBal) return 0;
    if (c === "USD") return walletBal.balance ?? 0;
    return walletBal.balances?.[c] ?? 0;
  };

  const fromMeta = CURRENCY_META[fromCurrency];
  const toMeta = CURRENCY_META[toCurrency];
  const fromBalance = getBalance(fromCurrency);
  const insufficient = parseFloat(fromAmount) > fromBalance;
  const fromUsdVal =
    rates && fromAmount
      ? (parseFloat(fromAmount) * (rates[fromCurrency] || 1)).toFixed(2)
      : null;

  const handleFlip = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount("");
    setQuote(null);
  };

  const handleMax = () => setFromAmount(fromBalance.toFixed(fromMeta.decimals));

  const handleExecute = async () => {
    if (!quote || insufficient || !fromAmount) return;
    setExecuting(true);
    try {
      const res = await api.post("/swap/execute", {
        fromCurrency,
        toCurrency,
        fromAmount: parseFloat(fromAmount),
        expectedToAmount: quote.toAmount,
        slippageTolerance: 0.01,
      });
      const data = res.data?.data;
      setSwapSuccess(data);
      setFromAmount("");
      setQuote(null);
      if (data.wallet) setWalletBal(data.wallet);
      fetchHistory();
      showToast(
        t("swap_success_message", {
          fromAmount,
          fromCurrency,
          toAmount: data.toAmount,
          toCurrency,
        }),
        "success",
      );
    } catch (err) {
      showToast(err.response?.data?.message || t("swap_failed"), "error");
    } finally {
      setExecuting(false);
    }
  };

  const parseSwapNote = (note) => {
    const m = note?.match(/Swapped ([\d.]+) (\w+) → ([\d.]+) (\w+)/);
    if (!m) return null;
    return { fromAmt: m[1], fromC: m[2], toAmt: m[3], toC: m[4] };
  };

  const canSwap = quote && !executing && !insufficient && !!fromAmount;

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <style>{`
        @keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .spin   { animation: spin 1s linear infinite; }
        .fadeUp { animation: fadeUp 0.3s ease both; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input:focus { outline: none; }
        .flip-btn:hover { transform: rotate(180deg) !important; background: rgba(245,158,11,0.1) !important; }
      `}</style>

      <DashboardNav />
      <Toast toasts={toasts} t={t} />

      <div style={{ paddingTop: 80, paddingBottom: 100 }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 20px" }}>
          {/* Page header */}
          <div
            className="fadeUp"
            style={{ marginBottom: 24, animationDelay: "0ms" }}
          >
            <h1
              style={{
                color: textClr,
                fontWeight: 800,
                fontSize: "1.8rem",
                margin: 0,
              }}
            >
              {t("swap")}
            </h1>
            <p style={{ color: muted, marginTop: 4, fontSize: "0.88rem" }}>
              {t("swap_subtitle")}
            </p>
          </div>

          {/* Live rate ticker  */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              borderRadius: 12,
              background: cardBg,
              border: `1px solid ${border}`,
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flex: 1,
                minWidth: 0,
              }}
            >
              <TrendingUp size={13} color="#34d399" style={{ flexShrink: 0 }} />
              {loadingRates ? (
                <span style={{ color: muted, fontSize: "0.72rem" }}>
                  {t("loading_rates")}
                </span>
              ) : rates ? (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    fontSize: "0.72rem",
                    overflowX: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {["BTC", "ETH", "SOL", "BNB"].map((c) => (
                    <span
                      key={c}
                      style={{ color: muted, whiteSpace: "nowrap" }}
                    >
                      {c}{" "}
                      <b style={{ color: textClr }}>
                        $
                        {(rates[c] || 0).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </b>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Timer — flexShrink:0 so it never gets pushed */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: rateAge > 25 ? "#f87171" : muted,
                  fontSize: "0.65rem",
                }}
              >
                {rateAge}s
              </span>
              <button
                onClick={() => fetchRates()}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: muted,
                  display: "flex",
                  padding: 2,
                }}
              >
                <RefreshCw size={12} className={loadingRates ? "spin" : ""} />
              </button>
            </div>
          </div>

          {/*  Swap card  */}
          <div
            className="fadeUp"
            style={{
              animationDelay: "100ms",
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 24,
              padding: 20,
              marginBottom: 18,
              position: "relative",
              zIndex: 10,
            }}
          >
            {/* FROM */}
            <div
              style={{
                background: inputBg,
                borderRadius: 16,
                padding: "14px 16px",
                marginBottom: 6,
                border: `1px solid ${insufficient ? "rgba(248,113,113,0.4)" : "transparent"}`,
                transition: "border 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    color: muted,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {t("you_pay")}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      color: insufficient ? "#f87171" : muted,
                      fontSize: "0.68rem",
                    }}
                  >
                    {t("balance")}:{" "}
                    <b style={{ color: insufficient ? "#f87171" : textClr }}>
                      {fromBalance.toFixed(fromMeta.decimals)}
                    </b>
                  </span>
                  <button
                    onClick={handleMax}
                    style={{
                      padding: "2px 8px",
                      borderRadius: 6,
                      border: `1px solid ${fromMeta.color}50`,
                      background: fromMeta.bg,
                      color: fromMeta.color,
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {t("max")}
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    color: textClr,
                    fontSize: "1.9rem",
                    fontWeight: 700,
                    padding: 0,
                    minWidth: 0,
                  }}
                />
                <CurrencySelector
                  value={fromCurrency}
                  onChange={(c) => {
                    setFromCurrency(c);
                    setQuote(null);
                    setFromAmount("");
                  }}
                  exclude={toCurrency}
                  walletBalances={walletBal}
                  rates={rates}
                  darkMode={darkMode}
                  textClr={textClr}
                  muted={muted}
                  border={border}
                  t={t}
                />
              </div>
              <div style={{ marginTop: 6, minHeight: 16 }}>
                {fromUsdVal && (
                  <span style={{ color: muted, fontSize: "0.7rem" }}>
                    ≈ ${fromUsdVal} USD
                  </span>
                )}
                {insufficient && (
                  <span
                    style={{
                      color: "#f87171",
                      fontSize: "0.7rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <AlertCircle size={11} /> {t("insufficient_balance")}
                  </span>
                )}
              </div>
            </div>

            {/* Flip */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "2px 0",
              }}
            >
              <button
                className="flip-btn"
                onClick={handleFlip}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: `2px solid ${border}`,
                  background: cardBg,
                  cursor: "pointer",
                  color: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.25s ease, background 0.2s",
                }}
              >
                <ArrowDownUp size={15} />
              </button>
            </div>

            {/* TO */}
            <div
              style={{
                background: inputBg,
                borderRadius: 16,
                padding: "14px 16px",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    color: muted,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {t("you_receive")}
                </span>
                <span style={{ color: muted, fontSize: "0.68rem" }}>
                  {t("balance")}:{" "}
                  <b style={{ color: textClr }}>
                    {getBalance(toCurrency).toFixed(toMeta.decimals)}
                  </b>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {loadingQuote ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        height: 46,
                      }}
                    >
                      <Loader size={16} className="spin" color={muted} />
                      <span style={{ color: muted, fontSize: "1rem" }}>
                        {t("calculating")}
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: "1.9rem",
                        fontWeight: 700,
                        color: quote ? toMeta.color : muted,
                        transition: "color 0.2s",
                      }}
                    >
                      {quote ? quote.toAmount.toFixed(toMeta.decimals) : "0.00"}
                    </div>
                  )}
                  {quote && rates && (
                    <div
                      style={{ color: muted, fontSize: "0.7rem", marginTop: 4 }}
                    >
                      ≈ $
                      {(quote.toAmount * (rates[toCurrency] || 1)).toFixed(2)}{" "}
                      USD
                    </div>
                  )}
                </div>
                <CurrencySelector
                  value={toCurrency}
                  onChange={(c) => {
                    setToCurrency(c);
                    setQuote(null);
                  }}
                  exclude={fromCurrency}
                  walletBalances={walletBal}
                  rates={rates}
                  darkMode={darkMode}
                  textClr={textClr}
                  muted={muted}
                  border={border}
                  t={t}
                />
              </div>
            </div>

            {/* Quote breakdown */}
            {quote && (
              <div
                style={{
                  background: darkMode
                    ? "rgba(245,158,11,0.05)"
                    : "rgba(245,158,11,0.03)",
                  border: "1px solid rgba(245,158,11,0.18)",
                  borderRadius: 14,
                  padding: "12px 14px",
                  marginBottom: 16,
                }}
              >
                {[
                  {
                    labelKey: "rate",
                    value: `1 ${fromCurrency} = ${quote.rate.toFixed(fromMeta.decimals > 4 ? 6 : 4)} ${toCurrency}`,
                  },
                  {
                    labelKey: "fee_percent_swap",
                    value: `$${quote.feeUSD.toFixed(4)}`,
                  },
                  {
                    labelKey: "you_get",
                    value: `${quote.toAmount.toFixed(toMeta.decimals)} ${toCurrency}`,
                    highlight: true,
                  },
                ].map(({ labelKey, value, highlight }) => (
                  <div
                    key={labelKey}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 5,
                    }}
                  >
                    <span style={{ color: muted, fontSize: "0.74rem" }}>
                      {t(labelKey)}
                    </span>
                    <span
                      style={{
                        color: highlight ? toMeta.color : textClr,
                        fontWeight: highlight ? 700 : 500,
                        fontSize: "0.74rem",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Info line */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginBottom: 14,
              }}
            >
              <Info size={10} color={muted} />
              <span style={{ color: muted, fontSize: "0.62rem" }}>
                {t("swap_info_line")}
              </span>
            </div>

            {/* Swap button */}
            <button
              onClick={handleExecute}
              disabled={!canSwap}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 14,
                border: "none",
                background: canSwap
                  ? "linear-gradient(135deg,#f59e0b,#d97706)"
                  : darkMode
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.05)",
                color: canSwap ? "#020617" : muted,
                fontWeight: 800,
                fontSize: "0.95rem",
                cursor: canSwap ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {executing ? (
                <>
                  <Loader size={16} className="spin" /> {t("processing")}
                </>
              ) : insufficient ? (
                t("insufficient_balance")
              ) : !fromAmount ? (
                t("enter_amount")
              ) : loadingQuote ? (
                t("getting_quote")
              ) : !quote ? (
                t("getting_quote")
              ) : (
                <>
                  <span>{fromCurrency}</span>
                  <ArrowRight size={14} />
                  <span>{toCurrency}</span>
                  <span style={{ marginLeft: 4 }}>{t("swap_now")}</span>
                </>
              )}
            </button>
          </div>

          {/* Success card */}
          {swapSuccess && (
            <div
              className="fadeUp"
              style={{
                background: "rgba(52,211,153,0.08)",
                border: "1px solid rgba(52,211,153,0.25)",
                borderRadius: 20,
                padding: 18,
                marginBottom: 18,
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
                <CheckCircle size={18} color="#34d399" />
                <span style={{ color: "#34d399", fontWeight: 700 }}>
                  {t("swap_complete")}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {[
                  {
                    labelKey: "paid",
                    value: `${swapSuccess.fromAmount} ${swapSuccess.fromCurrency}`,
                    color: "#f87171",
                  },
                  {
                    labelKey: "received",
                    value: `${swapSuccess.toAmount} ${swapSuccess.toCurrency}`,
                    color: "#34d399",
                  },
                  {
                    labelKey: "fee",
                    value: `$${swapSuccess.feeUSD}`,
                    color: muted,
                  },
                  {
                    labelKey: "ref",
                    value: swapSuccess.reference,
                    color: muted,
                  },
                ].map(({ labelKey, value, color }) => (
                  <div
                    key={labelKey}
                    style={{
                      background: "rgba(0,0,0,0.15)",
                      borderRadius: 10,
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        color: muted,
                        fontSize: "0.62rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: 3,
                      }}
                    >
                      {t(labelKey)}
                    </div>
                    <div
                      style={{
                        color,
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        wordBreak: "break-all",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSwapSuccess(null)}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "8px",
                  borderRadius: 10,
                  border: "1px solid rgba(52,211,153,0.3)",
                  background: "transparent",
                  color: "#34d399",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {t("dismiss")}
              </button>
            </div>
          )}

          {/* Swap history */}
          <div
            className="fadeUp"
            style={{
              animationDelay: "160ms",
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: `1px solid ${divLine}`,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Clock size={13} color={muted} />
              <h2
                style={{
                  color: textClr,
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {t("recent_swaps")}
              </h2>
            </div>

            {loadingHist ? (
              <div style={{ padding: 28, textAlign: "center" }}>
                <Loader size={18} className="spin" color={muted} />
              </div>
            ) : history.length === 0 ? (
              <div
                style={{
                  padding: 28,
                  textAlign: "center",
                  color: muted,
                  fontSize: "0.82rem",
                }}
              >
                {t("no_swaps_yet")}
              </div>
            ) : (
              history.map((swap, i) => {
                const parsed = parseSwapNote(swap.note);
                const fMeta = parsed?.fromC
                  ? CURRENCY_META[parsed.fromC]
                  : null;
                const tMeta = parsed?.toC ? CURRENCY_META[parsed.toC] : null;
                return (
                  <div
                    key={swap._id}
                    style={{
                      padding: "13px 18px",
                      borderBottom:
                        i < history.length - 1
                          ? `1px solid ${divLine}`
                          : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      {/* From/To icons */}
                      <div
                        style={{
                          position: "relative",
                          width: 38,
                          height: 32,
                          flexShrink: 0,
                        }}
                      >
                        {fMeta?.image && (
                          <img
                            src={fMeta.image}
                            alt={parsed.fromC}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              position: "absolute",
                              left: 0,
                              top: 0,
                              border: `2px solid ${darkMode ? "#0f172a" : "#fff"}`,
                            }}
                          />
                        )}
                        {tMeta?.image && (
                          <img
                            src={tMeta.image}
                            alt={parsed.toC}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              position: "absolute",
                              left: 12,
                              top: 6,
                              border: `2px solid ${darkMode ? "#0f172a" : "#fff"}`,
                            }}
                          />
                        )}
                      </div>
                      <div>
                        {parsed ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              color: textClr,
                              fontWeight: 600,
                              fontSize: "0.82rem",
                            }}
                          >
                            <span style={{ color: fMeta?.color }}>
                              {parsed.fromAmt} {parsed.fromC}
                            </span>
                            <ArrowRight size={11} color={muted} />
                            <span style={{ color: tMeta?.color }}>
                              {parsed.toAmt} {parsed.toC}
                            </span>
                          </div>
                        ) : (
                          <div
                            style={{
                              color: textClr,
                              fontWeight: 600,
                              fontSize: "0.82rem",
                            }}
                          >
                            {t("swap")}
                          </div>
                        )}
                        <div
                          style={{
                            color: muted,
                            fontSize: "0.63rem",
                            marginTop: 2,
                          }}
                        >
                          {new Date(swap.createdAt).toLocaleDateString()} ·{" "}
                          {new Date(swap.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          color: "#34d399",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                        }}
                      >
                        +{parsed?.toAmt} {parsed?.toC}
                      </div>
                      <div style={{ color: muted, fontSize: "0.62rem" }}>
                        ≈ ${swap.amount?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
