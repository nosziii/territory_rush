
import { Application, Graphics, Container } from "pixi.js";

let layer: Container | null = null;

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

  // Clear previous children
  layer.removeChildren().forEach(c => c.destroy());

  const size = 40;
  const gap = 2;

  units.forEach((unit) => {
    const g = new Graphics();
    layer!.addChild(g);

    const color =
      unit.owner === "player"
        ? 0xf97316
        : unit.owner === "ai1"
          ? 0x06b6d4
          : unit.owner === "ai2"
            ? 0x8b5cf6
            : 0x10b981;

    const cx = unit.x * (size + gap) + size / 2;
    const cy = unit.y * (size + gap) + size / 2;

    // Draw Unit Shape
    if (unit.type === "ship") {
      // Ship shape (elongated hexagon-ish)
      g.poly([
        cx - 10, cy - 4,
        cx + 6, cy - 4,
        cx + 12, cy,
        cx + 6, cy + 4,
        cx - 10, cy + 4
      ]).fill(color).stroke({ color: 0xffffff, width: 1 });

      // Sail
      g.poly([cx - 4, cy - 4, cx + 4, cy - 4, cx, cy - 14]).fill(0xffffff);

    } else if (unit.type === "ranged") {
      // Star/Diamond for ranged
      g.poly([
        cx, cy - 10,
        cx + 8, cy,
        cx, cy + 10,
        cx - 8, cy
      ]).fill(color).stroke({ color: 0xffffff, width: 1 });

      // Inner dot
      g.circle(cx, cy, 3).fill(0xffffff);

    } else {
      // Triangle for melee (default)
      g.poly([
        cx, cy - 10,
        cx + 9, cy + 7,
        cx - 9, cy + 7
      ]).fill(color).stroke({ color: 0xffffff, width: 1 });
    }

    // Health Bar
    const hpPercent = Math.max(0, Math.min(1, unit.hp / 100)); // Assuming max HP 100 for base, scaled for others
    const barWidth = 24;
    const barHeight = 4;
    const barX = cx - barWidth / 2;
    const barY = cy - 18;

    // Background
    g.rect(barX, barY, barWidth, barHeight).fill(0x000000);
    // Health
    const hpColor = hpPercent > 0.5 ? 0x22c55e : hpPercent > 0.25 ? 0xfacc15 : 0xef4444;
    g.rect(barX, barY, barWidth * hpPercent, barHeight).fill(hpColor);
  });
}

