import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  Calendar,
  Loader2,
  Newspaper,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LiveNews() {
  const { t } = useTranslation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get("/news/crypto"); 

      if (data.articles && data.articles.length > 0) {
        const formattedNews = data.articles.map((article) => ({
          title: article.title,
          link: article.url,
          pubDate: article.publishedAt,
          description:
            article.description ||
            article.content?.slice(0, 150) ||
            "Read more about this crypto news update...",
          creator: article.author || "Crypto News",
          source: article.source.name,
          image: article.urlToImage,
        }));

        setNews(formattedNews);
        setLastUpdated(new Date());
      } else {
        throw new Error("No articles found");
      }
    } catch (err) {
      console.error("News fetch error:", err);
      setError("Unable to fetch live news");
      setNews(getFallbackNews());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackNews = () => {
    return [
      {
        title: t("fallback_news_1_title"),
        link: "#",
        pubDate: new Date().toISOString(),
        description: t("fallback_news_1_desc"),
        creator: t("market_analyst"),
        source: t("crypto_news"),
      },
      {
        title: t("fallback_news_2_title"),
        link: "#",
        pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        description: t("fallback_news_2_desc"),
        creator: t("tech_reporter"),
        source: t("crypto_news"),
      },
      {
        title: t("fallback_news_3_title"),
        link: "#",
        pubDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        description: t("fallback_news_3_desc"),
        creator: t("regulatory_desk"),
        source: t("crypto_news"),
      },
      {
        title: t("fallback_news_4_title"),
        link: "#",
        pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        description: t("fallback_news_4_desc"),
        creator: t("defi_analyst"),
        source: t("crypto_news"),
      },
      {
        title: t("fallback_news_5_title"),
        link: "#",
        pubDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        description: t("fallback_news_5_desc"),
        creator: t("nft_reporter"),
        source: t("crypto_news"),
      },
      {
        title: t("fallback_news_6_title"),
        link: "#",
        pubDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        description: t("fallback_news_6_desc"),
        creator: t("business_desk"),
        source: t("crypto_news"),
      },
    ];
  };

  useEffect(() => {
    fetchNews();

    // Refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  return (
    <section className="section-base py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 mb-4">
            <Newspaper className="w-4 h-4" />
            <span className="text-sm font-medium">{t("live_crypto_news")}</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            {t("market")} <span className="gold-text">{t("updates")}</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t("news_subtitle")}
          </p>
        </div>

        {/* Last Updated */}
        {lastUpdated && !loading && !error && (
          <div className="text-center mb-6">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("last_updated")}: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        )}

        {/* News Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Fetching latest news...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-10 h-10 text-yellow-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              {error}
            </p>
            <button
              onClick={fetchNews}
              className="gold-btn px-6 py-2 rounded-lg text-sm font-medium"
            >
              {t("retry")}
            </button>
            <p className="text-xs text-gray-400 mt-4">
              {t("showing_highlights")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group card rounded-2xl p-6 hover:scale-[1.02] transition-all cursor-pointer hover:shadow-xl"
              >
                {/* Source Badge */}
                {item.source && (
                  <div className="mb-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                      {item.source}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-yellow-500 transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                  {item.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.pubDate)}</span>
                  </div>
                  <div className="flex items-center gap-1 group-hover:text-yellow-500">
                    <span>{t("read_more")}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
