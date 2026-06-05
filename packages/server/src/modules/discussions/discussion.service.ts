import mongoose from "mongoose";
import { Discussion } from "./discussion.model";
import { Room, AccessType } from "../rooms/room.model";
import { ApiError } from "@/core/errors/ApiError";

const createDiscussion = async (
    userId: string,
    roomId: string,
    content: string
) => {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
        throw new ApiError(400, "Invalid room ID");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Discussion content cannot be empty");
    }

    const room = await Room.findById(roomId);
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    // Check if user is blocked
    const isBlocked = room.blocked_users?.some((id) => id.toString() === userId);
    if (isBlocked) {
        throw new ApiError(403, "You are blocked from this room");
    }

    // Check private room access
    if (room.access_type === AccessType.PRIVATE) {
        const isCreator = room.room_creator.toString() === userId;
        const isMember = room.room_users?.some((id) => id.toString() === userId);
        if (!isCreator && !isMember) {
            throw new ApiError(403, "You do not have access to this private room");
        }
    }

    const discussion = new Discussion({
        user: userId,
        room: roomId,
        content: content.trim()
    });

    await discussion.save();

    const populated = await Discussion.findById(discussion._id).populate({
        path: "user",
        select: "_id name username handle avatar"
    });

    return populated;
};

const getDiscussions = async (
    roomId: string,
    userId?: string,
    limit = 50,
    before?: string
) => {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
        throw new ApiError(400, "Invalid room ID");
    }

    const room = await Room.findById(roomId);
    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const userObjectId = userId ? new mongoose.Types.ObjectId(userId) : null;

    // Check if user is blocked
    if (userId) {
        const isBlocked = room.blocked_users?.some((id) => id.toString() === userId);
        if (isBlocked) {
            throw new ApiError(403, "You are blocked from this room");
        }
    }

    // Check private room access
    if (room.access_type === AccessType.PRIVATE) {
        if (!userId) {
            throw new ApiError(401, "Login required to access this room");
        }
        const isCreator = room.room_creator.toString() === userId;
        const isMember = room.room_users?.some((id) => id.toString() === userId);
        if (!isCreator && !isMember) {
            throw new ApiError(403, "You do not have access to this private room");
        }
    }

    const query: Record<string, any> = {
        room: new mongoose.Types.ObjectId(roomId),
        isDeleted: { $ne: true }
    };

    if (before) {
        if (!mongoose.Types.ObjectId.isValid(before)) {
            throw new ApiError(400, "Invalid cursor ID");
        }
        query._id = { $lt: new mongoose.Types.ObjectId(before) };
    }

    const parsedLimit = Math.min(Math.max(1, limit), 100);

    const discussions = await Discussion.find(query)
        .sort({ createdAt: -1 })
        .limit(parsedLimit)
        .populate({
            path: "user",
            select: "_id name username handle avatar"
        })
        .lean();

    // Return in chronological order (oldest first)
    return discussions.reverse();
};

const updateDiscussion = async (
    userId: string,
    discussionId: string,
    content: string
) => {
    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
        throw new ApiError(400, "Invalid discussion ID");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Discussion content cannot be empty");
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion || discussion.isDeleted) {
        throw new ApiError(404, "Discussion not found");
    }

    if (discussion.user.toString() !== userId) {
        throw new ApiError(403, "You can only edit your own discussions");
    }

    discussion.content = content.trim();
    discussion.isEdited = true;
    await discussion.save();

    const populated = await Discussion.findById(discussion._id).populate({
        path: "user",
        select: "_id name username handle avatar"
    });

    return populated;
};

const deleteDiscussion = async (userId: string, discussionId: string) => {
    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
        throw new ApiError(400, "Invalid discussion ID");
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion || discussion.isDeleted) {
        throw new ApiError(404, "Discussion not found");
    }

    const room = await Room.findById(discussion.room);
    if (!room) {
        throw new ApiError(404, "Associated room not found");
    }

    const isAuthor = discussion.user.toString() === userId;
    const isRoomCreator = room.room_creator.toString() === userId;

    if (!isAuthor && !isRoomCreator) {
        throw new ApiError(403, "You are not authorized to delete this discussion");
    }

    discussion.isDeleted = true;
    discussion.deletedAt = new Date();
    await discussion.save();

    return true;
};

export const discussionService = {
    createDiscussion,
    getDiscussions,
    updateDiscussion,
    deleteDiscussion
};
