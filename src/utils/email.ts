/** @format */

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	service: process.env.EMAIL_SERVICE,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

export const sendEmail = async (
	to: string,
	subject: string,
	html: string,
): Promise<void> => {
	try {
		await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to,
			subject,
			html,
		});
		console.log("Email sent successfully");
	} catch (error) {
		console.error("Error sending email:", error);
		throw new Error("Failed to send email");
	}
};

export const sendWelcomeEmail = async (
	email: string,
	name: string,
	role: string,
): Promise<void> => {
	const subject = "Welcome to College Management System";
	const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Welcome to College Management System!</h2>
      <p>Dear ${name},</p>
      <p>Your ${role} account has been successfully created.</p>
      <p>You can now access the system using your credentials.</p>
      <br>
      <p>Best regards,<br>College Management Team</p>
    </div>
  `;

	await sendEmail(email, subject, html);
};
