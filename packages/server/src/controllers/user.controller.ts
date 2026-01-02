import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { userService } from "../services/user.service";

const createUser = async (req: Request, res: Response) => {
    try {
        const { name, username, email, password, cpassword } = req.body;

        const { accessToken, refreshToken } = await userService.createUser(name, username, email, password, cpassword);

        // set the refresh token as a cookie
        res.cookie('refreshtoken', refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        });

        // return the api response
        return res
            .status(201)
            .json(new ApiResponse(201, { accessToken }, "User account created!"));
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

const loginUser = async (req: Request, res: Response) => {
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

const rotateAccessAndRefreshTokens = async (req: Request, res: Response) => {
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

export const userController = { createUser, loginUser, logoutUser, rotateAccessAndRefreshTokens };