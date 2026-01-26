import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import { ApiError } from '../utils/ApiError';

// configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
})

// create a fn to upload files
export const uploadOnCloudinary = async (localFilePath: string, folderName: string) => {
    try {
        // if no local file path, return null
        if (!localFilePath) return null;

        // try uploading
        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: "StudyRoom/" + folderName,
            resource_type: "auto"
        });

        // unlink local file path
        fs.unlinkSync(localFilePath);

        // return response
        return response;
    } catch (error) {
        // unlink local file path & return null
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        throw new ApiError(500, (error as any).message || "File upload failed");
    }
}

// delete asset from cloudinary cloud
export const deleteFromCloudinary = async (publicId: string) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Cloudinary delete failed:", error);
        throw new ApiError(500, (error as any).message || "Cloudinary delete failed");
    }
}

// delete user profile images folder
export const deleteUserProfileFolder = async (userId: string) => {
  const prefix = 'StudyRoom/profiles/' + userId;

  try {
    await cloudinary.api.delete_resources_by_prefix(prefix, { resource_type: "image" });

    try {
      await cloudinary.api.delete_folder(prefix);
    } catch (err: any) {
      if (!((err?.error?.message || JSON.stringify(err)).toLowerCase().includes("can't find folder"))) {
        throw err;
      }
    }

    return true;
  } catch (error: any) {
    console.error("Cloudinary delete failed:", error?.error?.message || JSON.stringify(error));
    throw new ApiError(500, error?.error?.message || JSON.stringify(error) || "Cloudinary delete failed");
  }
};



