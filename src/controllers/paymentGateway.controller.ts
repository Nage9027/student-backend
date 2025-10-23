/** @format */

import { Request, Response } from "express";
import { RazorpayService } from "../services/razorpay.service";
import { Payment } from "../models/Payment.model";
import { User } from "../models/User.model";

// Create Razorpay order
export const createRazorpayOrder = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { amount, currency, description, studentId, type, referenceId } =
			req.body;

		// Validate required fields
		if (!amount || !studentId || !type || !referenceId) {
			res.status(400).json({
				message:
					"Missing required fields: amount, studentId, type, referenceId",
			});
			return;
		}

		// Create receipt ID
		const receipt = `receipt_${Date.now()}_${Math.random()
			.toString(36)
			.substr(2, 9)}`;

		// Create Razorpay order
		const orderResult = await RazorpayService.createOrder({
			amount,
			currency: currency || "INR",
			receipt,
			notes: {
				studentId,
				type,
				referenceId,
				description: description || `${type} payment`,
			},
		});

		if (!orderResult.success) {
			res.status(500).json({
				message: "Failed to create Razorpay order",
				error: orderResult.error,
			});
			return;
		}

		// Create payment record in database
		const payment = await Payment.create({
			student: studentId,
			type,
			referenceId,
			amount,
			currency: currency || "INR",
			status: "pending",
			paymentMethod: "razorpay",
			gateway: "razorpay",
			gatewayOrderId: orderResult.order.id,
			description: description || `${type} payment`,
		});

		res.json({
			message: "Order created successfully",
			order: orderResult.order,
			payment: {
				id: payment._id,
				amount: payment.amount,
				currency: payment.currency,
				status: payment.status,
			},
		});
	} catch (error) {
		console.error("Error creating Razorpay order:", error);
		res.status(500).json({ message: "Failed to create order", error });
	}
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { paymentId, orderId, signature } = req.body;

		// Verify payment signature
		const verificationResult = RazorpayService.verifyPayment({
			razorpay_order_id: orderId,
			razorpay_payment_id: paymentId,
			razorpay_signature: signature,
		});

		if (!verificationResult.success || !verificationResult.verified) {
			res.status(400).json({
				message: "Payment verification failed",
				verified: false,
			});
			return;
		}

		// Update payment record
		const payment = await Payment.findOneAndUpdate(
			{ gatewayOrderId: orderId },
			{
				status: "completed",
				gatewayTransactionId: paymentId,
				gatewayPaymentId: paymentId,
				gatewaySignature: signature,
				paymentDate: new Date(),
			},
			{ new: true },
		);

		if (!payment) {
			res.status(404).json({ message: "Payment record not found" });
			return;
		}

		// Get payment details from Razorpay
		const paymentDetails = await RazorpayService.getPayment(paymentId);

		res.json({
			message: "Payment verified successfully",
			verified: true,
			payment: {
				id: payment._id,
				amount: payment.amount,
				currency: payment.currency,
				status: payment.status,
				transactionId: payment.gatewayTransactionId,
			},
			razorpayPayment: paymentDetails.success ? paymentDetails.payment : null,
		});
	} catch (error) {
		console.error("Error verifying payment:", error);
		res.status(500).json({ message: "Failed to verify payment", error });
	}
};

// Get payment status
export const getPaymentStatus = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { paymentId } = req.params;

		const payment = await Payment.findById(paymentId).populate(
			"student",
			"profile studentId",
		);

		if (!payment) {
			res.status(404).json({ message: "Payment not found" });
			return;
		}

		// If payment is pending, check with Razorpay
		if (payment.status === "pending" && payment.gatewayOrderId) {
			const orderResult = await RazorpayService.getOrder(
				payment.gatewayOrderId,
			);
			if (orderResult.success) {
				// Update payment status based on Razorpay order status
				const razorpayStatus = orderResult.order.status;
				if (razorpayStatus === "paid") {
					payment.status = "completed";
					await payment.save();
				}
			}
		}

		res.json({
			payment: {
				id: payment._id,
				amount: payment.amount,
				currency: payment.currency,
				status: payment.status,
				paymentDate: payment.paymentDate,
				transactionId: payment.gatewayTransactionId,
			},
		});
	} catch (error) {
		console.error("Error getting payment status:", error);
		res.status(500).json({ message: "Failed to get payment status", error });
	}
};

// Create refund
export const createRazorpayRefund = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { paymentId, amount, reason } = req.body;

		const payment = await Payment.findById(paymentId);
		if (!payment) {
			res.status(404).json({ message: "Payment not found" });
			return;
		}

		if (payment.status !== "completed") {
			res
				.status(400)
				.json({ message: "Payment must be completed to create refund" });
			return;
		}

		if (!payment.gatewayPaymentId) {
			res.status(400).json({ message: "No Razorpay payment ID found" });
			return;
		}

		// Create refund with Razorpay
		const refundResult = await RazorpayService.createRefund(
			payment.gatewayPaymentId,
			amount || payment.amount,
			{ reason: reason || "Refund requested" },
		);

		if (!refundResult.success) {
			res.status(500).json({
				message: "Failed to create refund",
				error: refundResult.error,
			});
			return;
		}

		// Update payment record
		payment.status = "refunded";
		payment.refundAmount = amount || payment.amount;
		payment.refundDate = new Date();
		payment.refundReason = reason || "Refund requested";
		await payment.save();

		res.json({
			message: "Refund created successfully",
			refund: refundResult.refund,
			payment: {
				id: payment._id,
				status: payment.status,
				refundAmount: payment.refundAmount,
			},
		});
	} catch (error) {
		console.error("Error creating refund:", error);
		res.status(500).json({ message: "Failed to create refund", error });
	}
};

// Get refund status
export const getRefundStatus = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { refundId } = req.params;

		const refundResult = await RazorpayService.getRefund(refundId);

		if (!refundResult.success) {
			res.status(404).json({
				message: "Refund not found",
				error: refundResult.error,
			});
			return;
		}

		res.json({
			refund: refundResult.refund,
		});
	} catch (error) {
		console.error("Error getting refund status:", error);
		res.status(500).json({ message: "Failed to get refund status", error });
	}
};

// Create payment link
export const createPaymentLink = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const {
			amount,
			currency,
			description,
			studentId,
			type,
			referenceId,
			customer,
		} = req.body;

		// Validate required fields
		if (!amount || !studentId || !type || !referenceId || !customer) {
			res.status(400).json({
				message:
					"Missing required fields: amount, studentId, type, referenceId, customer",
			});
			return;
		}

		// Create payment link
		const linkResult = await RazorpayService.createPaymentLink({
			amount,
			currency: currency || "INR",
			description: description || `${type} payment`,
			customer,
			notify: {
				sms: true,
				email: true,
			},
			reminder_enable: true,
		});

		if (!linkResult.success) {
			res.status(500).json({
				message: "Failed to create payment link",
				error: linkResult.error,
			});
			return;
		}

		// Create payment record
		const payment = await Payment.create({
			student: studentId,
			type,
			referenceId,
			amount,
			currency: currency || "INR",
			status: "pending",
			paymentMethod: "razorpay",
			gateway: "razorpay",
			description: description || `${type} payment`,
		});

		res.json({
			message: "Payment link created successfully",
			paymentLink: linkResult.paymentLink,
			payment: {
				id: payment._id,
				amount: payment.amount,
				currency: payment.currency,
				status: payment.status,
			},
		});
	} catch (error) {
		console.error("Error creating payment link:", error);
		res.status(500).json({ message: "Failed to create payment link", error });
	}
};

// Webhook handler for Razorpay events
export const handleRazorpayWebhook = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const signature = req.headers["x-razorpay-signature"] as string;
		const body = JSON.stringify(req.body);

		// Verify webhook signature
		const expectedSignature = require("crypto")
			.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
			.update(body)
			.digest("hex");

		if (signature !== expectedSignature) {
			res.status(400).json({ message: "Invalid webhook signature" });
			return;
		}

		const event = req.body;

		// Handle different webhook events
		switch (event.event) {
			case "payment.captured":
				await handlePaymentCaptured(event.payload.payment.entity);
				break;
			case "payment.failed":
				await handlePaymentFailed(event.payload.payment.entity);
				break;
			case "refund.created":
				await handleRefundCreated(event.payload.refund.entity);
				break;
			default:
				console.log(`Unhandled webhook event: ${event.event}`);
		}

		res.json({ message: "Webhook processed successfully" });
	} catch (error) {
		console.error("Error handling webhook:", error);
		res.status(500).json({ message: "Failed to process webhook", error });
	}
};

// Helper functions for webhook events
async function handlePaymentCaptured(payment: any) {
	try {
		const paymentRecord = await Payment.findOneAndUpdate(
			{ gatewayPaymentId: payment.id },
			{
				status: "completed",
				gatewayTransactionId: payment.id,
				paymentDate: new Date(payment.created_at * 1000),
			},
			{ new: true },
		);

		if (paymentRecord) {
			console.log(`Payment ${payment.id} captured successfully`);
		}
	} catch (error) {
		console.error("Error handling payment captured:", error);
	}
}

async function handlePaymentFailed(payment: any) {
	try {
		const paymentRecord = await Payment.findOneAndUpdate(
			{ gatewayPaymentId: payment.id },
			{
				status: "failed",
			},
			{ new: true },
		);

		if (paymentRecord) {
			console.log(`Payment ${payment.id} failed`);
		}
	} catch (error) {
		console.error("Error handling payment failed:", error);
	}
}

async function handleRefundCreated(refund: any) {
	try {
		const paymentRecord = await Payment.findOneAndUpdate(
			{ gatewayPaymentId: refund.payment_id },
			{
				status: "refunded",
				refundAmount: refund.amount / 100, // Convert from paise
				refundDate: new Date(refund.created_at * 1000),
			},
			{ new: true },
		);

		if (paymentRecord) {
			console.log(`Refund ${refund.id} created successfully`);
		}
	} catch (error) {
		console.error("Error handling refund created:", error);
	}
}
