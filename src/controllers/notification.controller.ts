/** @format */

import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import NotificationService from "../services/notification.service";
import { Notification } from "../models/Notification.model";

class NotificationController {
	private notificationService: NotificationService;

	constructor(notificationService: NotificationService) {
		this.notificationService = notificationService;
	}

	// Get user notifications
	public getNotifications = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 20;

			if (!userId) {
				return res.status(401).json({ message: "User not authenticated" });
			}

			const result = await this.notificationService.getUserNotifications(
				userId,
				page,
				limit,
			);

			res.json({
				success: true,
				data: result,
			});
		} catch (error) {
			console.error("Error fetching notifications:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	// Create notification
	public createNotification = [
		body("title").notEmpty().withMessage("Title is required"),
		body("message").notEmpty().withMessage("Message is required"),
		body("type")
			.isIn(["info", "success", "warning", "error", "announcement"])
			.withMessage("Invalid notification type"),
		body("recipients").isArray().withMessage("Recipients must be an array"),
		body("priority")
			.isIn(["low", "medium", "high"])
			.withMessage("Invalid priority"),
		body("category")
			.isIn(["academic", "fee", "attendance", "exam", "general", "system"])
			.withMessage("Invalid category"),

		async (req: Request, res: Response) => {
			try {
				const errors = validationResult(req);
				if (!errors.isEmpty()) {
					return res.status(400).json({ errors: errors.array() });
				}

				const userId = req.user?.id;
				if (!userId) {
					return res.status(401).json({ message: "User not authenticated" });
				}

				const notificationData = {
					...req.body,
					senderId: userId,
				};

				const notification = await this.notificationService.createNotification(
					notificationData,
				);

				res.status(201).json({
					success: true,
					data: notification,
				});
			} catch (error) {
				console.error("Error creating notification:", error);
				res.status(500).json({ message: "Internal server error" });
			}
		},
	];

	// Mark notification as read
	public markAsRead = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id;
			const { notificationId } = req.params;

			if (!userId) {
				return res.status(401).json({ message: "User not authenticated" });
			}

			const notification = await this.notificationService.markAsRead(
				notificationId,
				userId,
			);

			if (!notification) {
				return res.status(404).json({ message: "Notification not found" });
			}

			res.json({
				success: true,
				data: notification,
			});
		} catch (error) {
			console.error("Error marking notification as read:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	// Mark all notifications as read
	public markAllAsRead = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				return res.status(401).json({ message: "User not authenticated" });
			}

			await this.notificationService.markAllAsRead(userId);

			res.json({
				success: true,
				message: "All notifications marked as read",
			});
		} catch (error) {
			console.error("Error marking all notifications as read:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	// Delete notification
	public deleteNotification = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id;
			const { notificationId } = req.params;

			if (!userId) {
				return res.status(401).json({ message: "User not authenticated" });
			}

			const notification = await this.notificationService.deleteNotification(
				notificationId,
				userId,
			);

			if (!notification) {
				return res.status(404).json({ message: "Notification not found" });
			}

			res.json({
				success: true,
				message: "Notification deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting notification:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	// Get notification statistics
	public getNotificationStats = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				return res.status(401).json({ message: "User not authenticated" });
			}

			const stats = await this.notificationService.getNotificationStats(userId);

			res.json({
				success: true,
				data: stats,
			});
		} catch (error) {
			console.error("Error fetching notification stats:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	// Send bulk notification (Admin only)
	public sendBulkNotification = [
		body("title").notEmpty().withMessage("Title is required"),
		body("message").notEmpty().withMessage("Message is required"),
		body("type")
			.isIn(["info", "success", "warning", "error", "announcement"])
			.withMessage("Invalid notification type"),
		body("recipientRoles")
			.isArray()
			.withMessage("Recipient roles must be an array"),
		body("priority")
			.isIn(["low", "medium", "high"])
			.withMessage("Invalid priority"),
		body("category")
			.isIn(["academic", "fee", "attendance", "exam", "general", "system"])
			.withMessage("Invalid category"),

		async (req: Request, res: Response) => {
			try {
				const errors = validationResult(req);
				if (!errors.isEmpty()) {
					return res.status(400).json({ errors: errors.array() });
				}

				const userId = req.user?.id;
				if (!userId) {
					return res.status(401).json({ message: "User not authenticated" });
				}

				const { title, message, type, recipientRoles, priority, category } =
					req.body;

				const notification =
					await this.notificationService.sendBulkNotification(
						title,
						message,
						type,
						recipientRoles,
						userId,
						priority,
						category,
					);

				res.status(201).json({
					success: true,
					data: notification,
				});
			} catch (error) {
				console.error("Error sending bulk notification:", error);
				res.status(500).json({ message: "Internal server error" });
			}
		},
	];

	// Send class notification
	public sendClassNotification = [
		body("classId").notEmpty().withMessage("Class ID is required"),
		body("title").notEmpty().withMessage("Title is required"),
		body("message").notEmpty().withMessage("Message is required"),
		body("type")
			.isIn(["info", "success", "warning", "error", "announcement"])
			.withMessage("Invalid notification type"),
		body("priority")
			.isIn(["low", "medium", "high"])
			.withMessage("Invalid priority"),

		async (req: Request, res: Response) => {
			try {
				const errors = validationResult(req);
				if (!errors.isEmpty()) {
					return res.status(400).json({ errors: errors.array() });
				}

				const userId = req.user?.id;
				if (!userId) {
					return res.status(401).json({ message: "User not authenticated" });
				}

				const { classId, title, message, type, priority } = req.body;

				const notification =
					await this.notificationService.sendClassNotification(
						classId,
						title,
						message,
						type,
						userId,
						priority,
					);

				res.status(201).json({
					success: true,
					data: notification,
				});
			} catch (error) {
				console.error("Error sending class notification:", error);
				res.status(500).json({ message: "Internal server error" });
			}
		},
	];
}

export default NotificationController;
