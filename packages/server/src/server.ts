import express from "express";
import "dotenv/config";
import { connectDB } from "@/core/db";
import cookieParser from "cookie-parser";
import { userRouter } from "@/modules/user/user.route";
import cors from "cors";
import { profileRouter } from "@/modules/profile/profile.route";
import { errorHandler } from "@/core/middlewares";
import { roomRouter } from "@/modules/rooms/room.route";
import { discussionRouter } from "@/modules/discussions/discussion.route";
import { initSocket } from "@/modules/discussions/discussion.socket";

import dns from "node:dns/promises";
dns.setServers(['1.1.1.1', '8.8.8.8']);

connectDB()
.then(() => {
    const app = express();
    const port = process.env.PORT || 8080;

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    
    app.use(cors({
        credentials: true,
        origin: process.env.FRONTEND_URL
    }))
    
    app.use("/api/v1/users", userRouter);
    app.use("/api/v1/profile", profileRouter);
    app.use("/api/v1/rooms", roomRouter);
    app.use("/api/v1/discussions", discussionRouter);
    
    app.use(errorHandler);

    const server = app.listen(port, () => {
        console.log(`StudyRoom server listening on port ${port}`);
    });

    initSocket(server);
})
.catch((error) => {
    console.log(error);
    process.exit(1);
    
})
