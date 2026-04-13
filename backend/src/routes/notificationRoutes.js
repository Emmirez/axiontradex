// backend/src/routes/notificationRoutes.js
import express from "express";
import { body } from "express-validator";
import * as notificationController from "../controllers/notificationController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

// User routes (protected)
router.use(protect);

router.get("/", notificationController.getUserNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/:id/read", notificationController.markAsRead);
router.patch("/read-all", notificationController.markAllAsRead);
router.delete("/:id", notificationController.deleteNotification);

// Admin routes
router.get("/admin/all", adminOnly, notificationController.getAllNotifications);
router.post(
  "/admin/send",
  adminOnly,
  [
    body("userIds").isArray().withMessage("User IDs must be an array"),
    body("title").notEmpty().withMessage("Title is required"),
    body("body").notEmpty().withMessage("Body is required"),
  ],
  validate,
  notificationController.sendNotification,
);

export default router;
