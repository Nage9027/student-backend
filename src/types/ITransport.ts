/** @format */

export interface IRoute {
	_id: string;
	name: string;
	startLocation: string;
	endLocation: string;
	stops: IStop[];
	distance: number; // in kilometers
	estimatedTime: number; // in minutes
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface IStop {
	name: string;
	address: string;
	latitude: number;
	longitude: number;
	arrivalTime: string; // HH:MM format
	departureTime: string; // HH:MM format
}

export interface IVehicle {
	_id: string;
	vehicleNumber: string;
	type: "bus" | "van" | "car";
	capacity: number;
	driver: string; // Driver ID
	conductor?: string; // Conductor ID
	route: string; // Route ID
	isActive: boolean;
	maintenanceDate?: Date;
	nextMaintenanceDate?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface ITransportAllocation {
	_id: string;
	student: string; // Student ID
	route: string; // Route ID
	vehicle: string; // Vehicle ID
	stop: string; // Stop name
	allocationDate: Date;
	startDate: Date;
	endDate?: Date;
	status: "allocated" | "active" | "cancelled" | "expired";
	monthlyFee: number;
	paidAmount: number;
	dueAmount: number;
	allocatedBy: string; // Staff ID
	remarks?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ITransportPayment {
	_id: string;
	allocation: string; // Transport Allocation ID
	student: string; // Student ID
	amount: number;
	paymentDate: Date;
	paymentMethod: string;
	transactionId: string;
	status: "pending" | "completed" | "failed";
	receiptUrl?: string;
	remarks?: string;
	createdAt: Date;
	updatedAt: Date;
}
