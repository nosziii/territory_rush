import { Application, Graphics, Container } from "pixi.js";
import { getTheme, type PlayerColor } from "../theme";

let layer: Container | null = null;

export function drawBuildings(
  app: Application | Container,
  buildings: { x: number; y: number; owner: string; type: string }[],
  playerColor: PlayerColor
) {
  if (!buildings || !Array.isArray(buildings)) return;

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

  const size = 44; // Synced with tiles
  
  buildings.forEach((b) => {
    const g = new Graphics();
    layer!.addChild(g);

    const color = getBuildingColor(b.owner, theme);
    const x = b.x * size;
    const y = b.y * size; 
    
    const cx = x + size / 2;
    const cy = y + size / 2;
    const buildSize = size - 10;

    g.roundRect(cx - buildSize/2, cy - buildSize/2, buildSize, buildSize, 5)
     .fill(color)
     .stroke({ color: 0x0f172a, width: 2 });

    const iconColor = 0x0f172a;
    
    if (b.type === "base") {
      g.star(cx, cy, 4, 8, 12).fill(iconColor);
    } else if (b.type === "turret") {
      g.circle(cx, cy, 6).fill(iconColor);
      g.rect(cx - 2, cy - 8, 4, 4).fill(0xffffff);
    } else if (b.type === "mine") {
      g.poly([cx - 8, cy + 6, cx, cy - 6, cx + 8, cy + 6]).fill(iconColor);
    } else if (b.type === "dock") {
      g.rect(cx - 10, cy - 4, 20, 8).fill(iconColor);
    } else if (b.type === "heavy_factory") {
      g.rect(cx - 8, cy - 8, 16, 16).fill(iconColor); // Boxy factory
    } else if (b.type === "mage_tower") {
      g.poly([cx, cy - 10, cx + 6, cy + 6, cx - 6, cy + 6]).fill(iconColor); // Spire
    } else if (b.type === "airport") {
       g.rect(cx - 10, cy - 2, 20, 4).fill(iconColor); // Runway strip
       g.circle(cx, cy, 4).fill(iconColor);
    } else {
       // Generic
       g.circle(cx, cy, 4).fill(iconColor);
    }
  });
}

function getBuildingColor(owner: string, theme: any) {
    if (owner === "player") return theme.player.main;
    if (owner === "ai1") return theme.ai1.main;
    if (owner === "ai2") return theme.ai2.main;
    if (owner === "ai3") return theme.ai3.main;
    return theme.neutral.main;
}
