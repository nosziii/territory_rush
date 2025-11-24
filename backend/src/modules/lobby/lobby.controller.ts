import { Response } from "express";
import { createQuickMatch } from "./lobby.service.js";

export function quickPlayHandler(_req: any, res: Response) {
  const match = createQuickMatch("player");
  res.json({
    ...match,
    wsUrl: "/ws",
    joinToken: match.matchId, // placeholder handshake
  });
}
