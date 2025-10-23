/** @format */

import { Request, Response } from "express";
import { Attendance } from "../models/Attendance.model";
import { User } from "../models/User.model";
import { Grade } from "../models/Grade.model";
import { Assignment } from "../models/Assignment.model";
import { Fee } from "../models/Fee.model";
import { Subject } from "../models/Subject.model";

export const getStudentProfile = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const studentId = (req as any).user._id;

		const student = await User.findById(studentId)
			.select("-password")
			.populate("academicInfo.department", "name code");

		if (!student) {
			res.status(404).json({ message: "Student not found" });
			return;
		}

		res.json(student);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch profile", error });
	}
};

export const getStudentAttendance = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const studentId = (req as any).user._id;
		const { subjectId, month, year } = req.query;

		const query: any = { student: studentId };

		if (subjectId) {
			query.subject = subjectId;
		}

		if (month && year) {
			const startDate = new Date(Number(year), Number(month) - 1, 1);
			const endDate = new Date(Number(year), Number(month), 0);
			query.date = { $gte: startDate, $lte: endDate };
		}

		const attendance = await Attendance.find(query)
			.populate("subject", "name code")
			.populate("markedBy", "profile firstName lastName")
			.sort({ date: -1 });

		// Calculate attendance percentage
		const totalClasses = attendance.length;
		const presentClasses = attendance.filter(
			(a) => a.status === "present",
		).length;
		const attendancePercentage =
			totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

		res.json({
			attendance,
			summary: {
				totalClasses,
				presentClasses,
				absentClasses: attendance.filter((a) => a.status === "absent").length,
				leaveClasses: attendance.filter((a) => a.status === "leave").length,
				attendancePercentage: Math.round(attendancePercentage * 100) / 100,
			},
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch attendance", error });
	}
};

export const getStudentGrades = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const studentId = (req as any).user._id;

		const grades = await Grade.find({ student: studentId })
			.populate("exam", "name type date maximumMarks")
			.populate("subject", "name code credits")
			.sort({ "exam.date": -1 });

		// Calculate overall performance
		const totalMarks = grades.reduce(
			(sum, grade) => sum + grade.marksObtained,
			0,
		);
		const totalMaxMarks = grades.reduce(
			(sum, grade) => sum + grade.maximumMarks,
			0,
		);
		const overallPercentage =
			totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

		// Calculate CGPA (simplified)
		const gradePoints: { [key: string]: number } = {
			"A+": 4.0,
			A: 4.0,
			B: 3.0,
			C: 2.0,
			D: 1.0,
			E: 0.5,
			F: 0.0,
		};

		let totalCredits = 0;
		let totalGradePoints = 0;

		grades.forEach((grade) => {
			const subject = grade.subject as any;
			const credits = subject?.credits || 1;
			totalCredits += credits;
			totalGradePoints += gradePoints[grade.grade] * credits;
		});

		const cgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

		res.json({
			grades,
			performance: {
				totalSubjects: grades.length,
				overallPercentage: Math.round(overallPercentage * 100) / 100,
				cgpa: Math.round(cgpa * 100) / 100,
				totalCredits,
			},
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch grades", error });
	}
};

export const getStudentAssignments = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const studentId = (req as any).user._id;
		const { status } = req.query;

		const subjects = await Subject.find({
			department: (req as any).user.academicInfo.department,
			semester: (req as any).user.academicInfo.currentSemester,
		});

		const subjectIds = subjects.map((subject) => subject._id);

		let assignments = await Assignment.find({
			subject: { $in: subjectIds },
		})
			.populate("subject", "name code")
			.populate("teacher", "profile firstName lastName");

		// Filter assignments based on submission status
		if (status === "submitted") {
			assignments = assignments.filter((assignment) =>
				assignment.submissions.some(
					(sub) => sub.student.toString() === studentId,
				),
			);
		} else if (status === "pending") {
			assignments = assignments.filter(
				(assignment) =>
					!assignment.submissions.some(
						(sub) => sub.student.toString() === studentId,
					) && new Date(assignment.dueDate) > new Date(),
			);
		} else if (status === "overdue") {
			assignments = assignments.filter(
				(assignment) =>
					!assignment.submissions.some(
						(sub) => sub.student.toString() === studentId,
					) && new Date(assignment.dueDate) < new Date(),
			);
		}

		res.json(assignments);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch assignments", error });
	}
};

export const submitAssignment = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const studentId = (req as any).user._id;
		const { assignmentId } = req.params;
		const { fileUrl } = req.body;

		const assignment = await Assignment.findById(assignmentId);
		if (!assignment) {
			res.status(404).json({ message: "Assignment not found" });
			return;
		}

		// Check if already submitted
		const existingSubmission = assignment.submissions.find(
			(sub) => sub.student.toString() === studentId,
		);

		if (existingSubmission) {
			res.status(400).json({ message: "Assignment already submitted" });
			return;
		}

		// Check if overdue
		const isLate = new Date() > new Date(assignment.dueDate);
		const status = isLate ? "late" : "submitted";

		assignment.submissions.push({
			student: studentId,
			fileUrl,
			submittedAt: new Date(),
			status,
		} as any);

		await assignment.save();

		res.json({
			message: "Assignment submitted successfully",
			submission: assignment.submissions[assignment.submissions.length - 1],
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to submit assignment", error });
	}
};

export const getStudentFees = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const studentId = (req as any).user._id;

		const fees = await Fee.find({ student: studentId }).sort({
			academicYear: -1,
			semester: -1,
		});

		res.json(fees);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch fee details", error });
	}
};
