import { Router } from "express";
import { authGuard } from "../../middleware/authGuard.js";
import { meHandler } from "./user.controller.js";

export const userRouter = Router();

userRouter.get("/me", authGuard, meHandler);
