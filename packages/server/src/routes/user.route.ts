import { Router } from "express";
import { userController } from "../controllers/user.controller";

const router = Router();

router.route("/create").post(userController.createUser);
router.route("/login").post(userController.loginUser);
router.route("/logout").post(userController.logoutUser);
router.route("/rotate").post(userController.rotateAccessAndRefreshTokens);

export { router as userRouter };
