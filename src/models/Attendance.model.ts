/** @format */

import mongoose, { Schema, model, Document, Types } from "mongoose";
import { IAttendance } from "../types/IAcademic";

const attendanceSchema = new Schema<IAttendance>(
	{
		student: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		subject: {
			type: Schema.Types.ObjectId as any,
			ref: "Subject",
			required: true,
		},
		date: { type: Date, required: true },
		status: {
			type: String,
			enum: ["present", "absent", "leave"],
			required: true,
		},
		markedBy: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true },
);

attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

export const Attendance =
	mongoose.models.Attendance ||
	model<IAttendance>("Attendance", attendanceSchema);
