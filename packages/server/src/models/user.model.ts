import mongoose, { Schema, Document } from "mongoose";
import { nanoid } from "nanoid";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
    name: string;
    username: string;
    email: string;
    handle: string;
    avatar?: string;
    bio?: string;
    followers: Schema.Types.ObjectId[];
    following: Schema.Types.ObjectId[];
    joined_rooms: Schema.Types.ObjectId[];
    banned: boolean;
    warnings: number;
    verified: boolean;
    verifyCode?: string;
    verifyCodeExpiry?: Date;
    password?: string;
    last_login?: Date;
    last_active?: Date;
    createdAt: Date;
    updatedAt: Date;

    verifyPassword(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    handle: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    avatar: {
        type: String
    },
    bio: {
        type: String,
        maxlength: 160
    },
    
    followers: [
        { type: Schema.Types.ObjectId, ref: "User" }
    ],
    following: [
        { type: Schema.Types.ObjectId, ref: "User" }
    ],
    joined_rooms: [
        { type: Schema.Types.ObjectId, ref: "Room" }
    ],
    banned: {
        type: Boolean,
        default: false
    },
    warnings: {
        type: Number,
        default: 0
    },
    verified: {
        type: Boolean,
        default: false
    },
    verifyCode: {
        type: String
    },
    verifyCodeExpiry: {
        type: Date
    },
    password: {
        type: String,
        select: false
    },
    last_login: {
        type: Date
    },
    last_active: {
        type: Date
    }
}, { timestamps: true });

UserSchema.pre<IUser>("save", async function () {
    if (this.isModified("password") && this.password) {
        this.password = await argon2.hash(this.password);
    }

    if (!this.handle && this.username) {
        const base = this.username.toLowerCase();
        let unique = false;

        while (!unique) {
            const suffix = nanoid(6);
            const candidate = `${base}_${suffix}`;

            const exists = await mongoose.models.User.exists({ handle: candidate });
            if (!exists) {
                this.handle = candidate;
                unique = true;
            }
        }
    }
});

UserSchema.methods.verifyPassword = async function (password: string) {
    if (!this.password) return false;
    return argon2.verify(this.password, password);
};

UserSchema.methods.generateAccessToken = function () {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new Error("ACCESS_TOKEN_SECRET is not set in .env");
    
    return jwt.sign(
        { id: this._id, handle: this.handle },
        secret,
        { expiresIn: "15m" }
    );
};

UserSchema.methods.generateRefreshToken = function () {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) throw new Error("REFRESH_TOKEN_SECRET is not set in .env");
    
    return jwt.sign(
        { id: this._id },
        secret,
        { expiresIn: "30d" }
    );
};

export const User = mongoose.model<IUser>("User", UserSchema);
