/** @format */

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import path from "path";

// Routes
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import teacherRoutes from "./routes/teacher.routes";
import studentRoutes from "./routes/student.routes";
import commonRoutes from "./routes/common.routes";
import libraryRoutes from "./routes/library.routes";
import hostelRoutes from "./routes/hostel.routes";
import transportRoutes from "./routes/transport.routes";
import eventRoutes from "./routes/event.routes";
import notificationRoutes from "./routes/notification.routes";
import chatRoutes from "./routes/chat.routes";
import paymentRoutes from "./routes/payment.routes";
import uploadRoutes from "./routes/upload.routes";
import paymentGatewayRoutes from "./routes/paymentGateway.routes";
import emailRoutes from "./routes/email.routes";

// Error handling middleware
import { errorHandler, notFound } from "./middleware/error.middleware";

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 1000, // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// CORS
app.use(
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:3000",
		credentials: true,
	}),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/common", commonRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/hostel", hostelRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payment-gateway", paymentGatewayRoutes);
app.use("/api/email", emailRoutes);

// Health check
app.get("/health", (req, res) => {
	res.json({
		status: "OK",
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV,
	});
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cms";

// Export the app and a function to connect to MongoDB so tests can control startup
export const connectApp = async (): Promise<void> => {
	await mongoose.connect(MONGODB_URI);
	console.log("Connected to MongoDB");
	if (require.main === module) {
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
			console.log(`Environment: ${process.env.NODE_ENV}`);
		});
	}
};

// Automatically connect if the file is executed directly
if (require.main === module) {
	connectApp().catch((error) => {
		console.error("MongoDB connection error:", error);
		process.exit(1);
	});
}

export default app;
