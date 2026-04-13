import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Code,
  Key,
  Zap,
  Shield,
  BookOpen,
  Terminal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  FeaturePage,
  FeatureHero,
  FeatureCard,
  CTABanner,
} from "../features/FeatureLayout";

function EndpointCard({ ep, isOpen, onToggle }) {
  const { darkMode } = useTheme();
  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const border = isOpen ? "rgba(245,158,11,0.3)" : "rgba(245,158,11,0.15)";

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${border}`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 6,
              background: `${ep.color}20`,
              color: ep.color,
              fontFamily: "monospace",
              minWidth: 60,
              textAlign: "center",
            }}
          >
            {ep.method}
          </span>
          <code
            style={{
              color: textClr,
              fontFamily: "monospace",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {ep.path}
          </code>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{ color: mutedClr, fontSize: "0.75rem", display: "none" }}
            className="sm:block"
          >
            {ep.desc}
          </span>
          {isOpen ? (
            <ChevronUp
              style={{ width: 15, height: 15, color: "#f59e0b", flexShrink: 0 }}
            />
          ) : (
            <ChevronDown
              style={{ width: 15, height: 15, color: mutedClr, flexShrink: 0 }}
            />
          )}
        </div>
      </button>
      {isOpen && (
        <div
          style={{
            borderTop: `1px solid ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
          }}
        >
          <div
            style={{
              padding: "14px 20px",
              color: mutedClr,
              fontSize: "0.82rem",
            }}
          >
            {ep.desc}
          </div>
          <pre
            style={{
              margin: 0,
              padding: "16px 20px",
              background: "#0f172a",
              color: "#94a3b8",
              fontFamily: "monospace",
              fontSize: "0.78rem",
              lineHeight: 1.7,
              overflowX: "auto",
            }}
          >
            {ep.response}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function APIDoc() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const [openIdx, setOpenIdx] = useState(null);
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
  const border = "rgba(245,158,11,0.18)";

  const FEATURES = [
    {
      icon: Zap,
      title: t("api_rest_websocket"),
      desc: t("api_rest_websocket_desc"),
    },
    {
      icon: Key,
      title: t("api_key_auth"),
      desc: t("api_key_auth_desc"),
    },
    {
      icon: Shield,
      title: t("api_rate_limits"),
      desc: t("api_rate_limits_desc"),
    },
    {
      icon: BookOpen,
      title: t("api_sdks"),
      desc: t("api_sdks_desc"),
    },
    {
      icon: Terminal,
      title: t("api_sandbox_mode"),
      desc: t("api_sandbox_mode_desc"),
    },
    {
      icon: Code,
      title: t("api_webhooks"),
      desc: t("api_webhooks_desc"),
    },
  ];

  const ENDPOINTS = [
    {
      method: "GET",
      color: "#34d399",
      path: "/v1/markets",
      desc: t("api_endpoint_markets_desc"),
      response: `{
  "pairs": [
    { "symbol": "BTC/USDT", "price": 87991.50, "change24h": 2.40, "volume": 38421000000 },
    { "symbol": "ETH/USDT", "price": 3518.20,  "change24h": -1.02, "volume": 18200000000 }
  ]
}`,
    },
    {
      method: "POST",
      color: "#60a5fa",
      path: "/v1/orders",
      desc: t("api_endpoint_orders_desc"),
      response: `// Request body
{
  "symbol":    "BTC/USDT",
  "side":      "buy",
  "type":      "limit",
  "quantity":  0.05,
  "price":     87500,
  "stopLoss":  85000,
  "takeProfit":92000
}

// Response
{ "id": "ord_8f3k2", "status": "filled", "filledPrice": 87510, "fee": 4.38 }`,
    },
    {
      method: "GET",
      color: "#34d399",
      path: "/v1/account/balance",
      desc: t("api_endpoint_balance_desc"),
      response: `{
  "balances": [
    { "asset": "USDT", "free": 4500.00, "locked": 500.00 },
    { "asset": "BTC",  "free": 0.25,    "locked": 0.0    },
    { "asset": "ETH",  "free": 2.50,    "locked": 0.0    }
  ]
}`,
    },
    {
      method: "DELETE",
      color: "#f87171",
      path: "/v1/orders/:id",
      desc: t("api_endpoint_cancel_desc"),
      response: `{ "id": "ord_8f3k2", "status": "cancelled", "cancelledAt": "2025-03-15T14:22:10Z" }`,
    },
    {
      method: "GET",
      color: "#34d399",
      path: "/v1/account/trades",
      desc: t("api_endpoint_trades_desc"),
      response: `{
  "trades": [
    { "id": "trd_91x2", "symbol": "BTC/USDT", "side": "buy", "price": 87510, "quantity": 0.05, "fee": 4.38, "timestamp": "2025-03-15T14:22:10Z" }
  ],
  "total": 142,
  "page": 1
}`,
    },
  ];

  return (
    <FeaturePage>
      <FeatureHero
        badge={t("api_docs")}
        title={t("api_build_with")}
        highlight={t("api_axiontrade")}
        subtitle={t("api_subtitle")}
        icon={Code}
      />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 0" }}>
        {/* Quick start */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.4rem",
            color: textClr,
            marginBottom: 16,
          }}
        >
          {t("api_quick_start")}
        </h2>
        <div
          style={{
            background: "#0f172a",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 20,
            padding: "28px",
            marginBottom: 48,
            overflow: "auto",
          }}
        >
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {["#ef4444", "#f59e0b", "#34d399"].map((c) => (
              <div
                key={c}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: c,
                }}
              />
            ))}
          </div>
          <pre
            style={{
              color: "#94a3b8",
              fontFamily: "monospace",
              fontSize: "0.82rem",
              lineHeight: 1.9,
              margin: 0,
            }}
          >
            {`# Install the AxionTrade SDK
npm install @axiontrade/sdk

# ── Node.js Example ─────────────────────────────────────────
const { AxionTrade } = require('@axiontrade/sdk')

const client = new AxionTrade({
  apiKey:    'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  sandbox:   false,   // set true for testing
})

// Get current BTC/USDT price
const market = await client.markets.get('BTC/USDT')
console.log(market.price)   // 87991.50

// Place a market buy order
const order = await client.orders.create({
  symbol:   'BTC/USDT',
  side:     'buy',
  type:     'market',
  quantity: 0.01,
})
console.log(order.id, order.status)   // ord_xxx filled

// Subscribe to real-time price updates (WebSocket)
client.ws.subscribe('ticker:BTC/USDT', (data) => {
  console.log('Price:', data.price, 'Change:', data.change24h)
})`}
          </pre>
        </div>

        {/* Authentication */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: "24px",
            marginBottom: 48,
          }}
        >
          <h3
            style={{
              color: textClr,
              fontWeight: 700,
              fontSize: "1.05rem",
              marginBottom: 12,
              fontFamily: '"Playfair Display",serif',
            }}
          >
            {t("api_authentication")}
          </h3>
          <p
            style={{
              color: mutedClr,
              fontSize: "0.875rem",
              lineHeight: 1.7,
              marginBottom: 14,
            }}
          >
            {t("api_authentication_desc")}{" "}
            <strong style={{ color: textClr }}>{t("api_settings_keys")}</strong>
            .
          </p>
          <pre
            style={{
              background: "#0f172a",
              borderRadius: 12,
              padding: "16px",
              color: "#94a3b8",
              fontFamily: "monospace",
              fontSize: "0.8rem",
              margin: 0,
              overflowX: "auto",
            }}
          >
            {`// Include in every request header
headers: {
  'X-API-Key':    'YOUR_API_KEY',
  'X-Timestamp':  Date.now().toString(),
  'X-Signature':  hmac_sha256(timestamp + method + path + body, API_SECRET)
}`}
          </pre>
        </div>

        {/* Endpoints */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.4rem",
            color: textClr,
            marginBottom: 6,
          }}
        >
          {t("api_endpoints")}
        </h2>
        <p style={{ color: mutedClr, fontSize: "0.875rem", marginBottom: 20 }}>
          {t("api_base_url")}{" "}
          <code style={{ color: "#f59e0b", fontFamily: "monospace" }}>
            https://api.axiontrade.com
          </code>
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 48,
          }}
        >
          {ENDPOINTS.map((ep, i) => (
            <EndpointCard
              key={i}
              ep={ep}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </div>

        {/* Features */}
        <h2
          style={{
            fontFamily: '"Playfair Display",serif',
            fontWeight: 700,
            fontSize: "1.4rem",
            color: textClr,
            marginBottom: 20,
          }}
        >
          {t("api_capabilities")}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 60,
          }}
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
      <CTABanner title={t("api_cta_title")} subtitle={t("api_cta_subtitle")} />
    </FeaturePage>
  );
}
