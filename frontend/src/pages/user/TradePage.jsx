import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  RefreshCw,
  TrendingUp,
  Search,
  X,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import DashboardNav from "./DashboardNav";
import BottomNav from "./BottomNav";
import api from "../../services/apiService";
import { useTranslation } from "react-i18next";

const Spinner = ({ size = 12, color = "#f87171" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ animation: "spin 0.8s linear infinite" }}
  >
    <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="3"
      fill="none"
      strokeDasharray="30 10"
      strokeLinecap="round"
    />
  </svg>
);

const CATEGORIES = [
  { key: "crypto", labelKey: "crypto", icon: "⬡" },
  { key: "infrastructure", labelKey: "infrastructure", icon: "⚙" },
  { key: "defi", labelKey: "defi", icon: "◈" },
  { key: "meme", labelKey: "meme", icon: "🐸" },
  { key: "gaming", labelKey: "gaming", icon: "◉" },
  { key: "storage", labelKey: "storage", icon: "▦" },
  { key: "stock", labelKey: "stocks", icon: "▲" },
  { key: "forex", labelKey: "forex", icon: "↔" },
];

const COIN_IMAGES = {
  // Crypto — CoinGecko CDN
  BTCUSDT: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETHUSDT: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOLUSDT: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  BNBUSDT:
    "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  XRPUSDT:
    "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  ADAUSDT: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  AVAXUSDT:
    "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  DOTUSDT: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  NEARUSDT: "https://assets.coingecko.com/coins/images/10365/small/near.jpg",
  ATOMUSDT:
    "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png",
  SUIUSDT:
    "https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg",
  APTUSDT:
    "https://assets.coingecko.com/coins/images/26455/small/aptos_round.png",
  TRXUSDT: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png",
  XLMUSDT:
    "https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png",
  ALGOUSDT: "https://assets.coingecko.com/coins/images/4380/small/download.png",
  MATICUSDT:
    "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
  LINKUSDT:
    "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  OPUSDT: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
  ARBUSDT:
    "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
  LDOUSDT: "https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png",
  INJUSDT:
    "https://assets.coingecko.com/coins/images/12882/small/Secondary_Symbol.png",
  GRTUSDT:
    "https://assets.coingecko.com/coins/images/13397/small/Graph_Token.png",
  RUNEUSDT:
    "https://assets.coingecko.com/coins/images/6595/small/Rune200x200.png",
  STXUSDT:
    "https://assets.coingecko.com/coins/images/2069/small/Stacks_logo_full.png",
  UNIUSDT:
    "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png",
  AAVEUSDT: "https://assets.coingecko.com/coins/images/12645/small/AAVE.png",
  MKRUSDT:
    "https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png",
  CRVUSDT: "https://assets.coingecko.com/coins/images/12124/small/Curve.png",
  COMPUSDT: "https://assets.coingecko.com/coins/images/10775/small/COMP.png",
  SNXUSDT: "https://assets.coingecko.com/coins/images/3406/small/SNX.png",
  SUSHIUSDT:
    "https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_chop.png",
  "1INCHUSDT":
    "https://assets.coingecko.com/coins/images/13469/small/1inch-token.png",
  YFIUSDT:
    "https://assets.coingecko.com/coins/images/11849/small/yfi-192x192.png",
  DOGEUSDT: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  SHIBUSDT: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
  PEPEUSDT:
    "https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg",
  FLOKIUSDT:
    "https://assets.coingecko.com/coins/images/16746/small/PNG_image.png",
  WIFUSDT:
    "https://assets.coingecko.com/coins/images/33566/small/dogwifhat.jpeg",
  BONKUSDT: "https://assets.coingecko.com/coins/images/28600/small/bonk.jpg",
  AXSUSDT:
    "https://assets.coingecko.com/coins/images/13029/small/axie_infinity_logo.png",
  SANDUSDT:
    "https://assets.coingecko.com/coins/images/12129/small/sandbox_logo.jpg",
  MANAUSDT:
    "https://assets.coingecko.com/coins/images/878/small/decentraland-mana.png",
  GALAUSDT:
    "https://assets.coingecko.com/coins/images/15188/small/gala-200.png",
  IMXUSDT:
    "https://assets.coingecko.com/coins/images/17233/small/immutableX-symbol-BLK-RGB.png",
  ENJUSDT:
    "https://assets.coingecko.com/coins/images/1102/small/enjin-coin-logo.png",
  RONUSDT: "https://assets.coingecko.com/coins/images/20009/small/ronin.jpg",
  BEAMUSDT:
    "https://assets.coingecko.com/coins/images/32417/small/chain-logo.png",
  FILUSDT: "https://assets.coingecko.com/coins/images/12817/small/filecoin.png",
  ARUSDT:
    "https://assets.coingecko.com/coins/images/4343/small/oRt6SiEN_400x400.jpg",
  STORJUSDT: "https://assets.coingecko.com/coins/images/949/small/storj.png",
  ROSEUSDT: "https://assets.coingecko.com/coins/images/13767/small/rose.png",
  // Stocks — Clearbit logos
  AAPL: "https://icons.duckduckgo.com/ip3/apple.com.ico",
  TSLA: "https://icons.duckduckgo.com/ip3/tesla.com.ico",
  NVDA: "https://icons.duckduckgo.com/ip3/nvidia.com.ico",
  MSFT: "https://icons.duckduckgo.com/ip3/microsoft.com.ico",
  AMZN: "https://icons.duckduckgo.com/ip3/amazon.com.ico",
  GOOGL: "https://icons.duckduckgo.com/ip3/google.com.ico",
  META: "https://icons.duckduckgo.com/ip3/meta.com.ico",
  AMD: "https://icons.duckduckgo.com/ip3/amd.com.ico",
  NFLX: "https://icons.duckduckgo.com/ip3/netflix.com.ico",
  COIN: "https://icons.duckduckgo.com/ip3/coinbase.com.ico",
  JPM: "https://icons.duckduckgo.com/ip3/jpmorganchase.com.ico",
  V: "https://icons.duckduckgo.com/ip3/visa.com.ico",
  DIS: "https://icons.duckduckgo.com/ip3/disney.com.ico",
  SHOP: "https://icons.duckduckgo.com/ip3/shopify.com.ico",
  // Commodities & Forex — flag/icon CDN
  XAUUSD:
    "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/128/color/xau.png",
  XAGUSD:
    "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons/128/color/xag.png",
  OILUSD: "https://img.icons8.com/color/128/oil-barrel.png",
  BRENTUSD: "https://img.icons8.com/color/128/oil-barrel.png",
  NGUSD: "https://img.icons8.com/color/128/gas-industry.png",
  COPPERUSD: "https://img.icons8.com/color/128/copper.png",
  WHEATUSD: "https://img.icons8.com/color/128/wheat.png",
  EURUSD: "https://flagcdn.com/w80/eu.png",
  GBPUSD: "https://flagcdn.com/w80/gb.png",
  USDJPY: "https://flagcdn.com/w80/jp.png",
  AUDUSD: "https://flagcdn.com/w80/au.png",
  USDCAD: "https://flagcdn.com/w80/ca.png",
};

const PAIRS = [
  {
    label: "BTC/USDT",
    symbol: "BTCUSDT",
    binance: "BTCUSDT",
    base: "BTC",
    assetClass: "crypto",
    category: "crypto",
  },
  {
    label: "ETH/USDT",
    symbol: "ETHUSDT",
    binance: "ETHUSDT",
    base: "ETH",
    assetClass: "crypto",
    category: "crypto",
  },
  {
    label: "SOL/USDT",
    symbol: "SOLUSDT",
    binance: "SOLUSDT",
    base: "SOL",
    assetClass: "crypto",
    category: "crypto",
  },
  {
    label: "BNB/USDT",
    symbol: "BNBUSDT",
    binance: "BNBUSDT",
    base: "BNB",
    assetClass: "crypto",
    category: "crypto",
  },
  {
    label: "XRP/USDT",
    symbol: "XRPUSDT",
    binance: "XRPUSDT",
    base: "XRP",
    assetClass: "crypto",
    category: "crypto",
  },
  {
    label: "ADA/USDT",
    symbol: "ADAUSDT",
    binance: "ADAUSDT",
    base: "ADA",
    assetClass: "crypto",
    category: "crypto",
  },
  {
    label: "AVAX/USDT",
    symbol: "AVAXUSDT",
    binance: "AVAXUSDT",
    base: "AVAX",
    assetClass: "crypto",
    category: "crypto",
  },
  {
    label: "DOT/USDT",
    symbol: "DOTUSDT",
    binance: "DOTUSDT",
    base: "DOT",
    assetClass: "crypto",
    category: "crypto",
  },
  {
    label: "NEAR/USDT",
    symbol: "NEARUSDT",
    binance: "NEARUSDT",
    base: "NEAR",
    assetClass: "crypto",
    category: "crypto",
  },
  {
    label: "ATOM/USDT",
    symbol: "ATOMUSDT",
    binance: "ATOMUSDT",
    base: "ATOM",
    assetClass: "crypto",
    category: "crypto",
  },
  {
    label: "SUI/USDT",
    symbol: "SUIUSDT",
    binance: "SUIUSDT",
    base: "SUI",
    assetClass: "crypto",
    category: "crypto",
  },
  {
    label: "APT/USDT",
    symbol: "APTUSDT",
    binance: "APTUSDT",
    base: "APT",
    assetClass: "crypto",
    category: "crypto",
  },
  {
    label: "TRX/USDT",
    symbol: "TRXUSDT",
    binance: "TRXUSDT",
    base: "TRX",
    assetClass: "crypto",
    category: "crypto",
  },
  {
    label: "XLM/USDT",
    symbol: "XLMUSDT",
    binance: "XLMUSDT",
    base: "XLM",
    assetClass: "crypto",
    category: "crypto",
  },
  {
    label: "ALGO/USDT",
    symbol: "ALGOUSDT",
    binance: "ALGOUSDT",
    base: "ALGO",
    assetClass: "crypto",
    category: "crypto",
  },
  {
    label: "MATIC/USDT",
    symbol: "MATICUSDT",
    binance: "MATICUSDT",
    base: "MATIC",
    assetClass: "crypto",
    category: "infrastructure",
  },
  {
    label: "LINK/USDT",
    symbol: "LINKUSDT",
    binance: "LINKUSDT",
    base: "LINK",
    assetClass: "crypto",
    category: "infrastructure",
  },
  {
    label: "OP/USDT",
    symbol: "OPUSDT",
    binance: "OPUSDT",
    base: "OP",
    assetClass: "crypto",
    category: "infrastructure",
  },
  {
    label: "ARB/USDT",
    symbol: "ARBUSDT",
    binance: "ARBUSDT",
    base: "ARB",
    assetClass: "crypto",
    category: "infrastructure",
  },
  {
    label: "LDO/USDT",
    symbol: "LDOUSDT",
    binance: "LDOUSDT",
    base: "LDO",
    assetClass: "crypto",
    category: "infrastructure",
  },
  {
    label: "INJ/USDT",
    symbol: "INJUSDT",
    binance: "INJUSDT",
    base: "INJ",
    assetClass: "crypto",
    category: "infrastructure",
  },
  {
    label: "GRT/USDT",
    symbol: "GRTUSDT",
    binance: "GRTUSDT",
    base: "GRT",
    assetClass: "crypto",
    category: "infrastructure",
  },
  {
    label: "RUNE/USDT",
    symbol: "RUNEUSDT",
    binance: "RUNEUSDT",
    base: "RUNE",
    assetClass: "crypto",
    category: "infrastructure",
  },
  {
    label: "STX/USDT",
    symbol: "STXUSDT",
    binance: "STXUSDT",
    base: "STX",
    assetClass: "crypto",
    category: "infrastructure",
  },
  {
    label: "UNI/USDT",
    symbol: "UNIUSDT",
    binance: "UNIUSDT",
    base: "UNI",
    assetClass: "crypto",
    category: "defi",
  },
  {
    label: "AAVE/USDT",
    symbol: "AAVEUSDT",
    binance: "AAVEUSDT",
    base: "AAVE",
    assetClass: "crypto",
    category: "defi",
  },
  {
    label: "MKR/USDT",
    symbol: "MKRUSDT",
    binance: "MKRUSDT",
    base: "MKR",
    assetClass: "crypto",
    category: "defi",
  },
  {
    label: "CRV/USDT",
    symbol: "CRVUSDT",
    binance: "CRVUSDT",
    base: "CRV",
    assetClass: "crypto",
    category: "defi",
  },
  {
    label: "COMP/USDT",
    symbol: "COMPUSDT",
    binance: "COMPUSDT",
    base: "COMP",
    assetClass: "crypto",
    category: "defi",
  },
  {
    label: "SNX/USDT",
    symbol: "SNXUSDT",
    binance: "SNXUSDT",
    base: "SNX",
    assetClass: "crypto",
    category: "defi",
  },
  {
    label: "SUSHI/USDT",
    symbol: "SUSHIUSDT",
    binance: "SUSHIUSDT",
    base: "SUSHI",
    assetClass: "crypto",
    category: "defi",
  },
  {
    label: "1INCH/USDT",
    symbol: "1INCHUSDT",
    binance: "1INCHUSDT",
    base: "1INCH",
    assetClass: "crypto",
    category: "defi",
  },
  {
    label: "YFI/USDT",
    symbol: "YFIUSDT",
    binance: "YFIUSDT",
    base: "YFI",
    assetClass: "crypto",
    category: "defi",
  },
  {
    label: "DOGE/USDT",
    symbol: "DOGEUSDT",
    binance: "DOGEUSDT",
    base: "DOGE",
    assetClass: "crypto",
    category: "meme",
  },
  {
    label: "SHIB/USDT",
    symbol: "SHIBUSDT",
    binance: "SHIBUSDT",
    base: "SHIB",
    assetClass: "crypto",
    category: "meme",
  },
  {
    label: "PEPE/USDT",
    symbol: "PEPEUSDT",
    binance: "PEPEUSDT",
    base: "PEPE",
    assetClass: "crypto",
    category: "meme",
  },
  {
    label: "FLOKI/USDT",
    symbol: "FLOKIUSDT",
    binance: "FLOKIUSDT",
    base: "FLOKI",
    assetClass: "crypto",
    category: "meme",
  },
  {
    label: "WIF/USDT",
    symbol: "WIFUSDT",
    binance: "WIFUSDT",
    base: "WIF",
    assetClass: "crypto",
    category: "meme",
  },
  {
    label: "BONK/USDT",
    symbol: "BONKUSDT",
    binance: "BONKUSDT",
    base: "BONK",
    assetClass: "crypto",
    category: "meme",
  },
  {
    label: "AXS/USDT",
    symbol: "AXSUSDT",
    binance: "AXSUSDT",
    base: "AXS",
    assetClass: "crypto",
    category: "gaming",
  },
  {
    label: "SAND/USDT",
    symbol: "SANDUSDT",
    binance: "SANDUSDT",
    base: "SAND",
    assetClass: "crypto",
    category: "gaming",
  },
  {
    label: "MANA/USDT",
    symbol: "MANAUSDT",
    binance: "MANAUSDT",
    base: "MANA",
    assetClass: "crypto",
    category: "gaming",
  },
  {
    label: "GALA/USDT",
    symbol: "GALAUSDT",
    binance: "GALAUSDT",
    base: "GALA",
    assetClass: "crypto",
    category: "gaming",
  },
  {
    label: "IMX/USDT",
    symbol: "IMXUSDT",
    binance: "IMXUSDT",
    base: "IMX",
    assetClass: "crypto",
    category: "gaming",
  },
  {
    label: "ENJ/USDT",
    symbol: "ENJUSDT",
    binance: "ENJUSDT",
    base: "ENJ",
    assetClass: "crypto",
    category: "gaming",
  },
  {
    label: "RON/USDT",
    symbol: "RONUSDT",
    binance: "RONUSDT",
    base: "RON",
    assetClass: "crypto",
    category: "gaming",
  },
  {
    label: "BEAM/USDT",
    symbol: "BEAMUSDT",
    binance: "BEAMUSDT",
    base: "BEAM",
    assetClass: "crypto",
    category: "gaming",
  },
  {
    label: "FIL/USDT",
    symbol: "FILUSDT",
    binance: "FILUSDT",
    base: "FIL",
    assetClass: "crypto",
    category: "storage",
  },
  {
    label: "AR/USDT",
    symbol: "ARUSDT",
    binance: "ARUSDT",
    base: "AR",
    assetClass: "crypto",
    category: "storage",
  },
  {
    label: "STORJ/USDT",
    symbol: "STORJUSDT",
    binance: "STORJUSDT",
    base: "STORJ",
    assetClass: "crypto",
    category: "storage",
  },
  {
    label: "ROSE/USDT",
    symbol: "ROSEUSDT",
    binance: "ROSEUSDT",
    base: "ROSE",
    assetClass: "crypto",
    category: "storage",
  },
  {
    label: "AAPL/USD",
    symbol: "AAPL",
    binance: null,
    base: "AAPL",
    assetClass: "stock",
    category: "stock",
  },
  {
    label: "TSLA/USD",
    symbol: "TSLA",
    binance: null,
    base: "TSLA",
    assetClass: "stock",
    category: "stock",
  },
  {
    label: "NVDA/USD",
    symbol: "NVDA",
    binance: null,
    base: "NVDA",
    assetClass: "stock",
    category: "stock",
  },
  {
    label: "MSFT/USD",
    symbol: "MSFT",
    binance: null,
    base: "MSFT",
    assetClass: "stock",
    category: "stock",
  },
  {
    label: "AMZN/USD",
    symbol: "AMZN",
    binance: null,
    base: "AMZN",
    assetClass: "stock",
    category: "stock",
  },
  {
    label: "GOOGL/USD",
    symbol: "GOOGL",
    binance: null,
    base: "GOOGL",
    assetClass: "stock",
    category: "stock",
  },
  {
    label: "META/USD",
    symbol: "META",
    binance: null,
    base: "META",
    assetClass: "stock",
    category: "stock",
  },
  {
    label: "AMD/USD",
    symbol: "AMD",
    binance: null,
    base: "AMD",
    assetClass: "stock",
    category: "stock",
  },
  {
    label: "NFLX/USD",
    symbol: "NFLX",
    binance: null,
    base: "NFLX",
    assetClass: "stock",
    category: "stock",
  },
  {
    label: "COIN/USD",
    symbol: "COIN",
    binance: null,
    base: "COIN",
    assetClass: "stock",
    category: "stock",
  },
  {
    label: "JPM/USD",
    symbol: "JPM",
    binance: null,
    base: "JPM",
    assetClass: "stock",
    category: "stock",
  },
  {
    label: "V/USD",
    symbol: "V",
    binance: null,
    base: "V",
    assetClass: "stock",
    category: "stock",
  },
  {
    label: "DIS/USD",
    symbol: "DIS",
    binance: null,
    base: "DIS",
    assetClass: "stock",
    category: "stock",
  },
  {
    label: "SHOP/USD",
    symbol: "SHOP",
    binance: null,
    base: "SHOP",
    assetClass: "stock",
    category: "stock",
  },
  {
    label: "XAU/USD",
    symbol: "XAUUSD",
    binance: null,
    base: "XAU",
    assetClass: "commodity",
    category: "commodity",
  },
  {
    label: "XAG/USD",
    symbol: "XAGUSD",
    binance: null,
    base: "XAG",
    assetClass: "commodity",
    category: "commodity",
  },
  {
    label: "OIL/USD",
    symbol: "OILUSD",
    binance: null,
    base: "OIL",
    assetClass: "commodity",
    category: "commodity",
  },
  {
    label: "BRENT/USD",
    symbol: "BRENTUSD",
    binance: null,
    base: "BRENT",
    assetClass: "commodity",
    category: "commodity",
  },
  {
    label: "NG/USD",
    symbol: "NGUSD",
    binance: null,
    base: "NG",
    assetClass: "commodity",
    category: "commodity",
  },
  {
    label: "COPPER/USD",
    symbol: "COPPERUSD",
    binance: null,
    base: "COPPER",
    assetClass: "commodity",
    category: "commodity",
  },
  {
    label: "WHEAT/USD",
    symbol: "WHEATUSD",
    binance: null,
    base: "WHEAT",
    assetClass: "commodity",
    category: "commodity",
  },
  {
    label: "EUR/USD",
    symbol: "EURUSD",
    binance: null,
    base: "EUR",
    assetClass: "forex",
    category: "forex",
  },
  {
    label: "GBP/USD",
    symbol: "GBPUSD",
    binance: null,
    base: "GBP",
    assetClass: "forex",
    category: "forex",
  },
  {
    label: "USD/JPY",
    symbol: "USDJPY",
    binance: null,
    base: "USD",
    assetClass: "forex",
    category: "forex",
  },
  {
    label: "AUD/USD",
    symbol: "AUDUSD",
    binance: null,
    base: "AUD",
    assetClass: "forex",
    category: "forex",
  },
  {
    label: "USD/CAD",
    symbol: "USDCAD",
    binance: null,
    base: "USD",
    assetClass: "forex",
    category: "forex",
  },
];

const fmtPrice = (p) => {
  if (p == null) return "—";
  if (p >= 1000)
    return p.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (p >= 1) return p.toFixed(4);
  return p.toFixed(6);
};
const fmtUSD = (v) =>
  `$${(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const rand = (min, max) => Math.random() * (max - min) + min;

function generateOrderBook(mid, rows = 8) {
  if (!mid) return { asks: [], bids: [] };
  const spread = mid * 0.0001;
  const asks = [],
    bids = [];
  let askP = mid + spread / 2,
    bidP = mid - spread / 2;
  let aTotal = 0,
    bTotal = 0;
  for (let i = 0; i < rows; i++) {
    const aAmt = parseFloat(rand(0.05, 2.5).toFixed(4));
    aTotal += aAmt;
    asks.push({
      price: askP,
      amount: aAmt,
      total: parseFloat(aTotal.toFixed(4)),
    });
    askP += mid * rand(0.00005, 0.0002);
    const bAmt = parseFloat(rand(0.05, 2.5).toFixed(4));
    bTotal += bAmt;
    bids.push({
      price: bidP,
      amount: bAmt,
      total: parseFloat(bTotal.toFixed(4)),
    });
    bidP -= mid * rand(0.00005, 0.0002);
  }
  return { asks: asks.reverse(), bids };
}

function TVChart({ symbol, darkMode, assetClass, height = 400 }) {
  const containerId = useRef(
    `tv_${symbol.replace(/[^a-z0-9]/gi, "_")}_${Math.random().toString(36).slice(2, 7)}`,
  );
  const widgetRef = useRef(null);
  const roRef = useRef(null);
  const timerRef = useRef(null);
  const theme = darkMode ? "dark" : "light";

  const tvSymbol = (() => {
    if (assetClass === "stock") return `NASDAQ:${symbol}`;
    if (assetClass === "commodity") return `TVC:${symbol}`;
    if (assetClass === "forex") return `FX:${symbol}`;
    return `BINANCE:${symbol}`;
  })();

  const initWidget = useCallback(() => {
    const id = containerId.current;
    const el = document.getElementById(id);
    if (!el || typeof TradingView === "undefined") return;

    // Guard: container must have real dimensions
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Clear previous widget
    el.innerHTML = "";
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (_) {}
      widgetRef.current = null;
    }

    try {
      widgetRef.current = new TradingView.widget({
        autosize: true,
        symbol: tvSymbol,
        interval: "D",
        container_id: id,
        timezone: "Etc/UTC",
        theme,
        style: "1",
        locale: "en",
        toolbar_bg: darkMode ? "#0a1020" : "#f8fafc",
        enable_publishing: false,
        withdateranges: true,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        studies: ["MASimple@tv-basicstudies", "RSI@tv-basicstudies"],
        show_popup_button: false,
        save_image: false,
        backgroundColor: darkMode ? "#0a1020" : "#ffffff",
        overrides: {
          "mainSeriesProperties.candleStyle.upColor": "#22c55e",
          "mainSeriesProperties.candleStyle.downColor": "#ef4444",
          "mainSeriesProperties.candleStyle.borderUpColor": "#22c55e",
          "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
          "mainSeriesProperties.candleStyle.wickUpColor": "#22c55e",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
        },
      });
    } catch (e) {
      console.warn("[TVChart]", e.message);
    }
  }, [tvSymbol, theme, darkMode]);

  const scheduleInit = useCallback(() => {
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      initWidget();

      timerRef.current = setTimeout(initWidget, 400);
    }, 80);
  }, [initWidget]);

  useEffect(() => {
    const id = containerId.current;

    const run = () => {
      if (typeof TradingView !== "undefined") {
        scheduleInit();
      } else {
        const existing = document.querySelector('script[src*="tradingview"]');
        if (existing) {
          existing.addEventListener("load", scheduleInit);
        } else {
          const s = document.createElement("script");
          s.src = "https://s3.tradingview.com/tv.js";
          s.async = true;
          s.onload = scheduleInit;
          document.head.appendChild(s);
        }
      }
    };

    if (typeof ResizeObserver !== "undefined") {
      roRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            roRef.current?.disconnect();
            run();
            break;
          }
        }
      });
      const el = document.getElementById(id);
      if (el) roRef.current.observe(el);
    } else {
      run();
    }

    return () => {
      clearTimeout(timerRef.current);
      roRef.current?.disconnect();
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
    };
  }, [tvSymbol, theme, scheduleInit]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: height,
        minHeight: height,
      }}
    >
      {/*  */}
      <div
        id={containerId.current}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

//  PairRow
function PairRow({
  p,
  selected,
  onSelect,
  textClr,
  muted,
  divLine,
  t,
  darkMode,
}) {
  const imgSrc = COIN_IMAGES[p.symbol];
  return (
    <button
      onClick={onSelect}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "11px 16px",
        border: "none",
        borderBottom: `1px solid ${divLine}`,
        background: selected ? "rgba(245,158,11,0.08)" : "transparent",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            border: selected
              ? "2px solid rgba(245,158,11,0.5)"
              : "2px solid transparent",
            background: darkMode
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.04)",
          }}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={p.base}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:800;color:${selected ? "#f59e0b" : muted};font-family:monospace">${p.base.slice(0, 4)}</div>`;
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.6rem",
                fontWeight: 800,
                color: selected ? "#f59e0b" : muted,
                fontFamily: "monospace",
              }}
            >
              {p.base.slice(0, 4)}
            </div>
          )}
        </div>
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              color: selected ? "#f59e0b" : textClr,
              fontWeight: 700,
              fontSize: "0.87rem",
              fontFamily: "monospace",
            }}
          >
            {p.label}
          </div>
          <div
            style={{
              color: muted,
              fontSize: "0.62rem",
              textTransform: "capitalize",
              marginTop: 1,
            }}
          >
            {t(p.assetClass)} · {t(p.category)}
          </div>
        </div>
      </div>
      {selected && (
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#f59e0b",
            boxShadow: "0 0 8px #f59e0b",
          }}
        />
      )}
    </button>
  );
}

//  AllMarketsDrawer
function AllMarketsDrawer({
  open,
  onClose,
  pairs,
  selectedPair,
  onSelect,
  darkMode,
  textClr,
  muted,
  border,
  inputBg,
  divLine,
  t,
}) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return pairs.filter(
      (p) =>
        (activeTab === "all" || p.category === activeTab) &&
        (p.label.toLowerCase().includes(q) || p.base.toLowerCase().includes(q)),
    );
  }, [pairs, activeTab, search]);

  const grouped = useMemo(() => {
    if (activeTab !== "all" || search) return null;
    const g = {};
    filtered.forEach((p) => {
      if (!g[p.category]) g[p.category] = [];
      g[p.category].push(p);
    });
    return g;
  }, [filtered, activeTab, search]);

  if (!open) return null;

  const drawerBg = darkMode ? "#080f1e" : "#ffffff";
  const catBg = darkMode ? "#0d1527" : "#f4f6fa";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500 }} onClick={onClose}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(360px, 92vw)",
          background: drawerBg,
          boxShadow: "4px 0 48px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          animation: "slideInLeft 0.25s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        <div
          style={{
            padding: "16px 16px 12px",
            borderBottom: `1px solid ${border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <span style={{ color: textClr, fontWeight: 800, fontSize: "1rem" }}>
              {t("all_markets")}
            </span>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: muted,
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
            >
              <X size={18} />
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: muted,
                pointerEvents: "none",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search_symbol")}
              autoFocus
              style={{
                width: "100%",
                padding: "9px 10px 9px 32px",
                borderRadius: 9,
                border: `1px solid ${border}`,
                background: inputBg,
                color: textClr,
                fontSize: "0.84rem",
                boxSizing: "border-box",
                outline: "none",
                fontFamily: "monospace",
              }}
            />
          </div>
        </div>
        <div
          style={{
            borderBottom: `1px solid ${border}`,
            background: catBg,
            flexShrink: 0,
          }}
        >
          <div
            style={{ display: "flex", overflowX: "auto" }}
            className="hide-scrollbar"
          >
            {[{ key: "all", labelKey: "all_markets_short" }, ...CATEGORIES].map(
              (cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveTab(cat.key)}
                  style={{
                    padding: "10px 12px",
                    border: "none",
                    borderBottom:
                      activeTab === cat.key
                        ? "2px solid #f59e0b"
                        : "2px solid transparent",
                    background: "transparent",
                    color: activeTab === cat.key ? "#f59e0b" : muted,
                    fontWeight: activeTab === cat.key ? 700 : 500,
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {cat.key === "all" ? t("all") : t(cat.labelKey)}
                </button>
              ),
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }} className="thin-scroll">
          {grouped
            ? Object.entries(grouped).map(([catKey, catPairs]) => {
                const catMeta = CATEGORIES.find((c) => c.key === catKey);
                return (
                  <div key={catKey}>
                    <div
                      style={{
                        padding: "8px 16px 5px",
                        color: "#f59e0b",
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        background: catBg,
                        borderBottom: `1px solid ${divLine}`,
                      }}
                    >
                      {catMeta?.icon} {catMeta ? t(catMeta.labelKey) : catKey}
                    </div>
                    {catPairs.map((p) => (
                      <PairRow
                        key={p.symbol}
                        p={p}
                        selected={selectedPair.symbol === p.symbol}
                        onSelect={() => {
                          onSelect(p);
                          onClose();
                        }}
                        textClr={textClr}
                        muted={muted}
                        divLine={divLine}
                        t={t}
                      />
                    ))}
                  </div>
                );
              })
            : filtered.map((p) => (
                <PairRow
                  key={p.symbol}
                  p={p}
                  selected={selectedPair.symbol === p.symbol}
                  onSelect={() => {
                    onSelect(p);
                    onClose();
                  }}
                  textClr={textClr}
                  muted={muted}
                  divLine={divLine}
                  t={t}
                />
              ))}
          {filtered.length === 0 && (
            <div
              style={{
                padding: "48px 16px",
                textAlign: "center",
                color: muted,
                fontSize: "0.84rem",
              }}
            >
              {t("no_results", { search })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// OrderBookPanel
function OrderBookPanel({
  orderBook,
  priceData,
  isUp,
  muted,
  textClr,
  divLine,
  setOrderType,
  setLimitPrice,
  setMobileTab,
  t,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 14px 6px",
          borderBottom: `1px solid ${divLine}`,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: textClr,
            fontWeight: 700,
            fontSize: "0.75rem",
            letterSpacing: "0.06em",
          }}
        >
          {t("order_book")}
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          padding: "4px 14px",
          color: muted,
          fontSize: "0.6rem",
          flexShrink: 0,
        }}
      >
        <div>{t("price")}</div>
        <div style={{ textAlign: "right" }}>{t("amount")}</div>
        <div style={{ textAlign: "right" }}>{t("total")}</div>
      </div>
      <div
        className="thin-scroll"
        style={{ flex: 1, overflowY: "auto", direction: "rtl" }}
      >
        <div style={{ direction: "ltr" }}>
          {orderBook.asks.map((row, i) => (
            <div
              key={i}
              className="ob-row"
              onClick={() => {
                setOrderType("limit");
                setLimitPrice(row.price.toFixed(2));
                setMobileTab?.("trade");
              }}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                padding: "3px 14px",
                position: "relative",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  background: "rgba(248,113,113,0.08)",
                  width: `${Math.min((row.total / (orderBook.asks[orderBook.asks.length - 1]?.total || 1)) * 100, 100)}%`,
                }}
              />
              <span
                style={{
                  color: "#f87171",
                  fontFamily: "monospace",
                  fontSize: "0.7rem",
                  position: "relative",
                }}
              >
                {fmtPrice(row.price)}
              </span>
              <span
                style={{
                  color: muted,
                  fontFamily: "monospace",
                  fontSize: "0.7rem",
                  textAlign: "right",
                  position: "relative",
                }}
              >
                {row.amount}
              </span>
              <span
                style={{
                  color: muted,
                  fontFamily: "monospace",
                  fontSize: "0.7rem",
                  textAlign: "right",
                  position: "relative",
                }}
              >
                {row.total}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          padding: "6px 14px",
          borderTop: `1px solid ${divLine}`,
          borderBottom: `1px solid ${divLine}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontWeight: 800,
            fontSize: "0.88rem",
            color: isUp ? "#34d399" : "#f87171",
          }}
        >
          ${priceData ? fmtPrice(priceData.price) : "—"}
        </span>
        <span style={{ color: muted, fontSize: "0.6rem" }}>{t("spread")}</span>
      </div>
      <div className="thin-scroll" style={{ flex: 1, overflowY: "auto" }}>
        {orderBook.bids.map((row, i) => (
          <div
            key={i}
            className="ob-row"
            onClick={() => {
              setOrderType("limit");
              setLimitPrice(row.price.toFixed(2));
              setMobileTab?.("trade");
            }}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              padding: "3px 14px",
              position: "relative",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                background: "rgba(52,211,153,0.08)",
                width: `${Math.min((row.total / (orderBook.bids[orderBook.bids.length - 1]?.total || 1)) * 100, 100)}%`,
              }}
            />
            <span
              style={{
                color: "#34d399",
                fontFamily: "monospace",
                fontSize: "0.7rem",
                position: "relative",
              }}
            >
              {fmtPrice(row.price)}
            </span>
            <span
              style={{
                color: muted,
                fontFamily: "monospace",
                fontSize: "0.7rem",
                textAlign: "right",
                position: "relative",
              }}
            >
              {row.amount}
            </span>
            <span
              style={{
                color: muted,
                fontFamily: "monospace",
                fontSize: "0.7rem",
                textAlign: "right",
                position: "relative",
              }}
            >
              {row.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const LEVERAGE_OPTIONS = [1, 2, 3, 5, 10, 20, 50, 100];

//  TradePanel
function TradePanel({
  side,
  setSide,
  orderType,
  setOrderType,
  limitPrice,
  setLimitPrice,
  stopLoss,
  setStopLoss,
  amount,
  setAmount,
  leverage,
  setLeverage,
  total,
  fee,
  margin,
  liqPrice,
  submitting,
  currentPrice,
  availBalance,
  signalId,
  selectedPair,
  muted,
  textClr,
  border,
  inputBg,
  divLine,
  placeOrder,
  setAmountPct,
  t,
}) {
  const accentBuy = "#22c55e";
  const accentSell = "#ef4444";
  const accent = side === "buy" ? accentBuy : accentSell;

  return (
    <div
      className="thin-scroll"
      style={{ flex: 1, padding: "14px 16px", overflowY: "auto" }}
    >
      {signalId && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{ color: "#f59e0b", fontSize: "0.72rem", fontWeight: 500 }}
          >
            {t("trading_from_premium_signal")}
          </span>
        </div>
      )}

      {/* Buy / Sell */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${divLine}`,
          marginBottom: 14,
        }}
      >
        {["buy", "sell"].map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            style={{
              padding: "12px",
              border: "none",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
              background:
                side === s
                  ? s === "buy"
                    ? "linear-gradient(135deg,#16a34a,#22c55e)"
                    : "linear-gradient(135deg,#b91c1c,#ef4444)"
                  : "transparent",
              color: side === s ? "#fff" : muted,
            }}
          >
            {s === "buy" ? t("buy_long") : t("sell_short")}
          </button>
        ))}
      </div>

      {/* Order type */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["market", "limit", "stop"].map((tk) => (
          <button
            key={tk}
            onClick={() => setOrderType(tk)}
            style={{
              flex: 1,
              padding: "8px 4px",
              borderRadius: 8,
              border: `1px solid ${orderType === tk ? accent : divLine}`,
              background: orderType === tk ? `${accent}1a` : "transparent",
              color: orderType === tk ? accent : muted,
              fontSize: "0.74rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {tk === "market"
              ? t("market")
              : tk === "limit"
                ? t("limit")
                : t("stop")}
          </button>
        ))}
      </div>

      {/* Leverage selector  */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {t("leverage")}
          </label>
          <span
            style={{
              color: accent,
              fontWeight: 800,
              fontSize: "0.82rem",
              fontFamily: "monospace",
            }}
          >
            {leverage}×
          </span>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {LEVERAGE_OPTIONS.map((lev) => (
            <button
              key={lev}
              onClick={() => setLeverage(lev)}
              style={{
                flex: "0 0 auto",
                padding: "5px 10px",
                borderRadius: 7,
                border: `1px solid ${leverage === lev ? accent : divLine}`,
                background: leverage === lev ? `${accent}1a` : inputBg,
                color: leverage === lev ? accent : muted,
                fontSize: "0.74rem",
                fontWeight: leverage === lev ? 800 : 500,
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              {lev}×
            </button>
          ))}
        </div>
        {leverage > 1 && (
          <div
            style={{
              marginTop: 6,
              padding: "6px 10px",
              borderRadius: 7,
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.15)",
              fontSize: "0.68rem",
              color: "#f59e0b",
            }}
          >
            ⚠ {t("high_leverage_warning")}
          </div>
        )}
      </div>
      {/*  */}

      {/* Limit/Stop price */}
      {(orderType === "limit" || orderType === "stop") && (
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              color: muted,
              fontSize: "0.7rem",
              display: "block",
              marginBottom: 5,
            }}
          >
            {orderType === "stop" ? t("stop_price_usdt") : t("price_usdt")}
          </label>
          <input
            className="order-input"
            type="number"
            placeholder={currentPrice?.toFixed(2)}
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 9,
              border: `1px solid ${border}`,
              background: inputBg,
              color: textClr,
              fontSize: "0.9rem",
              boxSizing: "border-box",
              fontFamily: "monospace",
              outline: "none",
            }}
          />
        </div>
      )}

      {/* Stop loss */}
      {orderType === "stop" && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 5,
            }}
          >
            <label style={{ color: "#f87171", fontSize: "0.7rem" }}>
              {t("stop_loss_usdt")}
            </label>
            {currentPrice && stopLoss && (
              <span style={{ color: muted, fontSize: "0.62rem" }}>
                {(
                  ((parseFloat(stopLoss) - currentPrice) / currentPrice) *
                  100
                ).toFixed(2)}
                {t("percent_from_current")}
              </span>
            )}
          </div>
          <input
            className="order-input"
            type="number"
            placeholder="0.00"
            step="any" 
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 9,
              border: "1px solid rgba(248,113,113,0.4)",
              background: "rgba(248,113,113,0.06)",
              color: "#f87171",
              fontSize: "0.9rem",
              boxSizing: "border-box",
              fontFamily: "monospace",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
            {[-1, -2, -3, -5].map((pct) => (
              <button
                key={pct}
                onClick={() =>
                  setStopLoss((currentPrice * (1 + pct / 100)).toFixed(2))
                }
                style={{
                  flex: 1,
                  padding: "4px 0",
                  borderRadius: 6,
                  border: "1px solid rgba(248,113,113,0.3)",
                  background: "rgba(248,113,113,0.06)",
                  color: "#f87171",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Amount */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 5,
          }}
        >
          <label style={{ color: muted, fontSize: "0.7rem" }}>
            {t("amount_label", { base: selectedPair.base })}
          </label>
          <span style={{ color: muted, fontSize: "0.68rem" }}>
            {t("available_short")}: ${(availBalance || 0).toFixed(2)}
          </span>
        </div>
        <input
          className="order-input"
          type="number"
          placeholder="0.00"
          min="0"
          step="any" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 9,
            border: `1px solid ${border}`,
            background: inputBg,
            color: textClr,
            fontSize: "0.9rem",
            boxSizing: "border-box",
            fontFamily: "monospace",
            outline: "none",
          }}
        />
      </div>

      {/* % buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 6,
          marginBottom: 14,
        }}
      >
        {[25, 50, 75, 100].map((pct) => (
          <button
            key={pct}
            className="pct-btn"
            onClick={() => setAmountPct(pct)}
            style={{
              padding: "8px",
              borderRadius: 8,
              background: inputBg,
              color: muted,
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            {pct}%
          </button>
        ))}
      </div>

      {/*  Summary box (position / margin / liq)*/}
      <div
        style={{
          marginBottom: 14,
          borderRadius: 10,
          background: inputBg,
          border: `1px solid ${border}`,
          overflow: "hidden",
        }}
      >
        {[
          { label: "Position size", value: `$${(total || 0).toFixed(2)}` },
          {
            label: `Margin (${leverage}×)`,
            value: `$${(margin || 0).toFixed(2)}`,
            color: accent,
          },
          { label: "Open fee (0.1%)", value: `$${(fee || 0).toFixed(2)}` },
          {
            label: "Cost",
            value: `$${((margin || 0) + (fee || 0)).toFixed(2)}`,
            color: textClr,
            bold: true,
          },
          liqPrice != null && liqPrice > 0
            ? {
                label: "Liq. price",
                value: `$${liqPrice.toFixed(2)}`,
                color: "#f87171",
              }
            : null,
        ]
          .filter(Boolean)
          .map((row, i, arr) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 14px",
                borderBottom:
                  i < arr.length - 1 ? `1px solid ${divLine}` : "none",
              }}
            >
              <span style={{ color: muted, fontSize: "0.72rem" }}>
                {row.label}
              </span>
              <span
                style={{
                  color: row.color || muted,
                  fontFamily: "monospace",
                  fontWeight: row.bold ? 800 : 600,
                  fontSize: "0.78rem",
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
      </div>
      {/* */}

      {/*  Risk warning when using most of balance ── */}
      {margin > 0 && availBalance > 0 && margin > availBalance * 0.8 && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            fontSize: "0.7rem",
            color: "#f87171",
            display: "flex",
            alignItems: "flex-start",
            gap: 6,
          }}
        >
          <span style={{ flexShrink: 0 }}>⚠</span>
          <span>
            {t("high_liquidation_risk", {
              percent: ((margin / availBalance) * 100).toFixed(0),
            })}
          </span>
        </div>
      )}

      {/*  Show liquidation price prominently when leverage > 1 */}
      {leverage > 1 && liqPrice > 0 && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{ color: "#f87171", fontSize: "0.72rem", fontWeight: 600 }}
          >
            {t("liquidation_price")}
          </span>
          <span
            style={{
              color: "#f87171",
              fontFamily: "monospace",
              fontWeight: 800,
              fontSize: "0.88rem",
            }}
          >
            ${liqPrice.toFixed(2)}
          </span>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={placeOrder}
        disabled={submitting || !currentPrice}
        style={{
          width: "100%",
          padding: "15px",
          borderRadius: 12,
          border: "none",
          fontWeight: 800,
          fontSize: "0.95rem",
          cursor: submitting || !currentPrice ? "not-allowed" : "pointer",
          background:
            side === "buy"
              ? "linear-gradient(135deg,#16a34a,#22c55e)"
              : "linear-gradient(135deg,#b91c1c,#ef4444)",
          color: "#fff",
          opacity: submitting || !currentPrice ? 0.7 : 1,
          boxShadow:
            side === "buy"
              ? "0 4px 20px rgba(34,197,94,0.3)"
              : "0 4px 20px rgba(239,68,68,0.3)",
        }}
      >
        {submitting
          ? t("placing")
          : !currentPrice
            ? t("loading_price")
            : `${side === "buy" ? t("buy") : t("sell")} ${selectedPair.base} ${leverage > 1 ? `${leverage}×` : ""}`}
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <span style={{ color: muted, fontSize: "0.68rem" }}>
          {t("fee_percent")}
        </span>
        <span style={{ color: muted, fontSize: "0.68rem" }}>
          ${(fee || 0).toFixed(2)} {t("est_fee")}
        </span>
      </div>
    </div>
  );
}

//  Main TradePage
export default function TradePage() {
  const { pair: paramPair } = useParams();
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [leverage, setLeverage] = useState(1);
  const [selectedPair, setSelectedPair] = useState(
    () => PAIRS.find((p) => p.symbol === (paramPair || "BTCUSDT")) || PAIRS[0],
  );
  const [marketsOpen, setMarketsOpen] = useState(false);
  const [priceData, setPriceData] = useState(null);
  const [orderBook, setOrderBook] = useState({ asks: [], bids: [] });
  const [side, setSide] = useState("buy");
  const [orderType, setOrderType] = useState("market");
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [openOrders, setOpenOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [ordersTab, setOrdersTab] = useState("open");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [closing, setClosing] = useState(null);
  const [signalId, setSignalId] = useState(null);
  const [obExpanded, setObExpanded] = useState(false);

  const priceTimer = useRef(null);
  const obTimer = useRef(null);
  const pnlTimer = useRef(null);

  const pageBg = darkMode ? "#020617" : "#f0f2f5";
  const cardBg = darkMode ? "rgba(10,16,35,0.98)" : "rgba(255,255,255,0.99)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const muted = darkMode ? "#64748b" : "#94a3b8";
  const border = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const divLine = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const inputBg = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  const availBalance = user?.wallet?.balances?.USDT || 0;
  const currentPrice = priceData?.price || 0;
  const isUp = (priceData?.change24h ?? 0) >= 0;

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search).get("signalId");
    if (sp) {
      setSignalId(sp);
      setTimeout(() => showToast(t("executing_from_signal"), "info"), 500);
    }
  }, []);

  const handleSelectPair = (p) => {
    setSelectedPair(p);
    navigate(`/trade/${p.symbol}`);
  };

  const fetchPrice = useCallback(async () => {
    try {
      if (selectedPair.binance) {
        const res = await api.get("/markets/prices");
        const prices = res.data?.data || res.data;
        const MAP = {
          BTCUSDT: "bitcoin",
          ETHUSDT: "ethereum",
          SOLUSDT: "solana",
          BNBUSDT: "binancecoin",
          XRPUSDT: "ripple",
          ADAUSDT: "cardano",
          DOTUSDT: "polkadot",
          DOGEUSDT: "dogecoin",
          AVAXUSDT: "avalanche-2",
          LINKUSDT: "chainlink",
          NEARUSDT: "near",
          ATOMUSDT: "cosmos",
          MATICUSDT: "matic-network",
          UNIUSDT: "uniswap",
          AAVEUSDT: "aave",
          SHIBUSDT: "shiba-inu",
          OPUSDT: "optimism",
          ARBUSDT: "arbitrum",
          AXSUSDT: "axie-infinity",
          SANDUSDT: "the-sandbox",
          MANAUSDT: "decentraland",
          GALAUSDT: "gala",
          IMXUSDT: "immutable-x",
          SUIUSDT: "sui",
          APTUSDT: "aptos",
          LDOUSDT: "lido-dao",
          INJUSDT: "injective-protocol",
          FILUSDT: "filecoin",
          GRTUSDT: "the-graph",
          MKRUSDT: "maker",
          CRVUSDT: "curve-dao-token",
          COMPUSDT: "compound-governance-token",
          SNXUSDT: "havven",
          SUSHIUSDT: "sushi",
          YFIUSDT: "yearn-finance",
          PEPEUSDT: "pepe",
          WIFUSDT: "dogwifcoin",
          BONKUSDT: "bonk",
          FLOKIUSDT: "floki",
          RUNEUSDT: "thorchain",
          STXUSDT: "blockstack",
          ARUSDT: "arweave",
          STORJUSDT: "storj",
          ROSEUSDT: "oasis-network",
          RONUSDT: "ronin",
          ENJUSDT: "enjincoin",
          TRXUSDT: "tron",
          XLMUSDT: "stellar",
          ALGOUSDT: "algorand",
          BEAMUSDT: "beam-2",
          "1INCHUSDT": "1inch",
        };
        const d = prices[MAP[selectedPair.binance]];
        if (d?.usd) {
          setPriceData({
            price: d.usd,
            change24h: d.usd_24h_change || 0,
            high24h: d.usd * (1 + Math.abs(d.usd_24h_change || 0) / 200),
            low24h: d.usd * (1 - Math.abs(d.usd_24h_change || 0) / 200),
            volume24h: 0,
          });
          return;
        }
      }
      const res = await api.get(
        `/markets/${selectedPair.label.replace("/", "-")}`,
      );
      const d = res.data?.data;
      if (d?.price)
        setPriceData({
          price: d.price,
          change24h: d.change24h || 0,
          high24h: d.high || d.price * 1.01,
          low24h: d.low || d.price * 0.99,
          volume24h: d.volume || 0,
        });
    } catch (err) {
      console.error("[price]", err.message);
      setPriceData(null);
    }
  }, [selectedPair]);

  const refreshOB = useCallback(() => {
    if (currentPrice) setOrderBook(generateOrderBook(currentPrice));
  }, [currentPrice]);

  useEffect(() => {
    fetchPrice();
    priceTimer.current = setInterval(fetchPrice, 30_000);
    return () => clearInterval(priceTimer.current);
  }, [fetchPrice]);

  useEffect(() => {
    refreshOB();
    obTimer.current = setInterval(refreshOB, 3_000);
    return () => clearInterval(obTimer.current);
  }, [refreshOB]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const [posRes, histRes] = await Promise.all([
        api.get("/trades/positions"),
        api.get("/trades/all-history?limit=50"),
      ]);
      setOpenOrders(posRes.data?.data?.positions || []);
      setOrderHistory(histRes.data?.data?.trades || []);
    } catch (err) {
      console.error("[fetchOrders]", err.message);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!currentPrice || !openOrders.length) return;
    setOpenOrders((prev) =>
      prev.map((o) => {
        if (o.status !== "filled") return o;
        const ep = o.filledPrice || o.price;
        return {
          ...o,
          unrealizedPnl: parseFloat(
            (
              (o.side === "buy" ? currentPrice - ep : ep - currentPrice) *
              o.quantity
            ).toFixed(2),
          ),
        };
      }),
    );
  }, [currentPrice]);

  useEffect(() => {
    pnlTimer.current = setInterval(() => {
      if (currentPrice && openOrders.length) {
        setOpenOrders((prev) =>
          prev.map((o) => {
            if (o.status !== "filled") return o;
            const ep = o.filledPrice || o.price;
            return {
              ...o,
              unrealizedPnl: parseFloat(
                (
                  (o.side === "buy" ? currentPrice - ep : ep - currentPrice) *
                  o.quantity
                ).toFixed(2),
              ),
            };
          }),
        );
      }
    }, 30_000);
    return () => clearInterval(pnlTimer.current);
  }, [currentPrice, openOrders]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const setAmountPct = (pct) => {
    if (!currentPrice) return;
    setAmount(
      parseFloat(
        ((availBalance * pct) / 100 / currentPrice).toFixed(6),
      ).toString(),
    );
  };

  const execPrice =
    (orderType === "limit" || orderType === "stop") && limitPrice
      ? parseFloat(limitPrice)
      : currentPrice;
  const total = parseFloat(amount || 0) * execPrice;
  const fee = parseFloat((total * 0.001).toFixed(8));
  const margin = parseFloat((total / leverage).toFixed(8));
  const liqPrice =
    leverage > 1 && currentPrice
      ? side === "buy"
        ? parseFloat((execPrice * (1 - 1 / leverage + 0.005)).toFixed(2))
        : parseFloat((execPrice * (1 + 1 / leverage - 0.005)).toFixed(2))
      : null;

  const placeOrder = async () => {
    const snap = currentPrice;
    //  Validation
    if (!amount || parseFloat(amount) <= 0) {
      showToast(t("enter_valid_amount"), "error");
      return;
    }
    if (
      orderType !== "market" &&
      (!limitPrice || parseFloat(limitPrice) <= 0)
    ) {
      showToast(t("enter_valid_price"), "error");
      return;
    }
    if (orderType === "stop" && (!stopLoss || parseFloat(stopLoss) <= 0)) {
      showToast(t("enter_stop_loss"), "error");
      return;
    }
    if (!snap) {
      showToast(t("price_not_loaded"), "error");
      return;
    }

    const cost = (margin || 0) + (fee || 0);

    //  Balance checks
    if (cost > availBalance) {
      showToast(
        t("insufficient_balance_lev", {
          required: cost.toFixed(2),
          available: availBalance.toFixed(2),
        }),
        "error",
      );
      return;
    }
    if (margin > availBalance * 0.9) {
      showToast(t("position_too_large"), "error");
      return;
    }

    //  Leverage restriction
    const MAX_LEV = {
      crypto: 100,
      stock: 10,
      forex: 30,
      commodity: 20,
      gold: 20,
    };
    if (leverage > (MAX_LEV[selectedPair.assetClass] || 10)) {
      showToast(
        t("max_leverage_error", {
          maxLev: MAX_LEV[selectedPair.assetClass] || 10,
          assetClass: selectedPair.assetClass,
        }),
        "error",
      );
      return;
    }
    if (signalId) {
      try {
        const cr = await api.get(`/trades/check-signal?signalId=${signalId}`);
        if (cr.data?.data?.exists) {
          showToast(t("signal_already_used"), "warning");
          return;
        }
      } catch {}
    }
    setSubmitting(true);
    try {
      await api.post("/trades", {
        symbol: selectedPair.symbol,
        side,
        type: orderType,
        quantity: parseFloat(amount),
        price: orderType === "market" ? snap : parseFloat(limitPrice),
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        assetClass: selectedPair.assetClass,
        signalId,
        leverage,
      });
      showToast(
        orderType === "market"
          ? t("market_order_placed", {
              side: side === "buy" ? t("bought") : t("sold"),
              amount,
              base: selectedPair.base,
              price: fmtUSD(currentPrice),
            })
          : t("limit_order_placed", { price: fmtUSD(parseFloat(limitPrice)) }),
      );
      if (side === "buy" && updateUser)
        updateUser({
          wallet: {
            ...user.wallet,
            balances: {
              ...user.wallet.balances,
              USDT: availBalance - total - fee,
            },
          },
        });
      setSignalId(null);
      setAmount("");
      setLimitPrice("");
      setStopLoss("");
      setOrdersTab(orderType === "market" ? "history" : "open");
      await fetchOrders();
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || t("order_failed"),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const closePosition = async (tradeId) => {
    if (!currentPrice) {
      showToast(t("price_not_available"), "error");
      return;
    }
    setClosing(tradeId);
    try {
      const res = await api.post(`/trades/${tradeId}/close`, {
        closePrice: currentPrice,
      });
      const { pnl, refunded } = res.data?.data || {};
      showToast(
        t("position_closed_message", { pnl: fmtUSD(pnl) }),
        pnl >= 0 ? "success" : "error",
      );
      if (updateUser && refunded)
        updateUser({
          wallet: {
            ...user.wallet,
            balances: {
              ...user.wallet.balances,
              USDT: availBalance + refunded,
            },
          },
        });
      await fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || t("close_failed"), "error");
    } finally {
      setClosing(null);
    }
  };

  const cancelOrder = async (tradeId) => {
    try {
      await api.delete(`/trades/${tradeId}`);
      showToast("Order cancelled");
      await fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || t("cancel_failed"), "error");
    }
  };

  const obProps = {
    orderBook,
    priceData,
    isUp,
    muted,
    textClr,
    divLine,
    setOrderType,
    setLimitPrice,
    t,
  };
  const tpProps = {
    side,
    setSide,
    orderType,
    setOrderType,
    limitPrice,
    setLimitPrice,
    stopLoss,
    setStopLoss,
    amount,
    setAmount,
    total,
    fee,
    submitting,
    currentPrice,
    availBalance,
    signalId,
    selectedPair,
    muted,
    textClr,
    border,
    inputBg,
    divLine,
    placeOrder,
    setAmountPct,
    t,
    leverage,
    setLeverage,
    margin,
    liqPrice,
  };

  const MOBILE_CHART_HEIGHT = 400;

  const DESKTOP_CHART_HEIGHT = "100%";

  return (
    <div style={{ minHeight: "100vh", background: pageBg }}>
      <style>{`
        @keyframes toastIn     { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInLeft { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        .order-input:focus { outline:none; border-color:rgba(245,158,11,0.5)!important; }
        .thin-scroll::-webkit-scrollbar{width:3px;height:3px}
        .thin-scroll::-webkit-scrollbar-thumb{background:rgba(245,158,11,0.25);border-radius:99px}
        .thin-scroll{scrollbar-width:thin;scrollbar-color:rgba(245,158,11,0.25) transparent}
        .hide-scrollbar::-webkit-scrollbar{display:none}
        .hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        .pct-btn{transition:all 0.15s;cursor:pointer;border:none;}
        .pct-btn:hover{background:rgba(245,158,11,0.2)!important;color:#f59e0b!important;}
        .ob-row{transition:background 0.1s;}
        .ob-row:hover{background:rgba(255,255,255,0.04)!important;}

        /* Force TradingView iframe to fill its container on ALL screen sizes */
        [id^="tv_"] iframe,
        [id^="tv_"] > div,
        [id^="tv_"] > div > iframe {
          width: 100% !important;
          height: 100% !important;
          min-height: inherit !important;
          border: none !important;
        }

        .trade-desktop { display: none !important; }
        .trade-mobile  { display: flex !important; flex-direction: column; }
        @media (min-width: 768px) {
          .trade-desktop { display: grid !important; }
          .trade-mobile  { display: none !important; }
        }
      `}</style>

      <DashboardNav />
      <AllMarketsDrawer
        open={marketsOpen}
        onClose={() => setMarketsOpen(false)}
        pairs={PAIRS}
        selectedPair={selectedPair}
        onSelect={handleSelectPair}
        darkMode={darkMode}
        textClr={textClr}
        muted={muted}
        border={border}
        inputBg={inputBg}
        divLine={divLine}
        t={t}
      />

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 400,
            padding: "12px 20px",
            borderRadius: 12,
            background:
              toast.type === "error"
                ? "rgba(248,113,113,0.95)"
                : "rgba(52,211,153,0.95)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.85rem",
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            animation: "toastIn 0.25s ease",
            whiteSpace: "nowrap",
          }}
        >
          {toast.msg}
        </div>
      )}

      <div style={{ paddingTop: 64, paddingBottom: 80 }}>
        {/* Top bar */}
        <div
          style={{
            background: cardBg,
            borderBottom: `1px solid ${border}`,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            overflowX: "auto",
          }}
          className="hide-scrollbar"
        >
          <button
            onClick={() => setMarketsOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 12px",
              borderRadius: 9,
              border: "1px solid rgba(245,158,11,0.3)",
              background:
                "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.04))",
              color: "#f59e0b",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            ◈ {t("all_markets_short")} <ChevronRight size={12} />
          </button>
          <div
            style={{ width: 1, height: 24, background: border, flexShrink: 0 }}
          />
          <button
            onClick={() => setMarketsOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                overflow: "hidden",
                background: "rgba(255,255,255,0.06)",
                flexShrink: 0,
              }}
            >
              {COIN_IMAGES[selectedPair.symbol] ? (
                <img
                  src={COIN_IMAGES[selectedPair.symbol]}
                  alt={selectedPair.base}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.6rem",
                    fontWeight: 800,
                    color: muted,
                  }}
                >
                  {selectedPair.base.slice(0, 3)}
                </div>
              )}
            </div>
            <span
              style={{
                fontFamily: "monospace",
                fontWeight: 800,
                fontSize: "0.95rem",
                color: textClr,
              }}
            >
              {selectedPair.label}
            </span>
            <ChevronDown size={13} style={{ color: muted }} />
          </button>
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: 800,
              fontSize: "1.2rem",
              color: isUp ? "#34d399" : "#f87171",
              flexShrink: 0,
            }}
          >
            ${priceData ? fmtPrice(priceData.price) : "—"}
          </span>
          <span
            style={{
              fontSize: "0.74rem",
              fontWeight: 700,
              fontFamily: "monospace",
              color: isUp ? "#34d399" : "#f87171",
              padding: "2px 8px",
              borderRadius: 6,
              flexShrink: 0,
              background: isUp
                ? "rgba(52,211,153,0.1)"
                : "rgba(248,113,113,0.1)",
            }}
          >
            {priceData
              ? `${isUp ? "+" : ""}${priceData.change24h?.toFixed(2)}%`
              : "—"}
          </span>
          {[
            {
              label: t("high"),
              value: priceData ? `$${fmtPrice(priceData.high24h)}` : "—",
            },
            {
              label: t("low"),
              value: priceData ? `$${fmtPrice(priceData.low24h)}` : "—",
            },
          ].map((s) => (
            <div key={s.label} style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
              <div
                style={{ color: muted, fontSize: "0.6rem", marginBottom: 1 }}
              >
                {s.label}
              </div>
              <div
                style={{
                  color: textClr,
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  fontFamily: "monospace",
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP 3-col */}
        <div
          className="trade-desktop"
          style={{
            gridTemplateColumns: "1fr 256px 280px",
            height: "calc(100vh - 196px)",
            minHeight: 500,
          }}
        >
          <div
            style={{
              position: "relative",
              background: darkMode ? "#0a1020" : "#fff",
              borderRight: `1px solid ${border}`,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
              <TVChart
                symbol={selectedPair.symbol}
                darkMode={darkMode}
                assetClass={selectedPair.assetClass}
                height="100%"
              />
            </div>
          </div>
          <div
            style={{
              background: cardBg,
              borderRight: `1px solid ${border}`,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <OrderBookPanel {...obProps} />
          </div>
          <div
            style={{
              background: cardBg,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <TradePanel {...tpProps} />
          </div>
        </div>

        {/*  MOBILE layout  */}
        <div className="trade-mobile">
          <div
            style={{
              position: "relative",
              width: "100%",
              height: MOBILE_CHART_HEIGHT,
              minHeight: MOBILE_CHART_HEIGHT,
              background: darkMode ? "#0a1020" : "#fff",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <TVChart
              symbol={selectedPair.symbol}
              darkMode={darkMode}
              assetClass={selectedPair.assetClass}
              height={MOBILE_CHART_HEIGHT}
            />
          </div>

          {/* Stats strip */}
          <div
            style={{
              display: "flex",
              background: cardBg,
              borderTop: `1px solid ${border}`,
              borderBottom: `1px solid ${border}`,
              padding: "10px 16px",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div>
              <div
                style={{ color: muted, fontSize: "0.6rem", marginBottom: 2 }}
              >
                {t("high")}
              </div>
              <div
                style={{
                  color: "#34d399",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  fontFamily: "monospace",
                }}
              >
                {priceData ? `$${fmtPrice(priceData.high24h)}` : "—"}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ color: muted, fontSize: "0.6rem", marginBottom: 2 }}
              >
                {t("change")}
              </div>
              <div
                style={{
                  color: isUp ? "#34d399" : "#f87171",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  fontFamily: "monospace",
                }}
              >
                {priceData
                  ? `${isUp ? "+" : ""}${priceData.change24h?.toFixed(2)}%`
                  : "—"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{ color: muted, fontSize: "0.6rem", marginBottom: 2 }}
              >
                {t("low")}
              </div>
              <div
                style={{
                  color: "#f87171",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  fontFamily: "monospace",
                }}
              >
                {priceData ? `$${fmtPrice(priceData.low24h)}` : "—"}
              </div>
            </div>
          </div>

          {/* Collapsible Order Book */}
          <div
            style={{ background: cardBg, borderBottom: `1px solid ${border}` }}
          >
            <button
              onClick={() => setObExpanded((v) => !v)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 16px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  color: textClr,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                }}
              >
                {t("order_book")}
              </span>
              <ChevronDown
                size={14}
                style={{
                  color: muted,
                  transition: "transform 0.22s",
                  transform: obExpanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
            <div
              style={{
                overflow: "hidden",
                maxHeight: obExpanded ? 320 : 0,
                transition: "max-height 0.28s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              <div
                style={{
                  height: 320,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <OrderBookPanel {...obProps} />
              </div>
            </div>
          </div>

          {/* Trade panel */}
          <div
            style={{
              background: cardBg,
              display: "flex",
              flexDirection: "column",
              borderTop: `1px solid ${border}`,
            }}
          >
            <div
              style={{
                padding: "11px 16px 0",
                borderBottom: `1px solid ${divLine}`,
              }}
            >
              <span
                style={{
                  color: textClr,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                }}
              >
                {t("place_order")}
              </span>
            </div>
            <TradePanel {...tpProps} />
          </div>
        </div>

        {/* Orders panel */}
        <div
          style={{
            background: cardBg,
            borderTop: `1px solid ${border}`,
            padding: "0 14px",
          }}
        >
          <div
            style={{ display: "flex", borderBottom: `1px solid ${divLine}` }}
          >
            {[
              {
                key: "open",
                label: `${t("open")} (${openOrders.filter((o) => o.status === "filled").length})`,
              },
              {
                key: "pending",
                label: `${t("pending")} (${openOrders.filter((o) => o.status === "pending").length})`,
              },
              { key: "history", label: t("history") },
            ].map((tItem) => (
              <button
                key={tItem.key}
                onClick={() => setOrdersTab(tItem.key)}
                style={{
                  padding: "12px 14px",
                  border: "none",
                  borderBottom:
                    ordersTab === tItem.key
                      ? "2px solid #f59e0b"
                      : "2px solid transparent",
                  background: "transparent",
                  color: ordersTab === t.key ? "#f59e0b" : muted,
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {tItem.label}
              </button>
            ))}
            <button
              onClick={fetchOrders}
              style={{
                marginLeft: "auto",
                padding: "12px 8px",
                border: "none",
                background: "transparent",
                color: muted,
                cursor: "pointer",
              }}
            >
              <RefreshCw style={{ width: 13, height: 13 }} />
            </button>
          </div>
          <div className="thin-scroll" style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 640 }}>
              <div
                style={{
                  display: "grid",

                  gridTemplateColumns:
                    "80px 100px 44px 60px 100px 76px 80px 88px 80px",
                  gap: 8,
                  padding: "8px 0",
                  color: muted,
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  borderBottom: `1px solid ${divLine}`,
                  whiteSpace: "nowrap",
                }}
              >
                <div>{t("time")}</div>
                <div>{t("symbol")}</div>
                <div>{t("side")}</div>
                <div>{t("entry")}</div>
                <div>{t("qty")}</div>
                <div>{t("lev")}</div>
                <div>{t("pnl")}</div>
                <div>{t("status")}</div>
                <div style={{ textAlign: "right" }}>{t("action")}</div>
              </div>
              {ordersLoading ? (
                <div
                  style={{
                    padding: "20px 0",
                    textAlign: "center",
                    color: muted,
                    fontSize: "0.82rem",
                  }}
                >
                  {t("loading")}
                </div>
              ) : (
                (() => {
                  const rows =
                    ordersTab === "open"
                      ? openOrders.filter((o) => o.status === "filled")
                      : ordersTab === "pending"
                        ? openOrders.filter((o) => o.status === "pending")
                        : orderHistory;
                  if (!rows.length)
                    return (
                      <div
                        style={{
                          padding: "24px 0",
                          textAlign: "center",
                          color: muted,
                          fontSize: "0.82rem",
                        }}
                      >
                        {ordersTab === "history"
                          ? t("no_order_history")
                          : ordersTab === "open"
                            ? t("no_open_orders")
                            : t("no_pending_orders")}
                      </div>
                    );
                  return rows.map((o, i) => {
                    const pnl = o.unrealizedPnl ?? o.pnl ?? o.profit ?? 0;
                    const sideColor = o.side === "buy" ? "#34d399" : "#f87171";
                    const statusColors = {
                      filled: "#34d399",
                      open: "#60a5fa",
                      pending: "#f59e0b",
                      cancelled: "#64748b",
                      failed: "#f87171",
                      closed: "#34d399",
                      liquidated: "#f87171",
                    };
                    const statusColor = statusColors[o.status] || "#64748b";
                    const entryPrice =
                      o.filledPrice || o.entryPrice || o.price || 0;
                    const time = new Date(
                      o.createdAt || o.filledAt || o.openedAt,
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <div
                        key={o._id || i}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "80px 100px 44px 60px 100px 76px 80px 88px 80px",
                          gap: 8,
                          padding: "10px 0",
                          borderBottom:
                            i < rows.length - 1
                              ? `1px solid ${divLine}`
                              : "none",
                          alignItems: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div style={{ color: muted, fontSize: "0.72rem" }}>
                          {time}
                        </div>
                        <div
                          style={{
                            color: textClr,
                            fontFamily: "monospace",
                            fontWeight: 600,
                            fontSize: "0.78rem",
                          }}
                        >
                          {o.symbol}
                        </div>
                        <div
                          style={{
                            color: sideColor,
                            fontWeight: 700,
                            fontSize: "0.73rem",
                            textTransform: "uppercase",
                          }}
                        >
                          {o.side === "buy" ? t("buy") : t("sell")}
                        </div>
                        <div
                          style={{
                            color: textClr,
                            fontFamily: "monospace",
                            fontSize: "0.75rem",
                          }}
                        >
                          {fmtUSD(entryPrice)}
                        </div>
                        <div
                          style={{
                            color: muted,
                            fontFamily: "monospace",
                            fontSize: "0.73rem",
                          }}
                        >
                          {o.quantity || o.amountInvested || "—"}
                        </div>
                        <div
                          style={{
                            color: "#f59e0b",
                            fontFamily: "monospace",
                            fontWeight: 600,
                            fontSize: "0.73rem",
                          }}
                        >
                          {o.leverage > 1 ? `${o.leverage}×` : "—"}
                        </div>
                        <div
                          style={{
                            color: pnl >= 0 ? "#34d399" : "#f87171",
                            fontFamily: "monospace",
                            fontWeight: 600,
                            fontSize: "0.73rem",
                          }}
                        >
                          {ordersTab === "open" || pnl !== 0
                            ? (pnl >= 0 ? "+" : "") + fmtUSD(pnl)
                            : "—"}
                        </div>
                        <div>
                          <span
                            style={{
                              fontSize: "0.64rem",
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: 5,
                              background: `${statusColor}18`,
                              color: statusColor,
                            }}
                          >
                            {o.status === "open"
                              ? t("open")
                              : o.status === "filled"
                                ? t("filled")
                                : o.status === "pending"
                                  ? t("pending")
                                  : o.status === "cancelled"
                                    ? t("cancelled")
                                    : o.status === "failed"
                                      ? t("failed")
                                      : o.status === "closed"
                                        ? t("closed")
                                        : o.status === "liquidated"
                                          ? t("liquidated")
                                          : o.status}
                          </span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          {o.status === "filled" &&
                            ordersTab === "open" &&
                            o.source !== "bot" &&
                            o.source !== "copy" && (
                              <button
                                onClick={() => closePosition(o._id)}
                                disabled={closing === o._id}
                                style={{
                                  padding: "3px 10px",
                                  borderRadius: 6,
                                  border: "1px solid rgba(248,113,113,0.4)",
                                  background: "rgba(248,113,113,0.08)",
                                  color: "#f87171",
                                  fontSize: "0.65rem",
                                  fontWeight: 700,
                                  cursor:
                                    closing === o._id
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity: closing === o._id ? 0.6 : 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 4,
                                  minWidth: 52,
                                }}
                              >
                                {closing === o._id ? (
                                  <>
                                    <Spinner size={10} color="#f87171" />
                                    <span>{t("closing")}</span>
                                  </>
                                ) : (
                                  t("close")
                                )}
                              </button>
                            )}
                          {o.status === "pending" && (
                            <button
                              onClick={() => cancelOrder(o._id)}
                              disabled={closing === o._id}
                              style={{
                                padding: "3px 10px",
                                borderRadius: 6,
                                border: "1px solid rgba(248,113,113,0.4)",
                                background: "rgba(248,113,113,0.08)",
                                color: "#f87171",
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                cursor:
                                  closing === o._id ? "not-allowed" : "pointer",
                                opacity: closing === o._id ? 0.6 : 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4,
                                minWidth: 52,
                              }}
                            >
                              {closing === o._id ? (
                                <>
                                  <Spinner size={10} color="#f87171" />
                                  <span>{t("cancelling")}</span>
                                </>
                              ) : (
                                t("cancel")
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
