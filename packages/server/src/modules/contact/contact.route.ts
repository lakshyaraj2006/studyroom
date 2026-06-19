import { Router } from "express";
import { contactController } from "./contact.controller";

const router = Router();

router.route("/").post(contactController.sendContactMessage);

export { router as contactRouter };
