import React, { useState, useEffect } from "react";
import { Bell, X, TrendingUp, TrendingDown } from "lucide-react";

const TRADE_ALERTS = [
  { user: "0x742d...3e4a", amount: 2.5, type: "buy", asset: "BTC", price: 87991 },
  { user: "0x943f...2b1c", amount: 150, type: "sell", asset: "ETH", price: 3245 },
  { user: "0x123a...9f8b", amount: 500, type: "buy", asset: "SOL", price: 187 },
];

export default function LiveTradeAlert() {
  const [alerts, setAlerts] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Simulate live trades
    let index = 0;
    const interval = setInterval(() => {
      const newAlert = TRADE_ALERTS[index % TRADE_ALERTS.length];
      setAlerts((prev) => [newAlert, ...prev].slice(0, 5));
      setShow(true);
      index++;
      
      setTimeout(() => setShow(false), 5000);
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  if (!show || alerts.length === 0) return null;

  const latestAlert = alerts[0];
  if (!latestAlert) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="glass rounded-xl p-4 max-w-sm shadow-2xl border border-yellow-500/30">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <Bell className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Live Trade Alert
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {latestAlert.user} {latestAlert.type === "buy" ? "bought" : "sold"}{" "}
              {latestAlert.amount} {latestAlert.asset} at ${latestAlert.price.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}