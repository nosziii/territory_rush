import { Server as HttpServer } from "http";
import { WebSocketServer } from "ws";
import { MatchManager } from "./matchManager.js";
import { Logger } from "../types.js";

export function initWebsocketServer(server: HttpServer, logger: Logger) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  const matches = new MatchManager(logger);

  wss.on("connection", (socket) => {
    socket.on("message", (data) => {
      try {
        const message = JSON.parse(String(data));
        matches.handleMessage(socket, message);
      } catch (err) {
        logger.warn("Invalid WS message", { err });
      }
    });
  });

  matches.start();
  logger.info("WebSocket server initialized");
}
