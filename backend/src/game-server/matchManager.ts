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
  ability?: string;
}

interface BuildMessage {
  type: "build_request";
  matchId: string;
  playerId: string;
  tile: { x: number; y: number };
  buildingType: string;
}

export class MatchManager {
  private matches = new Map<string, Match>();

  constructor(private logger: Logger) { }

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
      match?.handleAbility(message.playerId, message.target, message.ability);
    }
    if (isBuildMessage(message)) {
      const match = this.matches.get(message.matchId);
      match?.handleBuild(message.playerId, message.tile.x, message.tile.y, message.buildingType);
    }
  }

  private createMatch(matchId: string) {
    const newMatch = new Match(matchId, this.logger);
    this.matches.set(matchId, newMatch);
    return newMatch;
  }
}

function isJoinMessage(msg: unknown): msg is JoinMessage {
  return (
    typeof msg === "object" &&
    msg !== null &&
    (msg as any).type === "join_match" &&
    typeof (msg as any).matchId === "string"
  );
}

function isAbilityMessage(msg: unknown): msg is AbilityMessage {
  return (
    typeof msg === "object" &&
    msg !== null &&
    (msg as any).type === "ability_use" &&
    typeof (msg as any).matchId === "string" &&
    typeof (msg as any).playerId === "string" &&
    typeof (msg as any).target?.x === "number" &&
    typeof (msg as any).target?.y === "number"
  );
}

function isBuildMessage(msg: unknown): msg is BuildMessage {
  return (
    typeof msg === "object" &&
    msg !== null &&
    (msg as any).type === "build_request" &&
    typeof (msg as any).matchId === "string" &&
    typeof (msg as any).playerId === "string" &&
    typeof (msg as any).tile?.x === "number" &&
    typeof (msg as any).tile?.y === "number" &&
    typeof (msg as any).buildingType === "string"
  );
}
