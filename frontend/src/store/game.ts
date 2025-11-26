import { defineStore } from "pinia";

type MatchPhase = "idle" | "loading" | "running" | "ended";

const DEFAULT_WS =
  (typeof window !== "undefined" && window.location
    ? `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws`
    : "ws://localhost:4000/ws");

interface TileState {
  x: number;
  y: number;
  owner: string | null;
  type: string;
  capture: number;
  height?: number;
}

interface UnitState {
  id: string;
  owner: string;
  type: string;
  x: number;
  y: number;
  hp: number;
  targetX: number;
  targetY: number;
  dmg?: number;
  range?: number;
  canSail?: boolean;
}

interface BuildingState {
  id: string;
  owner: string;
  type: string;
  x: number;
  y: number;
  hp: number;
  level: number;
}

interface ProjectileState {
  id: string;
  owner: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  ttl: number;
}

interface ResourceState {
  owner: string;
  gold: number;
}

export const useGameStore = defineStore("game", {
  state: () => ({
    matchId: "",
    playerId: "player",
    phase: "idle" as MatchPhase,
    tiles: [] as TileState[],
    units: [] as UnitState[],
    buildings: [] as BuildingState[],
    projectiles: [] as ProjectileState[],
    resources: [] as ResourceState[],
    ws: null as WebSocket | null,
    tick: 0,
    lastError: "",
    abilityReadyAt: 0,
    targetingAbility: "" as string,
    rallyMode: false,
    hoveredTile: null as { x: number; y: number } | null,
    logs: [] as { message: string; category: string; timestamp: number }[],
    playerColor: "pink" as "pink" | "green" | "violet" | "yellow",
  }),
  actions: {
    connect(
      matchId: string,
      wsUrl = import.meta.env.VITE_WS_URL || DEFAULT_WS,
      playerId = "player"
    ) {
      this.matchId = matchId;
      this.playerId = playerId;
      this.phase = "loading";
      this.lastError = "";
      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = () => {
        console.info("WS open", { wsUrl, matchId: this.matchId });
        this.ws?.send(
          JSON.stringify({ type: "join_match", matchId: this.matchId, authToken: this.playerId })
        );
      };
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "match_state") {
          this.tick = message.tick;
          this.tiles = message.tiles ?? [];
          this.units = message.units ?? [];
          this.buildings = message.buildings ?? [];
          this.projectiles = message.projectiles ?? [];
          this.resources = message.resources ?? [];
          this.phase = "running";
        } else if (message.type === "event_log") {
          this.logs.unshift({
            message: message.message,
            category: message.category,
            timestamp: message.timestamp
          });
          if (this.logs.length > 50) this.logs.pop();
        }
      };
      this.ws.onerror = (err) => {
        console.error("WS error", err);
        this.lastError = "WebSocket hiba. Ellenőrizd az URL-t és a backendet.";
        this.phase = "ended";
      };
      this.ws.onclose = (ev) => {
        console.warn("WS closed", ev);
        if (!this.lastError) {
          this.lastError = "WebSocket lezárult.";
        }
        this.phase = "ended";
      };
    },
    sendAbility(x: number, y: number, ability = "reinforce") {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      if (!this.abilityReady()) {
        this.lastError = "Ability cooldown...";
        return;
      }
      this.ws.send(
        JSON.stringify({
          type: "ability_use",
          matchId: this.matchId,
          playerId: this.playerId,
          target: { x, y },
          ability,
        })
      );
      this.abilityReadyAt = Date.now() + 5000;
      this.targetingAbility = "";
    },
    sendBuildRequest(x: number, y: number, type: string) {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      this.ws.send(
        JSON.stringify({
          type: "build_request",
          matchId: this.matchId,
          playerId: this.playerId,
          tile: { x, y },
          buildingType: type,
        })
      );
    },
    abilityReady() {
      return Date.now() >= this.abilityReadyAt;
    },
    startTargeting(ability: string) {
      this.targetingAbility = ability;
    },
    toggleRallyMode() {
      this.rallyMode = !this.rallyMode;
    },
    setHoveredTile(tile: { x: number; y: number } | null) {
      this.hoveredTile = tile;
    },
    disconnect() {
      this.ws?.close();
      this.ws = null;
      this.phase = "idle";
      this.tiles = [];
      this.units = [];
      this.buildings = [];
      this.projectiles = [];
      this.resources = [];
      this.matchId = "";
      this.lastError = "";
    },
    setPlayerColor(color: "pink" | "green" | "violet" | "yellow") {
      this.playerColor = color;
    },
  },
});
