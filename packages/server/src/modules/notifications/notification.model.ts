import mongoose, { Schema, Document } from "mongoose";

export enum NotificationType {
    ROOM_INVITE = "ROOM_INVITE",
    ROOM_INVITE_ACCEPTED = "ROOM_INVITE_ACCEPTED",
    ROOM_INVITE_REJECTED = "ROOM_INVITE_REJECTED",
    USER_JOINED_ROOM = "USER_JOINED_ROOM",
    USER_BLOCKED = "USER_BLOCKED",
    USER_UNBLOCKED = "USER_UNBLOCKED",
    NEW_DISCUSSION = "NEW_DISCUSSION"
}

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    sender?: mongoose.Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    room_id?: mongoose.Types.ObjectId;
    metadata?: Record<string, any>;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    type: {
        type: String,
        enum: Object.values(NotificationType),
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    room_id: {
        type: Schema.Types.ObjectId,
        ref: "Room"
    },
    metadata: {
        type: Schema.Types.Mixed
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    }
}, { timestamps: true });

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
