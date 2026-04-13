// backend/src/controllers/ticketController.js
import Ticket from "../models/TicketModel.js";
import User from "../models/UserModel.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/responseUtils.js";
import { sendAdminNotification } from "../utils/adminNotificationHelper.js";
import { sendNotification } from "../utils/notificationHelper.js";

// Create new ticket
export const createTicket = async (req, res) => {
  try {
    const { subject, category, priority, message, attachments } = req.body;

    if (!subject || !category || !message) {
      return errorResponse(res, 400, "Subject, category, and message are required");
    }

    const ticket = await Ticket.create({
      user: req.user._id,
      subject,
      category,
      priority: priority || "medium",
      messages: [
        {
          sender: "user",
          senderId: req.user._id,
          message,
          attachments: attachments || [],
        },
      ],
      lastActivityAt: new Date(),
    });

      // Send admin notification for new ticket
    await sendAdminNotification(
      "system",
      "New Support Ticket",
      `${req.user.firstName} ${req.user.lastName} created a new ticket: "${subject}" (${category})`,
      { ticketId: ticket._id, subject, category, priority, userId: req.user._id },
      "/admin/tickets/" + ticket._id,
      ticket._id,
      "Ticket"
    );

    return successResponse(res, 201, "Ticket created successfully", { ticket });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Get user's tickets
export const getUserTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .sort({ lastActivityAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("ticketId subject category priority status lastActivityAt createdAt"),
      Ticket.countDocuments(filter),
    ]);

    return paginatedResponse(res, "Tickets fetched", tickets, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Get single ticket with messages
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("messages.senderId", "firstName lastName email role");

    if (!ticket) return errorResponse(res, 404, "Ticket not found");

    return successResponse(res, 200, "Ticket fetched", { ticket });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Add reply to ticket
export const addReply = async (req, res) => {
  try {
    const { message, attachments } = req.body;
    const ticketId = req.params.id;

    if (!message) {
      return errorResponse(res, 400, "Message is required");
    }

    const ticket = await Ticket.findOne({
      _id: ticketId,
      user: req.user._id,
    });

    if (!ticket) return errorResponse(res, 404, "Ticket not found");

    if (ticket.status === "closed") {
      return errorResponse(res, 400, "Cannot reply to a closed ticket");
    }

    ticket.messages.push({
      sender: "user",
      senderId: req.user._id,
      message,
      attachments: attachments || [],
    });
    
    ticket.status = "open";
    ticket.lastActivityAt = new Date();
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticketId).populate(
      "messages.senderId",
      "firstName lastName email role"
    );

    return successResponse(res, 200, "Reply added", { ticket: updatedTicket });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Close ticket
export const closeTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!ticket) return errorResponse(res, 404, "Ticket not found");

    ticket.status = "closed";
    ticket.closedAt = new Date();
    await ticket.save();

    return successResponse(res, 200, "Ticket closed", { ticket });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Rate ticket resolution
export const rateTicket = async (req, res) => {
  try {
    const { score, comment } = req.body;
    const ticketId = req.params.id;

    if (!score || score < 1 || score > 5) {
      return errorResponse(res, 400, "Rating score must be between 1 and 5");
    }

    const ticket = await Ticket.findOne({
      _id: ticketId,
      user: req.user._id,
      status: "closed",
    });

    if (!ticket) return errorResponse(res, 404, "Closed ticket not found");

    if (ticket.rating) {
      return errorResponse(res, 400, "Ticket already rated");
    }

    ticket.rating = {
      score,
      comment,
      createdAt: new Date(),
    };
    await ticket.save();

    return successResponse(res, 200, "Ticket rated successfully", { ticket });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// ADMIN CONTROLLERS 

// Get all tickets (admin)
export const getAllTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.userId) filter.user = req.query.userId;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate("user", "firstName lastName email username")
        .populate("assignedTo", "firstName lastName email")
        .sort({ priority: -1, lastActivityAt: -1 })
        .skip(skip)
        .limit(limit),
      Ticket.countDocuments(filter),
    ]);

    return paginatedResponse(res, "Tickets fetched", tickets, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Get ticket stats (admin)
export const getTicketStats = async (req, res) => {
  try {
    const [total, open, inProgress, resolved, closed, highPriority, avgResponseTime] =
      await Promise.all([
        Ticket.countDocuments(),
        Ticket.countDocuments({ status: "open" }),
        Ticket.countDocuments({ status: "in_progress" }),
        Ticket.countDocuments({ status: "resolved" }),
        Ticket.countDocuments({ status: "closed" }),
        Ticket.countDocuments({ priority: "high" }),
        // Calculate average response time (simplified)
        Ticket.aggregate([
          { $unwind: "$messages" },
          { $match: { "messages.sender": "admin" } },
          { $group: { _id: null, avg: { $avg: { $subtract: ["$messages.createdAt", "$createdAt"] } } } },
        ]),
      ]);

    return successResponse(res, 200, "Ticket stats fetched", {
      total,
      open,
      inProgress,
      resolved,
      closed,
      highPriority,
      avgResponseTime: avgResponseTime[0]?.avg
        ? Math.round(avgResponseTime[0].avg / (1000 * 60 * 60))
        : 0,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Get single ticket (admin)
export const getTicketByIdAdmin = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("user", "firstName lastName email username phone wallet")
      .populate("assignedTo", "firstName lastName email")
      .populate("messages.senderId", "firstName lastName email role");

    if (!ticket) return errorResponse(res, 404, "Ticket not found");

    return successResponse(res, 200, "Ticket fetched", { ticket });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Admin reply to ticket
export const adminReply = async (req, res) => {
  try {
    const { message, attachments } = req.body;
    const ticketId = req.params.id;

    if (!message) {
      return errorResponse(res, 400, "Message is required");
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return errorResponse(res, 404, "Ticket not found");

    ticket.messages.push({
      sender: "admin",
      senderId: req.user._id,
      message,
      attachments: attachments || [],
    });
    
    ticket.status = "in_progress";
    ticket.lastActivityAt = new Date();
    await ticket.save();

     // Send notification to user
    await sendNotification(
      ticket.user._id,
      "system",
      "Support Ticket Update",
      `Admin replied to your ticket #${ticket.ticketId}: "${ticket.subject}"`,
      { ticketId: ticket._id, subject: ticket.subject },
      `/support/ticket/${ticketId}`
    );

    // Send admin notification for the reply
    await sendAdminNotification(
      "system",
      "Ticket Reply Sent",
      `${req.user.firstName} ${req.user.lastName} replied to ticket #${ticket.ticketId} from ${ticket.user.firstName} ${ticket.user.lastName}`,
      { ticketId: ticket._id, subject: ticket.subject, userId: ticket.user._id },
      "/admin/tickets/" + ticketId,
      ticket._id,
      "Ticket"
    );

    const updatedTicket = await Ticket.findById(ticketId)
      .populate("user", "firstName lastName email")
      .populate("messages.senderId", "firstName lastName email role");

    return successResponse(res, 200, "Reply added", { ticket: updatedTicket });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Update ticket status
export const updateTicketStatus = async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const validStatuses = ["open", "in_progress", "resolved", "closed"];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, 400, "Invalid status");
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return errorResponse(res, 404, "Ticket not found");

    ticket.status = status;
    
    if (status === "resolved") {
      ticket.resolvedAt = new Date();
      if (resolution) {
        ticket.messages.push({
          sender: "admin",
          senderId: req.user._id,
          message: `Resolution: ${resolution}`,
        });
      }
    }
    
    if (status === "closed") {
      ticket.closedAt = new Date();
    }
    
    ticket.lastActivityAt = new Date();
    await ticket.save();

    return successResponse(res, 200, "Ticket status updated", { ticket });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Assign ticket to admin
export const assignTicket = async (req, res) => {
  try {
    const { adminId } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) return errorResponse(res, 404, "Ticket not found");

    const admin = await User.findById(adminId);
    if (!admin || (admin.role !== "admin" && admin.role !== "superadmin")) {
      return errorResponse(res, 400, "Invalid admin user");
    }

    ticket.assignedTo = adminId;
    ticket.status = "in_progress";
    await ticket.save();

    return successResponse(res, 200, "Ticket assigned", { ticket });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Update ticket priority
export const updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const validPriorities = ["low", "medium", "high", "urgent"];

    if (!validPriorities.includes(priority)) {
      return errorResponse(res, 400, "Invalid priority");
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true }
    );

    if (!ticket) return errorResponse(res, 404, "Ticket not found");

    return successResponse(res, 200, "Priority updated", { ticket });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Delete ticket (admin)
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return errorResponse(res, 404, "Ticket not found");

    return successResponse(res, 200, "Ticket deleted");
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};