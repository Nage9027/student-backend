/** @format */

import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model";

interface AuthenticatedSocket extends Socket {
	userId?: string;
	userRole?: string;
}

class WebSocketService {
	private io: SocketIOServer;
	private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

	constructor(server: HTTPServer) {
		this.io = new SocketIOServer(server, {
			cors: {
				origin: process.env.FRONTEND_URL || "http://localhost:3000",
				methods: ["GET", "POST"],
			},
		});

		this.setupMiddleware();
		this.setupEventHandlers();
	}

	private setupMiddleware() {
		this.io.use(async (socket: AuthenticatedSocket, next) => {
			try {
				const token =
					socket.handshake.auth.token ||
					socket.handshake.headers.authorization?.split(" ")[1];

				if (!token) {
					return next(new Error("Authentication error: No token provided"));
				}

				const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
				const user = await User.findById(decoded.userId).select(
					"_id role email",
				);

				if (!user) {
					return next(new Error("Authentication error: User not found"));
				}

				socket.userId = user._id.toString();
				socket.userRole = user.role;
				next();
			} catch (error) {
				next(new Error("Authentication error: Invalid token"));
			}
		});
	}

	private setupEventHandlers() {
		this.io.on("connection", (socket: AuthenticatedSocket) => {
			console.log(
				`User ${socket.userId} connected with role ${socket.userRole}`,
			);

			// Store user connection
			if (socket.userId) {
				this.connectedUsers.set(socket.userId, socket.id);
			}

			// Join role-based rooms
			if (socket.userRole) {
				socket.join(socket.userRole);
			}

			// Handle joining specific rooms (e.g., class-specific notifications)
			socket.on("join-room", (roomId: string) => {
				socket.join(roomId);
				console.log(`User ${socket.userId} joined room ${roomId}`);
			});

			// Handle leaving rooms
			socket.on("leave-room", (roomId: string) => {
				socket.leave(roomId);
				console.log(`User ${socket.userId} left room ${roomId}`);
			});

			// Handle chat messages
			socket.on(
				"send-message",
				(data: { roomId: string; message: string; type: "text" | "file" }) => {
					this.io.to(data.roomId).emit("new-message", {
						userId: socket.userId,
						userRole: socket.userRole,
						message: data.message,
						type: data.type,
						timestamp: new Date(),
					});
				},
			);

			// Handle typing indicators
			socket.on("typing", (data: { roomId: string; isTyping: boolean }) => {
				socket.to(data.roomId).emit("user-typing", {
					userId: socket.userId,
					isTyping: data.isTyping,
				});
			});

			// Handle disconnect
			socket.on("disconnect", () => {
				console.log(`User ${socket.userId} disconnected`);
				if (socket.userId) {
					this.connectedUsers.delete(socket.userId);
				}
			});
		});
	}

	// Send notification to specific user
	public sendToUser(userId: string, event: string, data: any) {
		const socketId = this.connectedUsers.get(userId);
		if (socketId) {
			this.io.to(socketId).emit(event, data);
		}
	}

	// Send notification to all users with specific role
	public sendToRole(role: string, event: string, data: any) {
		this.io.to(role).emit(event, data);
	}

	// Send notification to specific room
	public sendToRoom(roomId: string, event: string, data: any) {
		this.io.to(roomId).emit(event, data);
	}

	// Broadcast to all connected users
	public broadcast(event: string, data: any) {
		this.io.emit(event, data);
	}

	// Get connected users count
	public getConnectedUsersCount(): number {
		return this.connectedUsers.size;
	}

	// Get users by role
	public getUsersByRole(role: string): string[] {
		const room = this.io.sockets.adapter.rooms.get(role);
		return room ? Array.from(room) : [];
	}
}

export default WebSocketService;
