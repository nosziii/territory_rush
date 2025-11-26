import { Application, Graphics, Container } from "pixi.js";

let decoLayer: Graphics | null = null;

export function drawDeco(
  app: Application | Container,
  tiles: { x: number; y: number; owner: string | null; type: string; height?: number }[]
) {
  if (!tiles || !Array.isArray(tiles)) return;
  
  const parent = app instanceof Application ? app.stage : app;

  // Fix: Check if layer is destroyed (from previous game session)
  if (!decoLayer || decoLayer.destroyed) {
    decoLayer = new Graphics();
    parent.addChild(decoLayer);
  } else if (decoLayer.parent !== parent) {
     // Ensure it's on the current stage
     parent.addChild(decoLayer);
  }

  decoLayer.clear();
  const size = 44; // Updated to match TilesLayer
  
  tiles.forEach((tile) => {
    if (tile.type === "water") return;
    if (Math.random() < 0.95) return; 
    
    const color = decoColor(tile.owner);
    const height = tile.height || 1;
    const elevation = (height - 1) * 10;

    decoLayer!
      .circle(
        tile.x * size + size / 2, 
        tile.y * size + size / 2 - elevation, 
        4
      )
      .fill({ color, alpha: 0.4 });
  });
}

function decoColor(owner: string | null) {
  if (!owner) return 0x94a3b8;
  if (owner === "player") return 0xfbbf24;
  if (owner === "ai1") return 0x38bdf8;
  if (owner === "ai2") return 0xa855f7;
  if (owner === "ai3") return 0x22c55e;
  return 0xffffff;
}
