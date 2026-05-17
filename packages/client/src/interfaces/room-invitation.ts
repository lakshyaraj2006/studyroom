import type { Profile } from "./profile";

export interface RoomInvitation {
    _id: string;
    sent_to_user: Pick<Profile, "_id" | "name" | "email" | "avatar">,
    createdAt: string;
    updatedAt: string;
    __v: number
}