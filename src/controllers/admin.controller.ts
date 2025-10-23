/** @format */

import { Request, Response } from "express";
import { User, Teacher, Student, Admin } from "../models/User.model";
import { Subject } from "../models/Subject.model";
import { Fee } from "../models/Fee.model";
import { Exam } from "../models/Exam.model";
import { Assignment } from "../models/Assignment.model";
import { Attendance } from "../models/Attendance.model";
import { Grade } from "../models/Grade.model";
import { IPaginatedRequest } from "../types/common";
import { getPaginationParams } from "../utils/pagination";

export const createTeacher = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const {
			email,
			password,
			profile,
			department,
			designation,
			qualifications,
			subjects,
			salary,
		} = req.body;

		const employeeId = `TCH${Date.now().toString().slice(-6)}`;

		const teacher = await Teacher.create({
			email,
			password,
			role: "teacher",
			profile,
			employeeId,
			department,
			designation,
			qualifications,
			subjects,
			joiningDate: new Date(),
			salary,
		});

		res.status(201).json({
			message: "Teacher created successfully",
			teacher: {
				id: teacher._id,
				employeeId: teacher.employeeId,
				email: teacher.email,
				profile: teacher.profile,
			},
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to create teacher", error });
	}
};

export const getDashboardStats = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const totalStudents = await Student.countDocuments();
		const totalTeachers = await Teacher.countDocuments();
		const totalSubjects = await Subject.countDocuments();

		// Recent admissions (last 30 days)
		const recentAdmissions = await Student.countDocuments({
			"academicInfo.admissionDate": {
				$gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
			},
		});

		res.json({
			totalStudents,
			totalTeachers,
			totalSubjects,
			recentAdmissions,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch dashboard stats", error });
	}
};

// Student Management
export const getAllStudents = async (
	req: IPaginatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const { search, department, semester } = req.query;
		const { page, limit, skip } = getPaginationParams(req.query);
		const query: any = { role: "student" };

		if (search) {
			query.$or = [
				{ "profile.firstName": { $regex: search, $options: "i" } },
				{ "profile.lastName": { $regex: search, $options: "i" } },
				{ studentId: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
			];
		}

		if (department) {
			query["academicInfo.department"] = department;
		}

		if (semester) {
			query["academicInfo.currentSemester"] = parseInt(semester as string);
		}

		const students = await Student.find(query)
			.select("-password")
			.sort({ createdAt: -1 })
			.limit(limit)
			.skip(skip);

		const total = await Student.countDocuments(query);

		res.json({
			students,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch students", error });
	}
};

export const getStudentById = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const student = await Student.findById(id).select("-password");

		if (!student) {
			res.status(404).json({ message: "Student not found" });
			return;
		}

		res.json(student);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch student", error });
	}
};

export const createStudent = async (
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
			message: "Student created successfully",
			student: {
				id: student._id,
				studentId: student.studentId,
				email: student.email,
				profile: student.profile,
			},
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to create student", error });
	}
};

export const updateStudent = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		const student = await Student.findByIdAndUpdate(id, updateData, {
			new: true,
		}).select("-password");

		if (!student) {
			res.status(404).json({ message: "Student not found" });
			return;
		}

		res.json({
			message: "Student updated successfully",
			student,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to update student", error });
	}
};

export const deleteStudent = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const student = await Student.findByIdAndDelete(id);

		if (!student) {
			res.status(404).json({ message: "Student not found" });
			return;
		}

		res.json({ message: "Student deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Failed to delete student", error });
	}
};

// Teacher Management
export const getAllTeachers = async (
	req: IPaginatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const { search, department } = req.query;
		const { page, limit, skip } = getPaginationParams(req.query);
		const query: any = { role: "teacher" };

		if (search) {
			query.$or = [
				{ "profile.firstName": { $regex: search, $options: "i" } },
				{ "profile.lastName": { $regex: search, $options: "i" } },
				{ employeeId: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
			];
		}

		if (department) {
			query.department = department;
		}

		const teachers = await Teacher.find(query)
			.select("-password")
			.sort({ createdAt: -1 })
			.limit(limit)
			.skip(skip);

		const total = await Teacher.countDocuments(query);

		res.json({
			teachers,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch teachers", error });
	}
};

export const getTeacherById = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const teacher = await Teacher.findById(id).select("-password");

		if (!teacher) {
			res.status(404).json({ message: "Teacher not found" });
			return;
		}

		res.json(teacher);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch teacher", error });
	}
};

export const updateTeacher = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		const teacher = await Teacher.findByIdAndUpdate(id, updateData, {
			new: true,
		}).select("-password");

		if (!teacher) {
			res.status(404).json({ message: "Teacher not found" });
			return;
		}

		res.json({
			message: "Teacher updated successfully",
			teacher,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to update teacher", error });
	}
};

export const deleteTeacher = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const teacher = await Teacher.findByIdAndDelete(id);

		if (!teacher) {
			res.status(404).json({ message: "Teacher not found" });
			return;
		}

		res.json({ message: "Teacher deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Failed to delete teacher", error });
	}
};

// Subject Management
export const getAllSubjects = async (
	req: IPaginatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const { search, department, semester } = req.query;
		const { page, limit, skip } = getPaginationParams(req.query);
		const query: any = {};

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ code: { $regex: search, $options: "i" } },
			];
		}

		if (department) {
			query.department = department;
		}

		if (semester) {
			query.semester = parseInt(semester as string);
		}

		const subjects = await Subject.find(query)
			.populate("teacher", "profile employeeId")
			.sort({ createdAt: -1 })
			.limit(limit)
			.skip(skip);

		const total = await Subject.countDocuments(query);

		res.json({
			subjects,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch subjects", error });
	}
};

export const createSubject = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { code, name, credits, department, semester, teacher, coPoMapping } =
			req.body;

		const existingSubject = await Subject.findOne({ code });
		if (existingSubject) {
			res
				.status(400)
				.json({ message: "Subject with this code already exists" });
			return;
		}

		const subject = await Subject.create({
			code,
			name,
			credits,
			department,
			semester,
			teacher,
			coPoMapping,
		});

		res.status(201).json({
			message: "Subject created successfully",
			subject,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to create subject", error });
	}
};

export const updateSubject = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		const subject = await Subject.findByIdAndUpdate(id, updateData, {
			new: true,
		}).populate("teacher", "profile employeeId");

		if (!subject) {
			res.status(404).json({ message: "Subject not found" });
			return;
		}

		res.json({
			message: "Subject updated successfully",
			subject,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to update subject", error });
	}
};

export const deleteSubject = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const subject = await Subject.findByIdAndDelete(id);

		if (!subject) {
			res.status(404).json({ message: "Subject not found" });
			return;
		}

		res.json({ message: "Subject deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Failed to delete subject", error });
	}
};

// Fee Management
export const getAllFees = async (
	req: IPaginatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const { studentId, academicYear, semester, status } = req.query;
		const { page, limit, skip } = getPaginationParams(req.query);
		const query: any = {};

		if (studentId) {
			query.student = studentId;
		}

		if (academicYear) {
			query.academicYear = academicYear;
		}

		if (semester) {
			query.semester = parseInt(semester as string);
		}

		if (status) {
			query.status = status;
		}

		const fees = await Fee.find(query)
			.populate("student", "profile studentId")
			.sort({ academicYear: -1, semester: -1 })
			.limit(limit)
			.skip(skip);

		const total = await Fee.countDocuments(query);

		res.json({
			fees,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch fees", error });
	}
};

export const createFee = async (req: Request, res: Response): Promise<void> => {
	try {
		const { student, academicYear, semester, totalAmount, dueDate } = req.body;

		const existingFee = await Fee.findOne({ student, academicYear, semester });
		if (existingFee) {
			res
				.status(400)
				.json({
					message:
						"Fee record already exists for this student, academic year, and semester",
				});
			return;
		}

		const fee = await Fee.create({
			student,
			academicYear,
			semester,
			totalAmount,
			dueAmount: totalAmount,
			dueDate: new Date(dueDate),
		});

		res.status(201).json({
			message: "Fee record created successfully",
			fee,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to create fee record", error });
	}
};

export const updateFee = async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		const fee = await Fee.findByIdAndUpdate(id, updateData, {
			new: true,
		}).populate("student", "profile studentId");

		if (!fee) {
			res.status(404).json({ message: "Fee record not found" });
			return;
		}

		res.json({
			message: "Fee record updated successfully",
			fee,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to update fee record", error });
	}
};

export const deleteFee = async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;
		const fee = await Fee.findByIdAndDelete(id);

		if (!fee) {
			res.status(404).json({ message: "Fee record not found" });
			return;
		}

		res.json({ message: "Fee record deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Failed to delete fee record", error });
	}
};
