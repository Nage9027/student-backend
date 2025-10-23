/** @format */

import { Request, Response } from "express";
import { Attendance } from "../models/Attendance.model";
import { Grade } from "../models/Grade.model";
import { Assignment } from "../models/Assignment.model";
import { Subject } from "../models/Subject.model";
import { User } from "../models/User.model";

export const markAttendance = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { studentId, subjectId, date, status } = req.body;
		const teacherId = (req as any).user._id;

		const attendance = await Attendance.findOneAndUpdate(
			{ student: studentId, subject: subjectId, date: new Date(date) },
			{
				student: studentId,
				subject: subjectId,
				date: new Date(date),
				status,
				markedBy: teacherId,
			},
			{ upsert: true, new: true },
		)
			.populate("student", "profile studentId")
			.populate("subject", "name code");

		res.json({
			message: "Attendance marked successfully",
			attendance,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to mark attendance", error });
	}
};

export const getStudentsBySubject = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const teacherId = (req as any).user._id;
		const { subjectId } = req.params;

		const subject = await Subject.findById(subjectId);
		if (!subject) {
			res.status(404).json({ message: "Subject not found" });
			return;
		}

		const students = await User.find({
			role: "student",
			"academicInfo.department": subject.department,
			"academicInfo.currentSemester": subject.semester,
		}).select("profile studentId academicInfo");

		res.json(students);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch students", error });
	}
};

export const updateGrades = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const {
			studentId,
			examId,
			marksObtained,
			remarks,
			maximumMarks,
			subjectId,
		} = req.body;

		// If an Exam model exists in the project, it would be safe to fetch it here.
		// To keep the seed/build working when Exam model is absent, accept maximumMarks and subjectId in the request body.
		const examMaxMarks = maximumMarks;

		if (typeof examMaxMarks !== "number" || examMaxMarks <= 0) {
			res
				.status(400)
				.json({ message: "maximumMarks must be provided and > 0" });
			return;
		}

		if (marksObtained > examMaxMarks) {
			res
				.status(400)
				.json({ message: "Marks obtained cannot exceed maximum marks" });
			return;
		}

		// Calculate grade based on percentage
		const percentage = (marksObtained / examMaxMarks) * 100;
		let grade = "F";
		if (percentage >= 90) grade = "A+";
		else if (percentage >= 80) grade = "A";
		else if (percentage >= 70) grade = "B";
		else if (percentage >= 60) grade = "C";
		else if (percentage >= 50) grade = "D";
		else if (percentage >= 40) grade = "E";

		const studentGrade = await Grade.findOneAndUpdate(
			{ student: studentId, exam: examId },
			{
				student: studentId,
				exam: examId,
				subject: subjectId,
				marksObtained,
				maximumMarks: examMaxMarks,
				grade,
				remarks,
			},
			{ upsert: true, new: true },
		)
			.populate("student", "profile studentId")
			.populate("exam", "name type");

		res.json({
			message: "Grade updated successfully",
			grade: studentGrade,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to update grade", error });
	}
};

export const createAssignment = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const teacherId = (req as any).user._id;
		const { title, description, subjectId, dueDate, maximumMarks } = req.body;

		const assignment = await Assignment.create({
			title,
			description,
			subject: subjectId,
			teacher: teacherId,
			dueDate: new Date(dueDate),
			maximumMarks,
		});

		res.status(201).json({
			message: "Assignment created successfully",
			assignment,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to create assignment", error });
	}
};

export const getTeacherSubjects = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const teacherId = (req as any).user._id;

		const subjects = await Subject.find({ teacher: teacherId }).populate(
			"teacher",
			"profile employeeId",
		);

		res.json(subjects);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch subjects", error });
	}
};

export const getTeacherAssignments = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const teacherId = (req as any).user._id;
		const { status } = req.query;

		let query: any = { teacher: teacherId };

		if (status === 'active') {
			query.dueDate = { $gte: new Date() };
		} else if (status === 'closed') {
			query.dueDate = { $lt: new Date() };
		}

		const assignments = await Assignment.find(query)
			.populate('subject', 'name code')
			.sort({ dueDate: -1 });

		res.json(assignments);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch assignments", error });
	}
};

export const getAssignmentSubmissions = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const assignment = await Assignment.findById(id)
			.populate('subject', 'name code')
			.populate('submissions.student', 'profile studentId');

		if (!assignment) {
			res.status(404).json({ message: "Assignment not found" });
			return;
		}

		res.json(assignment.submissions);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch submissions", error });
	}
};

export const gradeSubmission = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id, submissionId } = req.params;
		const { marks, feedback } = req.body;

		const assignment = await Assignment.findById(id);
		if (!assignment) {
			res.status(404).json({ message: "Assignment not found" });
			return;
		}

		const submission = assignment.submissions.id(submissionId);
		if (!submission) {
			res.status(404).json({ message: "Submission not found" });
			return;
		}

		submission.marks = marks;
		submission.feedback = feedback;
		submission.status = 'graded';

		await assignment.save();

		res.json({
			message: "Submission graded successfully",
			submission
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to grade submission", error });
	}
};

export const getTeacherGrades = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const teacherId = (req as any).user._id;
		const { subjectId, studentId } = req.query;

		const subjects = await Subject.find({ teacher: teacherId });
		const subjectIds = subjects.map(subject => subject._id);

		let query: any = { subject: { $in: subjectIds } };

		if (subjectId) {
			query.subject = subjectId;
		}

		if (studentId) {
			query.student = studentId;
		}

		const grades = await Grade.find(query)
			.populate('student', 'profile studentId')
			.populate('subject', 'name code')
			.populate('exam', 'name type date')
			.sort({ createdAt: -1 });

		res.json(grades);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch grades", error });
	}
};

export const getAttendanceBySubject = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { subjectId } = req.params;
		const { date, month, year } = req.query;

		let query: any = { subject: subjectId };

		if (date) {
			query.date = new Date(date as string);
		} else if (month && year) {
			const startDate = new Date(Number(year), Number(month) - 1, 1);
			const endDate = new Date(Number(year), Number(month), 0);
			query.date = { $gte: startDate, $lte: endDate };
		}

		const attendance = await Attendance.find(query)
			.populate('student', 'profile studentId')
			.populate('subject', 'name code')
			.sort({ date: -1 });

		res.json(attendance);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch attendance", error });
	}
};