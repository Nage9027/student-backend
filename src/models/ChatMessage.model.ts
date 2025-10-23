/** @format */

import mongoose, { Document, Schema } from "mongoose";

export interface IChatMessage extends Document {
	roomId: string;
	sender: mongoose.Types.ObjectId;
	message: string;
	type: "text" | "file" | "image" | "system";
	metadata?: {
		fileName?: string;
		fileUrl?: string;
		fileSize?: number;
		mimeType?: string;
	};
	isEdited?: boolean;
	editedAt?: Date;
	isDeleted?: boolean;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
	{
		roomId: {
			type: String,
			required: true,
			index: true,
		},
		sender: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		message: {
			type: String,
			required: true,
			trim: true,
		},
		type: {
			type: String,
			enum: ["text", "file", "image", "system"],
			default: "text",
		},
		metadata: {
			fileName: String,
			fileUrl: String,
			fileSize: Number,
			mimeType: String,
		},
		isEdited: {
			type: Boolean,
			default: false,
		},
		editedAt: Date,
		isDeleted: {
			type: Boolean,
			default: false,
		},
		deletedAt: Date,
	},
	{
		timestamps: true,
	},
);

// Indexes for better performance
ChatMessageSchema.index({ roomId: 1, createdAt: -1 });
ChatMessageSchema.index({ sender: 1, createdAt: -1 });

// Try to get existing model first, if it doesn't exist then create it
export const ChatMessage =
	mongoose.models.ChatMessage ||
	mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
