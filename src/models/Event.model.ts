/** @format */

import { Schema, model, Document, Types } from "mongoose";
import {
	IEvent,
	IEventRegistration,
	IClub,
	IClubMembership,
} from "../types/IEvent";

// Event Schema
const eventSchema = new Schema<IEvent>(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		type: {
			type: String,
			enum: [
				"academic",
				"cultural",
				"sports",
				"workshop",
				"seminar",
				"conference",
				"festival",
			],
			required: true,
		},
		startDate: { type: Date, required: true },
		endDate: { type: Date, required: true },
		startTime: { type: String, required: true },
		endTime: { type: String, required: true },
		location: { type: String, required: true },
		organizer: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		coOrganizers: [
			{
				type: Schema.Types.ObjectId as any,
				ref: "User",
			},
		],
		participants: [
			{
				type: Schema.Types.ObjectId as any,
				ref: "User",
			},
		],
		maxParticipants: { type: Number, min: 1 },
		registrationDeadline: { type: Date },
		isPublic: { type: Boolean, default: true },
		requiresRegistration: { type: Boolean, default: false },
		registrationFee: { type: Number, min: 0 },
		status: {
			type: String,
			enum: ["draft", "published", "cancelled", "completed"],
			default: "draft",
		},
		imageUrl: { type: String },
		attachments: [{ type: String }],
		tags: [{ type: String }],
	},
	{ timestamps: true },
);

// Event Registration Schema
const eventRegistrationSchema = new Schema<IEventRegistration>(
	{
		event: {
			type: Schema.Types.ObjectId as any,
			ref: "Event",
			required: true,
		},
		student: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		registrationDate: { type: Date, required: true, default: Date.now },
		status: {
			type: String,
			enum: ["pending", "approved", "rejected", "cancelled"],
			default: "pending",
		},
		paymentStatus: {
			type: String,
			enum: ["pending", "paid", "refunded"],
			default: "pending",
		},
		paymentAmount: { type: Number, min: 0 },
		transactionId: { type: String },
		remarks: { type: String },
	},
	{ timestamps: true },
);

// Club Schema
const clubSchema = new Schema<IClub>(
	{
		name: { type: String, required: true, unique: true },
		description: { type: String, required: true },
		category: {
			type: String,
			enum: [
				"academic",
				"cultural",
				"sports",
				"technical",
				"social",
				"literary",
			],
			required: true,
		},
		president: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		vicePresident: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
		},
		secretary: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
		},
		treasurer: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
		},
		members: [
			{
				type: Schema.Types.ObjectId as any,
				ref: "User",
			},
		],
		facultyAdvisor: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		establishedDate: { type: Date, required: true, default: Date.now },
		isActive: { type: Boolean, default: true },
		logoUrl: { type: String },
		socialMedia: {
			facebook: { type: String },
			instagram: { type: String },
			twitter: { type: String },
			website: { type: String },
		},
	},
	{ timestamps: true },
);

// Club Membership Schema
const clubMembershipSchema = new Schema<IClubMembership>(
	{
		club: {
			type: Schema.Types.ObjectId as any,
			ref: "Club",
			required: true,
		},
		student: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		position: {
			type: String,
			enum: ["member", "president", "vice_president", "secretary", "treasurer"],
			default: "member",
		},
		joinDate: { type: Date, required: true, default: Date.now },
		leaveDate: { type: Date },
		status: {
			type: String,
			enum: ["active", "inactive", "suspended"],
			default: "active",
		},
		achievements: [{ type: String }],
	},
	{ timestamps: true },
);

// Indexes for better performance
eventSchema.index({ title: "text", description: "text" });
eventSchema.index({ type: 1, status: 1 });
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ organizer: 1 });
eventRegistrationSchema.index({ event: 1, student: 1 });
eventRegistrationSchema.index({ student: 1, status: 1 });
clubSchema.index({ name: 1, category: 1 });
clubSchema.index({ isActive: 1 });
clubMembershipSchema.index({ club: 1, student: 1 });
clubMembershipSchema.index({ student: 1, status: 1 });

export const Event = model<IEvent>("Event", eventSchema);
export const EventRegistration = model<IEventRegistration>(
	"EventRegistration",
	eventRegistrationSchema,
);
export const Club = model<IClub>("Club", clubSchema);
export const ClubMembership = model<IClubMembership>(
	"ClubMembership",
	clubMembershipSchema,
);
