import { Router } from "express";
import { loginHandler, registerHandler } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", registerHandler);
authRouter.post("/login", loginHandler);
authRouter.get("/me", (_req, res) => {
  res.json({ status: "ok" });
});
