import { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/AsyncHandler";
import { roomService } from "./room.service";
import { ApiResponse } from "@/shared/utils/ApiResponse";
import { ApiError } from "@/core/errors/ApiError";
import { User } from "../user/user.model";
import {
    sendBlockNotification,
    broadcastUserJoined,
    broadcastUserLeft,
    broadcastUserBlocked,
    broadcastUserUnblocked
} from "../discussions/discussion.socket";

const createRoom = asyncHandler(
    async (req: Request, res: Response) => {
        const imageLocalPath = req.file?.path;
        const { name, topics, tagline } = req.body;

        const parsedTopics = JSON.parse(topics);
        const roomData = { name, topics: parsedTopics, tagline, imageLocalPath, access_type: req.body.access_type };

        const result = await roomService.createRoom(req.user as string, roomData);

        return res
            .status(201)
            .json(new ApiResponse(201, result, "Room created successfully"));
    }
)

const getRooms = asyncHandler(
    async (req: Request, res: Response) => {
        const { filter } = req.query;
        const result = await roomService.getRooms(filter as string | undefined, req.user);

        return res
            .status(200)
            .json(new ApiResponse(200, result, "Rooms fetched successfully"));
    }
)

const getRoom = asyncHandler(
    async (req: Request, res: Response) => {

        const { roomId } = req.params;
        const result = await roomService.getRoom(roomId, req.user);

        return res
            .status(200)
            .json(new ApiResponse(200, result, "Room fetched"));
    }
)

const updateRoom = asyncHandler(
    async (req: Request, res: Response) => {
        const imageLocalPath = req.file?.path;
        const { roomId } = req.params;
        const { name, topics, tagline, access_type } = req.body;

        let parsedTopics: string[] | undefined = undefined
        if (topics) parsedTopics = JSON.parse(topics);
        const roomData = { name, topics: parsedTopics, tagline, imageLocalPath, access_type };

        const result = await roomService.updateRoom(req.user as string, roomId, roomData);

        return res
            .status(200)
            .json(new ApiResponse(200, result, "Room updated successfully"));
    }
)

const deleteRoom = asyncHandler(
    async (req: Request, res: Response) => {
        const { roomId } = req.params;

        const result = await roomService.deleteRoom(req.user as string, roomId);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Room deleted successfully"));
    }
)

const sendInvite = asyncHandler(
    async (req: Request, res: Response) => {
        const { roomId } = req.params;

        const frontendUrl = process.env.FRONTEND_URL;

        if (!frontendUrl) throw new Error("Frontend url not specified!");

        const result = await roomService.sendInvite(req.body.email, req.params.roomId, process.env.FRONTEND_URL!);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Room Invite sent to " + result));
    }
)

const acceptInvite = asyncHandler(
    async (req: Request, res: Response) => {
        const { roomId } = req.params;

        const result = await roomService.acceptInvite(req.user as string, req.params.roomId, req.params.token);

        const user = await User.findById(req.user).select("_id name username handle avatar");
        if (user) {
            broadcastUserJoined(roomId, user);
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, "You have joined " + result + " room"));
    }
)

const rejectInvite = asyncHandler(
    async (req: Request, res: Response) => {
        const { roomId } = req.params;

        const result = await roomService.rejectInvite(req.user as string, req.params.roomId, req.params.token);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "You have rejected the invitation!"));
    }
)

const removeUser = asyncHandler(
    async (req: Request, res: Response) => {
        const { roomId } = req.params;
        const { userToRemoveId } = req.body;
        const result = await roomService.removeUser(req.user as string, userToRemoveId, roomId);

        broadcastUserLeft(roomId, userToRemoveId);

        return res
            .status(200)
            .json(new ApiResponse(200, null, result + " was removed from the room!"));
    }
)

const blockUser = asyncHandler(
    async (req: Request, res: Response) => {
        const { userToBlockId, reason } = req.body;
        const { roomId } = req.params;
        const result = await roomService.blockUser(req.user as string, userToBlockId, roomId, reason);

        sendBlockNotification(userToBlockId, roomId);

        const user = await User.findById(userToBlockId).select("_id name username handle avatar");
        if (user) {
            broadcastUserBlocked(roomId, user);
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, result + " was blocked from the room!"));
    }
)

const getBlockedUsers = asyncHandler(
    async (req: Request, res: Response) => {

        if (!req.params.roomId) throw new ApiError(400, "Room Id is required!");

        const result = await roomService.getBlockedUsers(req.user as string, req.params.roomId as string);

        return res
            .status(200)
            .json(new ApiResponse(200, result, "Blocked users fetched successfully!"))
    }
)

const unblockUser = asyncHandler(
    async (req: Request, res: Response) => {
        const { roomId } = req.params;
        const { blockedUserId } = req.body;

        if (!roomId) throw new ApiError(400, "Room Id is required!");
        if (!blockedUserId) throw new ApiError(400, "Blocked User Id is required!");

        const result = await roomService.unblockUser(req.user as string, blockedUserId as string, roomId as string);

        const user = await User.findById(blockedUserId).select("_id name username handle avatar");
        if (user) {
            broadcastUserUnblocked(roomId, user);
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, result + " was unblocked from room!"))
    }
)

const getInvitations = asyncHandler(
    async (req: Request, res: Response) => {

        if (!req.params.roomId) throw new ApiError(400, "Room Id is required!");

        const result = await roomService.getInvitations(req.user as string, req.params.roomId as string);

        return res
            .status(200)
            .json(new ApiResponse(200, result, "Invitations fetched successfully!"))
    }
)

const revokeInvitation = asyncHandler(
    async (req: Request, res: Response) => {

        if (!req.params.roomId) throw new ApiError(400, "Room Id is required!");
        if (!req.body.sent_to_user) throw new ApiError(400, "Sent to user id is required!");

        const { revokedUserName } = await roomService.revokeInvitation(req.user as string, req.body.sent_to_user as string, req.params.roomId as string);

        return res
            .status(200)
            .json(new ApiResponse(200, null, `Invitation revoked for ${revokedUserName || "user"}!`))
    }
)

const joinRoom = asyncHandler(
    async (req: Request, res: Response) => {
        const { roomId } = req.params;

        if (!roomId) throw new ApiError(400, "Room Id is required!");

        const { roomName } = await roomService.joinRoom(req.user as string, roomId as string);

        const user = await User.findById(req.user).select("_id name username handle avatar");
        if (user) {
            broadcastUserJoined(roomId, user);
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, `You joined ${roomName} room!`))
    }
)

const leaveRoom = asyncHandler(
    async (req: Request, res: Response) => {
        const { roomId } = req.params;

        if (!roomId) throw new ApiError(400, "Room Id is required!");

        const { roomName } = await roomService.leaveRoom(req.user as string, roomId as string);

        broadcastUserLeft(roomId, req.user as string);

        return res
            .status(200)
            .json(new ApiResponse(200, null, `You left ${roomName} room!`))
    }
)

const checkMember = asyncHandler(
    async (req: Request, res: Response) => {

        if (!req.params.roomId) throw new ApiError(400, "Room Id is required!");

        const { roomName, isMember } = await roomService.checkMember(req.user as string, req.params.roomId as string);

        return res
            .status(200)
            .json(new ApiResponse(200, { isMember }, `Membership status fetched for ${roomName} room!`))
    }
)

const searchUserByNameOrEmail = asyncHandler(
    async (req: Request, res: Response) => {

        const result = await roomService.searchUserByNameOrEmail(req.params.roomId, req.query.q as string | undefined);

        return res
            .status(200)
            .json(new ApiResponse(200, result, `Users fetched`))
    }
)

export const roomController = { createRoom, getRooms, getRoom, updateRoom, deleteRoom, sendInvite, acceptInvite, rejectInvite, removeUser, blockUser, getBlockedUsers, unblockUser, getInvitations, revokeInvitation, joinRoom, leaveRoom, checkMember, searchUserByNameOrEmail };