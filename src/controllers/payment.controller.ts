/** @format */

import { Request, Response } from "express";
import {
	Payment,
	PaymentMethod,
	Refund,
	PaymentGateway,
} from "../models/Payment.model";
import { User } from "../models/User.model";

// Payment Management
export const getAllPayments = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const {
			page = 1,
			limit = 10,
			studentId,
			type,
			status,
			paymentMethod,
		} = req.query;
		const query: any = {};

		if (studentId) {
			query.student = studentId;
		}

		if (type) {
			query.type = type;
		}

		if (status) {
			query.status = status;
		}

		if (paymentMethod) {
			query.paymentMethod = paymentMethod;
		}

		const payments = await Payment.find(query)
			.populate("student", "profile studentId")
			.sort({ paymentDate: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const total = await Payment.countDocuments(query);

		res.json({
			payments,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch payments", error });
	}
};

export const getPaymentById = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const payment = await Payment.findById(id).populate(
			"student",
			"profile studentId",
		);

		if (!payment) {
			res.status(404).json({ message: "Payment not found" });
			return;
		}

		res.json(payment);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch payment", error });
	}
};

export const createPayment = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const paymentData = req.body;
		paymentData.student = req.user?.id;

		const payment = await Payment.create(paymentData);

		res.status(201).json({
			message: "Payment created successfully",
			payment,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to create payment", error });
	}
};

export const updatePaymentStatus = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const { status, gatewayTransactionId, gatewayPaymentId, gatewaySignature } =
			req.body;

		const updateData: any = { status };
		if (gatewayTransactionId)
			updateData.gatewayTransactionId = gatewayTransactionId;
		if (gatewayPaymentId) updateData.gatewayPaymentId = gatewayPaymentId;
		if (gatewaySignature) updateData.gatewaySignature = gatewaySignature;

		const payment = await Payment.findByIdAndUpdate(id, updateData, {
			new: true,
		});

		if (!payment) {
			res.status(404).json({ message: "Payment not found" });
			return;
		}

		res.json({
			message: "Payment status updated successfully",
			payment,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to update payment status", error });
	}
};

// Payment Method Management
export const getPaymentMethods = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { studentId } = req.params;
		const { isActive } = req.query;

		const query: any = { student: studentId };
		if (isActive !== undefined) {
			query.isActive = isActive === "true";
		}

		const paymentMethods = await PaymentMethod.find(query).sort({
			createdAt: -1,
		});

		res.json(paymentMethods);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch payment methods", error });
	}
};

export const addPaymentMethod = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const paymentMethodData = req.body;
		paymentMethodData.student = req.user?.id;

		// If this is set as default, unset other defaults
		if (paymentMethodData.isDefault) {
			await PaymentMethod.updateMany(
				{ student: paymentMethodData.student },
				{ isDefault: false },
			);
		}

		const paymentMethod = await PaymentMethod.create(paymentMethodData);

		res.status(201).json({
			message: "Payment method added successfully",
			paymentMethod,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to add payment method", error });
	}
};

export const updatePaymentMethod = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		// If this is set as default, unset other defaults
		if (updateData.isDefault) {
			await PaymentMethod.updateMany(
				{ student: req.user?.id, _id: { $ne: id } },
				{ isDefault: false },
			);
		}

		const paymentMethod = await PaymentMethod.findByIdAndUpdate(
			id,
			updateData,
			{ new: true },
		);

		if (!paymentMethod) {
			res.status(404).json({ message: "Payment method not found" });
			return;
		}

		res.json({
			message: "Payment method updated successfully",
			paymentMethod,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to update payment method", error });
	}
};

export const deletePaymentMethod = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const paymentMethod = await PaymentMethod.findByIdAndDelete(id);

		if (!paymentMethod) {
			res.status(404).json({ message: "Payment method not found" });
			return;
		}

		res.json({ message: "Payment method deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Failed to delete payment method", error });
	}
};

// Refund Management
export const createRefund = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const refundData = req.body;
		refundData.processedBy = req.user?.id;

		const refund = await Refund.create(refundData);

		// Update payment status to refunded
		await Payment.findByIdAndUpdate(refundData.payment, {
			status: "refunded",
			refundAmount: refundData.amount,
			refundDate: new Date(),
		});

		res.status(201).json({
			message: "Refund created successfully",
			refund,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to create refund", error });
	}
};

export const updateRefundStatus = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const { status, gatewayRefundId } = req.body;

		const updateData: any = { status };
		if (gatewayRefundId) updateData.gatewayRefundId = gatewayRefundId;
		if (status === "completed") updateData.processedAt = new Date();

		const refund = await Refund.findByIdAndUpdate(id, updateData, {
			new: true,
		});

		if (!refund) {
			res.status(404).json({ message: "Refund not found" });
			return;
		}

		res.json({
			message: "Refund status updated successfully",
			refund,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to update refund status", error });
	}
};

export const getRefunds = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { page = 1, limit = 10, studentId, status } = req.query;
		const query: any = {};

		if (studentId) {
			query.student = studentId;
		}

		if (status) {
			query.status = status;
		}

		const refunds = await Refund.find(query)
			.populate("payment")
			.populate("student", "profile studentId")
			.populate("processedBy", "profile employeeId")
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const total = await Refund.countDocuments(query);

		res.json({
			refunds,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch refunds", error });
	}
};

// Payment Gateway Management
export const getPaymentGateways = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { isActive } = req.query;
		const query: any = {};

		if (isActive !== undefined) {
			query.isActive = isActive === "true";
		}

		const gateways = await PaymentGateway.find(query).sort({ createdAt: -1 });

		res.json(gateways);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Failed to fetch payment gateways", error });
	}
};

export const createPaymentGateway = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const gateway = await PaymentGateway.create(req.body);

		res.status(201).json({
			message: "Payment gateway created successfully",
			gateway,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Failed to create payment gateway", error });
	}
};

export const updatePaymentGateway = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		const gateway = await PaymentGateway.findByIdAndUpdate(id, updateData, {
			new: true,
		});

		if (!gateway) {
			res.status(404).json({ message: "Payment gateway not found" });
			return;
		}

		res.json({
			message: "Payment gateway updated successfully",
			gateway,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Failed to update payment gateway", error });
	}
};

// Payment Statistics
export const getPaymentStats = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { startDate, endDate } = req.query;

		const query: any = { status: "completed" };
		if (startDate && endDate) {
			query.paymentDate = {
				$gte: new Date(startDate as string),
				$lte: new Date(endDate as string),
			};
		}

		const totalAmount = await Payment.aggregate([
			{ $match: query },
			{ $group: { _id: null, total: { $sum: "$amount" } } },
		]);

		const paymentsByType = await Payment.aggregate([
			{ $match: query },
			{
				$group: {
					_id: "$type",
					total: { $sum: "$amount" },
					count: { $sum: 1 },
				},
			},
		]);

		const paymentsByMethod = await Payment.aggregate([
			{ $match: query },
			{
				$group: {
					_id: "$paymentMethod",
					total: { $sum: "$amount" },
					count: { $sum: 1 },
				},
			},
		]);

		res.json({
			totalAmount: totalAmount[0]?.total || 0,
			paymentsByType,
			paymentsByMethod,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Failed to fetch payment statistics", error });
	}
};
