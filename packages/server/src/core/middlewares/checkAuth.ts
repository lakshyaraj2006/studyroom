import jwt from "jsonwebtoken";
import { AccessTokenPayloadType } from "@/shared/types/jwtPayloadCustom";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/ApiError";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new ApiError(401, "Unauthorized"));
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new ApiError(401, "Invalid authorization format"));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as AccessTokenPayloadType;

    req.user = decoded.id;
    next();
  } catch (err) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};

