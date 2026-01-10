import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";

const getUserProfile = async (userHandle: string) => {
    if (!userHandle || userHandle === "") {
        throw new ApiError(400, "User handle required")
    } else {
        const user = await User.findOne({handle: userHandle});

        if (!user) {
            throw new ApiError(404, "User not found!");
        } else {
            return user;
        }
    }
}

export const profileService = { getUserProfile };