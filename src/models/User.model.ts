/** @format */

import mongoose, { Schema, Document } from "mongoose";
import * as bcrypt from "bcryptjs";
import { IUser, IStudent, ITeacher, IAdmin } from "../types/IUser";

const userSchema = new Schema<IUser>(
	{
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: {
			type: String,
			enum: ["admin", "teacher", "student"],
			required: true,
		},
		profile: {
			firstName: { type: String, required: true },
			lastName: { type: String, required: true },
			phone: { type: String, required: true },
			address: { type: String, required: true },
			dateOfBirth: { type: Date, required: true },
			gender: {
				type: String,
				enum: ["male", "female", "other"],
				required: true,
			},
			avatar: { type: String },
		},
		isActive: { type: Boolean, default: true },
		lastLogin: { type: Date },
	},
	{ timestamps: true, discriminatorKey: "role" },
);

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

userSchema.methods.comparePassword = async function (
	candidatePassword: string,
): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password);
};

const studentSchema = new Schema<IStudent>({
	studentId: { type: String, required: true, unique: true },
	academicInfo: {
		admissionDate: { type: Date, required: true },
		currentSemester: { type: Number, required: true },
		department: { type: String, required: true },
		program: { type: String, required: true },
		batch: { type: String, required: true },
	},
	parentInfo: {
		fatherName: { type: String, required: true },
		motherName: { type: String, required: true },
		parentPhone: { type: String, required: true },
		parentEmail: { type: String, required: true },
	},
	fees: {
		totalAmount: { type: Number, default: 0 },
		paidAmount: { type: Number, default: 0 },
		dueAmount: { type: Number, default: 0 },
		paymentHistory: [
			{
				amount: Number,
				date: Date,
				method: String,
				transactionId: String,
				status: { type: String, enum: ["pending", "completed", "failed"] },
			},
		],
	},
});

const teacherSchema = new Schema<ITeacher>({
	employeeId: { type: String, required: true, unique: true },
	department: { type: String, required: true },
	designation: { type: String, required: true },
	qualifications: [{ type: String }],
	subjects: [{ type: String }],
	joiningDate: { type: Date, required: true },
	salary: { type: Number, required: true },
});

const adminSchema = new Schema<IAdmin>({
	adminId: { type: String, required: true, unique: true },
	permissions: [{ type: String }],
});

export const User =
	mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export const Student = User.discriminator<IStudent>("student", studentSchema);
export const Teacher = User.discriminator<ITeacher>("teacher", teacherSchema);
export const Admin = User.discriminator<IAdmin>("admin", adminSchema);
