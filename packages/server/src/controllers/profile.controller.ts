import { Request, Response } from "express";
import { profileService } from "../services/profile.service";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";

const getUserProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const { userHandle } = req.params;

        const result = await profileService.getUserProfile(userHandle?.toString() ?? "");

        // return the api response
        return res
            .status(200)
            .json(new ApiResponse(200, result, "Profile fetched"));
    }
)

const updateUserProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const { name, handle, bio } = req.body;

        const result = await profileService.updateUserProfile(req?.user as string, { name, handle, bio });

        // return the api response
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Profile updated"));
    }
)

export const profileController = { getUserProfile, updateUserProfile };
