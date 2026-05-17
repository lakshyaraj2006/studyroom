import mongoose, {Schema, Document} from "mongoose";

export enum AccessType {
    PUBLIC="public",
    PRIVATE="private"
}

export interface IRoom extends Document {
    room_name: string,
    room_creator: mongoose.Types.ObjectId,
    room_users: mongoose.Types.ObjectId[],
    blocked_users: mongoose.Types.ObjectId[],
    room_topics: string[],
    room_tagline: string,
    access_type: AccessType,
    room_image?: string,
    createdAt: Date,
    updatedAt: Date
}

const RoomSchema = new Schema<IRoom>(
    {
        room_name: { 
            type: String, 
            required: true 
        },

        room_creator: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },

        room_users: { 
            type: [{ type: Schema.Types.ObjectId, ref: "User" }],
        },

        blocked_users: {
            type: [{type: Schema.Types.ObjectId, ref: "User"}]
        },

        room_topics: { 
            type: [String],
        },

        room_tagline: { 
            type: String, 
            default: "" 
        },

        access_type: { 
            type: String, 
            enum: Object.values(AccessType), 
            default: AccessType.PUBLIC
        },

        room_image: { 
            type: String 
        },
    },
    {
        timestamps: true
    }
);

RoomSchema.index({ room_users: 1 });

export const Room = mongoose.model<IRoom>("Room", RoomSchema);
