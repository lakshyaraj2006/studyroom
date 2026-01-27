import { Router } from "express";
import { checkAuth } from "../middlewares";
import { roomController } from "../controllers/room.controller";

const router = Router();

router.route('/create').post(checkAuth, roomController.createRoom);

export { router as roomRouter };