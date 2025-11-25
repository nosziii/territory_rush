import { Application, Graphics } from "pixi.js";

let layer: Graphics | null = null;

export function drawUnits(
  app: Application,
  units: { x: number; y: number; owner: string; hp: number; type?: string }[]
) {
  if (!units || !Array.isArray(units)) return;
  if (!layer) {
    layer = new Graphics();
    app.stage.addChild(layer);
  }
  const size = 40;
  layer.clear();
  units.forEach((unit) => {
    const color =
      unit.owner === "player"
        ? 0xf97316
        : unit.owner === "ai1"
        ? 0x38bdf8
        : unit.owner === "ai2"
        ? 0x8b5cf6
        : 0x22c55e;
    const isShip = unit.type === "ship";
    const cx = unit.x * (size + 2) + size / 2;
    const cy = unit.y * (size + 2) + size / 2;
    const r = isShip ? 9 : 8;
    const l = layer!;
    l.circle(cx, cy, r).fill(color).stroke({ color: 0x0f172a, width: 2 });
    // simple icon overlay
    if (isShip) {
      l.rect(cx - 6, cy - 3, 12, 6).fill(0xffffff);
    } else if (unit.type === "ranged") {
      l.rect(cx - 5, cy - 2, 10, 4).fill(0xffffff);
    } else {
      l.lineTo(cx, cy - 6).lineTo(cx - 4, cy + 6).lineTo(cx + 4, cy + 6).fill(0xffffff);
    }
  });
}
