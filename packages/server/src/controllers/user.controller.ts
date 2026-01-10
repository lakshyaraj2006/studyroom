import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { userService } from "../services/user.service";
import { asyncHandler } from "../utils/AsyncHandler";

const createUser = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { name, username, email, password, cpassword } = req.body;

            const result = await userService.createUser(name, username, email, password, cpassword);

            // return the api response
            return res
                .status(201)
                .json(new ApiResponse(201, null, "Check your email for verification!"));
        } catch (error) {
            if (error instanceof ApiError) {
                return res
                    .status(error.statusCode)
                    .json(new ApiResponse(error.statusCode, null, error.message));
            } else {
                return res
                    .status(500)
                    .json(new ApiResponse(500, (error as any).message));
            }
        }
    }
);

const resendVerificationCode = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { email } = req.body;

            const result = await userService.resendVerificationCode(email);

            // return the api response
            return res
                .status(200)
                .json(new ApiResponse(200, null, "Verification code has been resent!"));
        } catch (error) {
            if (error instanceof ApiError) {
                return res
                    .status(error.statusCode)
                    .json(new ApiResponse(error.statusCode, null, error.message));
            } else {
                return res
                    .status(500)
                    .json(new ApiResponse(500, (error as any).message));
            }
        }
    }
)

const verifyEmail = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { email, code } = req.body;

            const { accessToken, refreshToken } = await userService.verifyEmail(email, code);

            // set the refresh token as a cookie
            res.cookie('refreshtoken', refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production"
            });

            // return the api response
            return res
                .status(200)
                .json(new ApiResponse(200, { accessToken }, "Email verified!"));
        } catch (error) {
            if (error instanceof ApiError) {
                return res
                    .status(error.statusCode)
                    .json(new ApiResponse(error.statusCode, null, error.message));
            } else {
                return res
                    .status(500)
                    .json(new ApiResponse(500, (error as any).message));
            }
        }
    }
);

const loginUser = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { identifier, password } = req.body;

            const { accessToken, refreshToken } = await userService.loginUser(identifier, password);

            // set the refresh token as a cookie
            res.cookie('refreshtoken', refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production"
            });

            // return the api response
            return res
                .status(200)
                .json(new ApiResponse(200, { accessToken }, "Logged in successfully!"));
        } catch (error) {
            if (error instanceof ApiError) {
                return res
                    .status(error.statusCode)
                    .json(new ApiResponse(error.statusCode, null, error.message));
            } else {
                return res
                    .status(500)
                    .json(new ApiResponse(500, (error as any).message));
            }
        }
    }
);

const logoutUser = (req: Request, res: Response) => {
    try {
        const result = userService.logoutUser(req, res);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Logged out successfully!"));
    } catch (error) {
        if (error instanceof ApiError) {
            return res
                .status(error.statusCode)
                .json(new ApiResponse(error.statusCode, null, error.message));
        } else {
            return res
                .status(500)
                .json(new ApiResponse(500, (error as any).message));
        }
    }
}

const rotateAccessAndRefreshTokens = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { accessToken, refreshToken } = await userService.rotateAccessAndRefreshTokens(req.cookies);

            // set the refresh token as a cookie
            res.cookie('refreshtoken', refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production"
            });

            // return the api response
            return res
                .status(200)
                .json(new ApiResponse(200, { accessToken }, "Tokens rotated"));
        } catch (error) {
            if (error instanceof ApiError) {
                return res
                    .status(error.statusCode)
                    .json(new ApiResponse(error.statusCode, null, error.message));
            } else {
                return res
                    .status(500)
                    .json(new ApiResponse(500, (error as any).message));
            }
        }
    }
);

const forgotPassword = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            const result = await userService.forgotPassword(email);

            // return the api response
            return res
                .status(200)
                .json(new ApiResponse(200, null, "Verification code sent to email"));
        } catch (error) {
            if (error instanceof ApiError) {
                return res
                    .status(error.statusCode)
                    .json(new ApiResponse(error.statusCode, null, error.message));
            } else {
                return res
                    .status(500)
                    .json(new ApiResponse(500, (error as any).message));
            }
        }
    }
);

const forgotPasswordReset = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { email, code, password, cpassword } = req.body;
            const result = await userService.forgotPasswordReset(email, code, password, cpassword);

            // return the api response
            return res
                .status(200)
                .json(new ApiResponse(200, null, "Password reset successfully"));
        } catch (error) {
            if (error instanceof ApiError) {
                return res
                    .status(error.statusCode)
                    .json(new ApiResponse(error.statusCode, null, error.message));
            } else {
                return res
                    .status(500)
                    .json(new ApiResponse(500, (error as any).message));
            }
        }
    }
);

export const userController = { createUser, loginUser, logoutUser, rotateAccessAndRefreshTokens, forgotPassword, forgotPasswordReset, verifyEmail, resendVerificationCode };