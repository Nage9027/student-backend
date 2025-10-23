/** @format */

import { Notification } from "../models/Notification.model";
import { User } from "../models/User.model";
import WebSocketService from "./websocket.service";

export interface CreateNotificationData {
	title: string;
	message: string;
	type: "info" | "success" | "warning" | "error" | "announcement";
	recipients: string[]; // User IDs
	senderId: string;
	priority: "low" | "medium" | "high";
	category: "academic" | "fee" | "attendance" | "exam" | "general" | "system";
	metadata?: any;
}

class NotificationService {
	private wsService: WebSocketService;

	constructor(wsService: WebSocketService) {
		this.wsService = wsService;
	}

	// Create and send notification
	public async createNotification(data: CreateNotificationData): Promise<any> {
		try {
			const notification = new Notification({
				title: data.title,
				message: data.message,
				type: data.type,
				recipients: data.recipients,
				sender: data.senderId,
				priority: data.priority,
				category: data.category,
				metadata: data.metadata,
				status: "unread",
			});

			await notification.save();

			// Send real-time notification to connected users
			data.recipients.forEach((recipientId) => {
				this.wsService.sendToUser(recipientId, "new-notification", {
					id: notification._id,
					title: notification.title,
					message: notification.message,
					type: notification.type,
					priority: notification.priority,
					category: notification.category,
					createdAt: notification.createdAt,
				});
			});

			return notification;
		} catch (error) {
			console.error("Error creating notification:", error);
			throw error;
		}
	}

	// Get notifications for a user
	public async getUserNotifications(
		userId: string,
		page: number = 1,
		limit: number = 20,
	) {
		try {
			const skip = (page - 1) * limit;

			const notifications = await Notification.find({
				recipients: userId,
			})
				.populate("sender", "name email role")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit);

			const total = await Notification.countDocuments({
				recipients: userId,
			});

			return {
				notifications,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit),
				},
			};
		} catch (error) {
			console.error("Error fetching user notifications:", error);
			throw error;
		}
	}

	// Mark notification as read
	public async markAsRead(notificationId: string, userId: string) {
		try {
			const notification = await Notification.findOneAndUpdate(
				{
					_id: notificationId,
					recipients: userId,
				},
				{
					$addToSet: { readBy: userId },
					$set: { status: "read" },
				},
				{ new: true },
			);

			return notification;
		} catch (error) {
			console.error("Error marking notification as read:", error);
			throw error;
		}
	}

	// Mark all notifications as read for a user
	public async markAllAsRead(userId: string) {
		try {
			await Notification.updateMany(
				{
					recipients: userId,
					readBy: { $ne: userId },
				},
				{
					$addToSet: { readBy: userId },
					$set: { status: "read" },
				},
			);

			return { success: true };
		} catch (error) {
			console.error("Error marking all notifications as read:", error);
			throw error;
		}
	}

	// Delete notification
	public async deleteNotification(notificationId: string, userId: string) {
		try {
			const notification = await Notification.findOneAndDelete({
				_id: notificationId,
				sender: userId,
			});

			return notification;
		} catch (error) {
			console.error("Error deleting notification:", error);
			throw error;
		}
	}

	// Get notification statistics
	public async getNotificationStats(userId: string) {
		try {
			const total = await Notification.countDocuments({
				recipients: userId,
			});

			const unread = await Notification.countDocuments({
				recipients: userId,
				readBy: { $ne: userId },
			});

			const byType = await Notification.aggregate([
				{ $match: { recipients: userId } },
				{ $group: { _id: "$type", count: { $sum: 1 } } },
			]);

			const byCategory = await Notification.aggregate([
				{ $match: { recipients: userId } },
				{ $group: { _id: "$category", count: { $sum: 1 } } },
			]);

			return {
				total,
				unread,
				byType,
				byCategory,
			};
		} catch (error) {
			console.error("Error fetching notification stats:", error);
			throw error;
		}
	}

	// Send bulk notifications
	public async sendBulkNotification(
		title: string,
		message: string,
		type: "info" | "success" | "warning" | "error" | "announcement",
		recipientRoles: string[],
		senderId: string,
		priority: "low" | "medium" | "high" = "medium",
		category:
			| "academic"
			| "fee"
			| "attendance"
			| "exam"
			| "general"
			| "system" = "general",
	) {
		try {
			// Get all users with specified roles
			const users = await User.find({
				role: { $in: recipientRoles },
			}).select("_id");

			const recipientIds = users.map((user) => user._id.toString());

			if (recipientIds.length === 0) {
				throw new Error("No recipients found for the specified roles");
			}

			const notification = await this.createNotification({
				title,
				message,
				type,
				recipients: recipientIds,
				senderId,
				priority,
				category,
			});

			// Send real-time notifications to all users with specified roles
			this.wsService.sendToRole(recipientRoles[0], "bulk-notification", {
				title,
				message,
				type,
				priority,
				category,
				createdAt: notification.createdAt,
			});

			return notification;
		} catch (error) {
			console.error("Error sending bulk notification:", error);
			throw error;
		}
	}

	// Send class-specific notification
	public async sendClassNotification(
		classId: string,
		title: string,
		message: string,
		type: "info" | "success" | "warning" | "error" | "announcement",
		senderId: string,
		priority: "low" | "medium" | "high" = "medium",
	) {
		try {
			// Get all students in the class
			const students = await User.find({
				role: "student",
				"academicInfo.class": classId,
			}).select("_id");

			const recipientIds = students.map((student) => student._id.toString());

			const notification = await this.createNotification({
				title,
				message,
				type,
				recipients: recipientIds,
				senderId,
				priority,
				category: "academic",
				metadata: { classId },
			});

			// Send real-time notification to class room
			this.wsService.sendToRoom(classId, "class-notification", {
				title,
				message,
				type,
				priority,
				classId,
				createdAt: notification.createdAt,
			});

			return notification;
		} catch (error) {
			console.error("Error sending class notification:", error);
			throw error;
		}
	}
}

export default NotificationService;
