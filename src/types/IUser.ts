/** @format */

export interface IUser {
	_id: string;
	email: string;
	password: string;
	role: "admin" | "teacher" | "student";
	profile: {
		firstName: string;
		lastName: string;
		phone: string;
		address: string;
		dateOfBirth: Date;
		gender: "male" | "female" | "other";
		avatar?: string;
	};
	isActive: boolean;
	lastLogin?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface IStudent extends IUser {
	studentId: string;
	academicInfo: {
		admissionDate: Date;
		currentSemester: number;
		department: string;
		program: string;
		batch: string;
	};
	parentInfo: {
		fatherName: string;
		motherName: string;
		parentPhone: string;
		parentEmail: string;
	};
	fees: {
		totalAmount: number;
		paidAmount: number;
		dueAmount: number;
		paymentHistory: IPaymentRecord[];
	};
}

export interface IPaymentRecord {
	_id: string;
	amount: number;
	date: Date;
	method: string;
	transactionId: string;
	status: "pending" | "completed" | "failed";
	receiptUrl?: string;
}

export interface ITeacher extends IUser {
	employeeId: string;
	department: string;
	designation: string;
	qualifications: string[];
	subjects: string[];
	joiningDate: Date;
	salary: number;
}

export interface IAdmin extends IUser {
	adminId: string;
	permissions: string[];
}
