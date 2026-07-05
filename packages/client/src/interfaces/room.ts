import type { Profile } from "./profile";

export type RoomUser = Pick<
    Profile,
    "_id" | "name" | "username" | "handle" | "avatar"
> & { active?: boolean };

export interface Room {
    _id: string;
    room_name: string;
    room_creator: { email: string } & RoomUser;
    room_users: RoomUser[];
    blocked_users?: RoomUser[];
    room_topics: string[];
    room_tagline: string;
    access_type: "public" | "private";
    room_image: string | undefined;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}