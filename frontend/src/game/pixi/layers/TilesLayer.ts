import { Application, Graphics, Container, Texture, Sprite } from "pixi.js";
import { getTheme, type PlayerColor } from "../theme";

let layer: Container | null = null;

export function drawTiles(
  app: Application | Container,
  tiles: { x: number; y: number; owner: string | null; type: string; capture: number; height?: number }[],
  playerColor: PlayerColor,
  hoveredTile?: { x: number; y: number } | null,
  targetingAbility?: string
) {
  if (!tiles || !Array.isArray(tiles)) return;

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

  const size = 44;
  const gap = 0;
  
  const sortedTiles = [...tiles].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return (a.height || 1) - (b.height || 1);
  });

  sortedTiles.forEach((tile) => {
    const height = tile.height || 1;
    const isWater = tile.type === "water";
    const elevation = isWater ? 0 : (height - 1) * 10;
    
    const x = tile.x * size;
    const y = tile.y * size - elevation;

    const colors = getTileColors(tile.owner, tile.type, theme);

    // Use Sprite for Forest and Mountain
    if (tile.type === "forest" || tile.type === "mountain") {
        try {
            const texture = Texture.from(tile.type);
            const sprite = new Sprite(texture);
            sprite.x = x;
            sprite.y = y;
            sprite.width = size;
            sprite.height = size;
            
            // Tint the sprite based on owner
            if (tile.owner) {
                sprite.tint = colors.main;
            }
            
            layer!.addChild(sprite);

            // Draw depth for elevated sprites
            if (elevation > 0) {
                const g = new Graphics();
                layer!.addChild(g);
                const depthHeight = 12 + elevation;
                g.rect(x, y + size, size, depthHeight).fill(colors.dark);
            }
        } catch (e) {
            // Fallback to graphics if texture fails
            drawProceduralTile(layer!, x, y, size, elevation, isWater, colors, tile);
        }
    } else {
        drawProceduralTile(layer!, x, y, size, elevation, isWater, colors, tile);
    }

    // Hover Effect (Overlay)
    if (hoveredTile && hoveredTile.x === tile.x && hoveredTile.y === tile.y) {
        const g = new Graphics();
        layer!.addChild(g);
        g.rect(x, y, size, size).fill({ color: 0xffffff, alpha: 0.2 });
        g.rect(x, y, size, size).stroke({ color: 0xffffff, width: 2 });
    }
  });

  // Build Indicator
  if (hoveredTile && targetingAbility && targetingAbility.startsWith("build_")) {
    const tile = tiles.find(t => t.x === hoveredTile.x && t.y === hoveredTile.y);
    if (tile) {
      const height = tile.height || 1;
      const elevation = tile.type === "water" ? 0 : (height - 1) * 10;
      const x = tile.x * size;
      const y = tile.y * size - elevation;

      const g = new Graphics();
      layer!.addChild(g);
      
      const isValid = tile.owner === "player" && tile.type !== "water";
      const color = isValid ? theme.player.main : 0xf87171;

      g.rect(x, y, size, size).fill({ color, alpha: 0.4 });
      g.rect(x, y, size, size).stroke({ color, width: 3 });
    }
  }
}

function drawProceduralTile(container: Container, x: number, y: number, size: number, elevation: number, isWater: boolean, colors: any, tile: any) {
    const g = new Graphics();
    container.addChild(g);

    // 1. Draw Side (Depth)
    if (elevation > 0 || !isWater) {
        const depthHeight = isWater ? 0 : 12 + elevation;
        g.rect(x, y + size, size, depthHeight).fill(colors.dark);
    }

    // 2. Draw Top Face
    g.rect(x, y, size, size).fill(colors.main);

    // 3. Inner Highlight (Bevel)
    g.rect(x, y, size, 4).fill({ color: 0xffffff, alpha: 0.2 });
    g.rect(x, y, 4, size).fill({ color: 0xffffff, alpha: 0.1 });

    // 4. Special Tile Markers
    if (tile.type === 'resource') {
        g.circle(x + size/2, y + size/2, 8).fill({ color: 0xffffff, alpha: 0.4 });
        g.circle(x + size/2, y + size/2, 6).fill({ color: 0xffd700, alpha: 0.8 });
    } else if (tile.type === 'defense') {
        g.rect(x + 10, y + 10, size - 20, size - 20).stroke({ color: 0xffffff, width: 2, alpha: 0.5 });
    }

    // 5. Capture Progress
    if (tile.capture > 0) {
      const p = tile.capture / 100;
      g.rect(x, y + size - 6, size * p, 6).fill({ color: 0xffffff, alpha: 0.8 });
    }
}

function getTileColors(owner: string | null, type: string, theme: any) {
  if (type === "water") return { main: theme.water.main, dark: theme.water.dark };
  
  if (!owner) {
      if (type === "resource") return { main: 0x475569, dark: 0x334155 };
      return { main: theme.neutral.main, dark: theme.neutral.dark };
  }

  switch (owner) {
    case "player": return { main: theme.player.main, dark: theme.player.dark };
    case "ai1": return { main: theme.ai1.main, dark: theme.ai1.dark };
    case "ai2": return { main: theme.ai2.main, dark: theme.ai2.dark };
    case "ai3": return { main: theme.ai3.main, dark: theme.ai3.dark };
    default: return { main: theme.neutral.main, dark: theme.neutral.dark };
  }
}

