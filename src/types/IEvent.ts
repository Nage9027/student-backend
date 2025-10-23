/** @format */

export interface IEvent {
	_id: string;
	title: string;
	description: string;
	type:
		| "academic"
		| "cultural"
		| "sports"
		| "workshop"
		| "seminar"
		| "conference"
		| "festival";
	startDate: Date;
	endDate: Date;
	startTime: string; // HH:MM format
	endTime: string; // HH:MM format
	location: string;
	organizer: string; // User ID
	coOrganizers: string[]; // User IDs
	participants: string[]; // User IDs
	maxParticipants?: number;
	registrationDeadline?: Date;
	isPublic: boolean;
	requiresRegistration: boolean;
	registrationFee?: number;
	status: "draft" | "published" | "cancelled" | "completed";
	imageUrl?: string;
	attachments: string[]; // File URLs
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
}

export interface IEventRegistration {
	_id: string;
	event: string; // Event ID
	student: string; // Student ID
	registrationDate: Date;
	status: "pending" | "approved" | "rejected" | "cancelled";
	paymentStatus: "pending" | "paid" | "refunded";
	paymentAmount?: number;
	transactionId?: string;
	remarks?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface IClub {
	_id: string;
	name: string;
	description: string;
	category:
		| "academic"
		| "cultural"
		| "sports"
		| "technical"
		| "social"
		| "literary";
	president: string; // Student ID
	vicePresident?: string; // Student ID
	secretary?: string; // Student ID
	treasurer?: string; // Student ID
	members: string[]; // Student IDs
	facultyAdvisor: string; // Teacher ID
	establishedDate: Date;
	isActive: boolean;
	logoUrl?: string;
	socialMedia: {
		facebook?: string;
		instagram?: string;
		twitter?: string;
		website?: string;
	};
	createdAt: Date;
	updatedAt: Date;
}

export interface IClubMembership {
	_id: string;
	club: string; // Club ID
	student: string; // Student ID
	position:
		| "member"
		| "president"
		| "vice_president"
		| "secretary"
		| "treasurer";
	joinDate: Date;
	leaveDate?: Date;
	status: "active" | "inactive" | "suspended";
	achievements: string[];
	createdAt: Date;
	updatedAt: Date;
}
