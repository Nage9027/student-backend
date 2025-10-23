/** @format */

import { Router } from "express";
import {
	getAllEvents,
	getEventById,
	createEvent,
	updateEvent,
	deleteEvent,
	registerForEvent,
	cancelRegistration,
	getEventRegistrations,
	getAllClubs,
	createClub,
	joinClub,
	leaveClub,
	getClubMembers,
} from "../controllers/event.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

// Event Management Routes
router.get("/events", authenticateToken, getAllEvents);
router.get("/events/:id", authenticateToken, getEventById);
router.post(
	"/events",
	authenticateToken,
	authorizeRoles(["admin", "teacher"]),
	createEvent,
);
router.put(
	"/events/:id",
	authenticateToken,
	authorizeRoles(["admin", "teacher"]),
	updateEvent,
);
router.delete(
	"/events/:id",
	authenticateToken,
	authorizeRoles(["admin", "teacher"]),
	deleteEvent,
);

// Event Registration Routes
router.post("/events/:eventId/register", authenticateToken, registerForEvent);
router.put(
	"/registrations/:registrationId/cancel",
	authenticateToken,
	cancelRegistration,
);
router.get(
	"/events/:eventId/registrations",
	authenticateToken,
	getEventRegistrations,
);

// Club Management Routes
router.get("/clubs", authenticateToken, getAllClubs);
router.post(
	"/clubs",
	authenticateToken,
	authorizeRoles(["admin", "teacher"]),
	createClub,
);
router.post("/clubs/:clubId/join", authenticateToken, joinClub);
router.put("/memberships/:membershipId/leave", authenticateToken, leaveClub);
router.get("/clubs/:clubId/members", authenticateToken, getClubMembers);

export default router;
