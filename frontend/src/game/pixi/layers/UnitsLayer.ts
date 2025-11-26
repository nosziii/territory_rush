
import { Application, Graphics, Container } from "pixi.js";
import { getTheme, type PlayerColor } from "../theme";

let layer: Container | null = null;

export function drawUnits(
  app: Application | Container,
  units: { x: number; y: number; owner: string; hp: number; type?: string }[],
  playerColor: PlayerColor
) {
  if (!units || !Array.isArray(units)) return;

  const theme = getTheme(playerColor);
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

    const color = getUnitColor(unit.owner, theme);
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

function getUnitColor(owner: string, theme: any) {
    switch (owner) {
        case "player": return theme.player.main;
        case "ai1": return theme.ai1.main;
        case "ai2": return theme.ai2.main;
        case "ai3": return theme.ai3.main;
        default: return theme.neutral.main;
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
    // Body/Armor
    g.rect(x - 5, y - 8, 10, 12).fill(color).stroke({ color: 0xffffff, width: 1 });
    // Head/Helmet
    g.circle(x, y - 10, 4).fill(0xcccccc).stroke({ color: 0x000000, width: 1 });
    // Shield
    g.poly([x - 4, y - 2, x - 8, y - 2, x - 8, y + 6, x - 4, y + 8]).fill(0x888888).stroke({ color: 0xffffff, width: 1 });
    // Sword
    g.rect(x + 6, y - 6, 2, 12).fill(0xdddddd);
    g.rect(x + 4, y + 2, 6, 2).fill(0x666666); // Hilt
}

function drawRanged(g: Graphics, x: number, y: number, color: number) {
    // Body (Lighter armor)
    g.poly([x, y - 10, x + 5, y + 5, x - 5, y + 5]).fill(color);
    // Head (Hood)
    g.poly([x, y - 12, x + 4, y - 8, x - 4, y - 8]).fill(color);
    // Bow
    g.arc(x + 4, y, 8, -Math.PI / 2, Math.PI / 2).stroke({ color: 0x8b4513, width: 2 });
    // Arrow
    g.moveTo(x + 4, y).lineTo(x + 12, y).stroke({ color: 0xffffff, width: 1 });
}

function drawTank(g: Graphics, x: number, y: number, color: number) {
    // Tracks
    g.roundRect(x - 12, y - 8, 4, 16, 2).fill(0x333333);
    g.roundRect(x + 8, y - 8, 4, 16, 2).fill(0x333333);
    // Body
    g.rect(x - 8, y - 6, 16, 12).fill(color).stroke({ color: 0xffffff, width: 1 });
    // Turret
    g.circle(x, y - 2, 5).fill(0x555555).stroke({ color: 0xffffff, width: 1 });
    // Barrel
    g.rect(x, y - 3, 14, 3).fill(0x333333);
}

function drawMage(g: Graphics, x: number, y: number, color: number) {
    // Robe
    g.poly([x, y - 12, x + 6, y + 8, x - 6, y + 8]).fill(color);
    // Staff
    g.rect(x + 6, y - 12, 2, 22).fill(0x8b4513);
    // Magic Orb
    g.circle(x + 7, y - 14, 3).fill(0x60a5fa);
    g.circle(x + 7, y - 14, 5).stroke({ color: 0x60a5fa, width: 1, alpha: 0.5 });
}

function drawAir(g: Graphics, x: number, y: number, color: number) {
    // Shadow on ground
    g.ellipse(x, y + 20, 12, 6).fill({ color: 0x000000, alpha: 0.2 });
    
    // Plane Body
    g.poly([x, y - 10, x + 4, y, x, y + 8, x - 4, y]).fill(color).stroke({ color: 0xffffff, width: 1 });
    // Wings
    g.poly([x - 4, y - 2, x - 14, y + 4, x - 4, y + 6]).fill(color);
    g.poly([x + 4, y - 2, x + 14, y + 4, x + 4, y + 6]).fill(color);
}

function drawShip(g: Graphics, x: number, y: number, color: number) {
    // Water ripples
    g.arc(x, y + 8, 10, 0, Math.PI).stroke({ color: 0xffffff, width: 1, alpha: 0.3 });
    
    // Hull
    g.poly([x - 10, y - 2, x + 10, y - 2, x + 6, y + 6, x - 6, y + 6]).fill(color).stroke({ color: 0xffffff, width: 1 });
    // Mast & Sail
    g.rect(x - 1, y - 14, 2, 12).fill(0x8b4513);
    g.poly([x, y - 14, x + 10, y - 8, x, y - 4]).fill(0xffffff);
}

