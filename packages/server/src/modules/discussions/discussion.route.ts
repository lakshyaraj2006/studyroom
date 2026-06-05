import { Router } from "express";
import { checkAuth, checkVerified } from "@/core/middlewares";
import { checkAuthOptional } from "@/core/middlewares/checkAuthOptional";
import { discussionController } from "./discussion.controller";

const router = Router();

router.route("/").post(checkAuth, checkVerified, discussionController.createDiscussion);
router.route("/room/:roomId").get(checkAuthOptional, discussionController.getDiscussions);
router.route("/:discussionId").patch(checkAuth, checkVerified, discussionController.updateDiscussion);
router.route("/:discussionId").delete(checkAuth, checkVerified, discussionController.deleteDiscussion);

export { router as discussionRouter };
