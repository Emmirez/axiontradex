import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Copy,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  ChevronDown,
  Upload,
  Clock,
  Shield,
  Building2,
  Bitcoin,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import api from "../../services/apiService";

// DEFAULT coins (always shown immediately, admin can change addresses) 
const DEFAULT_COINS = [
  {
    id: "USDT",
    label: "Tether (USDT)",
    color: "#26a17b",
    image: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    networks: [
      { id: "TRC20", label: "TRC20 (Tron)", fee: "1 USDT", address: "" },
      { id: "ERC20", label: "ERC20 (Ethereum)", fee: "5 USDT", address: "" },
      { id: "BEP20", label: "BEP20 (BSC)", fee: "0.5 USDT", address: "" },
    ],
  },
  {
    id: "BTC",
    label: "Bitcoin (BTC)",
    color: "#f7931a",
    image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    networks: [
      { id: "BTC", label: "Bitcoin Network", fee: "0.0001 BTC", address: "" },
    ],
  },
  {
    id: "ETH",
    label: "Ethereum (ETH)",
    color: "#627eea",
    image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    networks: [
      { id: "ERC20", label: "ERC20 (Ethereum)", fee: "0.002 ETH", address: "" },
      { id: "BEP20", label: "BEP20 (BSC)", fee: "0.001 BNB", address: "" },
    ],
  },
  {
    id: "BNB",
    label: "BNB",
    color: "#f0b90b",
    image:
      "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    networks: [
      { id: "BEP20", label: "BEP20 (BSC)", fee: "0.001 BNB", address: "" },
    ],
  },
  {
    id: "SOL",
    label: "Solana (SOL)",
    color: "#9945ff",
    image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    networks: [
      { id: "SOL", label: "Solana Network", fee: "0.01 SOL", address: "" },
    ],
  },
];

// DEFAULT bank details
const DEFAULT_BANK = {
  bankName: "",
  accountName: "",
  accountNumber: "",
  routingNumber: "",
  swiftCode: "",
  currency: "USD",
  reference: "Your full name + email",
  enabled: true,
};

const MIN_DEPOSIT = {
  USDT: 10,
  BTC: 0.0001,
  ETH: 0.005,
  BNB: 0.01,
  SOL: 0.1,
  BANK: 50,
};

const COIN_GECKOMAP = {
  USDT: "tether",
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
};

// CopyField
function CopyField({ label, value, darkMode, t }) {
  const [copied, setCopied] = useState(false);
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
      }}
    >
      <div>
        <div style={{ color: muted, fontSize: "0.7rem", marginBottom: 2 }}>
          {label}
        </div>
        <div
          style={{
            color: textClr,
            fontWeight: 600,
            fontSize: "0.875rem",
            fontFamily: "monospace",
          }}
        >
          {value}
        </div>
      </div>
      <button
        onClick={copy}
        style={{
          padding: "5px 10px",
          borderRadius: 7,
          border: `1px solid ${copied ? "#34d399" : border}`,
          background: copied ? "rgba(52,211,153,0.1)" : "transparent",
          color: copied ? "#34d399" : muted,
          fontSize: "0.7rem",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 4,
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        {copied ? (
          <CheckCircle style={{ width: 11, height: 11 }} />
        ) : (
          <Copy style={{ width: 11, height: 11 }} />
        )}
        {copied ? t("copied") : t("copy")}
      </button>
    </div>
  );
}

// Main
export default function DepositPage() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Start with defaults immediately — no null, no loading screen
  const [coins, setCoins] = useState(DEFAULT_COINS);
  const [bankDetails, setBankDetails] = useState(DEFAULT_BANK);
  const [selectedCoin, setSelectedCoin] = useState(DEFAULT_COINS[0]);
  const [selectedNetwork, setSelectedNetwork] = useState(
    DEFAULT_COINS[0].networks[0],
  );

  const [method, setMethod] = useState("crypto");
  const [coinDropdown, setCoinDropdown] = useState(false);
  const [addrCopied, setAddrCopied] = useState(false);

  const [amount, setAmount] = useState("");
  const [usdAmount, setUsdAmount] = useState("");
  const [amountMode, setAmountMode] = useState("usd");
  const [coinPrice, setCoinPrice] = useState(null);
  const [txHash, setTxHash] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [bankSenderName, setBankSenderName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Per-method receipts
  const [cryptoReceipt, setCryptoReceipt] = useState(null);
  const [cryptoReceiptPreview, setCryptoReceiptPreview] = useState(null);
  const [bankReceipt, setBankReceipt] = useState(null);
  const [bankReceiptPreview, setBankReceiptPreview] = useState(null);
  const cryptoReceiptRef = React.useRef(null);
  const bankReceiptRef = React.useRef(null);
  const receipt = method === "crypto" ? cryptoReceipt : bankReceipt;
  const receiptPreview =
    method === "crypto" ? cryptoReceiptPreview : bankReceiptPreview;
  const receiptInputRef =
    method === "crypto" ? cryptoReceiptRef : bankReceiptRef;
  const setReceipt = method === "crypto" ? setCryptoReceipt : setBankReceipt;
  const setReceiptPreview =
    method === "crypto" ? setCryptoReceiptPreview : setBankReceiptPreview;

  // theme
  const pageBg = darkMode ? "#020617" : "#f1f5f9";
  const cardBg = darkMode ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(245,158,11,0.15)" : "rgba(0,0,0,0.08)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const inputBg = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";

  // Fetch admin-set addresses silently and merge over defaults
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/users/deposit-settings");
        const data = res.data?.data?.settings;
        if (!data) return;

        if (Array.isArray(data.coins) && data.coins.length > 0) {
          const merged = data.coins.map((dbCoin) => {
            const def = DEFAULT_COINS.find((c) => c.id === dbCoin.id);
            return {
              ...def,
              ...dbCoin,
              networks: dbCoin.networks.map((dbNet) => {
                const defNet =
                  def?.networks.find((n) => n.id === dbNet.id) || {};
                return { ...defNet, ...dbNet };
              }),
            };
          });
          setCoins(merged);
          setSelectedCoin(merged[0]);
          setSelectedNetwork(merged[0].networks[0]);
        }

        if (data.bank) setBankDetails((prev) => ({ ...prev, ...data.bank }));
      } catch {
        /* silent — defaults already displayed */
      }
    };
    load();
  }, []);

  const fetchCoinPrice = useCallback(async (coinId) => {
    if (coinId === "USDT") {
      setCoinPrice(1);
      return;
    }
    try {
      const res = await api.get("/markets/prices");
      const prices = res.data?.data || res.data;
      const cgId = COIN_GECKOMAP[coinId];
      const price = prices[cgId]?.usd;
      if (price) setCoinPrice(price);
      else setCoinPrice(null);
    } catch {
      setCoinPrice(null);
    }
  }, []);

  useEffect(() => {
    fetchCoinPrice(selectedCoin.id);
  }, [selectedCoin.id, fetchCoinPrice]);

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
    setSelectedNetwork(coin.networks[0]);
    setCoinDropdown(false);
    setAmount("");
    setUsdAmount("");
    setSenderAddress("");
    setTxHash("");
    setError("");
    fetchCoinPrice(coin.id);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(selectedNetwork.address);
    setAddrCopied(true);
    setTimeout(() => setAddrCopied(false), 2000);
  };

  const handleUsdChange = (val) => {
    setUsdAmount(val);
    if (coinPrice && val && parseFloat(val) > 0) {
      const coinVal = parseFloat(val) / coinPrice;
      setAmount(coinVal.toFixed(8).replace(/\.?0+$/, ""));
    } else {
      setAmount("");
    }
  };

  const handleCoinAmountChange = (val) => {
    setAmount(val);
    if (coinPrice && val && parseFloat(val) > 0) {
      setUsdAmount((parseFloat(val) * coinPrice).toFixed(2));
    } else {
      setUsdAmount("");
    }
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(t("receiptMaxSize"));
      return;
    }
    setReceipt(file);
    const reader = new FileReader();
    reader.onload = (ev) => setReceiptPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const coinAmt = parseFloat(amount);
    const usdAmt = parseFloat(usdAmount);

    if (method === "crypto") {
      if (amountMode === "usd") {
        if (!usdAmt || usdAmt <= 0) {
          setError(t("enterValidAmount"));
          return;
        }
        if (!coinAmt || isNaN(coinAmt)) {
          setError(t("priceNotLoaded"));
          return;
        }
      } else {
        if (!coinAmt || coinAmt <= 0) {
          setError(t("enterValidAmount"));
          return;
        }
      }
      const minAmt = MIN_DEPOSIT[selectedCoin.id];
      if (coinAmt < minAmt) {
        setError(
          t("minDepositError", { amount: minAmt, coin: selectedCoin.id }),
        );
        return;
      }
      if (!txHash.trim()) {
        setError(t("txHashRequired"));
        return;
      }
      if (!senderAddress.trim()) {
        setError(t("senderAddressRequired"));
        return;
      }
    } else {
      const amt = parseFloat(amount);
      if (!amt || amt <= 0) {
        setError(t("enterValidAmount"));
        return;
      }
      if (amt < MIN_DEPOSIT.BANK) {
        setError(t("minBankDepositError", { amount: MIN_DEPOSIT.BANK }));
        return;
      }
      if (!bankRef.trim()) {
        setError(t("paymentReferenceRequired"));
        return;
      }
      if (!bankSenderName.trim()) {
        setError(t("nameRequired"));
        return;
      }
    }

    setSubmitting(true);
    try {
      const submitAmt = method === "crypto" ? coinAmt : parseFloat(amount);
      if (receipt) {
        const fd = new FormData();
        fd.append("amount", submitAmt);
        fd.append("currency", method === "bank" ? "USD" : selectedCoin.id);
        fd.append("method", method);
        if (method === "crypto") {
          fd.append("network", selectedNetwork.id);
          fd.append("txHash", txHash.trim());
          fd.append("address", senderAddress.trim());
        } else {
          fd.append("network", "bank_transfer");
          fd.append("reference", bankRef.trim());
          fd.append("address", bankSenderName.trim());
        }
        fd.append("receipt", receipt);
        await api.post("/wallet/deposit", fd);
      } else {
        const payload =
          method === "crypto"
            ? {
                amount: submitAmt,
                currency: selectedCoin.id,
                method,
                network: selectedNetwork.id,
                txHash: txHash.trim(),
                address: senderAddress.trim(),
              }
            : {
                amount: submitAmt,
                currency: "USD",
                method,
                network: "bank_transfer",
                reference: bankRef.trim(),
                address: bankSenderName.trim(),
              };
        await api.post("/wallet/deposit", payload);
      }
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          t("failedToSubmitDeposit"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Success
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: pageBg }}>
        <DashboardNav />
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            padding: "100px 20px 120px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(52,211,153,0.15)",
              border: "2px solid #34d399",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <CheckCircle style={{ width: 32, height: 32, color: "#34d399" }} />
          </div>
          <h2
            style={{
              fontFamily: '"Playfair Display",serif',
              fontWeight: 800,
              fontSize: "1.6rem",
              color: textClr,
              marginBottom: 10,
            }}
          >
            {t("depositSubmitted")}
          </h2>
          <p
            style={{
              color: muted,
              fontSize: "0.9rem",
              lineHeight: 1.6,
              marginBottom: 28,
            }}
          >
            {t("depositSubmittedMessage", {
              amount,
              currency: method === "bank" ? "USD" : selectedCoin.id,
            })}
          </p>
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 14,
              padding: "16px 20px",
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            {[
              {
                label: t("amount"),
                value: `${amount} ${method === "bank" ? "USD" : selectedCoin.id}`,
              },
              {
                label: t("method"),
                value:
                  method === "bank"
                    ? t("bankTransfer")
                    : `${t("crypto")} (${selectedNetwork.id})`,
              },
              {
                label: t("reference"),
                value:
                  method === "bank"
                    ? bankRef
                    : `${txHash.slice(0, 12)}...${txHash.slice(-8)}`,
              },
              {
                label: t("status"),
                value: t("pendingReview"),
                color: "#f59e0b",
              },
            ].map((r) => (
              <div
                key={r.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: `1px solid ${divLine}`,
                }}
              >
                <span style={{ color: muted, fontSize: "0.82rem" }}>
                  {r.label}
                </span>
                <span
                  style={{
                    color: r.color || textClr,
                    fontWeight: 600,
                    fontSize: "0.82rem",
                  }}
                >
                  {r.value}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => {
                setSubmitted(false);
                setAmount("");
                setTxHash("");
                setSenderAddress("");
                setBankRef("");
                setBankSenderName("");
              }}
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                border: `1px solid ${border}`,
                background: "transparent",
                color: textClr,
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("newDeposit")}
            </button>
            <Link
              to="/dashboard"
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                background: "linear-gradient(135deg,#d97706,#f59e0b)",
                color: "#020617",
                fontSize: "0.85rem",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              {t("dashboard")}
            </Link>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Main form
  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <style>{`
        .dep-input:focus{outline:none;border-color:rgba(245,158,11,0.5)!important;}
        .dep-input{transition:border-color 0.2s;}
        .coin-opt:hover{background:rgba(245,158,11,0.08)!important;}
        .net-btn:hover{border-color:rgba(245,158,11,0.4)!important;}
        .method-tab{transition:all 0.18s;}
      `}</style>
      <DashboardNav />
      <div
        style={{ maxWidth: 560, margin: "0 auto", padding: "80px 20px 120px" }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            color: muted,
            cursor: "pointer",
            fontSize: "0.82rem",
            marginBottom: 20,
          }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> {t("back")}
        </button>
        <h1
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 800,
            fontSize: "clamp(1.5rem,4vw,2rem)",
            color: textClr,
            marginBottom: 4,
          }}
        >
          {t("depositFunds")}
        </h1>
        <p style={{ color: muted, fontSize: "0.875rem", marginBottom: 24 }}>
          {t("depositSubtitle")}
        </p>

        {/* Method tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 20,
          }}
        >
          {[
            {
              id: "crypto",
              label: t("crypto"),
              icon: Bitcoin,
              desc: t("cryptoDesc"),
            },
            {
              id: "bank",
              label: t("bankTransfer"),
              icon: Building2,
              desc: t("bankDesc"),
            },
          ].map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              className="method-tab"
              onClick={() => {
                setMethod(id);
                setError("");
              }}
              style={{
                padding: "14px 16px",
                borderRadius: 16,
                border: `1.5px solid ${method === id ? "#f59e0b" : border}`,
                background: method === id ? "rgba(245,158,11,0.08)" : cardBg,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background:
                      method === id
                        ? "rgba(245,158,11,0.18)"
                        : "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    style={{
                      width: 15,
                      height: 15,
                      color: method === id ? "#f59e0b" : muted,
                    }}
                  />
                </div>
                <span
                  style={{
                    color: method === id ? "#f59e0b" : textClr,
                    fontWeight: 700,
                    fontSize: "0.875rem",
                  }}
                >
                  {label}
                </span>
              </div>
              <span style={{ color: muted, fontSize: "0.72rem" }}>{desc}</span>
            </button>
          ))}
        </div>

        {/* CRYPTO */}
        {method === "crypto" && (
          <>
            {/* Step 1 */}
            <div
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: "20px 22px",
                marginBottom: 14,
              }}
            >
              <StepLabel num="1" label={t("selectAsset")} textClr={textClr} />
              <div style={{ position: "relative", marginBottom: 12 }}>
                <button
                  onClick={() => setCoinDropdown((o) => !o)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${border}`,
                    background: inputBg,
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={selectedCoin.image}
                    alt={selectedCoin.id}
                    width={28}
                    height={28}
                    style={{ borderRadius: "50%" }}
                  />
                  <span
                    style={{
                      color: textClr,
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      flex: 1,
                      textAlign: "left",
                    }}
                  >
                    {selectedCoin.label}
                  </span>
                  <ChevronDown
                    style={{
                      width: 14,
                      height: 14,
                      color: muted,
                      transform: coinDropdown ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>
                {coinDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      right: 0,
                      zIndex: 50,
                      background: darkMode ? "rgba(10,16,35,0.99)" : "#fff",
                      border: `1px solid ${border}`,
                      borderRadius: 14,
                      padding: 6,
                      boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
                    }}
                  >
                    {coins.map((coin) => (
                      <button
                        key={coin.id}
                        className="coin-opt"
                        onClick={() => handleCoinSelect(coin)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: "none",
                          background:
                            selectedCoin.id === coin.id
                              ? "rgba(245,158,11,0.1)"
                              : "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={coin.image}
                          alt={coin.id}
                          width={26}
                          height={26}
                          style={{ borderRadius: "50%" }}
                        />
                        <span
                          style={{
                            color:
                              selectedCoin.id === coin.id ? "#f59e0b" : textClr,
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}
                        >
                          {coin.label}
                        </span>
                        {selectedCoin.id === coin.id && (
                          <div
                            style={{
                              marginLeft: "auto",
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#f59e0b",
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedCoin.networks.length > 1 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {selectedCoin.networks.map((net) => (
                    <button
                      key={net.id}
                      className="net-btn"
                      onClick={() => setSelectedNetwork(net)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: `1px solid ${selectedNetwork.id === net.id ? selectedCoin.color : border}`,
                        background:
                          selectedNetwork.id === net.id
                            ? `${selectedCoin.color}15`
                            : "transparent",
                        color:
                          selectedNetwork.id === net.id
                            ? selectedCoin.color
                            : muted,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {net.id}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: "20px 22px",
                marginBottom: 14,
              }}
            >
              <StepLabel num="2" label={t("sendToAddress")} textClr={textClr} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span style={{ color: muted, fontSize: "0.78rem" }}>
                  {t("network")}:{" "}
                  <strong style={{ color: textClr }}>
                    {selectedNetwork.label}
                  </strong>
                </span>
                <span style={{ color: muted, fontSize: "0.78rem" }}>
                  {t("fee")}:{" "}
                  <strong style={{ color: "#f59e0b" }}>
                    {selectedNetwork.fee}
                  </strong>
                </span>
              </div>
              <div
                style={{
                  background: darkMode
                    ? "rgba(245,158,11,0.06)"
                    : "rgba(245,158,11,0.04)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    color: muted,
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 8,
                  }}
                >
                  {selectedCoin.id} {t("address")} ({selectedNetwork.id})
                </div>
                {selectedNetwork.address ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        color: textClr,
                        fontFamily: "monospace",
                        fontSize: "0.78rem",
                        wordBreak: "break-all",
                        flex: 1,
                        lineHeight: 1.5,
                      }}
                    >
                      {selectedNetwork.address}
                    </span>
                    <button
                      onClick={copyAddress}
                      style={{
                        flexShrink: 0,
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: `1px solid ${addrCopied ? "#34d399" : border}`,
                        background: addrCopied
                          ? "rgba(52,211,153,0.12)"
                          : "transparent",
                        color: addrCopied ? "#34d399" : muted,
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {addrCopied ? (
                        <CheckCircle style={{ width: 12, height: 12 }} />
                      ) : (
                        <Copy style={{ width: 12, height: 12 }} />
                      )}
                      {addrCopied ? t("copiedExclamation") : t("copy")}
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      color: "#f59e0b",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    ⚠️ {t("addressNotConfigured")}
                  </div>
                )}
              </div>
              <WarnBox
                text={t("wrongCoinWarning", {
                  coin: selectedCoin.id,
                  network: selectedNetwork.label,
                })}
              />
            </div>

            {/* Step 3 */}
            <form
              onSubmit={handleSubmit}
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: "20px 22px",
                marginBottom: 14,
              }}
            >
              <StepLabel num="3" label={t("submitDetails")} textClr={textClr} />

              {/* Amount toggle */}
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <label
                    style={{
                      color: muted,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    {t("amountSent")}
                  </label>
                  <div
                    style={{
                      display: "flex",
                      borderRadius: 8,
                      overflow: "hidden",
                      border: `1px solid ${border}`,
                    }}
                  >
                    {["usd", "coin"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setAmountMode(m);
                          setAmount("");
                          setUsdAmount("");
                        }}
                        style={{
                          padding: "3px 10px",
                          border: "none",
                          background:
                            amountMode === m
                              ? "rgba(245,158,11,0.18)"
                              : "transparent",
                          color: amountMode === m ? "#f59e0b" : muted,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {m === "usd" ? "USD" : selectedCoin.id}
                      </button>
                    ))}
                  </div>
                </div>
                {amountMode === "usd" ? (
                  <div>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: 14,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: muted,
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        $
                      </span>
                      <input
                        className="dep-input"
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="any"
                        value={usdAmount}
                        onChange={(e) => handleUsdChange(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "11px 70px 11px 28px",
                          borderRadius: 10,
                          border: `1px solid ${border}`,
                          background: inputBg,
                          color: textClr,
                          fontSize: "0.9rem",
                          boxSizing: "border-box",
                          fontFamily: "monospace",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          right: 14,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#60a5fa",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                        }}
                      >
                        USD
                      </span>
                    </div>

                    {amount && coinPrice && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: "7px 12px",
                          borderRadius: 8,
                          background: darkMode
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(0,0,0,0.03)",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ color: muted, fontSize: "0.72rem" }}>
                          {t("approxIn", { coin: selectedCoin.id })}
                        </span>
                        <span
                          style={{
                            color: selectedCoin.color,
                            fontFamily: "monospace",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                          }}
                        >
                          {parseFloat(amount)
                            .toFixed(8)
                            .replace(/\.?0+$/, "")}{" "}
                          {selectedCoin.id}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ position: "relative" }}>
                      <input
                        className="dep-input"
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="any"
                        value={amount}
                        onChange={(e) => handleCoinAmountChange(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "11px 70px 11px 14px",
                          borderRadius: 10,
                          border: `1px solid ${border}`,
                          background: inputBg,
                          color: textClr,
                          fontSize: "0.9rem",
                          boxSizing: "border-box",
                          fontFamily: "monospace",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          right: 14,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: selectedCoin.color,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                        }}
                      >
                        {selectedCoin.id}
                      </span>
                    </div>

                    {usdAmount && coinPrice && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: "7px 12px",
                          borderRadius: 8,
                          background: darkMode
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(0,0,0,0.03)",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ color: muted, fontSize: "0.72rem" }}>
                          {t("approxInUsd")}
                        </span>
                        <span
                          style={{
                            color: "#60a5fa",
                            fontFamily: "monospace",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                          }}
                        >
                          $
                          {parseFloat(usdAmount).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div style={{ color: muted, fontSize: "0.7rem", marginTop: 4 }}>
                  {t("minimumAmount", {
                    amount: MIN_DEPOSIT[selectedCoin.id],
                    coin: selectedCoin.id,
                  })}
                  {coinPrice && selectedCoin.id !== "USDT" && (
                    <span
                      style={{
                        marginLeft: 8,
                        color: darkMode
                          ? "rgba(255,255,255,0.25)"
                          : "rgba(0,0,0,0.25)",
                      }}
                    >
                      1 {selectedCoin.id} ≈ $
                      {coinPrice.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  )}
                </div>
              </div>

              <DepInput
                label={t("txHashLabel")}
                type="text"
                placeholder={t("txHashPlaceholder")}
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                hint={t("txHashHint")}
                inputBg={inputBg}
                border={border}
                textClr={textClr}
                muted={muted}
                mono
              />

              <DepInput
                label={t("senderAddressLabel")}
                type="text"
                placeholder={t("senderAddressPlaceholder")}
                value={senderAddress}
                onChange={(e) => setSenderAddress(e.target.value)}
                inputBg={inputBg}
                border={border}
                textClr={textClr}
                muted={muted}
                mono
              />

              <ReceiptUpload
                receipt={receipt}
                receiptPreview={receiptPreview}
                receiptInputRef={receiptInputRef}
                onFileChange={handleReceiptChange}
                onRemove={() => {
                  setReceipt(null);
                  setReceiptPreview(null);
                }}
                inputBg={inputBg}
                border={border}
                textClr={textClr}
                muted={muted}
                darkMode={darkMode}
                t={t}
              />

              <ErrorBox error={error} t={t} />
              <SubmitBtn
                submitting={submitting}
                label={t("submitDepositRequest")}
                t={t}
              />
            </form>
          </>
        )}

        {/* BANK */}
        {method === "bank" && (
          <>
            <div
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: "20px 22px",
                marginBottom: 14,
              }}
            >
              <StepLabel
                num="1"
                label={t("transferToBank")}
                textClr={textClr}
              />
              {!bankDetails.enabled ? (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: muted,
                    fontSize: "0.85rem",
                  }}
                >
                  {t("bankUnavailable")}
                </div>
              ) : (
                <>
                  <div
                    style={{
                      background: darkMode
                        ? "rgba(245,158,11,0.05)"
                        : "rgba(245,158,11,0.03)",
                      border: "1px solid rgba(245,158,11,0.18)",
                      borderRadius: 12,
                      padding: "4px 16px 8px",
                      marginBottom: 12,
                    }}
                  >
                    {Object.entries({
                      [t("bankName")]: bankDetails.bankName,
                      [t("accountName")]: bankDetails.accountName,
                      [t("accountNumber")]: bankDetails.accountNumber,
                      [t("routingNumber")]: bankDetails.routingNumber,
                      [t("swiftCode")]: bankDetails.swiftCode,
                      [t("currency")]: bankDetails.currency,
                    })
                      .filter(([, v]) => v)
                      .map(([label, value]) => (
                        <div
                          key={label}
                          style={{ borderBottom: `1px solid ${divLine}` }}
                        >
                          <CopyField
                            label={label}
                            value={value}
                            darkMode={darkMode}
                            t={t}
                          />
                        </div>
                      ))}
                    <div style={{ padding: "10px 0" }}>
                      <div
                        style={{
                          color: muted,
                          fontSize: "0.7rem",
                          marginBottom: 2,
                        }}
                      >
                        {t("paymentReference")}
                      </div>
                      <div
                        style={{
                          color: "#f59e0b",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                        }}
                      >
                        {bankDetails.reference}
                      </div>
                      <div
                        style={{
                          color: muted,
                          fontSize: "0.7rem",
                          marginTop: 2,
                        }}
                      >
                        ⚠️ {t("mustIncludeReference")}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "rgba(96,165,250,0.07)",
                      border: "1px solid rgba(96,165,250,0.2)",
                    }}
                  >
                    <AlertCircle
                      style={{
                        width: 14,
                        height: 14,
                        color: "#60a5fa",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    />
                    <p
                      style={{
                        color: "#60a5fa",
                        fontSize: "0.75rem",
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {t("bankTransferInfo", { minAmount: MIN_DEPOSIT.BANK })}
                    </p>
                  </div>
                </>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: "20px 22px",
                marginBottom: 14,
              }}
            >
              <StepLabel
                num="2"
                label={t("submitTransferDetails")}
                textClr={textClr}
              />
              <DepInput
                label={t("amountSentUsd")}
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                suffix="USD"
                suffixColor="#60a5fa"
                hint={t("minimumBankAmount", { amount: MIN_DEPOSIT.BANK })}
                inputBg={inputBg}
                border={border}
                textClr={textClr}
                muted={muted}
              />
              <DepInput
                label={t("yourNameOnBank")}
                type="text"
                placeholder={t("fullNamePlaceholder")}
                value={bankSenderName}
                onChange={(e) => setBankSenderName(e.target.value)}
                inputBg={inputBg}
                border={border}
                textClr={textClr}
                muted={muted}
              />
              <DepInput
                label={t("paymentReferenceId")}
                type="text"
                placeholder={t("referencePlaceholder")}
                value={bankRef}
                onChange={(e) => setBankRef(e.target.value)}
                hint={t("referenceHint")}
                inputBg={inputBg}
                border={border}
                textClr={textClr}
                muted={muted}
                mono
              />
              <ReceiptUpload
                receipt={receipt}
                receiptPreview={receiptPreview}
                receiptInputRef={receiptInputRef}
                onFileChange={handleReceiptChange}
                onRemove={() => {
                  setReceipt(null);
                  setReceiptPreview(null);
                }}
                inputBg={inputBg}
                border={border}
                textClr={textClr}
                muted={muted}
                darkMode={darkMode}
                t={t}
              />
              <ErrorBox error={error} t={t} />
              <SubmitBtn
                submitting={submitting}
                label={t("submitBankDeposit")}
                t={t}
              />
            </form>
          </>
        )}

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {[
            {
              icon: Clock,
              color: "#f59e0b",
              title: t("processing_deposit"),
              text: t("processingText"),
            },
            {
              icon: Shield,
              color: "#34d399",
              title: t("secureVerified"),
              text: t("secureVerifiedText"),
            },
          ].map(({ icon: Icon, color, title, text }) => (
            <div
              key={title}
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `${color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Icon style={{ width: 15, height: 15, color }} />
              </div>
              <div
                style={{
                  color: textClr,
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  marginBottom: 4,
                }}
              >
                {title}
              </div>
              <div
                style={{ color: muted, fontSize: "0.72rem", lineHeight: 1.5 }}
              >
                {text}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

// Sub-components
function StepLabel({ num, label, textClr }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 14,
        fontWeight: 700,
        fontSize: "0.9rem",
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#d97706,#f59e0b)",
          color: "#020617",
          fontSize: "0.72rem",
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {num}
      </span>
      <span style={{ color: textClr }}>{label}</span>
    </div>
  );
}

function DepInput({
  label,
  hint,
  suffix,
  suffixColor,
  mono,
  inputBg,
  border,
  textClr,
  muted,
  ...props
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          color: muted,
          fontSize: "0.75rem",
          fontWeight: 500,
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          className="dep-input"
          style={{
            width: "100%",
            padding: `11px ${suffix ? "70px" : "14px"} 11px 14px`,
            borderRadius: 10,
            border: `1px solid ${border}`,
            background: inputBg,
            color: textClr,
            fontSize: "0.875rem",
            boxSizing: "border-box",
            fontFamily: mono ? "monospace" : "inherit",
          }}
          {...props}
        />
        {suffix && (
          <span
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: suffixColor || "#94a3b8",
              fontSize: "0.78rem",
              fontWeight: 700,
            }}
          >
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <div style={{ color: muted, fontSize: "0.7rem", marginTop: 4 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function WarnBox({ text }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 10,
        background: "rgba(248,113,113,0.07)",
        border: "1px solid rgba(248,113,113,0.2)",
      }}
    >
      <AlertCircle
        style={{
          width: 14,
          height: 14,
          color: "#f87171",
          flexShrink: 0,
          marginTop: 1,
        }}
      />
      <p
        style={{
          color: "#f87171",
          fontSize: "0.75rem",
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}

function ErrorBox({ error, t }) {
  if (!error) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 10,
        background: "rgba(248,113,113,0.08)",
        border: "1px solid rgba(248,113,113,0.2)",
        marginBottom: 14,
      }}
    >
      <AlertCircle
        style={{ width: 14, height: 14, color: "#f87171", flexShrink: 0 }}
      />
      <span style={{ color: "#f87171", fontSize: "0.78rem" }}>{error}</span>
    </div>
  );
}

function SubmitBtn({ submitting, label, t }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      style={{
        width: "100%",
        padding: "13px",
        borderRadius: 12,
        border: "none",
        background: "linear-gradient(135deg,#d97706,#f59e0b)",
        color: "#020617",
        fontSize: "0.9rem",
        fontWeight: 800,
        cursor: submitting ? "not-allowed" : "pointer",
        opacity: submitting ? 0.7 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 4,
      }}
    >
      <Upload style={{ width: 15, height: 15 }} />
      {submitting ? t("submittingDots") : label}
    </button>
  );
}

function ReceiptUpload({
  receipt,
  receiptPreview,
  receiptInputRef,
  onFileChange,
  onRemove,
  inputBg,
  border,
  textClr,
  muted,
  darkMode,
  t,
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          color: muted,
          fontSize: "0.75rem",
          fontWeight: 500,
          display: "block",
          marginBottom: 6,
        }}
      >
        {t("uploadReceipt")}{" "}
        <span style={{ color: muted, fontWeight: 400 }}>({t("optional_deposit")})</span>
      </label>
      {!receipt ? (
        <div
          onClick={() => receiptInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) onFileChange({ target: { files: [f] } });
          }}
          style={{
            border: `2px dashed ${border}`,
            borderRadius: 12,
            padding: "22px 16px",
            textAlign: "center",
            cursor: "pointer",
            background: inputBg,
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = border)}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "rgba(245,158,11,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
            }}
          >
            <Upload style={{ width: 18, height: 18, color: "#f59e0b" }} />
          </div>
          <div
            style={{
              color: textClr,
              fontWeight: 600,
              fontSize: "0.82rem",
              marginBottom: 4,
            }}
          >
            {t("clickToUpload")}
          </div>
          <div style={{ color: muted, fontSize: "0.72rem" }}>
            {t("uploadHint")}
          </div>
          <input
            ref={receiptInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={onFileChange}
            style={{ display: "none" }}
          />
        </div>
      ) : (
        <div
          style={{
            border: "1px solid rgba(52,211,153,0.35)",
            borderRadius: 12,
            padding: "12px 14px",
            background: "rgba(52,211,153,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {receiptPreview?.startsWith("data:image") ? (
            <img
              src={receiptPreview}
              alt="receipt"
              style={{
                width: 48,
                height: 48,
                objectFit: "cover",
                borderRadius: 8,
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: "rgba(52,211,153,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Upload style={{ width: 20, height: 20, color: "#34d399" }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: textClr,
                fontWeight: 600,
                fontSize: "0.82rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {receipt.name}
            </div>
            <div style={{ color: "#34d399", fontSize: "0.7rem", marginTop: 2 }}>
              {(receipt.size / 1024).toFixed(0)} KB · {t("readyToUpload")}
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            style={{
              background: "none",
              border: "none",
              color: "#f87171",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <span style={{ fontSize: "1rem" }}>×</span>
          </button>
        </div>
      )}
    </div>
  );
}
