/** @format */

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { EmailTemplate, EmailLog } from "../models/Notification.model";

dotenv.config();

export interface EmailOptions {
	to: string | string[];
	subject: string;
	text?: string;
	html?: string;
	template?: string;
	templateData?: Record<string, any>;
	attachments?: Array<{
		filename: string;
		path: string;
		contentType?: string;
	}>;
}

export interface BulkEmailOptions {
	recipients: Array<{
		email: string;
		name?: string;
		data?: Record<string, any>;
	}>;
	subject: string;
	template?: string;
	templateData?: Record<string, any>;
}

export class EmailService {
	private static transporter: nodemailer.Transporter;

	// Initialize email transporter
	static initializeTransporter() {
		// Check if required environment variables are set
		if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
			console.warn(
				"Email credentials not configured. Email sending will be disabled. To enable emails, set EMAIL_USER and EMAIL_PASS in .env",
			);
			return;
		}

		try {
			this.transporter = nodemailer.createTransport({
				host: process.env.EMAIL_HOST || "smtp.gmail.com",
				port: parseInt(process.env.EMAIL_PORT || "587"),
				secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
				auth: {
					user: process.env.EMAIL_USER,
					pass: process.env.EMAIL_PASS,
				},
			});

			// Verify connection configuration only in development
			if (process.env.NODE_ENV === "development") {
				this.transporter.verify((error) => {
					if (error) {
						console.warn("Email configuration is invalid:", error.message);
					} else {
						console.log("Email service is configured and ready");
					}
				});
			}
		} catch (error) {
			console.warn("Failed to initialize email transport:", error);
		}
	}

	// Send single email
	static async sendEmail(options: EmailOptions) {
		try {
			// Check if email service is configured
			if (!this.transporter) {
				console.warn("Email service not configured. Skipping email send.");
				return {
					success: false,
					error: "Email service not configured",
				};
			}

			let html = options.html;
			let text = options.text;

			// Use template if provided
			if (options.template) {
				const templateResult = await this.renderTemplate(
					options.template,
					options.templateData || {},
				);
				html = templateResult.html;
				text = templateResult.text;
			}

			const mailOptions = {
				from: `"College Management System" <${
					process.env.EMAIL_USER || "noreply@example.com"
				}>`,
				to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
				subject: options.subject,
				text,
				html,
				attachments: options.attachments,
			};

			const result = await this.transporter.sendMail(mailOptions);

			// Log email
			await this.logEmail({
				to: Array.isArray(options.to) ? options.to[0] : options.to,
				subject: options.subject,
				body: html || text || "",
				template: options.template,
				status: "sent",
				sentAt: new Date(),
				metadata: {
					messageId: result.messageId,
					recipients: Array.isArray(options.to) ? options.to : [options.to],
				},
			});

			return {
				success: true,
				messageId: result.messageId,
			};
		} catch (error) {
			console.error("Error sending email:", error);

			// Log failed email
			await this.logEmail({
				to: Array.isArray(options.to) ? options.to[0] : options.to,
				subject: options.subject,
				body: options.html || options.text || "",
				template: options.template,
				status: "failed",
				errorMessage: error instanceof Error ? error.message : "Unknown error",
			});

			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	// Send bulk emails
	static async sendBulkEmail(options: BulkEmailOptions) {
		const results = [];

		for (const recipient of options.recipients) {
			const emailOptions: EmailOptions = {
				to: recipient.email,
				subject: options.subject,
				template: options.template,
				templateData: {
					...options.templateData,
					...recipient.data,
					recipientName: recipient.name,
				},
			};

			const result = await this.sendEmail(emailOptions);
			results.push({
				email: recipient.email,
				success: result.success,
				error: result.error,
			});
		}

		return {
			success: true,
			results,
			totalSent: results.filter((r) => r.success).length,
			totalFailed: results.filter((r) => !r.success).length,
		};
	}

	// Render email template
	static async renderTemplate(templateName: string, data: Record<string, any>) {
		try {
			const template = await EmailTemplate.findOne({
				name: templateName,
				isActive: true,
			});

			if (!template) {
				throw new Error(`Template "${templateName}" not found`);
			}

			let html = template.body;
			let text = template.body;

			// Replace template variables
			for (const [key, value] of Object.entries(data)) {
				const regex = new RegExp(`{{${key}}}`, "g");
				html = html.replace(regex, String(value));
				text = text.replace(regex, String(value));
			}

			// Convert HTML to text if needed
			if (html && !text) {
				text = html.replace(/<[^>]*>/g, ""); // Simple HTML to text conversion
			}

			return { html, text };
		} catch (error) {
			console.error("Error rendering template:", error);
			throw error;
		}
	}

	// Log email
	static async logEmail(data: {
		to: string;
		subject: string;
		body: string;
		template?: string;
		status: "pending" | "sent" | "failed" | "bounced";
		sentAt?: Date;
		errorMessage?: string;
		metadata?: Record<string, any>;
	}) {
		try {
			await EmailLog.create(data);
		} catch (error) {
			console.error("Error logging email:", error);
		}
	}

	// Send welcome email to new user
	static async sendWelcomeEmail(user: any, password?: string) {
		const templateData = {
			firstName: user.profile.firstName,
			lastName: user.profile.lastName,
			email: user.email,
			role: user.role,
			password: password || "Your existing password",
			loginUrl: `${process.env.FRONTEND_URL}/login`,
		};

		return await this.sendEmail({
			to: user.email,
			subject: "Welcome to College Management System",
			template: "welcome",
			templateData,
		});
	}

	// Send fee reminder email
	static async sendFeeReminderEmail(student: any, feeDetails: any) {
		const templateData = {
			firstName: student.profile.firstName,
			lastName: student.profile.lastName,
			studentId: student.studentId,
			amount: feeDetails.amount,
			dueDate: feeDetails.dueDate,
			paymentUrl: `${process.env.FRONTEND_URL}/student/fees`,
		};

		return await this.sendEmail({
			to: student.email,
			subject: "Fee Payment Reminder",
			template: "fee_reminder",
			templateData,
		});
	}

	// Send exam notification email
	static async sendExamNotificationEmail(student: any, examDetails: any) {
		const templateData = {
			firstName: student.profile.firstName,
			lastName: student.profile.lastName,
			examName: examDetails.name,
			subject: examDetails.subject,
			date: examDetails.date,
			time: examDetails.time,
			location: examDetails.location,
		};

		return await this.sendEmail({
			to: student.email,
			subject: "Exam Notification",
			template: "exam_notification",
			templateData,
		});
	}

	// Send event invitation email
	static async sendEventInvitationEmail(recipients: any[], eventDetails: any) {
		const templateData = {
			eventName: eventDetails.title,
			description: eventDetails.description,
			date: eventDetails.startDate,
			time: eventDetails.startTime,
			location: eventDetails.location,
			registrationUrl: `${process.env.FRONTEND_URL}/events/${eventDetails._id}`,
		};

		const emailRecipients = recipients.map((recipient) => ({
			email: recipient.email,
			name: recipient.profile.firstName,
		}));

		return await this.sendBulkEmail({
			recipients: emailRecipients,
			subject: `Event Invitation: ${eventDetails.title}`,
			template: "event_invitation",
			templateData,
		});
	}

	// Send password reset email
	static async sendPasswordResetEmail(user: any, resetToken: string) {
		const templateData = {
			firstName: user.profile.firstName,
			resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
			expiryTime: "24 hours",
		};

		return await this.sendEmail({
			to: user.email,
			subject: "Password Reset Request",
			template: "password_reset",
			templateData,
		});
	}

	// Send attendance notification email
	static async sendAttendanceNotificationEmail(
		student: any,
		attendanceDetails: any,
	) {
		const templateData = {
			firstName: student.profile.firstName,
			lastName: student.profile.lastName,
			subject: attendanceDetails.subject,
			date: attendanceDetails.date,
			status: attendanceDetails.status,
			percentage: attendanceDetails.percentage,
		};

		return await this.sendEmail({
			to: student.email,
			subject: "Attendance Update",
			template: "attendance_notification",
			templateData,
		});
	}

	// Get email statistics
	static async getEmailStats(startDate?: Date, endDate?: Date) {
		try {
			const query: any = {};
			if (startDate && endDate) {
				query.createdAt = {
					$gte: startDate,
					$lte: endDate,
				};
			}

			const stats = await EmailLog.aggregate([
				{ $match: query },
				{
					$group: {
						_id: "$status",
						count: { $sum: 1 },
					},
				},
			]);

			const totalEmails = await EmailLog.countDocuments(query);

			return {
				totalEmails,
				stats,
			};
		} catch (error) {
			console.error("Error getting email stats:", error);
			throw error;
		}
	}
}

// Initialize transporter when module is loaded
EmailService.initializeTransporter();
