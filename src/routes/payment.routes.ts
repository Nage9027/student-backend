/** @format */

import { Router } from "express";
import {
	getAllPayments,
	getPaymentById,
	createPayment,
	updatePaymentStatus,
	getPaymentMethods,
	addPaymentMethod,
	updatePaymentMethod,
	deletePaymentMethod,
	createRefund,
	updateRefundStatus,
	getRefunds,
	getPaymentGateways,
	createPaymentGateway,
	updatePaymentGateway,
	getPaymentStats,
} from "../controllers/payment.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

// Payment Management Routes
router.get("/payments", authenticateToken, getAllPayments);
router.get("/payments/:id", authenticateToken, getPaymentById);
router.post("/payments", authenticateToken, createPayment);
router.put(
	"/payments/:id/status",
	authenticateToken,
	authorizeRoles(["admin"]),
	updatePaymentStatus,
);

// Payment Method Management Routes
router.get("/student/:studentId/methods", authenticateToken, getPaymentMethods);
router.post("/methods", authenticateToken, addPaymentMethod);
router.put("/methods/:id", authenticateToken, updatePaymentMethod);
router.delete("/methods/:id", authenticateToken, deletePaymentMethod);

// Refund Management Routes
router.post(
	"/refunds",
	authenticateToken,
	authorizeRoles(["admin"]),
	createRefund,
);
router.put(
	"/refunds/:id/status",
	authenticateToken,
	authorizeRoles(["admin"]),
	updateRefundStatus,
);
router.get(
	"/refunds",
	authenticateToken,
	authorizeRoles(["admin"]),
	getRefunds,
);

// Payment Gateway Management Routes
router.get(
	"/gateways",
	authenticateToken,
	authorizeRoles(["admin"]),
	getPaymentGateways,
);
router.post(
	"/gateways",
	authenticateToken,
	authorizeRoles(["admin"]),
	createPaymentGateway,
);
router.put(
	"/gateways/:id",
	authenticateToken,
	authorizeRoles(["admin"]),
	updatePaymentGateway,
);

// Payment Statistics Routes
router.get(
	"/stats",
	authenticateToken,
	authorizeRoles(["admin"]),
	getPaymentStats,
);

export default router;
