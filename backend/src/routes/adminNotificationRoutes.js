// backend/src/routes/adminNotificationRoutes.js
import express from "express";
import * as adminNotificationController from "../controllers/adminNotificationController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/", adminNotificationController.getAdminNotifications);
router.get("/unread-count", adminNotificationController.getUnreadCount);
router.patch("/:id/read", adminNotificationController.markAsRead);
router.patch("/read-all", adminNotificationController.markAllAsRead);
router.delete("/:id", adminNotificationController.deleteNotification);

export default router;
