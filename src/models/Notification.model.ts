/** @format */

import mongoose, { Schema, model, Document, Types } from "mongoose";
import {
	INotification,
	IChatRoom,
	IChatMessage,
	IEmailTemplate,
	IEmailLog,
} from "../types/INotification";

// Notification Schema
const notificationSchema = new Schema<INotification>(
	{
		title: { type: String, required: true },
		message: { type: String, required: true },
		type: {
			type: String,
			enum: ["info", "success", "warning", "error", "announcement"],
			required: true,
		},
		priority: {
			type: String,
			enum: ["low", "medium", "high", "urgent"],
			default: "medium",
		},
		sender: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		recipients: {
			type: {
				type: String,
				enum: ["all", "role", "specific", "department", "batch"],
				required: true,
			},
			value: { type: Schema.Types.Mixed, required: true },
		},
		category: {
			type: String,
			enum: [
				"academic",
				"fee",
				"attendance",
				"exam",
				"event",
				"general",
				"emergency",
			],
			required: true,
		},
		isRead: { type: Boolean, default: false },
		readBy: [
			{
				type: Schema.Types.ObjectId as any,
				ref: "User",
			},
		],
		scheduledAt: { type: Date },
		expiresAt: { type: Date },
		actionUrl: { type: String },
		attachments: [{ type: String }],
		metadata: { type: Schema.Types.Mixed, default: {} },
	},
	{ timestamps: true },
);

// Chat Room Schema
const chatRoomSchema = new Schema<IChatRoom>(
	{
		name: { type: String, required: true },
		type: {
			type: String,
			enum: ["direct", "group", "class", "department"],
			required: true,
		},
		participants: [
			{
				type: Schema.Types.ObjectId as any,
				ref: "User",
				required: true,
			},
		],
		admins: [
			{
				type: Schema.Types.ObjectId as any,
				ref: "User",
			},
		],
		lastMessage: {
			type: Schema.Types.ObjectId as any,
			ref: "ChatMessage",
		},
		lastMessageAt: { type: Date },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

// Chat Message Schema
const chatMessageSchema = new Schema<IChatMessage>(
	{
		room: {
			type: Schema.Types.ObjectId as any,
			ref: "ChatRoom",
			required: true,
		},
		sender: {
			type: Schema.Types.ObjectId as any,
			ref: "User",
			required: true,
		},
		message: { type: String, required: true },
		type: {
			type: String,
			enum: ["text", "image", "file", "system"],
			default: "text",
		},
		attachments: [{ type: String }],
		replyTo: {
			type: Schema.Types.ObjectId as any,
			ref: "ChatMessage",
		},
		isEdited: { type: Boolean, default: false },
		editedAt: { type: Date },
		isDeleted: { type: Boolean, default: false },
		deletedAt: { type: Date },
		readBy: [
			{
				user: {
					type: Schema.Types.ObjectId as any,
					ref: "User",
					required: true,
				},
				readAt: { type: Date, required: true, default: Date.now },
			},
		],
	},
	{ timestamps: true },
);

// Email Template Schema
const emailTemplateSchema = new Schema<IEmailTemplate>(
	{
		name: { type: String, required: true, unique: true },
		subject: { type: String, required: true },
		body: { type: String, required: true },
		variables: [{ type: String }],
		category: {
			type: String,
			enum: [
				"welcome",
				"fee_reminder",
				"exam_notification",
				"event_invitation",
				"custom",
			],
			required: true,
		},
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

// Email Log Schema
const emailLogSchema = new Schema<IEmailLog>(
	{
		to: { type: String, required: true },
		subject: { type: String, required: true },
		body: { type: String, required: true },
		template: {
			type: Schema.Types.ObjectId as any,
			ref: "EmailTemplate",
		},
		status: {
			type: String,
			enum: ["pending", "sent", "failed", "bounced"],
			default: "pending",
		},
		sentAt: { type: Date },
		errorMessage: { type: String },
		metadata: { type: Schema.Types.Mixed, default: {} },
	},
	{ timestamps: true },
);

// Indexes for better performance
notificationSchema.index({ sender: 1, createdAt: -1 });
notificationSchema.index({ "recipients.type": 1, "recipients.value": 1 });
notificationSchema.index({ category: 1, priority: 1 });
notificationSchema.index({ isRead: 1 });
chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ type: 1, isActive: 1 });
chatMessageSchema.index({ room: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });
emailTemplateSchema.index({ category: 1, isActive: 1 });
emailLogSchema.index({ to: 1, status: 1 });
emailLogSchema.index({ createdAt: -1 });

export const Notification =
	mongoose.models.Notification ||
	model<INotification>("Notification", notificationSchema);
export const ChatRoom =
	mongoose.models.ChatRoom || model<IChatRoom>("ChatRoom", chatRoomSchema);
export const ChatMessage =
	mongoose.models.ChatMessage ||
	model<IChatMessage>("ChatMessage", chatMessageSchema);
export const EmailTemplate =
	mongoose.models.EmailTemplate ||
	model<IEmailTemplate>("EmailTemplate", emailTemplateSchema);
export const EmailLog =
	mongoose.models.EmailLog || model<IEmailLog>("EmailLog", emailLogSchema);
