import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  ArrowRight,
  TrendingUp,
  Shield,
  Bot,
  DollarSign,
  Loader2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { FeaturePage, FeatureHero } from "../features/FeatureLayout";
import { useTranslation } from "react-i18next";

export default function Blog() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const CATEGORIES = [
    t("all"),
    t("bitcoin"),
    t("ethereum"),
    t("trading"),
    t("defi"),
    t("regulation"),
    t("altcoins"),
    t("markets"),
  ];

  // Map RSS categories to our categories
  const categoryMapping = {
    Bitcoin: ["bitcoin", "btc"],
    Ethereum: ["ethereum", "eth"],
    Trading: ["trading", "technical analysis", "strategy"],
    DeFi: ["defi", "decentralized finance", "yield"],
    Regulation: ["regulation", "sec", "legal", "policy"],
    Altcoins: ["altcoin", "solana", "cardano", "polygon", "alt coins"],
    Markets: ["market", "price", "volume", "analysis"],
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      // Fetch from multiple RSS feeds
      const sources = [
        "https://cointelegraph.com/rss",
        "https://coindesk.com/arc/outboundfeeds/rss/",
        "https://decrypt.co/feed",
      ];

      const allArticles = [];

      for (const source of sources) {
        try {
          const response = await fetch(
            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source)}`,
          );
          const data = await response.json();

          if (data.status === "ok" && data.items) {
            data.items.forEach((item) => {
              const categories = determineCategories(
                item.categories || [],
                item.title,
                item.description,
              );
              allArticles.push({
                id: item.guid || Math.random().toString(),
                title: item.title,
                category: categories[0] || "Markets",
                allCategories: categories,
                readTime: calculateReadTime(
                  item.description || item.content || "",
                ),
                date: new Date(item.pubDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                excerpt:
                  (item.description || "")
                    .replace(/<[^>]*>/g, "")
                    .slice(0, 180) + "...",
                link: item.link,
                source: source.includes("cointelegraph")
                  ? "CoinTelegraph"
                  : source.includes("coindesk")
                    ? "CoinDesk"
                    : "Decrypt",
                featured: Math.random() > 0.8, // Randomly feature some articles
                icon: getIconForCategory(categories[0]),
                color: getColorForCategory(categories[0]),
              });
            });
          }
        } catch (err) {
          console.error(`Failed to fetch from ${source}:`, err);
        }
      }

      // Remove duplicates by title
      const uniqueArticles = allArticles.filter(
        (article, index, self) =>
          index === self.findIndex((a) => a.title === article.title),
      );

      // Sort by date (newest first)
      uniqueArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

      setPosts(uniqueArticles.slice(0, 24)); // Limit to 24 articles
      setError(null);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setError("Unable to load articles. Please try again later.");
      // Fallback to mock data
      setPosts(getFallbackPosts());
    } finally {
      setLoading(false);
    }
  };

  const determineCategories = (rssCategories, title, description) => {
    const text = `${title} ${description}`.toLowerCase();
    const matchedCategories = [];

    for (const [category, keywords] of Object.entries(categoryMapping)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        matchedCategories.push(category);
      }
    }

    return matchedCategories.length > 0 ? matchedCategories : [t("markets")];
  };

  const calculateReadTime = (text) => {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min`;
  };

  const getIconForCategory = (category) => {
    switch (category) {
      case "Bitcoin":
      case "Ethereum":
      case "Altcoins":
        return TrendingUp;
      case "Trading":
        return TrendingUp;
      case "DeFi":
        return DollarSign;
      case "Regulation":
        return Shield;
      default:
        return BookOpen;
    }
  };

  const getColorForCategory = (category) => {
    switch (category) {
      case "Bitcoin":
        return "#f59e0b";
      case "Ethereum":
        return "#60a5fa";
      case "Trading":
        return "#34d399";
      case "DeFi":
        return "#a78bfa";
      case "Regulation":
        return "#f87171";
      case "Altcoins":
        return "#14b8a6";
      default:
        return "#f59e0b";
    }
  };
  const getFallbackPosts = () => {
    return [
      {
        id: 1,
        title: t("fallback_blog_1_title"),
        category: "Bitcoin",
        readTime: "5 min",
        date: "Mar 20, 2026",
        excerpt: t("fallback_blog_1_excerpt"),
        link: "#",
        source: "CoinTelegraph",
        featured: true,
        icon: TrendingUp,
        color: "#f59e0b",
      },
      {
        id: 2,
        title: t("fallback_blog_2_title"),
        category: "Ethereum",
        readTime: "4 min",
        date: "Mar 19, 2026",
        excerpt: t("fallback_blog_2_excerpt"),
        link: "#",
        source: "CoinDesk",
        featured: true,
        icon: TrendingUp,
        color: "#60a5fa",
      },
      {
        id: 3,
        title: t("fallback_blog_3_title"),
        category: "Regulation",
        readTime: "6 min",
        date: "Mar 18, 2026",
        excerpt: t("fallback_blog_3_excerpt"),
        link: "#",
        source: "Decrypt",
        featured: false,
        icon: Shield,
        color: "#f87171",
      },
      {
        id: 4,
        title: t("fallback_blog_4_title"),
        category: "Altcoins",
        readTime: "3 min",
        date: "Mar 17, 2026",
        excerpt: t("fallback_blog_4_excerpt"),
        link: "#",
        source: "CoinTelegraph",
        featured: false,
        icon: TrendingUp,
        color: "#14b8a6",
      },
    ];
  };

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter(
          (post) =>
            post.allCategories?.includes(activeCategory) ||
            post.category === activeCategory,
        );

  const featuredPosts = filteredPosts.filter((p) => p.featured);
  const regularPosts = filteredPosts.filter((p) => !p.featured);

  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const mutedClr = darkMode ? "#64748b" : "#94a3b8";
  const border = "rgba(245,158,11,0.18)";

  function PostCard({ post, large = false }) {
    const cardBg = darkMode ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.95)";
    const Icon = post.icon;

    return (
      <a
        href={post.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 20,
            overflow: "hidden",
            transition: "all 0.3s",
            display: "flex",
            flexDirection: "column",
            cursor: "pointer",
            height: "100%",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(245,158,11,0.35)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = border;
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {/* Colour band */}
          <div
            style={{
              height: 4,
              background: `linear-gradient(90deg, ${post.color}, ${post.color}88)`,
            }}
          />

          <div
            style={{
              padding: large ? "28px" : "22px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Meta row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: `${post.color}18`,
                  color: post.color,
                }}
              >
                {post.category}
              </span>
              <span
                style={{
                  color: mutedClr,
                  fontSize: "0.68rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Clock style={{ width: 10, height: 10 }} />
                {post.readTime} read
              </span>
              <span
                style={{
                  color: mutedClr,
                  fontSize: "0.68rem",
                  marginLeft: "auto",
                }}
              >
                {post.date}
              </span>
            </div>

            {/* Title */}
            <h3
              style={{
                color: textClr,
                fontWeight: 700,
                fontSize: large ? "1.2rem" : "0.95rem",
                lineHeight: 1.4,
                marginBottom: 10,
                fontFamily: '"Playfair Display",serif',
              }}
            >
              {post.title}
            </h3>

            {/* Excerpt */}
            <p
              style={{
                color: mutedClr,
                fontSize: "0.82rem",
                lineHeight: 1.6,
                flex: 1,
                marginBottom: 16,
              }}
            >
              {post.excerpt}
            </p>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: post.color,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {t("read_article")}{" "}
                <ArrowRight style={{ width: 13, height: 13 }} />
              </div>
              <span style={{ fontSize: "0.65rem", color: mutedClr }}>
                {post.source}
              </span>
            </div>
          </div>
        </div>
      </a>
    );
  }

  return (
    <FeaturePage>
      <FeatureHero
        badge={t("blog")}
        title={t("trading_insights")}
        highlight={t("market_intelligence")}
        subtitle={t("blog_subtitle")}
        icon={BookOpen}
      />

      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 60px" }}
      >
        {/* Loading State */}
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "80px",
            }}
          >
            <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            <span style={{ color: mutedClr, marginLeft: 12 }}>
             {t('loading_articles')}
            </span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <p style={{ color: "#f87171", marginBottom: 16 }}>{error}</p>
            <button
              onClick={fetchArticles}
              className="gold-btn"
              style={{
                padding: "10px 24px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
              }}
            >
               {t('try_again')}
            </button>
          </div>
        )}

        {/* Articles */}
        {!loading && posts.length > 0 && (
          <>
            {/* Featured articles */}
            {featuredPosts.length > 0 && (
              <>
                <h2
                  style={{
                    fontFamily: '"Playfair Display",serif',
                    fontWeight: 700,
                    fontSize: "1.4rem",
                    color: textClr,
                    marginBottom: 20,
                  }}
                >
                   {t('featured_articles')} <span className="gold-text">{t("articles")}</span>
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: 16,
                    marginBottom: 48,
                  }}
                >
                  {featuredPosts.slice(0, 3).map((p) => (
                    <PostCard key={p.id} post={p} large />
                  ))}
                </div>
              </>
            )}

            {/* Category filter */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 24,
              }}
            >
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: `1px solid ${activeCategory === c ? "rgba(245,158,11,0.5)" : border}`,
                    background:
                      activeCategory === c
                        ? "rgba(245,158,11,0.12)"
                        : "transparent",
                    color: activeCategory === c ? "#f59e0b" : mutedClr,
                    transition: "all 0.2s",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Posts grid */}
            {regularPosts.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                {regularPosts.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 24px" }}>
                <p style={{ color: mutedClr, fontSize: "0.9rem" }}>
                  {t('no_posts_found')}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </FeaturePage>
  );
}
