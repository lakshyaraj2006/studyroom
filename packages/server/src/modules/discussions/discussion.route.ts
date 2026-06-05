import { Router } from "express";
import { checkAuth } from "@/core/middlewares";
import { checkAuthOptional } from "@/core/middlewares/checkAuthOptional";
import { discussionController } from "./discussion.controller";

const router = Router();

router.route("/").post(checkAuth, discussionController.createDiscussion);
router.route("/room/:roomId").get(checkAuthOptional, discussionController.getDiscussions);
router.route("/:discussionId").patch(checkAuth, discussionController.updateDiscussion);
router.route("/:discussionId").delete(checkAuth, discussionController.deleteDiscussion);

export { router as discussionRouter };
