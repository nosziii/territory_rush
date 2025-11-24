import http from "http";
import dotenv from "dotenv";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { createLogger } from "./utils/logger.js";
import { initWebsocketServer } from "./game-server/index.js";

dotenv.config();
const logger = createLogger();

async function main() {
  const app = createApp();
  const server = http.createServer(app);

  initWebsocketServer(server, logger);

  server.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  logger.error("Fatal startup error", { err });
  process.exit(1);
});
