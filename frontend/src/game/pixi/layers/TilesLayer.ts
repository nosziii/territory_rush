import { Application, Graphics, Container } from "pixi.js";

let layer: Container | null = null;

// Vibrant Palette
const PALETTE = {
  water: 0x38bdf8, // Sky 400
  waterDeep: 0x0ea5e9, // Sky 500
  neutral: 0x334155, // Slate 700
  neutralDark: 0x1e293b, // Slate 800
  player: 0xf472b6, // Pink 400 (Vibrant)
  playerDark: 0xdb2777, // Pink 600
  ai1: 0x4ade80, // Green 400
  ai1Dark: 0x16a34a, // Green 600
  ai2: 0xa78bfa, // Violet 400
  ai2Dark: 0x7c3aed, // Violet 600
  ai3: 0xfacc15, // Yellow 400
  ai3Dark: 0xca8a04, // Yellow 600
  resource: 0xfcd34d, // Amber 300
  defense: 0x94a3b8, // Slate 400
};

export function drawTiles(
  app: Application | Container,
  tiles: { x: number; y: number; owner: string | null; type: string; capture: number; height?: number }[],
  hoveredTile?: { x: number; y: number } | null,
  targetingAbility?: string
) {
  if (!tiles || !Array.isArray(tiles)) return;

  const parent = app instanceof Application ? app.stage : app;

  if (!layer) {
    layer = new Container();
    parent.addChild(layer);
  } else if (layer.parent !== parent) {
    layer.parent?.removeChild(layer);
    parent.addChild(layer);
  }

  layer.removeChildren().forEach(c => c.destroy());

  const size = 44; // Slightly larger tiles
  const gap = 0;   // No gap for seamless look
  
  // Sort for depth
  const sortedTiles = [...tiles].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return (a.height || 1) - (b.height || 1);
  });

  sortedTiles.forEach((tile) => {
    const g = new Graphics();
    layer!.addChild(g);

    const height = tile.height || 1;
    const isWater = tile.type === "water";
    const elevation = isWater ? 0 : (height - 1) * 10;
    
    const x = tile.x * size;
    const y = tile.y * size - elevation;

    const colors = getColors(tile.owner, tile.type);

    // 1. Draw Side (Depth)
    if (elevation > 0 || !isWater) {
        const depthHeight = isWater ? 0 : 12 + elevation;
        g.rect(x, y + size, size, depthHeight).fill(colors.dark);
    }

    // 2. Draw Top Face
    g.rect(x, y, size, size).fill(colors.main);

    // 3. Inner Highlight (Bevel)
    g.rect(x, y, size, 4).fill({ color: 0xffffff, alpha: 0.2 }); // Top edge
    g.rect(x, y, 4, size).fill({ color: 0xffffff, alpha: 0.1 }); // Left edge

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

    // 6. Hover Effect
    if (hoveredTile && hoveredTile.x === tile.x && hoveredTile.y === tile.y) {
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
      const color = isValid ? 0x4ade80 : 0xf87171;

      g.rect(x, y, size, size).fill({ color, alpha: 0.4 });
      g.rect(x, y, size, size).stroke({ color, width: 3 });
    }
  }
}

function getColors(owner: string | null, type: string) {
  if (type === "water") return { main: PALETTE.water, dark: PALETTE.waterDeep };
  
  if (!owner) {
      if (type === "resource") return { main: 0x475569, dark: 0x334155 };
      return { main: PALETTE.neutral, dark: PALETTE.neutralDark };
  }

  switch (owner) {
    case "player": return { main: PALETTE.player, dark: PALETTE.playerDark };
    case "ai1": return { main: PALETTE.ai1, dark: PALETTE.ai1Dark };
    case "ai2": return { main: PALETTE.ai2, dark: PALETTE.ai2Dark };
    case "ai3": return { main: PALETTE.ai3, dark: PALETTE.ai3Dark };
    default: return { main: PALETTE.neutral, dark: PALETTE.neutralDark };
  }
}

