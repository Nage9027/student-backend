/** @format */

import express from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import ChatController from "../controllers/chat.controller";
import { getChatService } from "../services/chat.service";

const router = express.Router();

// Initialize controller with singleton chat service
const chatController = new ChatController(getChatService());

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Send message
router.post("/message", chatController.sendMessage);

// Get room messages
router.get("/room/:roomId/messages", chatController.getRoomMessages);

// Get recent messages
router.get("/room/:roomId/recent", chatController.getRecentMessages);

// Delete message
router.delete("/message/:messageId", chatController.deleteMessage);

// Get room participants
router.get("/room/:roomId/participants", chatController.getRoomParticipants);

// Get user rooms
router.get("/rooms", chatController.getUserRooms);

// Create or get direct room
router.get("/direct/:otherUserId", chatController.getOrCreateDirectRoom);

// Create class room (Teachers and Admins)
router.post(
	"/class/:classId",
	requireRole(["admin", "teacher"]),
	chatController.createClassRoom,
);

// Get chat statistics
router.get("/stats", chatController.getChatStats);

export default router;
