/** @format */

import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IFee {
	_id: string;
	student: Types.ObjectId | string;
	academicYear: string;
	semester: number;
	totalAmount: number;
	paidAmount: number;
	dueAmount: number;
	paymentHistory: IPaymentRecord[];
	dueDate: Date;
	status: "pending" | "paid" | "overdue";
}

export interface IPaymentRecord {
	_id: string;
	amount: number;
	date: Date;
	method: string;
	transactionId: string;
	status: "pending" | "completed" | "failed";
	receiptUrl?: string;
}

const paymentRecordSchema = new Schema<IPaymentRecord>({
	amount: { type: Number, required: true },
	date: { type: Date, default: Date.now },
	method: { type: String, required: true },
	transactionId: { type: String, required: true },
	status: {
		type: String,
		enum: ["pending", "completed", "failed"],
		default: "pending",
	},
	receiptUrl: { type: String },
});

const feeSchema = new Schema<IFee>(
	{
		student: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		academicYear: { type: String, required: true },
		semester: { type: Number, required: true },
		totalAmount: { type: Number, required: true },
		paidAmount: { type: Number, default: 0 },
		dueAmount: { type: Number, default: 0 },
		paymentHistory: [paymentRecordSchema],
		dueDate: { type: Date, required: true },
		status: {
			type: String,
			enum: ["pending", "paid", "overdue"],
			default: "pending",
		},
	},
	{ timestamps: true },
);

feeSchema.index({ student: 1, academicYear: 1, semester: 1 }, { unique: true });

export const Fee = mongoose.models.Fee || model<IFee>("Fee", feeSchema);
