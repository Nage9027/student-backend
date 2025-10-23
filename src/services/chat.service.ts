/** @format */

import { models } from "../models";
import WebSocketService from "./websocket.service";

// Singleton instance
let chatServiceInstance: ChatService | null = null;

// Create singleton WebSocket service
const wsService = new WebSocketService(require("http").createServer());

export interface CreateMessageData {
	roomId: string;
	senderId: string;
	message: string;
	type: "text" | "file" | "image" | "system";
	metadata?: any;
}

class ChatService {
	private wsService: WebSocketService;

	constructor(wsService: WebSocketService) {
		this.wsService = wsService;
	}

	// Send message
	public async sendMessage(data: CreateMessageData): Promise<any> {
		try {
			const message = new models.ChatMessage({
				roomId: data.roomId,
				sender: data.senderId,
				message: data.message,
				type: data.type,
				metadata: data.metadata,
			});

			await message.save();

			// Populate sender information
			const populatedMessage = await models.ChatMessage.findById(message._id)
				.populate("sender", "name email role avatar")
				.lean();

			// Send real-time message to room
			this.wsService.sendToRoom(data.roomId, "new-message", populatedMessage);

			return populatedMessage;
		} catch (error) {
			console.error("Error sending message:", error);
			throw error;
		}
	}

	// Get messages for a room
	public async getRoomMessages(
		roomId: string,
		page: number = 1,
		limit: number = 50,
	) {
		try {
			const skip = (page - 1) * limit;

			const messages = await models.ChatMessage.find({ roomId })
				.populate("sender", "name email role avatar")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean();

			const total = await models.ChatMessage.countDocuments({ roomId });

			return {
				messages: messages.reverse(), // Return in chronological order
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit),
				},
			};
		} catch (error) {
			console.error("Error fetching room messages:", error);
			throw error;
		}
	}

	// Get recent messages for a room
	public async getRecentMessages(roomId: string, limit: number = 20) {
		try {
			const messages = await models.ChatMessage.find({ roomId })
				.populate("sender", "name email role avatar")
				.sort({ createdAt: -1 })
				.limit(limit)
				.lean();

			return messages.reverse(); // Return in chronological order
		} catch (error) {
			console.error("Error fetching recent messages:", error);
			throw error;
		}
	}

	// Delete message
	public async deleteMessage(messageId: string, userId: string) {
		try {
			const message = await models.ChatMessage.findOneAndDelete({
				_id: messageId,
				sender: userId,
			});

			if (message) {
				// Notify room about message deletion
				this.wsService.sendToRoom(message.roomId, "message-deleted", {
					messageId,
					roomId: message.roomId,
				});
			}

			return message;
		} catch (error) {
			console.error("Error deleting message:", error);
			throw error;
		}
	}

	// Get room participants
	public async getRoomParticipants(roomId: string) {
		try {
			// Get all users who have sent messages in this room
			const participants = await models.ChatMessage.distinct("sender", {
				roomId,
			});

			const users = await models.User.find({
				_id: { $in: participants },
			}).select("name email role avatar");

			return users;
		} catch (error) {
			console.error("Error fetching room participants:", error);
			throw error;
		}
	}

	// Get user's chat rooms
	public async getUserRooms(userId: string) {
		try {
			// Get all rooms where user has sent messages
			const rooms = await models.ChatMessage.distinct("roomId", {
				sender: userId,
			});

			// Get recent message for each room
			const roomsWithRecentMessage = await Promise.all(
				rooms.map(async (roomId: string) => {
					const recentMessage = await models.ChatMessage.findOne({ roomId })
						.populate("sender", "name email role avatar")
						.sort({ createdAt: -1 })
						.lean();

					return {
						roomId,
						recentMessage,
						lastActivity: recentMessage?.createdAt,
					};
				}),
			);

			// Sort by last activity
			return roomsWithRecentMessage.sort(
				(a, b) =>
					new Date(b.lastActivity || 0).getTime() -
					new Date(a.lastActivity || 0).getTime(),
			);
		} catch (error) {
			console.error("Error fetching user rooms:", error);
			throw error;
		}
	}

	// Create or get room for two users
	public async getOrCreateDirectRoom(userId1: string, userId2: string) {
		try {
			// Check if direct room already exists
			const existingRoom = await models.ChatMessage.findOne({
				$or: [
					{ roomId: `${userId1}-${userId2}` },
					{ roomId: `${userId2}-${userId1}` },
				],
			});

			if (existingRoom) {
				return existingRoom.roomId;
			}

			// Create new direct room
			const roomId = `${userId1}-${userId2}`;

			// Send welcome message
			await this.sendMessage({
				roomId,
				senderId: userId1,
				message: "Chat started",
				type: "system",
			});

			return roomId;
		} catch (error) {
			console.error("Error creating direct room:", error);
			throw error;
		}
	}

	// Create class room
	public async createClassRoom(classId: string, createdBy: string) {
		try {
			const roomId = `class-${classId}`;

			// Send welcome message
			await this.sendMessage({
				roomId,
				senderId: createdBy,
				message: `Class room created for ${classId}`,
				type: "system",
			});

			return roomId;
		} catch (error) {
			console.error("Error creating class room:", error);
			throw error;
		}
	}

	// Get chat statistics
	public async getChatStats(userId: string) {
		try {
			const totalMessages = await models.ChatMessage.countDocuments({
				sender: userId,
			});
			const totalRooms = await models.ChatMessage.distinct("roomId", {
				sender: userId,
			}).then((rooms: string[]) => rooms.length);

			const messagesByType = await models.ChatMessage.aggregate([
				{ $match: { sender: userId } },
				{ $group: { _id: "$type", count: { $sum: 1 } } },
			]);

			return {
				totalMessages,
				totalRooms,
				messagesByType,
			};
		} catch (error) {
			console.error("Error fetching chat stats:", error);
			throw error;
		}
	}
}

export const getChatService = (): ChatService => {
	if (!chatServiceInstance) {
		chatServiceInstance = new ChatService(wsService);
	}
	return chatServiceInstance;
};

export default ChatService;
