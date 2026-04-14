import express from "express";
import NodeCache from "node-cache";
import * as marketController from "../controllers/marketController.js";
import { refreshRateCache, getLiveRates } from "../utils/rateCache.js";
import { MARKET_DATA } from "../controllers/marketController.js";

const router = express.Router();

const priceCache  = new NodeCache({ stdTTL: 60,  checkperiod: 15 });
const chartCache  = new NodeCache({ stdTTL: 900, checkperiod: 60 });
const moversCache = new NodeCache({ stdTTL: 60,  checkperiod: 15 });
const globalCache = new NodeCache({ stdTTL: 120, checkperiod: 30 });

let lastGoodPrices = null;
let lastGoodMovers = null;

const COIN_MAP = {
  bitcoin:       { symbol: "BTC",  binance: "BTCUSDT",  name: "Bitcoin",   image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
  ethereum:      { symbol: "ETH",  binance: "ETHUSDT",  name: "Ethereum",  image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  solana:        { symbol: "SOL",  binance: "SOLUSDT",  name: "Solana",    image: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
  binancecoin:   { symbol: "BNB",  binance: "BNBUSDT",  name: "BNB",       image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
  ripple:        { symbol: "XRP",  binance: "XRPUSDT",  name: "XRP",       image: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png" },
  cardano:       { symbol: "ADA",  binance: "ADAUSDT",  name: "Cardano",   image: "https://assets.coingecko.com/coins/images/975/small/cardano.png" },
  polkadot:      { symbol: "DOT",  binance: "DOTUSDT",  name: "Polkadot",  image: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png" },
  dogecoin:      { symbol: "DOGE", binance: "DOGEUSDT", name: "Dogecoin",  image: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png" },
  "avalanche-2": { symbol: "AVAX", binance: "AVAXUSDT", name: "Avalanche", image: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png" },
  chainlink:     { symbol: "LINK", binance: "LINKUSDT", name: "Chainlink", image: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png" },
  tether:        { symbol: "USDT", binance: null,        name: "Tether",    image: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
};

const MOVER_MAP = {
  solana:          { symbol: "SOL",   binance: "SOLUSDT",   name: "Solana",    cgId: "solana",        image: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
  "avalanche-2":   { symbol: "AVAX",  binance: "AVAXUSDT",  name: "Avalanche", cgId: "avalanche-2",   image: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png" },
  bitcoin:         { symbol: "BTC",   binance: "BTCUSDT",   name: "Bitcoin",   cgId: "bitcoin",       image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
  ripple:          { symbol: "XRP",   binance: "XRPUSDT",   name: "XRP",       cgId: "ripple",        image: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png" },
  polkadot:        { symbol: "DOT",   binance: "DOTUSDT",   name: "Polkadot",  cgId: "polkadot",      image: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png" },
  ethereum:        { symbol: "ETH",   binance: "ETHUSDT",   name: "Ethereum",  cgId: "ethereum",      image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  cardano:         { symbol: "ADA",   binance: "ADAUSDT",   name: "Cardano",   cgId: "cardano",       image: "https://assets.coingecko.com/coins/images/975/small/cardano.png" },
  chainlink:       { symbol: "LINK",  binance: "LINKUSDT",  name: "Chainlink", cgId: "chainlink",     image: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png" },
  dogecoin:        { symbol: "DOGE",  binance: "DOGEUSDT",  name: "Dogecoin",  cgId: "dogecoin",      image: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png" },
  "matic-network": { symbol: "MATIC", binance: "MATICUSDT", name: "Polygon",   cgId: "matic-network", image: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png" },
  near:            { symbol: "NEAR",  binance: "NEARUSDT",  name: "NEAR",      cgId: "near",          image: "https://assets.coingecko.com/coins/images/10365/small/near.jpg" },
  sui:             { symbol: "SUI",   binance: "SUIUSDT",   name: "Sui",       cgId: "sui",           image: "https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg" },
};

//  CoinGecko fetch with retry 
async function cgFetch(path, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3${path}`, {
        headers: {
          Accept: "application/json",
          "x-cg-demo-api-key": process.env.COINGECKO_API_KEY, 
        },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return res.json();
      if (res.status === 429) throw new Error(`CoinGecko 429 rate limited`);
      throw new Error(`CoinGecko ${res.status}`);
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

//  Background refresh functions 

async function refreshPrices() {
  try {
    // Use shared rate cache as base prices
    const rates = await getLiveRates();
    if (!rates?.BTC) throw new Error("No rates in cache");

    const data = {};
    for (const [cgId, meta] of Object.entries(COIN_MAP)) {
      const price = rates[meta.symbol];
      if (price) {
        data[cgId] = {
          usd:            price,
          usd_24h_change: 0, // updated below if CoinGecko available
        };
      }
    }
    data.tether = { usd: 1.0, usd_24h_change: 0 };

    // Try to enrich with 24h change from CoinGecko
    try {
      const ids    = Object.keys(COIN_MAP).join(",");
      const cgData = await cgFetch(
        `/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );
      // Merge 24h change into existing price data
      for (const [cgId] of Object.entries(COIN_MAP)) {
        if (cgData[cgId]?.usd_24h_change !== undefined) {
          if (data[cgId]) data[cgId].usd_24h_change = cgData[cgId].usd_24h_change;
        }
      }
    } catch {
      // 24h change unavailable — prices still served from rateCache
    }

    priceCache.set("prices", data);
    lastGoodPrices = data;
    console.log("[prices] Cache refreshed");

  } catch (err) {
    console.error("[prices] Background refresh failed:", err.message);
  }
}

async function refreshMovers() {
  try {
    //  Always fetch ALL coins from CoinGecko markets for full data + 24h change
    const ids  = Object.keys(MOVER_MAP).join(",");
    const data = await cgFetch(
      `/coins/markets?vs_currency=usd&ids=${ids}` +
      `&order=market_cap_desc&per_page=${Object.keys(MOVER_MAP).length}&page=1` +
      `&sparkline=false&price_change_percentage=24h`
    );

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("CoinGecko returned empty movers data");
    }

    const movers = data
      .map((c) => ({
        id:        c.id,
        symbol:    c.symbol?.toUpperCase(),
        name:      c.name,
        image:     c.image,
        price:     c.current_price,
        change24h: c.price_change_percentage_24h ?? 0,
        volume:    c.total_volume,
      }))
      .filter((c) => c.price > 0)
      .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));

    moversCache.set("movers", movers);
    lastGoodMovers = movers;
    console.log(`[movers] Cache refreshed — ${movers.length} coins`);

  } catch (err) {
    console.error("[movers] Background refresh failed:", err.message);

    //  Fallback — build from rateCache with all MOVER_MAP coins, change24h = 0
    try {
      const rates = await getLiveRates();
      if (!rates) return; // nothing to do

      const movers = Object.entries(MOVER_MAP)
        .map(([cgId, meta]) => {
          const price = rates[meta.symbol];
          if (!price) return null;
          return {
            id:        cgId,
            symbol:    meta.symbol,
            name:      meta.name,
            image:     meta.image,
            price,
            change24h: 0,
            volume:    0,
          };
        })
        .filter(Boolean);

      if (movers.length > 0) {
        moversCache.set("movers", movers);
        lastGoodMovers = movers;
        console.log(`[movers] Cache refreshed from rateCache fallback — ${movers.length} coins`);
      }
    } catch (fallbackErr) {
      console.error("[movers] Fallback also failed:", fallbackErr.message);
    }
  }
}

//  Background polling — called once from server.js on boot 

export function startMarketPolling() {
  console.log("[market] Starting background polling...");

  // Warm all caches immediately on boot
  refreshRateCache();
  refreshPrices();
  refreshMovers();

  // Refresh every 60s — reduces CoinGecko 429s
  setInterval(refreshRateCache, 60_000);
  setInterval(refreshPrices,    60_000);
  setInterval(refreshMovers,    120_000); 
}

// Routes..serve from cache only, always instant 

router.get("/prices", (req, res) => {
  const data = priceCache.get("prices") || lastGoodPrices;
  
  if (!data) {
    //  Fall back to static MARKET_DATA on cold boot
    const fallback = {};
    Object.entries(MARKET_DATA).forEach(([symbol, d]) => {
      const cgId = Object.keys(COIN_MAP).find(
        (id) => COIN_MAP[id].symbol === symbol.replace("/USDT", "").replace("/USD", "")
      );
      if (cgId) fallback[cgId] = { usd: d.price, usd_24h_change: d.change24h };
    });
    return res.json({ data: fallback, cached: false, stale: true });
  }

  res.json({ data, cached: true });
});

router.get("/movers", (req, res) => {
  const data = moversCache.get("movers") || lastGoodMovers;

  if (!data) {
    //  Fall back to static MARKET_DATA on cold boot
    const fallback = Object.entries(MOVER_MAP).map(([cgId, meta]) => {
      const staticData = MARKET_DATA[`${meta.symbol}/USDT`] || 
                         MARKET_DATA[`${meta.symbol}/USD`];
      return {
        id: cgId,
        symbol: meta.symbol,
        name: meta.name,
        image: meta.image,
        price: staticData?.price || 0,
        change24h: staticData?.change24h || 0,
        volume: staticData?.volume || 0,
      };
    }).filter((m) => m.price > 0);

    return res.json({ data: fallback, cached: false, stale: true });
  }

  res.json({ data, cached: true });
});

//  Chart — on demand, cached 15min 

router.get("/chart", async (req, res) => {
  try {
    const holdingsParam = req.query.holdings;
    const holdings = {};

    if (holdingsParam) {
      holdingsParam.split(",").forEach((pair) => {
        const [id, amount] = pair.split(":");
        if (id && amount) holdings[id] = parseFloat(amount);
      });
    } else {
      holdings.bitcoin  = 0.2845;
      holdings.ethereum = 2.134;
      holdings.solana   = 14.5;
      holdings.tether   = 4250;
    }

    const cacheKey = `chart_${JSON.stringify(holdings)}`;
    const cached   = chartCache.get(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });

    const ids     = Object.keys(COIN_MAP);
    const results = [];
    for (const id of ids) {
      const data = await cgFetch(
        `/coins/${id}/market_chart?vs_currency=usd&days=30&interval=daily`
      );
      results.push(data);
      if (id !== ids[ids.length - 1]) await new Promise((r) => setTimeout(r, 300));
    }

    const minLen = Math.min(...results.map((r) => r?.prices?.length || 0));
    if (!minLen) throw new Error("Empty chart data");

    const combined = Array.from({ length: minLen }, (_, i) =>
      ids.reduce((sum, id, ci) => {
        const dayPrice = results[ci]?.prices?.[i]?.[1] || 0;
        return sum + dayPrice * (holdings[id] || 0);
      }, 0)
    );

    const labels = Array.from({ length: minLen }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (minLen - 1 - i));
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });

    const payload = { combined, labels };
    chartCache.set(cacheKey, payload);
    res.json({ ...payload, cached: false });

  } catch (err) {
    console.error("[market/chart]", err.message);
    const stale = chartCache.get(`chart_${JSON.stringify({})}`);
    if (stale) return res.json({ ...stale, cached: true, stale: true });
    res.status(502).json({ error: "Failed to fetch chart data", message: err.message });
  }
});

//  Existing routes — must stay last 

router.get("/",        marketController.getMarkets);
router.get("/ticker",  marketController.getTicker);
router.get("/:symbol", marketController.getMarket);

export default router;