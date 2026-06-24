import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "@/core/middlewares";

const router = Router();

router.route("/create").post(userController.createUser);
router.route("/resend-code").post(userController.resendVerificationCode);
router.route("/verify-email").post(userController.verifyEmail);
router.route("/login").post(userController.loginUser);
router.route("/logout").post(checkAuth, userController.logoutUser);
router.route("/rotate").post(userController.rotateAccessAndRefreshTokens);
router.route("/forgot-password").post(userController.forgotPassword);
router.route("/forgot-password-reset").post(userController.forgotPasswordReset);

export { router as userRouter };
