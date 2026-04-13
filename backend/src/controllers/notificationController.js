// backend/src/controllers/notificationController.js
import Notification from "../models/NotificationModel.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/responseUtils.js";

// Get user's notifications
export const getUserNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { type, unread } = req.query;

    const filter = { user: req.user._id };
    if (type && type !== "all") filter.type = type;
    if (unread === "true") filter.read = false;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filter),
    ]);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });

    return successResponse(res, 200, "Notifications fetched", {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return errorResponse(res, 404, "Notification not found");
    }

    return successResponse(res, 200, "Notification marked as read", { notification });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    return successResponse(res, 200, "All notifications marked as read");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return errorResponse(res, 404, "Notification not found");
    }

    return successResponse(res, 200, "Notification deleted");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });

    return successResponse(res, 200, "Unread count fetched", { count });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Admin: Send notification to user(s)
export const sendNotification = async (req, res) => {
  try {
    const { userIds, type, title, body, icon, iconColor, actionUrl } = req.body;

    if (!userIds || !userIds.length || !title || !body) {
      return errorResponse(res, 400, "User IDs, title, and body are required");
    }

    const notifications = userIds.map((userId) => ({
      user: userId,
      type: type || "system",
      title,
      body,
      icon: icon || "Bell",
      iconColor: iconColor || "#f59e0b",
      actionUrl,
    }));

    await Notification.insertMany(notifications);

    return successResponse(res, 201, `Notifications sent to ${userIds.length} user(s)`);
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Admin: Get all notifications (admin view)
export const getAllNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.userId) filter.user = req.query.userId;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate("user", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filter),
    ]);

    return paginatedResponse(res, "Notifications fetched", notifications, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Helper function to create notification (used by other services)
export const createNotification = async (userId, data) => {
  try {
    const notification = await Notification.create({
      user: userId,
      ...data,
    });
     console.log("Notification created:", notification._id); // Add debug log
    return notification;
  } catch (err) {
    console.error("Failed to create notification:", err);
    return null;
  }
};