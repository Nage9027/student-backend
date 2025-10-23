/** @format */

export interface IBook {
	_id: string;
	title: string;
	author: string;
	isbn: string;
	publisher: string;
	publicationYear: number;
	category: string;
	department: string;
	totalCopies: number;
	availableCopies: number;
	location: string;
	description?: string;
	coverImage?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface IBookIssue {
	_id: string;
	student: string; // Student ID
	book: string; // Book ID
	issueDate: Date;
	dueDate: Date;
	returnDate?: Date;
	status: "issued" | "returned" | "overdue";
	fineAmount: number;
	issuedBy: string; // Librarian ID
	remarks?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface IBookReservation {
	_id: string;
	student: string; // Student ID
	book: string; // Book ID
	reservationDate: Date;
	expiryDate: Date;
	status: "active" | "fulfilled" | "expired" | "cancelled";
	createdAt: Date;
	updatedAt: Date;
}

export interface ILibraryFine {
	_id: string;
	student: string; // Student ID
	bookIssue: string; // Book Issue ID
	amount: number;
	reason: "overdue" | "damage" | "lost";
	status: "pending" | "paid";
	dueDate: Date;
	paidDate?: Date;
	createdAt: Date;
	updatedAt: Date;
}
