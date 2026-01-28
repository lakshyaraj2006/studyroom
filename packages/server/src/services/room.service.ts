import mongoose from "mongoose";
import { uploadOnCloudinary } from "../lib/cloudinary.config";
import { AccessType, Room } from "../models/room.model";
import { ApiError } from "../utils/ApiError";

const createRoom = async (userId: string, roomData: {
    name: string,
    topics: string[],
    tagline: string,
    imageLocalPath?: string
}) => {
    let uplodedFileUrl: string | undefined;


    const newRoom = new Room({
        room_name: roomData.name,
        room_topics: roomData.topics,
        room_tagline: roomData.tagline,
        room_creator: userId
    })

    if (roomData.imageLocalPath) {
        try {
            const uploadFileResult = await uploadOnCloudinary(roomData.imageLocalPath, 'rooms/' + newRoom._id.toString());

            uplodedFileUrl = uploadFileResult?.url;
            newRoom.room_image = uplodedFileUrl;
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

export const roomService = { createRoom, getRooms, getRoom };