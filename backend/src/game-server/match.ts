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

  handleAbility(playerId: string, target: { x: number; y: number }, ability = "reinforce") {
    const owned = this.tiles.find(
      (t) => t.owner === playerId && Math.abs(t.x - target.x) + Math.abs(t.y - target.y) <= 1
    );
    if (!owned) return;
    if (ability === "reinforce") {
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
          dmg: 26,
          range: 1,
        });
      }
    } else if (ability === "artillery") {
      // area damage and visual projectiles
      this.projectiles.push({
        id: uuid(),
        owner: playerId,
        x: target.x,
        y: target.y - 2,
        targetX: target.x,
        targetY: target.y,
        ttl: 0.4,
      });
      const radius = 2;
      this.units.forEach((u) => {
        const dist = Math.hypot(u.x - target.x, u.y - target.y);
        if (dist <= radius) {
          u.hp -= 80;
        }
      });
      this.buildings.forEach((b) => {
        const dist = Math.hypot(b.x - target.x, b.y - target.y);
        if (dist <= radius) {
          b.hp -= 120;
        }
      });
    } else if (ability === "heal") {
      const radius = 2;
      this.units.forEach((u) => {
        if (u.owner !== playerId) return;
        const dist = Math.hypot(u.x - target.x, u.y - target.y);
        if (dist <= radius) {
          u.hp = Math.min(u.hp + 60, 140);
        }
      });
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
    const size = 16;
    const tiles: TileState[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const type = this.pickTileType(x, y, size);
        tiles.push({
          x,
          y,
          owner: null,
          type,
          capture: 0,
          height: this.randomHeight(),
          walkable: type !== "water",
        });
      }
    }
    return tiles;
  }

  private pickTileType(x: number, y: number, size: number): TileType {
    const waterBorder = x === 0 || y === 0 || x === size - 1 || y === size - 1;
    if (waterBorder) return "water";
    if ((x + y) % 11 === 0) return "defense";
    if ((x * y) % 13 === 0) return "resource";
    return "plain";
  }

  private randomHeight() {
    return Math.random() > 0.8 ? 2 : 1;
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
    // Basic build order: mine and turret around base if possible
    const neighbors = [
      { x: spawn.x + 1, y: spawn.y },
      { x: spawn.x, y: spawn.y + 1 },
      { x: spawn.x - 1, y: spawn.y },
    ];
    const mineSpot = neighbors.find((n) => this.isWalkable(n.x, n.y));
    const turretSpot = neighbors.find((n) => this.isWalkable(n.x, n.y + 1));
    if (mineSpot) {
      this.buildings.push({
        id: uuid(),
        owner: playerId,
        type: "mine",
        x: mineSpot.x,
        y: mineSpot.y,
        hp: 600,
        level: 1,
      });
    }
    if (turretSpot) {
      this.buildings.push({
        id: uuid(),
        owner: playerId,
        type: "turret",
        x: turretSpot.x,
        y: turretSpot.y,
        hp: 500,
        level: 1,
      });
    }
    const tile = this.getTile(spawn.x, spawn.y);
    if (tile) tile.owner = playerId;
    // Place dock if adjacent water
    const waterAdj = this.findAdjacentOfType(spawn.x, spawn.y, "water");
    if (waterAdj) {
      this.buildings.push({
        id: uuid(),
        owner: playerId,
        type: "dock",
        x: waterAdj.x,
        y: waterAdj.y,
        hp: 500,
        level: 1,
      });
      const dockTile = this.getTile(waterAdj.x, waterAdj.y);
      if (dockTile) dockTile.owner = playerId;
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
    const positions: Record<string, { x: number; y: number }> = {
      player: { x: 2, y: 2 },
      ai1: { x: 13, y: 13 },
      ai2: { x: 2, y: 13 },
      ai3: { x: 13, y: 2 },
    };
    return positions[playerId] ?? { x: 2, y: 2 };
  }

  private spawnSystem(dt: number) {
    for (const b of this.buildings) {
      const key = b.id;
      const current = this.spawnCooldown.get(key) ?? 0;
      const next = current - dt;
      if (next <= 0) {
        const target = this.pickBaseTarget(b.owner);
        const isShip = b.type === "dock" || (b.owner.includes("ai") && Math.random() > 0.6);
        this.units.push({
          id: uuid(),
          owner: b.owner,
          type: isShip ? "ship" : b.owner.includes("ai") ? "ranged" : "melee",
          x: b.x,
          y: b.y,
          hp: isShip ? 140 : 100,
          targetX: target.x,
          targetY: target.y,
          dmg: isShip ? 24 : b.owner.includes("ai") ? 28 : 22,
          range: isShip ? 3 : b.owner.includes("ai") ? 2.5 : 1,
          canSail: isShip,
          speed: isShip ? 3.5 : 2.5,
        });
        this.spawnCooldown.set(key, isShip ? 3.5 : 2.2);
      } else {
        this.spawnCooldown.set(key, next);
      }
    }
  }

  private pickBaseTarget(owner: string) {
    const enemies = this.buildings.filter((b) => b.owner !== owner && b.type === "base");
    const choice = enemies[Math.floor(Math.random() * enemies.length)];
    return choice ? { x: choice.x, y: choice.y } : { x: 7, y: 7 };
  }

  private movementSystem(dt: number) {
    for (const unit of this.units) {
      const dx = unit.targetX - unit.x;
      const dy = unit.targetY - unit.y;
      if (Math.abs(dx) + Math.abs(dy) === 0) {
        const target = this.pickNewTarget(unit.owner, unit.x, unit.y);
        unit.targetX = target.x;
        unit.targetY = target.y;
        continue;
      }
      const step = (unit.speed ?? 3.5) * dt;
      const next = this.nextStepToward(unit, { x: unit.targetX, y: unit.targetY });
      const nextTile = this.getTile(Math.round(next.x), Math.round(next.y));
      if (nextTile && (nextTile.walkable || unit.canSail)) {
        unit.x = Math.max(0, Math.min(13, next.x + Math.sign(dx) * step));
        unit.y = Math.max(0, Math.min(13, next.y + Math.sign(dy) * step));
      } else {
        const newTarget = this.findNearestWalkable(unit);
        unit.targetX = newTarget.x;
        unit.targetY = newTarget.y;
      }
    }
  }

  private pickNewTarget(owner: string, x: number, y: number) {
    const enemyTile = this.tiles.find((t) => t.owner && t.owner !== owner && t.type !== "water");
    if (enemyTile) return { x: enemyTile.x, y: enemyTile.y };
    const neutral = this.tiles.find((t) => !t.owner && t.type !== "water");
    if (neutral) return { x: neutral.x, y: neutral.y };
    return { x, y };
  }

  private findNearestWalkable(unit: UnitState) {
    const neighbors = [
      { x: unit.x + 1, y: unit.y },
      { x: unit.x - 1, y: unit.y },
      { x: unit.x, y: unit.y + 1 },
      { x: unit.x, y: unit.y - 1 },
    ];
    const walk = neighbors.find((n) => {
      const t = this.getTile(Math.round(n.x), Math.round(n.y));
      return t && (t.walkable || unit.canSail);
    });
    return walk ?? { x: unit.x, y: unit.y };
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
      const [xStr, yStr] = key.split("-");
      const cx = Number(xStr);
      const cy = Number(yStr);
      for (const unit of bucket) {
        unit.hp -= 30;
        this.projectiles.push({
          id: uuid(),
          owner: unit.owner,
          x: unit.x,
          y: unit.y,
          targetX: cx,
          targetY: cy,
          ttl: 0.3,
        });
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
      ownershipDelta.set(key, delta + (unit.owner === tile.owner ? 0 : 6 * dt));
    }
    for (const [key, delta] of ownershipDelta) {
      const [xStr, yStr] = key.split("-");
      const tile = this.getTile(Number(xStr), Number(yStr));
      if (!tile) continue;
      tile.capture += delta;
      if (tile.capture >= 80) {
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
    this.units = this.units.filter((u) => u.hp > 0 && u.x >= 0 && u.y >= 0 && u.x <= 13 && u.y <= 13);
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
    const gain = 5 * dt;
    for (const b of this.buildings) {
      this.resources.set(b.owner, (this.resources.get(b.owner) ?? 0) + gain);
    }
  }

  private serializeResources(): ResourceState[] {
    return Array.from(this.resources.entries()).map(([owner, gold]) => ({
      owner,
      gold: Math.round(gold),
    }));
  }

  private isWalkable(x: number, y: number) {
    const tile = this.getTile(x, y);
    return tile ? tile.walkable : false;
  }

  private findAdjacentOfType(x: number, y: number, type: TileType): Target | null {
    const dirs = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ];
    for (const d of dirs) {
      const t = this.getTile(d.x, d.y);
      if (t && t.type === type) return { x: d.x, y: d.y };
    }
    return null;
  }

  private nextStepToward(unit: UnitState, target: Target) {
    const start = { x: Math.round(unit.x), y: Math.round(unit.y) };
    const goal = { x: Math.round(target.x), y: Math.round(target.y) };
    const queue: Target[] = [start];
    const visited = new Set<string>([`${start.x}-${start.y}`]);
    const parent = new Map<string, Target>();
    const neighbors = (p: Target) => [
      { x: p.x + 1, y: p.y },
      { x: p.x - 1, y: p.y },
      { x: p.x, y: p.y + 1 },
      { x: p.x, y: p.y - 1 },
    ];
    while (queue.length) {
      const current = queue.shift()!;
      if (current.x === goal.x && current.y === goal.y) break;
      for (const n of neighbors(current)) {
        const key = `${n.x}-${n.y}`;
        if (visited.has(key)) continue;
        const t = this.getTile(n.x, n.y);
        if (!t || (!t.walkable && !unit.canSail)) continue;
        visited.add(key);
        parent.set(key, current);
        queue.push(n);
      }
    }
    const goalKey = `${goal.x}-${goal.y}`;
    if (!parent.has(goalKey)) return start;
    let step = goal;
    while (parent.has(`${step.x}-${step.y}`) && parent.get(`${step.x}-${step.y}`)!.x !== start.x) {
      const prev = parent.get(`${step.x}-${step.y}`)!;
      if (prev.x === start.x && prev.y === start.y) break;
      step = prev;
    }
    return step;
  }
}
