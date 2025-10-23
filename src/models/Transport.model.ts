/** @format */

import { Schema, model, Document, Types } from "mongoose";
import {
	IRoute,
	IVehicle,
	ITransportAllocation,
	ITransportPayment,
} from "../types/ITransport";

// Stop Schema (embedded in Route)
const stopSchema = new Schema({
	name: { type: String, required: true },
	address: { type: String, required: true },
	latitude: { type: Number, required: true },
	longitude: { type: Number, required: true },
	arrivalTime: { type: String, required: true },
	departureTime: { type: String, required: true },
});

// Route Schema
const routeSchema = new Schema<IRoute>(
	{
		name: { type: String, required: true },
		startLocation: { type: String, required: true },
		endLocation: { type: String, required: true },
		stops: [stopSchema],
		distance: { type: Number, required: true, min: 0 },
		estimatedTime: { type: Number, required: true, min: 0 },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

// Vehicle Schema
const vehicleSchema = new Schema<IVehicle>(
	{
		vehicleNumber: { type: String, required: true, unique: true },
		type: {
			type: String,
			enum: ["bus", "van", "car"],
			required: true,
		},
		capacity: { type: Number, required: true, min: 1 },
		driver: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		conductor: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
		},
		route: {
			type: Schema.Types.ObjectId as any,
			ref: "Route",
			required: true,
		},
		isActive: { type: Boolean, default: true },
		maintenanceDate: { type: Date },
		nextMaintenanceDate: { type: Date },
	},
	{ timestamps: true },
);

// Transport Allocation Schema
const transportAllocationSchema = new Schema<ITransportAllocation>(
	{
		student: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		route: {
			type: Schema.Types.ObjectId as any,
			ref: "Route",
			required: true,
		},
		vehicle: {
			type: Schema.Types.ObjectId as any,
			ref: "Vehicle",
			required: true,
		},
		stop: { type: String, required: true },
		allocationDate: { type: Date, required: true, default: Date.now },
		startDate: { type: Date, required: true },
		endDate: { type: Date },
		status: {
			type: String,
			enum: ["allocated", "active", "cancelled", "expired"],
			default: "allocated",
		},
		monthlyFee: { type: Number, required: true, min: 0 },
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

// Transport Payment Schema
const transportPaymentSchema = new Schema<ITransportPayment>(
	{
		allocation: {
			type: Schema.Types.ObjectId as any,
			ref: "TransportAllocation",
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
routeSchema.index({ name: 1, isActive: 1 });
vehicleSchema.index({ vehicleNumber: 1 });
vehicleSchema.index({ route: 1, isActive: 1 });
transportAllocationSchema.index({ student: 1, status: 1 });
transportAllocationSchema.index({ route: 1, vehicle: 1 });
transportPaymentSchema.index({ student: 1, status: 1 });

export const Route = model<IRoute>("Route", routeSchema);
export const Vehicle = model<IVehicle>("Vehicle", vehicleSchema);
export const TransportAllocation = model<ITransportAllocation>(
	"TransportAllocation",
	transportAllocationSchema,
);
export const TransportPayment = model<ITransportPayment>(
	"TransportPayment",
	transportPaymentSchema,
);
