import mongoose, { Schema } from "mongoose";
import { deleteFromCloudinary, uploadOnCloudinary } from "../lib/cloudinary.config";
import { getCloudinaryPublicId } from "../lib/getCloudinaryPublicId";
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

const deleteProfilePic = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found")
    } else if (!user?.avatar) {
        throw new ApiError(409, "User does not have a profile pic")
    }
    else {
        const publicId = getCloudinaryPublicId(user?.avatar);

        if (!publicId) return;

        const result = await deleteFromCloudinary(publicId);
        await User.findByIdAndUpdate(userId, {
            $unset: { avatar: 1 }
        })

        return result;
    }
}

const followUser = async (userId: string, userHandle: string) => {
  const targetUser = await User.findOne({ handle: userHandle })
    .select("_id name handle");

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  if (targetUser._id.equals(userId)) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  await Promise.all([
    User.updateOne(
      { _id: userId },
      { $addToSet: { following: targetUser._id } }
    ),
    User.updateOne(
      { _id: targetUser._id },
      { $addToSet: { followers: userId } }
    )
  ]);

  return {
    id: targetUser._id,
    name: targetUser.name,
    handle: targetUser.handle
  };
};

const unfollowUser = async (userId: string, userHandle: string) => {
  const targetUser = await User.findOne({
    handle: userHandle,
    followers: userId
  }).select("_id name handle");

  if (!targetUser) {
    throw new ApiError(404, "You are not following this user");
  }

  await Promise.all([
    User.updateOne(
      { _id: userId },
      { $pull: { following: targetUser._id } }
    ),
    User.updateOne(
      { _id: targetUser._id },
      { $pull: { followers: userId } }
    )
  ]);

  return {
    id: targetUser._id,
    name: targetUser.name,
    handle: targetUser.handle
  };
};

export const profileService = { getUserProfile, updateUserProfile, uploadProfilePic, deleteProfilePic, followUser, unfollowUser };