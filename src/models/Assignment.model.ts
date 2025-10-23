/** @format */

import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IAssignment {
	_id: string;
	title: string;
	description: string;
	subject: Types.ObjectId | string;
	teacher: Types.ObjectId | string;
	dueDate: Date;
	maximumMarks: number;
	submissions: ISubmission[];
	createdAt: Date;
	updatedAt: Date;
}

export interface ISubmission {
	_id: string;
	student: Types.ObjectId | string;
	fileUrl: string;
	submittedAt: Date;
	marks?: number;
	feedback?: string;
	status: "submitted" | "graded" | "late";
}

const submissionSchema = new Schema<ISubmission>({
	student: { type: Schema.Types.ObjectId as any, ref: "User", required: true },
	fileUrl: { type: String, required: true },
	submittedAt: { type: Date, default: Date.now },
	marks: { type: Number },
	feedback: { type: String },
	status: {
		type: String,
		enum: ["submitted", "graded", "late"],
		default: "submitted",
	},
});

const assignmentSchema = new Schema<IAssignment>(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		subject: {
			type: Schema.Types.ObjectId as any,
			ref: "Subject",
			required: true,
		},
		teacher: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		dueDate: { type: Date, required: true },
		maximumMarks: { type: Number, required: true },
		submissions: [submissionSchema],
	},
	{ timestamps: true },
);

export const Assignment =
	mongoose.models.Assignment ||
	model<IAssignment>("Assignment", assignmentSchema);
