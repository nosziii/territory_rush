
import { Application, Graphics, Container } from "pixi.js";

let layer: Container | null = null;

// Palette (Synced with TilesLayer)
const PALETTE = {
  player: 0xf472b6, // Pink 400
  ai1: 0x4ade80, // Green 400
  ai2: 0xa78bfa, // Violet 400
  ai3: 0xfacc15, // Yellow 400
  neutral: 0x94a3b8,
};

export function drawUnits(
  app: Application | Container,
  units: { x: number; y: number; owner: string; hp: number; type?: string }[]
) {
  if (!units || !Array.isArray(units)) return;

  const parent = app instanceof Application ? app.stage : app;

  if (!layer) {
    layer = new Container();
    parent.addChild(layer);
  } else if (layer.parent !== parent) {
    layer.parent?.removeChild(layer);
    parent.addChild(layer);
  }

  layer.removeChildren().forEach(c => c.destroy());

  const size = 44; // Synced with tile size
  
  units.forEach((unit) => {
    const g = new Graphics();
    layer!.addChild(g);

    const color = getColor(unit.owner);
    const cx = unit.x * size + size / 2;
    const cy = unit.y * size + size / 2 - 10; // -10 for elevation offset

    // Shadow blob
    g.ellipse(cx, cy + 14, 10, 6).fill({ color: 0x000000, alpha: 0.3 });

    if (unit.type === "ship") {
      drawShip(g, cx, cy, color);
    } else if (unit.type === "ranged") {
      drawRanged(g, cx, cy, color);
    } else if (unit.type === "tank") {
      drawTank(g, cx, cy, color);
    } else if (unit.type === "mage") {
      drawMage(g, cx, cy, color);
    } else if (unit.type === "air") {
      drawAir(g, cx, cy - 15, color); // Higher up
    } else {
      drawMelee(g, cx, cy, color);
    }

    // Health Bar
    const maxHp = getMaxHp(unit.type);
    const hpPercent = Math.max(0, Math.min(1, unit.hp / maxHp));
    
    if (hpPercent < 1) {
        const barWidth = 24;
        const barHeight = 4;
        const barX = cx - barWidth / 2;
        const barY = cy - 22;

        g.rect(barX, barY, barWidth, barHeight).fill({ color: 0x000000, alpha: 0.5 });
        const hpColor = hpPercent > 0.5 ? 0x22c55e : hpPercent > 0.25 ? 0xfacc15 : 0xef4444;
        g.rect(barX, barY, barWidth * hpPercent, barHeight).fill(hpColor);
    }
  });
}

function getColor(owner: string) {
    switch (owner) {
        case "player": return PALETTE.player;
        case "ai1": return PALETTE.ai1;
        case "ai2": return PALETTE.ai2;
        case "ai3": return PALETTE.ai3;
        default: return PALETTE.neutral;
    }
}

function getMaxHp(type?: string) {
    switch(type) {
        case 'tank': return 300;
        case 'ship': return 200;
        case 'mage': return 80;
        case 'air': return 150;
        case 'ranged': return 80;
        default: return 100;
    }
}

// --- Unit Drawers ---

function drawMelee(g: Graphics, x: number, y: number, color: number) {
    // Knight-like helmet shape
    g.rect(x - 6, y - 8, 12, 14).fill(color).stroke({ color: 0xffffff, width: 2 });
    // Visor
    g.rect(x - 4, y - 4, 8, 2).fill(0x000000);
    // Plume
    g.circle(x, y - 10, 3).fill(0xffffff);
}

function drawRanged(g: Graphics, x: number, y: number, color: number) {
    // Hooded figure (Triangle)
    g.poly([x, y - 12, x + 8, y + 8, x - 8, y + 8]).fill(color).stroke({ color: 0xffffff, width: 2 });
    // Bow
    g.arc(x + 4, y, 8, -Math.PI / 2, Math.PI / 2).stroke({ color: 0xffffff, width: 2 });
}

function drawTank(g: Graphics, x: number, y: number, color: number) {
    // Body
    g.rect(x - 10, y - 6, 20, 14).fill(color).stroke({ color: 0xffffff, width: 2 });
    // Turret
    g.circle(x, y - 2, 6).fill(0xffffff);
    // Barrel
    g.rect(x, y - 4, 12, 4).fill(0xffffff);
}

function drawMage(g: Graphics, x: number, y: number, color: number) {
    // Robe
    g.poly([x, y - 14, x + 6, y + 8, x - 6, y + 8]).fill(color);
    // Staff
    g.rect(x + 6, y - 10, 2, 20).fill(0xffffff);
    // Orb
    g.circle(x + 7, y - 12, 3).fill(0x60a5fa); // Glowing orb
}

function drawAir(g: Graphics, x: number, y: number, color: number) {
    // Plane/Drone shape
    g.poly([x, y - 8, x + 10, y + 4, x, y, x - 10, y + 4]).fill(color).stroke({ color: 0xffffff, width: 2 });
    // Propeller blur
    g.circle(x, y - 8, 8).fill({ color: 0xffffff, alpha: 0.2 });
}

function drawShip(g: Graphics, x: number, y: number, color: number) {
    // Hull
    g.poly([x - 10, y - 2, x + 10, y - 2, x + 6, y + 6, x - 6, y + 6]).fill(color).stroke({ color: 0xffffff, width: 2 });
    // Sail
    g.poly([x - 2, y - 4, x + 8, y - 4, x + 2, y - 16]).fill(0xffffff);
}

