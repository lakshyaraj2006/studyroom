import { Router } from "express";
import { userController } from "../controllers/user.controller";

const router = Router();

router.route("/create").post(userController.createUser);
router.route("/login").post(userController.loginUser);
router.route("/logout").post(userController.logoutUser);

export { router as userRouter };
