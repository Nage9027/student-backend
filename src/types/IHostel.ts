/** @format */

export interface IHostel {
	_id: string;
	name: string;
	type: "boys" | "girls" | "co-ed";
	address: string;
	totalRooms: number;
	availableRooms: number;
	capacity: number;
	currentOccupancy: number;
	facilities: string[];
	warden: string; // Staff ID
	contactNumber: string;
	monthlyRent: number;
	securityDeposit: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface IRoom {
	_id: string;
	hostel: string; // Hostel ID
	roomNumber: string;
	floor: number;
	capacity: number;
	currentOccupancy: number;
	type: "single" | "double" | "triple" | "quad";
	facilities: string[];
	monthlyRent: number;
	isAvailable: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface IHostelAllocation {
	_id: string;
	student: string; // Student ID
	hostel: string; // Hostel ID
	room: string; // Room ID
	allocationDate: Date;
	checkInDate: Date;
	checkOutDate?: Date;
	status: "allocated" | "checked-in" | "checked-out" | "cancelled";
	monthlyRent: number;
	securityDeposit: number;
	paidAmount: number;
	dueAmount: number;
	allocatedBy: string; // Staff ID
	remarks?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface IHostelPayment {
	_id: string;
	allocation: string; // Hostel Allocation ID
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
