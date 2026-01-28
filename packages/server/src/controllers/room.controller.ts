import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { roomService } from "../services/room.service";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

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

const getRooms = asyncHandler(
    async (req: Request, res: Response) => {
        const result = await roomService.getRooms();

        return res
            .status(200)
            .json(new ApiResponse(200, result, "Room created successfully"));
    }
)

const getRoom = asyncHandler(
    async (req: Request, res: Response) => {
        
        const {roomId} = req.params;
        const result = await roomService.getRoom(roomId, req.user);

        return res
            .status(200)
            .json(new ApiResponse(200, result, "Room fetched"));
    }
)

export const roomController = { createRoom, getRooms, getRoom };