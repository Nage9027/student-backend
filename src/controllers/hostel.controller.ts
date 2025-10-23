/** @format */

import { Request, Response } from "express";
import {
	Hostel,
	Room,
	HostelAllocation,
	HostelPayment,
} from "../models/Hostel.model";
import { User } from "../models/User.model";

// Hostel Management
export const getAllHostels = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { page = 1, limit = 10, type, search } = req.query;
		const query: any = {};

		if (type) {
			query.type = type;
		}

		if (search) {
			query.name = { $regex: search, $options: "i" };
		}

		const hostels = await Hostel.find(query)
			.populate("warden", "profile employeeId")
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const total = await Hostel.countDocuments(query);

		res.json({
			hostels,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch hostels", error });
	}
};

export const createHostel = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const hostelData = req.body;
		hostelData.availableRooms = hostelData.totalRooms;
		hostelData.currentOccupancy = 0;

		const hostel = await Hostel.create(hostelData);

		res.status(201).json({
			message: "Hostel created successfully",
			hostel,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to create hostel", error });
	}
};

export const updateHostel = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		const hostel = await Hostel.findByIdAndUpdate(id, updateData, {
			new: true,
		}).populate("warden", "profile employeeId");

		if (!hostel) {
			res.status(404).json({ message: "Hostel not found" });
			return;
		}

		res.json({
			message: "Hostel updated successfully",
			hostel,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to update hostel", error });
	}
};

// Room Management
export const getHostelRooms = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { hostelId } = req.params;
		const { available, type } = req.query;

		const query: any = { hostel: hostelId };
		if (available !== undefined) {
			query.isAvailable = available === "true";
		}
		if (type) {
			query.type = type;
		}

		const rooms = await Room.find(query).sort({ floor: 1, roomNumber: 1 });

		res.json(rooms);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch rooms", error });
	}
};

export const createRoom = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const roomData = req.body;
		roomData.currentOccupancy = 0;
		roomData.isAvailable = true;

		const room = await Room.create(roomData);

		res.status(201).json({
			message: "Room created successfully",
			room,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to create room", error });
	}
};

export const updateRoom = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		const room = await Room.findByIdAndUpdate(id, updateData, { new: true });

		if (!room) {
			res.status(404).json({ message: "Room not found" });
			return;
		}

		res.json({
			message: "Room updated successfully",
			room,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to update room", error });
	}
};

// Hostel Allocation Management
export const allocateHostel = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const {
			studentId,
			hostelId,
			roomId,
			checkInDate,
			monthlyRent,
			securityDeposit,
		} = req.body;

		// Check if room is available
		const room = await Room.findById(roomId);
		if (!room || !room.isAvailable || room.currentOccupancy >= room.capacity) {
			res.status(400).json({ message: "Room not available" });
			return;
		}

		// Check if student already has an active allocation
		const existingAllocation = await HostelAllocation.findOne({
			student: studentId,
			status: { $in: ["allocated", "checked-in"] },
		});

		if (existingAllocation) {
			res
				.status(400)
				.json({ message: "Student already has an active hostel allocation" });
			return;
		}

		const allocation = await HostelAllocation.create({
			student: studentId,
			hostel: hostelId,
			room: roomId,
			checkInDate: new Date(checkInDate),
			monthlyRent,
			securityDeposit,
			dueAmount: securityDeposit + monthlyRent,
			allocatedBy: req.user?.id,
		});

		// Update room occupancy
		await Room.findByIdAndUpdate(roomId, {
			$inc: { currentOccupancy: 1 },
		});

		// Update hostel occupancy
		await Hostel.findByIdAndUpdate(hostelId, {
			$inc: { currentOccupancy: 1, availableRooms: -1 },
		});

		res.status(201).json({
			message: "Hostel allocated successfully",
			allocation,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to allocate hostel", error });
	}
};

export const checkIn = async (req: Request, res: Response): Promise<void> => {
	try {
		const { allocationId } = req.params;

		const allocation = await HostelAllocation.findByIdAndUpdate(
			allocationId,
			{ status: "checked-in" },
			{ new: true },
		);

		if (!allocation) {
			res.status(404).json({ message: "Allocation not found" });
			return;
		}

		res.json({
			message: "Check-in successful",
			allocation,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to check-in", error });
	}
};

export const checkOut = async (req: Request, res: Response): Promise<void> => {
	try {
		const { allocationId } = req.params;
		const { checkOutDate } = req.body;

		const allocation = await HostelAllocation.findById(allocationId);
		if (!allocation) {
			res.status(404).json({ message: "Allocation not found" });
			return;
		}

		// Update allocation
		allocation.status = "checked-out";
		allocation.checkOutDate = new Date(checkOutDate);
		await allocation.save();

		// Update room occupancy
		await Room.findByIdAndUpdate(allocation.room, {
			$inc: { currentOccupancy: -1 },
		});

		// Update hostel occupancy
		await Hostel.findByIdAndUpdate(allocation.hostel, {
			$inc: { currentOccupancy: -1, availableRooms: 1 },
		});

		res.json({
			message: "Check-out successful",
			allocation,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to check-out", error });
	}
};

export const getStudentAllocations = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { studentId } = req.params;
		const { status } = req.query;

		const query: any = { student: studentId };
		if (status) {
			query.status = status;
		}

		const allocations = await HostelAllocation.find(query)
			.populate("hostel", "name type address")
			.populate("room", "roomNumber floor type")
			.sort({ allocationDate: -1 });

		res.json(allocations);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Failed to fetch student allocations", error });
	}
};

// Hostel Payment Management
export const makeHostelPayment = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { allocationId, amount, paymentMethod, transactionId } = req.body;

		const allocation = await HostelAllocation.findById(allocationId);
		if (!allocation) {
			res.status(404).json({ message: "Allocation not found" });
			return;
		}

		// Create payment record
		const payment = await HostelPayment.create({
			allocation: allocationId,
			student: allocation.student,
			amount,
			paymentMethod,
			transactionId,
			status: "completed",
		});

		// Update allocation payment details
		allocation.paidAmount += amount;
		allocation.dueAmount -= amount;
		await allocation.save();

		res.status(201).json({
			message: "Payment recorded successfully",
			payment,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to record payment", error });
	}
};

export const getHostelPayments = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { studentId } = req.params;
		const { status } = req.query;

		const query: any = { student: studentId };
		if (status) {
			query.status = status;
		}

		const payments = await HostelPayment.find(query)
			.populate("allocation")
			.sort({ paymentDate: -1 });

		res.json(payments);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch hostel payments", error });
	}
};
