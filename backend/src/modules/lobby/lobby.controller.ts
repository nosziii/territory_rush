import { Response, Request } from "express";
import { createQuickMatch } from "./lobby.service.js";
import { matchManager } from "../../game-server/index.js";

export function quickPlayHandler(_req: any, res: Response) {
  const match = createQuickMatch("player");
  res.json({
    ...match,
    wsUrl: "/ws",
    joinToken: match.matchId, // placeholder handshake
  });
}

export function listMatchesHandler(_req: Request, res: Response) {
  if (!matchManager) {
    res.json([]);
    return;
  }
  res.json(matchManager.getMatches());
}

export function stopMatchHandler(req: Request, res: Response) {
  const { matchId } = req.body;
  if (!matchManager) {
    res.status(500).json({ error: "MatchManager not initialized" });
    return;
  }
  const success = matchManager.stopMatch(matchId);
  res.json({ success });
}
