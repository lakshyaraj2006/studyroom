import mongoose, { Schema, Document } from "mongoose";

export interface IRoomInvite extends Document {
    room_id: mongoose.Types.ObjectId,
    room_invite_token: string,
    room_invite_token_expiry: Date,
    createdAt: Date,
    updatedAt: Date
}

const RoomInviteSchema = new Schema<IRoomInvite>({
    room_id: {
        type: mongoose.Types.ObjectId,
        ref: "Room",
        required: true,
    },
    room_invite_token: {
        type: String,
        required: true
    },
    room_invite_token_expiry: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    }
}, { timestamps: true });

RoomInviteSchema.index({ room_id: 1 }, { unique: true });
RoomInviteSchema.index({ room_invite_token: 1 });

export const RoomInvite = mongoose.model<IRoomInvite>('RoomInvite', RoomInviteSchema);