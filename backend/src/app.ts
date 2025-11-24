import express from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./modules/auth/auth.routes.js";
import { userRouter } from "./modules/user/user.routes.js";
import { lobbyRouter } from "./modules/lobby/lobby.routes.js";
import { shopRouter } from "./modules/shop/shop.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(helmet());

  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use("/api/lobby", lobbyRouter);
  app.use("/api/shop", shopRouter);

  app.use(errorHandler);
  return app;
}
