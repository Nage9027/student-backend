/** @format */

import { Router } from "express";
import {
	createRazorpayOrder,
	verifyRazorpayPayment,
	getPaymentStatus,
	createRazorpayRefund,
	getRefundStatus,
	createPaymentLink,
	handleRazorpayWebhook,
} from "../controllers/paymentGateway.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

// Razorpay payment routes
router.post("/razorpay/order", authenticateToken, createRazorpayOrder);
router.post("/razorpay/verify", authenticateToken, verifyRazorpayPayment);
router.get(
	"/razorpay/payment/:paymentId/status",
	authenticateToken,
	getPaymentStatus,
);

// Refund routes
router.post(
	"/razorpay/refund",
	authenticateToken,
	authorizeRoles(["admin"]),
	createRazorpayRefund,
);
router.get(
	"/razorpay/refund/:refundId/status",
	authenticateToken,
	getRefundStatus,
);

// Payment link routes
router.post("/razorpay/link", authenticateToken, createPaymentLink);

// Webhook routes (no authentication required for webhooks)
router.post("/razorpay/webhook", handleRazorpayWebhook);

export default router;
