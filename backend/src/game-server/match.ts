import { WebSocket } from "ws";
import { Logger } from "../types.js";
import { TileState, TileType } from "./entities/tile.js";
import { UnitState } from "./entities/unit.js";
import { BuildingState } from "./entities/building.js";
import { v4 as uuid } from "uuid";

interface PlayerConnection {
  id: string;
  socket: WebSocket;
}

interface Projectile {
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

interface Target {
  x: number;
  y: number;
}

export class Match {
  private players: PlayerConnection[] = [];
  private tiles: TileState[] = [];
  private units: UnitState[] = [];
  private buildings: BuildingState[] = [];
  private spawnCooldown = new Map<string, number>();
  private factionOrder = ["player", "ai1", "ai2", "ai3"];
  private projectiles: Projectile[] = [];
  private resources = new Map<string, number>();
  private tick = 0;

  // Game Constants
  private readonly MAP_SIZE = 32;
  private readonly TICK_RATE = 100; // ms

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
      this.ensureAiOpponents();
    }
    socket.send(this.serializeState());
  }

  handleBuild(playerId: string, x: number, y: number, type: string) {
    const tile = this.getTile(x, y);
    if (!tile || tile.owner !== playerId || tile.type === "water") return;
    if (this.buildings.some((b) => Math.round(b.x) === x && Math.round(b.y) === y)) return;

    const cost = this.getBuildingCost(type);
    const currentGold = this.resources.get(playerId) ?? 0;
    if (currentGold < cost) return;

    this.resources.set(playerId, currentGold - cost);

    this.buildings.push({
      id: uuid(),
      owner: playerId,
      type: type as any, // Trust the client input or validate it properly against BuildingType
      x: x,
      y: y,
      hp: 400,
      level: 1,
    });
    this.logEvent(`Player built ${type} at ${x},${y}`, "build");
  }

  private getBuildingCost(type: string) {
    switch (type) {
      case "barracks": return 150;
      case "archery": return 200;
      case "turret": return 250;
      case "mine": return 100;
      default: return 9999;
    }
  }

  handleAbility(playerId: string, target: { x: number; y: number }, ability = "reinforce") {
    const owned = this.tiles.find(
      (t) => t.owner === playerId && Math.abs(t.x - target.x) + Math.abs(t.y - target.y) <= 2
    );
    if (!owned && ability !== "artillery") return; // Artillery can target anywhere

    if (ability === "reinforce") {
      // Spawn a squad
      for (let i = 0; i < 4; i++) {
        this.units.push({
          id: uuid(),
          owner: playerId,
          type: "melee",
          x: owned!.x,
          y: owned!.y,
          hp: 100,
          targetX: target.x,
          targetY: target.y,
          dmg: 20,
          range: 1,
          speed: 1.5, // Slower units
        });
      }
      this.logEvent(`Reinforcements deployed at ${owned!.x},${owned!.y}`, "combat");
    } else if (ability === "artillery") {
      this.projectiles.push({
        id: uuid(),
        owner: playerId,
        x: target.x,
        y: target.y - 5,
        targetX: target.x,
        targetY: target.y,
        ttl: 0.6,
      });
      // Delayed damage logic would be better, but instant for MVP
      const radius = 3;
      this.units.forEach((u) => {
        const dist = Math.hypot(u.x - target.x, u.y - target.y);
        if (dist <= radius) {
          u.hp -= 100;
        }
      });
      this.logEvent(`Artillery strike at ${target.x},${target.y}`, "combat");
    }
  }

  update(dt: number) {
    this.tick += 1;
    this.spawnSystem(dt);
    this.movementSystem(dt);
    this.combatSystem();
    this.updateProjectiles(dt);
    this.captureSystem(dt);
    this.cleanupUnits();
    this.resourceTick(dt);
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
      projectiles: this.projectiles,
      resources: this.serializeResources(),
      players: this.players.map((p) => ({ id: p.id })),
    });
  }

  private createDemoTiles(): TileState[] {
    const size = this.MAP_SIZE;
    const tiles: TileState[] = [];
    // Simple Perlin-ish noise or just random clusters for terrain
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const type = this.pickTileType(x, y, size);
        tiles.push({
          x,
          y,
          owner: null,
          type,
          capture: 0,
          height: this.randomHeight(x, y),
          walkable: type !== "water",
        });
      }
    }
    return tiles;
  }

  private pickTileType(x: number, y: number, size: number): TileType {
    // More organic map generation
    const dx = x - size / 2;
    const dy = y - size / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Island shape (Larger island, almost filling map)
    if (dist > size / 2 - 1) return "water"; // Only 1 tile border of water

    // Random lakes (Reduced chance)
    if (Math.random() > 0.98) return "water";

    if ((x + y) % 13 === 0) return "defense";
    if ((x * y) % 17 === 0) return "resource";
    return "plain";
  }

  private randomHeight(x: number, y: number) {
    // Hills in center
    const dist = Math.hypot(x - 16, y - 16);
    if (dist < 8 && Math.random() > 0.6) return 2;
    return 1;
  }

  private createBases(playerId: string) {
    const spawn = this.findSpawnSpot(playerId);
    const base: BuildingState = {
      id: uuid(),
      owner: playerId,
      type: "base",
      x: spawn.x,
      y: spawn.y,
      hp: 2000,
      level: 1,
    };
    this.buildings.push(base);

    // Initial resources
    this.resources.set(playerId, 400);

    // Initial territory
    const radius = 2;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const t = this.getTile(spawn.x + dx, spawn.y + dy);
        if (t && t.type !== "water") {
          t.owner = playerId;
        }
      }
    }
  }

  private ensureAiOpponents() {
    for (const faction of this.factionOrder.slice(1)) {
      if (!this.buildings.some((b) => b.owner === faction)) {
        this.createBases(faction);
      }
    }
  }

  private findSpawnSpot(playerId: string) {
    const margin = 4;
    const max = this.MAP_SIZE - margin;
    const positions: Record<string, { x: number; y: number }> = {
      player: { x: margin, y: margin },
      ai1: { x: max, y: max },
      ai2: { x: margin, y: max },
      ai3: { x: max, y: margin },
    };
    return positions[playerId] ?? { x: margin, y: margin };
  }

  private spawnSystem(dt: number) {
    for (const b of this.buildings) {
      const key = b.id;
      const current = this.spawnCooldown.get(key) ?? 0;
      const next = current - dt;

      // Slower spawn rates for strategic feel
      let cooldown = 5.0;
      let unitType: UnitState["type"] = "melee";

      if (b.type === "barracks") { cooldown = 4.0; unitType = "melee"; }
      else if (b.type === "archery") { cooldown = 6.0; unitType = "ranged"; }
      else if (b.type === "base") { cooldown = 8.0; unitType = "melee"; }
      else if (b.type === "dock") { cooldown = 10.0; unitType = "ship"; }
      else { continue; } // Mines/Turrets don't spawn

      if (next <= 0) {
        const target = this.pickBaseTarget(b.owner);
        this.units.push({
          id: uuid(),
          owner: b.owner,
          type: unitType,
          x: b.x,
          y: b.y,
          hp: unitType === "ship" ? 200 : 100,
          targetX: target.x,
          targetY: target.y,
          dmg: unitType === "ranged" ? 30 : 20,
          range: unitType === "ranged" ? 3 : 1,
          canSail: unitType === "ship",
          speed: unitType === "ship" ? 2.0 : 1.2, // Slower movement
        });
        this.spawnCooldown.set(key, cooldown);
      } else {
        this.spawnCooldown.set(key, next);
      }
    }
  }

  private pickBaseTarget(owner: string) {
    // AI Logic: Attack nearest enemy building or expand to neutral
    const enemies = this.buildings.filter((b) => b.owner !== owner);
    if (enemies.length > 0 && Math.random() > 0.3) {
      // Attack random enemy
      const choice = enemies[Math.floor(Math.random() * enemies.length)];
      return { x: choice.x, y: choice.y };
    }
    // Expand
    return { x: this.MAP_SIZE / 2, y: this.MAP_SIZE / 2 }; // Go to center if nothing else
  }

  private movementSystem(dt: number) {
    for (const unit of this.units) {
      const dx = unit.targetX - unit.x;
      const dy = unit.targetY - unit.y;

      // If at target, pick new one
      if (Math.abs(dx) + Math.abs(dy) < 0.5) {
        const target = this.pickNewTarget(unit.owner, unit.x, unit.y);
        unit.targetX = target.x;
        unit.targetY = target.y;
        continue;
      }

      const step = (unit.speed ?? 1.5) * dt;
      const next = this.nextStepToward(unit, { x: unit.targetX, y: unit.targetY });

      // Separation Force: Push away from nearby units
      let sepX = 0;
      let sepY = 0;
      for (const other of this.units) {
        if (other === unit) continue;
        const distSq = (unit.x - other.x) ** 2 + (unit.y - other.y) ** 2;
        if (distSq < 0.25) { // Too close (0.5 radius)
          const dist = Math.sqrt(distSq) || 0.01;
          const push = (0.5 - dist) / dist; // Stronger as they get closer
          sepX += (unit.x - other.x) * push;
          sepY += (unit.y - other.y) * push;
        }
      }

      // Apply movement + separation
      const tx = next.x;
      const ty = next.y;
      const moveX = tx - unit.x;
      const moveY = ty - unit.y;
      const dist = Math.sqrt(moveX * moveX + moveY * moveY) || 1;

      // Normalize move vector
      const dirX = moveX / dist;
      const dirY = moveY / dist;

      // Combine (80% goal, 20% separation)
      const finalX = dirX + sepX * 2.0;
      const finalY = dirY + sepY * 2.0;

      // Normalize final vector
      const finalDist = Math.sqrt(finalX * finalX + finalY * finalY) || 1;

      unit.x += (finalX / finalDist) * step;
      unit.y += (finalY / finalDist) * step;

      // Clamp to map
      unit.x = Math.max(0, Math.min(this.MAP_SIZE - 0.1, unit.x));
      unit.y = Math.max(0, Math.min(this.MAP_SIZE - 0.1, unit.y));
    }
  }

  private pickNewTarget(owner: string, x: number, y: number) {
    // Simple AI: Find nearest unowned or enemy tile
    // Optimization: Don't scan whole map, just local area
    const range = 8;
    let best = { x, y };
    let minScore = 9999;

    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const tx = Math.round(x + dx);
        const ty = Math.round(y + dy);
        const t = this.getTile(tx, ty);
        if (!t || t.type === "water") continue;

        let score = Math.abs(dx) + Math.abs(dy);
        if (t.owner !== owner) score -= 5; // Prefer expanding/attacking
        if (t.owner && t.owner !== owner) score -= 10; // Prefer attacking enemy

        if (score < minScore) {
          minScore = score;
          best = { x: tx, y: ty };
        }
      }
    }
    return best;
  }

  private findNearestWalkable(unit: UnitState) {
    // Fallback if stuck
    return { x: unit.x, y: unit.y };
  }

  private combatSystem() {
    const tileBuckets = new Map<string, UnitState[]>();
    for (const unit of this.units) {
      const key = `${Math.round(unit.x)}-${Math.round(unit.y)}`;
      const bucket = tileBuckets.get(key) ?? [];
      bucket.push(unit);
      tileBuckets.set(key, bucket);
    }
    for (const [key, bucket] of tileBuckets.entries()) {
      const owners = new Set(bucket.map((u) => u.owner));
      if (owners.size <= 1) continue;

      // Combat logic: units damage each other
      for (const unit of bucket) {
        // Find enemy in same tile
        const enemy = bucket.find(u => u.owner !== unit.owner);
        if (enemy) {
          enemy.hp -= (unit.dmg ?? 10) * 0.1; // DPS
        }
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
      // Capture slower
      ownershipDelta.set(key, delta + (unit.owner === tile.owner ? 0 : 2 * dt));
    }
    for (const [key, delta] of ownershipDelta) {
      const [xStr, yStr] = key.split("-");
      const tile = this.getTile(Number(xStr), Number(yStr));
      if (!tile) continue;
      tile.capture += delta;
      if (tile.capture >= 100) { // Harder to capture
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
    return units[0].owner; // Simplified
  }

  private cleanupUnits() {
    this.units = this.units.filter((u) => u.hp > 0 && u.x >= 0 && u.y >= 0 && u.x < this.MAP_SIZE && u.y < this.MAP_SIZE);
    this.projectiles = this.projectiles.filter((p) => p.ttl > 0);
  }

  private getTile(x: number, y: number) {
    return this.tiles.find((t) => t.x === x && t.y === y);
  }

  private updateProjectiles(dt: number) {
    for (const p of this.projectiles) {
      p.ttl -= dt;
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      p.x += dx * dt * 5;
      p.y += dy * dt * 5;
    }
  }

  private resourceTick(dt: number) {
    const gain = 50 * dt; // Increased from 10 to 50
    for (const b of this.buildings) {
      // Mines give extra
      const bonus = b.type === "mine" ? 30 * dt : 0;
      this.resources.set(b.owner, (this.resources.get(b.owner) ?? 0) + gain + bonus);
    }
  }

  private logEvent(message: string, type: "info" | "combat" | "build" = "info") {
    this.broadcast({
      type: "event_log",
      message,
      category: type,
      timestamp: Date.now()
    });
  }

  private serializeResources(): ResourceState[] {
    return Array.from(this.resources.entries()).map(([owner, gold]) => ({
      owner,
      gold: Math.round(gold),
    }));
  }

  private nextStepToward(unit: UnitState, target: Target) {
    // Simplified pathfinding for open map
    return target;
  }
}

