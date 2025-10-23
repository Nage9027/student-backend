/** @format */

import mongoose, { Schema, model, Document, Types } from "mongoose";
import { ISubject } from "../types/IAcademic";

const subjectSchema = new Schema<ISubject>(
	{
		code: { type: String, required: true, unique: true },
		name: { type: String, required: true },
		credits: { type: Number, required: true },
		department: { type: String, required: true },
		semester: { type: Number, required: true },
		teacher: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		coPoMapping: [
			{
				co: { type: String, required: true },
				po: [{ type: String, required: true }],
			},
		],
	},
	{ timestamps: true },
);

export const Subject =
	mongoose.models.Subject || model<ISubject>("Subject", subjectSchema);
