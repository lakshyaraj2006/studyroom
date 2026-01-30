import { Router } from "express";
import { checkAuth, upload } from "../middlewares";
import { roomController } from "../controllers/room.controller";
import { checkAuthOptional } from "../middlewares/checkAuthOptional";

const router = Router();

router.route('/create').post(checkAuth, upload.single("image"), roomController.createRoom);
router.route('/').get(roomController.getRooms);
router.route('/:roomId').get(checkAuthOptional, roomController.getRoom);
router.route('/update/:roomId').patch(checkAuth, upload.single("image"), roomController.updateRoom);

export { router as roomRouter };