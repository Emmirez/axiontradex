import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useTranslation } from 'react-i18next'

const API_URL = "https://api.alternative.me/fng/";

export default function FearGreedIndex() {
  const { t } = useTranslation()
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3600000); // Update every hour
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      setData(result.data[0]);
      setLoading(false);
    } catch (err) {
      setError(t("failed_to_load"));
      setLoading(false);
    }
  };

  const getColor = (value) => {
    const num = parseInt(value);
    if (num <= 25) return "text-red-500";
    if (num <= 45) return "text-orange-500";
    if (num <= 55) return "text-yellow-500";
    if (num <= 75) return "text-green-400";
    return "text-green-600";
  };

  const getBgColor = (value) => {
    const num = parseInt(value);
    if (num <= 25) return "bg-red-500";
    if (num <= 45) return "bg-orange-500";
    if (num <= 55) return "bg-yellow-500";
    if (num <= 75) return "bg-green-400";
    return "bg-green-600";
  };

  if (loading) {
    return (
      <div className="card p-6 rounded-2xl text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !data) return null;

  const value = parseInt(data.value);
  const label = data.value_classification; 
  const color = getColor(value);
  const bgColor = getBgColor(value);

  return (
    <div className="card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
           {t("crypto_fear_greed")}
        </h3>
        <AlertTriangle className="w-4 h-4 text-yellow-500" />
      </div>
      
      <div className="text-center mb-4">
        <div className={`text-4xl font-bold ${color} mb-2`}>
          {value}
        </div>
        <div className={`text-sm font-medium ${color}`}>
          {label}
        </div>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`${bgColor} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
        <span>{t("fear")}</span>
        <span>{t("neutral")}</span>
        <span>{t("greed")}</span>
      </div>
    </div>
  );
}