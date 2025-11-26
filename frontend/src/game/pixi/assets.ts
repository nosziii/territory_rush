import { Assets } from "pixi.js";

export const manifest = {
  bundles: [
    {
      name: "game-screen",
      assets: [
        { alias: "forest", src: "/assets/forest.png" },
        { alias: "mountain", src: "/assets/mountain.png" },
        // Placeholders for future assets
        // { alias: "grass", src: "/assets/grass.png" },
        // { alias: "water", src: "/assets/water.png" },
        // { alias: "tank", src: "/assets/tank.png" },
      ],
    },
  ],
};

export async function initAssets() {
  await Assets.init({ manifest });
  await Assets.loadBundle("game-screen");
}
