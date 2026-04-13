// backend/src/routes/ticketRoutes.js
import express from "express";
import { body } from "express-validator";
import * as ticketController from "../controllers/ticketController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

// USER ROUTES 
router.use(protect);

router.post(
  "/",
  [
    body("subject").notEmpty().withMessage("Subject is required"),
    body("category").isIn(["account", "kyc", "deposit", "withdrawal", "trading", "technical", "security", "other"]),
    body("message").notEmpty().withMessage("Message is required"),
  ],
  validate,
  ticketController.createTicket
);

router.get("/", ticketController.getUserTickets);
router.get("/:id", ticketController.getTicketById);
router.post("/:id/reply", ticketController.addReply);
router.patch("/:id/close", ticketController.closeTicket);
router.post("/:id/rate", ticketController.rateTicket);

// ADMIN ROUTES
router.get("/admin/all", adminOnly, ticketController.getAllTickets);
router.get("/admin/stats", adminOnly, ticketController.getTicketStats);
router.get("/admin/:id", adminOnly, ticketController.getTicketByIdAdmin);
router.post("/admin/:id/reply", adminOnly, ticketController.adminReply);
router.patch("/admin/:id/status", adminOnly, ticketController.updateTicketStatus);
router.patch("/admin/:id/assign", adminOnly, ticketController.assignTicket);
router.patch("/admin/:id/priority", adminOnly, ticketController.updatePriority);
router.delete("/admin/:id", adminOnly, ticketController.deleteTicket);

export default router;