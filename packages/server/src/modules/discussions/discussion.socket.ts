import { getIo } from "@/core/socket";

export const broadcastDiscussionCreated = (roomId: string, discussion: any) => {
    const io = getIo();
    io.to(`discussion:room:${roomId}`).emit("discussion:created", discussion);
};

export const broadcastDiscussionUpdated = (roomId: string, discussion: any) => {
    const io = getIo();
    io.to(`discussion:room:${roomId}`).emit("discussion:updated", discussion);
};

export const broadcastDiscussionDeleted = (roomId: string, discussionId: string) => {
    const io = getIo();
    io.to(`discussion:room:${roomId}`).emit("discussion:deleted", discussionId);
};
