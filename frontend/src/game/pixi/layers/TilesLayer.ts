import { Application, Graphics, Container } from "pixi.js";

let layer: Container | null = null;

export function drawTiles(
  app: Application | Container, // Accept Container (world)
  tiles: { x: number; y: number; owner: string | null; type: string; capture: number; height?: number }[],
  hoveredTile?: { x: number; y: number } | null,
  targetingAbility?: string
) {
  if (!tiles || !Array.isArray(tiles)) return;

  // If app is Application, use stage, otherwise it's the world container
  const parent = app instanceof Application ? app.stage : app;

  if (!layer) {
    layer = new Container();
    parent.addChild(layer);
  } else if (layer.parent !== parent) {
    // Reparent if needed
    layer.parent?.removeChild(layer);
    parent.addChild(layer);
  }

  // Clear previous children to redraw (simple approach for now, optimization would be to reuse graphics)
  layer.removeChildren().forEach(c => c.destroy());

  const size = 40;
  const gap = 2;

  // Sort tiles by height/y to ensure correct depth rendering order
  const sortedTiles = [...tiles].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return (a.height || 1) - (b.height || 1);
  });

  sortedTiles.forEach((tile) => {
    const g = new Graphics();
    layer!.addChild(g);

    const h = tile.height && tile.height > 1 ? size + 8 : size;
    const offset = tile.height && tile.height > 1 ? -8 : 0;

    const x = tile.x * (size + gap);
    const y = tile.y * (size + gap) + offset;

    const baseColor = colorForOwner(tile.owner, tile.type);

    // Draw shadow/depth for elevated tiles
    if (tile.height && tile.height > 1) {
      g.rect(x, y + size, size, 8).fill(0x0f172a); // Dark side
    }

    // Main tile face
    g.rect(x, y, size, size).fill(baseColor);

    // Highlight/Bevel effect
    g.rect(x, y, size, 2).fill({ color: 0xffffff, alpha: 0.3 }); // Top highlight
    g.rect(x, y, 2, size).fill({ color: 0xffffff, alpha: 0.1 }); // Left highlight
    g.rect(x, y + size - 2, size, 2).fill({ color: 0x000000, alpha: 0.2 }); // Bottom shadow
    g.rect(x + size - 2, y, 2, size).fill({ color: 0x000000, alpha: 0.2 }); // Right shadow

    // Selection/Capture progress overlay
    if (tile.capture > 0) {
      g.rect(x, y, size * (tile.capture / 100), size).fill({ color: 0xffffff, alpha: 0.2 });
    }

    // Shoreline effect
    if (tile.type !== "water") {
      const neighbors = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
      ];
      neighbors.forEach((n) => {
        const water = tiles.find((t) => t.x === tile.x + n.dx && t.y === tile.y + n.dy && t.type === "water");
        if (water) {
          // Add a subtle wave/foam effect on the edge
          const edgeX = x + (n.dx === 1 ? size : 0);
          const edgeY = y + (n.dy === 1 ? size : 0);

          if (n.dx !== 0) {
            g.rect(n.dx === 1 ? edgeX - 4 : edgeX, y, 4, size).fill({ color: 0xffffff, alpha: 0.3 });
          } else {
            g.rect(x, n.dy === 1 ? edgeY - 4 : edgeY, size, 4).fill({ color: 0xffffff, alpha: 0.3 });
          }
        }
      });
    }
  });

  // Draw Build Indicator Overlay
  if (hoveredTile && targetingAbility && targetingAbility.startsWith("build_")) {
    const tile = tiles.find(t => t.x === hoveredTile.x && t.y === hoveredTile.y);
    if (tile) {
      const size = 40;
      const gap = 2;
      const offset = tile.height && tile.height > 1 ? -8 : 0;
      const x = tile.x * (size + gap);
      const y = tile.y * (size + gap) + offset;

      const g = new Graphics();
      layer!.addChild(g);

      // Validation Logic (Client-side prediction)
      const isValid = tile.owner === "player" && tile.type !== "water"; // Simplified check
      const color = isValid ? 0x22c55e : 0xef4444;

      g.rect(x, y, size, size).fill({ color, alpha: 0.4 });
      g.rect(x, y, size, size).stroke({ color, width: 2 });
    }
  }
}

function colorForOwner(owner: string | null, type: string) {
  if (type === "water") return 0x0ea5e9; // Sky blue
  if (type === "resource") return 0xfcd34d; // Goldish for resource
  if (type === "defense") return 0x94a3b8; // Slate for defense

  if (!owner) return 0x1e293b; // Slate-800 for neutral

  // Player colors (Neon/Vibrant)
  if (owner === "player") return 0xf97316; // Orange
  if (owner === "ai1") return 0x06b6d4; // Cyan
  if (owner === "ai2") return 0x8b5cf6; // Violet
  if (owner === "ai3") return 0x10b981; // Emerald

  return 0x334155;
}

