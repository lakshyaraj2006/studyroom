import { Router } from "express";
import { checkAuth, upload } from "../middlewares";
import { roomController } from "../controllers/room.controller";
import { checkAuthOptional } from "../middlewares/checkAuthOptional";

const router = Router();

router.route('/create').post(checkAuth, upload.single("image"), roomController.createRoom);
router.route('/').get(roomController.getRooms);
router.route('/:roomId').get(checkAuthOptional, roomController.getRoom);

export { router as roomRouter };