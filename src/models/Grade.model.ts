/** @format */

import mongoose, { Schema, model, Document, Types } from "mongoose";
import { IGrade } from "../types/IAcademic";

const gradeSchema = new Schema<IGrade>(
	{
		student: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		exam: { type: Schema.Types.ObjectId as any, ref: "Exam", required: true },
		subject: {
			type: Schema.Types.ObjectId as any,
			ref: "Subject",
			required: true,
		},
		marksObtained: { type: Number, required: true },
		maximumMarks: { type: Number, required: true },
		grade: { type: String, required: true },
		remarks: { type: String },
	},
	{ timestamps: true },
);

gradeSchema.index({ student: 1, exam: 1 }, { unique: true });

// Virtual for percentage
gradeSchema.virtual("percentage").get(function (this: any) {
	return (this.marksObtained / this.maximumMarks) * 100;
});

export const Grade =
	mongoose.models.Grade || model<IGrade>("Grade", gradeSchema);
