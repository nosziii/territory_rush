import { Application, Graphics } from "pixi.js";

let decoLayer: Graphics | null = null;

export function drawDeco(
  app: Application,
  tiles: { x: number; y: number; owner: string | null; type: string }[]
) {
  if (!tiles || !Array.isArray(tiles)) return;
  if (!decoLayer) {
    decoLayer = new Graphics();
    app.stage.addChild(decoLayer);
  }
  decoLayer.clear();
  const size = 32;
  tiles.forEach((tile) => {
    if (tile.type === "water") return;
    if (Math.random() < 0.95) return; // Very sparse deco (was 0.8)
    const color = decoColor(tile.owner);
    decoLayer!
      .circle(tile.x * (size + 2) + size / 2, tile.y * (size + 2) + size / 2, 3) // Smaller
      .fill({ color, alpha: 0.3 }); // More transparent
  });
}

function decoColor(owner: string | null) {
  if (!owner) return 0x94a3b8;
  if (owner === "player") return 0xfbbf24;
  if (owner === "ai1") return 0x38bdf8;
  if (owner === "ai2") return 0xa855f7;
  return 0x22c55e;
}
