/** @format */

import { Request, Response } from "express";
import {
	Route,
	Vehicle,
	TransportAllocation,
	TransportPayment,
} from "../models/Transport.model";
import { User } from "../models/User.model";

// Route Management
export const getAllRoutes = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { page = 1, limit = 10, search, isActive } = req.query;
		const query: any = {};

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ startLocation: { $regex: search, $options: "i" } },
				{ endLocation: { $regex: search, $options: "i" } },
			];
		}

		if (isActive !== undefined) {
			query.isActive = isActive === "true";
		}

		const routes = await Route.find(query)
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const total = await Route.countDocuments(query);

		res.json({
			routes,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch routes", error });
	}
};

export const createRoute = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const route = await Route.create(req.body);

		res.status(201).json({
			message: "Route created successfully",
			route,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to create route", error });
	}
};

export const updateRoute = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		const route = await Route.findByIdAndUpdate(id, updateData, { new: true });

		if (!route) {
			res.status(404).json({ message: "Route not found" });
			return;
		}

		res.json({
			message: "Route updated successfully",
			route,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to update route", error });
	}
};

// Vehicle Management
export const getAllVehicles = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { page = 1, limit = 10, routeId, type, isActive } = req.query;
		const query: any = {};

		if (routeId) {
			query.route = routeId;
		}

		if (type) {
			query.type = type;
		}

		if (isActive !== undefined) {
			query.isActive = isActive === "true";
		}

		const vehicles = await Vehicle.find(query)
			.populate("driver", "profile employeeId")
			.populate("conductor", "profile employeeId")
			.populate("route", "name startLocation endLocation")
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const total = await Vehicle.countDocuments(query);

		res.json({
			vehicles,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch vehicles", error });
	}
};

export const createVehicle = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const vehicle = await Vehicle.create(req.body);

		res.status(201).json({
			message: "Vehicle created successfully",
			vehicle,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to create vehicle", error });
	}
};

export const updateVehicle = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		const vehicle = await Vehicle.findByIdAndUpdate(id, updateData, {
			new: true,
		})
			.populate("driver", "profile employeeId")
			.populate("conductor", "profile employeeId")
			.populate("route", "name startLocation endLocation");

		if (!vehicle) {
			res.status(404).json({ message: "Vehicle not found" });
			return;
		}

		res.json({
			message: "Vehicle updated successfully",
			vehicle,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to update vehicle", error });
	}
};

// Transport Allocation Management
export const allocateTransport = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { studentId, routeId, vehicleId, stop, startDate, monthlyFee } =
			req.body;

		// Check if student already has an active allocation
		const existingAllocation = await TransportAllocation.findOne({
			student: studentId,
			status: { $in: ["allocated", "active"] },
		});

		if (existingAllocation) {
			res
				.status(400)
				.json({
					message: "Student already has an active transport allocation",
				});
			return;
		}

		// Check vehicle capacity
		const vehicle = await Vehicle.findById(vehicleId);
		if (!vehicle || !vehicle.isActive) {
			res.status(400).json({ message: "Vehicle not available" });
			return;
		}

		// Get current allocations for this vehicle
		const currentAllocations = await TransportAllocation.countDocuments({
			vehicle: vehicleId,
			status: { $in: ["allocated", "active"] },
		});

		if (currentAllocations >= vehicle.capacity) {
			res.status(400).json({ message: "Vehicle is at full capacity" });
			return;
		}

		const allocation = await TransportAllocation.create({
			student: studentId,
			route: routeId,
			vehicle: vehicleId,
			stop,
			startDate: new Date(startDate),
			monthlyFee,
			dueAmount: monthlyFee,
			allocatedBy: req.user?.id,
		});

		res.status(201).json({
			message: "Transport allocated successfully",
			allocation,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to allocate transport", error });
	}
};

export const activateTransport = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { allocationId } = req.params;

		const allocation = await TransportAllocation.findByIdAndUpdate(
			allocationId,
			{ status: "active" },
			{ new: true },
		);

		if (!allocation) {
			res.status(404).json({ message: "Allocation not found" });
			return;
		}

		res.json({
			message: "Transport activated successfully",
			allocation,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to activate transport", error });
	}
};

export const cancelTransport = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { allocationId } = req.params;

		const allocation = await TransportAllocation.findByIdAndUpdate(
			allocationId,
			{ status: "cancelled" },
			{ new: true },
		);

		if (!allocation) {
			res.status(404).json({ message: "Allocation not found" });
			return;
		}

		res.json({
			message: "Transport cancelled successfully",
			allocation,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to cancel transport", error });
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

		const allocations = await TransportAllocation.find(query)
			.populate("route", "name startLocation endLocation stops")
			.populate("vehicle", "vehicleNumber type capacity")
			.sort({ allocationDate: -1 });

		res.json(allocations);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Failed to fetch student allocations", error });
	}
};

// Transport Payment Management
export const makeTransportPayment = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { allocationId, amount, paymentMethod, transactionId } = req.body;

		const allocation = await TransportAllocation.findById(allocationId);
		if (!allocation) {
			res.status(404).json({ message: "Allocation not found" });
			return;
		}

		// Create payment record
		const payment = await TransportPayment.create({
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

export const getTransportPayments = async (
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

		const payments = await TransportPayment.find(query)
			.populate("allocation")
			.sort({ paymentDate: -1 });

		res.json(payments);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Failed to fetch transport payments", error });
	}
};

// Route Stops Management
export const addStopToRoute = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { routeId } = req.params;
		const stopData = req.body;

		const route = await Route.findByIdAndUpdate(
			routeId,
			{ $push: { stops: stopData } },
			{ new: true },
		);

		if (!route) {
			res.status(404).json({ message: "Route not found" });
			return;
		}

		res.json({
			message: "Stop added successfully",
			route,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to add stop", error });
	}
};

export const removeStopFromRoute = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { routeId, stopIndex } = req.params;

		const route = await Route.findById(routeId);
		if (!route) {
			res.status(404).json({ message: "Route not found" });
			return;
		}

		route.stops.splice(parseInt(stopIndex), 1);
		await route.save();

		res.json({
			message: "Stop removed successfully",
			route,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to remove stop", error });
	}
};
