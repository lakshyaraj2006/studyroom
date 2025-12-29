import express, { Request, Response } from "express";
import "dotenv/config";
import { connectDB } from "./lib/db";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/user.route";

connectDB()
.then(() => {
    const app = express();
    const port = process.env.PORT || 8080;

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    
    app.use("/api/v1/users", userRouter);

    app.listen(port, () => {
        console.log(`StudyRoom server listening on port ${port}`);
    })
})
.catch((error) => {
    console.log(error);
    process.exit(1);
    
})
