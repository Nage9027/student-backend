/** @format */

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User, Student, Teacher, Admin } from "../models/User.model";

const generateToken = (userId: string, role: string): string => {
	return jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
		expiresIn: "30d",
	});
};

export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email }).select("+password");
		if (!user || !(await (user as any).comparePassword(password))) {
			res.status(401).json({ message: "Invalid credentials" });
			return;
		}

		if (!user.isActive) {
			res.status(403).json({ message: "Account deactivated" });
			return;
		}

		user.lastLogin = new Date();
		await user.save();

		const token = generateToken(user._id.toString(), user.role);

		res.json({
			token,
			user: {
				id: user._id,
				email: user.email,
				role: user.role,
				profile: user.profile,
			},
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
};

export const registerStudent = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { email, password, profile, academicInfo, parentInfo } = req.body;

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			res.status(400).json({ message: "User already exists" });
			return;
		}

		// Generate student ID
		const studentId = `STU${Date.now().toString().slice(-6)}`;

		const student = await Student.create({
			email,
			password,
			role: "student",
			profile,
			studentId,
			academicInfo,
			parentInfo,
		});

		res.status(201).json({
			message: "Student registered successfully",
			studentId: student.studentId,
		});
	} catch (error) {
		res.status(500).json({ message: "Registration failed", error });
	}
};
