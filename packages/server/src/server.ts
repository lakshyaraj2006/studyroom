import express from "express";
import "dotenv/config";
import { connectDB } from "@/core/db";
import cookieParser from "cookie-parser";
import { userRouter } from "@/modules/user/user.route";
import cors from "cors";
import { profileRouter } from "@/modules/profile/profile.route";
import { errorHandler } from "@/core/middlewares";
import { roomRouter } from "@/modules/rooms/room.route";

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
    
    app.use(errorHandler);

    app.listen(port, () => {
        console.log(`StudyRoom server listening on port ${port}`);
    })
})
.catch((error) => {
    console.log(error);
    process.exit(1);
    
})
