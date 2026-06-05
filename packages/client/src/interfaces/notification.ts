export const NotificationType = {
    ROOM_INVITE: "ROOM_INVITE",
    ROOM_INVITE_ACCEPTED: "ROOM_INVITE_ACCEPTED",
    ROOM_INVITE_REJECTED: "ROOM_INVITE_REJECTED",
    USER_JOINED_ROOM: "USER_JOINED_ROOM",
    USER_BLOCKED: "USER_BLOCKED",
    USER_UNBLOCKED: "USER_UNBLOCKED",
    NEW_DISCUSSION: "NEW_DISCUSSION"
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];


export interface INotification {
    _id: string;
    recipient: string;
    sender?: {
        _id: string;
        name: string;
        username: string;
        handle?: string;
        avatar?: string;
    };
    type: NotificationType;
    title: string;
    message: string;
    room_id?: {
        _id: string;
        room_name: string;
        room_image?: string;
    };
    metadata?: Record<string, any>;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}
