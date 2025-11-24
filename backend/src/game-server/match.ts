import { WebSocket } from "ws";
import { Logger } from "../types.js";
import { TileState } from "./entities/tile.js";
import { UnitState } from "./entities/unit.js";
import { BuildingState } from "./entities/building.js";
import { v4 as uuid } from "uuid";

interface PlayerConnection {
  id: string;
  socket: WebSocket;
}

export class Match {
  private players: PlayerConnection[] = [];
  private tiles: TileState[] = [];
  private units: UnitState[] = [];
  private buildings: BuildingState[] = [];
  private spawnCooldown = new Map<string, number>();
  private tick = 0;

  constructor(
    private id: string,
    private logger: Logger
  ) {
    this.tiles = this.createDemoTiles();
  }

  addPlayer(socket: WebSocket, playerId: string) {
    this.players.push({ id: playerId, socket });
    if (!this.buildings.some((b) => b.owner === playerId && b.type === "base")) {
      this.createBases(playerId);
      this.ensureAiOpponent();
    }
    socket.send(this.serializeState());
  }

  handleAbility(playerId: string, target: { x: number; y: number }) {
    const owned = this.tiles.find(
      (t) => t.owner === playerId && Math.abs(t.x - target.x) + Math.abs(t.y - target.y) <= 1
    );
    if (!owned) return;
    for (let i = 0; i < 3; i++) {
      this.units.push({
        id: uuid(),
        owner: playerId,
        type: "melee",
        x: owned.x,
        y: owned.y,
        hp: 100,
        targetX: target.x,
        targetY: target.y,
      });
    }
  }

  update(dt: number) {
    this.tick += 1;
    this.spawnSystem(dt);
    this.movementSystem(dt);
    this.combatSystem();
    this.captureSystem(dt);
    this.cleanupUnits();
    if (this.tick % 2 === 0) {
      this.broadcastState();
    }
  }

  private broadcastState() {
    this.broadcast(JSON.parse(this.serializeState()));
  }

  private broadcast(message: unknown) {
    const payload = typeof message === "string" ? message : JSON.stringify(message);
    for (const player of this.players) {
      if (player.socket.readyState === player.socket.OPEN) {
        player.socket.send(payload);
      }
    }
  }

  private serializeState() {
    return JSON.stringify({
      type: "match_state",
      tick: this.tick,
      tiles: this.tiles,
      units: this.units,
      buildings: this.buildings,
      players: this.players.map((p) => ({ id: p.id })),
    });
  }

  private createDemoTiles(): TileState[] {
    const size = 10;
    const tiles: TileState[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        tiles.push({ x, y, owner: null, type: "plain", capture: 0 });
      }
    }
    return tiles;
  }

  private createBases(playerId: string) {
    const spawn = this.findSpawnSpot(playerId);
    const base: BuildingState = {
      id: uuid(),
      owner: playerId,
      type: "base",
      x: spawn.x,
      y: spawn.y,
      hp: 1000,
      level: 1,
    };
    this.buildings.push(base);
    const tile = this.getTile(spawn.x, spawn.y);
    if (tile) tile.owner = playerId;
  }

  private ensureAiOpponent() {
    const aiId = "ai";
    if (!this.buildings.some((b) => b.owner === aiId)) {
      this.createBases(aiId);
    }
  }

  private findSpawnSpot(playerId: string) {
    if (playerId === "ai") return { x: 8, y: 8 };
    return { x: 1, y: 1 };
  }

  private spawnSystem(dt: number) {
    for (const b of this.buildings) {
      const key = b.id;
      const current = this.spawnCooldown.get(key) ?? 0;
      const next = current - dt;
      if (next <= 0) {
        this.units.push({
          id: uuid(),
          owner: b.owner,
          type: "melee",
          x: b.x,
          y: b.y,
          hp: 100,
          targetX: b.owner === "ai" ? 1 : 8,
          targetY: b.owner === "ai" ? 1 : 8,
        });
        this.spawnCooldown.set(key, 1.5);
      } else {
        this.spawnCooldown.set(key, next);
      }
    }
  }

  private movementSystem(dt: number) {
    const speed = 3;
    for (const unit of this.units) {
      const dx = unit.targetX - unit.x;
      const dy = unit.targetY - unit.y;
      if (Math.abs(dx) + Math.abs(dy) === 0) {
        const target = this.pickNewTarget(unit.owner, unit.x, unit.y);
        unit.targetX = target.x;
        unit.targetY = target.y;
        continue;
      }
      const step = speed * dt;
      if (Math.abs(dx) > Math.abs(dy)) {
        unit.x += Math.sign(dx) * step;
      } else if (dy !== 0) {
        unit.y += Math.sign(dy) * step;
      }
      unit.x = Math.max(0, Math.min(9, unit.x));
      unit.y = Math.max(0, Math.min(9, unit.y));
    }
  }

  private pickNewTarget(owner: string, x: number, y: number) {
    const enemyTile = this.tiles.find((t) => t.owner && t.owner !== owner);
    if (enemyTile) return { x: enemyTile.x, y: enemyTile.y };
    const neutral = this.tiles.find((t) => !t.owner);
    if (neutral) return { x: neutral.x, y: neutral.y };
    return { x, y };
  }

  private combatSystem() {
    const tileBuckets = new Map<string, UnitState[]>();
    for (const unit of this.units) {
      const key = `${Math.round(unit.x)}-${Math.round(unit.y)}`;
      const bucket = tileBuckets.get(key) ?? [];
      bucket.push(unit);
      tileBuckets.set(key, bucket);
    }
    for (const bucket of tileBuckets.values()) {
      const owners = new Set(bucket.map((u) => u.owner));
      if (owners.size <= 1) continue;
      for (const unit of bucket) {
        unit.hp -= 50;
      }
    }
  }

  private captureSystem(dt: number) {
    const ownershipDelta = new Map<string, number>();
    for (const unit of this.units) {
      const tile = this.getTile(Math.round(unit.x), Math.round(unit.y));
      if (!tile) continue;
      const key = `${tile.x}-${tile.y}`;
      const delta = ownershipDelta.get(key) ?? 0;
      ownershipDelta.set(key, delta + (unit.owner === tile.owner ? 0 : 10 * dt));
    }
    for (const [key, delta] of ownershipDelta) {
      const [xStr, yStr] = key.split("-");
      const tile = this.getTile(Number(xStr), Number(yStr));
      if (!tile) continue;
      tile.capture += delta;
      if (tile.capture >= 100) {
        tile.owner = this.dominantOwnerAtTile(tile.x, tile.y);
        tile.capture = 0;
      }
    }
  }

  private dominantOwnerAtTile(x: number, y: number) {
    const units = this.units.filter(
      (u) => Math.round(u.x) === x && Math.round(u.y) === y
    );
    if (units.length === 0) return null;
    const counts = new Map<string, number>();
    for (const u of units) {
      counts.set(u.owner, (counts.get(u.owner) ?? 0) + 1);
    }
    let best: string | null = null;
    let bestCount = 0;
    for (const [owner, count] of counts) {
      if (count > bestCount) {
        best = owner;
        bestCount = count;
      }
    }
    return best;
  }

  private cleanupUnits() {
    this.units = this.units.filter((u) => u.hp > 0 && u.x >= 0 && u.y >= 0 && u.x <= 9 && u.y <= 9);
  }

  private getTile(x: number, y: number) {
    return this.tiles.find((t) => t.x === x && t.y === y);
  }
}
