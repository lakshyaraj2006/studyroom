import { Request, Response } from "express";
import { profileService } from "../services/profile.service";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";

const getUserProfile = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { userHandle } = req.params;

            const result = await profileService.getUserProfile(userHandle?.toString() ?? "");

            // return the api response
            return res
                .status(200)
                .json(new ApiResponse(201, result, "Profile fetched"));
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

export const profileController = { getUserProfile };
