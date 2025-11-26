import { Application, Graphics, Container } from "pixi.js";
import { getTheme, type PlayerColor } from "../theme";

let layer: Container | null = null;

export function drawProjectiles(
  app: Application | Container,
  projectiles: { x: number; y: number; targetX: number; targetY: number; owner: string; type?: string }[],
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

    if (p.type === "fireball") {
        // Fireball: Glowing orange core with trail
        g.circle(startX, startY, 6).fill(0xff4500); // Core
        g.circle(startX, startY, 10).fill({ color: 0xffa500, alpha: 0.5 }); // Glow
        // Trail
        g.moveTo(startX, startY).lineTo(startX - (endX-startX)*0.2, startY - (endY-startY)*0.2).stroke({ color: 0xff4500, width: 4, alpha: 0.5 });
    } else if (p.type === "artillery") {
        // Artillery: Large shell, high arc (simulated by shadow?)
        // For now just a big black ball
        g.circle(startX, startY, 5).fill(0x000000);
        g.circle(startX, startY + 10, 4).fill({ color: 0x000000, alpha: 0.2 }); // Shadow
    } else {
        // Arrow (default)
        const angle = Math.atan2(endY - startY, endX - startX);
        g.moveTo(startX, startY).lineTo(startX + Math.cos(angle) * 10, startY + Math.sin(angle) * 10).stroke({ color: 0xffffff, width: 2 });
    }

    // Impact marker (Target)
    if (p.type === "fireball" || p.type === "artillery") {
        g.circle(endX, endY, 20).stroke({ color: 0xff0000, width: 1, alpha: 0.5 });
        g.circle(endX, endY, 2).fill({ color: 0xff0000, alpha: 0.5 });
    }
  });
}

