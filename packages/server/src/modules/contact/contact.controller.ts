import { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/AsyncHandler";
import { ApiResponse } from "@/shared/utils/ApiResponse";
import { contactService } from "./contact.service";

const sendContactMessage = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body;

    const result = await contactService.sendContactMessage(name, email, subject, message);

    return res
        .status(201)
        .json(new ApiResponse(201, result, "Message sent successfully"));
});

export const contactController = { sendContactMessage };
