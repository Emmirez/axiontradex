export const getNews = async (req, res) => {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=cryptocurrency&language=en&sortBy=publishedAt&pageSize=12&apiKey=${process.env.NEWS_API_KEY}`
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("News fetch error:", err);
    res.status(500).json({ error: "Failed to fetch news" });
  }
};