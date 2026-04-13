import Announcement from "../models/AnnouncementModel.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../utils/responseUtils.js";
import { sendAdminNotification } from "../utils/adminNotificationHelper.js";

//  USER CONTROLLERS

// Get active announcements for current user
export const getUserAnnouncements = async (req, res) => {
  try {
    const now = new Date();

    // Condition 1: date range
    const dateCondition = {
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: null },
        { endDate: { $exists: false } },
        { endDate: { $gte: now } },
      ],
      dismissedBy: { $ne: req.user._id },
    };

    // Condition 2: who can see it (by role)
    let audienceCondition;
    const role = req.user.role || "user";

    if (role === "superadmin") {
      audienceCondition = {
        $or: [
          { isGlobal: true },
          { targetUsers: req.user._id },
          { targetRoles: { $in: ["superadmin", "admin", "user"] } },
        ],
      };
    } else if (role === "admin") {
      audienceCondition = {
        $or: [
          { isGlobal: true },
          { targetUsers: req.user._id },
          { targetRoles: { $in: ["admin", "user"] } },
        ],
      };
    } else {
      // regular user
      audienceCondition = {
        $or: [
          { isGlobal: true },
          { targetUsers: req.user._id },
          { targetRoles: "user" },
        ],
      };
    }

    // Combine with $and so BOTH conditions must be satisfied
    const query = {
      $and: [dateCondition, audienceCondition],
    };

    const announcements = await Announcement.find(query)
      .sort({ createdAt: -1 })
      .limit(10);

    return successResponse(res, 200, "Announcements fetched", {
      announcements,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Dismiss an announcement
export const dismissAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return errorResponse(res, 404, "Announcement not found");
    }

    if (!announcement.dismissedBy.includes(req.user._id)) {
      announcement.dismissedBy.push(req.user._id);
      await announcement.save();
    }

    return successResponse(res, 200, "Announcement dismissed");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

//ADMIN CONTROLLERS

// Create announcement (admin)
export const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      message,
      type,
      isGlobal,
      targetUsers,
      targetRoles,
      startDate,
      endDate,
      dismissible,
      actionUrl,
      actionText,
    } = req.body;

    if (!title || !message) {
      return errorResponse(res, 400, "Title and message are required");
    }

    const announcement = await Announcement.create({
      title,
      message,
      type: type || "info",
      isGlobal: isGlobal !== undefined ? isGlobal : true,
      targetUsers: targetUsers || [],
      targetRoles: targetRoles || [],
      startDate: startDate || new Date(),
      endDate,
      dismissible: dismissible !== undefined ? dismissible : true,
      actionUrl,
      actionText: actionText || "Read more",
      createdBy: req.user._id,
    });

    // Send admin notification
    await sendAdminNotification(
      "system",
      "Announcement Created",
      `${req.user.firstName} ${req.user.lastName} created announcement: "${title}"`,
      { announcementId: announcement._id, title, type },
      "/admin/announcements",
      announcement._id,
      "Announcement",
    );

    return successResponse(res, 201, "Announcement created", { announcement });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Get all announcements (admin)
export const getAllAnnouncements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.type) filter.type = req.query.type;
    if (req.query.isActive === "true") filter.isActive = true;
    if (req.query.isActive === "false") filter.isActive = false;

    const [announcements, total] = await Promise.all([
      Announcement.find(filter)
        .populate("createdBy", "firstName lastName email")
        .populate("targetUsers", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Announcement.countDocuments(filter),
    ]);

    return paginatedResponse(res, "Announcements fetched", announcements, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Get single announcement (admin)
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate("createdBy", "firstName lastName email")
      .populate("targetUsers", "firstName lastName email");

    if (!announcement) {
      return errorResponse(res, 404, "Announcement not found");
    }

    return successResponse(res, 200, "Announcement fetched", { announcement });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Update announcement (admin)
export const updateAnnouncement = async (req, res) => {
  try {
    const {
      title,
      message,
      type,
      isActive,
      isGlobal,
      targetUsers,
      targetRoles,
      startDate,
      endDate,
      dismissible,
      actionUrl,
      actionText,
    } = req.body;

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return errorResponse(res, 404, "Announcement not found");
    }

    const contentChanged =
      (title !== undefined && title !== announcement.title) ||
      (message !== undefined && message !== announcement.message);

    if (contentChanged) {
      announcement.dismissedBy = [];
    }

    if (title !== undefined) announcement.title = title;
    if (message !== undefined) announcement.message = message;
    if (type !== undefined) announcement.type = type;
    if (isActive !== undefined) announcement.isActive = isActive;
    if (isGlobal !== undefined) announcement.isGlobal = isGlobal;
    if (targetUsers !== undefined) announcement.targetUsers = targetUsers;
    if (targetRoles !== undefined) announcement.targetRoles = targetRoles;
    if (startDate !== undefined) announcement.startDate = startDate;
    if (endDate !== undefined) announcement.endDate = endDate;
    if (dismissible !== undefined) announcement.dismissible = dismissible;
    if (actionUrl !== undefined) announcement.actionUrl = actionUrl;
    if (actionText !== undefined) announcement.actionText = actionText;

    await announcement.save();

    // Send admin notification
    await sendAdminNotification(
      "system",
      "Announcement Updated",
      `${req.user.firstName} ${req.user.lastName} updated announcement: "${announcement.title}"`,
      { announcementId: announcement._id, title: announcement.title },
      "/admin/announcements",
      announcement._id,
      "Announcement",
    );

    return successResponse(res, 200, "Announcement updated", { announcement });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Delete announcement (admin)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return errorResponse(res, 404, "Announcement not found");
    }

    return successResponse(res, 200, "Announcement deleted");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Toggle announcement active status
export const toggleAnnouncementStatus = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return errorResponse(res, 404, "Announcement not found");
    }

    announcement.isActive = !announcement.isActive;
    await announcement.save();

    return successResponse(
      res,
      200,
      `Announcement ${announcement.isActive ? "activated" : "deactivated"}`,
      {
        announcement,
      },
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};
