/** @format */

import { Router } from "express";
import {
	getAllRoutes,
	createRoute,
	updateRoute,
	getAllVehicles,
	createVehicle,
	updateVehicle,
	allocateTransport,
	activateTransport,
	cancelTransport,
	getStudentAllocations,
	makeTransportPayment,
	getTransportPayments,
	addStopToRoute,
	removeStopFromRoute,
} from "../controllers/transport.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

// Route Management Routes
router.get("/routes", authenticateToken, getAllRoutes);
router.post(
	"/routes",
	authenticateToken,
	authorizeRoles(["admin"]),
	createRoute,
);
router.put(
	"/routes/:id",
	authenticateToken,
	authorizeRoles(["admin"]),
	updateRoute,
);

// Route Stops Management
router.post(
	"/routes/:routeId/stops",
	authenticateToken,
	authorizeRoles(["admin"]),
	addStopToRoute,
);
router.delete(
	"/routes/:routeId/stops/:stopIndex",
	authenticateToken,
	authorizeRoles(["admin"]),
	removeStopFromRoute,
);

// Vehicle Management Routes
router.get("/vehicles", authenticateToken, getAllVehicles);
router.post(
	"/vehicles",
	authenticateToken,
	authorizeRoles(["admin"]),
	createVehicle,
);
router.put(
	"/vehicles/:id",
	authenticateToken,
	authorizeRoles(["admin"]),
	updateVehicle,
);

// Transport Allocation Routes
router.post(
	"/allocate",
	authenticateToken,
	authorizeRoles(["admin", "transport_manager"]),
	allocateTransport,
);
router.put(
	"/allocations/:allocationId/activate",
	authenticateToken,
	authorizeRoles(["admin", "transport_manager"]),
	activateTransport,
);
router.put(
	"/allocations/:allocationId/cancel",
	authenticateToken,
	authorizeRoles(["admin", "transport_manager"]),
	cancelTransport,
);
router.get(
	"/student/:studentId/allocations",
	authenticateToken,
	getStudentAllocations,
);

// Transport Payment Routes
router.post("/payments", authenticateToken, makeTransportPayment);
router.get(
	"/student/:studentId/payments",
	authenticateToken,
	getTransportPayments,
);

export default router;
