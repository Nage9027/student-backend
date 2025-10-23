/** @format */

import express from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import NotificationController from "../controllers/notification.controller";
import NotificationService from "../services/notification.service";
import WebSocketService from "../services/websocket.service";

const router = express.Router();

// Initialize services
const wsService = new WebSocketService(require("http").createServer());
const notificationService = new NotificationService(wsService);
const notificationController = new NotificationController(notificationService);

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get user notifications
router.get("/", notificationController.getNotifications);

// Create notification
router.post("/", notificationController.createNotification);

// Mark notification as read
router.patch("/:notificationId/read", notificationController.markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", notificationController.markAllAsRead);

// Delete notification
router.delete("/:notificationId", notificationController.deleteNotification);

// Get notification statistics
router.get("/stats", notificationController.getNotificationStats);

// Send bulk notification (Admin only)
router.post(
	"/bulk",
	requireRole(["admin"]),
	notificationController.sendBulkNotification,
);

// Send class notification (Teachers and Admins)
router.post(
	"/class",
	requireRole(["admin", "teacher"]),
	notificationController.sendClassNotification,
);

export default router;
