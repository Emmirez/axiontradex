import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";
import tradeRoutes from "./routes/tradeRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminNotificationRoutes from "./routes/adminNotificationRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import investmentRoutes from "./routes/investmentRoutes.js";
import copyTradingRoutes from "./routes/copyTradingRoutes.js";
import signalRoutes from "./routes/signalRoutes.js";
import demoTradingRoutes from "./routes/demoTradingRoutes.js";
import botRoutes from "./routes/botRoutes.js";
import swapRoutes from './routes/swapRoutes.js'
import goldRoutes from "./routes/goldRoutes.js";

const app = express();

app.use(helmet());

app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== "object") return;
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        sanitize(obj[key]);
      }
    }
  };
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  next();
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 500 : 1000,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  skip: (req) => req.path.startsWith("/markets"),
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 20 : 200,
  message: {
    success: false,
    message: "Too many auth attempts, please try again later.",
  },
  skip: () => process.env.NODE_ENV === "development",
});

app.use("/api", globalLimiter);
app.use("/api/auth", authLimiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AxionTrade API is running",
    timestamp: new Date(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/markets", marketRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/copy-trading", copyTradingRoutes);
app.use("/api/signals", signalRoutes);
app.use("/api/demo-trading", demoTradingRoutes);
app.use("/api/bots", botRoutes);
app.use('/api/swap', swapRoutes)
app.use("/api/gold", goldRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
