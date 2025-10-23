/** @format */

import request from "supertest";
import app from "../app";
import { connectApp } from "../app";
import mongoose from "mongoose";
import { User } from "../models/User.model";
import { Notification } from "../models/Notification.model";
import jwt from "jsonwebtoken";

describe("Notification API", () => {
	let authToken: string;
	let userId: string;
	let adminToken: string;
	let adminId: string;

	beforeAll(async () => {
		await connectApp();

		// Create test user
		const user = new User({
			email: "test@example.com",
			password: "password123",
			role: "student",
			profile: {
				firstName: "Test",
				lastName: "User",
			},
		});
		await user.save();
		userId = user._id.toString();
		authToken = jwt.sign({ userId }, process.env.JWT_SECRET!);

		// Create test admin
		const admin = new User({
			email: "admin@example.com",
			password: "password123",
			role: "admin",
			profile: {
				firstName: "Admin",
				lastName: "User",
			},
		});
		await admin.save();
		adminId = admin._id.toString();
		adminToken = jwt.sign({ userId: adminId }, process.env.JWT_SECRET!);
	});

	afterAll(async () => {
		await User.deleteMany({});
		await Notification.deleteMany({});
		await mongoose.connection.close();
	});

	beforeEach(async () => {
		await Notification.deleteMany({});
	});

	describe("GET /api/notifications", () => {
		it("should get user notifications", async () => {
			// Create a test notification
			const notification = new Notification({
				title: "Test Notification",
				message: "This is a test notification",
				type: "info",
				recipients: [userId],
				sender: adminId,
				priority: "medium",
				category: "general",
			});
			await notification.save();

			const response = await request(app)
				.get("/api/notifications")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.notifications).toHaveLength(1);
			expect(response.body.data.notifications[0].title).toBe(
				"Test Notification",
			);
		});

		it("should require authentication", async () => {
			await request(app).get("/api/notifications").expect(401);
		});
	});

	describe("POST /api/notifications", () => {
		it("should create a notification", async () => {
			const notificationData = {
				title: "New Notification",
				message: "This is a new notification",
				type: "info",
				recipients: [userId],
				priority: "medium",
				category: "general",
			};

			const response = await request(app)
				.post("/api/notifications")
				.set("Authorization", `Bearer ${authToken}`)
				.send(notificationData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data.title).toBe("New Notification");
		});

		it("should validate required fields", async () => {
			const response = await request(app)
				.post("/api/notifications")
				.set("Authorization", `Bearer ${authToken}`)
				.send({})
				.expect(400);

			expect(response.body.errors).toBeDefined();
		});
	});

	describe("PATCH /api/notifications/:id/read", () => {
		it("should mark notification as read", async () => {
			const notification = new Notification({
				title: "Test Notification",
				message: "This is a test notification",
				type: "info",
				recipients: [userId],
				sender: adminId,
				priority: "medium",
				category: "general",
			});
			await notification.save();

			const response = await request(app)
				.patch(`/api/notifications/${notification._id}/read`)
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.status).toBe("read");
		});

		it("should return 404 for non-existent notification", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			await request(app)
				.patch(`/api/notifications/${fakeId}/read`)
				.set("Authorization", `Bearer ${authToken}`)
				.expect(404);
		});
	});

	describe("PATCH /api/notifications/mark-all-read", () => {
		it("should mark all notifications as read", async () => {
			// Create multiple notifications
			const notifications = [
				new Notification({
					title: "Notification 1",
					message: "First notification",
					type: "info",
					recipients: [userId],
					sender: adminId,
					priority: "medium",
					category: "general",
				}),
				new Notification({
					title: "Notification 2",
					message: "Second notification",
					type: "warning",
					recipients: [userId],
					sender: adminId,
					priority: "high",
					category: "academic",
				}),
			];
			await Notification.insertMany(notifications);

			const response = await request(app)
				.patch("/api/notifications/mark-all-read")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("All notifications marked as read");
		});
	});

	describe("DELETE /api/notifications/:id", () => {
		it("should delete notification", async () => {
			const notification = new Notification({
				title: "Test Notification",
				message: "This is a test notification",
				type: "info",
				recipients: [userId],
				sender: userId,
				priority: "medium",
				category: "general",
			});
			await notification.save();

			const response = await request(app)
				.delete(`/api/notifications/${notification._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Notification deleted successfully");
		});

		it("should not delete notification from other users", async () => {
			const notification = new Notification({
				title: "Test Notification",
				message: "This is a test notification",
				type: "info",
				recipients: [adminId],
				sender: adminId,
				priority: "medium",
				category: "general",
			});
			await notification.save();

			await request(app)
				.delete(`/api/notifications/${notification._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.expect(404);
		});
	});

	describe("GET /api/notifications/stats", () => {
		it("should get notification statistics", async () => {
			// Create test notifications
			const notifications = [
				new Notification({
					title: "Notification 1",
					message: "First notification",
					type: "info",
					recipients: [userId],
					sender: adminId,
					priority: "medium",
					category: "general",
				}),
				new Notification({
					title: "Notification 2",
					message: "Second notification",
					type: "warning",
					recipients: [userId],
					sender: adminId,
					priority: "high",
					category: "academic",
				}),
			];
			await Notification.insertMany(notifications);

			const response = await request(app)
				.get("/api/notifications/stats")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.total).toBe(2);
			expect(response.body.data.unread).toBe(2);
		});
	});

	describe("POST /api/notifications/bulk", () => {
		it("should send bulk notification (admin only)", async () => {
			const bulkData = {
				title: "Bulk Notification",
				message: "This is a bulk notification",
				type: "announcement",
				recipientRoles: ["student"],
				priority: "high",
				category: "general",
			};

			const response = await request(app)
				.post("/api/notifications/bulk")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(bulkData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data.title).toBe("Bulk Notification");
		});

		it("should require admin role", async () => {
			const bulkData = {
				title: "Bulk Notification",
				message: "This is a bulk notification",
				type: "announcement",
				recipientRoles: ["student"],
				priority: "high",
				category: "general",
			};

			await request(app)
				.post("/api/notifications/bulk")
				.set("Authorization", `Bearer ${authToken}`)
				.send(bulkData)
				.expect(403);
		});
	});
});
