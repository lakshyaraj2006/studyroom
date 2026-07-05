import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { handleRoomSocket } from "@/modules/rooms/room.socket";

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
                // Connection allowed as guest
            }
        }
        next();
    });

    io.on("connection", (socket) => {
        const userId = socket.data.userId;
        if (userId) {
            socket.join(`user:${userId}`);
        }

        // Delegate room specific socket listeners
        handleRoomSocket(socket, io!);
    });

    return io;
};

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized!");
    }
    return io;
};
