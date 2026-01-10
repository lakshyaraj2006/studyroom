import { Router } from "express";
import { profileController } from "../controllers/profile.controller";
import { checkAuth } from "../middlewares";

const router = Router();

router.route('/get/:userHandle').get(profileController.getUserProfile);
router.route('/update').patch(checkAuth, profileController.updateUserProfile);

export { router as profileRouter };