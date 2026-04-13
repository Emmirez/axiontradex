import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/crypto", async (req, res) => {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=cryptocurrency+OR+bitcoin+OR+ethereum&language=en&sortBy=publishedAt&pageSize=12&apiKey=${process.env.NEWS_API_KEY}`,
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

export default router;
