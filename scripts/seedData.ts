/** @format */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Student, Teacher, Admin } from "../src/models/User.model";
import { Subject } from "../src/models/Subject.model";
import { Assignment } from "../src/models/Assignment.model";
import { Attendance } from "../src/models/Attendance.model";
import { Grade } from "../src/models/Grade.model";
import { Fee } from "../src/models/Fee.model";
import { Exam } from "../src/models/Exam.model";
import dotenv from "dotenv";

dotenv.config();

const seedData = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI!);

		// Clear existing data
		await User.deleteMany({});
		await Subject.deleteMany({});
		await Assignment.deleteMany({});
		await Attendance.deleteMany({});
		await Grade.deleteMany({});
		await Fee.deleteMany({});
		await Exam.deleteMany({});

		// Create Admin
		const admin = await Admin.create({
			email: "admin@college.com",
			password: "admin123",
			role: "admin",
			adminId: "ADM001",
			profile: {
				firstName: "College",
				lastName: "Admin",
				phone: "1234567890",
				address: "College Main Campus",
				dateOfBirth: new Date("1980-01-01"),
				gender: "male",
			},
			permissions: ["all"],
		});

		// Create Teachers
		const teacher1 = await Teacher.create({
			email: "john.doe@college.com",
			password: "teacher123",
			role: "teacher",
			employeeId: "TCH001",
			profile: {
				firstName: "John",
				lastName: "Doe",
				phone: "1234567891",
				address: "Teacher Quarters, College Campus",
				dateOfBirth: new Date("1985-05-15"),
				gender: "male",
			},
			department: "Computer Science",
			designation: "Assistant Professor",
			qualifications: ["M.Tech in Computer Science", "Ph.D in AI"],
			subjects: [],
			joiningDate: new Date("2020-01-15"),
			salary: 75000,
		});

		const teacher2 = await Teacher.create({
			email: "jane.smith@college.com",
			password: "teacher123",
			role: "teacher",
			employeeId: "TCH002",
			profile: {
				firstName: "Jane",
				lastName: "Smith",
				phone: "1234567892",
				address: "Teacher Quarters, College Campus",
				dateOfBirth: new Date("1988-08-20"),
				gender: "female",
			},
			department: "Mathematics",
			designation: "Associate Professor",
			qualifications: ["M.Sc in Mathematics", "Ph.D in Applied Mathematics"],
			subjects: [],
			joiningDate: new Date("2019-03-10"),
			salary: 85000,
		});

		// Create Subjects
		const subjects = await Subject.create([
			{
				code: "CS101",
				name: "Introduction to Programming",
				credits: 4,
				department: "Computer Science",
				semester: 1,
				teacher: teacher1._id,
				coPoMapping: [
					{ co: "CO1", po: ["PO1", "PO2"] },
					{ co: "CO2", po: ["PO3", "PO4"] },
				],
			},
			{
				code: "CS102",
				name: "Data Structures",
				credits: 5,
				department: "Computer Science",
				semester: 2,
				teacher: teacher1._id,
				coPoMapping: [
					{ co: "CO1", po: ["PO1", "PO2", "PO3"] },
					{ co: "CO2", po: ["PO4", "PO5"] },
				],
			},
			{
				code: "MATH101",
				name: "Calculus",
				credits: 4,
				department: "Mathematics",
				semester: 1,
				teacher: teacher2._id,
				coPoMapping: [
					{ co: "CO1", po: ["PO1"] },
					{ co: "CO2", po: ["PO2", "PO3"] },
				],
			},
		]);

		// Update teachers with subjects
		await Teacher.findByIdAndUpdate(teacher1._id, {
			subjects: [subjects[0]._id, subjects[1]._id],
		});

		await Teacher.findByIdAndUpdate(teacher2._id, {
			subjects: [subjects[2]._id],
		});

		// Create Students
		const students = await Student.create([
			{
				email: "student1@college.com",
				password: "student123",
				role: "student",
				studentId: "STU001",
				profile: {
					firstName: "Alice",
					lastName: "Johnson",
					phone: "1234567893",
					address: "Student Hostel, Room 101",
					dateOfBirth: new Date("2002-03-15"),
					gender: "female",
				},
				academicInfo: {
					admissionDate: new Date("2023-07-01"),
					currentSemester: 2,
					department: "Computer Science",
					program: "B.Tech Computer Science",
					batch: "2023-2027",
				},
				parentInfo: {
					fatherName: "Robert Johnson",
					motherName: "Maria Johnson",
					parentPhone: "1234567894",
					parentEmail: "johnson.family@email.com",
				},
				fees: {
					totalAmount: 50000,
					paidAmount: 50000,
					dueAmount: 0,
				},
			},
			{
				email: "student2@college.com",
				password: "student123",
				role: "student",
				studentId: "STU002",
				profile: {
					firstName: "Bob",
					lastName: "Williams",
					phone: "1234567895",
					address: "Student Hostel, Room 102",
					dateOfBirth: new Date("2002-07-20"),
					gender: "male",
				},
				academicInfo: {
					admissionDate: new Date("2023-07-01"),
					currentSemester: 2,
					department: "Computer Science",
					program: "B.Tech Computer Science",
					batch: "2023-2027",
				},
				parentInfo: {
					fatherName: "Michael Williams",
					motherName: "Sarah Williams",
					parentPhone: "1234567896",
					parentEmail: "williams.family@email.com",
				},
				fees: {
					totalAmount: 50000,
					paidAmount: 25000,
					dueAmount: 25000,
				},
			},
			{
				email: "student3@college.com",
				password: "student123",
				role: "student",
				studentId: "STU003",
				profile: {
					firstName: "Charlie",
					lastName: "Brown",
					phone: "1234567897",
					address: "Student Hostel, Room 103",
					dateOfBirth: new Date("2002-11-10"),
					gender: "male",
				},
				academicInfo: {
					admissionDate: new Date("2023-07-01"),
					currentSemester: 2,
					department: "Computer Science",
					program: "B.Tech Computer Science",
					batch: "2023-2027",
				},
				parentInfo: {
					fatherName: "David Brown",
					motherName: "Lisa Brown",
					parentPhone: "1234567898",
					parentEmail: "brown.family@email.com",
				},
				fees: {
					totalAmount: 50000,
					paidAmount: 0,
					dueAmount: 50000,
				},
			},
		]);

		// Create Exams
		const exams = await Exam.create([
			{
				name: "Midterm Exam",
				subject: subjects[0]._id,
				date: new Date("2024-02-15"),
				maximumMarks: 100,
				type: "theory",
				syllabus: "Chapters 1-5",
				createdBy: teacher1._id,
			},
			{
				name: "Final Exam",
				subject: subjects[0]._id,
				date: new Date("2024-04-20"),
				maximumMarks: 100,
				type: "theory",
				syllabus: "All chapters",
				createdBy: teacher1._id,
			},
			{
				name: "Quiz 1",
				subject: subjects[1]._id,
				date: new Date("2024-02-10"),
				maximumMarks: 50,
				type: "theory",
				syllabus: "Basic concepts",
				createdBy: teacher1._id,
			},
		]);

		// Create Assignments
		const assignments = await Assignment.create([
			{
				title: "Programming Assignment 1",
				description: "Write a program to implement basic data structures",
				subject: subjects[0]._id,
				teacher: teacher1._id,
				dueDate: new Date("2024-02-28"),
				maximumMarks: 100,
			},
			{
				title: "Data Structures Project",
				description: "Implement a binary search tree with all operations",
				subject: subjects[1]._id,
				teacher: teacher1._id,
				dueDate: new Date("2024-03-15"),
				maximumMarks: 150,
			},
			{
				title: "Calculus Problem Set",
				description: "Solve the given calculus problems",
				subject: subjects[2]._id,
				teacher: teacher2._id,
				dueDate: new Date("2024-02-25"),
				maximumMarks: 75,
			},
		]);

		// Create Grades
		await Grade.create([
			{
				student: students[0]._id,
				exam: exams[0]._id,
				subject: subjects[0]._id,
				marksObtained: 85,
				maximumMarks: 100,
				grade: "A",
				remarks: "Good work",
			},
			{
				student: students[1]._id,
				exam: exams[0]._id,
				subject: subjects[0]._id,
				marksObtained: 92,
				maximumMarks: 100,
				grade: "A+",
				remarks: "Excellent performance",
			},
			{
				student: students[0]._id,
				exam: exams[1]._id,
				subject: subjects[0]._id,
				marksObtained: 78,
				maximumMarks: 100,
				grade: "B+",
				remarks: "Room for improvement",
			},
		]);

		// Create Attendance records
		const attendanceDates = [
			new Date("2024-01-15"),
			new Date("2024-01-16"),
			new Date("2024-01-17"),
			new Date("2024-01-18"),
			new Date("2024-01-19"),
		];

		for (const date of attendanceDates) {
			await Attendance.create([
				{
					student: students[0]._id,
					subject: subjects[0]._id,
					date,
					status: "present",
					markedBy: teacher1._id,
				},
				{
					student: students[1]._id,
					subject: subjects[0]._id,
					date,
					status: "present",
					markedBy: teacher1._id,
				},
				{
					student: students[2]._id,
					subject: subjects[0]._id,
					date,
					status: Math.random() > 0.8 ? "absent" : "present",
					markedBy: teacher1._id,
				},
			]);
		}

		// Create Fee records
		await Fee.create([
			{
				student: students[0]._id,
				academicYear: "2023-2024",
				semester: 1,
				totalAmount: 25000,
				paidAmount: 25000,
				dueAmount: 0,
				dueDate: new Date("2023-08-15"),
				status: "paid",
			},
			{
				student: students[1]._id,
				academicYear: "2023-2024",
				semester: 1,
				totalAmount: 25000,
				paidAmount: 15000,
				dueAmount: 10000,
				dueDate: new Date("2023-08-15"),
				status: "pending",
			},
			{
				student: students[2]._id,
				academicYear: "2023-2024",
				semester: 1,
				totalAmount: 25000,
				paidAmount: 0,
				dueAmount: 25000,
				dueDate: new Date("2023-08-15"),
				status: "overdue",
			},
		]);

		console.log("Sample data seeded successfully!");
		console.log("Admin: admin@college.com / admin123");
		console.log("Teacher: john.doe@college.com / teacher123");
		console.log("Student: student1@college.com / student123");

		process.exit(0);
	} catch (error) {
		console.error("Error seeding data:", error);
		process.exit(1);
	}
};

seedData();
