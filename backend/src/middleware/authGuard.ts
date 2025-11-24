import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export function authGuard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (env.DEV_SKIP_AUTH) {
    req.user = { id: "dev-user", email: "dev@example.com" };
    return next();
  }
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "Missing auth header" });
  }
  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
    };
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
