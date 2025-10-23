/** @format */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User, Student, Teacher, Admin } from "../src/models/User.model.js";
import { Subject } from "../src/models/Subject.model.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/cms");

    // Clear existing data
    await User.deleteMany({});
    await Subject.deleteMany({});

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
    await Student.create([
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
    ]);

    console.log("✅ Sample data seeded successfully!");
    console.log("👤 Admin: admin@college.com / admin123");
    console.log("👩‍🏫 Teacher: john.doe@college.com / teacher123");
    console.log("🎓 Student: student1@college.com / student123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
