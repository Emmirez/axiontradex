import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import api from "../../services/apiService";

const COIN_META = {
  USDT: {
    color: "#26a17b",
    image: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  },
  BTC: {
    color: "#f7931a",
    image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  },
  ETH: {
    color: "#627eea",
    image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  },
  BNB: {
    color: "#f0b90b",
    image:
      "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  },
  SOL: {
    color: "#9945ff",
    image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  },
};

const DEFAULT_COINS = [
  {
    id: "USDT",
    label: "Tether (USDT)",
    networks: [
      { id: "TRC20", label: "TRC20 (Tron)", fee: "1 USDT", address: "" },
      { id: "ERC20", label: "ERC20 (Ethereum)", fee: "5 USDT", address: "" },
      { id: "BEP20", label: "BEP20 (BSC)", fee: "0.5 USDT", address: "" },
    ],
  },
  {
    id: "BTC",
    label: "Bitcoin (BTC)",
    networks: [
      { id: "BTC", label: "Bitcoin Network", fee: "0.0001 BTC", address: "" },
    ],
  },
  {
    id: "ETH",
    label: "Ethereum (ETH)",
    networks: [
      { id: "ERC20", label: "ERC20 (Ethereum)", fee: "0.002 ETH", address: "" },
      { id: "BEP20", label: "BEP20 (BSC)", fee: "0.001 BNB", address: "" },
    ],
  },
  {
    id: "BNB",
    label: "BNB",
    networks: [
      { id: "BEP20", label: "BEP20 (BSC)", fee: "0.001 BNB", address: "" },
    ],
  },
  {
    id: "SOL",
    label: "Solana (SOL)",
    networks: [
      { id: "SOL", label: "Solana Network", fee: "0.01 SOL", address: "" },
    ],
  },
];

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

export default function SectionDepositSettings({
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  divLine,
  inputBg,
  showToast,
}) {
  const [coins, setCoins] = useState(DEFAULT_COINS);
  const [bank, setBank] = useState(DEFAULT_BANK);
  const [loading, setLoading] = useState(true);
  const [savingCoins, setSavingCoins] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [expanded, setExpanded] = useState({
    USDT: true,
    BTC: true,
    ETH: true,
    BNB: true,
    SOL: true,
  });

  useEffect(() => {
    api
      .get("/admin/deposit-settings")
      .then((res) => {
        const d = res.data?.data?.settings;
        if (!d) return;

        // Use DB data directly — no merging needed
        if (Array.isArray(d.coins) && d.coins.length > 0) {
          setCoins(d.coins); // ← just set directly
        }
        if (d.bank && Object.keys(d.bank).length > 0) {
          setBank((prev) => ({ ...prev, ...d.bank }));
        }
      })
      .catch(() => showToast("Could not load saved settings", "error"))
      .finally(() => setLoading(false));
  }, []);

  const updateAddr = (coinId, netId, field, val) => {
    setCoins((prev) =>
      prev.map((c) =>
        c.id !== coinId
          ? c
          : {
              ...c,
              networks: c.networks.map((n) =>
                n.id !== netId ? n : { ...n, [field]: val },
              ),
            },
      ),
    );
  };

  const saveCoins = async () => {
    setSavingCoins(true);
    try {
      await api.patch("/admin/deposit-settings/coins", { coins });
      showToast("Wallet addresses saved");
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setSavingCoins(false);
    }
  };

  const saveBank = async () => {
    setSavingBank(true);
    try {
      await api.patch("/admin/deposit-settings/bank", bank);
      showToast("Bank details saved");
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setSavingBank(false);
    }
  };

  const iStyle = {
    width: "100%",
    padding: "9px 11px",
    borderRadius: 8,
    border: `1px solid ${border}`,
    background: inputBg,
    color: textClr,
    fontSize: "0.82rem",
    boxSizing: "border-box",
    fontFamily: "monospace",
  };
  const lStyle = {
    color: muted,
    fontSize: "0.68rem",
    fontWeight: 600,
    display: "block",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: "center", color: muted }}>
        Loading…
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 700,
      }}
    >
      {/* Crypto */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: `1px solid ${divLine}`,
          }}
        >
          <div>
            <div
              style={{ color: textClr, fontWeight: 700, fontSize: "0.9rem" }}
            >
              Crypto Wallet Addresses
            </div>
            <div style={{ color: muted, fontSize: "0.72rem" }}>
              Users see these on the deposit page
            </div>
          </div>
          <button
            onClick={saveCoins}
            disabled={savingCoins}
            style={{
              padding: "8px 16px",
              borderRadius: 9,
              border: "none",
              background: "linear-gradient(135deg,#d97706,#f59e0b)",
              color: "#020617",
              fontWeight: 700,
              fontSize: "0.8rem",
              cursor: savingCoins ? "not-allowed" : "pointer",
              opacity: savingCoins ? 0.7 : 1,
            }}
          >
            {savingCoins ? "Saving…" : "Save Addresses"}
          </button>
        </div>
        {coins.map((coin, ci) => {
          const meta = COIN_META[coin.id] || {};
          const isOpen = expanded[coin.id];
          return (
            <div
              key={coin.id}
              style={{
                borderBottom:
                  ci < coins.length - 1 ? `1px solid ${divLine}` : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 20px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setExpanded((e) => ({ ...e, [coin.id]: !e[coin.id] }))
                }
              >
                {meta.image && (
                  <img
                    src={meta.image}
                    alt={coin.id}
                    width={24}
                    height={24}
                    style={{ borderRadius: "50%" }}
                  />
                )}
                <span
                  style={{
                    color: textClr,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    flex: 1,
                  }}
                >
                  {coin.label}
                </span>
                <span
                  style={{ color: muted, fontSize: "0.7rem", marginRight: 6 }}
                >
                  {coin.networks?.filter((n) => n.address).length}/
                  {coin.networks?.length} set
                </span>
                <ChevronDown
                  style={{
                    width: 13,
                    height: 13,
                    color: muted,
                    transform: isOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </div>
              {isOpen && (
                <div
                  style={{
                    padding: "0 20px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {coin.networks?.map((net) => (
                    <div
                      key={net.id}
                      style={{
                        background: darkMode
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(0,0,0,0.02)",
                        border: `1px solid ${divLine}`,
                        borderRadius: 10,
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          color: textClr,
                          fontWeight: 600,
                          fontSize: "0.78rem",
                          marginBottom: 8,
                        }}
                      >
                        {net.label}
                        {!net.address && (
                          <span
                            style={{
                              marginLeft: 8,
                              color: "#f59e0b",
                              fontSize: "0.65rem",
                              background: "rgba(245,158,11,0.1)",
                              padding: "1px 6px",
                              borderRadius: 4,
                            }}
                          >
                            Not set
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 130px",
                          gap: 8,
                        }}
                      >
                        <div>
                          <label style={lStyle}>Wallet Address</label>
                          <input
                            style={{
                              ...iStyle,
                              borderColor: net.address
                                ? border
                                : "rgba(245,158,11,0.3)",
                            }}
                            type="text"
                            placeholder={`${coin.id} ${net.id} deposit address`}
                            value={net.address || ""}
                            onChange={(e) =>
                              updateAddr(
                                coin.id,
                                net.id,
                                "address",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div>
                          <label style={lStyle}>Fee</label>
                          <input
                            style={iStyle}
                            type="text"
                            placeholder="e.g. 1 USDT"
                            value={net.fee || ""}
                            onChange={(e) =>
                              updateAddr(coin.id, net.id, "fee", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bank */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: `1px solid ${divLine}`,
          }}
        >
          <div>
            <div
              style={{ color: textClr, fontWeight: 700, fontSize: "0.9rem" }}
            >
              Bank Transfer Details
            </div>
            <div style={{ color: muted, fontSize: "0.72rem" }}>
              Shown to users on the bank deposit tab
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => setBank((b) => ({ ...b, enabled: !b.enabled }))}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${bank.enabled ? "rgba(52,211,153,0.35)" : border}`,
                background: bank.enabled
                  ? "rgba(52,211,153,0.08)"
                  : "transparent",
                color: bank.enabled ? "#34d399" : muted,
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {bank.enabled ? "✓ Enabled" : "✗ Disabled"}
            </button>
            <button
              onClick={saveBank}
              disabled={savingBank}
              style={{
                padding: "8px 16px",
                borderRadius: 9,
                border: "none",
                background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: savingBank ? "not-allowed" : "pointer",
                opacity: savingBank ? 0.7 : 1,
              }}
            >
              {savingBank ? "Saving…" : "Save Bank"}
            </button>
          </div>
        </div>
        <div
          style={{
            padding: "20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          {[
            { key: "bankName", label: "Bank Name", ph: "Chase Bank" },
            { key: "accountName", label: "Account Name", ph: "AxionTrade Ltd" },
            { key: "accountNumber", label: "Account Number", ph: "1234567890" },
            { key: "routingNumber", label: "Routing Number", ph: "021000021" },
            { key: "swiftCode", label: "SWIFT / BIC", ph: "CHASUS33" },
            { key: "currency", label: "Currency", ph: "USD" },
          ].map(({ key, label, ph }) => (
            <div key={key}>
              <label style={lStyle}>{label}</label>
              <input
                style={iStyle}
                type="text"
                placeholder={ph}
                value={bank[key] || ""}
                onChange={(e) =>
                  setBank((b) => ({ ...b, [key]: e.target.value }))
                }
              />
            </div>
          ))}
          <div style={{ gridColumn: "span 2" }}>
            <label style={lStyle}>Payment Reference Instruction</label>
            <input
              style={iStyle}
              type="text"
              placeholder="Your full name + registered email"
              value={bank.reference || ""}
              onChange={(e) =>
                setBank((b) => ({ ...b, reference: e.target.value }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
