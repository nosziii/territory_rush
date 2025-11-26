import { Router } from "express";
import { quickPlayHandler, listMatchesHandler, stopMatchHandler } from "./lobby.controller.js";

export const lobbyRouter = Router();

// Dev/demo: authGuard kihagyva, hogy gyorsan induljon a meccs
lobbyRouter.post("/quick-play", quickPlayHandler);
lobbyRouter.get("/matches", listMatchesHandler);
lobbyRouter.post("/stop-match", stopMatchHandler);
