import { deleteCloudinaryFolder, uploadOnCloudinary } from "../lib/cloudinary.config";
import { AccessType, Room } from "../models/room.model";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import crypto from "node:crypto";
import { RoomInvite } from "../models/room-invite.model";
import { sendRoomInviteEmail } from "../lib/emails/sendRoomInvite";

const createRoom = async (userId: string, roomData: {
    name: string,
    topics: string[],
    tagline: string,
    imageLocalPath?: string
}) => {
    let uploadedFileUrl: string | undefined;


    const newRoom = new Room({
        room_name: roomData.name,
        room_topics: roomData.topics,
        room_tagline: roomData.tagline,
        room_creator: userId
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

const getRooms = async () => {
    const rooms = await Room.find({ access_type: AccessType.PUBLIC }).lean();

    return rooms;
}

const getRoom = async (roomId: string, userId?: string | undefined) => {
    const room = await Room.findById(roomId).lean();

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    if (room.access_type === AccessType.PRIVATE) {
        if (!userId) {
            throw new ApiError(401, "Login required to access this room");
        }

        const isMember = room.room_users.some(
            (id) => id.toString() === userId
        );

        if (!isMember) {
            throw new ApiError(401, "Access denied to private room!");
        }
    }

    return room;
}

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
                ...rest,
                room_topics,
                room_image: uploadedFileUrl ? uploadedFileUrl : room.room_image
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

    await Promise.all([
        User.updateMany(
            { joined_rooms: room._id },
            { $pull: { joined_rooms: room._id } }
        ),
        deleteCloudinaryFolder('StudyRoom/rooms/' + roomId),
        Room.findByIdAndDelete(roomId)
    ]);

    return true;
};

const sendInvite = async (toEmail: string, roomId: string, baseUrl: string) => {
    const room = await Room.findById(roomId);
    if (!room) {
        throw new ApiError(404, "Room not found!");
    }

    const user = await User.findOne({email: toEmail});

    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    const invite_token = crypto.randomBytes(64).toString("base64url");
    const invite_token_expiry = new Date(Date.now() + 1*60*60*1000);

    // TODO: Generate url based on frotend host
    const generatedUrl = baseUrl + '/api/v1/rooms/join-room/' + room._id.toString() + '/' + invite_token;

    await Promise.all([
        RoomInvite.create({
            room_invite_token: invite_token,
            room_invite_token_expiry: invite_token_expiry,
            room_id: room._id,
            sent_to_user: user._id
        }),
        sendRoomInviteEmail(user.username, toEmail, room.room_name, generatedUrl)
    ]);

    return user.name;
}

export const roomService = { createRoom, getRooms, getRoom, updateRoom, deleteRoom, sendInvite };