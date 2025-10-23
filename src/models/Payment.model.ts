/** @format */

import { Schema, model, Document, Types } from "mongoose";
import {
	IPayment,
	IPaymentMethod,
	IRefund,
	IPaymentGateway,
} from "../types/IPayment";

// Payment Schema
const paymentSchema = new Schema<IPayment>(
	{
		student: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		type: {
			type: String,
			enum: [
				"fee",
				"hostel",
				"transport",
				"library_fine",
				"event_registration",
				"other",
			],
			required: true,
		},
		referenceId: { type: String, required: true },
		amount: { type: Number, required: true, min: 0 },
		currency: { type: String, default: "INR" },
		status: {
			type: String,
			enum: [
				"pending",
				"processing",
				"completed",
				"failed",
				"cancelled",
				"refunded",
			],
			default: "pending",
		},
		paymentMethod: {
			type: String,
			enum: ["razorpay", "stripe", "cash", "cheque", "bank_transfer", "upi"],
			required: true,
		},
		gateway: {
			type: String,
			enum: ["razorpay", "stripe", "offline"],
			required: true,
		},
		gatewayTransactionId: { type: String },
		gatewayOrderId: { type: String },
		gatewayPaymentId: { type: String },
		gatewaySignature: { type: String },
		paymentDate: { type: Date, required: true, default: Date.now },
		dueDate: { type: Date },
		description: { type: String, required: true },
		metadata: { type: Schema.Types.Mixed, default: {} },
		receiptUrl: { type: String },
		refundAmount: { type: Number, min: 0 },
		refundDate: { type: Date },
		refundReason: { type: String },
	},
	{ timestamps: true },
);

// Payment Method Schema
const paymentMethodSchema = new Schema<IPaymentMethod>(
	{
		student: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		type: {
			type: String,
			enum: ["card", "upi", "netbanking", "wallet"],
			required: true,
		},
		provider: { type: String, required: true },
		token: { type: String, required: true },
		lastFour: { type: String },
		expiryMonth: { type: Number, min: 1, max: 12 },
		expiryYear: { type: Number, min: 2020 },
		isDefault: { type: Boolean, default: false },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

// Refund Schema
const refundSchema = new Schema<IRefund>(
	{
		payment: {
			type: Schema.Types.ObjectId as any,
			ref: "Payment",
			required: true,
		},
		student: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		amount: { type: Number, required: true, min: 0 },
		reason: { type: String, required: true },
		status: {
			type: String,
			enum: ["pending", "processing", "completed", "failed", "cancelled"],
			default: "pending",
		},
		gatewayRefundId: { type: String },
		processedAt: { type: Date },
		processedBy: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		remarks: { type: String },
	},
	{ timestamps: true },
);

// Payment Gateway Schema
const paymentGatewaySchema = new Schema<IPaymentGateway>(
	{
		name: { type: String, required: true, unique: true },
		type: {
			type: String,
			enum: ["razorpay", "stripe", "payu", "paytm"],
			required: true,
		},
		isActive: { type: Boolean, default: true },
		credentials: {
			keyId: { type: String, required: true },
			keySecret: { type: String, required: true },
			webhookSecret: { type: String },
			environment: {
				type: String,
				enum: ["sandbox", "production"],
				default: "sandbox",
			},
		},
		supportedMethods: [{ type: String }],
		processingFee: { type: Number, default: 0 },
		minimumAmount: { type: Number, default: 1 },
		maximumAmount: { type: Number, default: 1000000 },
	},
	{ timestamps: true },
);

// Indexes for better performance
paymentSchema.index({ student: 1, status: 1 });
paymentSchema.index({ type: 1, referenceId: 1 });
paymentSchema.index({ gatewayTransactionId: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentMethodSchema.index({ student: 1, isActive: 1 });
refundSchema.index({ payment: 1, status: 1 });
refundSchema.index({ student: 1 });
paymentGatewaySchema.index({ type: 1, isActive: 1 });

export const Payment = model<IPayment>("Payment", paymentSchema);
export const PaymentMethod = model<IPaymentMethod>(
	"PaymentMethod",
	paymentMethodSchema,
);
export const Refund = model<IRefund>("Refund", refundSchema);
export const PaymentGateway = model<IPaymentGateway>(
	"PaymentGateway",
	paymentGatewaySchema,
);
