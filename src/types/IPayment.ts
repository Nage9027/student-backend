/** @format */

export interface IPayment {
	_id: string;
	student: string; // Student ID
	type:
		| "fee"
		| "hostel"
		| "transport"
		| "library_fine"
		| "event_registration"
		| "other";
	referenceId: string; // Fee ID, Hostel Allocation ID, etc.
	amount: number;
	currency: string;
	status:
		| "pending"
		| "processing"
		| "completed"
		| "failed"
		| "cancelled"
		| "refunded";
	paymentMethod:
		| "razorpay"
		| "stripe"
		| "cash"
		| "cheque"
		| "bank_transfer"
		| "upi";
	gateway: "razorpay" | "stripe" | "offline";
	gatewayTransactionId?: string;
	gatewayOrderId?: string;
	gatewayPaymentId?: string;
	gatewaySignature?: string;
	paymentDate: Date;
	dueDate?: Date;
	description: string;
	metadata: Record<string, any>;
	receiptUrl?: string;
	refundAmount?: number;
	refundDate?: Date;
	refundReason?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface IPaymentMethod {
	_id: string;
	student: string; // Student ID
	type: "card" | "upi" | "netbanking" | "wallet";
	provider: string; // 'razorpay', 'stripe', etc.
	token: string; // Encrypted payment method token
	lastFour?: string; // Last 4 digits of card
	expiryMonth?: number;
	expiryYear?: number;
	isDefault: boolean;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface IRefund {
	_id: string;
	payment: string; // Payment ID
	student: string; // Student ID
	amount: number;
	reason: string;
	status: "pending" | "processing" | "completed" | "failed" | "cancelled";
	gatewayRefundId?: string;
	processedAt?: Date;
	processedBy: string; // Admin ID
	remarks?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface IPaymentGateway {
	_id: string;
	name: string;
	type: "razorpay" | "stripe" | "payu" | "paytm";
	isActive: boolean;
	credentials: {
		keyId: string;
		keySecret: string;
		webhookSecret?: string;
		environment: "sandbox" | "production";
	};
	supportedMethods: string[];
	processingFee: number; // Percentage
	minimumAmount: number;
	maximumAmount: number;
	createdAt: Date;
	updatedAt: Date;
}
