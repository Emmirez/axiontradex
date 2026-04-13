// frontend/src/pages/admin/SectionGold.jsx
import React, { useState, useEffect, useRef } from "react";
import { Search, TrendingUp, RefreshCw, X, Loader } from "lucide-react";
import api from "../../services/apiService";
import { Skel } from "./AdminShared";

export default function SectionGold({
  darkMode,
  cardBg,
  textClr,
  muted,
  border,
  divLine,
  inputBg,
  showToast,
}) {
  const [positions, setPositions] = useState([]);
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [tradeMode, setTradeMode] = useState("buy"); // buy | sell
  const [usdtAmount, setUsdtAmount] = useState("");
  const [gramsAmount, setGramsAmount] = useState("");
  const [tradeNote, setTradeNote] = useState("");
  const [executing, setExecuting] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef(null);

  const iStyle = {
    width: "100%",
    padding: "9px 11px",
    borderRadius: 10,
    border: `1px solid ${border}`,
    background: inputBg,
    color: textClr,
    fontSize: "0.85rem",
    outline: "none",
    boxSizing: "border-box",
  };

  const loadPositions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/gold/admin/all-positions");
      setPositions(res.data?.data?.positions || []);
      setRates(res.data?.data?.rates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/gold/admin/search-users?search=${val}`);
        setSearchResults(res.data?.data?.users || []);
      } catch {
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const selectUser = async (user) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearch("");
    try {
      const res = await api.get(`/gold/admin/user-position/${user._id}`);
      setUserPosition(res.data?.data);
    } catch (err) {
      showToast("Failed to load user position", "error");
    }
  };

  const handleTrade = async () => {
    if (!selectedUser) return showToast("Select a user first", "error");
    setExecuting(true);
    try {
      if (tradeMode === "buy") {
        const amount = parseFloat(usdtAmount);
        if (!amount || amount <= 0)
          return showToast("Enter valid USDT amount", "error");
        await api.post("/gold/admin/buy-for-user", {
          userId: selectedUser._id,
          usdtAmount: amount,
          note: tradeNote,
        });
        showToast(`Bought gold for ${selectedUser.firstName}`, "success");
        setUsdtAmount("");
      } else {
        const grams = parseFloat(gramsAmount);
        if (!grams || grams <= 0)
          return showToast("Enter valid grams", "error");
        await api.post("/gold/admin/sell-for-user", {
          userId: selectedUser._id,
          grams,
          note: tradeNote,
        });
        showToast(`Sold gold for ${selectedUser.firstName}`, "success");
        setGramsAmount("");
      }
      setTradeNote("");
      // Refresh user position
      const res = await api.get(
        `/gold/admin/user-position/${selectedUser._id}`,
      );
      setUserPosition(res.data?.data);
      loadPositions();
    } catch (err) {
      showToast(err.response?.data?.message || "Trade failed", "error");
    } finally {
      setExecuting(false);
    }
  };

  const fmt = (n, d = 2) =>
    n != null
      ? Number(n).toLocaleString("en-US", {
          minimumFractionDigits: d,
          maximumFractionDigits: d,
        })
      : "—";

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              color: textClr,
              fontSize: "1.2rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            🥇 Gold Management
          </h2>
          <p style={{ color: muted, fontSize: "0.75rem", marginTop: 2 }}>
            Manage user gold positions and trade on their behalf
            {rates && (
              <span style={{ marginLeft: 8, color: "#f59e0b" }}>
                XAU/USD ${fmt(rates.pricePerOz)}/oz · $
                {fmt(rates.pricePerGram, 4)}/g
              </span>
            )}
          </p>
        </div>
        <button
          onClick={loadPositions}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            border: `1px solid ${border}`,
            background: "transparent",
            color: muted,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.8rem",
          }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Left — all positions */}
        <div>
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
                padding: "12px 16px",
                borderBottom: `1px solid ${divLine}`,
                color: muted,
                fontSize: "0.7rem",
                fontWeight: 700,
              }}
            >
              ALL GOLD POSITIONS ({positions.length})
            </div>
            <div className="thin-scroll" style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 600 }}>
                {/* Table header */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 100px 100px 100px 100px 80px",
                    gap: 12,
                    padding: "10px 16px",
                    color: muted,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    borderBottom: `1px solid ${divLine}`,
                  }}
                >
                  <div>User</div>
                  <div>Grams</div>
                  <div>Invested</div>
                  <div>Value</div>
                  <div>P&L</div>
                  <div>Action</div>
                </div>

                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "14px 16px",
                        borderBottom: `1px solid ${divLine}`,
                      }}
                    >
                      <Skel h={12} dark={darkMode} />
                    </div>
                  ))
                ) : positions.length === 0 ? (
                  <div
                    style={{ padding: 40, textAlign: "center", color: muted }}
                  >
                    No gold positions yet
                  </div>
                ) : (
                  positions.map((pos) => {
                    const pnl = pos.unrealisedPnl || 0;
                    return (
                      <div
                        key={pos._id}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "1fr 100px 100px 100px 100px 80px",
                          gap: 12,
                          padding: "12px 16px",
                          borderBottom: `1px solid ${divLine}`,
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              color: textClr,
                              fontWeight: 600,
                              fontSize: "0.82rem",
                            }}
                          >
                            {pos.user?.firstName} {pos.user?.lastName}
                          </div>
                          <div style={{ color: muted, fontSize: "0.68rem" }}>
                            {pos.user?.email}
                          </div>
                        </div>
                        <div style={{ color: "#f59e0b", fontWeight: 700 }}>
                          {fmt(pos.gramsOwned, 4)}g
                        </div>
                        <div style={{ color: textClr }}>
                          ${fmt(pos.totalInvested)}
                        </div>
                        <div style={{ color: textClr }}>
                          ${fmt(pos.currentValue)}
                        </div>
                        <div
                          style={{
                            color: pnl >= 0 ? "#34d399" : "#f87171",
                            fontWeight: 600,
                          }}
                        >
                          {pnl >= 0 ? "+" : ""}${fmt(pnl)}
                        </div>
                        <button
                          onClick={() => selectUser(pos.user)}
                          style={{
                            padding: "5px 10px",
                            borderRadius: 8,
                            border: `1px solid ${border}`,
                            background: "transparent",
                            color: "#f59e0b",
                            cursor: "pointer",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                          }}
                        >
                          Trade
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right — trade for user */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 18,
            padding: 18,
            position: "sticky",
            top: 80,
          }}
        >
          <h3
            style={{
              color: textClr,
              fontWeight: 700,
              marginBottom: 16,
              fontSize: "0.95rem",
            }}
          >
            Trade Gold for User
          </h3>

          {/* User search */}
          <div style={{ marginBottom: 14, position: "relative" }}>
            <label
              style={{
                color: muted,
                fontSize: "0.7rem",
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              Search User
            </label>
            <div style={{ position: "relative" }}>
              <Search
                size={13}
                color={muted}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Name or email..."
                style={{ ...iStyle, paddingLeft: 30 }}
              />
              {searching && (
                <Loader
                  size={12}
                  color={muted}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    animation: "spin 1s linear infinite",
                  }}
                />
              )}
            </div>
            {searchResults.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  background: darkMode ? "#1e293b" : "#fff",
                  border: `1px solid ${border}`,
                  borderRadius: 10,
                  maxHeight: 200,
                  overflowY: "auto",
                  marginTop: 4,
                }}
              >
                {searchResults.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => selectUser(u)}
                    style={{
                      padding: "9px 12px",
                      cursor: "pointer",
                      borderBottom: `1px solid ${border}`,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = darkMode
                        ? "#f59e0b20"
                        : "#f59e0b10")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{
                        color: textClr,
                        fontWeight: 600,
                        fontSize: "0.82rem",
                      }}
                    >
                      {u.firstName} {u.lastName}
                    </div>
                    <div style={{ color: muted, fontSize: "0.68rem" }}>
                      {u.email}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected user info */}
          {selectedUser && (
            <div
              style={{
                marginBottom: 14,
                padding: 12,
                background: "rgba(245,158,11,0.06)",
                borderRadius: 12,
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    color: textClr,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  {selectedUser.firstName} {selectedUser.lastName}
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setUserPosition(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: muted,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
              {userPosition ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ color: muted, fontSize: "0.62rem" }}>
                      Gold Owned
                    </div>
                    <div style={{ color: "#f59e0b", fontWeight: 700 }}>
                      {fmt(userPosition.position?.gramsOwned || 0, 6)}g
                    </div>
                  </div>
                  <div>
                    <div style={{ color: muted, fontSize: "0.62rem" }}>
                      USDT Balance
                    </div>
                    <div style={{ color: textClr, fontWeight: 600 }}>
                      ${fmt(userPosition.user?.wallet?.balances?.USDT || 0)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: muted, fontSize: "0.62rem" }}>
                      Current Value
                    </div>
                    <div style={{ color: textClr, fontWeight: 600 }}>
                      ${fmt(userPosition.currentValue || 0)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: muted, fontSize: "0.62rem" }}>
                      Unrealised P&L
                    </div>
                    <div
                      style={{
                        color:
                          (userPosition.unrealisedPnl || 0) >= 0
                            ? "#34d399"
                            : "#f87171",
                        fontWeight: 600,
                      }}
                    >
                      {(userPosition.unrealisedPnl || 0) >= 0 ? "+" : ""}$
                      {fmt(userPosition.unrealisedPnl || 0)}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: muted, fontSize: "0.75rem" }}>
                  Loading position...
                </div>
              )}
            </div>
          )}

          {/* Buy / Sell tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 14,
              background: darkMode
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.04)",
              borderRadius: 10,
              padding: 4,
            }}
          >
            {["buy", "sell"].map((t) => (
              <button
                key={t}
                onClick={() => setTradeMode(t)}
                style={{
                  flex: 1,
                  padding: "7px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background:
                    tradeMode === t
                      ? t === "buy"
                        ? "rgba(245,158,11,0.15)"
                        : "rgba(248,113,113,0.15)"
                      : "transparent",
                  color:
                    tradeMode === t
                      ? t === "buy"
                        ? "#f59e0b"
                        : "#f87171"
                      : muted,
                  fontWeight: tradeMode === t ? 700 : 500,
                  fontSize: "0.8rem",
                }}
              >
                {t === "buy" ? "Buy Gold" : "Sell Gold"}
              </button>
            ))}
          </div>

          {tradeMode === "buy" ? (
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  color: muted,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                USDT Amount to spend
              </label>
              <input
                type="number"
                value={usdtAmount}
                onChange={(e) => setUsdtAmount(e.target.value)}
                placeholder="e.g. 500"
                style={iStyle}
              />
              {usdtAmount && rates && (
                <div
                  style={{ color: "#f59e0b", fontSize: "0.7rem", marginTop: 4 }}
                >
                  ≈{" "}
                  {(
                    (parseFloat(usdtAmount) * 0.995) /
                    rates.pricePerGram
                  ).toFixed(6)}
                  g gold
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  color: muted,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Grams to sell
              </label>
              <input
                type="number"
                value={gramsAmount}
                onChange={(e) => setGramsAmount(e.target.value)}
                placeholder="e.g. 2.5"
                style={iStyle}
              />
              {gramsAmount && rates && (
                <div
                  style={{ color: "#34d399", fontSize: "0.7rem", marginTop: 4 }}
                >
                  ≈ $
                  {(
                    parseFloat(gramsAmount) *
                    rates.pricePerGram *
                    0.995
                  ).toFixed(2)}{" "}
                  USDT
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                color: muted,
                fontSize: "0.7rem",
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              Note (optional)
            </label>
            <input
              value={tradeNote}
              onChange={(e) => setTradeNote(e.target.value)}
              placeholder="e.g. Monthly gold allocation"
              style={iStyle}
            />
          </div>

          <button
            onClick={handleTrade}
            disabled={executing || !selectedUser}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 12,
              border: "none",
              background: !selectedUser
                ? "rgba(255,255,255,0.06)"
                : tradeMode === "buy"
                  ? "linear-gradient(135deg,#f59e0b,#d97706)"
                  : "linear-gradient(135deg,#f87171,#ef4444)",
              color: !selectedUser
                ? muted
                : tradeMode === "buy"
                  ? "#020617"
                  : "#fff",
              fontWeight: 700,
              cursor: !selectedUser || executing ? "not-allowed" : "pointer",
              opacity: executing ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {executing ? (
              <>
                <Loader
                  size={14}
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Processing...
              </>
            ) : !selectedUser ? (
              "Select a user first"
            ) : tradeMode === "buy" ? (
              "🥇 Buy Gold for User"
            ) : (
              "Sell Gold for User"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
