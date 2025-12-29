import { Router } from "express";
import { userController } from "../controllers/user.controller";

const router = Router();

router.route("/create").post(userController.createUser);

export { router as userRouter };
