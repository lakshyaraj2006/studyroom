import { Socket, Server as SocketServer } from "socket.io";
import mongoose from "mongoose";
import { Room, AccessType } from "./room.model";
import { getIo } from "@/core/socket";

// Track active users per room: roomId -> Set of userIds
export const activeUsersPerRoom = new Map<string, Set<string>>();

export const handleRoomSocket = (socket: Socket, io: SocketServer) => {
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

            // Add to active users per room in memory
            if (userId) {
                if (!activeUsersPerRoom.has(roomId)) {
                    activeUsersPerRoom.set(roomId, new Set());
                }
                activeUsersPerRoom.get(roomId)!.add(userId);

                // Broadcast that this user is now active to other active users in the room
                socket.to(roomChannel).emit("room:member_active_status_change", {
                    userId,
                    active: true
                });
            }

            if (callback) callback({ success: true });
        } catch (err: any) {
            console.error(`Error in join_room: ${err.message}`);
            if (callback) callback({ success: false, message: "Internal server error" });
        }
    });

    socket.on("leave_room", (roomId: string) => {
        const roomChannel = `discussion:room:${roomId}`;
        socket.leave(roomChannel);

        const userId = socket.data.userId;
        if (userId && activeUsersPerRoom.has(roomId)) {
            activeUsersPerRoom.get(roomId)!.delete(userId);
            // Broadcast that this user is now inactive
            socket.to(roomChannel).emit("room:member_active_status_change", {
                userId,
                active: false
            });
        }
    });

    // Broadcast active status list to other members currently active in the room
    socket.on("room:update_active_status", ({ roomId, members }: { roomId: string, members: any[] }) => {
        socket.to(`discussion:room:${roomId}`).emit("room:active_status_broadcast", { roomId, members });
    });

    socket.on("disconnect", () => {
        const userId = socket.data.userId;
        if (userId) {
            // Remove from all active rooms
            for (const [roomId, users] of activeUsersPerRoom.entries()) {
                if (users.has(userId)) {
                    users.delete(userId);
                    // Broadcast that this user is now inactive to the room
                    io.to(`discussion:room:${roomId}`).emit("room:member_active_status_change", {
                        userId,
                        active: false
                    });
                }
            }
        }
    });
};

export const sendBlockNotification = (userToBlockId: string, roomId: string) => {
    const io = getIo();
    io.to(`user:${userToBlockId}`).emit("room:blocked", { roomId });
};

export const broadcastUserJoined = (roomId: string, user: any) => {
    const io = getIo();
    io.to(`discussion:room:${roomId}`).emit("room:user_joined", user);
};

export const broadcastUserLeft = (roomId: string, userId: string) => {
    const io = getIo();
    io.to(`discussion:room:${roomId}`).emit("room:user_left", userId);
};

export const broadcastUserBlocked = (roomId: string, user: any) => {
    const io = getIo();
    io.to(`discussion:room:${roomId}`).emit("room:user_blocked", user);
};

export const broadcastUserUnblocked = (roomId: string, user: any) => {
    const io = getIo();
    io.to(`discussion:room:${roomId}`).emit("room:user_unblocked", user);
};
