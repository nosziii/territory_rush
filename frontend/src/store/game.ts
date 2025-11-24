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
}

export const useGameStore = defineStore("game", {
  state: () => ({
    matchId: "",
    playerId: "player",
    phase: "idle" as MatchPhase,
    tiles: [] as TileState[],
    units: [] as UnitState[],
    ws: null as WebSocket | null,
    tick: 0,
    lastError: "",
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
        console.info("WS message", message);
        if (message.type === "match_state") {
          this.tick = message.tick;
          this.tiles = message.tiles ?? [];
          this.units = message.units ?? [];
          this.phase = "running";
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
    sendAbility(x: number, y: number) {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      this.ws.send(
        JSON.stringify({
          type: "ability_use",
          matchId: this.matchId,
          playerId: this.playerId,
          target: { x, y },
        })
      );
    },
    disconnect() {
      this.ws?.close();
      this.ws = null;
      this.phase = "idle";
      this.tiles = [];
      this.units = [];
      this.matchId = "";
    },
  },
});
