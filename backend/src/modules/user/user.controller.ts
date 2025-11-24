import { Response } from "express";
import { AuthRequest } from "../../middleware/authGuard.js";
import { getProfile } from "./user.service.js";

export async function meHandler(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const profile = await getProfile(req.user.id);
  res.json(profile);
}
