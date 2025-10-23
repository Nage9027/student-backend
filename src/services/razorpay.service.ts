/** @format */

import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Initialize Razorpay
const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID || "",
	key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export interface CreateOrderParams {
	amount: number;
	currency?: string;
	receipt: string;
	notes?: Record<string, any>;
}

export interface PaymentVerificationParams {
	razorpay_order_id: string;
	razorpay_payment_id: string;
	razorpay_signature: string;
}

export class RazorpayService {
	// Create a new order
	static async createOrder(params: CreateOrderParams) {
		try {
			const options = {
				amount: params.amount * 100, // Convert to paise
				currency: params.currency || "INR",
				receipt: params.receipt,
				notes: params.notes || {},
			};

			const order = await razorpay.orders.create(options);
			return {
				success: true,
				order,
			};
		} catch (error) {
			console.error("Error creating Razorpay order:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	// Verify payment signature
	static verifyPayment(params: PaymentVerificationParams) {
		try {
			const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
				params;
			const body = razorpay_order_id + "|" + razorpay_payment_id;
			const expectedSignature = crypto
				.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
				.update(body.toString())
				.digest("hex");

			const isAuthentic = expectedSignature === razorpay_signature;

			return {
				success: isAuthentic,
				verified: isAuthentic,
			};
		} catch (error) {
			console.error("Error verifying payment:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	// Get payment details
	static async getPayment(paymentId: string) {
		try {
			const payment = await razorpay.payments.fetch(paymentId);
			return {
				success: true,
				payment,
			};
		} catch (error) {
			console.error("Error fetching payment:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	// Get order details
	static async getOrder(orderId: string) {
		try {
			const order = await razorpay.orders.fetch(orderId);
			return {
				success: true,
				order,
			};
		} catch (error) {
			console.error("Error fetching order:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	// Create refund
	static async createRefund(
		paymentId: string,
		amount: number,
		notes?: Record<string, any>,
	) {
		try {
			const refund = await razorpay.payments.refund(paymentId, {
				amount: amount * 100, // Convert to paise
				notes: notes || {},
			});
			return {
				success: true,
				refund,
			};
		} catch (error) {
			console.error("Error creating refund:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	// Get refund details
	static async getRefund(refundId: string) {
		try {
			const refund = await razorpay.refunds.fetch(refundId);
			return {
				success: true,
				refund,
			};
		} catch (error) {
			console.error("Error fetching refund:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	// Capture payment (for authorized payments)
	static async capturePayment(
		paymentId: string,
		amount: number,
		currency: string = "INR",
	) {
		try {
			const payment = await razorpay.payments.capture(
				paymentId,
				amount * 100,
				currency,
			);
			return {
				success: true,
				payment,
			};
		} catch (error) {
			console.error("Error capturing payment:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	// Get all payments
	static async getAllPayments(options: any = {}) {
		try {
			const payments = await razorpay.payments.all(options);
			return {
				success: true,
				payments,
			};
		} catch (error) {
			console.error("Error fetching payments:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	// Get all orders
	static async getAllOrders(options: any = {}) {
		try {
			const orders = await razorpay.orders.all(options);
			return {
				success: true,
				orders,
			};
		} catch (error) {
			console.error("Error fetching orders:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	// Generate payment link
	static async createPaymentLink(params: {
		amount: number;
		currency?: string;
		description: string;
		customer: {
			name: string;
			email: string;
			contact: string;
		};
		notify: {
			sms: boolean;
			email: boolean;
		};
		reminder_enable: boolean;
		callback_url?: string;
		callback_method?: string;
	}) {
		try {
			const paymentLink = await razorpay.paymentLink.create({
				amount: params.amount * 100,
				currency: params.currency || "INR",
				description: params.description,
				customer: params.customer,
				notify: params.notify,
				reminder_enable: params.reminder_enable,
				callback_url: params.callback_url,
				callback_method: params.callback_method || "get",
			});

			return {
				success: true,
				paymentLink,
			};
		} catch (error) {
			console.error("Error creating payment link:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
