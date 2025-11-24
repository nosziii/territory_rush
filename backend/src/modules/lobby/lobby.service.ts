import { v4 as uuid } from "uuid";

export function createQuickMatch(userId: string) {
  // Placeholder: in-memory match id with AI flag
  return {
    matchId: uuid(),
    opponent: "AI",
    playerId: userId,
  };
}
