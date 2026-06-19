import { deleteFromCloudinary, deleteCloudinaryFolder, uploadOnCloudinary } from "@/core/config/cloudinary";
import { getCloudinaryPublicId } from "@/shared/lib/getCloudinaryPublicId";
import { IUser, User } from "@/modules/user/user.model";
import { ApiError } from "@/core/errors/ApiError";
import { sendDeleteAccountEmail } from "@/jobs/emails/sendDeleteAccountEmailCode";
import { generateVerificationCode } from "@/shared/lib/generateVerificationCode";
import { sendVerificationEmail } from "@/jobs/emails/sendVerificationEmail";

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
    let user = await User.findOne({ handle: userDetails.handle, _id: { $ne: userId } });

    if (user) {
        throw new ApiError(409, "Handle is already in use");
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

    return {avatar: result.secure_url};
}

const deleteProfilePic = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found")
    } else if (!user?.avatar) {
        throw new ApiError(400, "User does not have a profile picture.");
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
    throw new ApiError(400, "You are not following this user.");
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

const sendDeleteUserProfileCode = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User was not found!")
  } else {
    const verifyCode = generateVerificationCode(8);
    const verifyCodeExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000);

    user.verifyCode = verifyCode;
    user.verifyCodeExpiry = verifyCodeExpiry;

    await sendVerificationEmail(user.username, user.email, verifyCode);

    await user.save();

    return true;
  }
}

const deleteUserProfileConfirm = async (userId: string, code: string) => {
  const user = await User.findById(userId);

  if (!user || user.is_deleted) {
    throw new ApiError(404, "User was not found!");
  } else {
    if (user.verifyCode !== code) {
      throw new ApiError(400, "Invalid Code");
    } else { 
      await sendDeleteAccountEmail(user.username, user.email);
      await deleteCloudinaryFolder('StudyRoom/profiles/' + userId);
      
      user.name = "[deletedUser]";
      user.username = `[deletedUser]_${user._id.toString().slice(-6)}`;
      user.email = `deleted+${userId}@studyroom.com`;
      user.password = undefined;
      user.avatar = undefined;
      user.bio = undefined;
      user.verifyCode = undefined;
      user.verifyCodeExpiry = undefined;
      user.is_deleted = true;

      await user.save();
      
      return true;
    }
  }
}

export const profileService = { getUserProfile, updateUserProfile, uploadProfilePic, deleteProfilePic, followUser, unfollowUser, sendDeleteUserProfileCode, deleteUserProfileConfirm };