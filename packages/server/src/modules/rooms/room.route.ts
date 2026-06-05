import { Router } from "express";
import { checkAuth, upload, checkVerified } from "@/core/middlewares";
import { roomController } from "./room.controller";
import { checkAuthOptional } from "@/core/middlewares/checkAuthOptional";

const router = Router();

router.route('/create').post(checkAuth, checkVerified, upload.single("image"), roomController.createRoom);
router.route('/').get(checkAuthOptional, roomController.getRooms);
router.route('/:roomId').get(checkAuthOptional, roomController.getRoom);
router.route('/update/:roomId').patch(checkAuth, checkVerified, upload.single("image"), roomController.updateRoom);
router.route('/delete/:roomId').delete(checkAuth, checkVerified, roomController.deleteRoom);
router.route('/send-invite/:roomId').post(checkAuth, checkVerified, roomController.sendInvite);
router.route('/accept-invite/:roomId/:token').post(checkAuth, checkVerified, roomController.acceptInvite);
router.route('/reject-invite/:roomId/:token').delete(checkAuth, checkVerified, roomController.rejectInvite);
router.route('/remove-user/:roomId/').delete(checkAuth, checkVerified, roomController.removeUser);
router.route('/block-user/:roomId/').patch(checkAuth, checkVerified, roomController.blockUser);
router.route('/get-blocked-users/:roomId/').get(checkAuth, checkVerified, roomController.getBlockedUsers);
router.route('/unblock-user/:roomId/').patch(checkAuth, checkVerified, roomController.unblockUser);
router.route('/get-invitations/:roomId/').get(checkAuth, checkVerified, roomController.getInvitations);
router.route('/revoke-invitation/:roomId/').delete(checkAuth, checkVerified, roomController.revokeInvitation);
router.route('/join-room/:roomId/').patch(checkAuth, checkVerified, roomController.joinRoom);
router.route('/leave-room/:roomId/').patch(checkAuth, checkVerified, roomController.leaveRoom);
router.route('/check-member/:roomId/').get(checkAuth, checkVerified, roomController.checkMember);
router.route('/search-room-users/:roomId').get(roomController.searchUserByNameOrEmail);

export { router as roomRouter };