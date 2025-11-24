import { Application, Graphics } from "pixi.js";

let layer: Graphics | null = null;

export function drawTiles(
  app: Application,
  tiles: { x: number; y: number; owner: string | null; type: string; capture: number }[]
) {
  if (!tiles || !Array.isArray(tiles)) return;
  if (!layer) {
    layer = new Graphics();
    app.stage.addChild(layer);
  }
  const size = 40;
  layer.clear();
  tiles.forEach((tile) => {
    const color = colorForOwner(tile.owner);
    layer!.rect(tile.x * (size + 2), tile.y * (size + 2), size, size).fill(color);
  });
}

function colorForOwner(owner: string | null) {
  if (!owner) return 0x1f2937;
  if (owner === "player") return 0xf97316;
  if (owner === "ai") return 0x38bdf8;
  return 0x22c55e;
}
