import {
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  TrendingUp,
  BarChart3,
} from "lucide-react";

// Mock Data
export const MOCK_STATS = {
  balance: 12845.5,
  locked: 1200.0,
  totalPnl: 2340.8,
  totalTrades: 142,
  openTrades: 3,
  winRate: 68.3,
};

export const MOCK_TRADES = [
  {
    id: 1,
    symbol: "BTC/USDT",
    side: "buy",
    status: "filled",
    pnl: 420.3,
    quantity: 0.05,
    filledPrice: 87420,
    createdAt: "2025-03-15T10:22:00Z",
  },
  {
    id: 2,
    symbol: "ETH/USDT",
    side: "sell",
    status: "filled",
    pnl: -120.5,
    quantity: 0.8,
    filledPrice: 3510,
    createdAt: "2025-03-14T08:15:00Z",
  },
  {
    id: 3,
    symbol: "SOL/USDT",
    side: "buy",
    status: "pending",
    pnl: 0,
    quantity: 5,
    filledPrice: null,
    createdAt: "2025-03-13T14:55:00Z",
  },
  {
    id: 4,
    symbol: "BNB/USDT",
    side: "buy",
    status: "filled",
    pnl: 85.2,
    quantity: 1.5,
    filledPrice: 594,
    createdAt: "2025-03-12T11:30:00Z",
  },
  {
    id: 5,
    symbol: "ADA/USDT",
    side: "sell",
    status: "cancelled",
    pnl: 0,
    quantity: 500,
    filledPrice: null,
    createdAt: "2025-03-11T09:00:00Z",
  },
];

export const MOCK_TRANSACTIONS = [
  {
    id: 1,
    type: "deposit",
    status: "completed",
    amount: 5000,
    currency: "USDT",
    createdAt: "2025-03-15T08:00:00Z",
  },
  {
    id: 2,
    type: "trade",
    status: "completed",
    amount: 420,
    currency: "USDT",
    createdAt: "2025-03-14T10:00:00Z",
  },
  {
    id: 3,
    type: "withdrawal",
    status: "pending",
    amount: 1000,
    currency: "USDT",
    createdAt: "2025-03-13T16:00:00Z",
  },
  {
    id: 4,
    type: "bonus",
    status: "completed",
    amount: 50,
    currency: "USDT",
    createdAt: "2025-03-10T12:00:00Z",
  },
];

export const statusColor = (s) =>
  ({
    filled: "#34d399",
    pending: "#f59e0b",
    cancelled: "#64748b",
    failed: "#f87171",
    completed: "#34d399",
  })[s] || "#64748b";

export const txIcon = (type) =>
  ({
    deposit: ArrowDownCircle,
    withdrawal: ArrowUpCircle,
    trade: Activity,
    bonus: TrendingUp,
    fee: BarChart3,
  })[type] || Activity;

export const txColor = (type) =>
  ({
    deposit: "#34d399",
    withdrawal: "#f87171",
    trade: "#60a5fa",
    bonus: "#f59e0b",
  })[type] || "#94a3b8";
