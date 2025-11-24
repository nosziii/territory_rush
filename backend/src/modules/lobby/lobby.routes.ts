import { Router } from "express";
import { quickPlayHandler } from "./lobby.controller.js";

export const lobbyRouter = Router();

// Dev/demo: authGuard kihagyva, hogy gyorsan induljon a meccs
lobbyRouter.post("/quick-play", quickPlayHandler);
