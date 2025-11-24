import { Request, Response } from "express";
import { z } from "zod";
import { login, register } from "./auth.service.js";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerHandler(req: Request, res: Response) {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }
  const token = await register(parsed.data.email, parsed.data.password);
  res.json({ token });
}

export async function loginHandler(req: Request, res: Response) {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }
  const token = await login(parsed.data.email, parsed.data.password);
  res.json({ token });
}
