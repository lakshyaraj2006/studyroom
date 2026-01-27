import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { roomService } from "../services/room.service";
import { ApiResponse } from "../utils/ApiResponse";

const createRoom = asyncHandler(
    async (req: Request, res: Response) => {
        const data = await roomService.createRoom();

        return res
            .status(201)
            .json(new ApiResponse(201, null, data.message));
    }
)

export const roomController = { createRoom };