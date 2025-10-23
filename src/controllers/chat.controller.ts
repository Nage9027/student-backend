/** @format */

import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import ChatService from "../services/chat.service";

class ChatController {
	private chatService: ChatService;

	constructor(chatService: ChatService) {
		this.chatService = chatService;
	}

	// Send message
	public sendMessage = [
		body("roomId").notEmpty().withMessage("Room ID is required"),
		body("message").notEmpty().withMessage("Message is required"),
		body("type")
			.isIn(["text", "file", "image", "system"])
			.withMessage("Invalid message type"),

		async (req: Request, res: Response) => {
			try {
				const errors = validationResult(req);
				if (!errors.isEmpty()) {
					return res.status(400).json({ errors: errors.array() });
				}

				const userId = req.user?.id;
				if (!userId) {
					return res.status(401).json({ message: "User not authenticated" });
				}

				const messageData = {
					...req.body,
					senderId: userId,
				};

				const message = await this.chatService.sendMessage(messageData);

				res.status(201).json({
					success: true,
					data: message,
				});
			} catch (error) {
				console.error("Error sending message:", error);
				res.status(500).json({ message: "Internal server error" });
			}
		},
	];

	// Get room messages
	public getRoomMessages = async (req: Request, res: Response) => {
		try {
			const { roomId } = req.params;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 50;

			const result = await this.chatService.getRoomMessages(
				roomId,
				page,
				limit,
			);

			res.json({
				success: true,
				data: result,
			});
		} catch (error) {
			console.error("Error fetching room messages:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	// Get recent messages
	public getRecentMessages = async (req: Request, res: Response) => {
		try {
			const { roomId } = req.params;
			const limit = parseInt(req.query.limit as string) || 20;

			const messages = await this.chatService.getRecentMessages(roomId, limit);

			res.json({
				success: true,
				data: messages,
			});
		} catch (error) {
			console.error("Error fetching recent messages:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	// Delete message
	public deleteMessage = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id;
			const { messageId } = req.params;

			if (!userId) {
				return res.status(401).json({ message: "User not authenticated" });
			}

			const message = await this.chatService.deleteMessage(messageId, userId);

			if (!message) {
				return res.status(404).json({ message: "Message not found" });
			}

			res.json({
				success: true,
				message: "Message deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting message:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	// Get room participants
	public getRoomParticipants = async (req: Request, res: Response) => {
		try {
			const { roomId } = req.params;

			const participants = await this.chatService.getRoomParticipants(roomId);

			res.json({
				success: true,
				data: participants,
			});
		} catch (error) {
			console.error("Error fetching room participants:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	// Get user rooms
	public getUserRooms = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				return res.status(401).json({ message: "User not authenticated" });
			}

			const rooms = await this.chatService.getUserRooms(userId);

			res.json({
				success: true,
				data: rooms,
			});
		} catch (error) {
			console.error("Error fetching user rooms:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	// Create or get direct room
	public getOrCreateDirectRoom = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id;
			const { otherUserId } = req.params;

			if (!userId) {
				return res.status(401).json({ message: "User not authenticated" });
			}

			const roomId = await this.chatService.getOrCreateDirectRoom(
				userId,
				otherUserId,
			);

			res.json({
				success: true,
				data: { roomId },
			});
		} catch (error) {
			console.error("Error creating direct room:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	// Create class room
	public createClassRoom = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id;
			const { classId } = req.params;

			if (!userId) {
				return res.status(401).json({ message: "User not authenticated" });
			}

			const roomId = await this.chatService.createClassRoom(classId, userId);

			res.status(201).json({
				success: true,
				data: { roomId },
			});
		} catch (error) {
			console.error("Error creating class room:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	// Get chat statistics
	public getChatStats = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				return res.status(401).json({ message: "User not authenticated" });
			}

			const stats = await this.chatService.getChatStats(userId);

			res.json({
				success: true,
				data: stats,
			});
		} catch (error) {
			console.error("Error fetching chat stats:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	};
}

export default ChatController;
