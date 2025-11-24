import { Request, Response } from "express";
import { listItems } from "./shop.service.js";

export function listShopHandler(_req: Request, res: Response) {
  res.json({ items: listItems() });
}
