import { Router } from "express";
import { checkAuth, upload } from "../middlewares";
import { roomController } from "../controllers/room.controller";
import { checkAuthOptional } from "../middlewares/checkAuthOptional";

const router = Router();

router.route('/create').post(checkAuth, upload.single("image"), roomController.createRoom);
router.route('/').get(roomController.getRooms);
router.route('/:roomId').get(checkAuthOptional, roomController.getRoom);
router.route('/update/:roomId').patch(checkAuth, upload.single("image"), roomController.updateRoom);
router.route('/delete/:roomId').delete(checkAuth, roomController.deleteRoom);
router.route('/send-invite/:roomId').post(checkAuth, roomController.sendInvite);
router.route('/accept-invite/:roomId/:token').post(checkAuth, roomController.acceptInvite);
router.route('/reject-invite/:roomId/:token').delete(checkAuth, roomController.rejectInvite);
router.route('/remove-user/:roomId/').delete(checkAuth, roomController.removeUser);
router.route('/block-user/:roomId/').patch(checkAuth, roomController.blockUser);
router.route('/get-blocked-users/:roomId/').get(checkAuth, roomController.getBlockedUsers);
router.route('/unblock-user/:roomId/').patch(checkAuth, roomController.unblockUser);
router.route('/get-invitations/:roomId/').get(checkAuth, roomController.getInvitations);
router.route('/revoke-invitation/:roomId/').delete(checkAuth, roomController.revokeInvitation);
router.route('/leave-room/:roomId/').patch(checkAuth, roomController.leaveRoom);

export { router as roomRouter };