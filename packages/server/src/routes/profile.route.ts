import { Router } from "express";
import { profileController } from "../controllers/profile.controller";

const router = Router();

router.route('/get/:userHandle').get(profileController.getUserProfile);

export { router as profileRouter };