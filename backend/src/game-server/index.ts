import { Server as HttpServer } from "http";
import { WebSocketServer } from "ws";
import { MatchManager } from "./matchManager.js";
import { Logger } from "../types.js";

export let matchManager: MatchManager;

export function initWebsocketServer(server: HttpServer, logger: Logger) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  matchManager = new MatchManager(logger);

  wss.on("connection", (socket) => {
    socket.on("message", (data) => {
      try {
        const message = JSON.parse(String(data));
        matchManager.handleMessage(socket, message);
      } catch (err) {
        logger.warn("Invalid WS message", { err });
      }
    });
  });

  matchManager.start();
  logger.info("WebSocket server initialized");
}
