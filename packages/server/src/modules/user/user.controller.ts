import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "@/shared/utils/ApiResponse";
import { userService } from "./user.service";
import { asyncHandler } from "@/shared/utils/AsyncHandler";
import passport from "passport";
import { IUser } from "./user.model";
import { ApiError } from "@/core/errors/ApiError";

const createUser = asyncHandler(
    async (req: Request, res: Response) => {
        const { name, username, email, password, cpassword } = req.body;

        const result = await userService.createUser(name, username, email, password, cpassword);

        // return the api response
        return res
            .status(201)
            .json(new ApiResponse(201, null, "Check your email for verification!"));
    }
);

const resendVerificationCode = asyncHandler(
    async (req: Request, res: Response) => {
        const { email } = req.body;

        const result = await userService.resendVerificationCode(email);

        // return the api response
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Verification code has been resent!"));
    }
)

const verifyEmail = asyncHandler(
    async (req: Request, res: Response) => {
        const { email, code } = req.body;

        const { accessToken, refreshToken, id, username, avatar, handle } = await userService.verifyEmail(email, code);

        // set the refresh token as a cookie
        res.cookie('refreshtoken', refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        });

        // return the api response
        return res
            .status(200)
            .json(new ApiResponse(200, { accessToken, id, username, avatar, handle }, "Email verified!"));
    }
);

const loginUser = asyncHandler(
    async (req: Request, res: Response) => {
        const { identifier, password } = req.body;

        const { accessToken, refreshToken, id, username, avatar, handle } = await userService.loginUser(identifier, password);

        // set the refresh token as a cookie
        res.cookie('refreshtoken', refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        });

        // return the api response
        return res
            .status(200)
            .json(new ApiResponse(200, { accessToken, id, username, avatar, handle }, "Logged in successfully!"));
    }
);

const logoutUser = (req: Request, res: Response) => {
    const result = userService.logoutUser(req, res);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Logged out successfully!"));
}

const rotateAccessAndRefreshTokens = asyncHandler(
    async (req: Request, res: Response) => {
        const { accessToken, refreshToken, id, username, avatar, handle } = await userService.rotateAccessAndRefreshTokens(req.cookies);

        // set the refresh token as a cookie
        res.cookie('refreshtoken', refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        });

        // return the api response
        return res
            .status(200)
            .json(new ApiResponse(200, { accessToken, id, username, avatar, handle }, "Tokens rotated"));
    }
);

const forgotPassword = asyncHandler(
    async (req: Request, res: Response) => {
        const { email } = req.body;
        const result = await userService.forgotPassword(email);

        // return the api response
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Verification code sent to email"));
    }
);

const forgotPasswordReset = asyncHandler(
    async (req: Request, res: Response) => {
        const { email, code, password, cpassword } = req.body;
        const result = await userService.forgotPasswordReset(email, code, password, cpassword);

        // return the api response
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Password reset successfully"));

    }
);

const changeEmail = asyncHandler(
    async (req: Request, res: Response) => {
        const { email } = req.body;
        const userId = req.user as string;

        await userService.changeEmail(userId, email);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Email updated and verification code sent."));
    }
);

export const googleCallback = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate(
            "google",
            { session: false },
            async (err, user: IUser | false) => {
                if (err) return next(err);

                if (!user) {
                    return next(new ApiError(401, "Google authentication failed."));
                }

                const result = await userService.googleLogin(user);

                res
                    .cookie("refreshtoken", result.refreshToken, {
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production"
                    })
                    .redirect(
                        `${process.env.FRONTEND_URL}/auth/oauth-success` +
                        `?success=true` +
                        `&accessToken=${encodeURIComponent(result.accessToken)}` +
                        `&id=${encodeURIComponent(result.id)}` +
                        `&username=${encodeURIComponent(result.username)}` +
                        `&handle=${encodeURIComponent(result.handle)}` +
                        `&avatar=${encodeURIComponent(result.avatar ?? "")}`
                    );
            }
        )(req, res, next);
    }
);

export const userController = { createUser, loginUser, logoutUser, rotateAccessAndRefreshTokens, forgotPassword, forgotPasswordReset, verifyEmail, resendVerificationCode, changeEmail, googleCallback };