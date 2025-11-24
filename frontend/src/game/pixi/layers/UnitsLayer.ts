import { Application, Graphics } from "pixi.js";

let layer: Graphics | null = null;

export function drawUnits(
  app: Application,
  units: { x: number; y: number; owner: string; hp: number }[]
) {
  if (!units || !Array.isArray(units)) return;
  if (!layer) {
    layer = new Graphics();
    app.stage.addChild(layer);
  }
  const size = 40;
  layer.clear();
  units.forEach((unit) => {
    const color = unit.owner === "player" ? 0xf97316 : 0x38bdf8;
    layer!
      .circle(unit.x * (size + 2) + size / 2, unit.y * (size + 2) + size / 2, 6)
      .fill(color);
  });
}
