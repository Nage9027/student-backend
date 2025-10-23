/** @format */

import { Schema, model, Document, Types } from "mongoose";
import {
	IBook,
	IBookIssue,
	IBookReservation,
	ILibraryFine,
} from "../types/ILibrary";

// Book Schema
const bookSchema = new Schema<IBook>(
	{
		title: { type: String, required: true },
		author: { type: String, required: true },
		isbn: { type: String, required: true, unique: true },
		publisher: { type: String, required: true },
		publicationYear: { type: Number, required: true },
		category: { type: String, required: true },
		department: { type: String, required: true },
		totalCopies: { type: Number, required: true, min: 1 },
		availableCopies: { type: Number, required: true, min: 0 },
		location: { type: String, required: true },
		description: { type: String },
		coverImage: { type: String },
	},
	{ timestamps: true },
);

// Book Issue Schema
const bookIssueSchema = new Schema<IBookIssue>(
	{
		student: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		book: {
			type: Schema.Types.ObjectId as any,
			ref: "Book",
			required: true,
		},
		issueDate: { type: Date, required: true, default: Date.now },
		dueDate: { type: Date, required: true },
		returnDate: { type: Date },
		status: {
			type: String,
			enum: ["issued", "returned", "overdue"],
			default: "issued",
		},
		fineAmount: { type: Number, default: 0 },
		issuedBy: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		remarks: { type: String },
	},
	{ timestamps: true },
);

// Book Reservation Schema
const bookReservationSchema = new Schema<IBookReservation>(
	{
		student: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		book: {
			type: Schema.Types.ObjectId as any,
			ref: "Book",
			required: true,
		},
		reservationDate: { type: Date, required: true, default: Date.now },
		expiryDate: { type: Date, required: true },
		status: {
			type: String,
			enum: ["active", "fulfilled", "expired", "cancelled"],
			default: "active",
		},
	},
	{ timestamps: true },
);

// Library Fine Schema
const libraryFineSchema = new Schema<ILibraryFine>(
	{
		student: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		bookIssue: {
			type: Schema.Types.ObjectId as any,
			ref: "BookIssue",
			required: true,
		},
		amount: { type: Number, required: true, min: 0 },
		reason: {
			type: String,
			enum: ["overdue", "damage", "lost"],
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "paid"],
			default: "pending",
		},
		dueDate: { type: Date, required: true },
		paidDate: { type: Date },
	},
	{ timestamps: true },
);

// Indexes for better performance
bookSchema.index({ title: "text", author: "text", isbn: "text" });
bookSchema.index({ category: 1, department: 1 });
bookIssueSchema.index({ student: 1, status: 1 });
bookIssueSchema.index({ book: 1, status: 1 });
bookReservationSchema.index({ student: 1, status: 1 });
libraryFineSchema.index({ student: 1, status: 1 });

export const Book = model<IBook>("Book", bookSchema);
export const BookIssue = model<IBookIssue>("BookIssue", bookIssueSchema);
export const BookReservation = model<IBookReservation>(
	"BookReservation",
	bookReservationSchema,
);
export const LibraryFine = model<ILibraryFine>(
	"LibraryFine",
	libraryFineSchema,
);
