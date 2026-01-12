import { Router } from "express";
import { profileController } from "../controllers/profile.controller";
import { checkAuth, upload } from "../middlewares";

const router = Router();

router.route('/get/:userHandle').get(profileController.getUserProfile);
router.route('/update').patch(checkAuth, profileController.updateUserProfile);
router.route('/upload-avatar').post(checkAuth, upload.single('image'), profileController.uploadProfilePic);
router.route('/remove-avatar').delete(checkAuth, profileController.deleteProfilePic);

export { router as profileRouter };