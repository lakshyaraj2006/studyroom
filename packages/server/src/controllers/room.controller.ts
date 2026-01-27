import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { roomService } from "../services/room.service";
import { ApiResponse } from "../utils/ApiResponse";

const createRoom = asyncHandler(
    async (req: Request, res: Response) => {
        const imageLocalPath = req.file?.path;
        const {name, topics, tagline} = req.body;

        const parsedTopics = JSON.parse(topics);
        const roomData = {name, topics: parsedTopics, tagline, imageLocalPath};

        const result = await roomService.createRoom(req.user as string, roomData);

        return res
            .status(201)
            .json(new ApiResponse(201, result, "Room created successfully"));
    }
)

export const roomController = { createRoom };