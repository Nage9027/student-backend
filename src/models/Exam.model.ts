/** @format */

import { Schema, model, Document, Types } from "mongoose";
import { IExam } from "../types/IAcademic";

const examSchema = new Schema<IExam>(
	{
		name: { type: String, required: true },
		subject: {
			type: Schema.Types.ObjectId as any,
			ref: "Subject",
			required: true,
		},
		date: { type: Date, required: true },
		maximumMarks: { type: Number, required: true },
		type: {
			type: String,
			enum: ["theory", "practical", "assignment"],
			required: true,
		},
		syllabus: { type: String },
		createdBy: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true },
);

export const Exam = model<IExam>("Exam", examSchema);
