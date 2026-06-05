import mongoose, { Schema, Document } from "mongoose";

export interface IDiscussion extends Document {
    user: mongoose.Types.ObjectId;
    room: mongoose.Types.ObjectId;
    content: string;
    isEdited: boolean;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const DiscussionSchema = new Schema<IDiscussion>(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        room: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Room"
        },
        content: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 5000
        },
        isEdited: {
            type: Boolean,
            default: false
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

DiscussionSchema.index({ room: 1, createdAt: 1 });

export const Discussion = mongoose.model<IDiscussion>("Discussion", DiscussionSchema);