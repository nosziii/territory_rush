import { Application, Graphics, Container } from "pixi.js";
import { getTheme, type PlayerColor } from "../theme";

let layer: Container | null = null;

export function drawProjectiles(
  app: Application | Container,
  projectiles: { x: number; y: number; targetX: number; targetY: number; owner: string }[],
  playerColor: PlayerColor
) {
  if (!projectiles || !Array.isArray(projectiles)) return;

  const theme = getTheme(playerColor);
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

  const size = 44;
  const gap = 0;

  projectiles.forEach((p) => {
    const g = new Graphics();
    layer!.addChild(g);

    const color =
      p.owner === "player"
        ? theme.player.main
        : p.owner === "ai1"
          ? theme.ai1.main
          : p.owner === "ai2"
            ? theme.ai2.main
            : theme.ai3.main;

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

