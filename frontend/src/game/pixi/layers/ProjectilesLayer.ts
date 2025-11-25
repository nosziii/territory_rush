import { Application, Graphics } from "pixi.js";

let layer: Graphics | null = null;

export function drawProjectiles(
  app: Application,
  projectiles: { x: number; y: number; targetX: number; targetY: number; owner: string }[]
) {
  if (!projectiles || !Array.isArray(projectiles)) return;
  if (!layer) {
    layer = new Graphics();
    app.stage.addChild(layer);
  }
  const size = 40;
  layer.clear();
  projectiles.forEach((p) => {
    const color =
      p.owner === "player"
        ? 0xfff176
        : p.owner === "ai1"
        ? 0x7dd3fc
        : p.owner === "ai2"
        ? 0xc4b5fd
        : 0xa7f3d0;
    const l = layer!;
    l.moveTo(p.x * (size + 2) + size / 2, p.y * (size + 2) + size / 2)
      .lineTo(p.targetX * (size + 2) + size / 2, p.targetY * (size + 2) + size / 2)
      .stroke({ color, width: 2, alpha: 0.7 });
    l.circle(p.targetX * (size + 2) + size / 2, p.targetY * (size + 2) + size / 2, 3)
      .fill(color)
      .stroke({ color: 0xffffff, width: 1, alpha: 0.5 });
  });
}
