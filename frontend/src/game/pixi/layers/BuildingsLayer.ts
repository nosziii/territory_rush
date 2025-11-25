import { Application, Graphics } from "pixi.js";

let layer: Graphics | null = null;

export function drawBuildings(
  app: Application,
  buildings: { x: number; y: number; owner: string; type: string }[]
) {
  if (!buildings || !Array.isArray(buildings)) return;
  if (!layer) {
    layer = new Graphics();
    app.stage.addChild(layer);
  }
  const size = 40;
  layer.clear();
  buildings.forEach((b) => {
    const color =
      b.owner === "player"
        ? 0xfbbf24
        : b.owner === "ai1"
        ? 0x7dd3fc
        : b.owner === "ai2"
        ? 0xc4b5fd
        : 0xbbf7d0;
    const x = b.x * (size + 2) + 4;
    const y = b.y * (size + 2) + 4;
    const l = layer!;
    l.roundRect(x, y, size - 8, size - 8, 5).fill(color).stroke({ color: 0x0f172a, width: 2 });
    const iconColor = 0x0f172a;
    const cx = x + (size - 8) / 2;
    const cy = y + (size - 8) / 2;
    if (b.type === "base") {
      l.star(cx, cy, 4, 8, 12).fill(iconColor);
    } else if (b.type === "turret") {
      l.circle(cx, cy, 6).fill(iconColor);
      l.rect(cx - 2, cy - 8, 4, 4).fill(0xffffff);
    } else if (b.type === "mine") {
      l.polygon([cx - 8, cy + 6, cx, cy - 6, cx + 8, cy + 6]).fill(iconColor);
    } else if (b.type === "dock") {
      l.rect(cx - 10, cy - 4, 20, 8).fill(iconColor);
    }
  });
}
