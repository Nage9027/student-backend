/** @format */

import { Router } from "express";
import {
	sendCustomEmail,
	sendBulkEmail,
	sendWelcomeEmail,
	sendFeeReminder,
	sendExamNotification,
	sendEventInvitation,
	sendPasswordResetEmail,
	sendAttendanceNotification,
	getEmailStats,
	getEmailLogs,
	testEmailConfig,
} from "../controllers/email.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

// Email sending routes
router.post(
	"/send",
	authenticateToken,
	authorizeRoles(["admin", "teacher"]),
	sendCustomEmail,
);
router.post(
	"/send-bulk",
	authenticateToken,
	authorizeRoles(["admin", "teacher"]),
	sendBulkEmail,
);
router.post(
	"/welcome",
	authenticateToken,
	authorizeRoles(["admin"]),
	sendWelcomeEmail,
);
router.post(
	"/fee-reminder",
	authenticateToken,
	authorizeRoles(["admin"]),
	sendFeeReminder,
);
router.post(
	"/exam-notification",
	authenticateToken,
	authorizeRoles(["admin", "teacher"]),
	sendExamNotification,
);
router.post(
	"/event-invitation",
	authenticateToken,
	authorizeRoles(["admin", "teacher"]),
	sendEventInvitation,
);
router.post("/password-reset", sendPasswordResetEmail);
router.post(
	"/attendance-notification",
	authenticateToken,
	authorizeRoles(["admin", "teacher"]),
	sendAttendanceNotification,
);

// Email management routes
router.get(
	"/stats",
	authenticateToken,
	authorizeRoles(["admin"]),
	getEmailStats,
);
router.get("/logs", authenticateToken, authorizeRoles(["admin"]), getEmailLogs);
router.post(
	"/test",
	authenticateToken,
	authorizeRoles(["admin"]),
	testEmailConfig,
);

export default router;
