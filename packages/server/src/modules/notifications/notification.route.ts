import { Router } from "express";
import { checkAuth } from "@/core/middlewares";
import { notificationController } from "./notification.controller";

const router = Router();

// Apply auth middleware to all notification routes
router.use(checkAuth);

router.route("/").get(notificationController.getNotifications);
router.route("/read-all").patch(notificationController.markAllAsRead);
router.route("/:notificationId/read").patch(notificationController.markAsRead);
router.route("/:notificationId").delete(notificationController.deleteNotification);

export { router as notificationRouter };
