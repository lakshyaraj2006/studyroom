import { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/AsyncHandler";
import { ApiResponse } from "@/shared/utils/ApiResponse";
import { notificationService } from "./notification.service";

const getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user as string;
    const { limit, page } = req.query;

    const parsedLimit = limit ? parseInt(limit as string, 10) : undefined;
    const parsedPage = page ? parseInt(page as string, 10) : undefined;

    const result = await notificationService.getNotifications(userId, parsedLimit, parsedPage);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Notifications fetched successfully"));
});

const markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user as string;
    const { notificationId } = req.params;

    const result = await notificationService.markAsRead(userId, notificationId);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Notification marked as read"));
});

const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user as string;

    await notificationService.markAllAsRead(userId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "All notifications marked as read"));
});

const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user as string;
    const { notificationId } = req.params;

    await notificationService.deleteNotification(userId, notificationId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Notification deleted successfully"));
});

export const notificationController = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
