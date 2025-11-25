import { Application, Graphics } from "pixi.js";

let layer: Graphics | null = null;

export function drawTiles(
  app: Application,
  tiles: { x: number; y: number; owner: string | null; type: string; capture: number; height?: number }[]
) {
  if (!tiles || !Array.isArray(tiles)) return;
  if (!layer) {
    layer = new Graphics();
    app.stage.addChild(layer);
  }
  const l = layer;
  const size = 40;
  l.clear();
  l.rect(0, 0, 1200, 1200).fill(0x0ea5e9);
  tiles.forEach((tile) => {
    const color = colorForOwner(tile.owner, tile.type);
    const h = tile.height && tile.height > 1 ? size + 4 : size;
    const offset = tile.height && tile.height > 1 ? -2 : 0;
    l
      .rect(tile.x * (size + 2), tile.y * (size + 2) + offset, size, h)
      .fill(color)
      .stroke({ color: 0x0b1021, width: 1.5, alignment: 1 });
    // shoreline effect if neighbor water
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
          const edgeX = tile.x * (size + 2) + (n.dx === -1 ? 0 : n.dx === 1 ? size - 4 : 0);
          const edgeY = tile.y * (size + 2) + (n.dy === -1 ? 0 : n.dy === 1 ? size - 4 : 0);
          const edgeW = n.dx !== 0 ? 4 : size;
          const edgeH = n.dy !== 0 ? 4 : size;
          l.rect(edgeX, edgeY, edgeW, edgeH).fill(0xffffff).alpha = 0.2;
        }
      });
    }
  });
}

function colorForOwner(owner: string | null, type: string) {
  if (type === "water") return 0x0ea5e9;
  if (!owner) return 0x1f2937;
  if (owner === "player") return 0xf97316;
  if (owner === "ai1") return 0x38bdf8;
  if (owner === "ai2") return 0x8b5cf6;
  if (owner === "ai3") return 0x22c55e;
  return 0x22c55e;
}
