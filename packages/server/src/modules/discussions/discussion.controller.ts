import { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/AsyncHandler";
import { ApiResponse } from "@/shared/utils/ApiResponse";
import { ApiError } from "@/core/errors/ApiError";
import { discussionService } from "./discussion.service";
import {
    broadcastDiscussionCreated,
    broadcastDiscussionUpdated,
    broadcastDiscussionDeleted
} from "./discussion.socket";

const createDiscussion = asyncHandler(async (req: Request, res: Response) => {
    const { roomId, content } = req.body;
    const userId = req.user as string;

    if (!roomId) {
        throw new ApiError(400, "Room ID is required");
    }

    const result = await discussionService.createDiscussion(userId, roomId, content);

    if (result) {
        broadcastDiscussionCreated(roomId, result);
    }

    return res
        .status(201)
        .json(new ApiResponse(201, result, "Discussion posted successfully"));
});

const getDiscussions = asyncHandler(async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { limit, before } = req.query;
    const userId = req.user as string | undefined;

    const parsedLimit = limit ? parseInt(limit as string, 10) : undefined;

    const result = await discussionService.getDiscussions(
        roomId,
        userId,
        parsedLimit,
        before as string | undefined
    );

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Discussions fetched successfully"));
});

const updateDiscussion = asyncHandler(async (req: Request, res: Response) => {
    const { discussionId } = req.params;
    const { content } = req.body;
    const userId = req.user as string;

    const result = await discussionService.updateDiscussion(userId, discussionId, content);

    if (result) {
        broadcastDiscussionUpdated(result.room.toString(), result);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Discussion updated successfully"));
});

const deleteDiscussion = asyncHandler(async (req: Request, res: Response) => {
    const { discussionId } = req.params;
    const userId = req.user as string;

    const roomId = await discussionService.deleteDiscussion(userId, discussionId);

    if (roomId) {
        broadcastDiscussionDeleted(roomId, discussionId);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Discussion deleted successfully"));
});

export const discussionController = {
    createDiscussion,
    getDiscussions,
    updateDiscussion,
    deleteDiscussion
};
