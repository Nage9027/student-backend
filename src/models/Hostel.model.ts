/** @format */

import { Schema, model, Document, Types } from "mongoose";
import {
	IHostel,
	IRoom,
	IHostelAllocation,
	IHostelPayment,
} from "../types/IHostel";

// Hostel Schema
const hostelSchema = new Schema<IHostel>(
	{
		name: { type: String, required: true },
		type: {
			type: String,
			enum: ["boys", "girls", "co-ed"],
			required: true,
		},
		address: { type: String, required: true },
		totalRooms: { type: Number, required: true, min: 1 },
		availableRooms: { type: Number, required: true, min: 0 },
		capacity: { type: Number, required: true, min: 1 },
		currentOccupancy: { type: Number, default: 0 },
		facilities: [{ type: String }],
		warden: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		contactNumber: { type: String, required: true },
		monthlyRent: { type: Number, required: true, min: 0 },
		securityDeposit: { type: Number, required: true, min: 0 },
	},
	{ timestamps: true },
);

// Room Schema
const roomSchema = new Schema<IRoom>(
	{
		hostel: {
			type: Schema.Types.ObjectId as any,
			ref: "Hostel",
			required: true,
		},
		roomNumber: { type: String, required: true },
		floor: { type: Number, required: true, min: 0 },
		capacity: { type: Number, required: true, min: 1 },
		currentOccupancy: { type: Number, default: 0 },
		type: {
			type: String,
			enum: ["single", "double", "triple", "quad"],
			required: true,
		},
		facilities: [{ type: String }],
		monthlyRent: { type: Number, required: true, min: 0 },
		isAvailable: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

// Hostel Allocation Schema
const hostelAllocationSchema = new Schema<IHostelAllocation>(
	{
		student: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		hostel: {
			type: Schema.Types.ObjectId as any,
			ref: "Hostel",
			required: true,
		},
		room: {
			type: Schema.Types.ObjectId as any,
			ref: "Room",
			required: true,
		},
		allocationDate: { type: Date, required: true, default: Date.now },
		checkInDate: { type: Date, required: true },
		checkOutDate: { type: Date },
		status: {
			type: String,
			enum: ["allocated", "checked-in", "checked-out", "cancelled"],
			default: "allocated",
		},
		monthlyRent: { type: Number, required: true, min: 0 },
		securityDeposit: { type: Number, required: true, min: 0 },
		paidAmount: { type: Number, default: 0 },
		dueAmount: { type: Number, required: true, min: 0 },
		allocatedBy: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		remarks: { type: String },
	},
	{ timestamps: true },
);

// Hostel Payment Schema
const hostelPaymentSchema = new Schema<IHostelPayment>(
	{
		allocation: {
			type: Schema.Types.ObjectId as any,
			ref: "HostelAllocation",
			required: true,
		},
		student: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		amount: { type: Number, required: true, min: 0 },
		paymentDate: { type: Date, required: true, default: Date.now },
		paymentMethod: { type: String, required: true },
		transactionId: { type: String, required: true },
		status: {
			type: String,
			enum: ["pending", "completed", "failed"],
			default: "pending",
		},
		receiptUrl: { type: String },
		remarks: { type: String },
	},
	{ timestamps: true },
);

// Indexes for better performance
hostelSchema.index({ name: 1, type: 1 });
roomSchema.index({ hostel: 1, roomNumber: 1 });
roomSchema.index({ isAvailable: 1 });
hostelAllocationSchema.index({ student: 1, status: 1 });
hostelAllocationSchema.index({ hostel: 1, room: 1 });
hostelPaymentSchema.index({ student: 1, status: 1 });

export const Hostel = model<IHostel>("Hostel", hostelSchema);
export const Room = model<IRoom>("Room", roomSchema);
export const HostelAllocation = model<IHostelAllocation>(
	"HostelAllocation",
	hostelAllocationSchema,
);
export const HostelPayment = model<IHostelPayment>(
	"HostelPayment",
	hostelPaymentSchema,
);
