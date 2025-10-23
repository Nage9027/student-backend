/** @format */

import request from "supertest";
import app from "../app";
import { connectApp } from "../app";
import mongoose from "mongoose";
import { User } from "../models/User.model";
import jwt from "jsonwebtoken";

describe("Authentication API", () => {
	beforeAll(async () => {
		await connectApp();
	});

	afterAll(async () => {
		await User.deleteMany({});
		await mongoose.connection.close();
	});

	beforeEach(async () => {
		await User.deleteMany({});
	});

	describe("POST /api/auth/register", () => {
		it("should register a new user", async () => {
			const userData = {
				email: "test@example.com",
				password: "password123",
				role: "student",
				profile: {
					firstName: "Test",
					lastName: "User",
				},
			};

			const response = await request(app)
				.post("/api/auth/register")
				.send(userData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data.email).toBe("test@example.com");
			expect(response.body.data.role).toBe("student");
			expect(response.body.data.password).toBeUndefined(); // Password should not be returned
		});

		it("should validate required fields", async () => {
			const response = await request(app)
				.post("/api/auth/register")
				.send({})
				.expect(400);

			expect(response.body.errors).toBeDefined();
		});

		it("should not allow duplicate emails", async () => {
			const userData = {
				email: "test@example.com",
				password: "password123",
				role: "student",
				profile: {
					firstName: "Test",
					lastName: "User",
				},
			};

			// Create first user
			await request(app).post("/api/auth/register").send(userData).expect(201);

			// Try to create second user with same email
			await request(app).post("/api/auth/register").send(userData).expect(400);
		});
	});

	describe("POST /api/auth/login", () => {
		beforeEach(async () => {
			// Create a test user
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
		});

		it("should login with valid credentials", async () => {
			const loginData = {
				email: "test@example.com",
				password: "password123",
			};

			const response = await request(app)
				.post("/api/auth/login")
				.send(loginData)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.token).toBeDefined();
			expect(response.body.data.user.email).toBe("test@example.com");
			expect(response.body.data.user.password).toBeUndefined();
		});

		it("should reject invalid credentials", async () => {
			const loginData = {
				email: "test@example.com",
				password: "wrongpassword",
			};

			const response = await request(app)
				.post("/api/auth/login")
				.send(loginData)
				.expect(401);

			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("Invalid credentials");
		});

		it("should validate required fields", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({})
				.expect(400);

			expect(response.body.errors).toBeDefined();
		});
	});

	describe("POST /api/auth/forgot-password", () => {
		beforeEach(async () => {
			// Create a test user
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
		});

		it("should send password reset email for valid email", async () => {
			const response = await request(app)
				.post("/api/auth/forgot-password")
				.send({ email: "test@example.com" })
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Password reset email sent");
		});

		it("should return success even for invalid email (security)", async () => {
			const response = await request(app)
				.post("/api/auth/forgot-password")
				.send({ email: "nonexistent@example.com" })
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Password reset email sent");
		});
	});

	describe("POST /api/auth/reset-password", () => {
		let resetToken: string;
		let userId: string;

		beforeEach(async () => {
			// Create a test user
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

			// Generate reset token
			resetToken = jwt.sign(
				{ userId, type: "password-reset" },
				process.env.JWT_SECRET!,
				{ expiresIn: "1h" },
			);
		});

		it("should reset password with valid token", async () => {
			const resetData = {
				token: resetToken,
				newPassword: "newpassword123",
			};

			const response = await request(app)
				.post("/api/auth/reset-password")
				.send(resetData)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Password reset successfully");
		});

		it("should reject invalid token", async () => {
			const resetData = {
				token: "invalid-token",
				newPassword: "newpassword123",
			};

			const response = await request(app)
				.post("/api/auth/reset-password")
				.send(resetData)
				.expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("Invalid or expired token");
		});

		it("should validate required fields", async () => {
			const response = await request(app)
				.post("/api/auth/reset-password")
				.send({})
				.expect(400);

			expect(response.body.errors).toBeDefined();
		});
	});

	describe("GET /api/auth/me", () => {
		let authToken: string;
		let userId: string;

		beforeEach(async () => {
			// Create a test user
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
		});

		it("should get current user with valid token", async () => {
			const response = await request(app)
				.get("/api/auth/me")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.email).toBe("test@example.com");
			expect(response.body.data.role).toBe("student");
			expect(response.body.data.password).toBeUndefined();
		});

		it("should reject request without token", async () => {
			await request(app).get("/api/auth/me").expect(401);
		});

		it("should reject request with invalid token", async () => {
			await request(app)
				.get("/api/auth/me")
				.set("Authorization", "Bearer invalid-token")
				.expect(401);
		});
	});

	describe("POST /api/auth/logout", () => {
		let authToken: string;
		let userId: string;

		beforeEach(async () => {
			// Create a test user
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
		});

		it("should logout successfully", async () => {
			const response = await request(app)
				.post("/api/auth/logout")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Logged out successfully");
		});
	});
});
