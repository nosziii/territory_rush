import { Application, Graphics, Container } from "pixi.js";

let layer: Container | null = null;

export function drawProjectiles(
  app: Application | Container,
  projectiles: { x: number; y: number; targetX: number; targetY: number; owner: string }[]
) {
  if (!projectiles || !Array.isArray(projectiles)) return;

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

  projectiles.forEach((p) => {
    const g = new Graphics();
    layer!.addChild(g);

    const color =
      p.owner === "player"
        ? 0xfff176
        : p.owner === "ai1"
          ? 0x7dd3fc
          : p.owner === "ai2"
            ? 0xc4b5fd
            : 0xa7f3d0;

    const startX = p.x * (size + gap) + size / 2;
    const startY = p.y * (size + gap) + size / 2;
    const endX = p.targetX * (size + gap) + size / 2;
    const endY = p.targetY * (size + gap) + size / 2;

    // Draw Trail (fading line)
    g.moveTo(startX, startY)
      .lineTo(endX, endY)
      .stroke({ color, width: 4, alpha: 0.6 }); // Thicker trail

    // Draw Glowing Orb at target (impact point)
    // Outer Glow (Explosion)
    g.circle(endX, endY, 20).fill({ color, alpha: 0.4 });
    // Core
    g.circle(endX, endY, 8).fill({ color: 0xffffff });

    // Shockwave ring
    g.circle(endX, endY, 30).stroke({ color: 0xffffff, width: 2, alpha: 0.3 });
  });
}

