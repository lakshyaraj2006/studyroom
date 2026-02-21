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

export { router as roomRouter };