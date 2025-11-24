import { Router } from "express";
import { authGuard } from "../../middleware/authGuard.js";
import { listShopHandler } from "./shop.controller.js";

export const shopRouter = Router();

shopRouter.get("/", authGuard, listShopHandler);
