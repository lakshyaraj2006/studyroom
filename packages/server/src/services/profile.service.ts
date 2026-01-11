import { uploadOnCloudinary } from "../lib/cloudinary.config";
import { IUser, User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";

const getUserProfile = async (userHandle: string) => {
    if (!userHandle || userHandle === "") {
        throw new ApiError(400, "User handle required")
    } else {
        const user = await User.findOne({ handle: userHandle });

        if (!user) {
            throw new ApiError(404, "User not found!");
        } else {
            return user;
        }
    }
}

const updateUserProfile = async (userId: string, userDetails: Pick<IUser, "name" | "handle" | "bio">) => {
    let user = await User.findOne({ handle: userDetails.handle });

    if (user) {
        throw new ApiError(400, "Handle is already in use")
    } else {
        user = await User.findByIdAndUpdate(userId,
            {
                $set: userDetails
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return true;
    }
}

const uploadProfilePic = async (userId: string, avatarLocalPath: string) => {
    const result = await uploadOnCloudinary(avatarLocalPath, 'profiles/' + userId);

    if (!result) {
        throw new ApiError(400, "Avatar file is required!");
    }

    await User.findByIdAndUpdate(
        userId,
        {
            avatar: result.secure_url
        }
    )

    return true;
}

export const profileService = { getUserProfile, updateUserProfile, uploadProfilePic };