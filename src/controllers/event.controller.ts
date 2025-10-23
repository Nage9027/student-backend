/** @format */

import { Request, Response } from "express";
import {
	Event,
	EventRegistration,
	Club,
	ClubMembership,
} from "../models/Event.model";
import { User } from "../models/User.model";

// Event Management
export const getAllEvents = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const {
			page = 1,
			limit = 10,
			type,
			status,
			search,
			startDate,
			endDate,
		} = req.query;
		const query: any = {};

		if (type) {
			query.type = type;
		}

		if (status) {
			query.status = status;
		}

		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
				{ location: { $regex: search, $options: "i" } },
			];
		}

		if (startDate && endDate) {
			query.startDate = {
				$gte: new Date(startDate as string),
				$lte: new Date(endDate as string),
			};
		}

		const events = await Event.find(query)
			.populate("organizer", "profile employeeId")
			.populate("coOrganizers", "profile employeeId")
			.sort({ startDate: 1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const total = await Event.countDocuments(query);

		res.json({
			events,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch events", error });
	}
};

export const getEventById = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const event = await Event.findById(id)
			.populate("organizer", "profile employeeId")
			.populate("coOrganizers", "profile employeeId")
			.populate("participants", "profile studentId employeeId");

		if (!event) {
			res.status(404).json({ message: "Event not found" });
			return;
		}

		res.json(event);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch event", error });
	}
};

export const createEvent = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const eventData = req.body;
		eventData.organizer = req.user?.id;

		const event = await Event.create(eventData);

		res.status(201).json({
			message: "Event created successfully",
			event,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to create event", error });
	}
};

export const updateEvent = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		const event = await Event.findByIdAndUpdate(id, updateData, { new: true })
			.populate("organizer", "profile employeeId")
			.populate("coOrganizers", "profile employeeId");

		if (!event) {
			res.status(404).json({ message: "Event not found" });
			return;
		}

		res.json({
			message: "Event updated successfully",
			event,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to update event", error });
	}
};

export const deleteEvent = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const event = await Event.findByIdAndDelete(id);

		if (!event) {
			res.status(404).json({ message: "Event not found" });
			return;
		}

		res.json({ message: "Event deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Failed to delete event", error });
	}
};

// Event Registration Management
export const registerForEvent = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { eventId } = req.params;
		const { studentId } = req.body;

		const event = await Event.findById(eventId);
		if (!event) {
			res.status(404).json({ message: "Event not found" });
			return;
		}

		// Check if registration is required
		if (!event.requiresRegistration) {
			res
				.status(400)
				.json({ message: "This event does not require registration" });
			return;
		}

		// Check if registration deadline has passed
		if (event.registrationDeadline && new Date() > event.registrationDeadline) {
			res.status(400).json({ message: "Registration deadline has passed" });
			return;
		}

		// Check if event is at capacity
		if (
			event.maxParticipants &&
			event.participants.length >= event.maxParticipants
		) {
			res.status(400).json({ message: "Event is at full capacity" });
			return;
		}

		// Check if student is already registered
		const existingRegistration = await EventRegistration.findOne({
			event: eventId,
			student: studentId,
		});

		if (existingRegistration) {
			res
				.status(400)
				.json({ message: "Student already registered for this event" });
			return;
		}

		const registration = await EventRegistration.create({
			event: eventId,
			student: studentId,
			paymentAmount: event.registrationFee || 0,
		});

		// Add student to event participants
		await Event.findByIdAndUpdate(eventId, {
			$push: { participants: studentId },
		});

		res.status(201).json({
			message: "Registration successful",
			registration,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to register for event", error });
	}
};

export const cancelRegistration = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { registrationId } = req.params;

		const registration = await EventRegistration.findByIdAndUpdate(
			registrationId,
			{ status: "cancelled" },
			{ new: true },
		);

		if (!registration) {
			res.status(404).json({ message: "Registration not found" });
			return;
		}

		// Remove student from event participants
		await Event.findByIdAndUpdate(registration.event, {
			$pull: { participants: registration.student },
		});

		res.json({
			message: "Registration cancelled successfully",
			registration,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to cancel registration", error });
	}
};

export const getEventRegistrations = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { eventId } = req.params;
		const { status } = req.query;

		const query: any = { event: eventId };
		if (status) {
			query.status = status;
		}

		const registrations = await EventRegistration.find(query)
			.populate("student", "profile studentId")
			.sort({ registrationDate: -1 });

		res.json(registrations);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Failed to fetch event registrations", error });
	}
};

// Club Management
export const getAllClubs = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { page = 1, limit = 10, category, search, isActive } = req.query;
		const query: any = {};

		if (category) {
			query.category = category;
		}

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
			];
		}

		if (isActive !== undefined) {
			query.isActive = isActive === "true";
		}

		const clubs = await Club.find(query)
			.populate("president", "profile studentId")
			.populate("vicePresident", "profile studentId")
			.populate("secretary", "profile studentId")
			.populate("treasurer", "profile studentId")
			.populate("facultyAdvisor", "profile employeeId")
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const total = await Club.countDocuments(query);

		res.json({
			clubs,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch clubs", error });
	}
};

export const createClub = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const clubData = req.body;
		clubData.members = [clubData.president]; // Add president as first member

		const club = await Club.create(clubData);

		// Create membership record for president
		await ClubMembership.create({
			club: club._id,
			student: clubData.president,
			position: "president",
		});

		res.status(201).json({
			message: "Club created successfully",
			club,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to create club", error });
	}
};

export const joinClub = async (req: Request, res: Response): Promise<void> => {
	try {
		const { clubId } = req.params;
		const { studentId } = req.body;

		const club = await Club.findById(clubId);
		if (!club) {
			res.status(404).json({ message: "Club not found" });
			return;
		}

		// Check if student is already a member
		const existingMembership = await ClubMembership.findOne({
			club: clubId,
			student: studentId,
		});

		if (existingMembership) {
			res
				.status(400)
				.json({ message: "Student is already a member of this club" });
			return;
		}

		// Create membership record
		const membership = await ClubMembership.create({
			club: clubId,
			student: studentId,
			position: "member",
		});

		// Add student to club members
		await Club.findByIdAndUpdate(clubId, {
			$push: { members: studentId },
		});

		res.status(201).json({
			message: "Successfully joined club",
			membership,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to join club", error });
	}
};

export const leaveClub = async (req: Request, res: Response): Promise<void> => {
	try {
		const { membershipId } = req.params;

		const membership = await ClubMembership.findByIdAndUpdate(
			membershipId,
			{ status: "inactive", leaveDate: new Date() },
			{ new: true },
		);

		if (!membership) {
			res.status(404).json({ message: "Membership not found" });
			return;
		}

		// Remove student from club members
		await Club.findByIdAndUpdate(membership.club, {
			$pull: { members: membership.student },
		});

		res.json({
			message: "Successfully left club",
			membership,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to leave club", error });
	}
};

export const getClubMembers = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { clubId } = req.params;
		const { position, status } = req.query;

		const query: any = { club: clubId };
		if (position) {
			query.position = position;
		}
		if (status) {
			query.status = status;
		}

		const memberships = await ClubMembership.find(query)
			.populate("student", "profile studentId")
			.sort({ joinDate: -1 });

		res.json(memberships);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch club members", error });
	}
};
