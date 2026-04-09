import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI!);
        console.log("Connected to MongoDB !! " + connection.connections[0].host);
    } catch (error: any) {
        throw new Error("Failed to connect to MongoDB !!\nError: " + error.message);
    }
}