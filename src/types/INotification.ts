/** @format */

export interface INotification {
	_id: string;
	title: string;
	message: string;
	type: "info" | "success" | "warning" | "error" | "announcement";
	priority: "low" | "medium" | "high" | "urgent";
	sender: string; // User ID
	recipients: {
		type: "all" | "role" | "specific" | "department" | "batch";
		value: string | string[]; // Role name, department, batch, or specific user IDs
	};
	category:
		| "academic"
		| "fee"
		| "attendance"
		| "exam"
		| "event"
		| "general"
		| "emergency";
	isRead: boolean;
	readBy: string[]; // User IDs who have read the notification
	scheduledAt?: Date; // For scheduled notifications
	expiresAt?: Date; // For expiring notifications
	actionUrl?: string; // URL to redirect when notification is clicked
	attachments: string[]; // File URLs
	metadata: Record<string, any>; // Additional data
	createdAt: Date;
	updatedAt: Date;
}

export interface IChatRoom {
	_id: string;
	name: string;
	type: "direct" | "group" | "class" | "department";
	participants: string[]; // User IDs
	admins: string[]; // User IDs
	lastMessage?: string; // Message ID
	lastMessageAt?: Date;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface IChatMessage {
	_id: string;
	room: string; // Chat Room ID
	sender: string; // User ID
	message: string;
	type: "text" | "image" | "file" | "system";
	attachments: string[]; // File URLs
	replyTo?: string; // Message ID being replied to
	isEdited: boolean;
	editedAt?: Date;
	isDeleted: boolean;
	deletedAt?: Date;
	readBy: {
		user: string; // User ID
		readAt: Date;
	}[];
	createdAt: Date;
	updatedAt: Date;
}

export interface IEmailTemplate {
	_id: string;
	name: string;
	subject: string;
	body: string;
	variables: string[]; // Available template variables
	category:
		| "welcome"
		| "fee_reminder"
		| "exam_notification"
		| "event_invitation"
		| "custom";
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface IEmailLog {
	_id: string;
	to: string;
	subject: string;
	body: string;
	template?: string; // Template ID
	status: "pending" | "sent" | "failed" | "bounced";
	sentAt?: Date;
	errorMessage?: string;
	metadata: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
}
