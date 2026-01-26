import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { userService } from "../services/user.service";
import { asyncHandler } from "../utils/AsyncHandler";

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

        const { accessToken, refreshToken, id, username, avatar } = await userService.verifyEmail(email, code);

        // set the refresh token as a cookie
        res.cookie('refreshtoken', refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        });

        // return the api response
        return res
            .status(200)
            .json(new ApiResponse(200, { accessToken, id, username, avatar }, "Email verified!"));
    }
);

const loginUser = asyncHandler(
    async (req: Request, res: Response) => {
        const { identifier, password } = req.body;

        const { accessToken, refreshToken, id, username, avatar } = await userService.loginUser(identifier, password);

        // set the refresh token as a cookie
        res.cookie('refreshtoken', refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        });

        // return the api response
        return res
            .status(200)
            .json(new ApiResponse(200, { accessToken, id, username, avatar }, "Logged in successfully!"));
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
        const { accessToken, refreshToken, id } = await userService.rotateAccessAndRefreshTokens(req.cookies);

        // set the refresh token as a cookie
        res.cookie('refreshtoken', refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        });

        // return the api response
        return res
            .status(200)
            .json(new ApiResponse(200, { accessToken, id }, "Tokens rotated"));
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

export const userController = { createUser, loginUser, logoutUser, rotateAccessAndRefreshTokens, forgotPassword, forgotPasswordReset, verifyEmail, resendVerificationCode };