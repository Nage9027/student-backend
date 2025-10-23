/** @format */

import { Request, Response } from "express";
import { EmailService } from "../services/email.service";
import { EmailTemplate, EmailLog } from "../models/Notification.model";
import { User } from "../models/User.model";

// Send custom email
export const sendCustomEmail = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { to, subject, text, html, template, templateData, attachments } =
			req.body;

		const result = await EmailService.sendEmail({
			to,
			subject,
			text,
			html,
			template,
			templateData,
			attachments,
		});

		if (result.success) {
			res.json({
				message: "Email sent successfully",
				messageId: result.messageId,
			});
		} else {
			res.status(500).json({
				message: "Failed to send email",
				error: result.error,
			});
		}
	} catch (error) {
		res.status(500).json({ message: "Failed to send email", error });
	}
};

// Send bulk email
export const sendBulkEmail = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { recipients, subject, template, templateData } = req.body;

		const result = await EmailService.sendBulkEmail({
			recipients,
			subject,
			template,
			templateData,
		});

		res.json({
			message: "Bulk email sent successfully",
			totalSent: result.totalSent,
			totalFailed: result.totalFailed,
			results: result.results,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to send bulk email", error });
	}
};

// Send welcome email
export const sendWelcomeEmail = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { userId, password } = req.body;

		const user = await User.findById(userId);
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		const result = await EmailService.sendWelcomeEmail(user, password);

		if (result.success) {
			res.json({
				message: "Welcome email sent successfully",
				messageId: result.messageId,
			});
		} else {
			res.status(500).json({
				message: "Failed to send welcome email",
				error: result.error,
			});
		}
	} catch (error) {
		res.status(500).json({ message: "Failed to send welcome email", error });
	}
};

// Send fee reminder
export const sendFeeReminder = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { studentId, feeDetails } = req.body;

		const student = await User.findById(studentId);
		if (!student) {
			res.status(404).json({ message: "Student not found" });
			return;
		}

		const result = await EmailService.sendFeeReminderEmail(student, feeDetails);

		if (result.success) {
			res.json({
				message: "Fee reminder sent successfully",
				messageId: result.messageId,
			});
		} else {
			res.status(500).json({
				message: "Failed to send fee reminder",
				error: result.error,
			});
		}
	} catch (error) {
		res.status(500).json({ message: "Failed to send fee reminder", error });
	}
};

// Send exam notification
export const sendExamNotification = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { studentId, examDetails } = req.body;

		const student = await User.findById(studentId);
		if (!student) {
			res.status(404).json({ message: "Student not found" });
			return;
		}

		const result = await EmailService.sendExamNotificationEmail(
			student,
			examDetails,
		);

		if (result.success) {
			res.json({
				message: "Exam notification sent successfully",
				messageId: result.messageId,
			});
		} else {
			res.status(500).json({
				message: "Failed to send exam notification",
				error: result.error,
			});
		}
	} catch (error) {
		res
			.status(500)
			.json({ message: "Failed to send exam notification", error });
	}
};

// Send event invitation
export const sendEventInvitation = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { recipientIds, eventDetails } = req.body;

		const recipients = await User.find({ _id: { $in: recipientIds } });
		if (recipients.length === 0) {
			res.status(404).json({ message: "No recipients found" });
			return;
		}

		const result = await EmailService.sendEventInvitationEmail(
			recipients,
			eventDetails,
		);

		res.json({
			message: "Event invitation sent successfully",
			totalSent: result.totalSent,
			totalFailed: result.totalFailed,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to send event invitation", error });
	}
};

// Send password reset email
export const sendPasswordResetEmail = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { email, resetToken } = req.body;

		const user = await User.findOne({ email });
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		const result = await EmailService.sendPasswordResetEmail(user, resetToken);

		if (result.success) {
			res.json({
				message: "Password reset email sent successfully",
				messageId: result.messageId,
			});
		} else {
			res.status(500).json({
				message: "Failed to send password reset email",
				error: result.error,
			});
		}
	} catch (error) {
		res
			.status(500)
			.json({ message: "Failed to send password reset email", error });
	}
};

// Send attendance notification
export const sendAttendanceNotification = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { studentId, attendanceDetails } = req.body;

		const student = await User.findById(studentId);
		if (!student) {
			res.status(404).json({ message: "Student not found" });
			return;
		}

		const result = await EmailService.sendAttendanceNotificationEmail(
			student,
			attendanceDetails,
		);

		if (result.success) {
			res.json({
				message: "Attendance notification sent successfully",
				messageId: result.messageId,
			});
		} else {
			res.status(500).json({
				message: "Failed to send attendance notification",
				error: result.error,
			});
		}
	} catch (error) {
		res
			.status(500)
			.json({ message: "Failed to send attendance notification", error });
	}
};

// Get email statistics
export const getEmailStats = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { startDate, endDate } = req.query;

		const stats = await EmailService.getEmailStats(
			startDate ? new Date(startDate as string) : undefined,
			endDate ? new Date(endDate as string) : undefined,
		);

		res.json(stats);
	} catch (error) {
		res.status(500).json({ message: "Failed to get email statistics", error });
	}
};

// Get email logs
export const getEmailLogs = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { page = 1, limit = 10, status, to, startDate, endDate } = req.query;
		const query: any = {};

		if (status) {
			query.status = status;
		}

		if (to) {
			query.to = { $regex: to, $options: "i" };
		}

		if (startDate && endDate) {
			query.createdAt = {
				$gte: new Date(startDate as string),
				$lte: new Date(endDate as string),
			};
		}

		const logs = await EmailLog.find(query)
			.populate("template", "name category")
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const total = await EmailLog.countDocuments(query);

		res.json({
			logs,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch email logs", error });
	}
};

// Test email configuration
export const testEmailConfig = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { testEmail } = req.body;

		const result = await EmailService.sendEmail({
			to: testEmail,
			subject: "Test Email - College Management System",
			html: "<h1>Test Email</h1><p>This is a test email to verify email configuration.</p>",
			text: "Test Email - This is a test email to verify email configuration.",
		});

		if (result.success) {
			res.json({
				message: "Test email sent successfully",
				messageId: result.messageId,
			});
		} else {
			res.status(500).json({
				message: "Failed to send test email",
				error: result.error,
			});
		}
	} catch (error) {
		res.status(500).json({ message: "Failed to send test email", error });
	}
};
