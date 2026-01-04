import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { checkAuth } from "../middlewares";

const router = Router();

router.route("/create").post(userController.createUser);
router.route("/login").post(userController.loginUser);
router.route("/logout").post(checkAuth, userController.logoutUser);
router.route("/rotate").post(userController.rotateAccessAndRefreshTokens);

export { router as userRouter };
