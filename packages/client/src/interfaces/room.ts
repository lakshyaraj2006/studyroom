import type { Profile } from "./profile";

export type RoomUser = Pick<
    Profile,
    "_id" | "name" | "username" | "avatar"
>;

export interface Room {
    _id: string;
    room_name: string;
    room_creator: RoomUser;
    room_users: string[];
    room_topics: string[];
    room_tagline: string;
    access_type: "public" | "private";
    room_image: string | undefined;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}