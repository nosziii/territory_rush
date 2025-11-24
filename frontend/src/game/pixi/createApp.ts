import { Application } from "pixi.js";

export async function createPixiApp(container: HTMLElement) {
  const app = new Application();
  await app.init({
    backgroundColor: "#05070f",
    antialias: true,
    resizeTo: container,
  });

  container.appendChild(app.canvas);
  return app;
}
