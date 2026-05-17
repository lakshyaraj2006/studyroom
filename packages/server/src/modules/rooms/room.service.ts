import { deleteCloudinaryFolder, uploadOnCloudinary } from "@/core/config/cloudinary";
import { AccessType, Room } from "./room.model";
import { ApiError } from "@/core/errors/ApiError";
import { User } from "../user/user.model";
import crypto from "node:crypto";
import { RoomInvite } from "./room-invite.model";
import { sendRoomInviteEmail } from "@/jobs/emails/sendRoomInvite";
import mongoose from "mongoose";
import { sendRoomBlockedEmail } from "@/jobs/emails/sendRoomBlockedEmail";
import { escapeRegex } from "@/shared/lib/escapeRegex";

const createRoom = async (userId: string, roomData: {
    name: string,
    topics: string[],
    tagline: string,
    imageLocalPath?: string,
    access_type?: AccessType.PUBLIC | AccessType.PRIVATE
}) => {
    let uploadedFileUrl: string | undefined;


    const newRoom = new Room({
        room_name: roomData.name,
        room_topics: roomData.topics,
        room_tagline: roomData.tagline,
        room_creator: userId,
        access_type: roomData.access_type
    })

    if (roomData.imageLocalPath) {
        try {
            const uploadFileResult = await uploadOnCloudinary(roomData.imageLocalPath, 'rooms/' + newRoom._id.toString());

            uploadedFileUrl = uploadFileResult?.url;
            newRoom.room_image = uploadedFileUrl;
        } catch (error) {
            throw new ApiError(500, "Image upload failed!");
        }
    }

    await newRoom.save();

    return newRoom;
};

const getRooms = async (filter?: string, userId?: string) => {
    const matchStage: Record<string, any> = {}

    switch (filter) {
        case "created":
            if (!userId) {
                throw new ApiError(401, "Please login to continue!");
                break;
            }
            matchStage.room_creator = new mongoose.Types.ObjectId(userId);
            break;
            
        case "joined":
            if (!userId) throw new ApiError(401, "Please login to continue!");
            matchStage.room_users = {
                $in: [new mongoose.Types.ObjectId(userId)]
            };
            break;

        default:
            matchStage.access_type = AccessType.PUBLIC;
    }

    const pipeline: mongoose.PipelineStage[] = [
        {
            $match: matchStage
        },

        {
            $lookup: {
                from: "users",
                localField: "room_creator",
                foreignField: "_id",
                as: "room_creator",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$room_creator",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "room_users",
                foreignField: "_id",
                as: "room_users",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            username: 1,
                            handle: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                blocked_users: 0
            }
        }
    ];

    return await Room.aggregate(pipeline);
};

const getRoom = async (roomId: string, userId?: string) => {
    const roomObjectId = new mongoose.Types.ObjectId(roomId);

    const pipeline: mongoose.PipelineStage[] = [
        {
            $match: { _id: roomObjectId }
        },

        {
            $lookup: {
                from: "users",
                localField: "room_creator",
                foreignField: "_id",
                as: "room_creator",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            username: 1,
                            avatar: 1,
                            email: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$room_creator",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "room_users",
                foreignField: "_id",
                as: "room_users",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            username: 1,
                            handle: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "blocked_users",
                foreignField: "_id",
                as: "blocked_users",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            username: 1,
                            handle: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        }
    ];

    const result = await Room.aggregate(pipeline);
    const room = result[0];

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const userObjectId = userId
        ? new mongoose.Types.ObjectId(userId)
        : null;

    if (room.access_type === AccessType.PRIVATE) {
        if (!userId) {
            throw new ApiError(401, "Login required to access this room");
        }

        const isBlocked = room.blocked_users?.some((id: any) =>
            id.equals(userObjectId)
        );

        if (isBlocked) {
            throw new ApiError(403, "You are blocked from this room!");
        }

        const isOwner = room.room_creator._id.toString() === userId;

        const isMember = room.room_users.some((id: any) =>
            id.equals(userObjectId)
        );

        if (!isOwner && !isMember) {
            throw new ApiError(401, "Access denied to private room!");
        }

        return room;
    }

    return room;
};

const updateRoom = async (userId: string, roomId: string, roomData: {
    name?: string,
    topics?: string[],
    tagline?: string,
    imageLocalPath?: string,
    access_type?: AccessType.PRIVATE | AccessType.PUBLIC
}) => {
    const room = await Room.findById(roomId).lean();

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    if (room.room_creator.toString() != userId) {
        throw new ApiError(401, "You cannot modify this room")
    }

    let uploadedFileUrl: string | undefined;

    if (roomData.imageLocalPath) {
        try {
            const uploadFileResult = await uploadOnCloudinary(roomData.imageLocalPath, 'rooms/' + room._id.toString());

            uploadedFileUrl = uploadFileResult?.url;
        } catch (error) {
            throw new ApiError(500, "Image upload failed!");
        }
    }

    const { topics, imageLocalPath, ...rest } = roomData;

    const room_topics = topics ? Array.from(new Set(topics)) : room.room_topics;

    const updatedRoom = await Room.findByIdAndUpdate(
        roomId,
        {
            $set: {
                room_name: roomData.name ?? room.room_name,
                room_tagline: roomData.tagline ?? room.room_tagline,
                room_topics,
                access_type: roomData.access_type ?? room.access_type,
                room_image: uploadedFileUrl ?? room.room_image
            }
        },
        {
            new: true
        }
    );

    return updatedRoom;
};

const deleteRoom = async (userId: string, roomId: string) => {
    const room = await Room.findById(roomId).lean();

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    if (room.room_creator.toString() != userId) {
        throw new ApiError(401, "You cannot modify this room")
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await User.updateMany(
            { joined_rooms: room._id },
            { $pull: { joined_rooms: room._id } },
            { session }
        );
        await Room.findByIdAndDelete(roomId, { session });

        await session.commitTransaction();

        await deleteCloudinaryFolder('StudyRoom/rooms/' + roomId);
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }

    return true;
};

const sendInvite = async (toEmail: string, roomId: string, baseUrl: string) => {
    const room = await Room.findById(roomId);
    if (!room) {
        throw new ApiError(404, "Room not found!");
    }

    const user = await User.findOne({ email: toEmail }).select("_id name username email");

    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    const isBlocked = room.blocked_users?.some(id => id.equals(user._id));
    if (isBlocked) {
        throw new ApiError(403, "The user has been blocked from room!");
    }

    const alreadyMember = room.room_users.some(id => id.equals(user._id));
    if (alreadyMember) {
        throw new ApiError(400, "User has already joined the room!");
    }

    if (room.room_creator.toString() === user._id.toString()) {
        throw new ApiError(401, "You cannot invite yourself!");
    }

    const invite_token = crypto.randomBytes(64).toString("base64url");
    const invite_token_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // TODO: Generate url based on frotend host
    const generatedAcceptUrl = baseUrl + '/rooms/accept-invite/' + room._id.toString() + '/' + invite_token;
    const generatedRejectUrl = baseUrl + '/rooms/reject-invite/' + room._id.toString() + '/' + invite_token;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await RoomInvite.create(
            [
                {
                    room_invite_token: invite_token,
                    room_invite_token_expiry: invite_token_expiry,
                    room_id: room._id,
                    sent_to_user: user._id
                }
            ],
            { session }
        );

        await session.commitTransaction();
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }

    try {
        await sendRoomInviteEmail(user.username, toEmail, room.room_name, generatedAcceptUrl, generatedRejectUrl);
    } catch (err) {
        throw err;
    }

    return user.name;
}

const acceptInvite = async (userId: string, roomId: string, token: string) => {

    const room = await Room.findById(roomId);
    if (!room) {
        throw new ApiError(404, "Room not found!");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    const roomInvitation = await RoomInvite.findOne({ room_id: roomId, room_invite_token: token });
    if (!roomInvitation) {
        throw new ApiError(404, "Room invitation not found!")
    }

    if (roomInvitation.room_invite_token_expiry && roomInvitation.room_invite_token_expiry < new Date()) {
        throw new ApiError(410, "Invitation expired!");
    }

    if (roomInvitation.sent_to_user.toString() !== userId) {
        throw new ApiError(401, "Unauthorized access to invitation!");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await roomInvitation.deleteOne({ session });

        await room.updateOne({
            $addToSet: {
                room_users: userId
            }
        }, { session });

        await user.updateOne({
            $addToSet: {
                joined_rooms: room._id
            }
        }, { session })

        await session.commitTransaction();
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }

    return room.room_name;
}

const rejectInvite = async (userId: string, roomId: string, token: string) => {

    const room = await Room.findById(roomId);
    if (!room) {
        throw new ApiError(404, "Room not found!");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    const roomInvitation = await RoomInvite.findOne({ room_id: roomId, room_invite_token: token });
    if (!roomInvitation) {
        throw new ApiError(404, "Room invitation not found!")
    }

    if (roomInvitation.room_invite_token_expiry && roomInvitation.room_invite_token_expiry < new Date()) {
        throw new ApiError(410, "Invitation expired!");
    }

    if (roomInvitation.sent_to_user.toString() !== userId) {
        throw new ApiError(401, "Unauthorized access to invitation!");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await roomInvitation.deleteOne({ session });

        await session.commitTransaction();
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }

    return room.room_name;
}

const removeUser = async (userId: string, userToRemoveId: string, roomId: string) => {
    const room = await Room.findById(roomId);
    if (!room) {
        throw new ApiError(404, "Room not found!");
    }

    if (room.room_creator.toString() !== userId) {
        throw new ApiError(401, "You are not authorized to perform this action!");
    }

    const userToRemove = await User.findById(userToRemoveId);

    if (!userToRemove) {
        throw new ApiError(404, "User not found!");
    }

    const userToRemoveObjectId = new mongoose.Types.ObjectId(userToRemoveId);
    const isMember = room.room_users.some(id => id.equals(userToRemoveObjectId));

    if (!isMember) {
        throw new ApiError(400, userToRemove.name + " has not joined the room!");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await room.updateOne({
            $pull: {
                room_users: userToRemoveId
            }
        }, { session });

        await userToRemove.updateOne({
            $pull: {
                joined_rooms: roomId
            }
        }, { session });

        await session.commitTransaction();
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }

    return userToRemove.name;
}

const blockUser = async (userId: string, userToBlockId: string, roomId: string, reason: string) => {
    if (!reason) throw new ApiError(400, "Please provide a reason!");
    if (reason.split(/\s+/).length < 10) throw new ApiError(400, "Reason must contain atleast 10 words!");

    const room = await Room.findById(roomId);

    if (!room) throw new ApiError(404, "Room not found!");

    if (room.room_creator.toString() !== userId) throw new ApiError(401, "Unauthorized action!");

    const userToBlock = await User.findById(userToBlockId);
    if (!userToBlock) throw new ApiError(404, "User not found!");

    const alreadyBlocked = room.blocked_users?.some(id => id.equals(userToBlock._id));
    if (alreadyBlocked) {
        throw new ApiError(400, "User is already blocked!");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await room.updateOne({
            $addToSet: { blocked_users: userToBlock._id },
            $pull: { room_users: userToBlock._id }
        }, { session });

        await userToBlock.updateOne({
            $pull: { joined_rooms: room._id }
        }, { session });


        await session.commitTransaction();

    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }

    try {
        await sendRoomBlockedEmail(
            userToBlock.username,
            userToBlock.email,
            room.room_name,
            reason
        );
    } catch (err) {
        throw err;
    }

    return userToBlock.name;
}

const getBlockedUsers = async (userId: string, roomId: string) => {
    if (!mongoose.isValidObjectId(roomId)) throw new ApiError(400, "Invalid room id!");

    const ownerObjectId = new mongoose.Types.ObjectId(userId);
    const roomObjectId = new mongoose.Types.ObjectId(roomId);

    const pipeline: mongoose.PipelineStage[] = [
        {
            $match: {
                _id: roomObjectId,
                room_creator: ownerObjectId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "blocked_users",
                foreignField: "_id",
                as: "blocked_users"
            }
        },
        {
            $project: {
                blocked_users: {
                    $map: {
                        input: "$blocked_users",
                        as: "user",
                        in: {
                            _id: "$$user._id",
                            name: "$$user.name",
                            username: "$$user.username",
                            avatar: "$$user.avatar"
                        }
                    }
                }
            }
        }
    ];

    const result = await Room.aggregate(pipeline);

    if (!result.length) throw new ApiError(401, "Unauthorized action!");

    return result;
}

const unblockUser = async (userId: string, blockedUserId: string, roomId: string) => {
    if (!mongoose.isValidObjectId(blockedUserId) ||
        !mongoose.isValidObjectId(roomId)
    ) {
        throw new ApiError(400, "Invalid blocked user id or room id!")
    }

    const room = await Room.findById(roomId);

    if (!room) throw new ApiError(404, "Room not found!");

    if (room.room_creator.toString() !== userId) throw new ApiError(401, "Unauthorized action!");

    const userToUnblock = await User.findById(blockedUserId);
    if (!userToUnblock) throw new ApiError(404, "User not found!");

    const isBlocked = room.blocked_users?.some(id => id.equals(userToUnblock._id));

    if (!isBlocked) {
        throw new ApiError(400, "User not blocked!");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await room.updateOne({
            $addToSet: {
                room_users: userToUnblock._id
            },
            $pull: {
                blocked_users: userToUnblock._id
            }
        }, { session });

        await userToUnblock.updateOne({
            $addToSet: {
                joined_rooms: room._id
            }
        }, { session });

        await session.commitTransaction();
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }

    return userToUnblock.name;
}

const getInvitations = async (userId: string, roomId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(roomId)) {
        throw new ApiError(400, "Invalid user id or room id!");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const roomObjectId = new mongoose.Types.ObjectId(roomId);

    const room = await Room.findOne({
        _id: roomObjectId,
        room_creator: userObjectId
    });

    if (!room) throw new ApiError(404, "Room not found or Unauthorized action!");

    const pipeline: mongoose.PipelineStage[] = [
        {
            $match: {
                "room_id": roomObjectId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "sent_to_user",
                foreignField: "_id",
                as: "sent_to_user"
            }
        },
        {
            $unwind: "$sent_to_user"
        },
        {
            $project: {
                _id: 1,
                sent_to_user: {
                    _id: "$sent_to_user._id",
                    name: "$sent_to_user.name",
                    email: "$sent_to_user.email",
                    avatar: "$sent_to_user.avatar"
                },
                __v: 1,
                createdAt: 1,
                updatedAt: 1
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ];

    const invitations = await RoomInvite.aggregate(pipeline);
    return invitations;
}

const revokeInvitation = async (
    userId: string,
    sent_to_user: string,
    room_id: string
) => {
    if (
        !mongoose.isValidObjectId(sent_to_user) ||
        !mongoose.isValidObjectId(room_id)
    ) {
        throw new ApiError(400, "Invalid user id or room id");
    }

    const ownerObjectId = new mongoose.Types.ObjectId(userId);
    const sentToUserObjectId = new mongoose.Types.ObjectId(sent_to_user);
    const roomObjectId = new mongoose.Types.ObjectId(room_id);

    const roomExists = await Room.exists({
        _id: roomObjectId,
        room_creator: ownerObjectId
    });

    if (!roomExists) {
        throw new ApiError(404, "Room not found or Unauthorized!");
    }

    // Fetch invitation + user details
    const invitation = await RoomInvite.findOne({
        sent_to_user: sentToUserObjectId,
        room_id: roomObjectId
    }).populate("sent_to_user", "name"); // adjust field if different

    if (!invitation) {
        throw new ApiError(404, "Invitation not found!");
    }

    const user = await User.findById(sentToUserObjectId).select("name");
    const revokedUserName = user?.name;

    await invitation.deleteOne();

    return { revokedUserName };

};

const joinRoom = async (userId: string, room_id: string) => {
    if (!mongoose.isValidObjectId(room_id)) throw new ApiError(400, "Invalid room object id!");

    const room = await Room.findById(room_id);
    const user = await User.findById(userId);

    if (!room) throw new ApiError(404, "Room not found!");
    if (!user) throw new ApiError(404, "User not found!");

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isMember = room.room_users.some(id => id.equals(userObjectId));

    if (room.access_type === AccessType.PRIVATE) {
        if (room.access_type === AccessType.PRIVATE) {
            throw new ApiError(
                isMember ? 400 : 401,
                isMember
                    ? "You are already a member of this room!"
                    : "You are not authorized to access this room!"
            );
        }
    }

    if (isMember) {
        throw new ApiError(400, "You are already a member of this room!");
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await room.updateOne({
            $addToSet: {
                room_users: userId
            }
        }, { session });

        await user.updateOne({
            $addToSet: {
                joined_rooms: room_id
            }
        }, { session })

        await session.commitTransaction();
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }

    return { roomName: room.room_name };
}

const leaveRoom = async (userId: string, room_id: string) => {
    if (!mongoose.isValidObjectId(room_id)) throw new ApiError(400, "Invalid room object id!");

    const room = await Room.findById(room_id);
    const user = await User.findById(userId);

    if (!room) throw new ApiError(404, "Room not found!");
    if (!user) throw new ApiError(404, "User not found!");

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isMember = room.room_users.some(id => id.equals(userObjectId));

    if (!isMember) {
        throw new ApiError(400, "You are not a member of this room!");
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await room.updateOne({
            $pull: {
                room_users: userId
            }
        }, { session });

        await user.updateOne({
            $pull: {
                joined_rooms: room_id
            }
        }, { session })

        await session.commitTransaction();
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }

    return { roomName: room.room_name };
}

const checkMember = async (userId: string, room_id: string) => {
    if (!mongoose.isValidObjectId(room_id)) throw new ApiError(400, "Invalid room object id!");

    const room = await Room.findById(room_id);
    const user = await User.findById(userId);

    if (!room) throw new ApiError(404, "Room not found!");
    if (!user) throw new ApiError(404, "User not found!");

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isMember = room.room_users.some(id => id.equals(userObjectId)) || room.room_creator.toString() === userId;

    return { roomName: room.room_name, isMember };
}

const searchUserByNameOrEmail = async (
    roomId: string,
    query?: string
) => {
    if (!mongoose.isValidObjectId(roomId)) {
        throw new ApiError(400, "Invalid room id!");
    }

    if (!query?.trim()) {
        throw new ApiError(400, "Please enter name or email");
    }

    const room = await Room.findById(roomId).select("room_users");

    if (!room) {
        throw new ApiError(404, "Room not found!");
    }

    // Get already invited users
    const invites = await RoomInvite.find({ room_id: roomId })
        .select("sent_to_user");

    const excludedUserIds = [
        ...room.room_users.map((id: any) => id.toString()),
        ...invites.map((invite) => invite.sent_to_user.toString())
    ];

    const safeQuery = escapeRegex(query.trim());

    const users = await User.find({
        _id: { $nin: excludedUserIds },
        is_deleted: false,
        $or: [
            {
                name: {
                    $regex: `^${safeQuery}`,
                    $options: "i",
                },
            },
            {
                email: {
                    $regex: `^${safeQuery}`,
                    $options: "i",
                },
            },
        ],
    }).select("_id name email avatar");

    return users;
};

export const roomService = { createRoom, getRooms, getRoom, updateRoom, deleteRoom, sendInvite, acceptInvite, rejectInvite, removeUser, blockUser, unblockUser, getBlockedUsers, getInvitations, revokeInvitation, joinRoom, leaveRoom, checkMember, searchUserByNameOrEmail };