import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Room, AccessType } from "../rooms/room.model";

let io: SocketServer | null = null;

export const initSocket = (server: HttpServer) => {
    io = new SocketServer(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "*",
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
        if (token) {
            try {
                const decoded = jwt.verify(
                    token,
                    process.env.ACCESS_TOKEN_SECRET!
                ) as { id: string };
                socket.data.userId = decoded.id;
            } catch (err) {
                // Connection allowed as guest, but JWT verification failed
            }
        }
        next();
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on("join_room", async (roomId: string, callback?: (response: { success: boolean; message?: string }) => void) => {
            try {
                if (!mongoose.Types.ObjectId.isValid(roomId)) {
                    if (callback) callback({ success: false, message: "Invalid room ID" });
                    return;
                }

                const room = await Room.findById(roomId);
                if (!room) {
                    if (callback) callback({ success: false, message: "Room not found" });
                    return;
                }

                const userId = socket.data.userId;

                // Check if user is blocked
                if (userId) {
                    const isBlocked = room.blocked_users?.some((id) => id.toString() === userId);
                    if (isBlocked) {
                        if (callback) callback({ success: false, message: "You are blocked from this room" });
                        return;
                    }
                }

                // Check private room access
                if (room.access_type === AccessType.PRIVATE) {
                    if (!userId) {
                        if (callback) callback({ success: false, message: "Authentication required for private room" });
                        return;
                    }
                    const isCreator = room.room_creator.toString() === userId;
                    const isMember = room.room_users?.some((id) => id.toString() === userId);
                    if (!isCreator && !isMember) {
                        if (callback) callback({ success: false, message: "You do not have access to this private room" });
                        return;
                    }
                }

                const roomChannel = `discussion:room:${roomId}`;
                socket.join(roomChannel);
                console.log(`Socket ${socket.id} joined room channel ${roomChannel}`);
                if (callback) callback({ success: true });
            } catch (err: any) {
                console.error(`Error in join_room: ${err.message}`);
                if (callback) callback({ success: false, message: "Internal server error" });
            }
        });

        socket.on("leave_room", (roomId: string) => {
            const roomChannel = `discussion:room:${roomId}`;
            socket.leave(roomChannel);
            console.log(`Socket ${socket.id} left room channel ${roomChannel}`);
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized!");
    }
    return io;
};

export const broadcastDiscussionCreated = (roomId: string, discussion: any) => {
    if (io) {
        io.to(`discussion:room:${roomId}`).emit("discussion:created", discussion);
    }
};

export const broadcastDiscussionUpdated = (roomId: string, discussion: any) => {
    if (io) {
        io.to(`discussion:room:${roomId}`).emit("discussion:updated", discussion);
    }
};

export const broadcastDiscussionDeleted = (roomId: string, discussionId: string) => {
    if (io) {
        io.to(`discussion:room:${roomId}`).emit("discussion:deleted", discussionId);
    }
};
