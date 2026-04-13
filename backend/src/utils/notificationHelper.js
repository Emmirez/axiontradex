// backend/src/utils/notificationHelper.js
import { createNotification } from "../controllers/notificationController.js";

// Icon mapping for different notification types
const ICON_MAP = {
  deposit: { icon: "ArrowDownCircle", color: "#34d399" },
  withdrawal: { icon: "ArrowUpCircle", color: "#f87171" },
  trade: { icon: "Activity", color: "#a78bfa" },
  trading: { icon: "Activity", color: "#a78bfa" },
  security: { icon: "Shield", color: "#60a5fa" },
  kyc: { icon: "Star", color: "#f59e0b" },
  settings: { icon: "Settings", color: "#94a3b8" },
  referral: { icon: "Share2", color: "#f59e0b" },
  system: { icon: "Bell", color: "#60a5fa" },
  investment: { icon: "TrendingUp", color: "#34d399" },
  profit: { icon: "TrendingUp", color: "#34d399" },
  refund: { icon: "ArrowUpCircle", color: "#f87171" },
  swap: { icon: "Repeat2", color: "#a78bfa" },
  wallet: { icon: "Wallet", color: "#60a5fa" },
};

export const sendNotification = async (
  userId,
  type,
  title,
  body,
  metadata = {},
  actionUrl = null,
) => {
  const iconConfig = ICON_MAP[type] || ICON_MAP.system;

  return await createNotification(userId, {
    type,
    title,
    body,
    icon: iconConfig.icon,
    iconColor: iconConfig.color,
    metadata,
    actionUrl,
  });
};

// Helper to send notifications to multiple users
export const sendBulkNotification = async (
  userIds,
  type,
  title,
  body,
  metadata = {},
  actionUrl = null,
) => {
  const iconConfig = ICON_MAP[type] || ICON_MAP.system;

  const notifications = userIds.map((userId) => ({
    user: userId,
    type,
    title,
    body,
    icon: iconConfig.icon,
    iconColor: iconConfig.color,
    metadata,
    actionUrl,
  }));

  return await Notification.insertMany(notifications);
};
