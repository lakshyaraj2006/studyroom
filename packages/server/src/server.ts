import express, { Request, Response } from "express";
import "dotenv/config";
import { connectDB } from "./lib/db";

connectDB()
.then(() => {
    const app = express();
    const port = process.env.PORT || 8080;
    
    app.get("/", (req: Request, res: Response) => {
        res.status(200).json({
            message: "Initialize server!"
        })
    });
    
    app.listen(port, () => {
        console.log(`StudyRoom server listening on port ${port}`);
    })
})
.catch((error) => {
    console.log(error);
    process.exit(1);
    
})
