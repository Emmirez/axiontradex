import AdminNotification from "../models/AdminNotificationModel.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../utils/responseUtils.js";

// Get all admin notifications
export const getAdminNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.type) filter.type = req.query.type;
    if (req.query.read === "true") filter.read = true;
    if (req.query.read === "false") filter.read = false;

    const [notifications, total] = await Promise.all([
      AdminNotification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AdminNotification.countDocuments(filter),
    ]);

    const unreadCount = await AdminNotification.countDocuments({ read: false });

    return successResponse(res, 200, "Admin notifications fetched", {
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

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await AdminNotification.countDocuments({ read: false });
    return successResponse(res, 200, "Unread count fetched", { count });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await AdminNotification.findByIdAndUpdate(
      req.params.id,
      { read: true, readAt: new Date(), readBy: req.user._id },
      { new: true },
    );

    if (!notification) {
      return errorResponse(res, 404, "Notification not found");
    }

    return successResponse(res, 200, "Notification marked as read", {
      notification,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    await AdminNotification.updateMany(
      { read: false },
      { read: true, readAt: new Date(), readBy: req.user._id },
    );

    return successResponse(res, 200, "All notifications marked as read");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await AdminNotification.findByIdAndDelete(
      req.params.id,
    );
    if (!notification) {
      return errorResponse(res, 404, "Notification not found");
    }
    return successResponse(res, 200, "Notification deleted");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Helper function to create admin notification
export const createAdminNotification = async (data) => {
  try {
    const notification = await AdminNotification.create(data);
    return notification;
  } catch (err) {
    console.error("Failed to create admin notification:", err);
    return null;
  }
};
