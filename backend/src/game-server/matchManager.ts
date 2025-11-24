import { WebSocket } from "ws";
import { Match } from "./match.js";
import { Logger } from "../types.js";

interface JoinMessage {
  type: "join_match";
  matchId: string;
  authToken: string;
}

interface AbilityMessage {
  type: "ability_use";
  matchId: string;
  playerId: string;
  target: { x: number; y: number };
}

export class MatchManager {
  private matches = new Map<string, Match>();

  constructor(private logger: Logger) {}

  start() {
    setInterval(() => {
      for (const match of this.matches.values()) {
        match.update(0.1);
      }
    }, 100);
  }

  handleMessage(socket: WebSocket, message: unknown) {
    if (isJoinMessage(message)) {
      const match =
        this.matches.get(message.matchId) ?? this.createMatch(message.matchId);
      match.addPlayer(socket, message.authToken || "player");
      return;
    }
    if (isAbilityMessage(message)) {
      const match = this.matches.get(message.matchId);
      match?.handleAbility(message.playerId, message.target);
    }
  }

  private createMatch(matchId: string) {
    const newMatch = new Match(matchId, this.logger);
    this.matches.set(matchId, newMatch);
    return newMatch;
  }
}

function isJoinMessage(msg: any): msg is JoinMessage {
  return msg?.type === "join_match" && typeof msg.matchId === "string";
}

function isAbilityMessage(msg: any): msg is AbilityMessage {
  return (
    msg?.type === "ability_use" &&
    typeof msg.matchId === "string" &&
    typeof msg.playerId === "string" &&
    typeof msg.target?.x === "number" &&
    typeof msg.target?.y === "number"
  );
}
