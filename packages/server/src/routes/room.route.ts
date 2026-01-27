import { Router } from "express";
import { checkAuth, upload } from "../middlewares";
import { roomController } from "../controllers/room.controller";

const router = Router();

router.route('/create').post(checkAuth, upload.single("image"), roomController.createRoom);

export { router as roomRouter };