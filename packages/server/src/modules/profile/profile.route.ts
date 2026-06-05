import { Router } from "express";
import { profileController } from "./profile.controller";
import { checkAuth, upload, checkVerified } from "@/core/middlewares";

const router = Router();

router.route('/get/:userHandle').get(profileController.getUserProfile);
router.route('/update').patch(checkAuth, checkVerified, profileController.updateUserProfile);
router.route('/upload-avatar').post(checkAuth, checkVerified, upload.single('image'), profileController.uploadProfilePic);
router.route('/remove-avatar').delete(checkAuth, checkVerified, profileController.deleteProfilePic);
router.route('/follow/:userHandle').post(checkAuth, checkVerified, profileController.followUser);
router.route('/unfollow/:userHandle').delete(checkAuth, checkVerified, profileController.unfollowUser);
router.route('/delete-code').post(checkAuth, checkVerified, profileController.sendDeleteUserProfileCode);
router.route('/delete-confirm').post(checkAuth, checkVerified, profileController.deleteUserProfileConfirm);

export { router as profileRouter };