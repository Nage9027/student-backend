/** @format */

import request from "supertest";
import app from "../app";
import { connectApp } from "../app";
import mongoose from "mongoose";
import { User } from "../models/User.model";
import { Subject } from "../models/Subject.model";
import { Fee } from "../models/Fee.model";
import jwt from "jsonwebtoken";

describe("Admin API", () => {
	let adminToken: string;
	let adminId: string;
	let studentToken: string;
	let studentId: string;

	beforeAll(async () => {
		await connectApp();

		// Create admin user
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

		// Create student user
		const student = new User({
			email: "student@example.com",
			password: "password123",
			role: "student",
			profile: {
				firstName: "Student",
				lastName: "User",
			},
		});
		await student.save();
		studentId = student._id.toString();
		studentToken = jwt.sign({ userId: studentId }, process.env.JWT_SECRET!);
	});

	afterAll(async () => {
		await User.deleteMany({});
		await Subject.deleteMany({});
		await Fee.deleteMany({});
		await mongoose.connection.close();
	});

	beforeEach(async () => {
		await Subject.deleteMany({});
		await Fee.deleteMany({});
	});

	describe("GET /api/admin/dashboard/stats", () => {
		it("should get dashboard statistics", async () => {
			const response = await request(app)
				.get("/api/admin/dashboard/stats")
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty("totalStudents");
			expect(response.body.data).toHaveProperty("totalTeachers");
			expect(response.body.data).toHaveProperty("totalSubjects");
		});

		it("should require admin role", async () => {
			await request(app)
				.get("/api/admin/dashboard/stats")
				.set("Authorization", `Bearer ${studentToken}`)
				.expect(403);
		});
	});

	describe("POST /api/admin/teachers", () => {
		it("should create a teacher", async () => {
			const teacherData = {
				email: "teacher@example.com",
				password: "password123",
				profile: {
					firstName: "Teacher",
					lastName: "Name",
				},
				academicInfo: {
					department: "Computer Science",
					designation: "Professor",
				},
			};

			const response = await request(app)
				.post("/api/admin/teachers")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(teacherData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data.email).toBe("teacher@example.com");
			expect(response.body.data.role).toBe("teacher");
		});

		it("should validate required fields", async () => {
			const response = await request(app)
				.post("/api/admin/teachers")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({})
				.expect(400);

			expect(response.body.errors).toBeDefined();
		});
	});

	describe("GET /api/admin/teachers", () => {
		it("should get all teachers", async () => {
			// Create test teachers
			const teachers = [
				new User({
					email: "teacher1@example.com",
					password: "password123",
					role: "teacher",
					profile: {
						firstName: "Teacher",
						lastName: "One",
					},
				}),
				new User({
					email: "teacher2@example.com",
					password: "password123",
					role: "teacher",
					profile: {
						firstName: "Teacher",
						lastName: "Two",
					},
				}),
			];
			await User.insertMany(teachers);

			const response = await request(app)
				.get("/api/admin/teachers")
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe("POST /api/admin/students", () => {
		it("should create a student", async () => {
			const studentData = {
				email: "newstudent@example.com",
				password: "password123",
				profile: {
					firstName: "New",
					lastName: "Student",
				},
				academicInfo: {
					studentId: "STU001",
					class: "Class A",
					rollNumber: "001",
				},
			};

			const response = await request(app)
				.post("/api/admin/students")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(studentData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data.email).toBe("newstudent@example.com");
			expect(response.body.data.role).toBe("student");
		});
	});

	describe("GET /api/admin/students", () => {
		it("should get all students", async () => {
			const response = await request(app)
				.get("/api/admin/students")
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(Array.isArray(response.body.data)).toBe(true);
		});
	});

	describe("POST /api/admin/subjects", () => {
		it("should create a subject", async () => {
			const subjectData = {
				name: "Mathematics",
				code: "MATH101",
				credits: 3,
				description: "Basic Mathematics Course",
			};

			const response = await request(app)
				.post("/api/admin/subjects")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(subjectData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data.name).toBe("Mathematics");
			expect(response.body.data.code).toBe("MATH101");
		});
	});

	describe("GET /api/admin/subjects", () => {
		it("should get all subjects", async () => {
			// Create test subjects
			const subjects = [
				new Subject({
					name: "Mathematics",
					code: "MATH101",
					credits: 3,
					description: "Basic Mathematics Course",
				}),
				new Subject({
					name: "Physics",
					code: "PHY101",
					credits: 4,
					description: "Basic Physics Course",
				}),
			];
			await Subject.insertMany(subjects);

			const response = await request(app)
				.get("/api/admin/subjects")
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe("POST /api/admin/fees", () => {
		it("should create a fee", async () => {
			const feeData = {
				name: "Tuition Fee",
				amount: 50000,
				type: "tuition",
				description: "Annual tuition fee",
				dueDate: new Date("2024-12-31"),
			};

			const response = await request(app)
				.post("/api/admin/fees")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(feeData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data.name).toBe("Tuition Fee");
			expect(response.body.data.amount).toBe(50000);
		});
	});

	describe("GET /api/admin/fees", () => {
		it("should get all fees", async () => {
			// Create test fees
			const fees = [
				new Fee({
					name: "Tuition Fee",
					amount: 50000,
					type: "tuition",
					description: "Annual tuition fee",
				}),
				new Fee({
					name: "Library Fee",
					amount: 5000,
					type: "library",
					description: "Annual library fee",
				}),
			];
			await Fee.insertMany(fees);

			const response = await request(app)
				.get("/api/admin/fees")
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe("PUT /api/admin/students/:id", () => {
		it("should update student", async () => {
			const updateData = {
				profile: {
					firstName: "Updated",
					lastName: "Student",
				},
			};

			const response = await request(app)
				.put(`/api/admin/students/${studentId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send(updateData)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.profile.firstName).toBe("Updated");
		});
	});

	describe("DELETE /api/admin/students/:id", () => {
		it("should delete student", async () => {
			// Create a new student to delete
			const student = new User({
				email: "deleteme@example.com",
				password: "password123",
				role: "student",
				profile: {
					firstName: "Delete",
					lastName: "Me",
				},
			});
			await student.save();

			const response = await request(app)
				.delete(`/api/admin/students/${student._id}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Student deleted successfully");
		});
	});
});
