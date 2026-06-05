import mongoose from "mongoose";
import { Notification, NotificationType } from "./notification.model";
import { getIo } from "../discussions/discussion.socket";
import { ApiError } from "@/core/errors/ApiError";

const createNotification = async (data: {
    recipient: string;
    sender?: string;
    type: NotificationType;
    title: string;
    message: string;
    room_id?: string;
    metadata?: Record<string, any>;
}) => {
    if (!mongoose.Types.ObjectId.isValid(data.recipient)) {
        throw new ApiError(400, "Invalid recipient ID");
    }
    if (data.sender && !mongoose.Types.ObjectId.isValid(data.sender)) {
        throw new ApiError(400, "Invalid sender ID");
    }
    if (data.room_id && !mongoose.Types.ObjectId.isValid(data.room_id)) {
        throw new ApiError(400, "Invalid room ID");
    }

    const notification = new Notification({
        recipient: data.recipient,
        sender: data.sender,
        type: data.type,
        title: data.title,
        message: data.message,
        room_id: data.room_id,
        metadata: data.metadata
    });

    await notification.save();

    // Populate sender and room details for real-time delivery
    const populated = await Notification.findById(notification._id)
        .populate({
            path: "sender",
            select: "_id name username handle avatar"
        })
        .populate({
            path: "room_id",
            select: "_id room_name room_image"
        });

    try {
        const io = getIo();
        io.to(`user:${data.recipient}`).emit("notification:new", populated);
    } catch (error) {
        console.error("Socket.io emit failed (user might be offline or socket not initialized):", error);
    }

    return populated;
};

const getNotifications = async (userId: string, limit = 20, page = 1) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const parsedLimit = Math.min(Math.max(1, limit), 100);
    const parsedPage = Math.max(1, page);
    const skip = (parsedPage - 1) * parsedLimit;

    const query = { recipient: new mongoose.Types.ObjectId(userId) };

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .populate({
            path: "sender",
            select: "_id name username handle avatar"
        })
        .populate({
            path: "room_id",
            select: "_id room_name room_image"
        })
        .lean();

    const total = await Notification.countDocuments(query);

    return {
        notifications,
        pagination: {
            total,
            limit: parsedLimit,
            page: parsedPage,
            pages: Math.ceil(total / parsedLimit)
        }
    };
};

const markAsRead = async (userId: string, notificationId: string) => {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw new ApiError(400, "Invalid notification ID");
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { $set: { isRead: true } },
        { new: true }
    ).populate({
        path: "sender",
        select: "_id name username handle avatar"
    }).populate({
        path: "room_id",
        select: "_id room_name room_image"
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found or access denied");
    }

    try {
        const io = getIo();
        io.to(`user:${userId}`).emit("notification:read", { notificationId });
    } catch (error) {
        console.error("Socket.io emit failed for markAsRead:", error);
    }

    return notification;
};

const markAllAsRead = async (userId: string) => {
    await Notification.updateMany(
        { recipient: userId, isRead: false },
        { $set: { isRead: true } }
    );

    try {
        const io = getIo();
        io.to(`user:${userId}`).emit("notification:read_all");
    } catch (error) {
        console.error("Socket.io emit failed for markAllAsRead:", error);
    }

    return true;
};

const deleteNotification = async (userId: string, notificationId: string) => {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw new ApiError(400, "Invalid notification ID");
    }

    const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found or access denied");
    }

    try {
        const io = getIo();
        io.to(`user:${userId}`).emit("notification:delete", { notificationId });
    } catch (error) {
        console.error("Socket.io emit failed for deleteNotification:", error);
    }

    return true;
};

export const notificationService = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
