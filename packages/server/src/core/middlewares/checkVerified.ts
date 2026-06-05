import { NextFunction, Request, Response } from "express";
import { User } from "@/modules/user/user.model";
import { ApiError } from "../errors/ApiError";

export const checkVerified = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user;
    if (!userId) {
        return next(new ApiError(401, "Unauthorized"));
    }

    try {
        const user = await User.findById(userId).select("verified");
        if (!user) {
            return next(new ApiError(404, "User not found"));
        }

        if (!user.verified) {
            return next(new ApiError(403, "Account verification required to perform this action."));
        }

        next();
    } catch (err) {
        next(err);
    }
};
