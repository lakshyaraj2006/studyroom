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

const uploadProfilePic = asyncHandler(
    async (req: Request, res: Response) => {
        const avatarLocalPath = req.file?.path;

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required!");
        }

        const result = await profileService.uploadProfilePic(req.user as string, avatarLocalPath);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Profile Picture Uploaded"))
    }
)

const deleteProfilePic = asyncHandler(
    async (req: Request, res: Response) => {
        const result = await profileService.deleteProfilePic(req.user as string);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Profile Picture Removed"))
    }
)

const followUser = asyncHandler(
    async (req: Request, res: Response) => {
        const { userHandle } = req.params;

        if (!userHandle) {
            throw new ApiError(400, "User handle is required");
        } else {
            const result = await profileService.followUser(req.user as string, userHandle);

            return res
                .status(200)
                .json(new ApiResponse(200, null, "You followed " + result.name));
        }
    }
)

const unfollowUser = asyncHandler(
    async (req: Request, res: Response) => {
        const { userHandle } = req.params;

        const result = await profileService.unfollowUser(req.user as string, userHandle);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "You unfollowed " + result.name));
    }
)

export const profileController = { getUserProfile, updateUserProfile, uploadProfilePic, deleteProfilePic, followUser, unfollowUser };
