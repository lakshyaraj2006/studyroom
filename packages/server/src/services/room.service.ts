import { uploadOnCloudinary } from "../lib/cloudinary.config";
import { Room } from "../models/room.model";
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

export const roomService = {createRoom};