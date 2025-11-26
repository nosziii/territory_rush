import { Application, Graphics, Container } from "pixi.js";
import { getTheme, type PlayerColor } from "../theme";

let decoLayer: Graphics | null = null;

export function drawDeco(
  app: Application | Container,
  tiles: { x: number; y: number; owner: string | null; type: string; height?: number }[],
  playerColor: PlayerColor
) {
  if (!tiles || !Array.isArray(tiles)) return;
  
  const theme = getTheme(playerColor);
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
    
    const color = decoColor(tile.owner, theme);
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

function decoColor(owner: string | null, theme: any) {
  if (!owner) return theme.neutral.main;
  if (owner === "player") return theme.player.main;
  if (owner === "ai1") return theme.ai1.main;
  if (owner === "ai2") return theme.ai2.main;
  if (owner === "ai3") return theme.ai3.main;
  return 0xffffff;
}
