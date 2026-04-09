import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/ApiError";
import { ApiResponse } from "@/shared/utils/ApiResponse";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(
      new ApiResponse(err.statusCode, null, err.message)
    );
  }

  return res.status(500).json(
    new ApiResponse(500, null, err.message || "Something went wrong")
  );
};
