import { checkLiquidations } from "../controllers/tradeController.js";

let _cache = null;
let _expiry = 0;
const TTL = 60_000;

const SYMBOL_MAP = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  solana: "SOLUSDT",
  binancecoin: "BNBUSDT",
  ripple: "XRPUSDT",
  cardano: "ADAUSDT",
  polkadot: "DOTUSDT",
  dogecoin: "DOGEUSDT",
  "avalanche-2": "AVAXUSDT",
  chainlink: "LINKUSDT",
  tether: "USDTUSDT",
  "matic-network": "MATICUSDT",
  near: "NEARUSDT",
  sui: "SUIUSDT",
};

const CG_HEADERS = {
  Accept: "application/json",
  "x-cg-demo-api-key": process.env.COINGECKO_API_KEY, 
};

async function fetchFresh() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple,cardano,polkadot,dogecoin,avalanche-2,chainlink,tether,matic-network,near,sui&vs_currencies=usd",
      {
        headers: CG_HEADERS,
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const cg = await res.json();
    if (!cg?.bitcoin?.usd) throw new Error("CoinGecko returned incomplete data");

    Object.entries(cg).forEach(([coinId, data]) => {
      const symbol = SYMBOL_MAP[coinId];
      if (symbol && data?.usd) {
        checkLiquidations(symbol, data.usd).catch(() => {});
      }
    });

    return {
      USD: 1,
      USDT: cg.tether?.usd || 1,
      BTC: cg.bitcoin?.usd || 0,
      ETH: cg.ethereum?.usd || 0,
      SOL: cg.solana?.usd || 0,
      BNB: cg.binancecoin?.usd || 0,
      XRP: cg.ripple?.usd || 0,
      ADA: cg.cardano?.usd || 0,
      DOT: cg.polkadot?.usd || 0,
      DOGE: cg.dogecoin?.usd || 0,
      AVAX: cg["avalanche-2"]?.usd || 0,
      LINK: cg.chainlink?.usd || 0,
      MATIC: cg["matic-network"]?.usd || 0,
      NEAR: cg.near?.usd || 0,
      SUI: cg.sui?.usd || 0,
    };
  } catch (cgErr) {
    console.warn("[rateCache] CoinGecko failed:", cgErr.message);
    throw cgErr;
  }
}

export async function refreshRateCache() {
  try {
    const rates = await fetchFresh();
    _cache = rates;
    _expiry = Date.now() + TTL;
    console.log("[rateCache] Refreshed successfully");
    return rates;
  } catch (err) {
    console.error("[rateCache] Refresh failed — keeping stale cache:", err.message);
    return _cache || null;
  }
}

export async function getLiveRates() {
  if (_cache && Date.now() < _expiry) return _cache;
  const fresh = await refreshRateCache();
  return fresh || _cache || null;
}

export function getCachedPrices() {
  return _cache;
}