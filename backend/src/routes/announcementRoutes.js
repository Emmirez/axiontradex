// backend/src/routes/announcementRoutes.js
import express from "express";
import { body } from "express-validator";
import * as announcementController from "../controllers/announcementController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

// User routes (protected)
router.use(protect);

router.get("/user", announcementController.getUserAnnouncements);
router.post("/:id/dismiss", announcementController.dismissAnnouncement);

// Admin routes
router.get("/admin/all", adminOnly, announcementController.getAllAnnouncements);
router.get("/admin/:id", adminOnly, announcementController.getAnnouncementById);
router.post(
  "/admin",
  adminOnly,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("message").notEmpty().withMessage("Message is required"),
  ],
  validate,
  announcementController.createAnnouncement
);
router.patch(
  "/admin/:id",
  adminOnly,
  announcementController.updateAnnouncement
);
router.delete("/admin/:id", adminOnly, announcementController.deleteAnnouncement);
router.patch("/admin/:id/toggle", adminOnly, announcementController.toggleAnnouncementStatus);

export default router;