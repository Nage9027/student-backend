/** @format */

import request from "supertest";
import app from "../app";
import { connectApp } from "../app";
import mongoose from "mongoose";
import { models } from "../models";
import jwt from "jsonwebtoken";

describe("Chat API", () => {
	let authToken: string;
	let userId: string;
	let otherUserId: string;
	let otherAuthToken: string;

	beforeAll(async () => {
		await connectApp();

		// Create test users
		const user = new models.User({
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

		const otherUser = new models.User({
			email: "other@example.com",
			password: "password123",
			role: "teacher",
			profile: {
				firstName: "Other",
				lastName: "User",
			},
		});
		await otherUser.save();
		otherUserId = otherUser._id.toString();
		otherAuthToken = jwt.sign({ userId: otherUserId }, process.env.JWT_SECRET!);
	});

	afterAll(async () => {
		await models.User.deleteMany({});
		await models.ChatMessage.deleteMany({});
		await mongoose.connection.close();
	});

	beforeEach(async () => {
		await models.ChatMessage.deleteMany({});
	});

	describe("POST /api/chat/message", () => {
		it("should send a message", async () => {
			const messageData = {
				roomId: "test-room",
				message: "Hello, this is a test message",
				type: "text",
			};

			const response = await request(app)
				.post("/api/chat/message")
				.set("Authorization", `Bearer ${authToken}`)
				.send(messageData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data.message).toBe("Hello, this is a test message");
			expect(response.body.data.roomId).toBe("test-room");
		});

		it("should validate required fields", async () => {
			const response = await request(app)
				.post("/api/chat/message")
				.set("Authorization", `Bearer ${authToken}`)
				.send({})
				.expect(400);

			expect(response.body.errors).toBeDefined();
		});

		it("should require authentication", async () => {
			await request(app)
				.post("/api/chat/message")
				.send({
					roomId: "test-room",
					message: "Hello",
					type: "text",
				})
				.expect(401);
		});
	});

	describe("GET /api/chat/room/:roomId/messages", () => {
		it("should get room messages", async () => {
			// Create test messages
			const messages = [
				new models.ChatMessage({
					roomId: "test-room",
					sender: userId,
					message: "First message",
					type: "text",
				}),
				new models.ChatMessage({
					roomId: "test-room",
					sender: otherUserId,
					message: "Second message",
					type: "text",
				}),
			];
			await models.ChatMessage.insertMany(messages);

			const response = await request(app)
				.get("/api/chat/room/test-room/messages")
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.messages).toHaveLength(2);
			expect(response.body.data.pagination.total).toBe(2);
		});

		it("should support pagination", async () => {
			// Create multiple messages
			const messages = Array.from({ length: 25 }, (_, i) => ({
				roomId: "test-room",
				sender: userId,
				message: `Message ${i + 1}`,
				type: "text" as const,
			}));
			await ChatMessage.insertMany(messages);

			const response = await request(app)
				.get("/api/chat/room/test-room/messages?page=1&limit=10")
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.messages).toHaveLength(10);
			expect(response.body.data.pagination.page).toBe(1);
			expect(response.body.data.pagination.limit).toBe(10);
			expect(response.body.data.pagination.total).toBe(25);
		});
	});

	describe("GET /api/chat/room/:roomId/recent", () => {
		it("should get recent messages", async () => {
			// Create test messages
			const messages = [
				new models.ChatMessage({
					roomId: "test-room",
					sender: userId,
					message: "Old message",
					type: "text",
				}),
				new models.ChatMessage({
					roomId: "test-room",
					sender: otherUserId,
					message: "Recent message",
					type: "text",
				}),
			];
			await models.ChatMessage.insertMany(messages);

			const response = await request(app)
				.get("/api/chat/room/test-room/recent?limit=1")
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveLength(1);
			expect(response.body.data[0].message).toBe("Recent message");
		});
	});

	describe("DELETE /api/chat/message/:messageId", () => {
		it("should delete message", async () => {
			const message = new models.ChatMessage({
				roomId: "test-room",
				sender: userId,
				message: "Test message",
				type: "text",
			});
			await message.save();

			const response = await request(app)
				.delete(`/api/chat/message/${message._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Message deleted successfully");
		});

		it("should not delete message from other users", async () => {
			const message = new models.ChatMessage({
				roomId: "test-room",
				sender: otherUserId,
				message: "Test message",
				type: "text",
			});
			await message.save();

			await request(app)
				.delete(`/api/chat/message/${message._id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.expect(404);
		});
	});

	describe("GET /api/chat/room/:roomId/participants", () => {
		it("should get room participants", async () => {
			// Create messages from different users
			const messages = [
				new models.ChatMessage({
					roomId: "test-room",
					sender: userId,
					message: "Message from user 1",
					type: "text",
				}),
				new models.ChatMessage({
					roomId: "test-room",
					sender: otherUserId,
					message: "Message from user 2",
					type: "text",
				}),
			];
			await models.ChatMessage.insertMany(messages);

			const response = await request(app)
				.get("/api/chat/room/test-room/participants")
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveLength(2);
			expect(response.body.data.map((p: any) => p._id)).toContain(userId);
			expect(response.body.data.map((p: any) => p._id)).toContain(otherUserId);
		});
	});

	describe("GET /api/chat/rooms", () => {
		it("should get user rooms", async () => {
			// Create messages in different rooms
			const messages = [
				new models.ChatMessage({
					roomId: "room-1",
					sender: userId,
					message: "Message in room 1",
					type: "text",
				}),
				new models.ChatMessage({
					roomId: "room-2",
					sender: userId,
					message: "Message in room 2",
					type: "text",
				}),
			];
			await models.ChatMessage.insertMany(messages);

			const response = await request(app)
				.get("/api/chat/rooms")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveLength(2);
			expect(response.body.data[0].roomId).toBeDefined();
			expect(response.body.data[0].recentMessage).toBeDefined();
		});
	});

	describe("GET /api/chat/direct/:otherUserId", () => {
		it("should create or get direct room", async () => {
			const response = await request(app)
				.get(`/api/chat/direct/${otherUserId}`)
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.roomId).toBeDefined();
		});
	});

	describe("GET /api/chat/stats", () => {
		it("should get chat statistics", async () => {
			// Create test messages
			const messages = [
				new models.ChatMessage({
					roomId: "room-1",
					sender: userId,
					message: "Text message",
					type: "text",
				}),
				new models.ChatMessage({
					roomId: "room-1",
					sender: userId,
					message: "File message",
					type: "file",
				}),
			];
			await models.ChatMessage.insertMany(messages);

			const response = await request(app)
				.get("/api/chat/stats")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.totalMessages).toBe(2);
			expect(response.body.data.totalRooms).toBe(1);
			expect(response.body.data.messagesByType).toHaveLength(2);
		});
	});
});
